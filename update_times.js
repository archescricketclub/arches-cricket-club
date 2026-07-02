const fs = require('fs');

const file = 'data/matches.json';
const d = JSON.parse(fs.readFileSync(file));

d.fixtures.forEach(f => {
  let l = f.league.toLowerCase();
  if (l.includes('senior')) {
    f.time = '12:00 PM';
  } else if (l.includes('junior league')) {
    f.time = '1:00 PM';
  } else if (l.includes('midweek')) {
    f.time = '6:00 PM';
  } else if (l.includes('cup') || l.includes('shield')) {
    f.time = '1:00 PM';
  } else {
    // Default fallback if any unknown
    f.time = '12:00 PM';
  }
});

fs.writeFileSync(file, JSON.stringify(d, null, 2));
fs.writeFileSync('public/data/matches.json', JSON.stringify(d, null, 2));

console.log("Updated match times based on league logic.");
