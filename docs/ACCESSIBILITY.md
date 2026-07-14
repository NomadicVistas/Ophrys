# Accessibility verification

Verified on 2026-07-13 UTC for the Build Week public, Studio and Operator surfaces.

## Acceptance evidence

| Boundary | Implemented evidence | Verification |
|---|---|---|
| Keyboard | A visible-on-focus skip link reaches each main region; navigation, refusal, artwork-to-Studio links and Operator controls use native interactive elements; a two-colour focus treatment remains visible on light and dark fields. | Source assertions in `test/ophrys.test.mjs`; Chromium keyboard smoke confirms the skip link receives first focus. |
| Reduced motion | The reduced-motion query disables animations and transitions and restores non-animated scrolling. The field-specific stylesheet also stops orbit motion. | Source assertion plus Chromium 149 launched with `--force-prefers-reduced-motion=reduce`. |
| Contrast | Primary ink on paper is 16.12:1; muted metadata on paper is 4.74:1; paper on dark is 15.8:1; error red on the Operator dark field is 6.99:1. | WCAG relative-luminance calculation runs in `npm test`. |
| Mobile | At 720 px and below, primary navigation remains available as a horizontally scrollable 44 px-high row; the education encounter, artwork, telemetry, metric, Studio and Operator grids collapse without a required horizontal page scroll. | Responsive source assertion and Chromium smoke at 390 × 844, repeated for the education encounter on 2026-07-14 UTC. |
| Error state | Public state failure changes the visible system status and replaces the artwork grid with a truthful quiet-field message. Studio failure exposes a live status and claims no state. Operator authentication errors use an assertive alert; settings and cycle outcomes use polite status regions. | Source assertions and the deterministic route-boundary test. |

Artwork cards are links to the corresponding public Studio ledger rather than focusable containers with no keyboard action. Focusing a work does not count an `artwork_open`; the coarse aggregate event is sent only on activation.

The coded quartet uses native buttons and links for entry, counter-action, notes, optional sound and sequential navigation. Each canvas has a work-specific visual description, while the notes panel exposes the full encounter, question, counter-reading and data boundary as text. The renderer caps device pixel ratio, pauses when the page is hidden and respects reduced motion. `Choir of Almost` synthesises optional local sound only after an explicit action and never requests microphone access. `Afterimage Commons` retains traces only in page memory and visibly expires them.

The Lure → Reveal → Counter-read sequence retains a native refusal button and polite live result. Chromium 149 rendered its live aggregate and score values at 1440 × 1000 and its reduced-motion mobile structure at 390 × 844 on 2026-07-14 UTC.

The ecosystem-literacy sequence is a semantic ordered list with separately headed evidence, example and limit text. Its three-column summary collapses to one column below 720 px and its five evidence cards collapse to a linear reading order below 1050 px. Loading uses `aria-busy`; no quiz control, response field or focus trap is introduced. These boundaries have deterministic source assertions; a final deployed screen-reader pass remains open under the scope below.

## Scope and limits

This is prototype acceptance evidence, not a WCAG conformance claim. Automated checks protect the specific boundaries above. A screen-reader pass on the final deployment URL and a physical iOS/Android pass remain appropriate before a public exhibition.
