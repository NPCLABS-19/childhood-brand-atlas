---
name: "Children’s lifestyle — 19 studio"
description: "A restrained photographic archive for comparative brand research."
colors:
  bg: "#f2f2f0"
  panel: "#fafaf8"
  ink: "#20221f"
  muted: "#60635b"
  rule: "#d4d5ce"
  accent: "#566340"
  selected: "#e6eadc"
  image-ground: "#e3e4dc"
  selection: "#d5dcc3"
typography:
  display:
    fontFamily: "Haas, Arial, sans-serif"
    fontSize: "clamp(38px,4.6vw,70px)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-.04em"
  headline:
    fontFamily: "Haas, Arial, sans-serif"
    fontSize: "30px"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-.035em"
  title:
    fontFamily: "Haas, Arial, sans-serif"
    fontSize: "21px"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "-.025em"
  body:
    fontFamily: "Haas, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Haas, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 400
  navigation:
    fontFamily: "Haas, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 400
rounded:
  spectrum-dot: "50%"
spacing:
  compact: "8px"
  label-gap: "12px"
  content-gap: "20px"
  entry-column-gap: "22px"
  section-inset: "24px"
  profile-column-gap: "32px"
  page-gutter: "36px"
components:
  text-nav:
    textColor: "{colors.ink}"
    typography: "{typography.navigation}"
    padding: "12px 0"
  category-filter:
    textColor: "{colors.muted}"
    padding: "0"
  category-filter-selected:
    textColor: "{colors.ink}"
  profile-tab:
    textColor: "{colors.muted}"
    typography: "{typography.navigation}"
    padding: "13px 0"
  profile-tab-selected:
    textColor: "{colors.ink}"
  compare-toggle:
    textColor: "{colors.muted}"
    typography: "{typography.label}"
    padding: "8px 0"
  compare-toggle-selected:
    textColor: "{colors.accent}"
  compare-checkbox:
    width: "14px"
    height: "14px"
  spectrum-dot:
    backgroundColor: "{colors.rule}"
    rounded: "{rounded.spectrum-dot}"
    width: "4px"
    height: "4px"
  spectrum-dot-selected:
    backgroundColor: "{colors.accent}"
    rounded: "{rounded.spectrum-dot}"
    width: "12px"
    height: "12px"
  photographic-entry:
    backgroundColor: "{colors.image-ground}"
    width: "100%"
---

# Design System: Children’s lifestyle — 19 studio

## Overview

**Creative North Star: "Studio research archive"**

A restrained studio research archive, following the user’s 19 studio / Chocolate studio references. The neutral grey ground and Haas typography let brand photography provide the strongest visual variation. Short readings, open entries and fine rules keep the interface precise and legible.

Controls remain visible as text, underlines and native checkboxes. The composition is flat and quiet, with muted olive reserved for selection and emphasis. Sans-serif typography, visible navigation and minimal, non-redundant copy are durable commitments.

**Key Characteristics:**

- Neutral grey ground and graphite text.
- Haas sans-serif throughout.
- Open photographic entries separated by fine rules.
- Visible text controls with restrained olive state cues.

## Colors

The interface uses warm grey neutrals with restrained muted olive accents. The frontmatter preserves the exact CSS colors.

### Primary

- **Muted olive** (`accent`): selected comparison actions, spectrum marks, checkbox accent and keyboard focus outlines.

### Neutral

- **Grey ground** (`bg`): the continuous page surface and the clearance around selected spectrum marks.
- **Light panel** (`panel`): skip-link surface and text on the temporary status announcement.
- **Graphite** (`ink`): primary text, current navigation, selected tab rules and announcement background.
- **Muted graphite** (`muted`): supporting text, metadata and inactive controls.
- **Fine rule** (`rule`): separators, inactive spectrum positions and mini-scale segments.
- **Image ground** (`image-ground`): the photographic link’s loading ground.
- **Selection tint** (`selection`): browser text selection.
- **Selected tint** (`selected`): declared in the root stylesheet but currently unused; do not add a filled selection surface solely to use it.

**The Photograph First Rule.** Keep the interface palette quiet so the featured photography carries the visual variation.

## Typography

**Display Font:** Haas, with Arial and sans-serif fallbacks.  
**Body Font:** The same Haas stack.

The shipped asset is `NeueHaasDisplayRoman.ttf`, registered as Haas with `font-display: swap` and synthesis disabled. Headings remain regular weight; negative tracking and size create hierarchy. There is no distinct serif or monospace voice.

### Hierarchy

- **Display:** the frontmatter display style for page headings. Profile names use `clamp(38px,4.4vw,64px)`.
- **Headline:** the base secondary heading style. Profile perception statements use `clamp(27px,2.6vw,39px)` with a line height of (1.09).
- **Title:** the base tertiary heading style. Index entry names use (22px), then (21px) and (20px) at narrower widths.
- **Body:** the base prose style. Profile readings are capped at (60ch), full-width facts at (65ch); wide-screen profile readings become (18px).
- **Label:** supporting facts and metadata; navigation and profile tabs use their larger navigation role. Labels retain ordinary sentence case.

