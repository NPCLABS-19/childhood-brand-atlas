# Creative assignment source and extracts

The WIP archive captures one submission by Amaira on 17 November 2026, imported on 20 November 2026. It includes all 15 questions, 13 image attachments and one written ranking. Question 11 is Adidas, Oreo, Disney in that order; no reason for the first choice was supplied. Question 13 has neither text nor an attachment and remains visibly unanswered.

The [source form](https://docs.google.com/forms/d/e/1FAIpQLSdXNqOqTKnpnOQYFCgcDeDB5lbkdJP_dLycVIGOf6CVdrWicA/viewform) and attachment URLs are retained in [`dist/assignment-responses.json`](../../dist/assignment-responses.json), alongside prompts, filenames, image dimensions and accessible descriptions. [`dist/assignment-responses.js`](../../dist/assignment-responses.js) supplies the renderer’s static module data. Keep the JSON and module consistent when importing a later submission; the current site does not synchronize Forms responses automatically. The contributor name is the submitted response name; uploaded filenames are preserved as supplied.

## Files and provenance

- [`asset-provenance.json`](asset-provenance.json) maps the 13 downloaded attachments to their published PNGs and WebP previews. `downloadedSha256` identifies the downloaded bytes; `publishedSha256` identifies the losslessly re-encoded PNG with embedded provenance. The recorded transform states that decoded pixels, mode and dimensions were checked for equivalence. Different file hashes are expected after that metadata/re-encoding step.
- [`dist/assignment/amaira/`](../../dist/assignment/amaira/) contains the full-size PNGs, lightweight WebP previews and preview provenance sidecars. Full-size view/download actions use PNGs; the overview uses previews.
- [`extraction-method.json`](extraction-method.json) records eight working colour values and five pattern crop rectangles. [`dist/amaira-extractions.js`](../../dist/amaira-extractions.js) supplies that content to the WIP views.
- [`dist/assignment/amaira/extracted/`](../../dist/assignment/amaira/extracted/) contains the downloadable palette, direct PNG pattern crops, WebP previews and preview sidecars.

## Colour and pattern method

The colour values are median saturated pixel samples from the supplied artwork, excluding paper and dark backgrounds. Six colours cite bounded regions in question 9’s shape study; sign red cites question 5 and bag orange cites question 7. The latter two currently have `sampleBounds: null`, so do not infer exact sampling rectangles for them. These are working references from photographs/renders, not calibrated physical colour measurements or a declared interface theme.

The five patterns are direct crops from question 9’s full-size image, preserving the submitted marks and paper texture. Crop rectangles in `extraction-method.json` use original-image pixel coordinates `[left, top, right, bottom]`; width and height equal the differences between those bounds. Nothing in these strips was redrawn or completed. Link any new extract to its source question, record the method/bounds and retain a full-size download.

## Presentation and review

WIP is nested as `#wip/amaira/responses`, `#wip/amaira/colours` and `#wip/amaira/patterns`; a question uses a route such as `#wip/amaira/question-9`. Responses preserve missing-answer states, full prompts and source filenames. The archive retains the existing grey ground, Haas typography, open grids and visible text navigation.

Review screenshots for these three views are stored under `.impeccable/review/` with desktop/mobile suffixes. The independent Bento reference and exact nine-tile geometry are recorded in [`research/bentos/layout.json`](../bentos/layout.json). Bento assembly is studio-authored working composition; it does not change the submitted response record. See the [project README](../../README.md) for browser drafts, portable project files and GitHub Pages publishing.
