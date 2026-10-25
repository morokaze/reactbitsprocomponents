export function c(v: number, a = 0, b = 1) {
  return Math.min(b, Math.max(a, v));
}

export function h(x: number, y = 0) {
  const v = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return v - Math.floor(v);
}

export function n(x: number, y: number) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const a = h(ix, iy);
  const b = h(ix + 1, iy);
  const d = h(ix, iy + 1);
  const e = h(ix + 1, iy + 1);
  return (a + (b - a) * sx) * (1 - sy) + (d + (e - d) * sx) * sy;
}

export function b(x: number, y: number) {
  return (
    n(x, y) * 0.57 +
    n(x * 2.03 + 11.7, y * 2.03 + 4.1) * 0.28 +
    n(x * 4.09 + 3.2, y * 4.09 + 9.1) * 0.15
  );
}

export function r(s: string): number[] {
  let v = s.replace("#", "");
  if (!/^([a-f\d]{3}|[a-f\d]{6})$/i.test(v)) {
    v = "0a0a0a";
  }
  if (v.length === 3) {
    v = v
      .split("")
      .map((x) => x + x)
      .join("");
  }
  return [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16) / 255);
}

export function l(rgb: number[]) {
  const [r, g, b] = rgb.map((v) =>
    v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4,
  );
  const x = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const y = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const z = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * x + 0.793617785 * y - 0.0040720468 * z,
    1.9779984951 * x - 2.428592205 * y + 0.4505937099 * z,
    0.0259040371 * x + 0.7827717662 * y - 0.808675766 * z,
  ];
}

export function v(lab: number[]) {
  const [L, a, b] = lab;
  const x = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const y = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const z = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * x - 3.3077115913 * y + 0.2309699292 * z,
    -1.2684380046 * x + 2.6097574011 * y - 0.3413193965 * z,
    -0.0041960863 * x - 0.7034186147 * y + 1.707614701 * z,
  ].map((q) =>
    Math.round(
      c(
        q <= 0.0031308
          ? q * 12.92
          : 1.055 * Math.max(0, q) ** (1 / 2.4) - 0.055,
      ) * 255,
    ),
  );
}

export function p(a: string, d: string) {
  const stops = [
    l(r(a).map((x) => x * 0.13)),
    l(r(a)),
    l(r(d)),
    l([1, 0.94, 0.98]),
  ];
  return Array.from({ length: 64 }, (_, i) => {
    const t = i / 63;
    const j = t < 0.5 ? 0 : t < 0.85 ? 1 : 2;
    const q =
      j === 0 ? t / 0.5 : j === 1 ? (t - 0.5) / 0.35 : (t - 0.85) / 0.15;
    return v(stops[j].map((x, k) => x + (stops[j + 1][k] - x) * q));
  });
}
