let currentMode = 'fixtures';
let currentLeague = 'all';
let selectedSeason = '2026';
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
  let year = parseInt(selectedSeason, 10) || 2026;
  for (const part of parts) {
    const upper = part.toUpperCase();
    const dayMatch = part.match(/^(\d{1,2})(?:st|nd|rd|th)?$/i);
    const yearMatch = part.match(/^(20\d{2})$/);
    if (yearMatch) {
      year = parseInt(yearMatch[1], 10);
    } else if (dayMatch && day === null) {
      day = parseInt(dayMatch[1], 10);
    } else if (months[upper] !== undefined && month === null) {
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
  currentMode = mode;
  document.querySelectorAll('.matches-pill').forEach(t => {
    if (t.dataset.mode === mode) {
      t.classList.add('active');
    } else {
      t.classList.remove('active');
    }
  });
  
  const content = document.getElementById('matches-content');
  if (content) content.style.display = 'block';
  const stats = document.getElementById('stats-summary');
  const venue = document.getElementById('venue-info');
  if (mode === 'results') {
    if (stats) stats.style.display = 'grid';
    if (venue) venue.style.display = 'none';
    updateStatsSummary();
  } else {
    if (stats) stats.style.display = 'none';
    if (venue) venue.style.display = 'flex';
  }
  renderMatches();
}

function filterMatches(league, btn) {
  if (btn) {
    document.querySelectorAll('.matches-league-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
  }
  currentLeague = league;
  updateStatsSummary();
  renderMatches();
}

function getLeagueKey(leagueName) {
  const ln = (leagueName || '').toLowerCase();
  if (ln.includes('cup') || ln.includes('shield')) return 'cups';
  if (ln.includes('midweek')) return 'midweek';
  if (ln.includes('senior') || ln.includes('1st')) return 'team1';
  if (ln.includes('junior') || ln.includes('2nd')) return 'team2';
  return 'other';
}

function updateStatsSummary() {
  let relevantResults = allResults;
  if (currentLeague !== 'all') {
    relevantResults = allResults.filter(match => getLeagueKey(match.league) === currentLeague);
  }
  calculateStats(relevantResults);
}

function calculateStats(results) {
  let wins = 0;
  let losses = 0;
  let nr = 0;
  
  results.forEach(match => {
    const homeLower = (match.homeTeam || '').toLowerCase();
    const awayLower = (match.awayTeam || '').toLowerCase();
    const resLower = (match.result || '').toLowerCase();
    const involvesArches = homeLower.includes('arches') || awayLower.includes('arches') || resLower.includes('arches');
    if (!involvesArches) return;
    
    const noResultKeywords = ['postponed', 'abandoned', 'no result', 'cancelled', 'tbd', 'to be decided', 'postponement', 'match postponed', 'unplayed', 'completed (no result)', 'match tied', 'tied with'];
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
  
  const elMatches = document.getElementById('stat-total-matches');
  const elWins = document.getElementById('stat-total-wins');
  const elLosses = document.getElementById('stat-total-losses');
  const elNr = document.getElementById('stat-total-nr');
  const elWinRate = document.getElementById('stat-total-winrate');

  if (elMatches) elMatches.textContent = totalPlayed;
  if (elWins) elWins.textContent = wins;
  if (elLosses) elLosses.textContent = losses;
  if (elNr) elNr.textContent = nr;
  if (elWinRate) elWinRate.textContent = `${winRate}%`;
}

function renderMatches() {
  const container = document.getElementById('matches-content');
  if (!container) return;
  const dataList = currentMode === 'results' ? allResults : allFixtures;
  
  let filtered = dataList.filter(match => {
    const lk = getLeagueKey(match.league);
    if (currentLeague === 'all') return true;
    return lk === currentLeague;
  });
  
  if (filtered.length === 0) {
    if (currentMode === 'fixtures') {
      container.innerHTML = `<div class="glass-card" style="padding:3rem; text-align:center;">
        <h3 style="color:var(--text); margin-bottom: 0.5rem;">No Fixtures found</h3>
        <p style="color:var(--muted);">${selectedSeason === '2025' ? 'The 2025 season has completed. All match results are recorded in the Results tab.' : 'There are no upcoming fixtures scheduled for this selection.'}</p>
      </div>`;
    } else {
      container.innerHTML = `<div class="glass-card" style="padding:3rem; text-align:center;">
        <h3 style="color:var(--text); margin-bottom: 0.5rem;">No Results found</h3>
        <p style="color:var(--muted);">There are no results to display for this category.</p>
      </div>`;
    }
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
    let colorClass = 'var(--text)';
    if (leagueName.includes('Senior') || leagueName.includes('Junior Cup')) colorClass = 'var(--amber)';
    if (leagueName.includes('Junior League') || leagueName.includes('Development')) colorClass = 'var(--gold)';
    if (leagueName.includes('Midweek') || leagueName.includes('T20')) colorClass = '#3b82f6';
    
    html += `
      <div class="reveal visible" style="margin-bottom: 2rem;">
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
      const resLower = (match.result || '').toLowerCase();
      const involvesArches = homeLower.includes('arches') || awayLower.includes('arches') || resLower.includes('arches');
      
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
        const noResultKeywords = ['postponed', 'abandoned', 'no result', 'cancelled', 'tbd', 'to be decided', 'postponement', 'match postponed', 'unplayed', 'completed (no result)', 'match tied', 'tied with'];
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

function switchSeason(season) {
  selectedSeason = season;
  const badge = document.getElementById('archiveBadge');
  if (badge) {
    badge.style.display = (season === '2025') ? 'inline-flex' : 'none';
  }
  
  // If viewing 2025 (completed season), default to results view
  if (season === '2025') {
    currentMode = 'results';
    document.querySelectorAll('.matches-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === 'results');
    });
  }

  loadData(season);
}

async function loadData(season = selectedSeason) {
  selectedSeason = season;
  const container = document.getElementById('matches-content');
  if (container) {
    container.innerHTML = `<div class="loading-state"><div class="spinner"></div><p style="color:var(--muted);font-size:0.9rem;">Loading ${season} matches...</p></div>`;
  }

  let seasonData = null;

  // 1. Load verified segregated JSON dataset
  const v = Date.now();
  try {
    let targetUrl = `data/matches_2026.json?v=${v}`;
    if (season === '2025') {
      targetUrl = `data/archive/matches_2025.json?v=${v}`;
    }
    const res = await fetch(targetUrl);
    if (res.ok) {
      seasonData = await res.json();
    } else {
      const fallbackRes = await fetch(`data/matches.json?v=${v}`);
      seasonData = await fallbackRes.json();
    }
  } catch (e) {
    console.warn('Error loading local matches JSON:', e);
  }

  // 2. Fallback to Supabase cloud database if local fetch was unavailable
  if ((!seasonData || !seasonData.results || seasonData.results.length === 0) && window.DB && window.DB.client) {
    try {
      const { data, error } = await window.DB.client
        .from('matches')
        .select('*')
        .eq('season', season);
      if (!error && data && data.length > 0) {
        const results = data.filter(m => m.status === 'completed' || season === '2025').map(m => ({
          date: m.date_display,
          league: m.league,
          homeTeam: m.home_team,
          awayTeam: m.away_team,
          venue: m.venue,
          result: m.result || 'Completed (No Result)'
        }));
        const fixtures = data.filter(m => m.status === 'scheduled' && season !== '2025').map(m => ({
          date: m.date_display,
          league: m.league,
          homeTeam: m.home_team,
          awayTeam: m.away_team,
          venue: m.venue,
          result: m.result
        }));
        seasonData = { fixtures, results };
      }
    } catch (err) {
      console.warn('[Matches] Supabase query error:', err);
    }
  }

  if (!seasonData) {
    seasonData = { fixtures: [], results: [] };
  }

  allFixtures = sortMatches(seasonData.fixtures || [], false);
  allResults = sortMatches(seasonData.results || [], true);

  updateStatsSummary();

  if (window.location.hash === '#results') {
    currentMode = 'results';
  } else if (window.location.hash === '#fixtures') {
    currentMode = 'fixtures';
  } else if (window.location.hash === '#archive') {
    selectedSeason = '2025';
    const select = document.getElementById('seasonSelect');
    if (select) select.value = '2025';
    const badge = document.getElementById('archiveBadge');
    if (badge) badge.style.display = 'inline-flex';
    currentMode = 'results';
  }

  toggleMatchesMode(currentMode);
}

window.addEventListener('hashchange', () => {
  if (window.location.hash === '#results') {
    toggleMatchesMode('results');
  } else if (window.location.hash === '#fixtures') {
    toggleMatchesMode('fixtures');
  } else if (window.location.hash === '#archive') {
    switchSeason('2025');
  }
});

document.addEventListener('DOMContentLoaded', () => loadData(selectedSeason));
