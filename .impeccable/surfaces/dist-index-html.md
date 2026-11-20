---
version: 1
slug: "dist-index-html"
primary_target: "dist/index.html"
related_targets:
  - "dist/wip.js"
  - "dist/assignment.js"
  - "dist/bentos.js"
  - "dist/bento-publish.js"
  - "dist/style.css"
---

# Brand atlas surface
Mode: Read with visual evidence, then work with submitted material. A strategist can browse 21 profiles: eight original lifestyle brands, seven children’s care/protection/cosmetic brands and six teenage profiles. Inspect a profile, read Thingtesting context where verified, explore segment-specific positioning and compare up to three across groups. WIP adds Amaira’s submitted creative work and derived colours/patterns; Bentos adds a locally editable, explicitly published shared visual board.

## Direction contract
THESIS: A studio research index where imagery gives the first impression and short strategic observations explain it.
OWN-WORLD: User-specified 19 studio / Chocolate studio aesthetic: neutral grey ground, graphite text, muted olive active controls, open photographic grid. Neue Haas sans-serif from the supplied reference, thin separators, no boxes around repeated entries.
STORY: Browse the visual field, open a brand, move between strategy, identity and products, then compare its relationship to the others. In WIP, choose Amaira and move between Responses, Colours and Patterns, keeping each extract linked to its question. In Bentos, select an individual tile, upload and frame its media, then preview, download or publish the board.
FIRST VIEWPORT: Compact wordmark at left, seven visible text links: Children, Teenagers, WIP, Bentos, Spectrum, Compare and Sources. The default index retains its two-line title, brief introduction and four-image opening. Children retain the lifestyle grid, clearly labelled care group and category filters; teenagers retain their separate index with audience-scope labels. Profiles inherit the image-and-reading composition; mobile uses a native grouped brand selector. Navigation stays visible and wraps at narrow widths. The same selection carries across child/teen comparison, while the spectrum changes its audience language for each segment.
FORM: User-pinned restrained studio research archive. Seed 8f78dab0 was run; the brief's visible navigation and minimal editorial aesthetic override theatrical challenger forms. Build directly to the explicit brief; no alternate aesthetic approval gate.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## WIP extension

An ordinary extension of the incumbent neutral-grey/Haas archive. Contributor navigation is a visible text level above Responses / Colours / Patterns, whose current state uses the existing graphite underline and fine rule. The responses overview uses open entries, complete-image previews and the original question order. Details pair a full-size submission with the full prompt and download actions. Question 11 keeps the supplied ranking; question 13 visibly remains unanswered.

Colours use eight open swatch entries with copyable hex values and source-question links, plus a downloadable palette. Patterns use five direct strips cropped from question 9, with captions, downloads and a link to the full shape study. They remain evidence from the contributor’s artwork, not new interface palette tokens or synthesized patterns. The colour grid becomes two columns and the pattern grid one column on mobile; the contributor and section navigation remain visible.

## Bento extension

The editor uses the archive’s text toolbar, square native fields, fine rules, restrained olive selection and graphite publishing action. A labelled inspector sits beside the board on desktop and below it on mobile. Preview removes editing labels and the inspector. Motion respects reduced-motion preference and can be paused.

The white square canvas and rounded tiles are the user-requested Theaterbaren composition exception. Preserve the exact 1080 × 1080 coordinate system: margin 40, gap 12, radius 12, rows 356 / 264 / 356, and all nine rectangles in `research/bentos/layout.json`. Scale the whole board proportionally on every viewport and in the 2160 × 2160 PNG export. Do not generalize the board radius, white canvas or editing overlays into other archive entries.

Tile media, fit, crop and background belong to a browser draft until Publish to everyone is chosen. Project downloads include media. Publishing requires repository write access, saves board/media atomically on `main`, mirrors the current `dist` tree into a new non-force `gh-pages` commit and waits for that commit’s Pages build. Newer remote boards stop stale-draft publication; a source-save/Pages failure preserves a retryable draft. Maintain explicit draft, saved and live status messages.

## Evidence and delivery

The response JSON, attachment provenance and extraction method live in `research/creative-assignment/` and `dist/assignment-responses.json`. The reference image and measured rectangles live in `research/bentos/`. Desktop (1440 px) and mobile (390 px) review captures are recorded as `.impeccable/review/{responses,colours,patterns,bentos}-{desktop,mobile}.jpg`; runtime and live-deployment checks are separate from these visual captures.

DESIGN.md and `.impeccable/design.json` remain the incumbent system; this extension does not regenerate or replace them. Publish only to `NPCLABS-19/childhood-brand-atlas` on GitHub Pages, preserving `gh-pages` history without a force push. Deployment and live-route verification must be recorded by the release task before claiming the update is live.
