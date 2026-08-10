function filterResults(team, btn) {
  if (btn) {
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
  }
  const t1 = document.getElementById('block-team1');
  const t2 = document.getElementById('block-team2');
  const mw = document.getElementById('block-midweek');
  const jc = document.getElementById('block-juniorcup');
  const dc = document.getElementById('block-devcup');
  const ts = document.getElementById('block-t20shield');
  
  const allBlocks = [t1, t2, mw, jc, dc, ts];
  allBlocks.forEach(b => { if (b) b.style.display = 'none'; });
  
  if (team === 'all') {
    allBlocks.forEach(b => { if (b) b.style.display = ''; });
  } else if (team === 'team1') {
    if (t1) t1.style.display = '';
  } else if (team === 'team2') {
    if (t2) t2.style.display = '';
  } else if (team === 'midweek') {
    if (mw) mw.style.display = '';
  } else if (team === 'cups') {
    if (jc) jc.style.display = '';
    if (dc) dc.style.display = '';
    if (ts) ts.style.display = '';
  }
}

function cleanText(str) {
  return (str || '').replace(/\n/g, ' ').trim();
}

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

function sortResults(list) {
  return list.sort((a, b) => {
    const dA = parseMatchDate(a.date);
    const dB = parseMatchDate(b.date);
    if (!dA && !dB) return 0;
    if (!dA) return 1;
    if (!dB) return -1;
    return dB - dA; // descending
  });
}

function loadResults() {
  const leagues = {
    "Senior League 3": document.getElementById('tbody-Senior-League-3'),
    "Junior League 10": document.getElementById('tbody-Junior-League-10'),
    "Midweek League": document.getElementById('tbody-Midweek-League'),
    "Junior Cup": document.getElementById('tbody-Junior-Cup'),
    "Development Cup": document.getElementById('tbody-Development-Cup'),
    "T20 Shield Cup": document.getElementById('tbody-T20-Shield-Cup')
  };
  
  // Set loading state
  Object.values(leagues).forEach(tbody => {
    if (tbody) {
      const colSpan = tbody.parentElement.querySelectorAll('th').length || 4;
      tbody.innerHTML = `<tr><td colspan="${colSpan}" style="text-align:center;">
        <div class="loading-state" style="padding: 2rem;">
          <div class="spinner"></div>
          <p>Loading results...</p>
        </div>
      </td></tr>`;
    }
  });

  fetch(`data/matches.json?v=${new Date().getTime()}`)
    .then(res => {
      if (!res.ok) throw new Error('Network error');
      return res.json();
    })
    .then(data => {
      const rawResults = data.results || [];
      const results = sortResults(rawResults);
      
      let wins = 0;
      let losses = 0;
      let nr = 0;
      
      results.forEach(match => {
        const homeLower = (match.homeTeam || '').toLowerCase();
        const awayLower = (match.awayTeam || '').toLowerCase();
        const involvesArches = homeLower.includes('arches') || awayLower.includes('arches');
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
          } else if (resLower.includes('won')) {
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

      // Clear loading texts
      Object.values(leagues).forEach(tbody => {
        if (tbody) tbody.innerHTML = '';
      });

      const populated = new Set();

      results.forEach(match => {
        const tbody = leagues[match.league];
        if (!tbody) return;
        
        const homeLower = (match.homeTeam || '').toLowerCase();
        const awayLower = (match.awayTeam || '').toLowerCase();
        const involvesArches = homeLower.includes('arches') || awayLower.includes('arches');
        if (!involvesArches) return;
        
        populated.add(match.league);
        
        let resultSpan = '';
        let rowClass = 'match-row-arches';
        
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
          } else if (resLower.includes('won')) {
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

        const safeResult = escapeHTML(match.result || 'N/R');
        if (isWin) {
          resultSpan = `<span class="result-win">WIN</span><br><small>${safeResult}</small>`;
        } else if (isLoss) {
          resultSpan = `<span class="result-loss">LOSS</span><br><small>${safeResult}</small>`;
        } else {
          resultSpan = `<span class="result-nr">${safeResult}</span>`;
        }

        const safeHome = escapeHTML(match.homeTeam);
        const safeAway = escapeHTML(match.awayTeam);
        const safeDate = escapeHTML(cleanText(match.date));
        const safeVenue = escapeHTML(cleanText(match.venue)) || 'TBD';

        const homeDisplay = homeLower.includes('arches') ? `<strong class="text-amber">${safeHome}</strong>` : safeHome;
        const awayDisplay = awayLower.includes('arches') ? `<strong class="text-amber">${safeAway}</strong>` : safeAway;

        const row = `
          <tr class="${rowClass}">
            <td data-label="Date">${safeDate}</td>
            <td data-label="Match">${homeDisplay} vs ${awayDisplay}</td>
            <td data-label="Ground">${safeVenue}</td>
            <td data-label="Result">${resultSpan}</td>
          </tr>
        `;
        tbody.innerHTML += row;
      });

      // Set "No results found" for any unpopulated categories
      Object.keys(leagues).forEach(leagueName => {
        if (!populated.has(leagueName)) {
          const tbody = leagues[leagueName];
          if (tbody) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No results found</td></tr>';
          }
        }
      });
    })
    .catch(err => {
      console.error('Error loading matches data:', err);
      Object.values(leagues).forEach(tbody => {
        if (tbody) {
          const colSpan = tbody.parentElement.querySelectorAll('th').length || 4;
          tbody.innerHTML = `<tr><td colspan="${colSpan}" style="text-align:center;">
            <div class="error-state" style="padding: 2rem;">
              <i class="fa-solid fa-triangle-exclamation" style="color:#ff4444; font-size:2rem; margin-bottom:0.5rem;"></i>
              <div>Failed to load results</div>
            </div>
          </td></tr>`;
        }
      });
    });
}

document.addEventListener('DOMContentLoaded', loadResults);
