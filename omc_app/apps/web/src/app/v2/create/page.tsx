'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Stepper,
  Sticker,
  Chip,
  Btn,
  MonoNum,
  PriceSlider,
  CategoryFilter,
  WalletBtn,
  Wobble,
  popConfetti,
  type CategoryOption,
} from '@/components/poster-arcade';
import { CATEGORIES, CAT_MAP, fmtUSD, type CatKey } from '../_data/mock-takes';
import {
  CHAIN_CATEGORY_FOR_CAT,
  useCreateOpinionFlow,
  type CreateFlowPhase,
} from '../_lib/use-create-flow';

type Step = 0 | 1 | 2 | 3; // 3 = success

const QUESTION_MAX = 60;
const ANSWER_MAX = 60;
const DESCRIPTION_MAX = 120;

// V4 OpinionCore mint fee — flat anti-spam fee paid to treasury, in addition
// to the initialPrice that locks into the contract.
//   contract: contracts/active/OpinionCoreV4.sol:139,259,285
//   totalCost = initialPrice + spamFee
// Admin can update via setSelfExitParameter(8, …); current default = 2 USDC.
// (V3 used `MAX($1, 20% × initialPrice)` — that path no longer applies.)
const SPAM_FEE = 2;

const CAT_OPTS: CategoryOption[] = CATEGORIES.map((c) => ({
  key: c.key,
  emoji: c.emoji,
  label: c.label,
}));

/** Trim + ensure the question ends with a "?". V4 validator enforces this. */
function normalizeQuestion(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;
  return trimmed.endsWith('?') ? trimmed : `${trimmed}?`;
}

