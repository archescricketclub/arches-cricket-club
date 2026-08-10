// Filter tabs
function filterFixtures(team, btn) {
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

function sortFixtures(list) {
  return list.sort((a, b) => {
    const dA = parseMatchDate(a.date);
    const dB = parseMatchDate(b.date);
    if (!dA && !dB) return 0;
    if (!dA) return 1;
    if (!dB) return -1;
    return dA - dB;
  });
}

function loadFixtures() {
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
          <p>Loading fixtures...</p>
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
      const rawFixtures = data.fixtures || [];
      const fixtures = sortFixtures(rawFixtures);
      
      // Clear loading texts
      Object.values(leagues).forEach(tbody => {
        if (tbody) tbody.innerHTML = '';
      });

      const populated = new Set();

      fixtures.forEach(match => {
        const tbody = leagues[match.league];
        if (!tbody) return;
        
        const homeLower = (match.homeTeam || '').toLowerCase();
        const awayLower = (match.awayTeam || '').toLowerCase();
        const involvesArches = homeLower.includes('arches') || awayLower.includes('arches');
        if (!involvesArches) return;
        
        populated.add(match.league);
        
        let rowClass = 'match-row-arches';
        
        // Escape data first
        const safeHome = escapeHTML(match.homeTeam);
        const safeAway = escapeHTML(match.awayTeam);
        const safeDate = escapeHTML(cleanText(match.date));
        const safeTime = escapeHTML(cleanText(match.time)) || 'TBD';
        const safeVenue = escapeHTML(cleanText(match.venue)) || 'TBD';

        let homeDisplay = homeLower.includes('arches') ? `<strong class="text-amber">${safeHome}</strong>` : safeHome;
        let awayDisplay = awayLower.includes('arches') ? `<strong class="text-amber">${safeAway}</strong>` : safeAway;

        const row = `
          <tr class="${rowClass}">
            <td data-label="Date">${safeDate}</td>
            <td data-label="Match">${homeDisplay} vs ${awayDisplay}</td>
            <td data-label="Time">${safeTime}</td>
            <td data-label="Ground">${safeVenue}</td>
          </tr>
        `;
        tbody.innerHTML += row;
      });

      // Set "No fixtures found" for any unpopulated categories
      Object.keys(leagues).forEach(leagueName => {
        if (!populated.has(leagueName)) {
          const tbody = leagues[leagueName];
          if (tbody) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No fixtures found</td></tr>';
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
              <div>Failed to load fixtures</div>
            </div>
          </td></tr>`;
        }
      });
    });
}

document.addEventListener('DOMContentLoaded', loadFixtures);
