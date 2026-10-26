/* ─── ARCHES CRICKET CLUB - PLAYERS & SQUAD ENGINE ───────────────── */
// Dynamic stats loaded from players_2026.json, players_2025.json, roster.json, and career_stats.json
let DATA = {};
let PLAYERS_2026 = {};
let PLAYERS_2025 = {};
let PLAYERS_ALL = {};
let ALL_PLAYERS = [];
let CAREER_STATS = { 2025: [], 2026: [], all: [] };
let currentSeason = '2026';
let CURRENT_SORTS = {};

/* ─── STATS CALCULATION HELPERS ──────────────────────────────────── */
function parseBestFig(figStr) {
    if (!figStr || figStr === '-') return { w: 0, r: 999 };
    const parts = figStr.toString().split('-');
    return { w: parseInt(parts[0]) || 0, r: parseInt(parts[1]) || 999 };
}

function compareBestFig(figA, figB) {
    const a = parseBestFig(figA);
    const b = parseBestFig(figB);
    if (a.w !== b.w) return a.w - b.w;
    return b.r - a.r; // fewer runs conceded is better
}

function oversToBalls(oversStr) {
    if (!oversStr) return 0;
    const parts = oversStr.toString().split('.');
    const overs = parseInt(parts[0]) || 0;
    const balls = parseInt(parts[1]) || 0;
    return overs * 6 + balls;
}

function ballsToOvers(balls) {
    const overs = Math.floor(balls / 6);
    const rem = balls % 6;
    return rem > 0 ? `${overs}.${rem}` : `${overs}`;
}

function computeAllRounders(dataset) {
    ['t1', 't2', 'mw', 'cup'].forEach(team => {
        const batKey = `${team}-bat`;
        const bowlKey = `${team}-bowl`;
        const arKey = `${team}-ar`;

        if (dataset[batKey] && dataset[bowlKey]) {
            const bowlersMap = {};
            dataset[bowlKey].forEach(p => bowlersMap[p.name] = p);

            const allRounders = [];
            dataset[batKey].forEach(batPlayer => {
                const bowlPlayer = bowlersMap[batPlayer.name];
                if (bowlPlayer) {
                    const getStat = (p, label) => {
                        const s = (p.stats || []).find(x => x.l === label);
                        return s ? s.n : '0';
                    };

                    const runsStr = getStat(batPlayer, 'Runs');
                    const runs = parseInt(runsStr.replace('*', '')) || 0;
                    const wktsStr = getStat(bowlPlayer, 'Wickets');
                    const wkts = parseInt(wktsStr) || 0;
                    const matches = Math.max(parseInt(getStat(batPlayer, 'Matches')) || 0, parseInt(getStat(bowlPlayer, 'Matches')) || 0);

                    if (runs >= 20 && wkts >= 2) {
                        allRounders.push({
                            ...batPlayer,
                            stats: [
                                { n: matches.toString(), l: 'Matches' },
                                { n: runsStr, l: 'Runs' },
                                { n: wktsStr, l: 'Wickets' },
                                { n: getStat(bowlPlayer, 'Best Fig'), l: 'Best Fig' }
                            ]
                        });
                    }
                }
            });
            dataset[arKey] = allRounders;
        }
    });
}

