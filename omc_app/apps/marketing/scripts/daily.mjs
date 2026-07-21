/**
 * Market of the Day — one command renders the clip + writes the caption.
 *
 * Usage (from apps/marketing):
 *   npm run daily -- --q "GOAT of basketball?" --a "Jordan" --p 3.00 --cat SPORTS
 *
 * Options:
 *   --q     question (required)          --a    current answer (required)
 *   --p     price in USD (required)      --cat  category label   (default OPINION)
 *   --pct   change % badge (default 0)   --owner short owner     (default 0x9a…D8c)
 *   --tags  comma-separated @handles to suggest in the caption
 *
 * Output: out/daily/YYYY-MM-DD-<slug>.mp4 + .caption.txt
 */
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const args = {};
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  if (argv[i].startsWith("--")) args[argv[i].slice(2)] = argv[i + 1];
}

const question = args.q;
const answer = args.a;
const price = parseFloat(args.p);
if (!question || !answer || Number.isNaN(price)) {
  console.error('Missing/invalid args. Example:\n  npm run daily -- --q "GOAT of basketball?" --a "Jordan" --p 3.00 --cat SPORTS');
  process.exit(1);
}
const category = (args.cat ?? "OPINION").toUpperCase();
const changePct = parseFloat(args.pct ?? "0");
const owner = args.owner ?? "0x9a…D8c";
const tags = (args.tags ?? "").split(",").map((t) => t.trim()).filter(Boolean);

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const date = new Date().toISOString().slice(0, 10);
const slug = question.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
const outDir = join(root, "out", "daily");
mkdirSync(outDir, { recursive: true });
const mp4 = join(outDir, `${date}-${slug}.mp4`);

const props = JSON.stringify({ question, answer, price, category, owner, changePct });
console.log(`▶ Rendering MarketOfTheDay → ${mp4}`);
execSync(`npx remotion render MarketOfTheDay "${mp4}" --props='${props.replace(/'/g, "'\\''")}'`, {
  cwd: root,
  stdio: "inherit",
});

// caption — hook + market + CTA, tags as invitation
const tagLine = tags.length ? `\n${tags.join(" ")} — settle it. 👇` : "";
const caption = `Market of the day: ${question}

"${answer}" holds the floor at $${price.toFixed(2)}. Disagree? Take the slot — the current owner gets paid 95% of your bid to leave, and every trade pays the minter 3%. Forever.${tagLine}

👉 app.opinionmarketcap.xyz

#Base #onchain`;

const captionPath = mp4.replace(/\.mp4$/, ".caption.txt");
writeFileSync(captionPath, caption);
console.log(`\n✓ Clip:    ${mp4}`);
console.log(`✓ Caption: ${captionPath}\n`);
console.log("--- caption ---\n" + caption);
