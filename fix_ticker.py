import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

ticker_html = """
            <div class="ticker-item"><span class="ticker-sep"></span> 🏏 Arches CC vs Ards & Donaghadee — 02 May 2026 — Comber</div>
            <div class="ticker-item"><span class="ticker-sep"></span> NIMACC  vs Arches CC — 16 May 2026 — TBC</div>
            <div class="ticker-item"><span class="ticker-sep"></span> Arches CC vs Drumaness Superkings — 23 May 2026 — Drumaness</div>
            <div class="ticker-item"><span class="ticker-sep"></span> Belfast Superkings vs Arches CC — 30 May 2026 — TBC</div>
            <div class="ticker-item"><span class="ticker-sep"></span> Amigos Belfast  vs Arches CC — 13 Jun 2026 — Home</div>
            <div class="ticker-item"><span class="ticker-sep"></span> Arches CC vs Dundrum — 20 Jun 2026 — Dundrum</div>
"""

# Find the ticker-track div and replace its content
html = re.sub(r'<div class="ticker-track">[\s\S]*?</div>\s*</div>', '<div class="ticker-track">' + ticker_html + '</div>\n        </div>', html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
