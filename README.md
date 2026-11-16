# Luminara Commerce

Single-page jewellery storefront with a dependency-free Node backend.

## Motion

The storefront uses locally vendored GSAP, ScrollTrigger and Lenis. React
Bits-inspired SpotlightCard, GlareHover, TiltedCard and ScrollExpand behaviours
are adapted natively in `assets/editorial-motion.js`; no React runtime is
required. Reduced-motion preferences disable smooth scrolling, autoplay and
pointer-led effects. See `THIRD_PARTY_NOTICES.md` for sources and licences.

Motion 14 is vendored as a local ESM module for spring-based product hover,
filter arrivals, press feedback, drawer entrances and the still-life detail
camera. GSAP remains responsible for page-level sequencing so the two engines
do not animate the same properties on the same elements.

All six catalogue products use their original photography in both the collection
and bag. The velvet, hand scale, surface and lighting stay intact; the site does
not replace them with isolated cut-outs.

The homepage hero is a single still image led by pink flower earrings with
purple drops; the landscape and portrait compositions are separate
assets. The `Two Doves` editorial still includes three interactive detail
points, and the vitrine includes a random selection path that respects the
active category. An original ambient score in `assets/luminara-ambient-v4.m4a`
fades in after the visitor's first interaction, as required by browser autoplay
policies. The small Sound control in the masthead provides a persistent mute
preference; key storefront actions also use quiet, procedurally generated
interface sounds.

## Creative and local tooling

The film treatment follows the huashu-motion directing and rhythm workflow,
including its hook / burst / stop / resolve structure and post-render contact
sheet review. Animation follows the official GSAP skill guidance, and the local
model recommendation was checked with llmfit against the available RTX 4070 /
32 GB workstation. These tools inform production only; the public storefront
loads only its vendored browser assets.

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

Without Stripe credentials, checkout records an order request and tells the
customer that availability, delivery and payment will be reviewed separately.
It never displays a false paid state or promises an automated payment flow.

## Order email

Set all three of `RESEND_API_KEY`, `ORDER_NOTIFY_EMAIL` and `ORDER_FROM_EMAIL` to
send merchant notifications for orders and enquiries. Merchant email stays
disabled until every value is configured.

## Data

Orders and contact messages are stored in `data/luminara.db`. Back up this file together with the deployment.
