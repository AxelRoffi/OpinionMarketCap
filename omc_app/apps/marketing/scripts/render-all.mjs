import { execSync } from "node:child_process";

/** Render every marketing asset in every format we ship. */
const jobs = [
  ["HeroExplainer", "out/hero-explainer.mp4"],
  ["OutbidShort", "out/outbid-short.mp4"],
  ["PriceLoop", "out/price-loop.mp4"],
  ["PriceLoop", "out/price-loop.gif"],
  ["LogoSting", "out/logo-sting.mp4"],
  ["LogoStingVertical", "out/logo-sting-vertical.mp4"],
];

for (const [id, out] of jobs) {
  console.log(`\n▶ Rendering ${id} → ${out}`);
  execSync(`npx remotion render ${id} ${out}`, { stdio: "inherit" });
}
console.log("\n✓ All marketing assets rendered to apps/marketing/out/");
