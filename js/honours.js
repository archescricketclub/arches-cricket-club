let HONOURS = [];
let currentCategory = window.location.hash ? window.location.hash.substring(1) : 'century';

async function loadHonours() {
  const grid = document.getElementById('honoursGrid');
  if (grid) showLoading('honoursGrid');
  
  try {
    const res = await fetch(`data/honours.json?v=${new Date().getTime()}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    HONOURS = await res.json();
    filterData();
  } catch (e) {
    console.error('Error loading honours.json:', e);
    HONOURS = [];
    if (grid) showError('honoursGrid', 'Unable to load honours data. Please try again later.');
  }
}

function switchCategory(cat, btn) {
  if (btn) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
  currentCategory = cat; 
  if (window.history.replaceState) { 
    window.history.replaceState(null, null, '#' + cat); 
  } else { 
    window.location.hash = cat; 
  }
  filterData();
}

function parseDate(dateStr) {
  if (!dateStr) return new Date(0);
  const clean = dateStr.trim();
  if (/^\d{4}$/.test(clean)) {
    return new Date(parseInt(clean), 0, 1);
  }
  const normalized = clean.replace(/(\d+)(st|nd|rd|th)/i, '$1');
  const parsed = Date.parse(normalized);
  if (!isNaN(parsed)) {
    return new Date(parsed);
  }
  const yearMatch = clean.match(/\b\d{4}\b/);
  if (yearMatch) {
    return new Date(parseInt(yearMatch[0]), 0, 1);
  }
  return new Date(0);
}

function filterData() {
  const season = document.getElementById('seasonFilter').value;
  const search = document.getElementById('searchInput').value.toLowerCase().trim();
  const grid = document.getElementById('honoursGrid');
  if (!grid) return;

  // Filter by category, season, and search query
  const filtered = HONOURS.filter(item => {
    const matchCat = item.category === currentCategory;
    const matchSeason = season === 'all' || item.season === season;
    const matchSearch = item.name.toLowerCase().includes(search);
    return matchCat && matchSeason && matchSearch;
  });

  // Sort by date oldest to newest (ascending), then by record descending
  filtered.sort((a, b) => {
    const dA = parseDate(a.date);
    const dB = parseDate(b.date);
    if (dA.getTime() !== dB.getTime()) {
      return dA.getTime() - dB.getTime();
    }

    if (currentCategory.includes('wickets') || currentCategory.includes('3w')) {
      const wA = parseInt(a.record.split('-')[0]) || 0;
      const wB = parseInt(b.record.split('-')[0]) || 0;
      if (wA !== wB) return wB - wA;
      const rA = parseInt(a.record.split('-')[1]) || 999;
      const rB = parseInt(b.record.split('-')[1]) || 999;
      return rA - rB; // lower runs is better
    } else {
      const rA = parseInt(a.record.replace('*', '')) || 0;
      const rB = parseInt(b.record.replace('*', '')) || 0;
      return rB - rA;
    }
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-trophy empty-icon"></i>
        <div class="empty-title">No Records Found</div>
        <p class="empty-desc">No player achievements match the selected season, category, or search criteria.</p>
      </div>`;
    return;
  }

  const isBowling = currentCategory.includes('wickets') || currentCategory.includes('3w');
  const isHatTrick = currentCategory === 'hat-trick';
  const recordHeader = isBowling ? 'Figures' : 'Score';

  let tableHTML = `
    <div class="honours-table-container">
      <table class="honours-table">
        <thead>
          <tr>
            <th class="table-sno">S.No</th>
            <th>Player Name</th>
            ${!isHatTrick ? `<th>${escapeHTML(recordHeader)}</th>` : ''}
            <th>Opposition</th>
            <th>Date</th>
            <th>League</th>
          </tr>
        </thead>
        <tbody>
  `;

  tableHTML += filtered.map((item, index) => {
    return `
      <tr>
        <td class="table-sno" data-label="S.No">${index + 1}</td>
        <td class="table-player" data-label="Player Name">${escapeHTML(item.name)}</td>
        ${!isHatTrick ? `<td class="table-record" data-label="${escapeHTML(recordHeader)}">${escapeHTML(item.record)}</td>` : ''}
        <td class="table-opp" data-label="Opposition">vs ${escapeHTML(item.opponent || 'Opposition TBD')}</td>
        <td class="table-date" data-label="Date">${escapeHTML(item.date || 'Date TBD')}</td>
        <td class="table-league" data-label="League">${escapeHTML(item.league || 'League TBD')}</td>
      </tr>
    `;
  }).join('');

  tableHTML += `
        </tbody>
      </table>
    </div>
  `;

  grid.innerHTML = tableHTML;
}

document.addEventListener('DOMContentLoaded', () => { 
  if (window.location.hash) { 
    const cat = window.location.hash.substring(1); 
    const btn = document.querySelector(".tab-btn[onclick*='" + cat + "']"); 
    if (btn) { switchCategory(cat, btn); } else { switchCategory(cat); } 
  } 
  loadHonours(); 
});
