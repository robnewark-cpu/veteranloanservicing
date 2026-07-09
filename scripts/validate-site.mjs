#!/usr/bin/env node
/**
 * Lightweight production-readiness check for the static site.
 *
 * Since this project ships as plain HTML/CSS/JS with no bundler, there is no
 * traditional "compile" step. This script stands in for that step by:
 *   1. Parsing every HTML file to catch malformed markup.
 *   2. Validating every JSON-LD <script type="application/ld+json"> block.
 *   3. Verifying every internal link/asset reference resolves to a real file.
 *   4. Confirming SEO-critical tags (title, description, canonical) exist.
 *
 * Run with: node scripts/validate-site.mjs
 */
import { parse } from "node-html-parser";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
let errors = 0;
let warnings = 0;

function fail(file, msg) {
  console.error(`\u2716 [${file}] ${msg}`);
  errors++;
}
function warn(file, msg) {
  console.warn(`\u26a0 [${file}] ${msg}`);
  warnings++;
}
function pass(msg) {
  console.log(`\u2713 ${msg}`);
}

function findHtmlFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".git" || entry === ".wrangler") continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) results.push(...findHtmlFiles(full));
    else if (extname(entry) === ".html") results.push(full);
  }
  return results;
}

function resolvesToFile(hrefPath) {
  // Strip query/hash
  const clean = hrefPath.split("#")[0].split("?")[0];
  if (clean === "" || clean === "/") return existsSync(join(ROOT, "index.html"));
  const rel = clean.replace(/^\//, "");
  const direct = join(ROOT, rel);
  if (existsSync(direct) && statSync(direct).isFile()) return true;
  if (existsSync(direct + ".html")) return true;
  if (existsSync(join(direct, "index.html"))) return true;
  return false;
}

const htmlFiles = findHtmlFiles(ROOT);
if (htmlFiles.length === 0) {
  fail("scripts/validate-site.mjs", "No HTML files found to validate.");
}

const titles = new Map();

for (const file of htmlFiles) {
  const rel = file.replace(ROOT + "/", "");
  const html = readFileSync(file, "utf8");

  let root;
  try {
    root = parse(html, { comment: true });
  } catch (e) {
    fail(rel, `Failed to parse HTML: ${e.message}`);
    continue;
  }

  // 1. JSON-LD validation
  const ldScripts = root.querySelectorAll('script[type="application/ld+json"]');
  for (const [i, script] of ldScripts.entries()) {
    try {
      JSON.parse(script.textContent);
    } catch (e) {
      fail(rel, `Invalid JSON-LD block #${i + 1}: ${e.message}`);
    }
  }

  const isNoIndexOk = rel === "404.html";

  if (!isNoIndexOk) {
    // 2. SEO essentials
    const title = root.querySelector("title");
    if (!title || !title.textContent.trim()) {
      fail(rel, "Missing or empty <title>.");
    } else {
      const t = title.textContent.trim();
      if (titles.has(t)) {
        warn(rel, `Duplicate <title> also used by ${titles.get(t)}: "${t}"`);
      } else {
        titles.set(t, rel);
      }
    }

    const description = root.querySelector('meta[name="description"]');
    if (!description || !description.getAttribute("content")?.trim()) {
      warn(rel, "Missing <meta name=\"description\">.");
    }

    const canonical = root.querySelector('link[rel="canonical"]');
    if (!canonical) {
      warn(rel, "Missing <link rel=\"canonical\">.");
    }

    const viewport = root.querySelector('meta[name="viewport"]');
    if (!viewport) {
      fail(rel, "Missing <meta name=\"viewport\"> — required for responsive layout.");
    }
  }

  // 3. Internal link / asset integrity
  const linkable = [
    ...root.querySelectorAll("a[href]"),
    ...root.querySelectorAll("link[href]"),
  ];
  for (const el of linkable) {
    const href = el.getAttribute("href");
    if (!href || /^(https?:|mailto:|tel:|#)/.test(href)) continue;
    if (!href.startsWith("/")) continue; // ignore relative fragments for now
    if (!resolvesToFile(href)) {
      fail(rel, `Broken internal link: ${href}`);
    }
  }

  const assetRefs = [
    ...root.querySelectorAll("script[src]"),
    ...root.querySelectorAll("img[src]"),
  ];
  for (const el of assetRefs) {
    const src = el.getAttribute("src");
    if (!src || /^https?:/.test(src)) continue;
    if (!src.startsWith("/")) continue;
    if (!resolvesToFile(src)) {
      fail(rel, `Broken asset reference: ${src}`);
    }
  }
}

pass(`Parsed ${htmlFiles.length} HTML files.`);

// 4. Config sanity checks
const wranglerPath = join(ROOT, "wrangler.jsonc");
if (existsSync(wranglerPath)) {
  try {
    const raw = readFileSync(wranglerPath, "utf8").replace(/\/\/.*$/gm, "");
    JSON.parse(raw);
    pass("wrangler.jsonc is valid JSON.");
  } catch (e) {
    fail("wrangler.jsonc", `Invalid JSON: ${e.message}`);
  }
}

for (const required of ["sitemap.xml", "robots.txt", "_headers", "_redirects"]) {
  if (!existsSync(join(ROOT, required))) {
    fail(required, "Required file is missing.");
  }
}

console.log(`\n${errors === 0 ? "\u2713" : "\u2716"} Validation complete: ${errors} error(s), ${warnings} warning(s).`);
process.exit(errors > 0 ? 1 : 0);
