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
  currentCategory = cat;

  // Sync desktop tabs
  document.querySelectorAll('.tab-btn').forEach(b => {
    const bCat = b.getAttribute('data-cat') || (b.getAttribute('onclick')?.match(/switchCategory\('([^']+)'/)?.[1]);
    if (bCat === cat) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });

  // Sync mobile select dropdown
  const mobSelect = document.getElementById('mobileHonoursSelect');
  if (mobSelect && mobSelect.value !== cat) {
    mobSelect.value = cat;
  }

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
  const season = document.getElementById('seasonFilter')?.value || 'all';
  const search = document.getElementById('searchInput')?.value.toLowerCase().trim() || '';
  const grid = document.getElementById('honoursGrid');
  if (!grid) return;

  // Filter by category, season, and search query
  const filtered = HONOURS.filter(item => {
    const matchCat = item.category === currentCategory;
    const matchSeason = season === 'all' || item.season === season;
    const matchSearch = item.name.toLowerCase().includes(search);
    return matchCat && matchSeason && matchSearch;
  });

  // Update badge count
  const badge = document.getElementById('recordCountBadge');
  if (badge) {
    badge.innerHTML = `<i class="fa-solid fa-award" style="color:var(--amber);margin-right:4px;"></i> ${filtered.length} Milestone${filtered.length === 1 ? '' : 's'}`;
  }

  // Sort by date newest to oldest (descending) or chronological
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

  // Desktop Table HTML
  let desktopTableHTML = `
    <div class="honours-desktop-table">
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

  desktopTableHTML += filtered.map((item, index) => {
    const opp = (item.opponent || 'Opposition TBD').replace(/^vs\.?\s+/i, '');
    return `
      <tr>
        <td class="table-sno">#${index + 1}</td>
        <td class="table-player">${escapeHTML(item.name)}</td>
        ${!isHatTrick ? `<td class="table-record">${escapeHTML(item.record)}</td>` : ''}
        <td class="table-opp">vs ${escapeHTML(opp)}</td>
        <td class="table-date">${escapeHTML(item.date || 'Date TBD')}</td>
        <td class="table-league"><span style="color:#cbd5e1;">${escapeHTML(item.league || 'Arches CC')}</span> <span style="color:var(--amber);margin-left:4px;font-size:0.75rem;">(${escapeHTML(item.season || '2025')})</span></td>
      </tr>
    `;
  }).join('');

  desktopTableHTML += `
        </tbody>
      </table>
    </div>
  `;

  // Mobile Cards HTML (Zero horizontal scroll, responsive athletic cards)
  let mobileCardsHTML = `
    <div class="honours-mobile-cards">
  `;

  mobileCardsHTML += filtered.map((item, index) => {
    const opp = (item.opponent || 'Opposition TBD').replace(/^vs\.?\s+/i, '');
    return `
      <div class="honour-card">
        <div class="honour-card-top">
          <div class="honour-card-left">
            <div class="honour-card-rank">#${index + 1}</div>
            <div class="honour-card-info">
              <div class="honour-card-player">${escapeHTML(item.name)}</div>
              <div class="honour-card-vs"><i class="fa-solid fa-shield-halved"></i> vs ${escapeHTML(opp)}</div>
            </div>
          </div>
          <div class="honour-card-right">
            ${!isHatTrick ? `
              <div class="honour-card-record">${escapeHTML(item.record)}</div>
              <div class="honour-card-record-lbl">${isBowling ? 'FIGURES' : 'RUNS'}</div>
            ` : `
              <div class="honour-card-badge-hattrick"><i class="fa-solid fa-wand-magic-sparkles"></i> HAT-TRICK</div>
            `}
          </div>
        </div>
        <div class="honour-card-divider"></div>
        <div class="honour-card-bottom">
          <div class="honour-card-meta"><i class="fa-regular fa-calendar"></i> ${escapeHTML(item.date || 'Date TBD')}</div>
          <div class="honour-card-pills">
            <span class="honour-card-league">${escapeHTML(item.league || 'Arches CC')}</span>
            <span class="honour-card-season">${escapeHTML(item.season || '2025')}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  mobileCardsHTML += `
    </div>
  `;

  grid.innerHTML = desktopTableHTML + mobileCardsHTML;
}

document.addEventListener('DOMContentLoaded', () => { 
  if (window.location.hash) { 
    const cat = window.location.hash.substring(1); 
    switchCategory(cat); 
  } 
  loadHonours(); 
});
