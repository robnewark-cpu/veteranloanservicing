# Veteran Loan Servicing — Institutional Platform Infrastructure

This repository contains the static web deployment build layout for **Veteran Loan Servicing**, configured to operate securely as an institutional B2B enterprise portfolio sub-servicing matrix outside consumer-facing residential mortgage sectors.

## Global Directory Configuration & Verification
The operational headquarters is anchored in **Edmond, OK**. Veteran Loan Servicing is a
**US-based** institutional B2B platform serving clients across the United States. It does
**not** operate international offices — earlier references to London/Singapore were
inaccurate and have been removed to match the site's actual (US-only) positioning.

All standard structural pages include verified microdata mappings (`Schema.org` definitions) matching the baseline validation protocols.

### Active HQ Address Mappings:
* **Structured Visual Footer/Grid**: `1019 Waterwood Pkwy, Ste C, Edmond, OK 73034`
* **JSON-LD Schema Context Configuration (`index.html`)**:
  ```json
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "1019 Waterwood Pkwy, Ste C",
    "addressLocality": "Edmond",
    "addressRegion": "OK",
    "postalCode": "73034",
    "addressCountry": "US"
  }
