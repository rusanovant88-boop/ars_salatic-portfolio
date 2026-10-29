# SALATIC Portfolio

**Version 0.1: first screen only**, based on the three Figma-exported PDF artboards provided by Anton Rusanov. The scene intentionally reproduces the original layout rather than redesigning it.

## Interactions

- Hover/focus on the central `works` folder to show Salatic emerging from it.
- The eyes at the top-right follow the pointer within a restrained range.
- Hover/focus on **bonya.** in the biography to display the photo in the center; tap/click to pin or unpin.
- Clicking `works` shows a brief `works / coming next` note. The real Finder window will be implemented only after the next Figma artboards are provided.

## Files

- `index.html` — semantic markup and exact text.
- `styles.css` — fixed 1440 × 900 composition scaled to available desktop viewport.
- `script.js` — cursor, hover/touch behaviors and viewport fitting.
- `assets/works-folder.webp` — extracted from Frame 1.pdf.
- `assets/salatic-portrait.webp` — extracted from Frame 2.pdf.
- `assets/bonya-card.webp` — exact rotated cutout from Frame 3.pdf.
- `assets/salatic-signature.webp` — extracted from Frame 1.pdf.

No external frameworks or trackers. GitHub Pages can host this as a static site from the repository root.

**Mobile note:** a separate mobile composition has not yet been supplied; for now the desktop artboard scales uniformly to fit smaller screens. This deliberately avoids guessing a mobile redesign.

## Preview locally

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000`.
