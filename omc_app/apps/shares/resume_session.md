# Session Resume Prompt

**Continue implementing the Claude API semantic similarity check and category expansion for the Answer Shares app.**

## What was decided
- Add AI-powered duplicate detection using Claude Haiku for both questions and answers
- Two-layer approach: keep existing Levenshtein (instant, local) + add Claude API (debounced, semantic)
- Expand categories from 18 to ~33 visible categories
- Server-side API route to protect the Anthropic API key

## Plan file
The full implementation plan is at: `/Users/axelroffi/.claude/plans/curried-humming-fairy.md`

## Implementation order (8 steps)
1. `npm install @anthropic-ai/sdk` in `apps/shares/`
2. Add `ANTHROPIC_API_KEY` to `apps/shares/.env.local`
3. **NEW**: `apps/shares/src/app/api/check-similarity/route.ts` — POST endpoint calling Claude Haiku to detect semantic duplicates (aliases like CR7/Ronaldo, rephrasing like "Goat of Soccer"/"Best soccer player ever")
4. **NEW**: `apps/shares/src/hooks/useSimilarityCheck.ts` — debounced (500ms) hook with AbortController, returns `{ similarItems, isChecking, hasExactMatch, hasHighMatch }`
5. **MODIFY**: `apps/shares/src/hooks/index.ts` — export new hook
6. **MODIFY**: `apps/shares/src/lib/contracts.ts` lines 562-584 — expand `ALL_CATEGORIES` with Science, Technology, Space, Food & Dining, Health & Fitness, Fashion, Travel, Education, Environment, History, Philosophy, Law. Unhide "Books & Literature" and "Podcasts"
7. **MODIFY**: `apps/shares/src/components/answers/ProposeAnswerModal.tsx` — add `useSimilarityCheck` alongside existing `findSimilarAnswers()`, show AI warnings, block on exact match
8. **MODIFY**: `apps/shares/src/app/create/page.tsx` — fetch existing questions via `useQuestions({ limit: 200 })`, add `useSimilarityCheck` for question text, add warning UI, block on exact match

## Key existing code
- `apps/shares/src/lib/utils.ts`: `findSimilarAnswers()`, `getSimilarityScore()` — keep as-is (Layer 1)
- `useQuestions()` returns `{ questions, totalQuestions, isLoading }` — `questions[].text` gives question texts
- ProposeAnswerModal already has duplicate warning UI (AlertTriangle) at 0.7 threshold — extend it
- Create page has NO duplicate detection currently
- Contract stores category as plain string (no on-chain validation) — only frontend list needs updating

## Start implementation from step 1. The plan was reviewed but not yet approved — present it briefly and begin.
