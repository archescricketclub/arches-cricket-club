import time

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('<link rel="stylesheet" href="styles.css">', f'<link rel="stylesheet" href="styles.css?v={int(time.time())}">')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
