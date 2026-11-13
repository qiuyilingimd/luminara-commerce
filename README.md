# Luminara Commerce

Single-page jewellery storefront with a dependency-free Node backend.

## Motion

The storefront uses locally vendored GSAP, ScrollTrigger and Lenis. React
Bits-inspired SpotlightCard, GlareHover, TiltedCard and ScrollExpand behaviours
are adapted natively in `assets/editorial-motion.js`; no React runtime is
required. Reduced-motion preferences disable smooth scrolling, autoplay and
pointer-led effects. See `THIRD_PARTY_NOTICES.md` for sources and licences.

The hero and moving plates loop without playback controls. An original ambient
score in `assets/luminara-ambient.m4a` fades in after the visitor's first
interaction, as required by browser autoplay policies. The small Sound control
in the masthead provides a persistent mute preference; key storefront actions
also use quiet, procedurally generated interface sounds.

The hero film is built as five movements: the find, the hold, the detail, the
pairing, and the assembly. Landscape and portrait renders use a shared visual
system and a paper-wipe transition. Website copies are encoded at a smaller
resolution in `assets/hero-editorial-12s-v3-lite.mp4` and
`assets/hero-editorial-12s-v3-portrait-lite.mp4` so the mobile hero starts
quickly.

## Run

```powershell
node server.mjs
```

Open `http://localhost:4173`.

For a phone on the same Wi-Fi, open `http://<computer-LAN-IP>:4173`, not
`localhost`. The server listens on `0.0.0.0` by default; set `HOST=127.0.0.1`
if you want to restrict access to the computer only.

The site reads products from `data/catalog.json`. The server revalidates product IDs, sizes, quantities, prices and shipping before saving an order to `data/luminara.db`.

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
