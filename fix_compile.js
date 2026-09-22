const fs = require('fs');
let code = fs.readFileSync('scripts/compile_honours.js', 'utf8');

const regex = /\/\/ Process 2025 Stats([\s\S]*?)\/\/ Convert career stats map to a sorted list of players/m;

const replacement = `// Helper to process stats uniformly
function processStatsMap(playersObj) {
  for (const [key, players] of Object.entries(playersObj)) {
    if (key.endsWith('-bat')) {
      players.forEach(p => {
        if (!careerMap[p.name]) {
          careerMap[p.name] = {
            name: p.name,
            jersey: p.jersey || '#—',
            cap: p.cap || p.name.substring(0,4).toUpperCase(),
            batting: { runs: 0, hs: '0', matches: 0 },
            bowling: { wickets: 0, bestFig: '-', matches: 0 }
          };
        }
        if (!p.stats) return;
        const matches = parseInt(p.stats[0].n) || 0;
        const runs = parseInt(p.stats[1].n) || 0;
        const hs = p.stats[2].n;
        careerMap[p.name].batting.matches += matches;
        careerMap[p.name].batting.runs += runs;
        careerMap[p.name].batting.hs = compareHighScores(careerMap[p.name].batting.hs, hs);
      });
    } else if (key.endsWith('-bowl')) {
      players.forEach(p => {
        if (!careerMap[p.name]) {
          careerMap[p.name] = {
            name: p.name,
            jersey: p.jersey || '#—',
            cap: p.cap || p.name.substring(0,4).toUpperCase(),
            batting: { runs: 0, hs: '0', matches: 0 },
            bowling: { wickets: 0, bestFig: '-', matches: 0 }
          };
        }
        if (!p.stats) return;
        const matches = parseInt(p.stats[0].n) || 0;
        const wickets = parseInt(p.stats[1].n) || 0;
        const bestFig = p.stats[2].n;
        
        careerMap[p.name].bowling.matches += matches;
        careerMap[p.name].bowling.wickets += wickets;
        careerMap[p.name].bowling.bestFig = compareBowlingFigs(careerMap[p.name].bowling.bestFig, bestFig);
      });
    }
  }
}

// Process 2025 and 2026 Stats
processStatsMap(players2025);
processStatsMap(players2026);

// Convert career stats map to a sorted list of players`;

code = code.replace(regex, replacement);
fs.writeFileSync('scripts/compile_honours.js', code);
console.log('Fixed compile_honours.js');
