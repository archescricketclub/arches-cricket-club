import re

with open('js/index.js', 'r', encoding='utf-8') as f:
    js = f.read()

replacement = """
            if (futureMatches.length > 0) {
                const nextMatch = futureMatches[0];
                const safeDate = escapeHTML((nextMatch.date || '').replace(/\\n/g, ' '));
                document.getElementById('hero-next-date').textContent = safeDate;
                const safeHome = escapeHTML(nextMatch.homeTeam);
                const safeAway = escapeHTML(nextMatch.awayTeam);
                const safeFormat = escapeHTML(nextMatch.league || 'T20');
                document.getElementById('hero-next-teams').textContent = `${safeHome} vs ${safeAway} · ${safeFormat}`;
            } else if (pastMatches.length > 0) {
                const badge = document.getElementById('season-status');
                if (badge) badge.style.display = 'inline-block';
                // Fallback to Latest Result
                const hLabel = document.getElementById('hero-next-heading');
                if (hLabel) hLabel.textContent = "Latest Result";
                
                const latestMatch = pastMatches[0];
                const safeDate = escapeHTML((latestMatch.date || '').replace(/\\n/g, ' '));
                document.getElementById('hero-next-date').textContent = safeDate;
                const safeHome = escapeHTML(latestMatch.homeTeam);
                const safeAway = escapeHTML(latestMatch.awayTeam);
                const safeFormat = escapeHTML(latestMatch.league || 'T20');
                document.getElementById('hero-next-teams').textContent = `${safeHome} vs ${safeAway} · ${safeFormat}`;
            } else {
                document.getElementById('hero-next-date').textContent = "Season Completed";
                document.getElementById('hero-next-teams').textContent = "Check back next year";
            }
"""

js = re.sub(r'if \(futureMatches\.length > 0\) \{[\s\S]*?\} else \{[\s\S]*?Check back next year";\s*\}', replacement.strip(), js)

with open('js/index.js', 'w', encoding='utf-8') as f:
    f.write(js)
