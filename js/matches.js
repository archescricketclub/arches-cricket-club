let currentMode = 'fixtures';
let currentLeague = 'all';
let allFixtures = [];
let allResults = [];

const months = {
  'JAN': 0, 'JANUARY': 0,
  'FEB': 1, 'FEBRUARY': 1,
  'MAR': 2, 'MARCH': 2,
  'APR': 3, 'APRIL': 3,
  'MAY': 4,
  'JUN': 5, 'JUNE': 5,
  'JUL': 6, 'JULY': 6,
  'AUG': 7, 'AUGUST': 7,
  'SEP': 8, 'SEPTEMBER': 8,
  'OCT': 9, 'OCTOBER': 9,
  'NOV': 10, 'NOVEMBER': 10,
  'DEC': 11, 'DECEMBER': 11
};

function cleanText(str) {
  return (str || '').replace(/\n/g, ' ').trim();
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

function parseMatchDate(dateStr) {
  if (!dateStr || dateStr.toUpperCase() === 'TBD') return null;
  const cleanStr = dateStr.replace(/\n/g, ' ').trim();
  const parts = cleanStr.split(/\s+/);
  let day = null;
  let month = null;
  let year = 2026; // default
  for (const part of parts) {
    const upper = part.toUpperCase();
    const dayMatch = part.match(/^(\d{1,2})(?:st|nd|rd|th)?$/i);
    const yearMatch = part.match(/^(20\d{2})$/);
    if (yearMatch) {
      year = parseInt(yearMatch[1], 10);
    } else if (dayMatch) {
      day = parseInt(dayMatch[1], 10);
    } else if (months[upper] !== undefined) {
      month = months[upper];
    }
  }
  if (day !== null && month !== null) {
    return new Date(year, month, day);
  }
  return null;
}

function sortMatches(list, descending = false) {
  return list.sort((a, b) => {
    const dA = parseMatchDate(a.date);
    const dB = parseMatchDate(b.date);
    if (!dA && !dB) return 0;
    if (!dA) return 1;
    if (!dB) return -1;
    return descending ? dB - dA : dA - dB;
  });
}

function toggleMatchesMode(mode, btn) {
  if (btn) {
    document.querySelectorAll('.matches-pill').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
  }
  currentMode = mode;
  
  if (mode === 'tables') {
    document.getElementById('matches-content').style.display = 'none';
    document.getElementById('stats-summary').style.display = 'none';
    document.getElementById('venue-info').style.display = 'none';
    document.getElementById('tables-content').style.display = 'block';
  } else {
    document.getElementById('tables-content').style.display = 'none';
    document.getElementById('matches-content').style.display = 'block';
    if (mode === 'results') {
      document.getElementById('stats-summary').style.display = 'grid';
      document.getElementById('venue-info').style.display = 'none';
    } else {
      document.getElementById('stats-summary').style.display = 'none';
      document.getElementById('venue-info').style.display = 'flex';
    }
    renderMatches();
  }
}

function filterMatches(league, btn) {
  if (btn) {
    document.querySelectorAll('.matches-league-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
  }
  currentLeague = league;
  if (currentMode !== 'tables') {
    renderMatches();
  }
}

function getLeagueKey(leagueName) {
  const ln = (leagueName || '').toLowerCase();
  if (ln.includes('senior league')) return 'team1';
  if (ln.includes('junior league')) return 'team2';
  if (ln.includes('midweek')) return 'midweek';
  if (ln.includes('cup')) return 'cups';
  return 'other';
}

function calculateStats(results) {
  let wins = 0;
  let losses = 0;
  let nr = 0;
  
  results.forEach(match => {
    const homeLower = (match.homeTeam || '').toLowerCase();
    const awayLower = (match.awayTeam || '').toLowerCase();
    const involvesArches = homeLower.includes('arches') || awayLower.includes('arches') || (match.result || '').toLowerCase().includes('arches');
    if (!involvesArches) return;
    
    const resLower = (match.result || '').toLowerCase();
    const noResultKeywords = ['postponed', 'abandoned', 'no result', 'cancelled', 'tbd', 'to be decided', 'postponement', 'match postponed', 'unplayed'];
    let isNoResult = noResultKeywords.some(k => resLower.includes(k));
    
    let isWin = false;
    let isLoss = false;

    if (!isNoResult) {
      if (resLower.includes('beat')) {
        const winnerPart = resLower.split('beat')[0];
        if (winnerPart.includes('arches')) {
          isWin = true;
        } else {
          isLoss = true;
        }
      } else if (resLower.includes('won by') || resLower.includes('won')) {
        const winnerPart = resLower.split('won')[0];
        if (winnerPart.includes('arches')) {
          isWin = true;
        } else {
          isLoss = true;
        }
      } else if (resLower.includes('walkover')) {
        if (resLower.includes('arches') && (resLower.includes('to arches') || resLower.includes('won by'))) {
          isWin = true;
        } else {
          isLoss = true;
        }
      } else if (resLower.includes('lost') || resLower.includes('defeat')) {
        isLoss = true;
      } else {
        isNoResult = true;
      }
    }

    if (isWin) {
      wins++;
    } else if (isLoss) {
      losses++;
    } else {
      nr++;
    }
  });
  
  const totalPlayed = wins + losses + nr;
  const winRate = totalPlayed > 0 ? Math.round((wins / totalPlayed) * 100) : 0;
  
  document.getElementById('stat-total-matches').textContent = totalPlayed;
  document.getElementById('stat-total-wins').textContent = wins;
  document.getElementById('stat-total-losses').textContent = losses;
  document.getElementById('stat-total-nr').textContent = nr;
  document.getElementById('stat-total-winrate').textContent = `${winRate}%`;
}

function renderMatches() {
  const container = document.getElementById('matches-content');
  const dataList = currentMode === 'results' ? allResults : allFixtures;
  
  let filtered = dataList.filter(match => {
    const lk = getLeagueKey(match.league);
    if (currentLeague === 'all') return true;
    return lk === currentLeague;
  });
  
  if (filtered.length === 0) {
    container.innerHTML = `<div class="glass-card" style="padding:3rem; text-align:center;">
      <h3 style="color:var(--text); margin-bottom: 0.5rem;">No ${currentMode} found</h3>
      <p style="color:var(--muted);">There are no ${currentMode} to display for this category.</p>
    </div>`;
    return;
  }
  
  // Group by league for display
  const grouped = {};
  filtered.forEach(m => {
    const l = m.league || 'Other';
    if (!grouped[l]) grouped[l] = [];
    grouped[l].push(m);
  });
  
  let html = '';
  for (const [leagueName, matches] of Object.entries(grouped)) {
    // Generate color based on league (matching old site colors)
    let colorClass = 'var(--text)';
    if (leagueName.includes('Senior') || leagueName.includes('Junior Cup')) colorClass = 'var(--amber)';
    if (leagueName.includes('Junior League') || leagueName.includes('Development')) colorClass = 'var(--gold)';
    if (leagueName.includes('Midweek') || leagueName.includes('T20')) colorClass = '#3b82f6';
    
    html += `
      <div class="reveal" style="margin-bottom: 2rem;">
        <h2 style="font-size:1.5rem;color:${colorClass};margin:2rem 0 1.25rem;">${escapeHTML(leagueName)}</h2>
        <div class="table-section">
          <table class="data-table data-table--responsive">
            <thead>
              <tr>
                <th>Date</th>
                <th>Match</th>
                ${currentMode === 'fixtures' ? '<th>Time</th>' : ''}
                <th>Ground</th>
                ${currentMode === 'results' ? '<th>Result</th>' : ''}
              </tr>
            </thead>
            <tbody>
    `;
    
    matches.forEach(match => {
      const homeLower = (match.homeTeam || '').toLowerCase();
      const awayLower = (match.awayTeam || '').toLowerCase();
      const involvesArches = homeLower.includes('arches') || awayLower.includes('arches') || (match.result || '').toLowerCase().includes('arches');
      
      const safeHome = escapeHTML(match.homeTeam || 'TBA');
      const safeAway = escapeHTML(match.awayTeam || 'TBA');
      const safeDate = escapeHTML(cleanText(match.date));
      const safeVenue = escapeHTML(cleanText(match.venue)) || 'TBD';
      
      const homeDisplay = involvesArches && homeLower.includes('arches') ? `<strong class="text-amber">${safeHome}</strong>` : safeHome;
      const awayDisplay = involvesArches && awayLower.includes('arches') ? `<strong class="text-amber">${safeAway}</strong>` : safeAway;

      let resultCol = '';
      let timeCol = '';

      if (currentMode === 'results') {
        let resultSpan = '';
        const resLower = (match.result || '').toLowerCase();
        const noResultKeywords = ['postponed', 'abandoned', 'no result', 'cancelled', 'tbd', 'to be decided', 'postponement', 'match postponed', 'unplayed'];
        let isNoResult = noResultKeywords.some(k => resLower.includes(k));
        let isWin = false;
        let isLoss = false;

        if (!isNoResult && involvesArches) {
          if (resLower.includes('beat')) {
            const winnerPart = resLower.split('beat')[0];
            if (winnerPart.includes('arches')) isWin = true;
            else isLoss = true;
          } else if (resLower.includes('won by') || resLower.includes('won')) {
            const winnerPart = resLower.split('won')[0];
            if (winnerPart.includes('arches')) isWin = true;
            else isLoss = true;
          } else if (resLower.includes('walkover')) {
             if (resLower.includes('arches') && (resLower.includes('to arches') || resLower.includes('won by'))) isWin = true;
             else isLoss = true;
          } else if (resLower.includes('lost') || resLower.includes('defeat')) {
            isLoss = true;
          } else {
            isNoResult = true;
          }
        }

        const safeResult = escapeHTML(match.result || 'N/R');
        if (involvesArches && isWin) {
          resultSpan = `<span class="result-win">WIN</span><br><small>${safeResult}</small>`;
        } else if (involvesArches && isLoss) {
          resultSpan = `<span class="result-loss">LOSS</span><br><small>${safeResult}</small>`;
        } else {
          resultSpan = `<span class="result-nr">${safeResult}</span>`;
        }
        resultCol = `<td data-label="Result">${resultSpan}</td>`;
      } else {
        const safeTime = escapeHTML(cleanText(match.time)) || 'TBD';
        timeCol = `<td data-label="Time">${safeTime}</td>`;
      }

      const rowClass = involvesArches ? 'match-row-arches' : 'match-row-other';

      html += `
        <tr class="${rowClass}">
          <td data-label="Date">${safeDate}</td>
          <td data-label="Match">${homeDisplay} vs ${awayDisplay}</td>
          ${timeCol}
          <td data-label="Ground">${safeVenue}</td>
          ${resultCol}
        </tr>
      `;
    });
    
    html += `
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
  
  container.innerHTML = html;
}

function loadData() {
  const v = new Date().getTime();
  Promise.all([
    fetch(`data/matches.json?v=${v}`).then(res => res.ok ? res.json() : {}).catch(() => ({})),
    fetch(`old_matches.json?v=${v}`).then(res => res.ok ? res.json() : {}).catch(() => ({}))
  ]).then(([newData, oldData]) => {
    let combinedFixtures = [];
    if (newData.fixtures) combinedFixtures = combinedFixtures.concat(newData.fixtures);
    if (oldData.fixtures) combinedFixtures = combinedFixtures.concat(oldData.fixtures);
    
    let combinedResults = [];
    if (newData.results) combinedResults = combinedResults.concat(newData.results);
    if (oldData.results) combinedResults = combinedResults.concat(oldData.results);
    
    // Sort fixtures ascending, results descending
    allFixtures = sortMatches(combinedFixtures, false);
    allResults = sortMatches(combinedResults, true);
    
    calculateStats(allResults);
    toggleMatchesMode(currentMode); // Render initial view
  });
}

document.addEventListener('DOMContentLoaded', loadData);
