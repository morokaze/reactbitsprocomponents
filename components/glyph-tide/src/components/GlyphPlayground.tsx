"use client";

import { useState } from "react";
import GlyphTide from "./glyph-tide/GlyphTide";
import { DEFAULTS, type GlyphTideSettings } from "./glyph-tide/types";

type NumericKey = {
  [K in keyof GlyphTideSettings]: GlyphTideSettings[K] extends number
    ? K
    : never;
}[keyof GlyphTideSettings];
const controls: {
  key: NumericKey;
  label: string;
  min: number;
  max: number;
  step: number;
}[] = [
  { key: "fontSize", label: "Размер символов", min: 7, max: 24, step: 1 },
  { key: "scale", label: "Масштаб", min: 0.3, max: 3, step: 0.05 },
  { key: "level", label: "Уровень воды", min: 0, max: 1, step: 0.01 },
  { key: "tideRange", label: "Амплитуда прилива", min: 0, max: 3, step: 0.05 },
  {
    key: "tidePeriod",
    label: "Период прилива (секунды)",
    min: 6,
    max: 120,
    step: 1,
  },
  { key: "waves", label: "Волны", min: 0, max: 2, step: 0.05 },
  { key: "foam", label: "Пена", min: 0, max: 2, step: 0.05 },
  { key: "contours", label: "Контуры", min: 0, max: 2, step: 0.05 },
  { key: "wetSand", label: "Влажный песок", min: 0, max: 2, step: 0.01 },
  {
    key: "depthFade",
    label: "Затухание в глубине",
    min: 0,
    max: 1,
    step: 0.01,
  },
  { key: "brightness", label: "Яркость", min: 0.2, max: 2.5, step: 0.05 },
  { key: "speed", label: "Скорость", min: 0, max: 4, step: 0.05 },
  { key: "seed", label: "Вариант", min: 0, max: 20, step: 1 },
];

