# Session Resume — V4 Self-Exit Feature

**Last session:** May 6, 2026 — V4 + V2 deployed to Base mainnet, frontend updated.

## Where we left off

Branch `feat/v4-self-exit` is pushed to GitHub. V4 contracts are LIVE on Base
mainnet but **feature flags are FALSE** (admin must enable manually).

The frontend `apps/web` references the new V4 addresses but **has not been
deployed yet** (no `vercel --prod` run).

## Live mainnet addresses (V4 + V2)

| Contract | Address |
|----------|---------|
| OpinionCoreV4 | `0xAdc44c00dc6A45B8776fDDBB1f977950838EafC1` |
| PoolManagerV2 | `0x34537a749F4b16E7542a59e5322338372A6a1E3c` |
| FeeManager | `0x5dc8502Db4ed7Fb3689703F5B8D4fa1F2bD305AA` |
| OpinionAdmin | `0x202Bc4E3aB50147212bee0506bF5f2B544333b5D` |
| OpinionExtensionsV2 | `0x2eD0DC454043A768cB3FA7e480c41Be7b8954394` |
| ValidationLibrary | `0x95a60C951BCB6E77644081f0501c9d2dDDfDb681` |
| PriceCalculator | `0xb6cEB6F62e929aC99068255AA3E380F01Ed69cB7` |
| SelfExitLib | `0x30c465f5772dc86555d37fE1376218Cbf79a4D93` |

Admin: `0x9786eDdf2f254d5B582DA45FD332Bf5769DB4D8C` (deployer == admin)

## What's done

- ✅ Contracts: OpinionCoreV4, PoolManagerV2, SelfExitLib written
- ✅ Tests: 75 passing across V4 + V2 (incl. reentrancy, upgrade migration, pool exit)
- ✅ Frontend hooks: `useOpinionLockStatus`, `useSelfExit`, `useReclaimSlot`, `usePoolStaleExit`
- ✅ Frontend UI: `SelfExitPanel`, `VacantSlotReclaimPanel`, `PoolStaleExitPanel` all wired into pages
- ✅ ABIs in `apps/web/src/lib/contracts-v4.ts`
- ✅ Deployed to Base mainnet (May 6, 2026)
- ✅ `apps/web/src/lib/contracts.ts` and `contracts-mainnet.ts` updated with new addresses

## What's NOT done (next session pickup points)

### Immediate / blocking
1. **Deploy the frontend** — `cd apps/web && vercel --prod` (or your hosting flow). Frontend currently shows OLD V3 contracts in production until redeployed.

### Before announcing the feature
2. **Live-test self-exit on mainnet** with shortened cooldown:
   ```
   opinionCore.setSelfExitParameter(0, 60)         // 60s cooldown
   opinionCore.setSelfExitFlag(0, true)             // enable selfExit
   opinionCore.setSelfExitFlag(1, true)             // enable reclaim
   poolManager.setStalePoolExitEnabled(true)        // enable pool exit
   ```
   Then create an opinion → wait 60s → self-exit → reclaim → verify everything.

3. **After validation, restore production cooldown**:
   ```
   opinionCore.setSelfExitParameter(0, 1209600)     // 14 days
   ```

4. **Verify implementation contracts on Basescan** (transparency):
   ```
   npx hardhat verify --network base 0xa5a47efc129ba25ec9066b6439684daa3e3df1e5
   # repeat for each impl + libraries
   ```

### Nice-to-have (deferred)
5. **Landing page copy update** (session 5 from the original plan) — update marketing pages to mention the new rescue feature.
6. **Opinion list badges** — small "rescue-enabled" / "vacant" tags on the main page cards.
7. **Mobile trading sheet vacant-state** — mobile UI doesn't yet handle the vacant-slot reclaim flow.
8. **Merge `feat/v4-self-exit` to `main`** when satisfied with mainnet behavior.

## Key files (what to read to get back into context)

- `omc_app/CLAUDE.md` — top of file has all current state
- `omc_app/contracts/active/OpinionCoreV4.sol` — V4 contract
- `omc_app/contracts/active/PoolManagerV2.sol` — V2 contract
- `omc_app/contracts/active/libraries/SelfExitLib.sol` — heavy V4 logic
- `omc_app/test/OpinionCoreV4.test.ts` — 50 V4 tests
- `omc_app/test/PoolManagerV2.test.ts` — 25 V2 tests
- `omc_app/scripts/deploy-v4-fresh.ts` + `deploy-v4-final.ts` + `deploy-v4-finish.ts` — what was run
- `omc_app/deployments/base-v4-fresh.json` — final address snapshot
- `omc_app/apps/web/src/hooks/use*.ts` (4 V4 hooks)
- `omc_app/apps/web/src/app/opinions/components/self-exit-panel.tsx` + `vacant-slot-reclaim-panel.tsx`
- `omc_app/apps/web/src/app/pools/[id]/components/PoolStaleExitPanel.tsx`

## V4 economics summary (α-vanilla)

- Creator pays `initialPrice + 2 USDC spamFee` at creation. The `initialPrice` is locked in the contract (recoverable on flip or self-exit).
- Self-exit refund: 80% of locked stake. 20% penalty splits 50/50 creator/platform.
- Vacant slot reclaim price: 50% of exiter's last entry, $2 floor.
- Pool exit windows: 21 days for >10% holders, 35 days for any contributor.

## Branch state

```
feat/v4-self-exit (pushed)
  b42e08c feat(deploy): V4 + V2 deployed to Base mainnet + frontend updated
  20a1e90 feat(deploy): lower MIN_COOLDOWN to 60s + fresh deploy script
  ccbe639 feat(web): finish V4 frontend — vacant-slot reclaim + pool dissolution UI
  bc0bbd5 feat(web): integrate V4 self-exit feature into the opinion page
  811289f feat(contracts): add PoolManagerV2 — pool stale-exit dissolution
  f2b0af2 test(security): add critical security tests
  46be034 test(contracts): add Hardhat test suite for OpinionCoreV4
  152cf7e feat(contracts): add OpinionCoreV4 + SelfExitLib
  5f97926 chore: remove Answer Shares experiment
```

To resume: `git checkout feat/v4-self-exit && git pull`. Read this file +
`CLAUDE.md`. You're back in context.
