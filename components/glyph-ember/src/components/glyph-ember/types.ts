import type { CSSProperties, ReactNode, Ref } from "react";

export const DEFAULTS = {
  colors: ["#7B3DFF", "#FF7AD9"] as [string, string],
  backgroundColor: "#0A0A0A",
  mode: "auto" as "auto" | "glow" | "ink",
  charset: " .,:;i!lI~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
  fontFamily:
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  glyphSize: 11,
  spacing: 1,
  height: 0.45,
  fuel: 1,
  turbulence: 0.6,
  wind: 0.15,
  flicker: 0.5,
  sparks: 0.5,
  smoke: 0.35,
  pulse: 0,
  speed: 1,
  glow: 0.35,
  intensity: 1,
  interactive: false,
  snuff: true,
  snuffRadius: 70,
  snuffStrength: 0.8,
  clickStoke: true,
  stokeStrength: 1,
  paused: false,
  quality: 1,
};

export type EmberSettings = typeof DEFAULTS;
export type EmberHandle = { stoke: (x: number) => void };
export type GlyphEmberProps = Partial<EmberSettings> & {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  ref?: Ref<EmberHandle>;
};
