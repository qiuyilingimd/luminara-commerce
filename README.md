# Luminara Commerce

Single-page jewellery storefront with a dependency-free Node backend.

## Motion

The storefront uses locally vendored GSAP, ScrollTrigger and Lenis. React
Bits-inspired SpotlightCard, GlareHover, TiltedCard and ScrollExpand behaviours
are adapted natively in `assets/editorial-motion.js`; no React runtime is
required. Reduced-motion preferences disable smooth scrolling, autoplay and
pointer-led effects. See `THIRD_PARTY_NOTICES.md` for sources and licences.

The first visit opens on a product threshold: Pearl Hour is separated from its
source photograph and suspended on a new velvet stage. The visitor chooses
sound or silence, then a full-screen clipped reveal enters the storefront. The
choice is remembered for the browser session. On desktop the following hero
uses a split editorial layout; on mobile the extracted jewellery fills the
screen and the headline sits in a protected lower zone. An original ambient
score in `assets/luminara-ambient-v5.m4a` fades in when the visitor chooses
sound. The small Sound control in the masthead provides a persistent mute
preference; key storefront actions also use quiet, procedurally generated
interface sounds.

Act 04 separates four products from their original backgrounds and recombines
them on a new stone-lit stage. Their positions respond to scroll, and the
background light follows the pointer on precision-pointer devices. Product
silhouettes and visible materials are preserved.

## Creative and local tooling

Main image sequencing follows the documented photography system, while motion
follows the official GSAP guidance. The public storefront loads only its
vendored browser assets.

## Run

```powershell
node server.mjs
```

Open `http://localhost:4173`.

For a phone on the same Wi-Fi, open `http://<computer-LAN-IP>:4173`, not
`localhost`. The server listens on `0.0.0.0` by default; set `HOST=127.0.0.1`
if you want to restrict access to the computer only.

The site reads products from `data/catalog.json`. The server revalidates product IDs, sizes, quantities, prices and shipping before saving an order to `data/luminara.db`.

## Public frontend

`.github/workflows/pages.yml` publishes the HTML, images, fonts and browser assets
to GitHub Pages. The published storefront uses the static catalogue embedded in
the page immediately, then sends quotation, order and contact requests to the
Render service. `PUBLIC_ORIGINS` controls the CORS allow-list; the default
includes `https://qiuyilingimd.github.io`.

## Fast start

The storefront has no blocking brand-intro overlay or hero video, so the header
and photograph can paint as soon as the document is available. HTML, CSS,
JavaScript and JSON are served with Brotli or gzip compression, conditional ETag
requests and short-lived revalidation caches. Audio supports byte-range requests.

Render's free web-service plan may still spin down after inactivity. The GitHub
Actions workflow in `.github/workflows/keepalive.yml` requests the public health
endpoint every ten minutes to reduce cold starts. A paid always-on Render
instance is required if the page must be guaranteed warm without relying on the
scheduled ping.

## Render

`render.yaml` describes the currently deployed free Render web service with
`/api/health` as its health check. `render.production.yaml` is the paid upgrade
with a persistent disk and durable SQLite storage at `/var/data/luminara.db`.
The public `BASE_URL` is read automatically from Render's external hostname.

## Payments

Set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` to enable hosted Stripe Checkout. Configure the webhook endpoint as:

```text
https://your-domain.example/api/stripe/webhook
```

Listen for `checkout.session.completed`.

Without Stripe credentials, checkout securely records a pending order and tells the customer that a payment link will follow. It never displays a false paid state.

## Order email

Set `RESEND_API_KEY`, `ORDER_NOTIFY_EMAIL` and `ORDER_FROM_EMAIL` to send merchant notifications for orders and enquiries.

## Data

Orders and contact messages are stored in `data/luminara.db`. Back up this file together with the deployment.
