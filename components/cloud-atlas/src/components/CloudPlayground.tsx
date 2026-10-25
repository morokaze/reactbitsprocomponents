"use client";

import { useRef, useState, type ReactNode } from "react";
import { gsap } from "gsap";
import CloudAtlas from "./cloud-atlas/CloudAtlas";
import { DEFAULTS, type CloudSettings } from "./cloud-atlas/types";

type NumericKey = {
  [K in keyof CloudSettings]: CloudSettings[K] extends number ? K : never;
}[keyof CloudSettings];
const SLIDERS: {
  key: NumericKey;
  label: string;
  min: number;
  max: number;
  step: number;
}[] = [
  { key: "height", label: "Высота", min: 0, max: 1.5, step: 0.01 },
  { key: "coverage", label: "Заполнение", min: 0, max: 1, step: 0.01 },
  { key: "density", label: "Плотность", min: 0, max: 1, step: 0.01 },
  { key: "scale", label: "Масштаб", min: 0.2, max: 3, step: 0.05 },
  { key: "towers", label: "Выступы", min: 0, max: 3, step: 0.05 },
  { key: "opacity", label: "Непрозрачность", min: 0, max: 1, step: 0.01 },
  { key: "wind", label: "Ветер", min: -2, max: 2, step: 0.05 },
  { key: "billow", label: "Изменение формы", min: 0, max: 3, step: 0.05 },
  { key: "rise", label: "Подъём", min: 0, max: 2, step: 0.05 },
  { key: "speed", label: "Скорость", min: 0, max: 3, step: 0.05 },
  { key: "resolution", label: "Разрешение", min: 0.15, max: 1, step: 0.01 },
  { key: "cursorStrength", label: "Сила курсора", min: 0, max: 3, step: 0.05 },
  {
    key: "cursorRadius",
    label: "Радиус курсора",
    min: 0.02,
    max: 0.5,
    step: 0.01,
  },
  { key: "seed", label: "Вариант", min: 0, max: 50, step: 1 },
];
const presets = {
  original: {
    name: "Исходная",
    colors: ["#6D5BC0", "#3A2E7A"] as [string, string],
    backgroundColor: "#0a0a0a",
  },
  silver: {
    name: "Серебро",
    colors: ["#c2ccd9", "#566174"] as [string, string],
    backgroundColor: "#0a0c10",
  },
  sunset: {
    name: "Закат",
    colors: ["#e6a78b", "#76435e"] as [string, string],
    backgroundColor: "#100b12",
  },
};
type View = "Только фон" | "Обложка" | "Телефон" | "Карточка";
function Icon({
  name,
}: {
  name: "reset" | "pause" | "play" | "desktop" | "mobile" | "card" | "copy";
}) {
  const paths = {
    reset: (
      <>
        <path d="M3 10a8 8 0 1 1 2 7M3 4v6h6" />
      </>
    ),
    pause: (
      <>
        <path d="M8 5v14M16 5v14" />
      </>
    ),
    play: <path d="m8 5 11 7-11 7Z" />,
    desktop: (
      <>
        <rect x="3" y="4" width="18" height="13" rx="2" />
        <path d="M8 21h8m-4-4v4" />
      </>
    ),
    mobile: (
      <>
        <rect x="6" y="2" width="12" height="20" rx="2" />
        <path d="M11 18h2" />
      </>
    ),
    card: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 10h18" />
      </>
    ),
    copy: (
      <>
        <rect x="8" y="8" width="12" height="13" rx="2" />
        <path d="M16 8V3H3v13h5" />
      </>
    ),
  };
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
const button =
  "inline-flex min-h-9 cursor-pointer items-center justify-center gap-2 rounded-lg px-3 text-[13px] transition-colors hover:bg-white/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";
const snippet = `import CloudAtlas from '@/components/cloud-atlas/CloudAtlas';

export default function Hero() {
  return (
    <CloudAtlas
      colors={['#6D5BC0', '#3A2E7A']}
      height={0.9}
      rise={1}
      coverage={0.45}
      density={0.55}
      opacity={0.7}
      resolution={0.36}
      interactive
      className="h-[600px] w-full rounded-[20px]"
    />
  );
}`;

