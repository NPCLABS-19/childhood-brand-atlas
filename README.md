# Children & teens — 19 studio

A visual and strategic study of 21 brands, with a working creative-assignment archive and a shared Bento board. The brand study includes eight children’s lifestyle brands, seven care/protection/cosmetic brands and six teenage profiles, with verified Thingtesting context where available.

## Run locally

```sh
npm run dev
```

Open http://localhost:4319. The site uses static HTML, CSS and JavaScript modules; no build or package installation is required.

Useful routes:

- Children’s care: http://127.0.0.1:4319/#index/care
- Teenagers: http://127.0.0.1:4319/#teens
- WIP → Amaira → Responses: http://127.0.0.1:4319/#wip/amaira/responses
- Amaira’s colours: http://127.0.0.1:4319/#wip/amaira/colours
- Amaira’s patterns: http://127.0.0.1:4319/#wip/amaira/patterns
- Bento editor: http://127.0.0.1:4319/#bentos

## WIP and Bentos

WIP preserves Amaira’s 17 November 2026 form submission: all 15 prompts, 13 image responses, the Adidas / Oreo / Disney ranking for question 11 and the unanswered question 13. Open a response for its full prompt and submitted image. The responses JSON, full-size PNGs, eight sampled colours and five direct pattern crops are downloadable. See [the source and extraction notes](research/creative-assignment/README.md).

Bentos uses the exact nine-tile [Theaterbaren reference](https://www.rebrand.gallery/bento/theaterbaren) geometry recorded in [layout.json](research/bentos/layout.json): a 1080 × 1080 white canvas, 40 px outer margin, 12 px gaps and corner radius, and rows of 356 / 264 / 356 px. Each tile accepts a PNG, JPEG, WebP, GIF, MP4 or WebM, with complete-image or fill mode, crop position and background colour. Limits are 20 MB per file and 60 MB of uploaded media per board.

Edits save as a draft in this browser’s IndexedDB. **Download project** exports portable JSON containing every tile’s media; **Import project** restores it as a draft. **Download image** exports a 2160 × 2160 PNG; motion tiles use the current frame. **Preview** hides editing controls, and motion can be paused. **Load published board** replaces the local draft only after confirmation when it has changes.

### Publish a board

The public site is [NPCLABS-19’s GitHub Pages project](https://npclabs-19.github.io/childhood-brand-atlas/). Changes become shared only after **Publish to everyone** finishes.

1. Choose **Connect GitHub**. Use a fine-grained token restricted to `NPCLABS-19/childhood-brand-atlas`, with **Contents: Read and write** and **Pages: Read and write**. The connected account must have repository write access.
2. Publish the draft. The token stays in page memory, is sent only to `api.github.com`, and is cleared by disconnecting or reloading. It is never placed in the board, project download, browser storage or repository.
3. Wait for the publishing message. A successful source commit and a live Pages build are separate stages; the editor checks the build for the exact `gh-pages` commit before saying the board is live.

The publisher in [bento-publish.js](dist/bento-publish.js) checks the loaded board’s `updatedAt` against the current board on `main`. A newer remote board stops publication before assets are written. Download the draft, then load the latest published board before reconciling changes. Uploaded media gets a SHA-256 filename, duplicate uploads share one asset, and the board plus media enter `main` in one commit while preserving the rest of the repository.

The publisher then mirrors the current `dist` tree into a new commit whose parent is the existing `gh-pages` head, updates that branch with `force: false`, and requests a Pages build. No new workflow or alternate hosting service is involved. If the source commit succeeds but Pages fails, the editor keeps the saved board’s version and the draft so **Publish to everyone** can be retried. A lost branch-write response is checked against the branch head before being treated as a failure.

### Maintain and release the site

Deploy exclusively through `NPCLABS-19/childhood-brand-atlas` on GitHub Pages. Source lives on `main`; Pages serves `/` from `gh-pages`, whose root must equal the current `dist` tree.

Before a source release, fetch the latest `main` and retain board/media commits made through the live editor. Run the checks, review the intended diff, then commit and push the source:

```sh
npm run check
node --test tests/bento-publish.test.mjs
```

Release the pushed source with the same Git-data operation used by `publishToPages` in [bento-publish.js](dist/bento-publish.js): read current `main`, read its `dist` tree SHA and the current `gh-pages` head, create a commit using that tree and that Pages parent, update `gh-pages` without force, then request a Pages build. If either head changes, reread it and retry rather than overwriting it. Verify the Pages build for the exact new commit and check the live routes before calling the release complete.

Do not force-push `gh-pages` or replace it with a detached `git subtree split` history. That would discard the shared publisher’s branch history and can overwrite a newer board.

## Evidence and design

Brand facts are linked to official sources. Perception, target groups, archetypes and spectrum placement are editorial interpretations, not consumer research. Original image URLs are recorded in `asset-provenance.json` and `dist/credits.js`.

[PRODUCT.md](PRODUCT.md) records product scope; [DESIGN.md](DESIGN.md) remains the incumbent visual system. WIP and Bentos are an ordinary extension of its grey ground, Haas typography, fine rules and visible text navigation. The reference’s white Bento canvas and rounded tiles are a specific requested composition, not a general card style. Desktop and mobile review captures for Responses, Colours, Patterns and Bentos are stored in `.impeccable/review/`.
