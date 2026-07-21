import React from "react";
import { Composition } from "remotion";
import { HeroExplainer } from "./compositions/HeroExplainer";
import { OutbidShort } from "./compositions/OutbidShort";
import { PriceLoop } from "./compositions/PriceLoop";
import { LogoSting } from "./compositions/LogoSting";
import {
  CONCEPT_CLIPS,
  CONCEPT_DURATION,
  ExplainerThread,
} from "./compositions/Concepts";
import { XAvatar, XBanner } from "./compositions/XAssets";
import { MarketOfTheDay } from "./compositions/MarketOfTheDay";
import { StatCard, StatCardClip, DailyPulse } from "./compositions/StatCards";

const FPS = 30;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="HeroExplainer"
        component={HeroExplainer}
        durationInFrames={710}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="OutbidShort"
        component={OutbidShort}
        durationInFrames={390}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="PriceLoop"
        component={PriceLoop}
        durationInFrames={300}
        fps={FPS}
        width={1080}
        height={1080}
      />
      <Composition
        id="LogoSting"
        component={LogoSting}
        durationInFrames={75}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="LogoStingVertical"
        component={LogoSting}
        durationInFrames={75}
        fps={FPS}
        width={1080}
        height={1920}
      />

      {/* Explainer thread — one square clip per concept (one tweet each) */}
      {CONCEPT_CLIPS.map(({ id, Component }) => (
        <Composition
          key={id}
          id={id}
          component={Component}
          durationInFrames={CONCEPT_DURATION}
          fps={FPS}
          width={1080}
          height={1080}
        />
      ))}

      {/* Whole thread chained into one ~2min video */}
      <Composition
        id="ExplainerThread"
        component={ExplainerThread}
        durationInFrames={CONCEPT_DURATION * CONCEPT_CLIPS.length}
        fps={FPS}
        width={1080}
        height={1080}
      />

      {/* Daily parameterized clip — override via --props (see scripts/daily.mjs) */}
      <Composition
        id="MarketOfTheDay"
        component={MarketOfTheDay}
        durationInFrames={300}
        fps={FPS}
        width={1080}
        height={1080}
        defaultProps={{
          question: "GOAT of basketball?",
          answer: "Jordan",
          price: 3,
          category: "SPORTS",
          owner: "0x9a…D8c",
          changePct: 0,
        }}
      />

      {/* Static social images (render via `remotion still`) */}
      <Composition id="XAvatar" component={XAvatar} durationInFrames={1} fps={FPS} width={400} height={400} />
      <Composition id="XBanner" component={XBanner} durationInFrames={1} fps={FPS} width={1500} height={500} />

      {/* On-chain lane stills — override via --props (see scripts/stat.mjs) */}
      <Composition
        id="StatCard"
        component={StatCard}
        durationInFrames={1}
        fps={FPS}
        width={1080}
        height={1080}
        defaultProps={{
          kind: "payout",
          value: "$47.20",
          caption: "",
          question: "GOAT of basketball?",
          answer: "Jordan",
          detail: "95% of the taker's bid — claimed onchain",
        }}
      />
      <Composition
        id="StatCardClip"
        component={StatCardClip}
        durationInFrames={180}
        fps={FPS}
        width={1080}
        height={1080}
        defaultProps={{
          kind: "record",
          value: "$180.00",
          caption: "",
          question: "GOAT of basketball?",
          answer: "Jordan",
          detail: "Biggest single payout so far",
        }}
      />
      <Composition
        id="DailyPulse"
        component={DailyPulse}
        durationInFrames={1}
        fps={FPS}
        width={1080}
        height={1080}
        defaultProps={{
          dateLabel: "Mon, Jul 7",
          volume: "$1,240",
          trades: "87",
          topMarket: "Best L2 to build on right now?",
          topPayout: "$47.20",
        }}
      />
    </>
  );
};
