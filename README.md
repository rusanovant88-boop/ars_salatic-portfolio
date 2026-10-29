# SALATIC Portfolio

**Version 0.5: list-style Works window and the first Setka case**, based on the three Figma-exported PDF artboards provided by Anton Rusanov. The scene intentionally reproduces the original layout rather than redesigning it.

## Interactions

- Hover/focus on the central `works` folder to show Salatic emerging while preserving the exact original folder size.
- Hover/focus on Salatic's original signature to play a faithful, pixel-derived handwriting animation. All strokes are revealed continuously with no final-image pop; after playback the original signature remains visible.
- The eyes at the top-right follow the pointer within a restrained range.
- Hover/focus on **bonya.** in the biography to display the photo in the center; tap/click to pin or unpin.
- Clicking `works` breaks the visible header and biography into falling letters. Eyes and folder vanish; the original Salatic signature shrinks and moves to the upper left.
- After the letters fall, a simple list window in the visual style of the Setka case PDF appears. The logo remains small at the upper left.
- Click Setka to view the original case description and a Vimeo player. The other two videos and KV are placeholder panels pending supplied media. The two additional rows in the works list are explicitly placeholders, not invented projects.

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

### v0.5 / Changes
This version adds a list-based Finder window with the same cyan outline, black background and three macOS-style dots seen in Frame 4. Only one real project, Setka Career Jungle, is published in the list. Vimeo video ID 1240745678 is embedded on the Setka case page. Two additional videos and a key visual are clearly marked as upcoming. The previous version can be restored from commit 860a1dc9a3dd93efd578a4275e2ec06bab8e08c2. Vimeo playback depends on video embed permissions.

### v0.5.1 / PDF geometry and typography fixes
- The supplied Frame 4.pdf measures 1440 × 900. It specifies **16 px** regular text throughout the left case column, with **19 px** line spacing. The case title and role are no longer bold.
- Consistent 16 px / 400 / 19 px typographic system is also applied to Finder filenames, labels, metadata and footer.
- `[hidden]` now reliably hides the Works list, so the case shows only **one** blue-outlined window.
- The Vimeo media region now matches the reference precisely: **1033 × 581 px**, at reference coordinates x380, y159. The frame is 16:9; `transparent=0` gives black, not white, fallback pillarboxing. No crop or video zoom is used.
- Previous version can be restored with a revert of this commit.

### v0.5.2 / All three Setka videos
- Media 01: Vimeo [1240745678](https://vimeo.com/1240745678)
- Media 02: Vimeo [1240745680](https://vimeo.com/1240745680)
- Media 03: Vimeo [1240745679](https://vimeo.com/1240745679)
- Media 04: KV pending. Arrows cycle through all four items; switching videos removes the previous iframe, stopping its playback. No original MP4 is committed to GitHub.

### v0.5.3 / Setka KV assets
The gallery is now 6 slides in the supplied order: Vimeo 1240745678, 1240745680, 1240745679, and three original Setka key visuals:
- `assets/setka-kv-01.webp` — Свяжись с нанимающим напрямую
- `assets/setka-kv-02.webp` — Получи признание в индустрии
- `assets/setka-kv-03.webp` — Заведи полезные связи

The images are optimized, full-size (2048px wide), and prepared as a separate upload package. **Important:** This connector cannot transfer uploaded image binaries into the GitHub repository, so these files must be uploaded manually to the existing `assets/` directory. Until then, the gallery shows a clearly labeled placeholder rather than a broken image. No cropping or aspect ratio change.

### v0.5.4 / Fullscreen + window alignment
- All three Setka KV images are now present in `assets/` and can be opened fullscreen by clicking the picture or the expand icon at the upper right of the media window.
- The same expand icon also expands the Vimeo player; the player retains its own native controls.
- Fullscreen is native (Fullscreen API), has an exit button, and supports Escape; images retain their 16:9 ratio against a black background.
- The Finder list window and the case window now share the **identical outer rectangle**: x=380, y=60, width=1033, height=760 on the 1440×900 artboard. Both top bars are 98 px tall, so the three traffic lights and blue border no longer jump.
- The prior working version is `f5dba7e`, and changes can be reverted without force-pushing history.

### v0.5.5 / KV-only fullscreen cursor
- Removed the overlaid fullscreen icon from the media area. Vimeo retains its own built-in fullscreen control, with no extra button above it.
- Hovering over any of the three KV images now shows the small custom cyan magnifying-glass cursor (`assets/zoom-cursor.svg`), matching the site's blue-on-black color palette. The native zoom-in cursor is the fallback.
- Click a KV to open native fullscreen. Click the KV a second time or press Escape to leave. No thumbnail position, artwork size, or window geometry changed.
- Previous v0.5.4 commit: `b23949be8a1997a4581d914155831ce8e5f7af44`.

### v0.5.6 / Shy eyes interaction
Hovering over the eyes at the top-right gently scales them to 1.27×, adds two pink cheek blushes, and shifts both pupils inward/downward as if embarrassed. On pointer exit they return to their original scale, lose the blush and resume following the cursor. No other page elements were changed. Reduced-motion preferences disable the scale transition.

### v0.5.7 / Case hover and squinting eyes
Setka row now displays a small, rotated thumbnail from the already uploaded setka-kv-01.webp on the left side of the list window. It has no pointer hit area and hides on exit or navigation. Eyes enlarge by 27% and squint vertically, with no blush or downward shy gaze. Original pupils continue following the cursor. Previous revision: 9ca65b3.

### v0.5.8 / Weighted letter fall + aligned case preview
- Letter drop is now roughly 0.6–0.85 seconds (instead of 1–2 seconds), with a short stagger and accelerating gravity-like easing. Reduced horizontal drift and spin keep letters heavy rather than confetti-like. The SALATIC signature travels in 0.72 seconds to arrive with the falling type.
- Setka hover preview is aligned to the actual mini SALATIC signature: reference left x=27. It now sits below the logo at y=158, width=305, within the existing left column (Finder starts at x=380). Only the original KV is tilted -5 degrees. A straight, regular-weight 16px caption names the case and role, preserving the site's reference typography.
- No changes to the case screen, video playback, KV fullscreen, eyes or original landing layout.
