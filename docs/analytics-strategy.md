# Analytics Strategy — Conversion Tracking

The lead form (`assets/js/lead-form.js`) posts a JSON payload to `/api/chat/lead` including
`source`, `page`, and `submitted_at`. Every funnel sets a distinct `data-source`, so
conversions are already differentiable at the point of capture — no new backend is required.

## Conversion events (by `data-source`)

| Funnel | `data-source` value | Page |
|--------|--------------------|------|
| Request Pricing | `request-pricing` | `/get-started#f-pricing` |
| Request Servicing Proposal | `servicing-proposal` | `/get-started#f-proposal` |
| Request Portfolio Review | `portfolio-review` | `/get-started#f-review` |
| Executive Consultation | `executive-consultation` | `/get-started#f-exec` |
| Request Due Diligence Package | `due-diligence-package` | `/due-diligence#dd-request` |
| Loan Portfolio Assessment | `loan-portfolio-assessment` | `/get-started#f-assessment` |
| Request Platform Demo | `request-demo` | `/request-demo` |
| Contact | `contact` | `/contact` |

Additional captured dimensions already in the payload: `portfolio_type`, `portfolio_size`,
`organization_type` (due-diligence), `diligence_focus`, `assessment_context`, `page` (source page).

## What to track (recommended)
1. **Conversions by funnel** — count and rate per `data-source`.
2. **Source page** — which page (`page` field) drove each conversion; attributes servicing/resource pages.
3. **Portfolio size interest** — distribution of `portfolio_size` across submissions (demand signal, not a published metric).
4. **Organization type** — which audiences (private lender, credit fund, family office, loan purchaser…) convert.
5. **Funnel drop-off** — form views vs. submissions on `/get-started` and `/due-diligence`.

## Implementation options (pick one; not built here)
- **Server-side (preferred):** the `/api/chat/lead` worker already receives every field — aggregate there (e.g. write to a KV/D1 counter by `source`), zero client tracking, privacy-friendly.
- **Client-side:** add a single analytics call in `lead-form.js` `showSuccess()` emitting a `lead_submit` event with `{source, page, portfolio_size}`. One place to change.

## Reporting recommendations
- Weekly: conversions by funnel + source page.
- Monthly: audience mix (`organization_type`), portfolio-size interest distribution, top-converting resource/servicing pages.
- Never publish these as site content — they are internal demand signals, not verified performance claims (see `claims-registry.md`).
