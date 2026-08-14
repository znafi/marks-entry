# Marks Entry — DU MBBS

A mobile-first web app for fast data entry of handwritten exam marks into the
Dhaka University Final Professional MBBS tabulation sheet.

## What it does
- Type a paper label (e.g. `medicine 2nd paper B-1`) — the app resolves the exact
  spreadsheet column automatically (Medicine, Surgery, Obs & Gynae all mapped).
- Set the first roll number; enter marks with a big tap-pad while the roll
  **auto-advances** to the next student.
- Half-marks (`.5`), **Absent**, **Skip**, edit and undo all supported.
- Optional AI photo-scan (bring your own free Google Gemini key) reads a whole
  strip at once for you to confirm.
- Export a CSV tagged with the target column, ready to merge into the master workbook.
- Progress is saved in your browser, so a refresh never loses your work.

## How to use it
Open `index.html` in a mobile browser (or use the live GitHub Pages link).
Add it to your home screen to use it like an app. Works fully offline for
manual entry; the AI scan needs a network connection and a Gemini key.

## Files
- `index.html` — the entire app (single self-contained file, no build step, no server).

## Privacy
Everything runs in your browser. No data is sent anywhere except, if you enable
AI-assist, the photo you choose to scan (sent to Google's Gemini API using your
own key).
