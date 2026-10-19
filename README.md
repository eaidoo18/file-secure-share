# Secure Share

Static site. Adds a password (AES-256 PDF encryption), watermark and "Valid until" line to a PDF, entirely in the browser. No backend, no uploads, no analytics.

## Deploy to Vercel
1. `npm i -g vercel`
2. In this folder run `vercel --prod` (accept the defaults: no framework, no build command, output directory `.`).

Or push the folder to GitHub and import it at vercel.com/new (Framework: Other).

## Updating
Service worker caches files. After changing any file, bump `V` in `sw.js` (for example `secure-share-v2`) so visitors get the update.

## Notes
- `vendor/pdf-lib.min.js` is @cantoo/pdf-lib 2.11.1 (MIT), bundled so the site has no third-party requests. CSP in `vercel.json` blocks everything except the site's own files.
- The "Valid until" date is printed text, not enforced.
