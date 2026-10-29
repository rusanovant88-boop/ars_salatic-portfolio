# SALATIC Portfolio

**Version 0.4: falling-letter transition to the future Works stage**, based on the three Figma-exported PDF artboards provided by Anton Rusanov. The scene intentionally reproduces the original layout rather than redesigning it.

## Interactions

- Hover/focus on the central `works` folder to show Salatic emerging while preserving the exact original folder size.
- Hover/focus on Salatic's original signature to play a faithful, pixel-derived handwriting animation. All strokes are revealed continuously with no final-image pop; after playback the original signature remains visible.
- The eyes at the top-right follow the pointer within a restrained range.
- Hover/focus on **bonya.** in the biography to display the photo in the center; tap/click to pin or unpin.
- Clicking `works` breaks the visible header and biography into falling letters. Eyes and folder vanish; the original Salatic signature shrinks and moves to the upper left.
- A completely black stage remains with only the small Salatic logo. Clicking it (or pressing Escape) returns home. The actual works window will follow the user's new Figma design.

## Files

- `index.html` — semantic markup and exact text.
- `styles.css` — fixed 1440 × 900 composition scaled to available desktop viewport.
- `script.js` — cursor, hover/touch behaviors and viewport fitting.
- `assets/works-folder.webp` — extracted from Frame 1.pdf.
- `assets/salatic-portrait.webp` — extracted from Frame 2.pdf.
- `assets/bonya-card.webp` — exact rotated cutout from Frame 3.pdf.
- `assets/salatic-signature.webp` — extracted from Frame 1.pdf.
- `assets/salatic-signature-writing.webp` — progressive handwriting animation derived pixel-for-pixel from the original signature (88 frames, ~4.2 seconds).

No external frameworks or trackers. GitHub Pages can host this as a static site from the repository root.

**Mobile note:** a separate mobile composition has not yet been supplied; for now the desktop artboard scales uniformly to fit smaller screens. This deliberately avoids guessing a mobile redesign.

## Preview locally

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Version history / rollback

The original, working v0.1 is commit [`ffcab5d`](https://github.com/rusanovant88-boop/ars_salatic-portfolio/commit/ffcab5dcdc64af48f82a1298ff0e9b57f9c5f807). Use **Revert** to create a new commit undoing this revision, or ask ChatGPT to revert it. Reverting is safer than resetting/force-pushing history.

v0.2 keeps the Figma composition and source images. The folder-size fix isolates the person from the combined original portrait at runtime using an in-memory canvas, with a fallback to the source image.

### v0.3 animation fix
The first v0.2 animation used manually approximated paths. That caused missing strokes and a sudden reveal at the end. v0.3 replaces the paths with a prerendered animated WebP derived from every painted pixel in the original signature. The previous site is still in commit [`1e1c4d5`](https://github.com/rusanovant88-boop/ars_salatic-portfolio/commit/1e1c4d5bb28382560affb1bc308d2d641eb2ad68). The animated image is loaded once; a fresh object URL starts every replay, and `prefers-reduced-motion` is respected.

### v0.4 transition / rollback

The original 1440 × 900 design is unchanged before the click. JavaScript measures each glyph with DOM Range, so it falls from its exact rendered location without changing the HTML text. The animated particles are removed after about two seconds, with an immediate alternative for reduced-motion users. No additional libraries or hosting costs. [Previous v0.3 commit](https://github.com/rusanovant88-boop/ars_salatic-portfolio/commit/eacf139d98321c2dceb7a58578d663f51df660c4) can be restored by a safe revert.
