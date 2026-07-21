import { execSync } from "node:child_process";

/** Renders the full explainer thread: 11 square concept clips + the combined cut. */
const clips = [
  "Concept01Idea",
  "Concept02Mint",
  "Concept03Fees",
  "Concept04Outbid",
  "Concept05Royalty",
  "Concept06Pricing",
  "Concept07SelfExit",
  "Concept08Reclaim",
  "Concept09Pools",
  "Concept10VsPoly",
  "Concept11Need",
  "Concept12CTA",
];

clips.forEach((id, i) => {
  const out = `out/thread/${String(i + 1).padStart(2, "0")}-${id}.mp4`;
  console.log(`\n▶ ${out}`);
  execSync(`npx remotion render ${id} ${out}`, { stdio: "inherit" });
});

console.log("\n▶ out/thread/00-ExplainerThread-full.mp4");
execSync(`npx remotion render ExplainerThread out/thread/00-ExplainerThread-full.mp4`, {
  stdio: "inherit",
});

console.log("\n✓ Thread rendered to apps/marketing/out/thread/");
