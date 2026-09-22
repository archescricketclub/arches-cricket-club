import re

with open('players.html', 'r', encoding='utf-8') as f:
    html = f.read()

target = '''<div class="search-box">
                        <i class="fa-solid fa-magnifying-glass search-icon"></i>
                        <input type="text" id="careerSearchInput" placeholder="Search player name..." aria-label="Search by player name" oninput="filterCareerStats()">
                        <i class="fa-solid fa-search"></i>
                    </div>'''

replacement = '''<div style="display:flex; gap:1rem; align-items:center; flex-wrap: wrap;">
                        <select id="careerSeasonFilter" class="form-select" onchange="filterCareerStats()" style="padding: 0.5rem; border-radius: 4px; border: 1px solid var(--border); background-color: var(--surface); color: var(--text);">
                            <option value="all">All Seasons</option>
                            <option value="2026">2026 Season</option>
                            <option value="2025">2025 Season</option>
                        </select>
                        <div class="search-box">
                            <i class="fa-solid fa-magnifying-glass search-icon"></i>
                            <input type="text" id="careerSearchInput" placeholder="Search player name..." aria-label="Search by player name" oninput="filterCareerStats()">
                        </div>
                    </div>'''

if target in html:
    html = html.replace(target, replacement)
    with open('players.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("players.html updated!")
else:
    print("Target string not found in players.html")
