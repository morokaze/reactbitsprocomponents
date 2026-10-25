# Clean-room approach

**[Русский](CLEAN_ROOM.md) · [English](CLEAN_ROOM.en.md)**

[← Back to the collection](../README.en.md)

## What the term means here

The components were implemented independently from the observable output of public demos. Here, clean-room describes the principle of studying appearance and behavior, then writing an original implementation.

**A formal clean-room process with separate, independent teams was not carried out.** Observation, implementation and comparison took place within the same development effort. This page records provenance and development practices; it is not a legal assessment or a certification that all legal risks are absent.

## Observation sources

| Component | Public visual reference | Intentional traits of our version |
| :--- | :--- | :--- |
| Cloud Atlas | [React Bits demo](https://pro.reactbits.dev/docs/components/cloud-atlas) | Stronger upward flow; directional smearing with recovery |
| Glyph Tide | [React Bits demo](https://pro.reactbits.dev/docs/components/glyph-tide) | No pointer interaction; brightness set to 1.8 |
| Glyph Ember | [React Bits demo](https://pro.reactbits.dev/docs/components/glyph-ember) | ASCII fire and sparks; interaction disabled by default |

Observations covered visible motion, palettes, glyph density, input responses, dimensions and public settings. Reference screenshots were used for comparison; screenshots of the original demos are not included in the published collection.

## Implementation process

1. **Observe.** View the public demo in a browser across multiple states and moments in time.
2. **Describe the output.** Record shapes, motion direction, transitions, colors and available settings.
3. **Write original code.** Create procedural fields, shaders, Canvas rendering and React components.
4. **Compare.** Inspect the implementation in a browser and adjust observed visual differences.
5. **Check technically.** Run TypeScript, production builds and behavior checks relevant to the changes.

Our algorithms and individual frames may differ from the references. A successful build does not establish visual equivalence.

## What was not used

- Proprietary React Bits Pro component source code.
- Extraction of implementations from compiled JavaScript bundles or source maps.
- Bypassing payment, authentication or other access restrictions.
- Republishing logos, textures or screenshots from the original website.

The repository uses original implementations, standard web APIs and explicitly declared dependencies. The Glyph Ember README image shows the local demo; the collection cover is a separate vector illustration, not a reference screenshot.

## Rules for future changes

- Link the public reference page and describe its observable properties.
- Describe behavior in your own words; do not transfer proprietary implementations or snippets.
- Preserve provenance and license information for third-party files.
- Document intentional differences and verification limits.
- Do not present the result as an official React Bits component or an exact copy without evidence.

Original code is released under [MIT](../LICENSE). Dependencies retain their own licenses: [notices](../THIRD_PARTY_NOTICES.md).
