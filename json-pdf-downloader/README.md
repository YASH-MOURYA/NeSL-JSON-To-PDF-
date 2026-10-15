# JSON PDF Downloader (React + Vite)

Paste a NeSL submitted JSON, extract the Base64 PDFs, preview them, and download the selected ones as individual PDFs or as one ZIP.
Everything runs in the browser, so there is **no backend** to host.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
```

## Deploy on Netlify

**Git:** push this folder to GitHub, then in Netlify choose *Add new site*, *Import from Git*.
`netlify.toml` already sets build command `npm run build` and publish directory `dist`.

**Drag & drop:** run `npm run build`, then drop the `dist` folder on https://app.netlify.com/drop.

## Project structure

```
src/
  App.jsx                    state + layout
  components/InputPanel.jsx  transaction id, JSON box, buttons
  components/DocumentCard.jsx  resizable card + live PDF preview
  lib/documents.js           JSON to documents (pure, no React)
  lib/download.js            downloads PDFs directly or as a ZIP
  pages/Privacy.jsx, Terms.jsx  legal pages
  site.js                    operator name and contact email
  styles.css
public/
  favicon.svg, _redirects
```

## Notes

- File names: `<DDE Transaction ID>_<documentId>.pdf`; ZIP name: `<txnID from JSON>.zip` (same as the old app).
- Download options: **Download PDFs** saves every selected PDF as its own file, **Download ZIP** bundles them, and each card has its own **Download** button. Chrome may ask once to allow multiple downloads.
- Resize a card by dragging its bottom-right corner; double-click the corner to reset.
- Live preview uses the browser's built-in PDF viewer inside an `<iframe>`. Desktop Chrome, Edge, Firefox and Safari work; some mobile browsers only show the first page or offer a download instead.

## Before launch

- [ ] Fill in `operator` and `contactEmail` in `src/site.js` (used by /privacy and /terms).
- [ ] Have the Privacy Policy and Terms reviewed against your situation and jurisdiction.
- [ ] Connect your custom domain in Netlify (*Domain management*), and enable HTTPS.
- [ ] Confirm the favicon shows on the deployed site.
- [ ] Confirm no "Made with" badge or third-party script is on the page.
