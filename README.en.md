<p align="center">
  <a href="README.md">Русский</a> · <strong>English</strong>
</p>

![React Components — independent motion experiments](docs/assets/cover.svg)

<p align="center">
  <a href="https://github.com/morokaze/reactbitsprocomponents/actions/workflows/check.yml"><img src="https://github.com/morokaze/reactbitsprocomponents/actions/workflows/check.yml/badge.svg" alt="Build checks"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/original_code-MIT-a78bfa" alt="Original code: MIT"></a>
  <img src="https://img.shields.io/badge/Node.js-22-303036" alt="Node.js 22">
  <img src="https://img.shields.io/badge/TypeScript-strict-303036" alt="TypeScript strict">
</p>

<p align="center">
  Clouds, tides and fire — three independently implemented React components.<br>
  Configurable motion, interactive demos and comment-free source files.
</p>

<p align="center">
  <a href="#components">Components</a> ·
  <a href="#quick-start">Quick start</a> ·
  <a href="#usage">Usage</a> ·
  <a href="docs/CLEAN_ROOM.en.md">Clean-room approach</a>
</p>

---

## Components

| Component | Effect | Features |
| :--- | :--- | :--- |
| **[Cloud Atlas ↗](components/cloud-atlas)** | Purple clouds rise and stretch into flame-like plumes | WebGL · pointer smearing · gradual recovery |
| **[Glyph Tide ↗](components/glyph-tide)** | A tide drawn with characters floods and drains the shore | Canvas 2D · foam and wet sand · no pointer interaction |
| **[Glyph Ember ↗](components/glyph-ember)** | ASCII flames rise above a glowing bed of glyphs | Canvas 2D · sparks · optional snuffing and bursts |

Each component lives in its own Next.js project. Adjust colors, speed and other settings through the demo or props. Collection documentation is available in Russian and English; demo interfaces are in Russian.

<details>
<summary><strong>View the Glyph Ember demo</strong></summary>

![This repository's Glyph Ember demo](components/glyph-ember/docs/preview.png)

This screenshot shows the implementation in this repository.

</details>

## Quick start

**Requires Node.js 22 and npm.** No API keys or environment variables are needed.

```bash
git clone https://github.com/morokaze/reactbitsprocomponents.git
cd reactbitsprocomponents
npm ci
npm run dev:ember
```

| Demo | Command | Local URL |
| :--- | :--- | :--- |
| Cloud Atlas | `npm run dev:cloud` | [localhost:3000](http://localhost:3000) |
| Glyph Tide | `npm run dev:tide` | [localhost:3001](http://localhost:3001) |
| Glyph Ember | `npm run dev:ember` | [localhost:3002](http://localhost:3002) |

Use separate terminals to run multiple demos. `npm run dev` starts the Glyph Ember server by default.

## Usage

1. Copy the effect directory from `components/<name>/src/components/<name>` into your project.
2. Install `gsap` and configure Tailwind CSS.
3. Give the component an explicit container height.

```tsx
import GlyphEmber from './components/glyph-ember/GlyphEmber';

export default function Hero() {
  return (
    <GlyphEmber
      colors={['#7B3DFF', '#FF7AD9']}
      interactive={false}
      style={{ width: '100%', height: 600 }}
    />
  );
}
```

Each effect's `types.ts` contains its full API. Component READMEs include examples and limitations in Russian. Cloud Atlas also uses a CSS fallback from its `globals.css`.

## Checks and builds

```bash
npm run typecheck
npm run build
```

Both commands cover the **entire collection**. GitHub Actions runs installation, type checks and builds on pushes and pull requests. Appearance and motion are checked separately in the browser.

<details>
<summary><strong>Production commands and project structure</strong></summary>

After building, choose a command below. Use separate terminals for multiple demos:

```bash
npm run start --workspace=cloud-atlas
npm run start --workspace=glyph-tide
npm run start --workspace=glyph-ember
```

```text
components/
  cloud-atlas/      WebGL clouds and controls
  glyph-tide/       ASCII tide and controls
  glyph-ember/      ASCII fire and controls
docs/
  CLEAN_ROOM.md     Approach and scope in Russian
  CLEAN_ROOM.en.md  English version
.github/workflows/ Shared checks
package-lock.json  Shared dependency lockfile
```

Generated `next-env.d.ts`, `.next`, `node_modules` and secrets are excluded. Next.js may insert comments into generated files; the project's own source files do not contain comments.

</details>

## Independent implementation

**Public output → observations → original code → visual comparison.**

Public React Bits demos served as visual references. The implementations were written independently from observable behavior and public parameters, without using proprietary source code. This is not an official React Bits project, and frame-for-frame equivalence is not claimed.

Here, *clean-room* describes the reference-handling principle. A formal process with separate observation and implementation teams was not carried out. Read **[the approach, sources and limitations](docs/CLEAN_ROOM.en.md)**.

## Contributing and licensing

Report ideas and bugs in [Issues](https://github.com/morokaze/reactbitsprocomponents/issues). Review the [contribution guidelines](CONTRIBUTING.md), currently in Russian, before making changes.

Original code is released under **[MIT](LICENSE)**. Dependencies retain their own licenses; GSAP uses its Standard License. See [third-party notices](THIRD_PARTY_NOTICES.md).
