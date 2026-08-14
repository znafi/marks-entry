# Marks Entry — DU MBBS

A camera-first web app for fast entry of handwritten exam marks into the Dhaka
University Final Professional MBBS tabulation sheet. Load your workbook, snap the
strips, watch the marks land in the real cells, download the filled `.xlsx`.

## Architecture
- `index.html` — the whole frontend (single file; loads JSZip from CDN).
- `api/ocr.js` — a serverless function (Vercel) that reads the strips with Google
  Gemini. **The API key lives on the server**, so the app never asks users for a key.

## Deploy (Vercel)
1. Import this repo at vercel.com (New Project → Import Git Repository).
2. In Project → Settings → Environment Variables, add:
   - `GEMINI_API_KEY` = your Google AI Studio key
   - (optional) `GEMINI_MODEL` = `gemini-2.0-flash`
3. Deploy. Use the resulting `*.vercel.app` URL for photo mode.

Manual tap-pad entry works anywhere (no server needed). Photo mode needs the
Vercel deployment because that is where the key is stored.

## Privacy
The workbook is read and filled entirely in your browser and never uploaded.
Only the photo you scan is sent to the server, which forwards it to Gemini.
The filled `.xlsx` keeps the university logos and formatting intact (cells are
edited at the byte level).
