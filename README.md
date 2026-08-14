# Marks Entry — DU MBBS

A camera-first web app for fast data entry of handwritten exam marks into the
Dhaka University Final Professional MBBS tabulation sheet. Runs entirely in your
phone's browser.

## Flow
1. **Load your Excel workbook** (`.xlsx`) — read locally, nothing uploaded.
2. **Pick photo or manual** entry (photo preferred).
3. **Add a label** (e.g. `medicine 2nd paper A`) — the app resolves the exact
   spreadsheet column automatically (Medicine / Surgery / Obs & Gynae all mapped).
4. **Snap the strips** (multiple at once — a group is usually 4 strips). OCR reads
   the roll number and mark off each strip; you confirm, then it writes into the cells.
5. **Split screen**: a draggable Excel-style grid preview on top shows the marks
   landing in the real cells; a chat-style photo+label feed on the bottom.
6. **Download the filled `.xlsx`** — the university logos and formatting are kept
   perfectly intact (cells are edited at the byte level, not through a converter).

## Recognition
Photo/OCR mode uses your own free **Google Gemini** key (aistudio.google.com/apikey),
set in Settings. Manual tap-pad mode needs no key.

## Files
- `index.html` — the entire app (single self-contained file, loads JSZip from CDN).

## Privacy
Everything runs in your browser. The workbook never leaves your device; only a
photo you choose to scan is sent to Google's Gemini API using your own key.
