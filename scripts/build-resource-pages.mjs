#!/usr/bin/env node
/**
 * Renders buyer-intent resource pages from content/resources/*.json
 * using a shared institutional chrome (nav/footer/schema).
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const CONTENT = join(ROOT, "content", "resources");

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function render(page) {
  const faqLd = page.faqs?.length
    ? `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": ${JSON.stringify(
    page.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
    null,
    2
  )}
}
</script>`
    : "";

  const sections = (page.sections || [])
    .map(
      (s) => `
  <section class="section-border-top" aria-labelledby="${esc(s.id)}">
    <div class="container" style="max-width:820px;">
      <h2 id="${esc(s.id)}">${esc(s.heading)}</h2>
      ${(s.paragraphs || []).map((p) => `<p class="body-copy" style="margin-top:14px;">${p}</p>`).join("")}
      ${
        s.bullets
          ? `<ul class="bullet-list" style="margin-top:18px;">${s.bullets
              .map((b) => `<li>${b}</li>`)
              .join("")}</ul>`
          : ""
      }
    </div>
  </section>`
    )
    .join("\n");

  const faqs = (page.faqs || [])
    .map(
      (f) => `
      <details class="faq-item">
        <summary>${esc(f.q)}</summary>
        <p>${esc(f.a)}</p>
      </details>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.description)}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://veteranloanservicing.com/${esc(page.slug)}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Veteran Loan Servicing">
<meta property="og:url" content="https://veteranloanservicing.com/${esc(page.slug)}">
<meta property="og:title" content="${esc(page.title)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:image" content="https://veteranloanservicing.com/assets/images/og-cover.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#05070d">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="apple-touch-icon" href="/assets/images/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" media="print" onload="this.media='all'; this.onload=null;">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"></noscript>
<link rel="stylesheet" href="/assets/css/main.css">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": ${JSON.stringify(page.h1)},
  "description": ${JSON.stringify(page.description)},
  "author": { "@type": "Organization", "name": "Veteran Loan Servicing" },
  "publisher": { "@id": "https://veteranloanservicing.com/#organization" },
  "mainEntityOfPage": "https://veteranloanservicing.com/${page.slug}",
  "about": ${JSON.stringify(page.about || [])}
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://veteranloanservicing.com/" },
    { "@type": "ListItem", "position": 2, "name": "Resources", "item": "https://veteranloanservicing.com/resources" },
    { "@type": "ListItem", "position": 3, "name": ${JSON.stringify(page.navLabel)}, "item": "https://veteranloanservicing.com/${page.slug}" }
  ]
}
</script>
${faqLd}
</head>
<body>
<a class="skip-link" href="#main-content">Skip to main content</a>
<header class="site-header">
  <div class="container nav-bar">
    <a href="/" class="logo">
      <img src="/favicon.svg" alt="Veteran Loan Servicing Mark" width="32" height="32" fetchpriority="high" style="display:inline-block; vertical-align:middle; margin-right:8px;">
      <span class="logo-text"><span class="logo-name">VETERAN LOAN SERVICING</span><small>Institutional Asset Servicing</small></span>
    </a>
    <nav aria-label="Primary">
      <ul class="nav-primary">
        <li>
          <button type="button" class="nav-link" aria-haspopup="true" aria-expanded="false" aria-controls="solutions-panel" data-mega-toggle>
            Solutions
            <svg class="chev" viewBox="0 0 10 6" fill="none" aria-hidden="true"><path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          </button>
          <div class="mega-panel" id="solutions-panel">
            <a class="mega-item" href="/institutional-services"><div><h4>Institutional Services</h4><p>Commercial loan servicing &amp; portfolio administration</p></div></a>
            <a class="mega-item" href="/enterprise-risk-compliance"><div><h4>Enterprise Risk &amp; Compliance</h4><p>Regulatory &amp; audit frameworks</p></div></a>
            <a class="mega-item" href="/global-asset-technology"><div><h4>Global Asset Technology</h4><p>Servicing infrastructure that scales</p></div></a>
            <a class="mega-item" href="/resources"><div><h4>Resources</h4><p>Guides for credit funds &amp; CRE lenders</p></div></a>
          </div>
        </li>
        <li><a class="nav-link" href="/case-studies">Case Studies</a></li>
        <li><a class="nav-link" href="/resources">Resources</a></li>
        <li><a class="nav-link" href="/about">About</a></li>
        <li><a class="nav-link" href="/contact">Contact</a></li>
        <li class="mobile-cta-item"><a href="/request-demo" class="btn btn-primary btn-block">Request Platform Demo</a></li>
      </ul>
    </nav>
    <div class="nav-actions">
      <a href="/request-demo" class="btn btn-primary btn-sm">Request Platform Demo</a>
      <button class="nav-toggle" type="button" aria-label="Toggle navigation menu" aria-expanded="false">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 6H21M3 12H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      </button>
    </div>
  </div>
</header>

<main id="main-content">
  <section class="hero" style="padding-bottom:20px;" aria-labelledby="resource-hero">
    <div class="container" style="max-width:820px;">
      <div class="breadcrumb">
        <a href="/">Home</a><span>/</span><a href="/resources">Resources</a><span>/</span><span aria-current="page">${esc(page.navLabel)}</span>
      </div>
      <span class="eyebrow">${esc(page.eyebrow)}</span>
      <h1 id="resource-hero">${esc(page.h1)}</h1>
      <p class="hero-desc-1">${esc(page.lede)}</p>
    </div>
  </section>
${sections}
  ${
    faqs
      ? `<section class="section-border-top" aria-labelledby="faq-heading">
    <div class="container" style="max-width:820px;">
      <h2 id="faq-heading">FAQ</h2>
      <div class="faq-list" style="margin-top:20px;">${faqs}
      </div>
    </div>
  </section>`
      : ""
  }
  <section class="section-border-top" aria-labelledby="cta-heading">
    <div class="container">
      <div class="cta-banner">
        <div>
          <span class="eyebrow gold">Next Step</span>
          <h2 id="cta-heading">${esc(page.ctaHeading || "Talk Through Your Portfolio")}</h2>
          <p>${esc(page.ctaBody || "Request a platform demo or contact institutional sales.")}</p>
        </div>
        <div class="cta-actions">
          <a href="/request-demo" class="btn btn-primary btn-lg btn-block">Request Platform Demo</a>
          <a href="/contact" class="btn btn-ghost btn-lg btn-block">Contact Institutional Sales</a>
        </div>
      </div>
    </div>
  </section>
</main>

<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="/" class="logo">
          <img src="/favicon.svg" alt="Veteran Loan Servicing Mark" width="24" height="24" style="display:inline-block; vertical-align:middle; margin-right:6px;">
          <span class="logo-text"><span class="logo-name">VETERAN LOAN SERVICING</span><small>Institutional Asset Servicing</small></span>
        </a>
        <p>Institutional-grade commercial loan servicing for banks, credit funds, and alternative capital platforms.</p>
        <a class="footer-email" href="mailto:info@veteranloanservicing.com">info@veteranloanservicing.com</a>
      </div>
      <div class="footer-col">
        <h3>Solutions</h3>
        <ul>
          <li><a href="/institutional-services">Institutional Services</a></li>
          <li><a href="/enterprise-risk-compliance">Risk &amp; Compliance</a></li>
          <li><a href="/global-asset-technology">Asset Technology</a></li>
          <li><a href="/resources">Resources</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h3>Company</h3>
        <ul>
          <li><a href="/about">About</a></li>
          <li><a href="/contact">Contact</a></li>
          <li><a href="/request-demo">Request a Demo</a></li>
          <li><a href="/privacy">Privacy Policy</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h3>Office</h3>
        <ul class="footer-offices">
          <li><strong>Edmond, OK (HQ)</strong>1019 Waterwood Pkwy, Ste C, Edmond, OK 73034</li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2026 Veteran Loan Servicing.</p>
      <div class="footer-legal-links">
        <a href="/privacy">Privacy Policy</a>
        <a href="/llms.txt">llms.txt</a>
        <a href="/sitemap.xml">Sitemap</a>
      </div>
    </div>
  </div>
</footer>
<script src="/assets/js/main.js" defer></script>
<script
  src="https://site-chatbot-assets.pages.dev/widget.js"
  data-worker-url="/api/chat"
  data-site="vls"
  data-name="Veteran Loan Servicing"
  data-accent="#05070d"
  data-greeting="Hi, I can help point you to the right person on our team. What can I help you with today?"
></script>
</body>
</html>
`;
}

mkdirSync(CONTENT, { recursive: true });
const files = readdirSync(CONTENT).filter((f) => f.endsWith(".json"));
if (!files.length) {
  console.error("No content/resources/*.json files found.");
  process.exit(1);
}
for (const file of files) {
  const page = JSON.parse(readFileSync(join(CONTENT, file), "utf8"));
  const out = join(ROOT, `${page.slug}.html`);
  writeFileSync(out, render(page));
  console.log(`✓ ${page.slug}.html`);
}
