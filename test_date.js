const months = { 'JAN': 0, 'JANUARY': 0, 'FEB': 1, 'FEBRUARY': 1, 'MAR': 2, 'MARCH': 2, 'APR': 3, 'APRIL': 3, 'MAY': 4, 'JUN': 5, 'JUNE': 5, 'JUL': 6, 'JULY': 6, 'AUG': 7, 'AUGUST': 7, 'SEP': 8, 'SEPTEMBER': 8, 'OCT': 9, 'OCTOBER': 9, 'NOV': 10, 'NOVEMBER': 10, 'DEC': 11, 'DECEMBER': 11 };

function parseMatchDate(dateStr) {
    if (!dateStr || dateStr.toUpperCase() === 'TBD') return null;
    const cleanStr = dateStr.replace(/\n/g, ' ').trim();
    const parts = cleanStr.split(/\s+/);
    let day = null;
    let month = null;
    for (const part of parts) {
        const upper = part.toUpperCase();
        const dayMatch = part.match(/^(\d{1,2})(?:st|nd|rd|th)?$/i);
        if (dayMatch) {
            day = parseInt(dayMatch[1], 10);
        } else if (months[upper] !== undefined) {
            month = months[upper];
        }
    }
    if (day !== null && month !== null) {
        return new Date(2026, month, day);
    }
    return null;
}

const data = require('./data/matches.json');
const rawFixtures = data.fixtures || [];
console.log("Raw fixtures count:", rawFixtures.length);

const now = new Date();
now.setHours(0,0,0,0);

const futureMatches = rawFixtures.filter(m => {
    const matchDate = parseMatchDate(m.date);
    if (!matchDate) {
        console.log("Failed to parse date:", m.date);
    }
    return matchDate && matchDate >= now;
});
console.log("Future matches count:", futureMatches.length);
if (futureMatches.length > 0) {
    console.log("First future match:", futureMatches[0].date);
}
