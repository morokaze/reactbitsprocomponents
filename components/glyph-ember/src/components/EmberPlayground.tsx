"use client";

import { useState } from "react";
import GlyphEmber from "./glyph-ember/GlyphEmber";
import { DEFAULTS, type EmberSettings } from "./glyph-ember/types";

type NumericKey = {
  [K in keyof EmberSettings]: EmberSettings[K] extends number ? K : never;
}[keyof EmberSettings];

type Control = {
  key: NumericKey;
  label: string;
  min: number;
  max: number;
  step: number;
};

const controls: Control[] = [
  { key: "glyphSize", label: "Размер символов", min: 6, max: 32, step: 1 },
  { key: "spacing", label: "Интервал", min: 0.6, max: 3, step: 0.05 },
  { key: "height", label: "Высота", min: 0.1, max: 1.1, step: 0.01 },
  { key: "fuel", label: "Топливо", min: 0, max: 2, step: 0.05 },
  { key: "turbulence", label: "Турбулентность", min: 0, max: 2, step: 0.05 },
  { key: "wind", label: "Ветер", min: -1, max: 1, step: 0.05 },
  { key: "flicker", label: "Мерцание", min: 0, max: 1, step: 0.05 },
  { key: "sparks", label: "Искры", min: 0, max: 1, step: 0.05 },
  { key: "smoke", label: "Дым", min: 0, max: 1, step: 0.05 },
  { key: "pulse", label: "Пульсация", min: 0, max: 1, step: 0.05 },
  { key: "speed", label: "Скорость", min: 0, max: 3, step: 0.05 },
  { key: "glow", label: "Свечение", min: 0, max: 2, step: 0.05 },
  { key: "intensity", label: "Интенсивность", min: 0.2, max: 3, step: 0.05 },
  { key: "quality", label: "Качество", min: 0.25, max: 1, step: 0.05 },
];

const pointerControls: Control[] = [
  { key: "snuffRadius", label: "Радиус гашения", min: 20, max: 300, step: 1 },
  { key: "snuffStrength", label: "Сила гашения", min: 0, max: 1, step: 0.05 },
  { key: "stokeStrength", label: "Сила вспышки", min: 0, max: 3, step: 0.05 },
];

const charsets = {
  dense: DEFAULTS.charset,
  minimal: " .:-=+*#%@",
  blocks: " ░▒▓█",
  binary: " 01",
  hex: " 0123456789ABCDEF",
};

type Charset = keyof typeof charsets | "custom";

