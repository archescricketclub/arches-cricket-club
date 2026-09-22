import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Add cache-buster to index.js
html = html.replace('<script src="js/index.js"></script>', '<script src="js/index.js?v=' + str(int(time.time())) + '"></script>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
