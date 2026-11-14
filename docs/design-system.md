# Design System — "Wayfinding + Editorial"

The interface borrows from transit maps, campus signage and printed university
handbooks: hairline rules instead of shadows, numbered stations instead of generic
cards, monospaced identifiers, and a restrained palette.

## Colour tokens (`frontend/src/index.css` → `@theme`)

Tailwind's default palette is **switched off** (`--color-*: initial`), so only these
tokens exist. That keeps stray blue/purple utilities out of the product.

| Token | Hex | Use |
| --- | --- | --- |
| `ink` | `#173B35` | Sidebar, primary buttons, headings on paper, travelled route |
| `ink-deep` | `#0F2925` | Hover / pressed ink |
| `paper` | `#F4F0E7` | App background |
| `paper-deep` | `#EBE5D8` | Hover rows, inset panels |
| `surface` | `#FFFEFA` | Raised content panels, inputs |
| `vermilion` | `#D65A3A` | Current step, active nav marker, focus ring, key highlights (non-text) |
| `vermilion-deep` | `#B4442A` | Vermilion **text** and filled accent buttons (AA contrast) |
| `vermilion-wash` | `#F8E4DC` | Error / attention backgrounds |
| `chartreuse` | `#C5CE75` | Progress fill and positive states, used sparingly, always with ink text |
| `chartreuse-wash` | `#EEF0D0` | Success backgrounds |
| `charcoal` | `#252823` | Body text |
| `stone` | `#77766E` | Secondary text on `surface` (≥ 4.5:1) |
| `stone-deep` | `#5F5E57` | Secondary text on `paper` and small labels (stone on paper is only 4.0:1) |
| `line` | `#DCD7CB` | Borders, dividers, future route segments |
| `line-strong` | `#C4BCAA` | Input borders, emphasised rules |

Contrast notes: paper text on ink is 10.8:1; ink on chartreuse is 7.3:1. White on
`#D65A3A` is only 3.9:1, so filled vermilion buttons use `vermilion-deep` (5.3:1).

## Typography
| Role | Font | Usage |
| --- | --- | --- |
| Display | Space Grotesk 500/600/700 | Page titles, section titles, task titles — signage feel |
| Body | Inter 400/500/600 | Paragraphs, UI text |
| Mono | IBM Plex Mono 400/500/600 | Step numbers (`01`), codes (`ATT`), counts, progress (`03/05`), timestamps, section indices |

Scale (rem): 0.75 label · 0.875 small · 1 body · 1.125 lead · 1.5 h3 · 1.875 h2 ·
2.25–3.5 h1 (landing only). Labels use mono, upper-case and 0.08em tracking.

## Shape, spacing, elevation
- Radius: 2px tags, 4px controls and panels. No pills, no large rounded cards.
- Spacing: Tailwind 4px scale; page gutter 16px on mobile, 32–40px on desktop; section rhythm 40–56px.
- Elevation: borders (`line`) and paper/surface contrast. Shadows only for floating
  layers (menus, dialogs, mobile drawer).
- Motion: 150ms colour/opacity transitions only; respects `prefers-reduced-motion`.

## Signature components
| Component | Where | Idea |
| --- | --- | --- |
| **Task Index** (`TaskList` + `TaskCard`) | Catalogue, search | Handbook index rows separated by hairlines: category code, title, summary, then a meta line (service · steps · time). Tiles for dashboards |
| **Journey Rail** (`JourneyStepList`) | Journey | Transit line with numbered stations. Completed = filled ink + check; current = vermilion station + "You are here"; upcoming = outlined; optional = dashed. Travelled segment ink, remaining dashed. Horizontal on mobile |
| **Service Identifier** (`ServiceInfo`) | Steps, task reference | Type glyph + service name + verification state. Expands to service details |
| **Progress Strip** (`JourneyProgress`) | Journey header | One segment per step (chartreuse = done, vermilion = current, dashed = optional) plus mono `03/05` |
| **Task Reference** (`TaskInfo`) | Task details | Spec-sheet panel: category, services, steps, time, requirements, verification note |
| **Open Portal** (`OpenPortalButton`) | Steps | Real link only when verified; otherwise a clearly marked "Official link to be verified" notice |
| Notice Sheet, Help Reference, Support Status | Module 3 | Reserved for Harshith; reuse the tokens, `Tag`, `SectionHeader` |

## Layout
- **Desktop (≥1024px):** 264px ink sidebar (numbered sections, station-dot active
  marker) + compact top bar (global search, user menu) + content max-width 1200px.
- **Tablet (640–1023px):** sidebar collapses into a drawer; two-column grids become one or two columns.
- **Mobile (<640px):** top bar with menu button; journey rail turns horizontal; a sticky
  bottom bar holds Previous / Mark complete / Next. No horizontal page overflow.

## Accessibility baseline
Visible `:focus-visible` ring (2px vermilion), semantic landmarks, labelled form
fields with inline errors, `aria-current="step"` on the rail, keyboard-operable search
suggestions (↑ ↓ Enter Esc, `/` to focus), native `<dialog>` for modals, and colour
never used as the only signal (states also carry icons or text).
