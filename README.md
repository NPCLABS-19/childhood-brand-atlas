# Children & teens — 19 studio

A visual and strategic study of 21 brands: eight original children’s lifestyle brands, seven care/protection/cosmetic brands and six teenage profiles. Covers perception, audience, tone, identity, archetype, illustration and product range, with verified Thingtesting context where available.

## Run locally

```sh
npm run dev
```

Open http://localhost:4319. The site uses static HTML, CSS and JavaScript modules; no build or dependencies are required.

For the current local review:

- Children’s care: http://127.0.0.1:4319/#index/care
- Teenagers: http://127.0.0.1:4319/#teens

This version was reviewed locally and approved for publication to GitHub Pages.

## Publish

Deploy exclusively to GitHub Pages in `NPCLABS-19/childhood-brand-atlas`.

```sh
npm run check
git add .
git commit -m "Update brand study"
git push github main
git subtree split --prefix=dist
```

Push the SHA printed by the final command to the `gh-pages` branch. Pages serves `/` from that branch. Keep source on `main` and publish only the contents of `dist`.

Brand facts are linked to official sources. Perception, target groups, archetypes and spectrum placement are editorial interpretations, not consumer research. Original image URLs are recorded in `asset-provenance.json` and `dist/credits.js`.