export default function CreatePage() {
  const [step, setStep] = useState<Step>(0);

  // form state
  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState<CatKey | null>(null);
  const [answer, setAnswer] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(25);

  const fee = SPAM_FEE;
  const total = price + fee;

  const canAdvance1 = question.trim().length >= 2 && category !== null;
  const canAdvance2 = answer.trim().length >= 2;

  /* ───────────── chain flow ───────────── */
  const flow = useCreateOpinionFlow(price);

  const handleMint = () => {
    if (!category) return;
    const chainCategory = CHAIN_CATEGORY_FOR_CAT[category];
    flow.submit({
      question: normalizeQuestion(question),
      answer: answer.trim(),
      description: description.trim(),
      initialPriceUSDC: price,
      categories: [chainCategory],
    });
  };

  // Success → step 3 (renders the celebration screen) + confetti + toast.
  useEffect(() => {
    if (flow.phase === 'success') {
      setStep(3);
      popConfetti({ x: 0.5, y: 0.4, count: 90, spread: 100 });
      setTimeout(() => popConfetti({ x: 0.2, y: 0.6, count: 40, spread: 70 }), 180);
      setTimeout(() => popConfetti({ x: 0.8, y: 0.6, count: 40, spread: 70 }), 360);
      toast.success('your take is on the wall 🔥', {
        description: flow.newOpinionId != null ? `take #${flow.newOpinionId} minted` : undefined,
      });
    }
  }, [flow.phase, flow.newOpinionId]);

  // Surface flow errors as toasts.
  useEffect(() => {
    if (flow.error) {
      const msg = (flow.error.message || 'transaction failed').split('\n')[0];
      toast.error('mint failed', { description: msg.slice(0, 180) });
    }
  }, [flow.error]);

  /* ───────── SUCCESS ───────── */
  if (step === 3) {
    return (
      <section className="px-4 md:px-10 py-16 flex flex-col items-center text-center">
        <p className="font-display text-[11px] font-extrabold tracking-[0.18em] uppercase text-ink/70">
          ★ MINTED
        </p>
        <h1 className="font-display font-black tracking-[-0.04em] leading-[0.95] text-[40px] md:text-[64px] mt-2 text-ink">
          Your take is on the wall. <span className="text-pop">🔥</span>
        </h1>
        {flow.newOpinionId != null && (
          <p className="font-display text-[12px] font-extrabold tracking-[0.14em] uppercase text-ink/60 mt-2">
            take #{flow.newOpinionId} · on Base mainnet
          </p>
        )}

        <div className="mt-8">
          <PreviewSticker
            question={normalizeQuestion(question)}
            answer={answer}
            category={category}
            price={price}
            tilt={-2}
            big
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
          {flow.newOpinionId != null && (
            <Btn href={`/v2/opinions/${flow.newOpinionId}`} variant="pop" size="lg" star>
              view your take →
            </Btn>
          )}
          <Btn href="/v2/portfolio" variant={flow.newOpinionId != null ? 'ghost' : 'pop'} size="lg" star={flow.newOpinionId == null}>
            go to my room
          </Btn>
          <Btn href="/v2/marketplace" variant="ghost" size="lg">
            see it on the floor →
          </Btn>
        </div>
      </section>
    );
  }

  /* ───────── WIZARD ───────── */
  return (
    <>
      {/* Breadcrumb */}
      <div className="px-4 md:px-10 pt-4 pb-1">
        <Link
          href="/v2"
          className="font-display text-[11px] font-extrabold tracking-[0.12em] uppercase text-ink/60 hover:text-ink"
        >
          ← back home
        </Link>
      </div>

      {/* Header */}
      <section className="px-4 md:px-10 pt-6 pb-4">
        <h1 className="font-display font-black tracking-[-0.04em] leading-[0.95] text-[40px] md:text-[56px] text-ink">
          MINT A BANGER.
        </h1>
        <p className="font-display font-semibold text-[13px] md:text-[14px] text-ink/70 mt-1">
          three quick steps. then it&apos;s on the wall.
        </p>
        <div className="mt-5">
          <Stepper steps={['question', 'answer', 'price']} current={step} />
        </div>
      </section>

      {/* Two-col body */}
      <section className="px-4 md:px-10 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-start">
        {/* LEFT — wizard step */}
        <div className="bg-paper border-[2.5px] border-ink rounded-sticker shadow-[5px_5px_0_var(--ink)] p-5 md:p-7">
          {step === 0 && (
            <Step1
              question={question}
              setQuestion={setQuestion}
              category={category}
              setCategory={setCategory}
              canAdvance={canAdvance1}
              onNext={() => setStep(1)}
            />
          )}
          {step === 1 && (
            <Step2
              answer={answer}
              setAnswer={setAnswer}
              description={description}
              setDescription={setDescription}
              canAdvance={canAdvance2}
              onBack={() => setStep(0)}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <Step3
              price={price}
              setPrice={setPrice}
              fee={fee}
              total={total}
              phase={flow.phase}
              onBack={() => setStep(1)}
              onApprove={() => flow.approve(flow.totalCostWei)}
              onMint={handleMint}
            />
          )}
        </div>

        {/* RIGHT — live preview */}
        <div className="lg:sticky lg:top-[80px]">
          <div className="font-display text-[10px] font-extrabold tracking-[0.14em] uppercase text-ink/50 mb-3 text-center lg:text-left">
            ⤵ live preview
          </div>
          <PreviewSticker
            question={question}
            answer={answer}
            category={category}
            price={price}
            tilt={-1.5}
          />
          <p className="font-display text-[11px] font-bold tracking-[0.04em] text-ink/65 mt-5 text-center lg:text-left">
            ★ You keep <span className="font-mono font-extrabold">3%</span> of every flip, forever. Even after they take it from you.
          </p>
        </div>
      </section>
    </>
  );
}

/* ─────────────────────────── STEPS ─────────────────────────── */

