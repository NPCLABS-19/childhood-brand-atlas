# Children’s lifestyle — 19 studio

A visual and strategic study of eight children's lifestyle brands, covering perception, audience, tone, identity, archetype, illustration and product range.

## Run locally

```sh
npm run dev
```

Open http://localhost:4319. The site uses static HTML, CSS and JavaScript modules; no build or dependencies are required.

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
