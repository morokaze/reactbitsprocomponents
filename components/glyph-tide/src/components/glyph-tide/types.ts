import type { CSSProperties, ReactNode } from "react";
export const DEFAULTS = {
  colors: ["#5227FF", "#FF9FFC"] as [string, string],
  backgroundColor: "#0a0a0a",
  characters: " .:~+*#%@",
  fontSize: 11,
  fontFamily:
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  scale: 1,
  level: 0.5,
  tideRange: 1,
  tidePeriod: 36,
  waves: 1,
  foam: 1,
  contours: 1,
  wetSand: 0.6,
  depthFade: 0.6,
  brightness: 1.8,
  speed: 1,
  seed: 0,
  paused: false,
  dpr: 2,
};
export type GlyphTideSettings = typeof DEFAULTS;
export type GlyphTideProps = Partial<GlyphTideSettings> & {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};
