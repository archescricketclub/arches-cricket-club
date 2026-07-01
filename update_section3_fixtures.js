const fs = require('fs');

const file = 'data/matches.json';
const d = JSON.parse(fs.readFileSync(file));

// Remove all current Senior League 3 fixtures
d.fixtures = d.fixtures.filter(f => f.league !== 'Senior League 3');

// The new accurate fixtures scraped manually from the NCU Section 3 page
const newFixtures = [
  { date: "4th July", homeTeam: "Ards & Donaghadee 1st XI", awayTeam: "Arches 1st XI", time: "11:00 AM", venue: "TBD", league: "Senior League 3" },
  { date: "18th July", homeTeam: "Arches 1st XI", awayTeam: "Belfast Superkings", time: "11:00 AM", venue: "TBD", league: "Senior League 3" },
  { date: "25th July", homeTeam: "Drumaness Superkings", awayTeam: "Arches 1st XI", time: "11:00 AM", venue: "TBD", league: "Senior League 3" },
  { date: "1st August", homeTeam: "Arches 1st XI", awayTeam: "NIMACC", time: "11:00 AM", venue: "TBD", league: "Senior League 3" },
  { date: "8th August", homeTeam: "Dundrum", awayTeam: "Arches 1st XI", time: "11:00 AM", venue: "TBD", league: "Senior League 3" },
  { date: "15th August", homeTeam: "Arches 1st XI", awayTeam: "Amigos Belfast", time: "11:00 AM", venue: "TBD", league: "Senior League 3" },
  { date: "22nd August", homeTeam: "Arches 1st XI", awayTeam: "Victoria", time: "11:00 AM", venue: "TBD", league: "Senior League 3" }
];

d.fixtures.push(...newFixtures);
d.lastUpdated = new Date().toISOString();

fs.writeFileSync(file, JSON.stringify(d, null, 2));
fs.writeFileSync('public/data/matches.json', JSON.stringify(d, null, 2));
