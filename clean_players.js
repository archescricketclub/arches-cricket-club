const fs = require('fs');
const path = require('path');

const namesToRemove = [
  'Maree Lourens', 'Rhodri Phillips', 'Abdul Qadir', 'sivakumar Baratharaj',
  'Senthilkumar Ponnuchamy', 'Saravana Chandrasekaran', 'Gowri Sankar',
  'Shashank Rama', 'Viswath Balaguru', 'Amarnath Karunakaran',
  'Sharath Bhuvaneshwari', 'Dino James', 'AP Praveen'
].map(n => n.toLowerCase().trim());

const files = ['data/career_stats.json', 'data/players.json'];

files.forEach(file => {
  const data = JSON.parse(fs.readFileSync(file));
  
  if (data.players) {
    data.players = data.players.filter(p => {
      const name = p.name.toLowerCase().trim();
      return !namesToRemove.includes(name);
    });
    
    // Check for duplicates
    const nameMap = new Map();
    const finalPlayers = [];
    data.players.forEach(p => {
      const name = p.name.toLowerCase().trim();
      if (!nameMap.has(name)) {
        nameMap.set(name, p);
        finalPlayers.push(p);
      } else {
        // Merge duplicate (just keeping the first one for now, or sum stats if it's stats)
        const existing = nameMap.get(name);
        if (file === 'data/career_stats.json') {
          existing.matches += p.matches || 0;
          existing.runs += p.runs || 0;
          existing.wickets += p.wickets || 0;
          existing.catches += p.catches || 0;
          // simplify highest score and best bowling
          if (p.highestScore > existing.highestScore) existing.highestScore = p.highestScore;
        }
      }
    });
    data.players = finalPlayers;
  }
  
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
});