function Step1({
  question,
  setQuestion,
  category,
  setCategory,
  canAdvance,
  onNext,
}: {
  question: string;
  setQuestion: (v: string) => void;
  category: CatKey | null;
  setCategory: (k: CatKey) => void;
  canAdvance: boolean;
  onNext: () => void;
}) {
  const trimmed = question.trim();
  const needsQuestionMark = trimmed.length >= 2 && !trimmed.endsWith('?');

  return (
    <div>
      <StepEyebrow>1 · the question</StepEyebrow>
      <h2 className="font-display font-black text-[22px] md:text-[28px] tracking-tight mt-1">
        What&apos;s the question?
      </h2>

      <div className="mt-5">
        <Label>question</Label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value.slice(0, QUESTION_MAX))}
          rows={2}
          placeholder="e.g. GOAT basketball player?"
          aria-label="The question for your take"
          className="w-full bg-canvas border-2 border-ink rounded-lg px-3 py-2 font-display font-bold text-[18px] md:text-[20px] text-ink placeholder:text-ink/40 focus:outline-none focus:shadow-[3px_3px_0_var(--ink)] focus:-translate-x-[1px] focus:-translate-y-[1px] transition-all resize-none"
        />
        <div className="flex items-center justify-between text-[10px] font-mono font-extrabold text-ink/40 mt-1">
          <span>
            {needsQuestionMark ? "we'll add the ? for you" : ''}
          </span>
          <span>{question.length}/{QUESTION_MAX}</span>
        </div>
      </div>

      <div className="mt-5">
        <Label>category</Label>
        <CategoryFilter
          options={CAT_OPTS}
          value={category ?? ''}
          onChange={(k) => setCategory(k as CatKey)}
        />
      </div>

      <div className="flex justify-end items-center gap-3 mt-7">
        {!canAdvance && (
          <span className="font-display text-[10px] font-extrabold tracking-[0.12em] uppercase text-ink/50">
            {trimmed.length < 2 ? '· write a question ·' : '· pick a category ·'}
          </span>
        )}
        <Btn variant="pop" size="lg" onClick={onNext} disabled={!canAdvance} star>
          continue
        </Btn>
      </div>
    </div>
  );
}

function Step2({
  answer,
  setAnswer,
  description,
  setDescription,
  canAdvance,
  onBack,
  onNext,
}: {
  answer: string;
  setAnswer: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  canAdvance: boolean;
  onBack: () => void;
  onNext: () => void;
}) {
  const [showDescription, setShowDescription] = useState(description.length > 0);

  return (
    <div>
      <StepEyebrow>2 · the answer</StepEyebrow>
      <h2 className="font-display font-black text-[22px] md:text-[28px] tracking-tight mt-1">
        What&apos;s the answer?
      </h2>
      <p className="font-display text-[13px] font-semibold text-ink/65 mt-1">
        short. blunt. one word if you can.
      </p>

      <div className="mt-5">
        <Label>answer</Label>
        <input
          type="text"
          autoFocus
          value={answer}
          onChange={(e) => setAnswer(e.target.value.slice(0, ANSWER_MAX))}
          placeholder="JORDAN"
          aria-label="The answer you're proposing"
          className="w-full bg-canvas border-2 border-ink rounded-lg px-3 py-3 font-display font-black text-[28px] md:text-[36px] tracking-[-0.02em] text-ink uppercase placeholder:text-ink/40 placeholder:font-extrabold focus:outline-none focus:shadow-[3px_3px_0_var(--ink)] focus:-translate-x-[1px] focus:-translate-y-[1px] transition-all"
        />
        <div className="text-[10px] font-mono font-extrabold text-ink/40 text-right mt-1">
          {answer.length}/{ANSWER_MAX}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowDescription((v) => !v)}
        className="mt-4 font-display text-[10px] font-extrabold tracking-[0.12em] uppercase text-ink/55 hover:text-ink"
      >
        {showDescription ? '− hide description' : '+ add description (optional)'}
      </button>

      {showDescription && (
        <div className="mt-2">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, DESCRIPTION_MAX))}
            rows={2}
            placeholder="defend your take in one line"
            aria-label="Optional description for your take"
            className="w-full bg-canvas border-2 border-ink rounded-lg px-3 py-2 font-display font-semibold text-[13px] text-ink placeholder:text-ink/45 focus:outline-none focus:shadow-[3px_3px_0_var(--ink)] focus:-translate-x-[1px] focus:-translate-y-[1px] transition-all resize-none"
          />
          <div className="text-[10px] font-mono font-extrabold text-ink/40 text-right mt-1">
            {description.length}/{DESCRIPTION_MAX}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-7 gap-3 flex-wrap">
        <Btn variant="ghost" size="md" onClick={onBack}>
          ← back
        </Btn>
        <div className="flex items-center gap-3 ml-auto">
          {!canAdvance && (
            <span className="font-display text-[10px] font-extrabold tracking-[0.12em] uppercase text-ink/50">
              · write an answer (min 2 chars) ·
            </span>
          )}
          <Btn variant="pop" size="lg" onClick={onNext} disabled={!canAdvance} star>
            continue
          </Btn>
        </div>
      </div>
    </div>
  );
}

