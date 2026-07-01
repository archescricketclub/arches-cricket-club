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
  let data = JSON.parse(fs.readFileSync(file));
  let isRootArray = Array.isArray(data);
  let playersArray = isRootArray ? data : (data.players || []);
  
  // Filter out the non-Arches players
  playersArray = playersArray.filter(p => {
    const name = p.name ? p.name.toLowerCase().trim() : '';
    return !namesToRemove.includes(name);
  });
  
  // Check for duplicates
  const nameMap = new Map();
  const finalPlayers = [];
  playersArray.forEach(p => {
    if (!p.name) return;
    const name = p.name.toLowerCase().trim().replace(/\s+/g, ' ');
    if (!nameMap.has(name)) {
      nameMap.set(name, p);
      finalPlayers.push(p);
    } else {
      // Merge duplicate
      const existing = nameMap.get(name);
      if (file === 'data/career_stats.json') {
        existing.matches = (existing.matches || 0) + (p.matches || 0);
        existing.runs = (existing.runs || 0) + (p.runs || 0);
        existing.wickets = (existing.wickets || 0) + (p.wickets || 0);
        existing.catches = (existing.catches || 0) + (p.catches || 0);
        
        // simplify highest score
        const hs1 = parseInt(existing.highestScore) || 0;
        const hs2 = parseInt(p.highestScore) || 0;
        if (hs2 > hs1) existing.highestScore = p.highestScore;
      }
    }
  });
  
  const finalData = isRootArray ? finalPlayers : { ...data, players: finalPlayers };
  fs.writeFileSync(file, JSON.stringify(finalData, null, 2));
});
