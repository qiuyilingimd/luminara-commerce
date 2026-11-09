import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(ROOT, "data"));

function loadDotEnv() {
  const file = path.join(ROOT, ".env");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const value = line.trim();
    if (!value || value.startsWith("#") || !value.includes("=")) continue;
    const index = value.indexOf("=");
    const key = value.slice(0, index).trim();
    let entry = value.slice(index + 1).trim();
    if ((entry.startsWith('"') && entry.endsWith('"')) || (entry.startsWith("'") && entry.endsWith("'"))) {
      entry = entry.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = entry;
  }
}

loadDotEnv();

const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || "0.0.0.0";
const BASE_URL = String(
  process.env.BASE_URL
  || (process.env.RENDER_EXTERNAL_HOSTNAME ? `https://${process.env.RENDER_EXTERNAL_HOSTNAME}` : "")
  || `http://localhost:${PORT}`
).replace(/\/+$/, "");
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const ORDER_NOTIFY_EMAIL = process.env.ORDER_NOTIFY_EMAIL || "";
const ORDER_FROM_EMAIL = process.env.ORDER_FROM_EMAIL || "Luminara <orders@example.com>";

const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "catalog.json"), "utf8"));
const PRODUCTS = new Map(catalog.products.map((product) => [product.id, product]));

fs.mkdirSync(DATA_DIR, { recursive: true });
const db = new DatabaseSync(path.join(DATA_DIR, "luminara.db"));
db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    status TEXT NOT NULL,
    currency TEXT NOT NULL,
    subtotal_cents INTEGER NOT NULL,
    shipping_cents INTEGER NOT NULL,
    total_cents INTEGER NOT NULL,
    customer_name TEXT NOT NULL,
    email TEXT NOT NULL,
    country TEXT NOT NULL,
    city TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    address TEXT NOT NULL,
    items_json TEXT NOT NULL,
    stripe_session_id TEXT
  );
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
`);

const countries = new Set([
  "Mainland China", "Hong Kong SAR", "Taiwan Region", "Japan", "South Korea",
  "Singapore", "Malaysia", "Thailand", "United States", "Canada", "United Kingdom",
  "European Union", "Australia", "New Zealand", "Other international"
]);

const asia = new Set(["Hong Kong SAR", "Taiwan Region", "Japan", "South Korea", "Singapore", "Malaysia", "Thailand"]);
const international = new Set(["United States", "Canada", "United Kingdom", "European Union", "Australia", "New Zealand"]);
const staticTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
  [".svg", "image/svg+xml"],
  [".mp4", "video/mp4"],
  [".m4a", "audio/mp4"],
  [".mp3", "audio/mpeg"],
  [".woff2", "font/woff2"]
]);

function sendJson(res, status, value) {
  const body = Buffer.from(JSON.stringify(value));
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": body.length,
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
  res.end(body);
}

function securityHeaders(res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' data: blob:; media-src 'self' blob:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self' https://api.stripe.com https://api.resend.com; font-src 'self' data:; frame-src https://js.stripe.com https://checkout.stripe.com; base-uri 'self'; form-action 'self'"
  );
}

async function readBody(req, limit = 65536) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) {
      const error = new Error("Request body too large");
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function readJson(req, limit = 65536) {
  const raw = await readBody(req, limit);
  try {
    return JSON.parse(raw.toString("utf8") || "{}");
  } catch {
    const error = new Error("Invalid JSON");
    error.statusCode = 400;
    throw error;
  }
}

function cleanText(value, max = 240) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, max);
}

function isEmail(value) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value) && value.length <= 254;
}

function shippingFor(country, subtotalCents) {
  if (country === "Mainland China") {
    return subtotalCents >= catalog.shipping.mainlandChinaFreeFrom * 100
      ? 0
      : catalog.shipping.mainlandChina * 100;
  }
  if (asia.has(country)) return catalog.shipping.asia * 100;
  if (international.has(country)) return catalog.shipping.international * 100;
  return catalog.shipping.restOfWorld * 100;
}

function normaliseItems(input) {
  if (!Array.isArray(input) || !input.length || input.length > 20) {
    const error = new Error("Your bag is empty or contains too many items.");
    error.statusCode = 400;
    throw error;
  }
  const combined = new Map();
  for (const raw of input) {
    const product = PRODUCTS.get(String(raw.id || ""));
    if (!product) {
      const error = new Error("Unknown product.");
      error.statusCode = 400;
      throw error;
    }
    const size = String(raw.size || "");
    const qty = Number(raw.qty);
    if (!product.sizes.includes(size) || !Number.isInteger(qty) || qty < 1 || qty > 10) {
      const error = new Error(`Invalid size or quantity for ${product.name}.`);
      error.statusCode = 400;
      throw error;
    }
    const key = `${product.id}:${size}`;
    const current = combined.get(key) || {
      id: product.id,
      name: product.name,
      category: product.category,
      size,
      qty: 0,
      unitPrice: product.price
    };
    current.qty += qty;
    if (current.qty > 10) {
      const error = new Error(`Maximum quantity is 10 per size.`);
      error.statusCode = 400;
      throw error;
    }
    combined.set(key, current);
  }
  return [...combined.values()];
}

function calculateQuote(inputItems, country) {
  if (!countries.has(country)) {
    const error = new Error("Unsupported destination.");
    error.statusCode = 400;
    throw error;
  }
  const items = normaliseItems(inputItems);
  const subtotalCents = items.reduce((sum, item) => sum + item.unitPrice * 100 * item.qty, 0);
  const shippingCents = shippingFor(country, subtotalCents);
  return {
    currency: "USD",
    items,
    subtotalCents,
    shippingCents,
    totalCents: subtotalCents + shippingCents,
    subtotal: subtotalCents / 100,
    shipping: shippingCents / 100,
    total: (subtotalCents + shippingCents) / 100,
    dutiesIncluded: false
  };
}

function orderId() {
  const day = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `LUM-${day}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

