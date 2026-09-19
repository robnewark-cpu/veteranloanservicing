# Client Reference & Case Study Framework

Governs everything that represents a client on the site. Default state: **empty**. Nothing here
renders until the required authorization exists and the claim is Verified in `claims-registry.md`.

## What is live today
- **References available on request** (VERIFIED, C18) — named privately to qualified prospects with a client's permission. No public naming.
- **Anonymized traction** (VERIFIED, C15–C17) — two client portfolios, multiple loans, >$500,000 combined balances. Anonymous by agreement.
- **Anonymized engagement scenarios** — the existing `/case-studies` "Problems Institutional Books Bring Us" cards (representative, no identifying detail).

## Frameworks built (empty, authorization-gated)
| Framework | Where | Renders when |
|-----------|-------|--------------|
| Case study pages | `content/case-studies/*.json` → build script | A real slug exists, `_authorization` set, figures verified, approval passed |
| Testimonials / quotes | not built | A real quote + named author + written publication authorization |
| Client logos | not built | A client gives **documented written** logo permission |

## Authorization values (case study `_authorization`)
- `anonymized` — no identifying detail; safe to publish.
- `client-authorized` — client authorized identification in writing (retain the authorization).
- `first-party-disclosed` — a case study of one of the owner's own businesses, clearly labeled as first-party.

## Hard rules (from claims-registry.md)
- No testimonials, client logos, recovery rates, delinquency metrics, or performance statistics unless Verified with a documented source.
- The only client-volume figures allowed are the verified C15–C17 facts, stated exactly (two clients / multiple loans / >$500,000), never rounded up or elaborated.
- Client logos require documented written authorization on file — no exceptions.

## How to publish a case study
1. Copy `content/case-studies/_TEMPLATE.json` to a real slug.
2. Set `_authorization`; ensure every figure is Verified in the claims registry.
3. Run `npm run build:resources`; the page builds with Case Studies breadcrumb + Article/FAQ schema.
4. Link it from `/case-studies`.
5. Move through the approval workflow before merging to `main`.
