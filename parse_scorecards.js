const fs = require('fs');

const d = JSON.parse(fs.readFileSync('test_scorecard.json', 'utf8'));

const players = {};
// Team 1 is Arches? No, in test scorecard it's Saintfield vs Lisburn. 
// We will pretend Saintfield is Arches for this test.
const archesName = 'Saintfield';

let teamInnings = null;
d.Innings.forEach(inn => {
  if (inn.BattingTeamName.includes(archesName)) {
    // Arches batted this innings
    inn.BattingCard.forEach(b => {
      const p = b.PlayerName;
      if (!p) return;
      if (!players[p]) players[p] = { matches: 1, runs: 0, outs: 0, wickets: 0, runsConceded: 0, bestFig: {w:0, r:999} };
      
      players[p].runs += b.Runs || 0;
      if (b.HowOut && b.HowOut !== 'not out' && b.HowOut !== 'retired hurt') {
        players[p].outs += 1;
      }
    });
  } else {
    // Arches bowled this innings
    inn.BowlingCard.forEach(b => {
      const p = b.PlayerName;
      if (!p) return;
      if (!players[p]) players[p] = { matches: 1, runs: 0, outs: 0, wickets: 0, runsConceded: 0, bestFig: {w:0, r:999} };
      
      const w = b.Wickets || 0;
      const r = b.Runs || 0;
      players[p].wickets += w;
      players[p].runsConceded += r;
      
      // Update best figure
      if (w > players[p].bestFig.w || (w === players[p].bestFig.w && r < players[p].bestFig.r)) {
        players[p].bestFig = { w, r };
      }
    });
  }
});

console.log(players);