function money(cents) {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

async function sendMerchantEmail(subject, text) {
  if (!RESEND_API_KEY || !ORDER_NOTIFY_EMAIL) return false;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: ORDER_FROM_EMAIL,
        to: [ORDER_NOTIFY_EMAIL],
        subject,
        text
      })
    });
    if (!response.ok) console.error("Resend notification failed", response.status, await response.text());
    return response.ok;
  } catch (error) {
    console.error("Resend notification error", error);
    return false;
  }
}

async function createStripeSession(order, quote) {
  if (!STRIPE_SECRET_KEY) return null;
  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("customer_email", order.email);
  params.set("client_reference_id", order.id);
  params.set("metadata[order_id]", order.id);
  params.set("payment_intent_data[metadata][order_id]", order.id);
  params.set("success_url", `${BASE_URL}/order-success.html?order_id=${encodeURIComponent(order.id)}&session_id={CHECKOUT_SESSION_ID}`);
  params.set("cancel_url", `${BASE_URL}/?checkout=cancelled`);
  params.set("allow_promotion_codes", "true");
  let index = 0;
  for (const item of quote.items) {
    params.set(`line_items[${index}][quantity]`, String(item.qty));
    params.set(`line_items[${index}][price_data][currency]`, "usd");
    params.set(`line_items[${index}][price_data][unit_amount]`, String(item.unitPrice * 100));
    params.set(`line_items[${index}][price_data][product_data][name]`, `${item.name} — ${item.size}`);
    index += 1;
  }
  if (quote.shippingCents > 0) {
    params.set(`line_items[${index}][quantity]`, "1");
    params.set(`line_items[${index}][price_data][currency]`, "usd");
    params.set(`line_items[${index}][price_data][unit_amount]`, String(quote.shippingCents));
    params.set(`line_items[${index}][price_data][product_data][name]`, "Tracked international shipping");
  }
  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.error?.message || `Stripe HTTP ${response.status}`);
  return { id: payload.id, url: payload.url };
}

function stripeSignatureIsValid(raw, header) {
  if (!STRIPE_WEBHOOK_SECRET || !header) return false;
  const pairs = {};
  for (const part of header.split(",")) {
    const [key, value] = part.split("=");
    if (!key || !value) continue;
    if (!pairs[key]) pairs[key] = [];
    pairs[key].push(value);
  }
  const timestamp = pairs.t?.[0];
  const signatures = pairs.v1 || [];
  if (!timestamp || !signatures.length) return false;
  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
  if (!Number.isFinite(age) || age > 300) return false;
  const expected = crypto
    .createHmac("sha256", STRIPE_WEBHOOK_SECRET)
    .update(`${timestamp}.${raw.toString("utf8")}`)
    .digest("hex");
  return signatures.some((signature) => {
    const left = Buffer.from(expected);
    const right = Buffer.from(signature);
    return left.length === right.length && crypto.timingSafeEqual(left, right);
  });
}

