const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const URLS = [
    { url: 'https://northerncricketunion.org/midweek-league-group-b-2026/', league: 'Midweek League', time: '6:00 PM' },
    { url: 'https://northerncricketunion.org/ncu-section-3-2026/', league: 'Senior League 3', time: '12:00 PM' },
    { url: 'https://northerncricketunion.org/junior-league-section-10-2026/', league: 'Junior League 10', time: '1:00 PM' },
    { url: 'https://northerncricketunion.org/development-cup-2026/', league: 'Development Cup', time: '1:00 PM' },
    { url: 'https://northerncricketunion.org/lagan-valley-steels-t20-shield-2026/', league: 'Lagan Valley Steels T20 Shield', time: '1:00 PM' }
];

async function scrapeFixtures() {
    console.log('Starting NCU Fixtures Scraper...');
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    const newFixtures = [];

    for (const link of URLS) {
        console.log(`Scraping ${link.league}...`);
        try {
            await page.goto(link.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
            
            const matches = await page.evaluate((league, time) => {
                const fixtures = [];
                // Find all tab contents (usually Results and Fixtures are tabs)
                const paragraphs = Array.from(document.querySelectorAll('.et_pb_tab_content p'));
                
                paragraphs.forEach(p => {
                    const html = p.innerHTML;
                    // Split by <br> or <br/>
                    const lines = html.split(/<br\s*\/?>/i);
                    let currentDate = '';
                    
                    lines.forEach(line => {
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = line;
                        let text = tempDiv.textContent.trim();
                        
                        if (line.includes('<strong')) {
                            // This is a date line
                            currentDate = text;
                            // Clean up date
                            currentDate = currentDate.replace(/\(.*?\)/g, '').replace(/Development Cup F/g, '').replace(/\(\)/g, '').trim(); // remove (Junior Cup - Final) etc
                            if (!currentDate.includes('2026')) currentDate += ' 2026';
                        } else if (text.includes(' v ') && text.includes('Arches')) {
                            // Filter out postponed/abandoned matches which are results, not upcoming fixtures
                            if (text.toLowerCase().includes('postponed') || text.toLowerCase().includes('abandoned')) {
                                return; // skip this line
                            }
                            
                            const parts = text.split(' v ');
                            let homeTeam = parts[0].trim();
                            let awayTeam = parts[1].trim();
                            
                            // Check if venue is included e.g. "Amigos Belfast v Dundrum (at Dundrum)"
                            let venue = "TBD";
                            if (awayTeam.includes('(at ')) {
                                venue = awayTeam.substring(awayTeam.indexOf('(at ') + 4).replace(')', '').trim();
                                awayTeam = awayTeam.substring(0, awayTeam.indexOf('(at ')).trim();
                            }
                            
                            fixtures.push({
                                homeTeam: homeTeam,
                                awayTeam: awayTeam,
                                date: currentDate,
                                time: time,
                                venue: venue,
                                status: "",
                                league: league
                            });
                        }
                    });
                });
                return fixtures;
            }, link.league, link.time);
            
            console.log(`Found ${matches.length} Arches fixtures in ${link.league}`);
            newFixtures.push(...matches);
        } catch (e) {
            console.error(`Error scraping ${link.league}: ${e.message}`);
        }
    }

    await browser.close();
    console.log(`Total fixtures scraped: ${newFixtures.length}`);

    // Merge with existing fixtures
    const matchesPath = path.join(__dirname, '../data/matches.json');
    let data = { fixtures: [], results: [] };
    if (fs.existsSync(matchesPath)) {
        data = JSON.parse(fs.readFileSync(matchesPath, 'utf8'));
    }
    
    // Simple normalize function to avoid duplicates
    function normalize(t) {
        return t.toLowerCase().replace(/1st xi/g, '').replace(/2nd xi/g, '').replace(/mw xi/g, '').trim();
    }
    
    let added = 0;
    newFixtures.forEach(nf => {
        // Only add if not already in fixtures OR results
        const existsInFixtures = data.fixtures.some(f => 
            normalize(f.homeTeam) === normalize(nf.homeTeam) && 
            normalize(f.awayTeam) === normalize(nf.awayTeam) &&
            f.date === nf.date
        );
        const existsInResults = data.results.some(r => 
            normalize(r.homeTeam) === normalize(nf.homeTeam) && 
            normalize(r.awayTeam) === normalize(nf.awayTeam)
        );
        
        if (!existsInFixtures && !existsInResults) {
            data.fixtures.push(nf);
            added++;
        }
    });
    
    console.log(`Added ${added} new fixtures to matches.json`);
    
    // Sort
    function parseCustomDate(dStr) {
        const cleaned = dStr.replace(/st|nd|rd|th/g, '').replace(/\\n/g, ' ');
        return new Date(cleaned).getTime() || Date.now();
    }
    data.fixtures.sort((a, b) => parseCustomDate(a.date) - parseCustomDate(b.date));
    
    // Save back
    fs.writeFileSync(matchesPath, JSON.stringify(data, null, 2));
    
    const publicPath = path.join(__dirname, '../public/data/matches.json');
    if (fs.existsSync(path.dirname(publicPath))) {
        fs.writeFileSync(publicPath, JSON.stringify(data, null, 2));
    }
}

scrapeFixtures().catch(console.error);
