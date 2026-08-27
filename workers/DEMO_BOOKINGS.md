# Optional Cloudflare KV for persisting booked demo slots across deploys.
#
#   npx wrangler kv namespace create DEMO_BOOKINGS
#   # paste id into wrangler.jsonc:
#   "kv_namespaces": [{ "binding": "DEMO_BOOKINGS", "id": "..." }]
#
# Without KV, bookings still work in-memory for the current Worker isolate
# and are logged / emailed when RESEND_API_KEY is set.
