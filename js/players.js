
        /* ─── DATA ─────────────────────────────────────────── */
        // Dynamic stats loaded from data/players.json, data/roster.json, and data/career_stats.json
        let DATA = {};
        let ALL_PLAYERS = [];
        let CAREER_STATS = [];

        async function initData() {
            showLoading('all-roster');
            showLoading('career-roster');
            try {
                const [playersRes, rosterRes, careerRes] = await Promise.all([
                    fetch(`data/players.json?v=${new Date().getTime()}`),
                    fetch(`data/roster.json?v=${new Date().getTime()}`),
                    fetch(`data/career_stats.json?v=${new Date().getTime()}`)
                ]);
                if (!playersRes.ok || !rosterRes.ok || !careerRes.ok) throw new Error('Network response was not ok');
                DATA = await playersRes.json();
                ALL_PLAYERS = await rosterRes.json();
                CAREER_STATS = await careerRes.json();
                
                ['t1', 't2', 'mw', 'cup'].forEach(team => {
                    const batKey = `${team}-bat`;
                    const bowlKey = `${team}-bowl`;
                    const arKey = `${team}-ar`;
                    
                    if (DATA[batKey] && DATA[bowlKey]) {
                        const bowlersMap = {};
                        DATA[bowlKey].forEach(p => bowlersMap[p.name] = p);
                        
                        const allRounders = [];
                        DATA[batKey].forEach(batPlayer => {
                            const bowlPlayer = bowlersMap[batPlayer.name];
                            if (bowlPlayer) {
                                const getStat = (p, label) => {
                                    const s = p.stats.find(x => x.l === label);
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
                        DATA[arKey] = allRounders;
                    }
                });
                
                injectSortFilters();
            } catch (e) {
                console.error('Error loading data:', e);
                showError('all-roster', 'Unable to load players roster.');
                showError('career-roster', 'Unable to load career stats.');
                DATA = {
                    't1-bat': [], 't1-bowl': [], 't1-ar': [],
                    't2-bat': [], 't2-bowl': [], 't2-ar': [],
                    'mw-bat': [], 'mw-bowl': [], 'mw-ar': [],
                    'cup-bat': [], 'cup-bowl': [], 'cup-ar': []
                };
                ALL_PLAYERS = [];
                CAREER_STATS = [];
            }
            renderStats();
            renderRoster();
            renderCareerStats();
        }

        /* ─── RENDER ─────────────────────────────────────── */
        function makeCard(p, idx, isExpanded = false) {
            const hidden = (!isExpanded && idx >= 5) ? 'hidden' : '';
            const badge = p.badge ? `<div class="pc-top-badge">${p.badge}</div>` : '';
            const body = p.stats && p.stats.length
                ? `<div class="pc-stats">${p.stats.map(s => `<div class="pcs"><div class="pcs-n">${s.n}</div><div class="pcs-l">${s.l}</div></div>`).join('')}</div>`
                : `<div class="pc-stats"><div class="pcs" style="flex:1"><div class="pcs-n" style="color:var(--muted)">—</div><div class="pcs-l">No stats available</div></div></div>`;
            return `<div class="pc ${hidden}">
    ${badge}
    <div class="pc-top">
      <div class="pc-jersey">${p.jersey}</div>
      <div class="pc-cap">${p.cap}</div>
      <img src="player-avatar.svg" class="pc-icon" alt="Player">
    </div>
    <div class="pc-body">
      <div class="pc-name">${p.name}</div>
      <div class="pc-meta">Jersey ${p.jersey} · Cap ${p.cap}</div>
    </div>
    ${body}
  </div>`;
        }

        let CURRENT_SORTS = {};

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
            if (!DATA[key]) return;
            
            // Set default sort types based on category
            let defaultSort = 'az';
            if (key.includes('-bat')) defaultSort = 'runs';
            else if (key.includes('-bowl')) defaultSort = 'wickets';
            else if (key.includes('-ar')) defaultSort = 'runs';
            
            const sortType = CURRENT_SORTS[key] || defaultSort;
            
            // Update the select dropdown to reflect the default if it exists
            const el = document.getElementById(key);
            if (el) {
                const select = el.closest('.cat-block')?.querySelector('.sort-filter');
                if (select && select.value !== sortType) {
                    select.value = sortType;
                }
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
                        
                        const s = p.stats.find(x => x.l === label);
                        if (!s) return 0;
                        
                        if (sortType === 'bestfig') {
                            const parts = s.n.split('-');
                            if (parts.length === 2) {
                                return parseInt(parts[0]) * 1000 - parseInt(parts[1]); 
                            }
                            return 0;
                        }
                        return parseInt(s.n.replace('*', '')) || 0;
                    };
                    return getVal(b) - getVal(a);
                });
            }
            
            const el = document.getElementById(key);
            if (!el) return;
            
            const btn = el.closest('.cat-block').querySelector('.view-all-btn');
            const isExpanded = btn && btn.dataset.expanded === '1';
            
            el.innerHTML = list.map((p, i) => makeCard(p, i, isExpanded)).join('');
            
            if (btn) {
                if (list.length <= 5) {
                    btn.style.display = 'none';
                } else {
                    btn.style.display = '';
                }
            }
        }

        function renderStats() {
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
      <div class="pc-jersey">${escapeHTML(p.jersey)}</div>
      <div class="pc-cap">${escapeHTML(p.cap)}</div>
      <img src="player-avatar.svg" class="pc-icon" alt="Player">
    </div>
    <div class="pc-body">
      <div class="pc-name">${escapeHTML(p.name)}</div>
      <div class="pc-meta">Jersey&nbsp;${escapeHTML(p.jersey)} &middot; Cap&nbsp;${escapeHTML(p.cap)}</div>
    </div>
    <div class="pc-stats">
      <div class="pcs" style="flex:1"><div class="pcs-n" style="color:var(--amber);font-size:1.1rem">&#9679;</div><div class="pcs-l">Registered</div></div>
    </div>
  </div>`).join('');
        }

        function renderCareerStats(filteredList = null) {
            const el = document.getElementById('career-roster');
            if (!el) return;
            const listToRender = filteredList || CAREER_STATS;
            if (listToRender.length === 0) {
                el.innerHTML = `
                  <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--muted); font-style: italic;">
                    No career stats found matching your search.
                  </div>`;
                return;
            }
            el.innerHTML = listToRender.map(p => {
                const runs = p.batting.runs !== undefined ? p.batting.runs : 0;
                const hs = p.batting.hs || '-';
                const wkts = p.bowling.wickets !== undefined ? p.bowling.wickets : 0;
                const best = p.bowling.bestFig || '-';
                
                return `<div class="pc">
                    <div class="pc-top">
                        <div class="pc-jersey">${p.jersey}</div>
                        <div class="pc-cap">${p.cap}</div>
                        <img src="player-avatar.svg" class="pc-icon" alt="Player">
                    </div>
                    <div class="pc-body">
                        <div class="pc-name">${p.name}</div>
                        <div class="pc-meta">Jersey ${p.jersey} · Cap ${p.cap}</div>
                    </div>
                    <div class="pc-stats">
                        <div class="pcs">
                            <div class="pcs-n">${Math.max(p.batting.matches || 0, p.bowling.matches || 0)}</div>
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
            const query = document.getElementById('careerSearchInput').value.toLowerCase().trim();
            if (!query) {
                renderCareerStats(CAREER_STATS);
                return;
            }
            const filtered = CAREER_STATS.filter(p => p.name.toLowerCase().includes(query));
            renderCareerStats(filtered);
        }

        // Initialize on DOM load
        document.addEventListener('DOMContentLoaded', () => { 
            if (window.location.hash) { 
                const t = window.location.hash.substring(1); 
                const b = document.querySelector(".team-tab[onclick*='" + t + "']"); 
                if (b) switchTeam(t, b); 
                else switchTeam(t); 
            } 
            initData(); 
        });

        /* ─── VIEW ALL ───────────────────────────────────── */
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

        /* ─── TEAM SWITCH ────────────────────────────────── */
        function switchTeam(team, btn) { if (window.history.replaceState) { window.history.replaceState(null, null, '#' + team); } else { window.location.hash = team; }
            if (btn) {
                document.querySelectorAll('.team-tab').forEach(t => t.classList.remove('active'));
                btn.classList.add('active');
            }
            document.querySelectorAll('.team-panel').forEach(p => p.classList.remove('active'));
            document.getElementById('panel-' + team).classList.add('active');
        }
    