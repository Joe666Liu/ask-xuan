# Web Interface Guidelines

Concise rules for building accessible, fast, resilient interfaces. Use
MUST/SHOULD/NEVER to guide decisions.

## Scope Boundary

- This guide owns interaction behavior, accessibility, forms, feedback states,
  motion, responsive behavior, content resilience, hydration, and performance.
- For visual style direction, use [ui-style.md](./ui-style.md). For tokens,
  theme files, Tailwind v4, component variants, and primitive styling, inspect
  the existing implementation.
- If a rule here requires visual changes, prefer updating the relevant semantic
  token, variant, or primitive instead of adding one-off raw styles in a feature.

## Interactions

### Keyboard

- MUST: Full keyboard support per [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/).
- MUST: Visible focus rings (`:focus-visible`; group with `:focus-within`).
- MUST: Manage focus (trap, move, return) per APG patterns.
- NEVER: `outline: none` without visible focus replacement.

### Targets And Input

- MUST: Hit target >=24px (mobile >=44px); if visual <24px, expand hit area.
- MUST: Mobile `<input>` font-size >=16px to prevent iOS zoom.
- NEVER: Disable browser zoom (`user-scalable=no`, `maximum-scale=1`).
- MUST: `touch-action: manipulation` to prevent double-tap zoom.
- SHOULD: Set `-webkit-tap-highlight-color` to match design.

### Forms

- MUST: Hydration-safe inputs with no lost focus or value.
- NEVER: Block paste in `<input>` or `<textarea>`.
- MUST: Loading buttons show spinner and keep original label.
- MUST: Enter submits focused input; in `<textarea>`, Cmd/Ctrl+Enter submits.
- MUST: Keep submit enabled until request starts; then disable with spinner.
- MUST: Accept free text and validate after; do not block typing.
- MUST: Allow incomplete form submission to surface validation.
- MUST: Errors inline next to fields; on submit, focus first error.
- MUST: Use `autocomplete`, meaningful `name`, correct `type`, and `inputmode`.
- SHOULD: Disable spellcheck for emails, codes, and usernames.
- SHOULD: Placeholders end with `...` and show example pattern.
- MUST: Warn on unsaved changes before navigation.
- MUST: Compatible with password managers and 2FA; allow pasting codes.
- MUST: Trim values to handle trailing spaces.
- MUST: No dead zones on checkboxes or radios; label and control share one hit
  target.

### State And Navigation

- MUST: URL reflects state for deep-link filters, tabs, pagination, and
  expanded panels.
- MUST: Back/Forward restores scroll position.
- MUST: Links use `<a>` or `Link` for navigation and support Cmd/Ctrl/middle
  click.
- NEVER: Use `<div onClick>` for navigation.

### Feedback

- SHOULD: Optimistic UI; reconcile on response; on failure rollback or offer
  Undo.
- MUST: Confirm destructive actions or provide Undo window.
- MUST: Use polite `aria-live` for toasts and inline validation.
- SHOULD: Use ellipsis for options opening follow-ups (`Rename...`) and loading
  states (`Loading...`).

### Touch And Drag

- MUST: Generous targets, clear affordances; avoid finicky interactions.
- MUST: Delay first tooltip; subsequent peers instant.
- MUST: `overscroll-behavior: contain` in modals and drawers.
- MUST: During drag, disable text selection and set `inert` on dragged elements.
- MUST: If it looks clickable, it must be clickable.

### Autofocus

- SHOULD: Autofocus on desktop with single primary input; rarely on mobile.

## Animation

- MUST: Honor `prefers-reduced-motion`.
- SHOULD: Prefer CSS over Web Animations API over JS libraries.
- MUST: Animate compositor-friendly props (`transform`, `opacity`) only.
- NEVER: Animate layout props (`top`, `left`, `width`, `height`).
- NEVER: `transition: all`; list properties explicitly.
- SHOULD: Animate only to clarify cause/effect or add deliberate delight.
- SHOULD: Choose easing to match the change.
- MUST: Animations interruptible and input-driven.
- MUST: Correct `transform-origin`.
- MUST: SVG transforms on `<g>` wrapper with `transform-box: fill-box`.

## Layout

- SHOULD: Optical alignment; adjust by 1px when perception beats geometry.
- MUST: Deliberate alignment to grid, baseline, and edges.
- SHOULD: Balance icon/text lockups by weight, size, spacing, and color.
- MUST: Verify mobile, laptop, and ultra-wide.
- MUST: Respect safe areas (`env(safe-area-inset-*)`).
- MUST: Avoid unwanted scrollbars and fix overflows.
- SHOULD: Prefer flex/grid over JS measurement for layout.

## Content And Accessibility

- SHOULD: Inline help first; tooltips last resort.
- MUST: Skeletons mirror final content to avoid layout shift.
- MUST: `<title>` matches current context.
- MUST: No dead ends; always offer next step or recovery.
- MUST: Design empty, sparse, dense, error, loading, and disabled states.
- SHOULD: Avoid widows/orphans with `text-wrap: balance`.
- MUST: `font-variant-numeric: tabular-nums` for number comparisons.
- MUST: Redundant status cues; never color-only.
- MUST: Accessible names exist even when visuals omit labels.
- MUST: `scroll-margin-top` on headings, skip link, and hierarchical headings.
- MUST: Resilient to user-generated content of short, average, and very long
  lengths.
- MUST: Locale-aware dates, times, and numbers.
- SHOULD: `translate="no"` on brand names, code tokens, and identifiers.
- MUST: Accurate `aria-label`; decorative elements `aria-hidden`.
- MUST: Icon-only buttons have descriptive `aria-label`.
- MUST: Prefer native semantics before ARIA.

## Content Handling

- MUST: Text containers handle long content with truncation, line clamp, or
  wrapping.
- MUST: Flex children use `min-w-0` when truncation is needed.
- MUST: Handle empty strings and empty arrays without broken UI.

## Performance

- SHOULD: Test iOS Low Power Mode and macOS Safari for sensitive UI.
- MUST: Measure reliably; disable extensions that skew runtime.
- MUST: Track and minimize re-renders.
- MUST: Profile with CPU/network throttling when performance is in scope.
- MUST: Batch layout reads/writes; avoid reflows and repaints.
- MUST: Mutations target <500ms when possible.
- SHOULD: Prefer uncontrolled inputs; keep controlled inputs cheap per
  keystroke.
- MUST: Virtualize large lists over 50 items.
- MUST: Preload above-fold images and lazy-load the rest.
- MUST: Prevent CLS with explicit image dimensions.
- SHOULD: Use `preconnect` for CDN domains.
- SHOULD: Critical fonts use preload with `font-display: swap`.

## Dark Mode And Theming

- MUST: `color-scheme: dark` on `<html>` for dark themes.
- SHOULD: `<meta name="theme-color">` matches page background.
- MUST: Native `<select>` has explicit `background-color` and `color`.

## Hydration

- MUST: Inputs with `value` need `onChange` or should use `defaultValue`.
- SHOULD: Guard date/time rendering against hydration mismatch.

## Interface Craft

- MUST: Accessible charts with color-blind-friendly palettes.
- MUST: Meet contrast; prefer APCA over WCAG 2 when available.
- MUST: Increase contrast on hover, active, and focus; fix tokens or variants
  when the issue is systemic.
- SHOULD: Match browser UI to background.
- SHOULD: Avoid dark gradient banding.
