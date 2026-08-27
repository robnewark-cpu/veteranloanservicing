#!/usr/bin/env node
/**
 * Generate this week's LinkedIn posts from the content bank.
 * Output: growth/outbox/linkedin-week-YYYY-MM-DD.md
 *
 * Usage:
 *   npm run growth:linkedin
 *   npm run growth:linkedin -- --count 3
 *
 * Does NOT auto-post to LinkedIn (API partnership required / ToS risk).
 * Copy into LinkedIn, Buffer, or Taplio.
 */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const GROWTH = join(ROOT, "growth");

function parseArgs() {
  const args = process.argv.slice(2);
  let count = 3;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--count" && args[i + 1]) count = Number(args[++i]);
  }
  return { count };
}

function weekNumber(d) {
  const start = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d - start) / 86400000 + start.getDay() + 1) / 7);
}

function main() {
  const { count } = parseArgs();
  const bank = JSON.parse(
    readFileSync(join(GROWTH, "linkedin-content-bank.json"), "utf8")
  );
  const now = new Date();
  const wn = weekNumber(now);
  const posts = bank.posts;
  const selected = [];
  for (let i = 0; i < count; i++) {
    selected.push(posts[(wn + i) % posts.length]);
  }

  const day = now.toISOString().slice(0, 10);
  const outDir = join(GROWTH, "outbox");
  mkdirSync(outDir, { recursive: true });
  const outFile = join(outDir, `linkedin-week-${day}.md`);

  const schedule = ["Tue 9:00 AM CT", "Wed 11:30 AM CT", "Thu 8:30 AM CT"];
  let md = `# LinkedIn posts — week of ${day}\n\nCadence: ${count}/week from content bank (${posts.length} total).\nCopy/paste into LinkedIn or your scheduler.\n\n`;

  selected.forEach((post, i) => {
    const hook = post.hooks[i % post.hooks.length];
    const tags = (post.tags || []).map((t) => `#${t}`).join(" ");
    const full = `${hook}\n\n${post.body}\n\n${post.cta}\n\n${tags}`;
    md += `## Post ${i + 1} — ${schedule[i] || `Slot ${i + 1}`} (${post.id})\n\n\`\`\`\n${full}\n\`\`\`\n\n`;
  });

  md += `---\n\n## Operator checklist\n1. Post from Robert's personal profile (not only company page)\n2. Reply to every comment within 2 hours\n3. Send 5 connection notes the same day (npm run growth:outreach)\n4. Log replies in your CRM / spreadsheet\n`;

  writeFileSync(outFile, md);
  console.log(`✓ Wrote ${count} LinkedIn drafts → ${outFile}`);
}

main();
