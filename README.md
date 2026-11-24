# Chord Chart Builder

An installable web app for building chord charts: paste or import lyrics, place chords on syllables, transpose, and export PDFs for Planning Center.

- Works offline once opened. Install it from the browser (Edge/Chrome on Windows: the install icon in the address bar; iPad Safari: Share > Add to Home Screen).
- Songs are stored on the device. Use **Songs > Back up library** to save a copy, and **Import** that file to restore it.
- No songs or lyrics are kept in this repository.

## Files
- `index.html`: the whole app (one file).
- `sw.js`: offline support. `manifest.webmanifest` + `icons/`: install details.
- `fonts/`: fonts embedded in exported PDFs (SIL Open Font License).
- `vendor/`: jsPDF, JSZip and pdf.js, shipped with the app so import and export work offline.
- Sync between devices: put the Firebase web config in `firebase-config.js` (`window.CCB_FIREBASE = {...}`), then use **Songs > Sign in to sync**. Database rules are in `tools/firestore.rules`.

## Updating
`tools/source.html` is the app source (the same file runs as a Claude artifact). `tools/build.sh tools/source.html <outdir>` rebuilds `index.html` and `sw.js`; it expects `fonts/` and `vendor/` next to the source.
