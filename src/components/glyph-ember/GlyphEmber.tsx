'use client';

import { useEffect, useImperativeHandle, useRef } from 'react';
import { gsap } from 'gsap';
import { b, c, h, n, p, r } from './math';
import { DEFAULTS, type EmberSettings, type GlyphEmberProps } from './types';

function f(props: GlyphEmberProps): EmberSettings {
  return { ...DEFAULTS, ...Object.fromEntries(Object.entries(props).filter(([, value]) => value !== undefined)) };
}

export default function GlyphEmber(props: GlyphEmberProps) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const settings = useRef(f(props));
  const update = useRef<(() => void) | null>(null);
  const stoke = useRef<((x: number) => void) | null>(null);

  useEffect(() => {
    settings.current = f(props);
    update.current?.();
  }, [props]);

  useImperativeHandle(props.ref, () => ({ stoke: x => stoke.current?.(x) }), []);

  useEffect(() => {
    const el = root.current!;
    const surface = canvas.current!;
    const ctx = surface.getContext('2d');
    if (!ctx) {
      return;
    }
    const layer = document.createElement('canvas');
    const lc = layer.getContext('2d')!;
    const atlas = document.createElement('canvas');
    const ac = atlas.getContext('2d', { willReadFrequently: true })!;
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    let width = 1;
    let height = 1;
    let ratio = 1;
    let time = 0;
    let last = performance.now();
    let dirty = true;
    let visible = true;
    let key = '';
    let geometry = '';
    let glyphs: string[] = [];
    let tileW = 1;
    let tileH = 1;
    let frame = 0;
    let cols = 1;
    let rows = 1;
    let damp = new Float32Array(1);
    const pointer = { x: -10000, y: -10000 };
    let bursts: { x: number; time: number; strength: number }[] = [];

    const up = () => {
      dirty = true;
    };
    const vs = () => {
      last = performance.now();
      dirty = true;
    };
    const sk = (x: number) => {
      const s = settings.current;
      if (s.paused || media.matches) {
        return;
      }
      bursts.push({ x: c(x), time, strength: c(s.stokeStrength, 0, 3) });
      bursts = bursts.slice(-12);
      dirty = true;
    };
    const mv = (e: PointerEvent) => {
      if (!settings.current.interactive) {
        return;
      }
      const rect = el.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    };
    const lv = () => {
      pointer.x = -10000;
      pointer.y = -10000;
    };
    const ck = (e: MouseEvent) => {
      const s = settings.current;
      if (s.interactive && s.clickStoke) {
        const rect = el.getBoundingClientRect();
        sk((e.clientX - rect.left) / rect.width);
      }
    };
    const ro = new ResizeObserver(([entry]) => {
      width = entry.contentRect.width;
      height = entry.contentRect.height;
      dirty = true;
    });
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      vs();
    });
    ro.observe(el);
    io.observe(el);
    update.current = up;
    stoke.current = sk;
    el.addEventListener('pointermove', mv, { passive: true });
    el.addEventListener('pointerleave', lv);
    el.addEventListener('pointercancel', lv);
    el.addEventListener('click', ck);
    media.addEventListener('change', up);
    document.addEventListener('visibilitychange', vs);

    const at = (s: EmberSettings) => {
      const size = c(s.glyphSize, 6, 32);
      ratio = Math.min(devicePixelRatio || 1, 2) * c(s.quality, 0.25, 1);
      const g = [width, height, size, s.spacing, ratio].join('|');
      if (g !== geometry) {
        geometry = g;
        surface.width = layer.width = Math.max(1, Math.round(width * ratio));
        surface.height = layer.height = Math.max(1, Math.round(height * ratio));
        cols = Math.ceil(width / (size * 0.6 * c(s.spacing, 0.6, 3)));
        rows = Math.ceil(height / size);
        damp = new Float32Array(cols * rows);
      }
      const k = [size, ratio, s.fontFamily, s.charset, ...s.colors].join('|');
      if (key === k) {
        return;
      }
      key = k;
      const chars = [...new Set(Array.from(s.charset || ' '))].slice(0, 128);
      tileW = Math.ceil(size * 1.25 * ratio);
      tileH = Math.ceil(size * 1.5 * ratio);
      atlas.width = tileW * chars.length;
      atlas.height = tileH;
      ac.font = `${size * ratio * 0.9}px ${s.fontFamily}`;
      ac.textAlign = 'center';
      ac.textBaseline = 'middle';
      ac.fillStyle = '#ffffff';
      const weights = chars.map((char, i) => {
        ac.fillText(char, (i + 0.5) * tileW, tileH / 2);
        const pixels = ac.getImageData(i * tileW, 0, tileW, tileH).data;
        let total = 0;
        for (let j = 3; j < pixels.length; j += 4) {
          total += pixels[j];
        }
        return { char, total };
      });
      glyphs = weights.sort((a, b) => a.total - b.total).map(x => x.char);
      atlas.height = tileH * 65;
      ac.font = `${size * ratio * 0.9}px ${s.fontFamily}`;
      ac.textAlign = 'center';
      ac.textBaseline = 'middle';
      const colors = [...p(s.colors[0], s.colors[1]), [110, 106, 121]];
      colors.forEach((color, j) => {
        ac.fillStyle = `rgb(${color.join(',')})`;
        glyphs.forEach((char, i) => {
          ac.fillText(char, (i + 0.5) * tileW, (j + 0.5) * tileH);
        });
      });
    };

    const dr = () => {
      const now = performance.now();
      const dt = Math.max(0, (now - last) / 1000);
      last = now;
      if (!visible || document.hidden || width < 1 || height < 1) {
        return;
      }
      const s = settings.current;
      const frozen = s.paused || media.matches || s.speed === 0;
      const elapsed = frozen ? 0 : dt * c(s.speed, 0, 3);
      if (!frozen) {
        time += elapsed;
      }
      if (frozen && !dirty) {
        return;
      }
      at(s);
      dirty = false;
      bursts = bursts.filter(z => time - z.time < 3.5);
      const bg = r(s.backgroundColor);
      const ink = s.mode === 'ink' || (s.mode === 'auto' && bg[0] * 0.2126 + bg[1] * 0.7152 + bg[2] * 0.0722 > 0.55);
      const size = c(s.glyphSize, 6, 32);
      const dx = size * 0.6 * c(s.spacing, 0.6, 3);
      const dy = size;
      const fuel = c(s.fuel, 0, 2) * (1 + s.pulse * Math.sin(time * 0.8) * 0.23);
      const draft = s.wind * 0.45 + Math.sin(time * 0.37) * 0.065;
      const flameHeight = c(s.height, 0.1, 1.1);
      lc.setTransform(ratio, 0, 0, ratio, 0, 0);
      lc.clearRect(0, 0, width, height);
      const dw = tileW / ratio;
      const dh = tileH / ratio;
      for (let row = 0; row < rows; row++) {
        const py = height - (row + 0.5) * dy;
        const y = (height - py) / height;
        for (let col = 0; col < cols; col++) {
          const px = (col + 0.5) * dx;
          const x = px / height;
          const i = row * cols + col;
          const warp = (b(x * 3.4 + 2.1, y * 3.8 - time * 0.36) - 0.5) * s.turbulence;
          const wx = x - y * draft + warp * y * 1.3;
          const noise = b(wx * 6.2, y * 2.8 - time * 0.65);
          const bed = Math.exp(-y * 18) * (0.04 + n(x * 17, time * 1.2) * 0.08);
          let heat = (1 - Math.pow(y / flameHeight, 0.56) + (noise - 0.44) * 1.9 + bed) * fuel;
          for (const z of bursts) {
            const age = time - z.time;
            heat += Math.exp(-((px / width - z.x) ** 2) / 0.006) * Math.exp(-age * 1.6) * z.strength * (0.9 + y);
          }
          if (!frozen) {
            const distance = ((px - pointer.x) ** 2 + (py - pointer.y) ** 2) / Math.max(1, s.snuffRadius ** 2);
            const target = s.interactive && s.snuff ? Math.exp(-distance * 1.8) * c(s.snuffStrength) : 0;
            damp[i] += (target - damp[i]) * (1 - Math.exp(-elapsed * (target > damp[i] ? 12 : 2.5)));
          }
          heat = Math.max(heat, Math.exp(-y * 14) * fuel);
          heat *= 1 - damp[i] * 1.2;
          heat = c(heat - h(col, row + Math.floor(time * 8)) * 0.14);
          const smoke = c((noise - 0.48) * 2) * c(y / flameHeight) * s.smoke * 0.3 + damp[i] * 0.25;
          if (heat < 0.035 && smoke < 0.035) {
            continue;
          }
          const flicker = (h(col + Math.floor(time * (3 + s.flicker * 12)), row) - 0.5) * s.flicker * 0.55;
          const density = c(Math.max(heat, smoke * 0.7) + flicker);
          const char = Math.max(0, Math.min(glyphs.length - 1, Math.floor(density * (glyphs.length - 1))));
          const smokeOnly = heat < 0.08;
          const band = smokeOnly ? 64 : Math.round(c(heat * 0.89 + Math.exp(-y * 65) * 0.15) * 63);
          const alpha = smokeOnly ? smoke : Math.pow(heat, 0.4) * (ink ? 0.8 : 1);
          lc.globalAlpha = c(alpha * s.intensity);
          lc.drawImage(atlas, char * tileW, band * tileH, tileW, tileH, px - dw / 2, py - dh / 2, dw, dh);
        }
      }
      lc.globalAlpha = 1;
      lc.font = `${size * 0.9}px ${s.fontFamily}`;
      lc.textAlign = 'center';
      lc.textBaseline = 'middle';
      lc.fillStyle = s.colors[1];
      lc.shadowColor = s.colors[1];
      lc.shadowBlur = ink ? 0 : 5 + s.glow * 10;
      const sp = (id: number, age: number, life: number, x: number, force: number) => {
        const t = age / life;
        if (t < 0 || t > 1) {
          return;
        }
        const px = x * width + (Math.sin(age * 1.8 + id) * 12 + draft * age * 38) * t;
        const py = height * (1 - t * (0.65 + h(id, 7) * 0.45));
        lc.globalAlpha = c(Math.sin(Math.PI * t) * (0.8 + h(id, 13) * 0.8) * s.intensity * force);
        lc.fillText(h(id, 23) > 0.3 ? '+' : '·', px, py);
      };
      const count = Math.round(width / 9 * c(s.sparks) * Math.min(1, fuel));
      for (let i = 0; i < count; i++) {
        const life = 3.4 + h(i, 4) * 3.2;
        const phase = time + h(i, 5) * life;
        const cycle = Math.floor(phase / life);
        sp(i, phase % life, life, h(i + cycle * 79, 8), Math.min(1, fuel));
      }
      for (const z of bursts) {
        const age = time - z.time;
        for (let i = 0; i < 36 * z.strength; i++) {
          sp(i + z.time, age, 1.4 + h(i, 21) * 1.8, z.x + (h(i, 31) - 0.5) * 0.14, 1);
        }
      }
      lc.globalAlpha = 1;
      lc.shadowBlur = 0;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, surface.width, surface.height);
      if (!ink && s.glow > 0) {
        const tint = r(s.colors[0]).map(v => Math.round(v * 255));
        const haze = ctx.createLinearGradient(0, surface.height, 0, surface.height * 0.4);
        haze.addColorStop(0, `rgba(${tint.join(',')},${c(s.glow * 0.46 * fuel)})`);
        haze.addColorStop(1, `rgba(${tint.join(',')},0)`);
        ctx.fillStyle = haze;
        ctx.fillRect(0, 0, surface.width, surface.height);
      }
      ctx.filter = ink ? 'none' : `blur(${0.25 * ratio}px)`;
      ctx.drawImage(layer, 0, 0);
      ctx.filter = 'none';
      if (!ink && s.glow > 0) {
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = c(s.glow * 2.2, 0, 1);
        ctx.filter = `blur(${3 * ratio}px)`;
        ctx.drawImage(layer, 0, 0);
        ctx.globalAlpha = c(s.glow * 2.6, 0, 1);
        ctx.filter = `blur(${17 * ratio}px)`;
        ctx.drawImage(layer, 0, 0);
        ctx.filter = 'none';
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
      }
      el.dataset.renderer = 'canvas';
      el.dataset.time = time.toFixed(3);
      el.dataset.frame = String(++frame);
    };
    gsap.ticker.add(dr);
    return () => {
      gsap.ticker.remove(dr);
      ro.disconnect();
      io.disconnect();
      el.removeEventListener('pointermove', mv);
      el.removeEventListener('pointerleave', lv);
      el.removeEventListener('pointercancel', lv);
      el.removeEventListener('click', ck);
      media.removeEventListener('change', up);
      document.removeEventListener('visibilitychange', vs);
      update.current = null;
      stoke.current = null;
    };
  }, []);

  return (
    <div
      ref={root}
      data-glyph-ember
      className={`relative isolate min-h-[240px] overflow-hidden ${props.className ?? ''}`}
      style={{ background: props.backgroundColor ?? DEFAULTS.backgroundColor, ...props.style }}
    >
      <canvas ref={canvas} aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 h-full w-full" />
      {props.children}
    </div>
  );
}

export type { GlyphEmberProps, EmberHandle } from './types';
