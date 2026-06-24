# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```
npm run dev       # start Vite dev server
npm run build     # tsc -b (type-check via project references) then vite build
npm run preview   # preview the production build locally
```

There is no test suite, linter, or formatter configured in this repo. `npm run build` is the only available correctness check (TypeScript strict mode via `tsc -b`).

## Architecture

This is a single-page React + TypeScript + Vite app with almost the entire application in one file: `src/App.tsx` (~1500 lines). `src/main.tsx` just mounts `<App />`, and `src/styles.css` (~1500 lines) holds all styling, including per-template visual themes (`.card-preview--elegant`, `--playful`, `--bold`, `--photo`).

There is no router, no global state library, and no backend — everything is local component state plus the DOM/Canvas/File APIs.

### Two-pane layout

`App` renders a `builder-panel` (left, wizard controls) and a `preview-panel` (right, live card preview) side by side. Every control in the wizard mutates state that the preview reads directly, so the preview always reflects the live state with no separate "apply" step.

### Wizard steps

`wizardSteps` defines six steps (`recipient → message → photo → customize → preview → download`). `currentWizardStepId` controls which `control-group` section renders in the left panel; navigation is just array-index math (`handlePreviousWizardStep`/`handleNextWizardStep`). When adding a new step, add an entry to `wizardSteps` and a corresponding `currentWizardStep.id === "..."` branch in the JSX — the progress indicator and Back/Next logic are generic and don't need changes.

### Card templates and per-template layout state

`cardTemplates` defines four visual styles (`elegant`/Sweet, `playful`/Confetti, `bold`/Pop Art, `photo`/Photo Fun). Each template has its own independent layout state, keyed by template id:

- `movableLayouts: Record<CardTemplateId, TemplateMovableLayout>` — x/y position (as % of card) for each movable item (`cake`, `flowers`, `balloons`, `gift`, `photo`, `ribbon`)
- `photoScales: Record<CardTemplateId, number>` — photo zoom (70–130%), independent per template

`defaultMovableLayouts` and `defaultPhotoScales` are the reset targets. Switching templates does not reset layout — each template remembers its own arrangement, which is the reason these are keyed maps rather than flat state.

### Drag, resize, and pinch interactions

All movable elements (stickers, the "Happy Birthday" ribbon, the photo) share one pointer-event-based drag system (`handleMovablePointerDown/Move/End` + `dragStateRef`), using pointer capture and percentage coordinates relative to the preview card's bounding rect (`getPreviewPoint`). Positions are clamped via `getBoundedMovablePoint`, which has special-cased bounds logic for the photo (keeps it within the card based on its current scaled size) vs. every other item (simple 4–96% clamp).

Photo resizing has three independent input paths that all converge on `updatePhotoScale`:
- Desktop corner-drag via `photo-resize-handle` buttons (`handlePhotoResizePointerDown/Move/End`, using `resizeStateRef`)
- Desktop mouse fallback when PointerEvent capture isn't available (`handlePhotoResizeMouseDown` + window-level `mousemove`/`mouseup` listeners, distinguished by `pointerId: -1`)
- Mobile two-finger pinch on the photo itself (`photoPointersRef` tracks multiple active pointers, `pinchStateRef` computes scale from distance ratio)

Window-level pointer/mouse listeners are attached in a `useEffect` with no dependency array (runs every render) so resize state from refs is always read fresh.

### Card export (download/share)

Export does not use a canvas library — it's hand-rolled via SVG `foreignObject`:

1. Clone the live preview DOM node (`createCardPngBlob`)
2. Inline every `<img>` as a data URL (`inlineExportImages`) so the exported image has no external/blob URL dependencies
3. Serialize the clone plus all current document stylesheets into an SVG `foreignObject` data URL
4. Load that SVG into an `Image`, draw it to a `canvas` at 2x scale for sharper export, and convert to a PNG `Blob`

`handleDownloadCard` triggers a synthetic `<a download>` click. `handleShareCard` uses the Web Share API (`navigator.share`/`canShare`) when available and falls back to download otherwise. Both write a status message to `exportStatus`, shown in both the wizard's Download step and the preview panel header.

If you change preview markup or CSS in a way that depends on live layout (e.g. new computed inline styles), make sure `createCardPngBlob` either captures that state via CSS custom properties (as it already does for `--photo-size`/`--media-height`) or that it survives `cloneNode`.

## Notes

- `.agents/` and `scripts/` exist in the repo but are currently empty.
- `PROJECT_JOURNAL.md` is a dev-process journal (phases, design decisions, lessons learned) — read it for *why* a feature looks the way it does before changing it, e.g. why photo scale is stored per-template, or why custom messages aren't a separate "style".
- Deployed previously on Vercel; `netlify.toml` is also present (`npm run build` → publish `dist`), so the project may be deployed to either/both.
