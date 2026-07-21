import React from "react";
import { Audio, interpolate, Sequence, staticFile, useVideoConfig } from "remotion";
import { resolveAudio } from "../audio-config";

/** Looping music bed with auto fade-in / fade-out. */
export const MusicBed: React.FC<{ volume?: number; src?: string }> = ({
  volume = 0.28,
  src = "music-modern.wav",
}) => {
  const { durationInFrames } = useVideoConfig();
  return (
    <Audio
      loop
      src={staticFile(resolveAudio(src))}
      volume={(f) =>
        interpolate(
          f,
          [0, 10, durationInFrames - 20, durationInFrames],
          [0, volume, volume, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        )
      }
    />
  );
};

/** One-shot sound effect fired at frame `at` (relative to current sequence). */
export const Sfx: React.FC<{
  src: string;
  at: number;
  volume?: number;
  durationInFrames?: number;
}> = ({ src, at, volume = 0.8, durationInFrames = 120 }) => (
  <Sequence from={at} durationInFrames={durationInFrames} layout="none">
    <Audio src={staticFile(resolveAudio(src))} volume={volume} />
  </Sequence>
);
