import re
import time

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Add cache-buster to index.js
html = re.sub(r'<script src="js/index.js[^>]*></script>', f'<script src="js/index.js?v={int(time.time())}"></script>', html)

# Add "SEASON COMPLETE" badge if not present.
# The user wants "CURRENT SEASON 2026 \n 🏆 SEASON COMPLETE"
# I will add a placeholder for it that js/index.js can show/hide.
if 'id="season-status"' not in html:
    html = html.replace('CURRENT SEASON 2026', 'CURRENT SEASON 2026 <br><span id="season-status" style="display:none; color:var(--gold); font-size:1.2rem; margin-top:0.5rem; display:inline-block;">🏆 SEASON COMPLETE</span>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
