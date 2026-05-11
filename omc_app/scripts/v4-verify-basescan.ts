// Verifies all V4 + V2 implementations and libraries on Basescan.
// Run: npx hardhat run scripts/v4-verify-basescan.ts --network base
import { run } from "hardhat";

const VALIDATION_LIB = "0x95a60C951BCB6E77644081f0501c9d2dDDfDb681";
const PRICE_CALC = "0xb6cEB6F62e929aC99068255AA3E380F01Ed69cB7";
const SELF_EXIT_LIB = "0x30c465f5772dc86555d37fE1376218Cbf79a4D93";

const FEE_MANAGER_IMPL = "0xBC2cc09AfB1c5fB47d40BF8860416FA7Be9804e6";
const POOL_MANAGER_V2_IMPL = "0x2cb3b0b143d9155db3b007d90b20cecc1af69cdf";
const OPINION_ADMIN_IMPL = "0x297a71b4e4d5dcc0d8d69995091b50359ca08fb7";
const OPINION_EXTENSIONS_V2_IMPL = "0xd20C3d839C40A27327936224eE8912398b19A9C4";
const OPINION_CORE_V4_IMPL = "0xa5a47efc129ba25ec9066b6439684daa3e3df1e5";

type Job = {
  label: string;
  address: string;
  contract?: string;
  libraries?: Record<string, string>;
};

const JOBS: Job[] = [
  { label: "ValidationLibrary", address: VALIDATION_LIB, contract: "contracts/active/libraries/ValidationLibrary.sol:ValidationLibrary" },
  { label: "PriceCalculator", address: PRICE_CALC, contract: "contracts/active/libraries/PriceCalculator.sol:PriceCalculator" },
  { label: "SelfExitLib", address: SELF_EXIT_LIB, contract: "contracts/active/libraries/SelfExitLib.sol:SelfExitLib", libraries: { ValidationLibrary: VALIDATION_LIB } },
  { label: "FeeManager (impl)", address: FEE_MANAGER_IMPL, contract: "contracts/active/FeeManager.sol:FeeManager" },
  { label: "OpinionAdmin (impl)", address: OPINION_ADMIN_IMPL, contract: "contracts/active/OpinionAdmin.sol:OpinionAdmin" },
  { label: "OpinionExtensionsV2 (impl)", address: OPINION_EXTENSIONS_V2_IMPL, contract: "contracts/active/OpinionExtensionsV2.sol:OpinionExtensionsV2" },
  { label: "PoolManagerV2 (impl)", address: POOL_MANAGER_V2_IMPL, contract: "contracts/active/PoolManagerV2.sol:PoolManagerV2", libraries: { ValidationLibrary: VALIDATION_LIB } },
  { label: "OpinionCoreV4 (impl)", address: OPINION_CORE_V4_IMPL, contract: "contracts/active/OpinionCoreV4.sol:OpinionCoreV4", libraries: { ValidationLibrary: VALIDATION_LIB, PriceCalculator: PRICE_CALC, SelfExitLib: SELF_EXIT_LIB } },
];

async function main() {
  const results: { label: string; status: string; note?: string }[] = [];

  for (const job of JOBS) {
    console.log(`\n──── ${job.label} @ ${job.address}`);
    try {
      await run("verify:verify", {
        address: job.address,
        constructorArguments: [],
        contract: job.contract,
        libraries: job.libraries,
      });
      results.push({ label: job.label, status: "✅ verified" });
    } catch (err: any) {
      const msg = String(err?.message ?? err);
      if (/already verified/i.test(msg) || /Already Verified/i.test(msg)) {
        results.push({ label: job.label, status: "✅ already verified" });
      } else {
        results.push({ label: job.label, status: "❌ failed", note: msg.split("\n")[0] });
      }
    }
  }

  console.log("\n\n════ Summary ════");
  for (const r of results) {
    console.log(`${r.status}  ${r.label}${r.note ? `  — ${r.note}` : ""}`);
  }
  const failed = results.filter((r) => r.status.startsWith("❌"));
  if (failed.length > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
