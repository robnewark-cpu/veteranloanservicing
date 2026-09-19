# Approved ACH Capability Statement — Source of Truth

_Status: **APPROVED** · Reviewer: Robert Newark · Approved: 2026-09-19_
_ACH payment processing is an **ACTIVE, current operational capability.**_

This file is the single source of truth for how ACH is described anywhere on the site
(HTML body copy, JSON-LD `FAQPage`, `llms.txt`, and the chatbot worker). When ACH language
changes, it changes **here first**, then is propagated byte-consistent to every surface.
Do not paraphrase ACH capabilities on individual pages — quote one of the approved blocks below.

---

## A. Approved Capability Statement (canonical — one sentence)

> Borrower payments are collected via ACH and disbursed to lenders on a scheduled monthly
> cycle, structured around NACHA operating guidelines, with a full audit trail maintained
> for every transaction.

Use this exact sentence in body copy and JSON-LD answers. It is the version already present
on the homepage; all other pages are normalized to match it.

## B. Approved Capability Statement (expanded — for dedicated ACH / servicing sections)

> Veteran Loan Servicing collects borrower payments via ACH (Automated Clearing House) and
> disburses to lenders on a scheduled monthly cycle. Collection and disbursement are structured
> around NACHA operating guidelines, and every transaction is recorded in a reconcilable audit
> trail. ACH payment processing is an active, current operational capability.

## C. Approved ACH FAQ

**How are borrower payments collected and disbursed to lenders?**
Borrower payments are collected via ACH and disbursed to lenders on a scheduled monthly cycle,
structured around NACHA operating guidelines, with a full audit trail maintained for every transaction.

**Is Veteran Loan Servicing NACHA certified?**
Veteran Loan Servicing structures its ACH payment processing around NACHA operating guidelines.
NACHA does not certify individual companies; it publishes the operating rules that govern ACH
transactions in the United States. (This distinction is honest and must be preserved.)

**Is ACH processing active today?**
Yes. ACH payment collection and lender disbursement are active, current operational capabilities.

## D. Approved ACH Workflow Description

1. **Collection** — Borrower payments are collected via ACH on the scheduled cycle.
2. **Reconciliation** — Each transaction is recorded in a reconcilable audit trail.
3. **Disbursement** — Funds are disbursed to lenders on a scheduled monthly cycle.
4. **Reporting** — Disbursement activity appears in the lender's portfolio reporting.

All steps are structured around NACHA operating guidelines.

---

## E. Wording rules (consistency guardrails)
- Always "structured around NACHA operating guidelines" — never "NACHA certified" / "NACHA compliant" as a credential.
- Always pair collection **and** disbursement; never imply one without the other.
- Always mention the audit trail when describing the cycle.
- "ACH" = Automated Clearing House on first expanded use per page.
- Do not attach volumes, counts, dollar amounts, or timing SLAs to ACH (none are verified).

## F. Surfaces that carry ACH language (keep in sync)
- `index.html` (JSON-LD FAQ + home FAQ)
- `institutional-services.html` (JSON-LD FAQ + FAQ + service card)
- `commercial-loan-sub-servicing.html` (JSON-LD FAQ + body)
- `enterprise-risk-compliance.html` (NACHA-aligned ACH section + FAQ)
- `veteran-loan-servicing.html` (servicing summary)
- `content/resources/commercial-loan-sub-servicing.json`
- `workers/chatbot.js` (canned payment answer)
- `llms.txt`
- `due-diligence.html` (new — operational-capability section)
