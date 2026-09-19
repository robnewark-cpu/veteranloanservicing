# AI Search & SEO Strategy

_Companion to `WEBSITE-AUDIT.md`. Records the on-page and structured-data strategy behind Tranche 3._

## Objectives
1. Be citable by AI assistants (ChatGPT, Copilot, Claude, Gemini, Perplexity) for commercial loan servicing questions.
2. Rank for commercial-servicing intent terms without inventing authority.

## AI search (GEO) tactics implemented
- **`llms.txt`** — machine-readable summary with entity facts, founder credentials, an approved ACH block, a services list, and a Q&A section tuned for retrieval. Kept in sync with `docs/ach-capability-statement.md`.
- **Definition blocks** — `/glossary` marked up as `DefinedTermSet` + `DefinedTerm`; plain-language `<dl>` definitions cross-linked to the operational pages.
- **FAQ blocks** — `FAQPage` schema on home, institutional-services, trust, due-diligence, and every servicing/resource page.
- **HowTo / process explanations** — `HowTo` schema on the two genuine step-based pages (`/portfolio-boarding`, `/portfolio-transfers`), generated from a `howto` array in their content JSON.
- **Service enumeration** — `Service` + `OfferCatalog` on `/servicing` so an assistant can list the 11 operations.
- **Consistent entity `@id`** — every page references `https://veteranloanservicing.com/#organization`.
- **Plain-language answers** — one canonical answer per fact (ACH, residential exclusion, HQ, founder), repeated verbatim across surfaces so assistants get one consistent answer.

## Structured data coverage (schema.org)
| Type | Where |
|------|-------|
| Organization / FinancialService | Home (`#organization`), referenced sitewide |
| Person / ProfilePage | `/founder` |
| FAQPage | home, institutional-services, trust, due-diligence, all servicing + resource pages |
| Article | all resource + servicing pages |
| HowTo | `/portfolio-boarding`, `/portfolio-transfers` |
| DefinedTermSet / DefinedTerm | `/glossary` |
| Service / OfferCatalog | `/servicing` |
| BreadcrumbList | every page |

## SEO expansion (authority topics — all backed by real pages)
Commercial Loan Servicing · Private Lender Servicing · Loan Portfolio Administration ·
Investor Reporting · Portfolio Transfers · Borrower Communications · Commercial Collections ·
Default Administration · Special Assets. Each now has a dedicated page with an accurate title,
description, canonical, breadcrumb, and internal links — no doorway pages, no keyword stuffing.

## Guardrails
- No fabricated stats, reviews, or ratings — so **no `Review`/`AggregateRating`/`Rating` schema** (that would require verified data; see `claims-registry.md`).
- HowTo steps describe only real, current process.
- Definitions are generic/educational, not claims about proprietary capability.

## Not done here (future)
- Off-page authority (backlinks, directory listings) — outside the repo.
- Any `Review`/`AggregateRating` — blocked until verified client references exist (Tranche 4 framework).
