/**
 * On-chain lane stills — StatCard + DailyPulse. One command = PNG + caption.
 *
 * Usage (from apps/marketing):
 *   npm run stat -- card --kind payout --value "$47.20" \
 *     --q "GOAT of basketball?" --a "Jordan" --detail "95% of the taker's bid — claimed onchain"
 *
 *   npm run stat -- pulse --volume "$1,240" --trades 87 \
 *     --topq "Best L2 to build on right now?" --payout "$47.20"
 *
 * card options:  --kind payout|surge|record|war|hot · --value (required)
 *                --caption (default per kind) · --q · --a · --detail
 * pulse options: --volume --trades --topq --payout (all required) · --date (default today)
 *
 * Output: out/stats/YYYY-MM-DD-<name>.png + .caption.txt
 */
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const [mode, ...rest] = process.argv.slice(2);
const args = {};
for (let i = 0; i < rest.length; i++) {
  if (rest[i].startsWith("--")) {
    const next = rest[i + 1];
    // boolean flag when no value follows (e.g. --video)
    args[rest[i].slice(2)] = next === undefined || next.startsWith("--") ? true : next;
  }
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const date = new Date().toISOString().slice(0, 10);
const outDir = join(root, "out", "stats");
mkdirSync(outDir, { recursive: true });

const render = (compId, name, props, video = false) => {
  const ext = video ? "mp4" : "png";
  const out = join(outDir, `${date}-${name}.${ext}`);
  const cmd = video ? "render" : "still";
  const json = JSON.stringify(props);
  console.log(`▶ Rendering ${compId} → ${out}`);
  execSync(`npx remotion ${cmd} ${compId} "${out}" --props='${json.replace(/'/g, "'\\''")}'`, {
    cwd: root,
    stdio: "inherit",
  });
  return out;
};

const CAPTIONS = {
  payout: (a) => `Someone just claimed ${a.value} — paid by the person who disagreed with them.\n\nHold the answer → get outbid → claim 95% of their bid. That's the game.`,
  surge: (a) => `${a.value} on "${a.q ?? "this market"}" 📈\n\nThe price only moves when the answer changes hands — and it keeps changing.`,
  record: (a) => `New record on OMC: ${a.value}.\n\nOpinions have a price. It keeps going up.`,
  war: (a) => `Bidding war on "${a.q ?? "this market"}" — the slot keeps flipping. Now ${a.value}.\n\nEvery flip pays the previous owner 95%.`,
  hot: (a) => `Born hot: "${a.q ?? "new market"}" is trading from minute one. Already ${a.value}.`,
};

let png;
let caption;

if (mode === "card") {
  if (!args.value) {
    console.error('Missing --value. Example:\n  npm run stat -- card --kind payout --value "$47.20" --q "GOAT of basketball?" --a "Jordan"');
    process.exit(1);
  }
  const kind = args.kind ?? "payout";
  const video = args.video === true;
  png = render(
    video ? "StatCardClip" : "StatCard",
    `${kind}-${(args.q ?? "stat").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30)}`,
    {
      kind,
      value: args.value,
      caption: args.caption ?? "",
      question: args.q ?? "",
      answer: args.a ?? "",
      detail: args.detail ?? "",
    },
    video,
  );
  caption = (CAPTIONS[kind] ?? CAPTIONS.payout)(args) + `\n\n👉 app.opinionmarketcap.xyz\n\n#Base #onchain`;
} else if (mode === "pulse") {
  const missing = ["volume", "trades", "topq", "payout"].filter((k) => !args[k]);
  if (missing.length) {
    console.error(`Missing --${missing.join(", --")}. Example:\n  npm run stat -- pulse --volume "$1,240" --trades 87 --topq "Best L2?" --payout "$47.20"`);
    process.exit(1);
  }
  const dateLabel =
    args.date ??
    new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  png = render("DailyPulse", "daily-pulse", {
    dateLabel,
    volume: args.volume,
    trades: String(args.trades),
    topMarket: args.topq,
    topPayout: args.payout,
  });
  caption = `Daily pulse — ${dateLabel}\n\n📊 ${args.volume} traded · ${args.trades} trades\n🔥 Hottest: "${args.topq}"\n💸 Top payout: ${args.payout}\n\nEvery trade pays the community 98%. 👉 app.opinionmarketcap.xyz\n\n#Base #onchain`;
} else {
  console.error("Usage: npm run stat -- card|pulse [options]  (see header of scripts/stat.mjs)");
  process.exit(1);
}

const captionPath = png.replace(/\.(png|mp4)$/, ".caption.txt");
writeFileSync(captionPath, caption);
console.log(`\n✓ Image:   ${png}`);
console.log(`✓ Caption: ${captionPath}\n`);
console.log("--- caption ---\n" + caption);
