const fs = require('fs');
const path = require('path');

const allMatchesPath = path.join(__dirname, 'all_matches_full.json');
const matchesPath = path.join(__dirname, 'data', 'matches.json');

const rawFile = fs.readFileSync(allMatchesPath, 'utf8');
const rawData = JSON.parse(rawFile.replace(/^\uFEFF/, ''));

let finalData = {
    fixtures: [],
    results: []
};

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

const allMatches = [...(rawData.Fixtures || []), ...(rawData.Results || [])];

allMatches.forEach(match => {
    if (!match.Team1Name.includes('Arches') && !match.Team2Name.includes('Arches')) return;

    const dateObj = new Date(match.StartDateTime);
    const day = dateObj.getDate();
    const month = months[dateObj.getMonth()];
    const dateStr = `${day}${getSuffix(day)} ${month}`;

    let league = "";
    let time = "TBD";
    const titleStr = match.MatchTitle.toLowerCase();
    
    const archesTeam = match.Team1Name.includes('Arches') ? match.Team1Name : match.Team2Name;

    if (titleStr.includes('cup') || titleStr.includes('shield') || titleStr.includes('trophy')) {
        // preserve the API's CompetitionName if it exists, otherwise generic cup
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
        finalData.results.push(matchObj);
    } else {
        finalData.fixtures.push(matchObj);
    }
});

finalData.fixtures.sort((a, b) => new Date(a.date + " 2026") - new Date(b.date + " 2026"));
finalData.results.sort((a, b) => new Date(a.date + " 2026") - new Date(b.date + " 2026"));

fs.writeFileSync(matchesPath, JSON.stringify(finalData, null, 2));
console.log(`Successfully synced ${finalData.fixtures.length} fixtures and ${finalData.results.length} results.`);
