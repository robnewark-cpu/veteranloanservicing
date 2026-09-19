# Claims Registry — Veteran Loan Servicing

_Every public-facing claim lives here with its source, verification status, and reviewer._
_Status values: **Verified** (publishable) · **Placeholder** (labeled, not asserted as fact) · **Prohibited** (never publish)._

| # | Claim | Source | Verification Status | Approval Date | Reviewer |
|---|-------|--------|---------------------|---------------|----------|
| C1 | ACH collection + lender disbursement, NACHA-aligned, full audit trail | `docs/ach-capability-statement.md`; live operational capability | **Verified** | 2026-09-19 | Robert Newark |
| C2 | ACH is an active, current capability | Owner attestation | **Verified** | 2026-09-19 | Robert Newark |
| C3 | Does NOT service consumer residential mortgages | Existing site policy | **Verified** | 2026-09-19 | Robert Newark |
| C4 | US-based; HQ Edmond, OK (1019 Waterwood Pkwy, Ste C) | Existing site | **Verified** | 2026-09-19 | Robert Newark |
| C5 | Founder: Robert Newark | Existing site + Aegis founder.html | **Verified** | 2026-09-19 | Robert Newark |
| C6 | Founder is an **Attorney** — licensed TX (2007) & OK (2008); member State Bar of Texas & Oklahoma Bar Association | Aegis `founder.html` (owner-authored) | **Verified** | 2026-09-19 | Robert Newark |
| C7 | Founder is a **U.S. Army veteran** — Paralegal, Sergeant (SGT), 1993–1999 | Aegis `founder.html` | **Verified** | 2026-09-19 | Robert Newark |
| C8 | Veteran-Owned Small Business (VOSB) | Aegis `founder.html` | **Verified** | 2026-09-19 | Robert Newark |
| C9 | Founder is a **compliance practitioner** (SOC 2, HIPAA, ISO 27001, FedRAMP, GRC) | Aegis `founder.html` | **Verified** | 2026-09-19 | Robert Newark |
| C10 | Founder is a **software architect / technology executive** (AegisOS) | Aegis `founder.html` | **Verified** | 2026-09-19 | Robert Newark |
| C11 | Founder is a **business operator** running a law firm + lending operation on his own platform | Aegis `founder.html`; LoanServ | **Verified** | 2026-09-19 | Robert Newark |
| C12 | UCC Article 9 enforcement / remedies framework | Existing site | **Verified** | 2026-09-19 | Robert Newark |
| C13 | Insurance compliance monitoring | Existing site | **Verified** | 2026-09-19 | Robert Newark |
| C14 | Data handled on Cloudflare edge; encrypted transport; US data | Deployment config (`wrangler.jsonc`) | **Verified** | 2026-09-19 | Robert Newark |
| C15 | Currently servicing **two client portfolios** (anonymous) | Owner attestation 2026-09-19 | **Verified** | 2026-09-19 | Robert Newark |
| C16 | Managing **multiple loans** across those two clients | Owner attestation 2026-09-19 | **Verified** | 2026-09-19 | Robert Newark |
| C17 | **Over $500,000** in combined loan balances under management | Owner attestation 2026-09-19 | **Verified** | 2026-09-19 | Robert Newark |
| C18 | **References available on request** (named privately to qualified prospects) | Owner attestation 2026-09-19 | **Verified** | 2026-09-19 | Robert Newark |
| P1 | Founder speaking engagements / publications / interviews | — | **Placeholder** (awaiting list) | — | — |
| P2 | SOC 2 / ISO 27001 certification **held by VLS** | — | **Placeholder** — VLS is not certified; describe practices only, never claim a cert | — | — |
| P3 | Named client case studies / testimonials / logos | — | **Placeholder** — require documented client authorization | — | — |
| X1 | Assets under management beyond the verified ">$500K combined balances" figure; precise loan/customer counts beyond "two clients / multiple loans" | — | **Prohibited** (only C15–C17 verified figures may be stated) | — | — |
| X2 | Recovery rates, delinquency metrics, servicing volume | — | **Prohibited** | — | — |
| X3 | Performance statistics of any kind | — | **Prohibited** | — | — |
| X4 | International operations (London / Singapore) | Stale README only | **Prohibited** — contradicts US-only positioning; README corrected | — | — |

## Notes
- C6–C11 are **owner-authored on the Aegis founder page** and approved by the owner for
  reuse on VLS. They are published as the founder's professional background; VLS the company
  does not thereby claim to hold SOC 2/ISO certifications (see P2).
- Any new claim must be added here as Placeholder first and only flipped to Verified by the reviewer.
