import re

# Fix index.html
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Change IDs to match js/index.js and add the missing heading ID
html = html.replace('id="upcoming-home-matches-grid"', 'id="upcoming-home"')
html = html.replace('id="upcoming-all-matches-grid"', 'id="upcoming-other"')
html = html.replace('<span>📅</span> Upcoming Fixtures', '<span>📅</span> <span id="other-fixtures-heading">Upcoming Fixtures</span>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

# Let's double check js/index.js error handling for these IDs as well
with open('js/index.js', 'r', encoding='utf-8') as f:
    js = f.read()

# I will also make sure showError uses the correct new IDs if they weren't already
# It already uses ['upcoming-home', 'upcoming-other'] which now match the HTML.