**The One Family Rule.** Use Haas for headings, body and controls; preserve Arial and sans-serif as fallbacks.

## Layout

The layout is fluid without a fixed maximum container width. The header, main and footer share page gutters (36px). The index opens with two equal intro columns, then an open four-column photographic grid with row and column gaps (43px / 22px). Entries have no surrounding card shell.

Profiles use a brand-index rail (190px), a rail-to-content gap (34px), and image/copy columns (`.9fr / 1fr`) separated by (32px). The rail is sticky at (24px). Spectrum panels and source content use two columns; comparison uses a horizontally scrollable table with fixed column layout.

Responsive rules are exactly those shipped:

- At **min-width (1600px)**: gutters grow to (55px), index gaps to (50px / 28px), the rail to (210px), and profile column gap to (50px).
- At **max-width (1050px)**: gutters become (24px), the index has three columns, and the profile rail becomes (150px). Several profile fields stack.
- At **max-width (760px)**: gutters become (20px), the index has two columns, intro and spectrum/source sections stack, and the brand rail becomes a wrapping horizontal list. Main navigation remains four visible text links on its own header row. The profile image and copy still share two columns.
- At **max-width (520px)**: the profile image and copy stack; the image changes to a landscape crop (`6/5`) with a maximum height (400px). Index entries remain in two columns. The comparison table keeps a minimum width (620px) and scrolls horizontally.

The recurring spacing vocabulary is small and explicit rather than a strict mathematical scale. Use the frontmatter’s extracted recurring steps and component-specific observed gaps. Print rules remove interactive navigation and use a white page ground.

## Elevation & Depth

There are no box shadows. Fine rules, open spacing and contrast between text and the continuous ground provide hierarchy. The temporary status announcement is a flat graphite strip; it is fixed above the page without a shadow. Photographic hover movement is limited to a subtle crop enlargement.

**The Flat Archive Rule.** Separate content with space and fine rules, without elevated card shells.

## Shapes

The geometry is square and open. Rules are (1px), photographs have straight edges, and native checkboxes keep their browser shape. Circular spectrum dots are the deliberate exception, using the frontmatter spectrum-dot radius. Do not generalize that circle into rounded cards or pill controls.

## Components

### Text navigation

Plain text links make every destination visible. The main navigation has a desktop gap (30px) and vertical link padding (12px). Current-page links underline. Hover underlines links; keyboard focus uses an olive outline (2px) offset by (5px). Mobile navigation remains fully visible. The profile brand index uses muted links with graphite underlining on the current brand.

### Category filters

These are unboxed text buttons, not filled chips. The group wraps with a desktop gap (22px). Inactive text is muted; the selected filter is graphite and underlined, with an underline offset (5px). Selection uses `aria-pressed` and updates the visible brand count.

### Profile tabs

A horizontal text tab list sits on a fine bottom rule. Tabs have a gap (28px) and vertical padding (13px). The selected tab uses graphite text and a (1px) graphite bottom edge; others remain muted. The content panel changes in place. Arrow keys, Home and End move selection and focus; the selected tab alone is in the ordinary tab order.

### Comparison actions and checkboxes

The entry action is a small text button with vertical padding (8px), muted at rest and olive/underlined when added. Profile actions use (13px) text at larger widths. The comparison picker uses labelled native checkboxes (14px square) with olive accent and a minimum label height (32px). A maximum of three brands can be selected; unchecked inputs disable at the limit and their labels become muted. Selection persists in local storage. Add/remove feedback appears in the live status strip for (3200ms).

### Photographic entries

Entries combine a linked image, brand name, comparison action, one short descriptor and ruled category metadata. Index images use a portrait ratio (`4/5`), `object-fit: cover` and the image-ground token. Hover enlarges the crop to (1.025) over (.35s) with `cubic-bezier(.2,.7,.2,1)`. Reduced motion removes transitions. Profile imagery carries a source caption; palette impressions belong to the featured brand analysis, not the interface palette.

### Spectrum marks

The five-position track has a fine connecting line, inactive dots (4px) and a selected olive dot (12px) with a ground-colored clearance outline (4px). Profile mini-scales use five (5px) high bars with a gap (4px), highlighting one olive segment. These are qualitative editorial positions, presented with accessible text descriptions rather than fabricated numerical scores.

## Do's and Don'ts

### Do:

- **Do** keep all four main navigation links visible at narrow widths.
- **Do** pair real photography with concise readings and source credits.
- **Do** distinguish selected states with the existing underline, border or olive mark.
- **Do** preserve semantic links, tabs, checkbox labels and keyboard focus.

### Don't:

- **Don’t** introduce hamburger navigation or serif typography.
- **Don’t** add decorative panels, heavy shadows or rounded card shells.
- **Don’t** repeat headings with redundant eyebrows or ornamental labels.
- **Don’t** turn illustrative brand palettes into interface theme colors.