function combinePlayerStats(p25Data, p26Data) {
    const combined = {};
    const teams = ['t1', 't2', 'mw', 'cup'];

    teams.forEach(team => {
        // Batting
        const batKey = `${team}-bat`;
        const batMap = new Map();

        const processBat = (list) => {
            (list || []).forEach(p => {
                const getStat = (label) => {
                    const s = (p.stats || []).find(x => x.l === label);
                    return s ? s.n : '0';
                };
                const m = parseInt(getStat('Matches')) || 0;
                const rStr = getStat('Runs');
                const r = parseInt(rStr.replace('*', '')) || 0;
                const hsStr = getStat('High Score');
                const hsVal = parseInt(hsStr.replace('*', '')) || 0;
                const avgVal = parseFloat(getStat('Average')) || 0;

                if (!batMap.has(p.name)) {
                    batMap.set(p.name, {
                        name: p.name,
                        jersey: p.jersey,
                        cap: p.cap,
                        matches: m,
                        runs: r,
                        hsStr: hsStr,
                        hsVal: hsVal,
                        avgWeightedSum: avgVal > 0 ? (r / avgVal) : (r > 0 ? 1 : 0),
                        totalRunsForAvg: r
                    });
                } else {
                    const existing = batMap.get(p.name);
                    existing.matches += m;
                    existing.runs += r;
                    if (hsVal > existing.hsVal) {
                        existing.hsVal = hsVal;
                        existing.hsStr = hsStr;
                    }
                    if (avgVal > 0) {
                        existing.avgWeightedSum += (r / avgVal);
                        existing.totalRunsForAvg += r;
                    }
                }
            });
        };

        processBat(p25Data[batKey]);
        processBat(p26Data[batKey]);

        combined[batKey] = Array.from(batMap.values()).map(p => {
            const avg = p.avgWeightedSum > 0 ? (p.totalRunsForAvg / p.avgWeightedSum).toFixed(2) : '-';
            return {
                name: p.name,
                jersey: p.jersey,
                cap: p.cap,
                stats: [
                    { n: p.matches.toString(), l: 'Matches' },
                    { n: p.runs.toString(), l: 'Runs' },
                    { n: p.hsStr || '-', l: 'High Score' },
                    { n: avg, l: 'Average' }
                ]
            };
        });

        // Bowling
        const bowlKey = `${team}-bowl`;
        const bowlMap = new Map();

        const processBowl = (list) => {
            (list || []).forEach(p => {
                const getStat = (label) => {
                    const s = (p.stats || []).find(x => x.l === label);
                    return s ? s.n : '0';
                };
                const m = parseInt(getStat('Matches')) || 0;
                const overs = getStat('Overs');
                const balls = oversToBalls(overs);
                const wkts = parseInt(getStat('Wickets')) || 0;
                const bestFig = getStat('Best Fig');

                if (!bowlMap.has(p.name)) {
                    bowlMap.set(p.name, {
                        name: p.name,
                        jersey: p.jersey,
                        cap: p.cap,
                        matches: m,
                        balls: balls,
                        wickets: wkts,
                        bestFig: bestFig
                    });
                } else {
                    const existing = bowlMap.get(p.name);
                    existing.matches += m;
                    existing.balls += balls;
                    existing.wickets += wkts;
                    if (compareBestFig(bestFig, existing.bestFig) > 0) {
                        existing.bestFig = bestFig;
                    }
                }
            });
        };

        processBowl(p25Data[bowlKey]);
        processBowl(p26Data[bowlKey]);

        combined[bowlKey] = Array.from(bowlMap.values()).map(p => ({
            name: p.name,
            jersey: p.jersey,
            cap: p.cap,
            stats: [
                { n: p.matches.toString(), l: 'Matches' },
                { n: ballsToOvers(p.balls), l: 'Overs' },
                { n: p.wickets.toString(), l: 'Wickets' },
                { n: p.bestFig || '-', l: 'Best Fig' }
            ]
        }));
    });

    return combined;
}

