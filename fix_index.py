import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace script tag
html = html.replace('<script src="js/dls.js"></script>', '<script src="js/index.js"></script>')

# Remove 0 trophies section in hero stats
# The trophies section is: <div class="hero-stat-number" data-target="1">0</div>\n<div class="hero-stat-label">Trophy</div>
html = re.sub(r'<div class="hero-stat-number" data-target="1">0</div>\s*<div class="hero-stat-label">Troph[^<]*</div>', '', html)

# Replace other 0 with - in hero stats
html = re.sub(r'(id="hero-stat-matches"[^>]*>)0(<)', r'\g<1>-\g<2>', html)
html = re.sub(r'(id="hero-stat-victories"[^>]*>)0(<)', r'\g<1>-\g<2>', html)
html = re.sub(r'(id="hero-stat-squad"[^>]*>)0(<)', r'\g<1>-\g<2>', html)

# Remove 0 trophies section in section stats
html = re.sub(r'<div class="stat-num"><span class="count" data-target="1">0</span></div>\s*<div class="stat-label">Troph[^<]*</div>', '', html)
# We also have to remove the containing column if there is one. Looking at grep, they are just inside divs. I will let regex do its thing.
html = re.sub(r'<div class="stat-col">\s*<div class="stat-num"><span class="count" data-target="1">0</span></div>\s*<div class="stat-label">Troph[^<]*</div>\s*</div>', '', html)


# Replace other 0 with - in section stats
html = re.sub(r'(id="stats-matches"[^>]*>)0(<)', r'\g<1>-\g<2>', html)
html = re.sub(r'(id="stats-victories"[^>]*>)0(<)', r'\g<1>-\g<2>', html)
html = re.sub(r'(id="stats-squad"[^>]*>)0(<)', r'\g<1>-\g<2>', html)

# Replace 2025 Season with CURRENT SEASON 2026
html = html.replace('2025 Season', 'CURRENT SEASON 2026')
html = html.replace('04 Apr 2026', '-')
html = html.replace('Arches-1 vs Arches-2 &middot; T20', '-')
html = html.replace('Arches-1 vs Arches-2 · T20', '-')

# Replace Loading home matches... with spinner
spinner_html = '<div class="loading-state" style="padding: 2rem;"><div class="spinner"></div><p>Loading home matches...</p></div>'
html = html.replace('<div style="grid-column:1/-1;text-align:center;color:var(--muted);">Loading home matches...</div>', spinner_html)

spinner_html_overall = '<div class="loading-state" style="padding: 2rem;"><div class="spinner"></div><p>Loading overall matches...</p></div>'
html = html.replace('<div style="grid-column:1/-1;text-align:center;color:var(--muted);">Loading overall matches...</div>', spinner_html_overall)


with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