export default function GlyphPlayground() {
  const [settings, setSettings] = useState<GlyphTideSettings>({ ...DEFAULTS });
  const [tab, setTab] = useState<"preview" | "usage">("preview");
  const [mobile, setMobile] = useState(false);
  const [generation, setGeneration] = useState(0);
  const [copyStatus, setCopyStatus] = useState("");
  const update = <K extends keyof GlyphTideSettings>(
    key: K,
    value: GlyphTideSettings[K],
  ) => setSettings((current) => ({ ...current, [key]: value }));
  const reset = () => {
    setSettings({ ...DEFAULTS });
    setGeneration((value) => value + 1);
  };
  const code = `import GlyphTide from './components/glyph-tide/GlyphTide';\n\nexport default function Shore() {\n  return (\n    <GlyphTide\n      style={{ width: '100%', height: 600 }}\n      colors={${JSON.stringify(settings.colors)}}\n      backgroundColor=${JSON.stringify(settings.backgroundColor)}\n      characters={${JSON.stringify(settings.characters)}}\n${controls.map(({ key }) => `      ${key}={${settings[key]}}`).join("\n")}\n    />\n  );\n}`;

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopyStatus("Скопировано");
    } catch {
      setCopyStatus("Выделите и скопируйте код ниже.");
    }
  }

  return (
    <main className="mx-auto max-w-[765px] px-4 pb-10 pt-8 sm:px-8 sm:pt-10">
      <header className="mb-7">
        <h1 className="text-[28px] font-semibold tracking-[-0.04em] sm:text-[32px]">
          Glyph Tide
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Прилив из символов, который затопляет берег и отступает.
        </p>
      </header>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="Режим просмотра"
          className="flex gap-1.5"
        >
          {(["preview", "usage"] as const).map((value) => (
            <button
              key={value}
              id={`${value}-tab`}
              role="tab"
              aria-selected={tab === value}
              aria-controls={`${value}-panel`}
              className="tool-button capitalize"
              onClick={() => setTab(value)}
            >
              {value === "preview" ? "Просмотр" : "Код"}
            </button>
          ))}
        </div>
        <div
          className="flex flex-wrap items-center gap-1.5"
          aria-label="Управление просмотром"
        >
          <button
            className="tool-button"
            aria-pressed={!mobile}
            onClick={() => setMobile(false)}
          >
            Компьютер
          </button>
          <button
            className="tool-button"
            aria-pressed={mobile}
            onClick={() => setMobile(true)}
          >
            Телефон
          </button>
          <button
            className="tool-button"
            aria-pressed={settings.paused}
            onClick={() => update("paused", !settings.paused)}
          >
            {settings.paused ? "Продолжить" : "Пауза"}
          </button>
          <button className="tool-button" onClick={reset}>
            Сбросить
          </button>
        </div>
      </div>

      <section
        id="preview-panel"
        role="tabpanel"
        aria-labelledby="preview-tab"
        hidden={tab !== "preview"}
      >
        <div className="overflow-hidden rounded-xl border border-neutral-800 bg-[#0a0a0a]">
          <div
            className="mx-auto"
            style={{ width: mobile ? "min(100%, 390px)" : "100%", height: 600 }}
          >
            <GlyphTide
              key={generation}
              {...settings}
              paused={settings.paused || tab !== "preview"}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </div>
        <div className="mb-6 mt-3 flex justify-between gap-4 text-[11px] text-neutral-600">
          <span>{mobile ? "390 px · телефон" : "Адаптивный просмотр"}</span>
          <span>Один прилив · {settings.tidePeriod} с при 1×</span>
        </div>
      </section>

      <section
        id="usage-panel"
        role="tabpanel"
        aria-labelledby="usage-tab"
        hidden={tab !== "usage"}
        className="mb-6 overflow-hidden rounded-xl border border-neutral-800 bg-[#101010]"
      >
        <div className="flex items-center justify-between gap-3 border-b border-neutral-800 px-5 py-3">
          <span className="text-xs text-neutral-500">Текущие настройки</span>
          <div className="flex items-center gap-3">
            <span role="status" className="text-xs text-neutral-500">
              {copyStatus}
            </span>
            <button className="tool-button" onClick={copyCode}>
              Скопировать код
            </button>
          </div>
        </div>
        <pre className="overflow-x-auto p-5 text-xs leading-6 text-neutral-300">
          <code>{code}</code>
        </pre>
      </section>

      <section
        aria-label="Настройки компонента"
        className="grid grid-cols-1 gap-x-8 gap-y-6 rounded-xl border border-neutral-800 p-5 sm:grid-cols-3 sm:p-6"
      >
        {(["Вода", "Пена", "Фон"] as const).map((label, index) => {
          const value =
            index === 2 ? settings.backgroundColor : settings.colors[index];
          return (
            <label
              key={label}
              className="flex items-center justify-between gap-3 text-xs text-neutral-400"
            >
              {label}
              <span className="flex items-center gap-3">
                <span className="font-mono text-[11px] text-neutral-500">
                  {value.toUpperCase()}
                </span>
                <input
                  aria-label={`Цвет: ${label}`}
                  type="color"
                  value={value}
                  onChange={(event) =>
                    index === 2
                      ? update("backgroundColor", event.target.value)
                      : update(
                          "colors",
                          settings.colors.map((color, i) =>
                            i === index ? event.target.value : color,
                          ) as [string, string],
                        )
                  }
                />
              </span>
            </label>
          );
        })}
        <label className="text-xs text-neutral-400">
          Символы
          <input
            className="control-input mt-2 font-mono"
            value={settings.characters}
            maxLength={48}
            onChange={(event) => update("characters", event.target.value)}
            spellCheck={false}
          />
        </label>
        <label className="text-xs text-neutral-400 sm:col-span-2">
          Шрифт
          <input
            className="control-input mt-2"
            value={settings.fontFamily}
            onChange={(event) => update("fontFamily", event.target.value)}
            spellCheck={false}
          />
        </label>
        {controls.map(({ key, label, min, max, step }) => (
          <label key={key} className="block text-xs text-neutral-400">
            <span className="mb-2 flex justify-between gap-3">
              <span>{label}</span>
              <output className="font-mono text-neutral-500">
                {Number(settings[key].toFixed(2))}
              </output>
            </span>
            <input
              type="range"
              aria-label={label}
              min={min}
              max={max}
              step={step}
              value={settings[key]}
              onChange={(event) => update(key, Number(event.target.value))}
            />
          </label>
        ))}
      </section>
      <footer className="mt-5 text-[11px] leading-5 text-neutral-600">
        Настройте прилив, рельеф и палитру с помощью параметров выше.
      </footer>
    </main>
  );
}