/* ─── INITIALIZATION ─────────────────────────────────────────────── */
async function initData() {
    showLoading('all-roster');
    showLoading('career-roster');
    try {
        const [players26Res, players25Res, rosterRes, careerRes] = await Promise.all([
            fetch(`data/players_2026.json?v=${new Date().getTime()}`),
            fetch(`data/players_2025.json?v=${new Date().getTime()}`),
            fetch(`data/roster.json?v=${new Date().getTime()}`),
            fetch(`data/career_stats.json?v=${new Date().getTime()}`)
        ]);

        if (!players26Res.ok || !players25Res.ok || !rosterRes.ok || !careerRes.ok) {
            throw new Error('Failed to load one or more player datasets');
        }

        const raw2026 = await players26Res.json();
        const raw2025 = await players25Res.json();
        ALL_PLAYERS = await rosterRes.json();
        CAREER_STATS = await careerRes.json();

        PLAYERS_2026 = JSON.parse(JSON.stringify(raw2026));
        computeAllRounders(PLAYERS_2026);

        PLAYERS_2025 = JSON.parse(JSON.stringify(raw2025));
        computeAllRounders(PLAYERS_2025);

        PLAYERS_ALL = combinePlayerStats(raw2025, raw2026);
        computeAllRounders(PLAYERS_ALL);

        injectSortFilters();

        const urlParams = new URLSearchParams(window.location.search);
        const seasonParam = urlParams.get('season');
        const initialSeason = (seasonParam === '2025' || seasonParam === 'all' || seasonParam === '2026') ? seasonParam : '2026';

        switchPlayerSeason(initialSeason);
        renderRoster();
    } catch (e) {
        console.error('Error loading player data:', e);
        showError('all-roster', 'Unable to load players roster.');
        showError('career-roster', 'Unable to load career stats.');
        DATA = {
            't1-bat': [], 't1-bowl': [], 't1-ar': [],
            't2-bat': [], 't2-bowl': [], 't2-ar': [],
            'mw-bat': [], 'mw-bowl': [], 'mw-ar': [],
            'cup-bat': [], 'cup-bowl': [], 'cup-ar': []
        };
        ALL_PLAYERS = [];
        CAREER_STATS = { 2025: [], 2026: [], all: [] };
    }
}

/* ─── SEASON SWITCHER ────────────────────────────────────────────── */
function switchPlayerSeason(season) {
    currentSeason = season;

    if (season === '2025') {
        DATA = PLAYERS_2025;
    } else if (season === 'all') {
        DATA = PLAYERS_ALL;
    } else {
        DATA = PLAYERS_2026;
    }

    const label = season === '2025' ? '2025 Season' : (season === 'all' ? 'All Seasons (Career)' : '2026 Season');

    // Update Hero eyebrow
    const heroBadge = document.getElementById('heroSeasonBadge');
    if (heroBadge) {
        heroBadge.innerHTML = `<i class="fa-solid fa-circle" style="font-size:.4rem;"></i> ${label}`;
    }

    // Update Top Pill Badge
    const badgeText = document.getElementById('playerSeasonBadgeText');
    if (badgeText) {
        badgeText.textContent = `Viewing ${label}`;
    }

    // Sync Main Select Dropdown
    const select = document.getElementById('playerSeasonSelect');
    if (select && select.value !== season) {
        select.value = season;
    }

    // Sync Career Stats Season Filter
    const careerSelect = document.getElementById('careerSeasonFilter');
    if (careerSelect && careerSelect.value !== season) {
        careerSelect.value = season;
    }

    const careerDesc = document.getElementById('careerStatsDesc');
    if (careerDesc) {
        if (season === '2026') {
            careerDesc.textContent = 'Individual player statistics for the 2026 Season across all competitions.';
        } else if (season === '2025') {
            careerDesc.textContent = 'Individual player statistics for the 2025 Season across all competitions.';
        } else {
            careerDesc.textContent = 'All-Time Career Stats since 2025 (merged 2025 & 2026 seasons).';
        }
    }

    renderStats();
    filterCareerStats();
}

/* ─── RENDER PLAYER CARDS ────────────────────────────────────────── */
function makeCard(p, idx, isExpanded = false) {
    const hidden = (!isExpanded && idx >= 5) ? 'hidden' : '';
    const badge = p.badge ? `<div class="pc-top-badge">${escapeHTML(p.badge)}</div>` : '';
    const body = p.stats && p.stats.length
        ? `<div class="pc-stats">${p.stats.map(s => `<div class="pcs"><div class="pcs-n">${escapeHTML(s.n)}</div><div class="pcs-l">${escapeHTML(s.l)}</div></div>`).join('')}</div>`
        : `<div class="pc-stats"><div class="pcs" style="flex:1"><div class="pcs-n" style="color:var(--muted)">—</div><div class="pcs-l">No stats available</div></div></div>`;
    return `<div class="pc ${hidden}">
    ${badge}
    <div class="pc-top">
      <div class="pc-jersey">${escapeHTML(p.jersey || '#—')}</div>
      <div class="pc-cap">${escapeHTML(p.cap || '—')}</div>
      <img src="player-avatar.svg" class="pc-icon" alt="Player">
    </div>
    <div class="pc-body">
      <div class="pc-name">${escapeHTML(p.name)}</div>
      <div class="pc-meta">Jersey ${escapeHTML(p.jersey || '#—')} · Cap ${escapeHTML(p.cap || '—')}</div>
    </div>
    ${body}
  </div>`;
}

