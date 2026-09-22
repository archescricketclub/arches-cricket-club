import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Find the ticker-track div and empty its content
html = re.sub(r'<div class="ticker-track">[\s\S]*?</div>\s*</div>', '<div class="ticker-track" id="dynamic-ticker"></div>\n        </div>', html)

# Change headings for upcoming if necessary? I'll do this in JS, or I'll add IDs to the headings so JS can modify them.
# The headings are:
# <h3 style="..." class="reveal"> Upcoming Home Fixtures
# <h3 style="..." class="reveal"> Upcoming Fixtures
html = html.replace('Upcoming Home Fixtures', '<span id="home-fixtures-heading">Upcoming Home Fixtures</span>')
html = html.replace('>Upcoming Fixtures<', '><span id="other-fixtures-heading">Upcoming Fixtures</span><')

# For the Next Match heading
html = html.replace('<div class="hfc-label">Next Match</div>', '<div class="hfc-label" id="hero-next-heading">Next Match</div>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
