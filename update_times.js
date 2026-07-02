const fs = require('fs');
const path = require('path');

const matchesPath = path.join(__dirname, 'data', 'matches.json');
const data = JSON.parse(fs.readFileSync(matchesPath, 'utf8'));

let updated = 0;

data.fixtures.forEach(match => {
  if (match.time.includes('11:00 AM') || match.time.includes('11:AM')) {
    match.time = '12:00 PM';
    updated++;
  } else if (match.league.includes('Senior')) {
    match.time = '12:00 PM';
    updated++;
  } else if (match.league.includes('Junior')) {
    match.time = '1:00 PM';
    updated++;
  } else if (match.league.includes('Midweek')) {
    match.time = '6:00 PM';
    updated++;
  } else if (match.league.includes('Cup')) {
    match.time = '1:00 PM';
    updated++;
  }
});

fs.writeFileSync(matchesPath, JSON.stringify(data, null, 2));
console.log(`Updated ${updated} matches successfully.`);