function injectSortFilters() {
    const categories = {
        'bat': [
            {val: 'az', label: 'A - Z'}, {val: 'za', label: 'Z - A'},
            {val: 'runs', label: 'Runs'}, {val: 'matches', label: 'Matches'}, {val: 'hs', label: 'Highest Score'}
        ],
        'bowl': [
            {val: 'az', label: 'A - Z'}, {val: 'za', label: 'Z - A'},
            {val: 'wickets', label: 'Wickets'}, {val: 'matches', label: 'Matches'}, {val: 'bestfig', label: 'Best Fig'}
        ],
        'ar': [
            {val: 'az', label: 'A - Z'}, {val: 'za', label: 'Z - A'},
            {val: 'runs', label: 'Runs'}, {val: 'wickets', label: 'Wickets'}
        ]
    };

    document.querySelectorAll('.cat-block').forEach(block => {
        let type = '';
        if (block.classList.contains('cat-bat')) type = 'bat';
        else if (block.classList.contains('cat-bowl')) type = 'bowl';
        else if (block.classList.contains('cat-ar')) type = 'ar';
        else return;

        const grid = block.querySelector('.squad-grid');
        if (!grid) return;
        const gridId = grid.id;

        const btn = block.querySelector('.view-all-btn');
        if (!btn) return;

        if (block.querySelector('.sort-filter')) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'header-actions';
        wrapper.style.display = 'flex';
        wrapper.style.gap = '0.5rem';
        wrapper.style.alignItems = 'center';

        const select = document.createElement('select');
        select.className = 'sort-filter';
        select.innerHTML = '<option value="">Sort By</option>' +
            categories[type].map(o => `<option value="${o.val}">${o.label}</option>`).join('');
        select.onchange = (e) => sortCategory(gridId, e.target.value);

        btn.parentNode.insertBefore(wrapper, btn);
        wrapper.appendChild(select);
        wrapper.appendChild(btn);
    });
}

function sortCategory(key, sortType) {
    CURRENT_SORTS[key] = sortType;
    applySortAndRender(key);
}

function applySortAndRender(key) {
    if (!DATA || !DATA[key]) return;

    let defaultSort = 'az';
    if (key.includes('-bat')) defaultSort = 'runs';
    else if (key.includes('-bowl')) defaultSort = 'wickets';
    else if (key.includes('-ar')) defaultSort = 'runs';

    const sortType = CURRENT_SORTS[key] || defaultSort;

    const el = document.getElementById(key);
    if (!el) return;

    const select = el.closest('.cat-block')?.querySelector('.sort-filter');
    if (select && select.value !== sortType) {
        select.value = sortType;
    }

    let list = [...DATA[key]];

    if (sortType === 'az') {
        list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortType === 'za') {
        list.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortType) {
        list.sort((a, b) => {
            const getVal = (p) => {
                let label = '';
                if (sortType === 'runs') label = 'Runs';
                else if (sortType === 'matches') label = 'Matches';
                else if (sortType === 'hs') label = 'High Score';
                else if (sortType === 'wickets') label = 'Wickets';
                else if (sortType === 'bestfig') label = 'Best Fig';

                const s = (p.stats || []).find(x => x.l === label);
                if (!s) return 0;

                if (sortType === 'bestfig') {
                    const parts = s.n.toString().split('-');
                    if (parts.length === 2) {
                        return parseInt(parts[0]) * 1000 - parseInt(parts[1]);
                    }
                    return 0;
                }
                return parseInt(s.n.toString().replace('*', '')) || 0;
            };
            return getVal(b) - getVal(a);
        });
    }

    const btn = el.closest('.cat-block')?.querySelector('.view-all-btn');
    const isExpanded = btn && btn.dataset.expanded === '1';

    if (list.length === 0) {
        el.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 2.5rem 1rem; color: var(--muted2); font-style: italic;">No records in this category for the selected season.</div>`;
    } else {
        el.innerHTML = list.map((p, i) => makeCard(p, i, isExpanded)).join('');
    }

    if (btn) {
        if (list.length <= 5) {
            btn.style.display = 'none';
        } else {
            btn.style.display = '';
        }
    }
}