function Step3({
  price,
  setPrice,
  fee,
  total,
  phase,
  onBack,
  onApprove,
  onMint,
}: {
  price: number;
  setPrice: (n: number) => void;
  fee: number;
  total: number;
  phase: CreateFlowPhase;
  onBack: () => void;
  onApprove: () => void;
  onMint: () => void;
}) {
  return (
    <div>
      <StepEyebrow>3 · price it</StepEyebrow>
      <h2 className="font-display font-black text-[22px] md:text-[28px] tracking-tight mt-1">
        How brave are you feeling?
      </h2>
      <p className="font-display text-[13px] font-semibold text-ink/65 mt-1">
        higher floor · bigger stunt · juicier royalties.
      </p>

      <div className="mt-7 flex items-end justify-between gap-4">
        <div>
          <Label>your floor</Label>
          <div className="font-mono font-extrabold text-[48px] md:text-[56px] leading-none">
            {fmtUSD(price)}
          </div>
        </div>
        <div className="text-right">
          <Label>mint fee</Label>
          <MonoNum className="text-[20px] block">{fmtUSD(fee)}</MonoNum>
          <span className="font-display text-[10px] font-extrabold text-ink/50">
            flat · anti-spam
          </span>
        </div>
      </div>

      <div className="mt-5">
        <PriceSlider value={price} onChange={setPrice} min={1} max={100} />
      </div>

      <div className="mt-7 border-t-2 border-dashed border-ink/40 pt-4 space-y-1.5">
        <Row label="initial floor" value={fmtUSD(price)} />
        <Row label="+ mint fee"    value={fmtUSD(fee)} muted />
        <Row label="= total"       value={fmtUSD(total)} bold />
      </div>

      <div className="flex items-center justify-between mt-7 gap-3 flex-wrap">
        <Btn variant="ghost" size="md" onClick={onBack} disabled={phase === 'submitting' || phase === 'approving'}>
          ← back
        </Btn>
        <div className="flex-1 sm:flex-none">
          <MintAction
            phase={phase}
            total={total}
            onApprove={onApprove}
            onMint={onMint}
          />
        </div>
      </div>

      <MintHint phase={phase} total={total} />
    </div>
  );
}

/**
 * Phase-driven mint button — same slot cycles through connect / approve /
 * submit / etc. so the user only ever sees one primary CTA.
 */
function MintAction({
  phase,
  total,
  onApprove,
  onMint,
}: {
  phase: CreateFlowPhase;
  total: number;
  onApprove: () => void;
  onMint: () => void;
}) {
  if (phase === 'disconnected') {
    return <WalletBtn size="md" />;
  }
  if (phase === 'wrong-chain') {
    return <WalletBtn size="md" />;
  }
  if (phase === 'idle') {
    return (
      <div className="flex justify-end py-2">
        <Wobble>checking balance…</Wobble>
      </div>
    );
  }
  if (phase === 'insufficient') {
    return (
      <Btn variant="pop" size="lg" disabled className="w-full">
        NEED MORE USDC
      </Btn>
    );
  }
  if (phase === 'needs-approval') {
    return (
      <Btn variant="primary" size="lg" star onClick={onApprove} className="w-full">
        APPROVE USDC
      </Btn>
    );
  }
  if (phase === 'approving') {
    return (
      <Btn variant="primary" size="lg" disabled className="w-full">
        APPROVING…
      </Btn>
    );
  }
  if (phase === 'submitting') {
    return (
      <Btn variant="pop" size="lg" disabled className="w-full">
        MINTING…
      </Btn>
    );
  }
  // ready / success
  return (
    <Btn variant="pop" size="lg" onClick={onMint} star className="w-full">
      MINT THIS TAKE · <MonoNum>{fmtUSD(total)}</MonoNum>
    </Btn>
  );
}

