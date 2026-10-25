"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { DEFAULTS, type GlyphTideProps, type GlyphTideSettings } from "./types";
import { clamp, smooth, terrain, waterLevel, swell } from "./field";

function normalize(props: GlyphTideProps): GlyphTideSettings {
  return {
    ...DEFAULTS,
    ...Object.fromEntries(
      Object.entries(props).filter(([, v]) => v !== undefined),
    ),
  };
}
function rgb(value: string, fallback: string): number[] {
  const raw = value.replace("#", "");
  if (!/^([a-f\d]{3}|[a-f\d]{6})$/i.test(raw)) return rgb(fallback, "#000000");
  const s =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16));
}
export default function GlyphTide(props: GlyphTideProps) {
  const root = useRef<HTMLDivElement>(null),
    canvas = useRef<HTMLCanvasElement>(null);
  const settings = useRef(normalize(props));
  const invalidate = useRef<(() => void) | null>(null);
  useEffect(() => {
    settings.current = normalize(props);
    invalidate.current?.();
  }, [props]);
  useEffect(() => {
    const el = root.current!,
      surface = canvas.current!,
      ctx = surface.getContext("2d", { alpha: true });
    if (!ctx) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let width = 1,
      height = 1,
      dpr = 1,
      cols = 0,
      rows = 0,
      dx = 1,
      dy = 1,
      dirty = true,
      visible = true;
    let clock = 0,
      last = performance.now(),
      frame = 0,
      geometryKey = "",
      atlasKey = "";
    let elevations = new Float32Array(0),
      wetness = new Float32Array(0);
    let atlas: HTMLCanvasElement | null = null,
      glyphs: string[] = [],
      tileW = 1,
      tileH = 1;
    let offsetX = 0,
      offsetY = 0;
    const update = () => {
      dirty = true;
    };
    invalidate.current = update;
    const resize = new ResizeObserver(([entry]) => {
      width = entry.contentRect.width;
      height = entry.contentRect.height;
      dirty = true;
    });
    resize.observe(el);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      last = performance.now();
      dirty = true;
    });
    observer.observe(el);
    const visibility = () => {
      last = performance.now();
      dirty = true;
    };
    document.addEventListener("visibilitychange", visibility);
    media.addEventListener("change", update);

    const rebuild = (p: GlyphTideSettings) => {
      const fontSize = clamp(p.fontSize, 7, 32);
      dpr = Math.min(devicePixelRatio || 1, clamp(p.dpr, 1, 3));
      const geom = [width, height, fontSize, p.scale, p.seed, dpr].join("|");
      if (geom !== geometryKey) {
        geometryKey = geom;
        dx = fontSize * 0.6;
        dy = fontSize * 1.2;
        cols = Math.ceil(width / dx);
        rows = Math.ceil(height / dy);
        offsetX = (width - (cols - 1) * dx) / 2;
        offsetY = (height - (rows - 1) * dy) / 2;
        surface.width = Math.max(1, Math.round(width * dpr));
        surface.height = Math.max(1, Math.round(height * dpr));
        elevations = new Float32Array(cols * rows);
        wetness = new Float32Array(cols * rows);
        const level = waterLevel(clock, p.level, p.tideRange, p.tidePeriod);
        for (let r = 0; r < rows; r++)
          for (let c = 0; c < cols; c++) {
            const i = r * cols + c,
              x = (offsetX + c * dx - width / 2) / height,
              y = (offsetY + r * dy) / height;
            elevations[i] = terrain(x, y, p.scale, p.seed);
            wetness[i] = elevations[i] < level ? 1 : 0;
          }
      }
      const key = [
        fontSize,
        p.fontFamily,
        p.characters,
        ...p.colors,
        p.backgroundColor,
        dpr,
      ].join("|");
      if (key !== atlasKey) {
        atlasKey = key;
        glyphs = Array.from(p.characters || " ");
        tileW = Math.ceil(fontSize * 1.3 * dpr);
        tileH = Math.ceil(fontSize * 1.6 * dpr);
        atlas = document.createElement("canvas");
        atlas.width = tileW * glyphs.length;
        atlas.height = tileH * 17;
        const a = atlas.getContext("2d")!;
        a.font = `${fontSize * dpr}px ${p.fontFamily}`;
        a.textAlign = "center";
        a.textBaseline = "middle";
        const water = rgb(p.colors[0], "#5227ff"),
          foam = rgb(p.colors[1], "#ff9ffc");
        const bg = rgb(p.backgroundColor, "#0a0a0a"),
          light = bg[0] * 0.2126 + bg[1] * 0.7152 + bg[2] * 0.0722 > 150;
        for (let band = 0; band < 17; band++) {
          const color =
            band === 16
              ? light
                ? [74, 70, 80]
                : [117, 110, 128]
              : water.map((v, i) => v + ((foam[i] - v) * band) / 15);
          a.fillStyle = `rgb(${color.map((v) => Math.round(v * (light ? 0.55 : 1))).join(",")})`;
          glyphs.forEach((char, i) =>
            a.fillText(char, (i + 0.5) * tileW, (band + 0.5) * tileH),
          );
        }
      }
    };
    const render = () => {
      const now = performance.now(),
        elapsed = Math.max(0, (now - last) / 1000);
      last = now;
      const p = settings.current;
      if (!visible || document.hidden || width < 1 || height < 1) return;
      const frozen = p.paused || p.speed === 0 || media.matches;
      if (!frozen) clock += elapsed * clamp(p.speed, 0, 4);
      if (!dirty && frozen) return;
      rebuild(p);
      dirty = false;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const sea = waterLevel(clock, p.level, p.tideRange, p.tidePeriod);
      const decay = Math.exp(-elapsed / Math.max(0.1, p.wetSand * 8));
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c,
            px = offsetX + c * dx,
            py = offsetY + r * dy,
            x = (px - width / 2) / height,
            y = py / height;
          const h = elevations[i],
            wave = swell(x, y, clock, p.scale) * p.waves;
          const depth = sea + wave - h;
          if (!frozen) {
            wetness[i] = depth > 0 ? 1 : wetness[i] * decay;
          }
          const phase =
            (y * 86) / Math.max(0.3, p.scale) +
            x * 3.2 -
            clock * 1.65 +
            Math.sin(x * 7.1 + clock * 0.16) * 0.7;
          const crest = Math.pow(0.5 + 0.5 * Math.sin(phase), 5);
          const breaking =
            0.7 + 0.3 * Math.sin(x * 17 + y * 31 - clock * 0.65) ** 2;
          const foam =
            Math.exp(-Math.abs(depth) / (0.009 + 0.009 * p.foam)) *
            breaking *
            clamp(p.foam, 0, 2);
          let density = 0,
            alpha = 0,
            band = 0;
          if (depth > 0) {
            const quiet = 1 - clamp(depth * 2.8) * clamp(p.depthFade);
            density = (0.26 + 0.17 * crest) * (quiet * 0.55 + 0.45);
            alpha = (0.42 + 0.35 * crest) * (quiet * 0.6 + 0.4);
          } else {
            const contourDistance = Math.abs(((h * 17) % 1) - 0.5);
            const contour =
              (1 - smooth(0.025, 0.07, contourDistance)) * p.contours;
            density = contour * 0.19;
            alpha = contour * 0.32;
            band = 16;
            if (p.wetSand > 0) {
              const wet =
                wetness[i] * p.wetSand * (1 - smooth(0, 0.15, -depth));
              density += wet * 0.1;
              alpha += wet * 0.13;
            }
          }
          if (foam > 0.05) {
            density = Math.max(density, foam * 0.77);
            alpha = Math.max(alpha, foam * 0.98);
            band = Math.round(clamp(foam * 1.7) * 15);
          }
          const index = Math.min(
            glyphs.length - 1,
            Math.floor(clamp(density) * glyphs.length),
          );
          if (!alpha || glyphs[index] === " ") continue;
          ctx.globalAlpha = clamp(alpha * p.brightness);
          ctx.drawImage(
            atlas!,
            index * tileW,
            band * tileH,
            tileW,
            tileH,
            px - tileW / dpr / 2,
            py - tileH / dpr / 2,
            tileW / dpr,
            tileH / dpr,
          );
        }
      ctx.globalAlpha = 1;
      el.dataset.frame = String(++frame);
      el.dataset.time = clock.toFixed(3);
      el.dataset.level = sea.toFixed(4);
      el.dataset.renderer = "canvas";
    };
    gsap.ticker.add(render);
    return () => {
      gsap.ticker.remove(render);
      resize.disconnect();
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      media.removeEventListener("change", update);
      invalidate.current = null;
      atlas = null;
    };
  }, []);
  return (
    <div
      ref={root}
      data-glyph-tide
      data-renderer="pending"
      className={`relative isolate overflow-hidden ${props.className ?? ""}`}
      style={{
        background: props.backgroundColor ?? DEFAULTS.backgroundColor,
        ...props.style,
      }}
    >
      <canvas
        ref={canvas}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 block h-full w-full"
      />
      {props.children}
    </div>
  );
}
export type { GlyphTideProps } from "./types";