export default function CloudPlayground() {
  const [settings, setSettings] = useState<CloudSettings>({ ...DEFAULTS });
  const [view, setView] = useState<View>("Только фон");
  const [tab, setTab] = useState("Preview");
  const [preset, setPreset] = useState("original");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const preview = useRef<HTMLDivElement>(null);
  const update = <K extends keyof CloudSettings>(
    key: K,
    value: CloudSettings[K],
  ) => setSettings((old) => ({ ...old, [key]: value }));
  const changeView = (next: View) => {
    setView(next);
    if (
      !matchMedia("(prefers-reduced-motion: reduce)").matches &&
      preview.current
    ) {
      gsap.fromTo(
        preview.current,
        { opacity: 0.55, y: 4 },
        {
          opacity: 1,
          y: 0,
          duration: 0.35,
          ease: "power2.out",
          overwrite: true,
        },
      );
    }
  };
  const reset = () => {
    setSettings({ ...DEFAULTS });
    setPreset("original");
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopyError(true);
    }
  };
  let content: ReactNode = null;
  if (view === "Обложка" || view === "Телефон")
    content = (
      <div className="flex h-full flex-col items-center px-6 pt-24 text-center sm:pt-28">
        <p className="text-sm text-white/65">Пространство для мечты.</p>
        <h2 className="mt-4 max-w-[650px] text-[clamp(40px,5vw,68px)] leading-[1.04] font-medium tracking-[-.055em]">
          Пусть идеи
          <br />
          обретут форму.
        </h2>
        <p className="mt-5 max-w-80 text-sm leading-6 text-white/70">
          Открытое небо для новых начинаний.
        </p>
        <button
          className="mt-7 rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition-colors hover:bg-neutral-200"
          onClick={() =>
            document
              .getElementById("customize")
              ?.scrollIntoView({
                behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
                  ? "instant"
                  : "smooth",
              })
          }
        >
          Настроить
        </button>
      </div>
    );
  if (view === "Карточка")
    content = (
      <div className="absolute inset-x-6 top-7">
        <h2 className="text-2xl font-medium tracking-tight">В облаках.</h2>
        <p className="mt-2 text-sm text-white/65">
          Маленькое окно. Бесконечное небо.
        </p>
      </div>
    );
  return (
    <main className="mx-auto max-w-[1440px] px-4 pt-10 pb-10 sm:px-8 sm:pt-14">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[32px] leading-tight font-semibold tracking-[-.04em] sm:text-[40px]">
            Cloud Atlas
          </h1>
          <p className="mt-3 text-base leading-6 text-[#a6a6a6]">
            Облака, которые поднимаются и растут словно пламя
          </p>
        </div>
        <p className="text-[12px] leading-5 text-[#8c8c8c]">
          Самостоятельная реализация
          <br />
          Next.js · TypeScript · Tailwind · GSAP
        </p>
      </header>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="Компонент"
          className="flex rounded-xl bg-[#111] p-1"
        >
          {["Preview", "Usage"].map((name) => (
            <button
              key={name}
              role="tab"
              id={`tab-${name}`}
              aria-controls={`panel-${name}`}
              aria-selected={tab === name}
              onClick={() => setTab(name)}
              className={`${button} ${tab === name ? "bg-[#242424] text-white" : "text-[#999]"}`}
            >
              {name === "Preview" ? "Просмотр" : "Код"}
            </button>
          ))}
        </div>
        {tab === "Preview" && (
          <div
            className="flex flex-wrap items-center gap-1"
            aria-label="Режимы просмотра"
          >
            {(["Только фон", "Обложка", "Телефон", "Карточка"] as View[]).map(
              (mode, i) => (
                <button
                  key={mode}
                  title={mode}
                  aria-label={mode}
                  aria-pressed={view === mode}
                  onClick={() => changeView(mode)}
                  className={`${button} px-2.5 ${view === mode ? "bg-[#202020] text-white" : "text-[#888]"}`}
                >
                  <Icon
                    name={i === 2 ? "mobile" : i === 3 ? "card" : "desktop"}
                  />
                  <span className="hidden lg:inline">{mode}</span>
                </button>
              ),
            )}
            <span className="mx-1 h-5 w-px bg-white/10" />
            <button
              className={button}
              onClick={() => update("paused", !settings.paused)}
              aria-label={
                settings.paused ? "Продолжить анимацию" : "Остановить анимацию"
              }
              aria-pressed={settings.paused}
            >
              <Icon name={settings.paused ? "play" : "pause"} />
            </button>
            <button
              className={button}
              onClick={() => update("seed", settings.seed + 1)}
              aria-label="Новый рисунок облаков"
            >
              <Icon name="reset" />
            </button>
          </div>
        )}
      </div>
      {tab === "Preview" ? (
        <div
          id="panel-Preview"
          role="tabpanel"
          aria-labelledby="tab-Preview"
          ref={preview}
          className={`flex min-h-[600px] justify-center overflow-hidden rounded-[20px] border border-[#212121] ${view === "Телефон" || view === "Карточка" ? "items-center bg-[#101010] p-4 sm:p-8" : ""}`}
        >
          <CloudAtlas
            {...settings}
            className={`relative h-[600px] ${view === "Телефон" ? "w-[375px] max-w-full rounded-[28px] border border-[#292929]" : view === "Карточка" ? "!h-[420px] w-[480px] max-w-full rounded-[20px]" : "w-full"}`}
          >
            {content}
          </CloudAtlas>
        </div>
      ) : (
        <div
          role="tabpanel"
          id="panel-Usage"
          aria-labelledby="tab-Usage"
          className="min-h-[600px] rounded-[20px] border border-[#212121] bg-[#111] p-5 sm:p-8"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Подключение</h2>
            <button onClick={copy} className={button}>
              <Icon name="copy" />
              {copied ? "Скопировано" : "Скопировать"}
            </button>
          </div>
          <p role="status" className="mt-3 text-sm text-[#aaa]">
            {copyError
              ? "Буфер обмена недоступен. Выделите и скопируйте пример ниже."
              : "Скопируйте папку cloud-atlas в каталог компонентов."}
          </p>
          <pre className="mt-6 overflow-x-auto text-[13px] leading-7 text-[#c8c0df]">
            <code>{snippet}</code>
          </pre>
        </div>
      )}
      <section
        id="customize"
        aria-labelledby="customize-heading"
        className="mt-7 scroll-mt-6"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2
            id="customize-heading"
            className="text-xl font-semibold tracking-tight"
          >
            Настройки
          </h2>
          <button className={`${button} text-[#a6a6a6]`} onClick={reset}>
            <Icon name="reset" />
            Сбросить
          </button>
        </div>
        <div className="rounded-2xl border border-[#212121] bg-[#0d0d0d] p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <label className="flex items-center gap-3 text-sm text-[#aaa]">
              Палитра
              <select
                aria-label="Палитра"
                value={preset}
                onChange={(e) => {
                  const key = e.target.value as keyof typeof presets;
                  setPreset(key);
                  setSettings((old) => ({ ...old, ...presets[key] }));
                }}
                className="min-h-9 rounded-lg border border-[#292929] bg-[#161616] px-3 text-sm text-[#eee]"
              >
                {Object.entries(presets).map(([key, p]) => (
                  <option key={key} value={key}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex flex-wrap gap-5">
              {(["Небо", "Свет", "Тень"] as const).map((label, i) => (
                <label
                  key={label}
                  className="flex items-center gap-2.5 text-sm text-[#aaa]"
                >
                  <input
                    type="color"
                    className="h-6 w-6 rounded-full"
                    aria-label={`Цвет: ${label}`}
                    value={
                      i === 0
                        ? settings.backgroundColor
                        : settings.colors[i - 1]
                    }
                    onChange={(e) =>
                      i === 0
                        ? update("backgroundColor", e.target.value)
                        : update(
                            "colors",
                            i === 1
                              ? [e.target.value, settings.colors[1]]
                              : [settings.colors[0], e.target.value],
                          )
                    }
                  />
                  {label}
                </label>
              ))}
            </div>
            <label className="flex items-center gap-3 text-sm text-[#aaa]">
              Расположение
              <select
                aria-label="Расположение"
                className="min-h-9 rounded-lg border border-[#292929] bg-[#161616] px-3 text-sm text-[#eee]"
                value={settings.anchor}
                onChange={(e) =>
                  update("anchor", e.target.value as "bottom" | "top")
                }
              >
                <option value="bottom">Снизу</option>
                <option value="top">Сверху</option>
              </select>
            </label>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-x-9 gap-y-7 sm:grid-cols-2 xl:grid-cols-3">
            {SLIDERS.map((s) => (
              <label key={s.key} className="block">
                <span className="flex justify-between gap-4 text-[13px] text-[#aaa]">
                  <span>{s.label}</span>
                  <output className="text-[#ddd] tabular-nums">
                    {Number(settings[s.key].toFixed(2))}
                  </output>
                </span>
                <input
                  aria-label={s.label}
                  type="range"
                  min={s.min}
                  max={s.max}
                  step={s.step}
                  value={settings[s.key]}
                  onChange={(e) => update(s.key, Number(e.target.value))}
                  className="mt-5 block w-full"
                />
              </label>
            ))}
            <div className="flex items-end gap-7">
              {(["interactive", "paused"] as const).map((key) => (
                <label
                  key={key}
                  className="flex min-h-8 items-center gap-3 text-[13px] text-[#aaa]"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-white"
                    checked={settings[key]}
                    onChange={(e) => update(key, e.target.checked)}
                  />
                  {key === "interactive" ? "Взаимодействие" : "Пауза"}
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>
      <footer className="mt-6 flex flex-wrap justify-between gap-3 text-xs leading-5 text-[#888]">
        <p>
          Проведите указателем по облакам: они размываются по движению и
          постепенно восстанавливаются.
        </p>
        <p>Самостоятельная реализация · Без внешних текстур</p>
      </footer>
    </main>
  );
}
