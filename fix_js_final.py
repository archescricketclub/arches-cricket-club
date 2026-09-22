import re

with open('js/index.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Fix literal newlines in regex
js = js.replace('replace(/\\n/g', 'replace(/\\\\n/g')
# Also fix the ones that got broken over two lines:
js = js.replace('.replace(/\\n/g, \' \')', '.replace(/\\\\n/g, \' \')')
# Just to be sure, I will write a regex to fix it if it's broken over lines
js = re.sub(r'\.replace\(\/\n\/g, \' \'\)', '.replace(/\\\\n/g, \' \')', js)


# Fix the win calculation logic
old_logic = """
            let wins = 0;
            let played = 0;
            rawResults.forEach(match => {
                const resLower = (match.result || '').toLowerCase();
                const noResultKeywords = ['postponed', 'abandoned', 'no result', 'cancelled', 'tbd', 'unplayed'];
                let isNoResult = noResultKeywords.some(k => resLower.includes(k));
                
                if (!isNoResult) {
                    played++;
                    if (resLower.includes('beat arches') || resLower.includes('lost') || resLower.includes('defeat')) {
                        // Loss
                    } else if (resLower.includes('arches beat') || resLower.includes('won') || resLower.includes('walkover to arches')) {
                        wins++;
                    }
                }
            });
"""

new_logic = """
            let wins = 0;
            let played = 0;
            rawResults.forEach(match => {
                const resLower = (match.result || '').toLowerCase();
                const noResultKeywords = ['postponed', 'abandoned', 'no result', 'cancelled', 'tbd', 'unplayed'];
                let isNoResult = noResultKeywords.some(k => resLower.includes(k));
                
                if (!isNoResult) {
                    played++;
                    // Win logic: Starts with arches, or explicitly says arches won/beat/walkover
                    const isWin = resLower.startsWith('arches') || resLower.includes('arches won') || resLower.includes('arches beat') || resLower.includes('walkover to arches');
                    if (isWin) {
                        wins++;
                    }
                }
            });
"""

js = js.replace(old_logic.strip(), new_logic.strip())

with open('js/index.js', 'w', encoding='utf-8') as f:
    f.write(js)
