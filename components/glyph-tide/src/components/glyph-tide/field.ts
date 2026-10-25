export const TAU = Math.PI * 2;
export const clamp = (v: number, lo = 0, hi = 1) =>
  Math.min(hi, Math.max(lo, v));
export const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
function hash(x: number, y: number) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}
function noise(x: number, y: number) {
  const ix = Math.floor(x),
    iy = Math.floor(y),
    fx = x - ix,
    fy = y - iy;
  const sx = fx * fx * (3 - 2 * fx),
    sy = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy),
    b = hash(ix + 1, iy),
    c = hash(ix, iy + 1),
    d = hash(ix + 1, iy + 1);
  return (a + (b - a) * sx) * (1 - sy) + (c + (d - c) * sx) * sy;
}
export function terrain(x: number, y: number, scale: number, seed: number) {
  const xx = x / Math.max(0.3, scale),
    yy = y / Math.max(0.3, scale);
  const offset = seed * 1.733;
  const warp = (noise(xx * 3 + offset, yy * 3 + 7.2) - 0.5) * 0.055;
  const channel = 0.32 + 0.105 * Math.sin(xx * 4 + offset * 0.7) + warp;
  let h =
    0.5 -
    0.26 * Math.cos((yy - channel) * 6.8) +
    0.17 * Math.cos(xx * 4.8 + 0.3 + offset);
  h += (noise(xx * 5.2 + offset, yy * 5.2 + 2.4) - 0.5) * 0.085;
  h += (noise(xx * 13 + offset, yy * 13 + 7.5) - 0.5) * 0.028;
  h += (noise(xx * 29 + offset, yy * 29 + 3.2) - 0.5) * 0.009;
  h += 0.12 * Math.exp(-((xx + 0.08) ** 2 / 0.09 + (yy - 0.78) ** 2 / 0.06));
  h += 0.32 * (1 - smooth(-0.3, 0.2, xx)) * smooth(0.6, 0.95, yy);
  h -= 0.18 * Math.exp(-((xx - 0.5) ** 2 / 0.07 + (yy - 0.94) ** 2 / 0.06));
  return h;
}
export function waterLevel(
  time: number,
  level: number,
  range: number,
  period: number,
) {
  return (
    level + Math.sin((time * TAU) / Math.max(6, period) - 0.45) * 0.115 * range
  );
}
export function swell(x: number, y: number, time: number, scale: number) {
  const k = 1 / Math.max(0.3, scale);
  const p = y * 39 * k + x * 2.4 * k - time * 1.35;
  return (
    Math.sin(p + Math.sin(x * 7.1 * k + time * 0.16) * 0.7) * 0.01 +
    Math.sin(y * 74 * k - x * 4.5 * k - time * 1.9) * 0.004
  );
}
