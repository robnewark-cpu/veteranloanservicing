#!/usr/bin/env node
/**
 * Generate personalized warm outreach drafts from growth/targets.csv
 * Output: growth/outbox/outreach-YYYY-MM-DD/
 *
 * Usage:
 *   npm run growth:outreach
 *   npm run growth:outreach -- --limit 10
 *
 * Does NOT send messages. Review and paste into LinkedIn/email manually
 * (LinkedIn auto-DM bots risk account restriction).
 */
import { readFileSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const GROWTH = join(ROOT, "growth");

function parseArgs() {
  const args = process.argv.slice(2);
  let limit = Infinity;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--limit" && args[i + 1]) limit = Number(args[++i]);
  }
  return { limit };
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/).filter((l) => l && !l.startsWith("#"));
  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cols = splitCsvLine(line);
    const row = {};
    headers.forEach((h, i) => {
      row[h] = (cols[i] || "").trim();
    });
    return row;
  });
}

function splitCsvLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (c === "," && !inQuotes) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += c;
  }
  out.push(cur);
  return out;
}

function fill(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? "");
}

function warmIntro(templates, warmPath) {
  if (!warmPath) return null;
  const [kind, detail] = warmPath.split(":").map((s) => s.trim());
  const phraseTpl =
    templates.warm_path_phrases[kind] || templates.warm_path_phrases.default;
  return fill(phraseTpl, { detail: detail || kind });
}

function main() {
  const { limit } = parseArgs();
  const targetsPath = existsSync(join(GROWTH, "targets.csv"))
    ? join(GROWTH, "targets.csv")
    : join(GROWTH, "targets.example.csv");
  const templates = JSON.parse(
    readFileSync(join(GROWTH, "outreach-templates.json"), "utf8")
  );
  const rows = parseCsv(readFileSync(targetsPath, "utf8")).slice(0, limit);

  if (rows.length === 0) {
    console.error(
      "No targets found. Copy growth/targets.example.csv → growth/targets.csv and add prospects."
    );
    process.exit(1);
  }

  const day = new Date().toISOString().slice(0, 10);
  const outDir = join(GROWTH, "outbox", `outreach-${day}`);
  mkdirSync(outDir, { recursive: true });

  const summary = [];
  rows.forEach((row, idx) => {
    const n = String(idx + 1).padStart(2, "0");
    const companyType = row.company_type || "default";
    const vars = {
      first_name: row.first_name || "there",
      last_name: row.last_name || "",
      title: row.title || "",
      company: row.company || "your firm",
      company_type_label:
        templates.company_type_labels[companyType] ||
        templates.company_type_labels.default,
      demo: templates.sender.demo,
      site: templates.sender.site,
      email: templates.sender.email,
      warm_intro: "",
    };
    const intro = warmIntro(templates, row.warm_path);
    vars.warm_intro = intro || "";

    const isWarm = Boolean(intro);
    const connection = fill(
      isWarm
        ? templates.linkedin_connection.warm
        : templates.linkedin_connection.default,
      vars
    );
    const message = fill(
      isWarm ? templates.linkedin_message.warm : templates.linkedin_message.default,
      vars
    );
    const subject = fill(templates.email.subject, vars);
    const emailBody = fill(templates.email.body, vars);

    const file = join(
      outDir,
      `${n}-${(row.company || "prospect").replace(/[^\w]+/g, "-").toLowerCase()}.md`
    );
    const md = `# Outreach — ${row.first_name} ${row.last_name} @ ${row.company}

- Title: ${row.title || "—"}
- Type: ${row.company_type || "—"}
- LinkedIn: ${row.linkedin_url || "—"}
- Email: ${row.email || "—"}
- Warm path: ${row.warm_path || "cold/personalized"}
- Notes: ${row.notes || "—"}

## LinkedIn connection note
\`\`\`
${connection}
\`\`\`

## LinkedIn message (after connect)
\`\`\`
${message}
\`\`\`

## Email
**Subject:** ${subject}

\`\`\`
${emailBody}
\`\`\`
`;
    writeFileSync(file, md);
    summary.push(
      `${n}. ${row.first_name} ${row.last_name} — ${row.company} (${isWarm ? "warm" : "personalized"})`
    );
  });

  writeFileSync(
    join(outDir, "README.md"),
    `# Outreach queue — ${day}\n\nGenerated ${rows.length} drafts. Send manually (10/day max recommended).\n\n${summary.map((s) => `- ${s}`).join("\n")}\n`
  );

  console.log(`✓ Wrote ${rows.length} outreach drafts → ${outDir}`);
}

main();
