# Veteran Loan Servicing — Website Audit & Institutional Credibility Plan

_Last updated: 2026-09-19 · Owner: Robert Newark · Status: living document_

This is the durable reference for the institutional-credibility program. It records the
audit findings, the information architecture, and the governance rules every page must
satisfy. **Nothing on this site publishes fabricated credibility.** Where a claim cannot
be verified, it stays a labeled placeholder in `claims-registry.md` until approved.

---

## 1. Audit summary (verified against repo, 2026-09-19)

**Stack:** 16 static HTML pages, shared `/assets/css/main.css` design system, deployed via
Cloudflare Workers static assets (`wrangler.jsonc`, `workers/site-handler.js`). Lead capture
posts to `/api/chat/lead` (`assets/js/lead-form.js`) with a `mailto:` fallback. Build tooling:
`scripts/build-resource-pages.mjs`, `scripts/validate-site.mjs`, growth engine under `growth/`.

### Strengths (PRESERVED — do not weaken)
- Honest, US-only positioning; explicit "we do NOT service residential mortgages."
- Real, named founder (Robert Newark) with LinkedIn in JSON-LD.
- Case studies are explicitly **anonymized scenarios**, not fabricated logos or invented AUM.
- Consistent regulatory-scope footer on every page.
- Clean `FinancialService` / `FAQPage` / `BreadcrumbList` JSON-LD; canonical tags present.
- ACH described consistently and honestly (NACHA "aligned," never "certified").

### Weaknesses addressed by this program
1. No Trust Center for lender procurement review.
2. No self-serve due-diligence content.
3. Founder authority thin (one paragraph).
4. Single conversion path (demo only) — no pricing/proposal/portfolio-review/DD funnels.
5. Limited operational-transparency pages (boarding, transfers, reporting, etc.).
6. SEO/AI authority expandable via definition blocks, glossary, HowTo/Article schema.

---

## 2. Information architecture (additive — no redesign)

```
/                         (home, unchanged except ACH standardization)
/institutional-services   (unchanged except ACH standardization)
/about                    (enhanced: real founder authority block)
/founder                  NEW — founder authority
/leadership               NEW — leadership (honest, single-principal)
/trust                    NEW — Trust Center hub
  /trust/security-overview, /trust/data-protection, /trust/business-continuity,
  /trust/access-controls, /trust/vendor-management, /trust/record-retention,
  /trust/compliance-program, /trust/operational-controls   (Tranche later)
/due-diligence            NEW — Due Diligence Center + package request funnel
/servicing/*              NEW — Servicing Operations hub (Tranche 2)
/resources                (expand — Tranche 2/3)
```

All new pages reuse the existing header/mega-nav, footer, and `main.css` classes
(`.hero`, `.section-header`, `.grid`, `.card`, `.faq-item`, `.form-panel`, `.doc-page`,
`.data-table`, `.cta-banner`). No new CSS framework, no visual redesign.

---

## 3. Governance (see companion docs)
- `claims-registry.md` — every public claim, its source, verification status, reviewer.
- `approval-workflow.md` — Draft → Internal → Operations → Compliance → Legal → Approved → Published → Archived.
- `disclaimers.md` — reusable disclaimer blocks.
- `ach-capability-statement.md` — the single approved ACH language deployed sitewide.

## 4. Prohibited content (hard rule)
Never publish, in any page, schema, or the chatbot: AUM, portfolio/loan/customer counts,
recovery or delinquency rates, servicing volume, testimonials, reviews, client logos, or
performance statistics — unless moved to `Verified` in the claims registry with a documented source.