function MintHint({ phase, total }: { phase: CreateFlowPhase; total: number }) {
  let hint = '';
  if (phase === 'insufficient') hint = `need ${fmtUSD(total)} USDC on Base mainnet`;
  else if (phase === 'needs-approval') hint = 'one-time USDC approval — then mint it';
  else if (phase === 'approving' || phase === 'submitting') hint = 'confirm in your wallet…';

  if (!hint) return null;
  return (
    <div className="text-[10px] font-display font-bold text-ink/60 mt-3 text-center">
      {hint}
    </div>
  );
}

/* ─────────────────────────── PREVIEW ─────────────────────────── */

function PreviewSticker({
  question,
  answer,
  category,
  price,
  tilt = -1.5,
  big = false,
}: {
  question: string;
  answer: string;
  category: CatKey | null;
  price: number;
  tilt?: number;
  big?: boolean;
}) {
  const cat = category ? CAT_MAP[category] : null;
  const heroBg =
    category === 'crypto'  ? 'cool'
  : category === 'ai'      ? 'pop'
  : category === 'sport'   ? 'canvas'
  : category === 'cinema'  ? 'paper'
  : category === 'food'    ? 'paper'
  : category === 'life'    ? 'canvas'
  : category === 'music'   ? 'pop'
  : category === 'founder' ? 'cool'
  : 'paper';
  const chipBg = heroBg === 'paper' || heroBg === 'canvas' ? 'ink' : 'paper';

  return (
    <Sticker bg={heroBg} tilt={tilt} shadow={6} className={big ? 'p-6 md:p-8 max-w-md mx-auto' : 'p-5'}>
      <div className="flex items-center justify-between">
        {cat ? (
          <Chip bg={chipBg}>{cat.emoji} {cat.label}</Chip>
        ) : (
          <span className="font-display text-[10px] font-extrabold tracking-[0.14em] uppercase opacity-50">
            no category yet
          </span>
        )}
        <Chip bg="ink" sm>NEW</Chip>
      </div>
      <div className="font-display text-[12px] md:text-[13px] font-bold italic opacity-85 mt-3 min-h-[1.5em]">
        &ldquo;{question || 'your question here'}&rdquo;
      </div>
      <div className={(big ? 'text-[56px] md:text-[80px]' : 'text-[40px] md:text-[56px]') + ' font-display font-black leading-[0.9] tracking-[-0.04em] mt-1 break-words'}>
        {(answer || 'YOUR ANSWER').toUpperCase()}.
      </div>
      <div className="flex justify-between items-baseline mt-4">
        <span className="font-display text-[10px] font-extrabold tracking-[0.12em] uppercase opacity-70">
          held by you
        </span>
        <MonoNum className={big ? 'text-[24px]' : 'text-[18px]'}>{fmtUSD(price)}</MonoNum>
      </div>
    </Sticker>
  );
}

/* ─────────────────────────── helpers ─────────────────────────── */

function StepEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-display text-[11px] font-extrabold tracking-[0.18em] uppercase text-pop">
      {children}
    </p>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-display text-[10px] font-extrabold tracking-[0.14em] uppercase text-ink/60 mb-1.5">
      {children}
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  muted,
}: {
  label: string;
  value: string;
  bold?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={
          'font-display text-[11px] font-bold tracking-[0.04em] uppercase ' +
          (muted ? 'text-ink/50' : 'text-ink/80')
        }
      >
        {label}
      </span>
      <MonoNum className={(bold ? 'text-[18px]' : 'text-[13px]') + ' ' + (muted ? 'text-ink/60' : 'text-ink')}>
        {value}
      </MonoNum>
    </div>
  );
}
