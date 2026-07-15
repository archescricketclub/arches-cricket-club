const https = require('https');
const fs = require('fs');

let allFixtures = [];
let allResults = [];
let page = 0;

function fetchPage() {
  const url = `https://w-api.cdn.nvplay.net/api/matchlist/filter?customerid=4c07e17d-8e58-426e-82cc-bd4b02b5183b&currentSeason=false&competitionId=&showFixtures=true&showResults=true&maxResults=500&page=${page}`;
  
  https.get(url, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data.replace(/^\uFEFF/, ''));
        
        const fixturesCount = json.Fixtures ? json.Fixtures.length : 0;
        const resultsCount = json.Results ? json.Results.length : 0;
        
        console.log(`Page ${page}: ${fixturesCount} fixtures, ${resultsCount} results`);
        
        if (fixturesCount > 0 || resultsCount > 0) {
          if (json.Fixtures) allFixtures.push(...json.Fixtures);
          if (json.Results) allResults.push(...json.Results);
          
          page++;
          fetchPage();
        } else {
          fs.writeFileSync('all_matches_full.json', JSON.stringify({Fixtures: allFixtures, Results: allResults}, null, 2));
          console.log(`Done. Total: ${allFixtures.length} fixtures, ${allResults.length} results.`);
        }
      } catch (err) {
        console.error('Error parsing JSON:', err);
      }
    });
  }).on('error', err => {
    console.error('Network Error:', err);
  });
}

fetchPage();
