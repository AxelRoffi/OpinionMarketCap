import React from "react";
import { AbsoluteFill, Series } from "remotion";
import { COLORS } from "../brand";
import { ConceptFrame } from "../components/ConceptFrame";
import { MusicBed } from "../components/audio";
import {
  VisCTA,
  VisFeeSplit,
  VisMint,
  VisOutbid,
  VisPools,
  VisPriceRegimes,
  VisReclaim,
  VisRoyalty,
  VisSelfExit,
  VisVsPolymarket,
  VisWhatIsOMC,
  VisWhatYouNeed,
} from "../components/concept-visuals";

const pop = (s: React.ReactNode) => <span style={{ color: COLORS.pop }}>{s}</span>;

export type Concept = {
  id: string;
  eyebrow: string;
  title: React.ReactNode;
  tagline: React.ReactNode;
  soon?: boolean;
  Visual: React.FC;
};

/** The full explainer thread — one entry = one tweet/clip. */
export const CONCEPTS: Concept[] = [
  { id: "Concept01Idea", eyebrow: "The big idea", title: <>A market for {pop("opinions")} — not bets.</>, tagline: "The price is the answer.", Visual: VisWhatIsOMC },
  { id: "Concept02Mint", eyebrow: "Anyone can mint", title: <>Anyone turns a question into a {pop("market")}.</>, tagline: "Mint once. Earn forever.", Visual: VisMint },
  { id: "Concept03Fees", eyebrow: "The money split", title: <>Every trade splits {pop("95/3/2")}.</>, tagline: "98% stays in the community.", Visual: VisFeeSplit },
  { id: "Concept04Outbid", eyebrow: "Get paid", title: <>Outbid? They {pop("pay you")} to leave.</>, tagline: "95% — yours to claim.", Visual: VisOutbid },
  { id: "Concept05Royalty", eyebrow: "Creator royalties", title: <>You keep {pop("3%")} — forever.</>, tagline: "Your question pays you — forever.", Visual: VisRoyalty },
  { id: "Concept06Pricing", eyebrow: "Dynamic pricing", title: <>Prices move like a {pop("real market")}.</>, tagline: "−20% to +80%. Not a fixed bump.", Visual: VisPriceRegimes },
  { id: "Concept07SelfExit", eyebrow: "Self-exit", soon: true, title: <>Leave on your {pop("own terms")}.</>, tagline: "Exit anytime — your stake, minus 20%.", Visual: VisSelfExit },
  { id: "Concept08Reclaim", eyebrow: "Reclaim", soon: true, title: <>Grab a vacant slot at {pop("half price")}.</>, tagline: "−50%, min $2.", Visual: VisReclaim },
  { id: "Concept09Pools", eyebrow: "Pools", title: <>Team up. {pop("Split the wins")}.</>, tagline: "Many small wallets beat one whale.", Visual: VisPools },
  { id: "Concept10VsPoly", eyebrow: "OMC vs Polymarket", title: <>Why this beats {pop("prediction markets")}.</>, tagline: "100M+ markets. Day one.", Visual: VisVsPolymarket },
  { id: "Concept11Need", eyebrow: "Before you start", title: <>What you need to {pop("trade")}.</>, tagline: "Two tokens. One network. Go.", Visual: VisWhatYouNeed },
  { id: "Concept12CTA", eyebrow: "Get in", title: <>Take a stand. {pop("Get paid for it.")}</>, tagline: "Live on Base.", Visual: VisCTA },
];

export const CONCEPT_DURATION = 330; // 11s @ 30fps per clip

/** A single concept clip (standalone tweet). */
export const ConceptClip: React.FC<{ concept: Concept; index: number; playMusic?: boolean }> = ({
  concept,
  index,
  playMusic = true,
}) => {
  const { Visual } = concept;
  return (
    <ConceptFrame
      index={index + 1}
      total={CONCEPTS.length}
      eyebrow={concept.eyebrow}
      title={concept.title}
      tagline={concept.tagline}
      soon={concept.soon}
      playMusic={playMusic}
    >
      <Visual />
    </ConceptFrame>
  );
};

/** Stable, prop-less component per concept — safe to register directly. */
export const CONCEPT_CLIPS: { id: string; Component: React.FC }[] = CONCEPTS.map(
  (c, i) => ({
    id: c.id,
    Component: () => <ConceptClip concept={c} index={i} />,
  }),
);

/** The whole thread chained into one long video (≈2 min). */
export const ExplainerThread: React.FC = () => (
  <AbsoluteFill>
    <MusicBed volume={0.2} />
    <Series>
      {CONCEPTS.map((c, i) => (
        <Series.Sequence key={c.id} durationInFrames={CONCEPT_DURATION}>
          <ConceptClip concept={c} index={i} playMusic={false} />
        </Series.Sequence>
      ))}
    </Series>
  </AbsoluteFill>
);