export default function EmberPlayground() {
  const [settings, ss] = useState<EmberSettings>({ ...DEFAULTS });
  const [tab, st] = useState<"preview" | "usage">("preview");
  const [mobile, sm] = useState(false);
  const [generation, sg] = useState(0);
  const [charset, sc] = useState<Charset>("dense");
  const [status, sx] = useState("");

  function up<K extends keyof EmberSettings>(key: K, value: EmberSettings[K]) {
    ss((current) => ({ ...current, [key]: value }));
  }

  function rs() {
    ss({ ...DEFAULTS });
    sg((current) => current + 1);
    sc("dense");
    sx("");
  }

  function ch(value: Charset) {
    sc(value);
    if (value !== "custom") {
      up("charset", charsets[value]);
    }
  }

  const code = [
    "import GlyphEmber from './components/glyph-ember/GlyphEmber';",
    "",
    "export default function Fire() {",
    "  return (",
    "    <GlyphEmber",
    "      style={{ width: '100%', height: 600 }}",
    ...Object.entries(settings).map(
      ([key, value]) => `      ${key}={${JSON.stringify(value)}}`,
    ),
    "    />",
    "  );",
    "}",
  ].join("\n");

  async function cp() {
    try {
      await navigator.clipboard.writeText(code);
      sx("Скопировано");
    } catch {
      sx("Выделите код ниже и скопируйте его.");
    }
  }

  function sl(control: Control) {
    const { key, label, min, max, step } = control;
    return (
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
          onChange={(event) => up(key, Number(event.target.value))}
        />
      </label>
    );
  }

  return (
    <main className="mx-auto max-w-[765px] px-4 pb-10 pt-8 sm:px-8 sm:pt-10">
      <header className="mb-7">
        <h1 className="text-[28px] font-semibold tracking-[-0.04em] sm:text-[32px]">
          Glyph Ember
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Живое пламя из символов с фиолетовым свечением и розовыми искрами.
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
              onClick={() => st(value)}
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
            onClick={() => sm(false)}
          >
            Компьютер
          </button>
          <button
            className="tool-button"
            aria-pressed={mobile}
            onClick={() => sm(true)}
          >
            Телефон
          </button>
          <button
            className="tool-button"
            aria-pressed={settings.paused}
            onClick={() => up("paused", !settings.paused)}
          >
            {settings.paused ? "Продолжить" : "Пауза"}
          </button>
          <button className="tool-button" onClick={rs}>
            Сбросить
          </button>
        </div>
      </div>

      <section
        id="preview-panel"
        role="tabpanel"
        aria-labelledby="preview-tab"
        hidden={tab !== "preview"}
        className="mb-6 overflow-hidden rounded-xl border border-neutral-800 bg-[#0a0a0a]"
      >
        <div
          className="mx-auto"
          style={{ width: mobile ? "min(100%, 390px)" : "100%", height: 600 }}
        >
          <GlyphEmber
            key={generation}
            {...settings}
            paused={settings.paused || tab !== "preview"}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </section>

      <section
        id="usage-panel"
        role="tabpanel"
        aria-labelledby="usage-tab"
        hidden={tab !== "usage"}
        className="mb-6 overflow-hidden rounded-xl border border-neutral-800 bg-[#101010]"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 px-5 py-3">
          <span className="text-xs text-neutral-500">Текущие настройки</span>
          <div className="flex items-center gap-3">
            <span role="status" className="text-xs text-neutral-500">
              {status}
            </span>
            <button className="tool-button" onClick={cp}>
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
        className="grid grid-cols-1 gap-x-7 gap-y-6 rounded-xl border border-neutral-800 p-5 sm:grid-cols-3"
      >
        {(["Пламя", "Основание", "Фон"] as const).map((label, index) => {
          const value =
            index === 2 ? settings.backgroundColor : settings.colors[index];
          return (
            <label
              key={label}
              className="flex items-center justify-between gap-2 text-xs text-neutral-400"
            >
              {label}
              <span className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-neutral-500">
                  {value.toUpperCase()}
                </span>
                <input
                  type="color"
                  aria-label={`Цвет: ${label}`}
                  value={value}
                  onChange={(event) => {
                    if (index === 2) {
                      up("backgroundColor", event.target.value);
                    } else {
                      up(
                        "colors",
                        settings.colors.map((color, i) =>
                          i === index ? event.target.value : color,
                        ) as [string, string],
                      );
                    }
                  }}
                />
              </span>
            </label>
          );
        })}

        <label className="text-xs text-neutral-400">
          Режим
          <select
            className="control-input mt-2"
            value={settings.mode}
            onChange={(event) =>
              up("mode", event.target.value as EmberSettings["mode"])
            }
          >
            <option value="auto">Авто</option>
            <option value="glow">Свечение</option>
            <option value="ink">Чернила</option>
          </select>
        </label>
        <label className="text-xs text-neutral-400">
          Набор символов
          <select
            className="control-input mt-2"
            value={charset}
            onChange={(event) => ch(event.target.value as Charset)}
          >
            <option value="dense">Плотный</option>
            <option value="minimal">Минимальный</option>
            <option value="blocks">Блоки</option>
            <option value="binary">Двоичный</option>
            <option value="hex">Шестнадцатеричный</option>
            <option value="custom">Свой</option>
          </select>
        </label>
        <label className="text-xs text-neutral-400">
          Символы
          <input
            className="control-input mt-2 font-mono"
            value={settings.charset}
            maxLength={128}
            spellCheck={false}
            onChange={(event) => {
              sc("custom");
              up("charset", event.target.value);
            }}
          />
        </label>
        <label className="text-xs text-neutral-400 sm:col-span-3">
          Шрифт
          <input
            className="control-input mt-2"
            value={settings.fontFamily}
            spellCheck={false}
            onChange={(event) => up("fontFamily", event.target.value)}
          />
        </label>
        {controls.map(sl)}
        <div className="border-t border-neutral-800 pt-5 sm:col-span-3">
          <label className="flex items-center gap-3 text-xs text-neutral-400">
            <input
              type="checkbox"
              checked={settings.interactive}
              onChange={(event) => up("interactive", event.target.checked)}
            />
            Взаимодействие
          </label>
        </div>
        {settings.interactive && (
          <>
            <label className="flex items-center gap-3 text-xs text-neutral-400">
              <input
                type="checkbox"
                checked={settings.snuff}
                onChange={(event) => up("snuff", event.target.checked)}
              />
              Гашение при наведении
            </label>
            <label className="flex items-center gap-3 text-xs text-neutral-400 sm:col-span-2">
              <input
                type="checkbox"
                checked={settings.clickStoke}
                onChange={(event) => up("clickStoke", event.target.checked)}
              />
              Вспышка по нажатию
            </label>
            {pointerControls
              .filter((control) =>
                control.key === "stokeStrength"
                  ? settings.clickStoke
                  : settings.snuff,
              )
              .map(sl)}
          </>
        )}
      </section>
    </main>
  );
}
