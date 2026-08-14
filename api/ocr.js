// Serverless OCR proxy — keeps the Gemini API key server-side, with automatic
// retry/backoff for transient overload (429/500/502/503) responses.
// Set GEMINI_API_KEY (and optionally GEMINI_MODEL) in Vercel → Settings → Environment Variables.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'POST only' }); return; }

  const key = process.env.GEMINI_API_KEY;
  if (!key) { res.status(500).json({ error: 'Server is missing GEMINI_API_KEY. Add it in Vercel → Settings → Environment Variables, then redeploy.' }); return; }

  try {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
    const imageBase64 = body && body.imageBase64;
    const mimeType = (body && body.mimeType) || 'image/jpeg';
    if (!imageBase64) { res.status(400).json({ error: 'No image sent.' }); return; }

    const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
    const prompt =
      "This is a handwritten exam mark strip with two columns: Roll No on the left and obtained mark on the right. " +
      "Read every filled data row top to bottom. Marks are numbers, often ending in .5 (a mark written with an apostrophe or dot like 22-5 means 22.5). " +
      "If a roll has no mark / is blank, use null for mark. Ignore header rows and any signature at the bottom. " +
      "Return ONLY a JSON array like [{\"roll\":1573,\"mark\":22.5},{\"roll\":1574,\"mark\":null}].";

    const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent';
    const gemBody = {
      contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: imageBase64 } }] }],
      generationConfig: { temperature: 0, response_mime_type: 'application/json' }
    };

    // Retry transient failures with exponential backoff + jitter.
    const RETRYABLE = new Set([429, 500, 502, 503]);
    const MAX_ATTEMPTS = 5;
    let r = null, lastDetail = '', lastStatus = 0;
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      if (attempt > 0) await sleep(Math.min(500 * Math.pow(2, attempt - 1), 4000) + Math.floor(Math.random() * 250));
      try {
        r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key }, body: JSON.stringify(gemBody) });
      } catch (netErr) { lastDetail = 'network: ' + String(netErr && netErr.message); lastStatus = 0; continue; }
      if (r.ok) break;
      lastStatus = r.status;
      lastDetail = (await r.text()).slice(0, 400);
      if (!RETRYABLE.has(r.status)) {
        res.status(502).json({ error: 'Gemini API ' + r.status, detail: lastDetail });
        return;
      }
      // else loop and retry
    }

    if (!r || !r.ok) {
      res.status(503).json({ error: 'Gemini is briefly overloaded (high demand). Your photos are still here — just tap Read again in a moment.', detail: lastDetail, lastStatus });
      return;
    }

    const data = await r.json();
    let txt = (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0].text) || '';
    txt = txt.replace(/```json/gi, '').replace(/```/g, '').trim();
    let arr;
    try { arr = JSON.parse(txt); } catch (e) { res.status(502).json({ error: 'Could not parse model output', raw: txt.slice(0, 400) }); return; }
    if (!Array.isArray(arr)) { res.status(502).json({ error: 'Unexpected model output' }); return; }
    res.status(200).json({ pairs: arr });
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
};
