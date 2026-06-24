// scripts/write_last_update.js
// Writes a JSON file that the front‑end can read to display the last run time.

const fs = require('fs');
const path = require('path');

// ISO‑8601 UTC timestamp (e.g. 2026-06-24T13:48:00Z)
const now = new Date().toISOString();

const out = {
  lastUpdated: now
};

// Write to the public folder (this is what GitHub Pages serves)
const outPath = path.resolve(__dirname, '..', 'public', 'data', 'last_update.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));

console.log(`Wrote ${outPath}`);
