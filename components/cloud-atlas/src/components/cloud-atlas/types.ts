import type { CSSProperties, ReactNode } from "react";
export interface CloudAtlasProps {
  colors?: [string, string];
  backgroundColor?: string;
  anchor?: "bottom" | "top";
  height?: number;
  coverage?: number;
  density?: number;
  scale?: number;
  towers?: number;
  opacity?: number;
  wind?: number;
  billow?: number;
  rise?: number;
  speed?: number;
  resolution?: number;
  interactive?: boolean;
  cursorStrength?: number;
  cursorRadius?: number;
  seed?: number;
  paused?: boolean;
  respectReducedMotion?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}
export const DEFAULTS = {
  colors: ["#6D5BC0", "#3A2E7A"] as [string, string],
  backgroundColor: "#0a0a0a",
  anchor: "bottom" as "bottom" | "top",
  height: 0.9,
  coverage: 0.45,
  density: 0.55,
  scale: 1,
  towers: 1,
  opacity: 0.7,
  wind: 0,
  billow: 1,
  rise: 1,
  speed: 1,
  resolution: 0.36,
  interactive: true,
  cursorStrength: 1,
  cursorRadius: 0.16,
  seed: 0,
  paused: false,
  respectReducedMotion: true,
};
export type CloudSettings = typeof DEFAULTS;
