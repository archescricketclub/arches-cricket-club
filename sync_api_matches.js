const fs = require('fs');
const path = require('path');
const https = require('https');

const matchesPath = path.join(__dirname, 'data', 'matches.json');
const publicMatchesPath = path.join(__dirname, 'public', 'data', 'matches.json');

// Helper to fetch JSON from URL
function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data.replace(/^\uFEFF/, '')));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

function normalizeTeam(t) {
    if (!t) return "";
    return t.toLowerCase()
            .replace(/1st/g, '1')
            .replace(/2nd/g, '2')
            .replace(/3rd/g, '3')
            .replace(/4th/g, '4')
            .replace(/5th/g, '5')
            .replace(/xi/g, '')
            .replace(/mw2/g, 'mw')
            .replace(/mw/g, 'mw')
            .replace(/[^a-z0-9 ]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
}

function parseCustomDate(dStr) {
    if (!dStr) return 0;
    const cleaned = dStr.replace(/st|nd|rd|th/g, '').replace(/\n/g, ' ').replace(/\(.*?\)/g, '');
    return new Date(cleaned + (cleaned.includes('2026') ? "" : " 2026")).getTime() || 0;
}

function matchesAreSame(m1, m2) {
    const home1 = normalizeTeam(m1.homeTeam);
    const away1 = normalizeTeam(m1.awayTeam);
    const home2 = normalizeTeam(m2.homeTeam);
    const away2 = normalizeTeam(m2.awayTeam);
    
    const homeMatch = home1.includes(home2) || home2.includes(home1);
    const awayMatch = away1.includes(away2) || away2.includes(away1);
    const cross1Match = home1.includes(away2) || away2.includes(home1);
    const cross2Match = away1.includes(home2) || home2.includes(away1);

    const isSameMatchup = (homeMatch && awayMatch) || (cross1Match && cross2Match);
    
    // Check if dates are close (within 5 days) to avoid deleting legitimate rematches in the same season
    const t1 = parseCustomDate(m1.date);
    const t2 = parseCustomDate(m2.date);
    
    if (t1 && t2) {
        const diffDays = Math.abs(t1 - t2) / (1000 * 60 * 60 * 24);
        return isSameMatchup && diffDays <= 7;
    }
    
    // If one is missing a date (like TBD), just merge them
    return isSameMatchup;
}

async function syncMatches() {
    let allFixtures = [];
    let allResults = [];
    let page = 0;
    let hasMore = true;

    console.log("Fetching live matches from NVPlay API...");
    while (hasMore) {
        const url = `https://w-api.cdn.nvplay.net/api/matchlist/filter?customerid=4c07e17d-8e58-426e-82cc-bd4b02b5183b&currentSeason=false&competitionId=&showFixtures=true&showResults=true&maxResults=500&page=${page}`;
        const json = await fetchJson(url);
        
        const fixturesCount = json.Fixtures ? json.Fixtures.length : 0;
        const resultsCount = json.Results ? json.Results.length : 0;
        
        if (fixturesCount > 0 || resultsCount > 0) {
            if (json.Fixtures) allFixtures.push(...json.Fixtures);
            if (json.Results) allResults.push(...json.Results);
            page++;
        } else {
            hasMore = false;
        }
    }
    console.log(`Fetched ${allFixtures.length} total fixtures and ${allResults.length} total results from NCU.`);

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    function getSuffix(d) {
        if (d > 3 && d < 21) return 'th';
        switch (d % 10) {
            case 1:  return "st";
            case 2:  return "nd";
            case 3:  return "rd";
            default: return "th";
        }
    }

    const newFixtures = [];
    const newResults = [];
    const allMatches = [...allFixtures, ...allResults];

    allMatches.forEach(match => {
        if (!match.Team1Name.includes('Arches') && !match.Team2Name.includes('Arches')) return;

        const dateObj = new Date(match.StartDateTime);
        const day = dateObj.getDate();
        const month = months[dateObj.getMonth()];
        const year = dateObj.getFullYear();
        const dateStr = `${day}${getSuffix(day)} ${month} ${year}`;

        let league = "";
        let time = "TBD";
        const titleStr = match.MatchTitle.toLowerCase();
        
        const archesTeam = match.Team1Name.includes('Arches') ? match.Team1Name : match.Team2Name;

        if (titleStr.includes('cup') || titleStr.includes('shield') || titleStr.includes('trophy')) {
            league = match.CompetitionName || "Cup Match";
            time = "1:00 PM";
        } else if (archesTeam.includes('1st XI')) {
            league = "Senior League 3";
            time = "12:00 PM";
        } else if (archesTeam.includes('2nd XI') || archesTeam.includes('3rd XI')) {
            league = "Junior League 10";
            time = "1:00 PM";
        } else if (archesTeam.includes('MW')) {
            league = "Midweek League";
            time = "6:00 PM";
        }

        const matchObj = {
            homeTeam: match.Team1Name,
            awayTeam: match.Team2Name,
            date: dateStr,
            time: time,
            venue: match.MatchTitle.split(', ')[1]?.split(' -')[0] || "TBD",
            status: "",
            league: league
        };

        if (match.Result) {
            matchObj.result = match.Result;
            newResults.push(matchObj);
        } else {
            newFixtures.push(matchObj);
        }
    });

    console.log(`Filtered for Arches: ${newFixtures.length} fixtures, ${newResults.length} results.`);

    // Read existing matches to preserve historic data
    let existingData = { fixtures: [], results: [] };
    if (fs.existsSync(matchesPath)) {
        existingData = JSON.parse(fs.readFileSync(matchesPath, 'utf8'));
    }

    const mergedFixtures = [...newFixtures];
    const mergedResults = [...newResults];

    existingData.fixtures.forEach(oldF => {
        const exists = mergedFixtures.some(newF => matchesAreSame(oldF, newF)) || 
                       mergedResults.some(newR => matchesAreSame(oldF, newR));
        if (!exists) {
            mergedFixtures.push(oldF);
        }
    });

    // We only keep Postponed/Abandoned if there isn't another valid result for the same two teams
    const isPostponed = (r) => r.result && (r.result.toLowerCase().includes('postponed') || r.result.toLowerCase().includes('abandoned'));
    
    existingData.results.forEach(oldR => {
        const exists = mergedResults.some(newR => matchesAreSame(oldR, newR));
        if (!exists) {
            mergedResults.push(oldR);
        }
    });

    // Post-process to remove postponed matches if a played match exists for the same teams in the same league
    const finalResults = [];
    mergedResults.forEach(r => {
        if (isPostponed(r)) {
            // Check if there's another match for the same teams that ISN'T postponed
            const hasValidResult = mergedResults.some(other => 
                matchesAreSame(other, r) && !isPostponed(other)
            );
            if (!hasValidResult) {
                finalResults.push(r);
            }
        } else {
            finalResults.push(r);
        }
    });

    // Write back to matches.json
    existingData.fixtures = mergedFixtures;
    existingData.results = finalResults;

    mergedFixtures.sort((a, b) => parseCustomDate(a.date) - parseCustomDate(b.date));
    finalResults.sort((a, b) => parseCustomDate(a.date) - parseCustomDate(b.date));

    // Filter out postponed/abandoned from fixtures as well
    const finalFixtures = mergedFixtures.filter(f => !isPostponed(f) && !f.awayTeam.toLowerCase().includes('abandoned') && !f.awayTeam.toLowerCase().includes('postponed'));

    const finalData = {
        fixtures: finalFixtures,
        results: finalResults,
        lastUpdated: new Date().toISOString()
    };

    fs.mkdirSync(path.dirname(matchesPath), { recursive: true });
    fs.writeFileSync(matchesPath, JSON.stringify(finalData, null, 2));

    fs.mkdirSync(path.dirname(publicMatchesPath), { recursive: true });
    fs.writeFileSync(publicMatchesPath, JSON.stringify(finalData, null, 2));

    console.log(`Successfully merged! Final counts: ${mergedFixtures.length} fixtures, ${mergedResults.length} results.`);
}

syncMatches().catch(console.error);