function renderStats() {
    if (!DATA) return;
    Object.keys(DATA).forEach(key => {
        applySortAndRender(key);
    });
}

function renderRoster() {
    const el = document.getElementById('all-roster');
    if (!el) return;
    el.innerHTML = ALL_PLAYERS.map(p => `
  <div class="pc">
    <div class="pc-top">
      <div class="pc-jersey">${escapeHTML(p.jersey || '#—')}</div>
      <div class="pc-cap">${escapeHTML(p.cap || '—')}</div>
      <img src="player-avatar.svg" class="pc-icon" alt="Player">
    </div>
    <div class="pc-body">
      <div class="pc-name">${escapeHTML(p.name)}</div>
      <div class="pc-meta">Jersey&nbsp;${escapeHTML(p.jersey || '#—')} &middot; Cap&nbsp;${escapeHTML(p.cap || '—')}</div>
    </div>
    <div class="pc-stats">
      <div class="pcs" style="flex:1"><div class="pcs-n" style="color:var(--amber);font-size:1.1rem">&#9679;</div><div class="pcs-l">Registered</div></div>
    </div>
  </div>`).join('');
}

function renderCareerStats(filteredList = null) {
    const el = document.getElementById('career-roster');
    if (!el) return;
    const seasonKey = document.getElementById('careerSeasonFilter')?.value || currentSeason || 'all';
    const listToRender = filteredList || (CAREER_STATS[seasonKey] || CAREER_STATS.all || CAREER_STATS);

    if (!listToRender || listToRender.length === 0) {
        el.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--muted); font-style: italic;">
            No career stats found matching your criteria.
          </div>`;
        return;
    }

    el.innerHTML = listToRender.map(p => {
        const batting = p.batting || {};
        const bowling = p.bowling || {};
        const runs = batting.runs !== undefined ? batting.runs : 0;
        const hs = batting.hs || '-';
        const wkts = bowling.wickets !== undefined ? bowling.wickets : 0;
        const best = bowling.bestFig || '-';
        const matches = Math.max(batting.matches || 0, bowling.matches || 0);

        return `<div class="pc">
            <div class="pc-top">
                <div class="pc-jersey">${escapeHTML(p.jersey || '#—')}</div>
                <div class="pc-cap">${escapeHTML(p.cap || '—')}</div>
                <img src="player-avatar.svg" class="pc-icon" alt="Player">
            </div>
            <div class="pc-body">
                <div class="pc-name">${escapeHTML(p.name)}</div>
                <div class="pc-meta">Jersey ${escapeHTML(p.jersey || '#—')} · Cap ${escapeHTML(p.cap || '—')}</div>
            </div>
            <div class="pc-stats">
                <div class="pcs">
                    <div class="pcs-n">${matches}</div>
                    <div class="pcs-l">Matches</div>
                </div>
                <div class="pcs">
                    <div class="pcs-n">${runs}</div>
                    <div class="pcs-l">Runs</div>
                </div>
                <div class="pcs">
                    <div class="pcs-n">${hs}</div>
                    <div class="pcs-l">HS</div>
                </div>
                <div class="pcs">
                    <div class="pcs-n">${wkts}</div>
                    <div class="pcs-l">Wkts</div>
                </div>
                <div class="pcs">
                    <div class="pcs-n">${best}</div>
                    <div class="pcs-l">Best Bowl</div>
                </div>
            </div>
        </div>`;
    }).join('');
}

function filterCareerStats() {
    const searchInput = document.getElementById('careerSearchInput');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const sortDropdown = document.getElementById('careerSortFilter');
    const seasonDropdown = document.getElementById('careerSeasonFilter');
    const sortType = sortDropdown ? sortDropdown.value : '';
    const seasonType = seasonDropdown ? seasonDropdown.value : (currentSeason || 'all');

    let listToRender = CAREER_STATS[seasonType] ? [...CAREER_STATS[seasonType]] : (CAREER_STATS.all ? [...CAREER_STATS.all] : [...CAREER_STATS]);

    if (query) {
        listToRender = listToRender.filter(p => p.name.toLowerCase().includes(query));
    }

    if (sortType) {
        if (sortType === 'az') {
            listToRender.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortType === 'za') {
            listToRender.sort((a, b) => b.name.localeCompare(a.name));
        } else {
            listToRender.sort((a, b) => {
                const getVal = (p) => {
                    if (sortType === 'runs') return p.batting && p.batting.runs !== undefined ? parseInt(p.batting.runs) : 0;
                    if (sortType === 'matches') return Math.max((p.batting && p.batting.matches) || 0, (p.bowling && p.bowling.matches) || 0);
                    if (sortType === 'hs') return parseInt(((p.batting && p.batting.hs) || '0').toString().replace('*', '')) || 0;
                    if (sortType === 'wickets') return p.bowling && p.bowling.wickets !== undefined ? parseInt(p.bowling.wickets) : 0;
                    if (sortType === 'bestfig') {
                        const parts = ((p.bowling && p.bowling.bestFig) || '-').split('-');
                        if (parts.length === 2) return parseInt(parts[0]) * 1000 - parseInt(parts[1]);
                        return 0;
                    }
                    return 0;
                };
                return getVal(b) - getVal(a);
            });
        }
    }

    renderCareerStats(listToRender);
}

function sortCareerStats() {
    filterCareerStats();
}

/* ─── VIEW ALL EXPANDER ──────────────────────────────────────────── */
function toggleAll(gridId, btn) {
    const hidden = document.querySelectorAll(`#${gridId} .pc.hidden`);
    const isExpanded = btn.dataset.expanded === '1';
    if (!isExpanded) {
        hidden.forEach(c => c.classList.remove('hidden'));
        btn.innerHTML = '<i class="fa-solid fa-chevron-up"></i> Show Less';
        btn.dataset.expanded = '1';
    } else {
        const cards = document.querySelectorAll(`#${gridId} .pc`);
        cards.forEach((c, i) => { if (i >= 5) c.classList.add('hidden'); });
        btn.innerHTML = '<i class="fa-solid fa-chevron-down"></i> View All';
        btn.dataset.expanded = '0';
    }
}

/* ─── TEAM SWITCHER ──────────────────────────────────────────────── */
function switchTeam(team, btn) {
    if (window.history.replaceState) {
        window.history.replaceState(null, null, '#' + team);
    } else {
        window.location.hash = team;
    }
    if (btn) {
        document.querySelectorAll('.team-tab').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
    } else {
        const targetBtn = document.querySelector(`.team-tab[onclick*="'${team}'"]`);
        if (targetBtn) {
            document.querySelectorAll('.team-tab').forEach(t => t.classList.remove('active'));
            targetBtn.classList.add('active');
        }
    }
    const mobileSelect = document.querySelector('.mobile-tab-select');
    if (mobileSelect && mobileSelect.value !== team) {
        mobileSelect.value = team;
    }
    document.querySelectorAll('.team-panel').forEach(p => p.classList.remove('active'));
    const targetPanel = document.getElementById('panel-' + team);
    if (targetPanel) {
        targetPanel.classList.add('active');
    }
}

/* ─── DOM READY ──────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.hash) {
        const t = window.location.hash.substring(1);
        const b = document.querySelector(".team-tab[onclick*='" + t + "']");
        if (b) switchTeam(t, b);
        else switchTeam(t);
    }
    initData();
});