const rateBuckets = new Map();
function rateLimited(key, limit = 30) {
  const now = Date.now();
  const current = rateBuckets.get(key);
  if (!current || current.reset < now) {
    rateBuckets.set(key, { count: 1, reset: now + 60_000 });
    return false;
  }
  current.count += 1;
  return current.count > limit;
}

function getOrder(id) {
  return db.prepare("SELECT * FROM orders WHERE id = ?").get(id);
}

async function handleApi(req, res, url) {
  const ip = req.socket.remoteAddress || "unknown";
  if (rateLimited(ip, 60)) return sendJson(res, 429, { error: "Too many requests. Please wait a minute." });

  if (req.method === "GET" && url.pathname === "/api/health") {
    return sendJson(res, 200, {
      ok: true,
      currency: "USD",
      paymentsConfigured: Boolean(STRIPE_SECRET_KEY),
      emailConfigured: Boolean(RESEND_API_KEY && ORDER_NOTIFY_EMAIL)
    });
  }

  if (req.method === "GET" && url.pathname === "/api/catalog") {
    return sendJson(res, 200, catalog);
  }

  if (req.method === "POST" && url.pathname === "/api/quote") {
    const data = await readJson(req);
    const quote = calculateQuote(data.items, cleanText(data.country, 80));
    return sendJson(res, 200, quote);
  }

  if (req.method === "POST" && url.pathname === "/api/contact") {
    const data = await readJson(req);
    const name = cleanText(data.name, 100);
    const email = cleanText(data.email, 254).toLowerCase();
    const message = cleanText(data.message, 3000);
    if (!name || !isEmail(email) || !message) return sendJson(res, 400, { error: "Please complete name, email and message." });
    db.prepare("INSERT INTO messages (created_at, name, email, message) VALUES (?, ?, ?, ?)")
      .run(new Date().toISOString(), name, email, message);
    await sendMerchantEmail(`Luminara enquiry — ${name}`, `${name}\n${email}\n\n${message}`);
    return sendJson(res, 201, { ok: true });
  }

  if (req.method === "POST" && url.pathname === "/api/orders") {
    if (rateLimited(`orders:${ip}`, 12)) return sendJson(res, 429, { error: "Too many order attempts." });
    const data = await readJson(req);
    const customer = data.customer || {};
    const name = cleanText(customer.name, 100);
    const email = cleanText(customer.email, 254).toLowerCase();
    const country = cleanText(customer.country, 80);
    const city = cleanText(customer.city, 100);
    const postalCode = cleanText(customer.postalCode, 30);
    const address = cleanText(customer.address, 240);
    if (!name || !isEmail(email) || !country || !city || !postalCode || !address) {
      return sendJson(res, 400, { error: "Please complete all delivery details." });
    }
    const quote = calculateQuote(data.items, country);
    const id = orderId();
    const createdAt = new Date().toISOString();
    db.prepare(`
      INSERT INTO orders
      (id, created_at, status, currency, subtotal_cents, shipping_cents, total_cents,
       customer_name, email, country, city, postal_code, address, items_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, createdAt, "pending_payment", "USD", quote.subtotalCents, quote.shippingCents,
      quote.totalCents, name, email, country, city, postalCode, address, JSON.stringify(quote.items)
    );

    let stripe = null;
    let paymentError = "";
    if (STRIPE_SECRET_KEY) {
      try {
        stripe = await createStripeSession({ id, email }, quote);
        if (stripe) {
          db.prepare("UPDATE orders SET stripe_session_id = ? WHERE id = ?").run(stripe.id, id);
        }
      } catch (error) {
        paymentError = error.message;
        console.error("Stripe session error", error);
      }
    }

    const orderText = [
      `Order ${id}`,
      `${name} <${email}>`,
      `${address}, ${city}, ${postalCode}, ${country}`,
      "",
      ...quote.items.map((item) => `${item.name} × ${item.qty} · ${item.size} · ${money(item.unitPrice * 100 * item.qty)}`),
      "",
      `Subtotal: ${money(quote.subtotalCents)}`,
      `Shipping: ${money(quote.shippingCents)}`,
      `Total: ${money(quote.totalCents)}`,
      "Duties and local taxes are not included."
    ].join("\n");
    await sendMerchantEmail(`New Luminara order — ${id}`, orderText);

    if (stripe?.url) return sendJson(res, 201, { ok: true, orderId: id, checkoutUrl: stripe.url });
    return sendJson(res, 201, {
      ok: true,
      orderId: id,
      checkoutUrl: null,
      status: "pending_payment",
      paymentConfigured: Boolean(STRIPE_SECRET_KEY),
      paymentError: paymentError || null,
      notificationConfigured: Boolean(RESEND_API_KEY && ORDER_NOTIFY_EMAIL),
      message: RESEND_API_KEY && ORDER_NOTIFY_EMAIL
        ? "Order received. We will send a secure payment link after confirming stock and shipping."
        : "Order received and saved. Payment and merchant email are not configured for this deployment; no payment has been taken."
    });
  }

  const orderMatch = url.pathname.match(/^\/api\/orders\/(LUM-[A-Z0-9-]+)$/);
  if (req.method === "GET" && orderMatch) {
    const order = getOrder(orderMatch[1]);
    if (!order) return sendJson(res, 404, { error: "Order not found." });
    return sendJson(res, 200, {
      id: order.id,
      createdAt: order.created_at,
      status: order.status,
      currency: order.currency,
      subtotal: order.subtotal_cents / 100,
      shipping: order.shipping_cents / 100,
      total: order.total_cents / 100,
      items: JSON.parse(order.items_json)
    });
  }

  if (req.method === "POST" && url.pathname === "/api/stripe/webhook") {
    const raw = await readBody(req, 1_048_576);
    if (!stripeSignatureIsValid(raw, req.headers["stripe-signature"])) {
      return sendJson(res, 400, { error: "Invalid Stripe signature." });
    }
    const event = JSON.parse(raw.toString("utf8"));
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      const session = event.data.object;
      const id = session.metadata?.order_id || session.client_reference_id;
      if (id) {
        db.prepare("UPDATE orders SET status = ?, stripe_session_id = ? WHERE id = ?")
          .run("paid", session.id || null, id);
      }
    }
    return sendJson(res, 200, { received: true });
  }

  return sendJson(res, 404, { error: "API route not found." });
}

function canServe(pathname) {
  if (pathname === "/" || pathname === "/index.html" || pathname === "/order-success.html") return true;
  return pathname.startsWith("/assets/") || pathname.startsWith("/vendor/");
}

async function serveStatic(req, res, url) {
  if (!canServe(url.pathname)) return sendJson(res, 404, { error: "Not found." });
  let pathname;
  try { pathname = decodeURIComponent(url.pathname); }
  catch { return sendJson(res, 400, { error: "Bad path." }); }
  if (pathname === "/") pathname = "/index.html";
  const target = path.resolve(ROOT, `.${pathname}`);
  if (!target.startsWith(`${ROOT}${path.sep}`)) return sendJson(res, 403, { error: "Forbidden." });
  let stat;
  try { stat = await fs.promises.stat(target); }
  catch { return sendJson(res, 404, { error: "Not found." }); }
  if (!stat.isFile()) return sendJson(res, 404, { error: "Not found." });
  const contentType = staticTypes.get(path.extname(target).toLowerCase()) || "application/octet-stream";
  securityHeaders(res);
  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Length", stat.size);
  res.setHeader("Cache-Control", /\.(mp4|jpg|jpeg|png|webp|woff2)$/i.test(target) ? "public, max-age=604800" : "no-cache");
  if (req.method === "HEAD") return res.end();
  fs.createReadStream(target).pipe(res);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", BASE_URL);
    if (url.pathname.startsWith("/api/")) return await handleApi(req, res, url);
    if (req.method !== "GET" && req.method !== "HEAD") return sendJson(res, 405, { error: "Method not allowed." });
    return await serveStatic(req, res, url);
  } catch (error) {
    console.error(error);
    return sendJson(res, error.statusCode || 500, { error: error.statusCode ? error.message : "Server error." });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Luminara running at ${BASE_URL}`);
  const lanAddresses = Object.values(os.networkInterfaces())
    .flat()
    .filter((entry) => entry && entry.family === "IPv4" && !entry.internal)
    .map((entry) => `http://${entry.address}:${PORT}`);
  if (lanAddresses.length) {
    console.log(`LAN access: ${lanAddresses.join(", ")}`);
  }
  console.log(`Listening on: ${HOST}:${PORT}`);
  console.log(`Stripe: ${STRIPE_SECRET_KEY ? "configured" : "not configured — orders saved as pending"}`);
  console.log(`Order email: ${RESEND_API_KEY && ORDER_NOTIFY_EMAIL ? "configured" : "not configured"}`);
});

function shutdown(signal) {
  console.log(`${signal} received — closing server`);
  server.close(() => {
    try { db.close(); } catch {}
    process.exit(0);
  });
  setTimeout(() => process.exit(0), 8000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
