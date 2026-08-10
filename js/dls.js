
        /* ─────────────────────────────
           MOBILE NAV
        ───────────────────────────── */
        function toggleMobileNav() {
            const nav = document.getElementById('mobileNav');
            const hamburger = document.getElementById('hamburger');
            nav.classList.toggle('open');
            hamburger.classList.toggle('open');
            document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
        }

        /* Close mobile nav on outside click */
        document.addEventListener('click', (e) => {
            const nav = document.getElementById('mobileNav');
            const hamburger = document.getElementById('hamburger');
            if (nav.classList.contains('open') && !nav.contains(e.target) && !hamburger.contains(e.target)) {
                nav.classList.remove('open');
                hamburger.classList.remove('open');
                document.body.style.overflow = '';
            }
        });

        /* ─────────────────────────────
           STICKY NAV
        ───────────────────────────── */
        window.addEventListener('scroll', () => {
            document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50);
        }, { passive: true });

        /* ─────────────────────────────
           LOGO MOUSE PARALLAX
        ───────────────────────────── */
        const heroLogo = document.getElementById('heroLogo');
        if (heroLogo && window.matchMedia('(hover:hover)').matches) {
            document.addEventListener('mousemove', (e) => {
                const rx = ((e.clientY / window.innerHeight) - 0.5) * 18;
                const ry = ((e.clientX / window.innerWidth) - 0.5) * 18;
                heroLogo.style.transform = `translateY(var(--ty, 0px)) rotate3d(${-rx},${ry},0,1deg)`;
            }, { passive: true });
        }

        /* ─────────────────────────────
           GSAP HERO ANIMATIONS
        ───────────────────────────── */
        if (typeof gsap !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);

            gsap.from('.hero-eyebrow', { opacity: 0, y: 30, duration: 0.8, delay: 0.3 });
            gsap.from('.hero-title .line1', { opacity: 0, y: 70, duration: 1, delay: 0.5 });
            gsap.from('.hero-title .line2', { opacity: 0, y: 70, duration: 1, delay: 0.7 });
            gsap.from('.hero-tagline', { opacity: 0, y: 30, duration: 0.8, delay: 0.9 });
            gsap.from('.hero-buttons', { opacity: 0, y: 30, duration: 0.8, delay: 1.1 });
            gsap.from('.hero-stats > div', { opacity: 0, y: 20, duration: 0.6, delay: 1.3, stagger: 0.15 });
            gsap.from('.logo-hero-wrap', { opacity: 0, scale: 0.8, duration: 1.2, delay: 0.6, ease: 'back.out(1.3)' });
            gsap.from('.hero-floating-card', { opacity: 0, scale: 0.7, duration: 1, delay: 1.4, stagger: 0.25, ease: 'back.out(1.7)' });
        }

        /* ─────────────────────────────
           HERO HERO-STAT COUNTER (fast on load)
        ───────────────────────────── */
        function animateCount(el, target, duration) {
            let start = 0;
            const step = target / (duration / 16);
            const timer = setInterval(() => {
                start = Math.min(start + step, target);
                el.textContent = Math.floor(start);
                if (start >= target) clearInterval(timer);
            }, 16);
        }

        /* ─────────────────────────────
           SCROLL REVEAL
        ───────────────────────────── */
        const revealObs = new IntersectionObserver((entries) => {
            entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
        }, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });
        document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

        /* ─────────────────────────────
           SECTION STAT COUNTERS
        ───────────────────────────── */
        const countObs = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (!e.isIntersecting) return;
                countObs.unobserve(e.target);
                const target = parseInt(e.target.dataset.target) || 0;
                animateCount(e.target, target, 1500);
            });
        }, { threshold: 0.5 });

        /* ─────────────────────────────
           DYNAMIC CLUB DATA FETCH & INJECT
        ───────────────────────────── */
        function findPlayerData(name, roleBadge, allStats) {
            const cleanName = name.toLowerCase().replace(/[^a-z0-9\s]/g, '');
            const nameTokens = cleanName.split(/\s+/).filter(t => t.length > 1);
            
            let targetSuffix = '-bat';
            if (roleBadge.toLowerCase().includes('bowler')) {
                targetSuffix = '-bowl';
            } else if (roleBadge.toLowerCase().includes('all-rounder')) {
                targetSuffix = '-ar';
            }

            let bestMatch = null;
            let bestScore = 0;

            for (const category in allStats) {
                if (category.endsWith(targetSuffix)) {
                    for (const p of allStats[category]) {
                        const cleanPName = p.name.toLowerCase().replace(/[^a-z0-9\s]/g, '');
                        const pTokens = cleanPName.split(/\s+/).filter(t => t.length > 1);
                        
                        let matchCount = 0;
                        for (const token of nameTokens) {
                            if (pTokens.includes(token)) {
                                matchCount++;
                            }
                        }
                        const score = matchCount / Math.max(nameTokens.length, 1);
                        if (score > bestScore) {
                            bestScore = score;
                            bestMatch = p;
                        }
                    }
                }
            }

            if (bestScore >= 0.4) {
                return bestMatch;
            }

            // Fallback: search in all categories
            for (const category in allStats) {
                for (const p of allStats[category]) {
                    const cleanPName = p.name.toLowerCase().replace(/[^a-z0-9\s]/g, '');
                    const pTokens = cleanPName.split(/\s+/).filter(t => t.length > 1);
                    
                    let matchCount = 0;
                    for (const token of nameTokens) {
                        if (pTokens.includes(token)) {
                            matchCount++;
                        }
                    }
                    const score = matchCount / Math.max(nameTokens.length, 1);
                    if (score > bestScore) {
                        bestScore = score;
                        bestMatch = p;
                    }
                }
            }

            if (bestScore >= 0.4) {
                return bestMatch;
            }
            return null;
        }

        const months = { 'JAN': 0, 'JANUARY': 0, 'FEB': 1, 'FEBRUARY': 1, 'MAR': 2, 'MARCH': 2, 'APR': 3, 'APRIL': 3, 'MAY': 4, 'JUN': 5, 'JUNE': 5, 'JUL': 6, 'JULY': 6, 'AUG': 7, 'AUGUST': 7, 'SEP': 8, 'SEPTEMBER': 8, 'OCT': 9, 'OCTOBER': 9, 'NOV': 10, 'NOVEMBER': 10, 'DEC': 11, 'DECEMBER': 11 };
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

        function renderMatchCards(list, containerId, startIdx = 0) {
            const grid = document.getElementById(containerId);
            if (!grid) return;
            if (list.length === 0) {
                grid.innerHTML = `<div class="glass-card" style="grid-column:1/-1;padding:2rem;text-align:center;color:var(--muted);">No upcoming matches scheduled</div>`;
                return;
            }
            grid.innerHTML = list.map((m, idx) => {
                const isHome = m.homeTeam.toLowerCase().includes('arches');
                const dateClean = (m.date || '').replace(/\n/g, ' ');
                const timeClean = (m.time || '').replace(/\n/g, ' ');
                const dateText = timeClean ? `${dateClean} · ${timeClean}` : dateClean;
                return `
                    <div class="match-card reveal reveal-delay-${((startIdx + idx) % 3) + 1} visible">
                        <div class="match-meta">
                            <span class="match-format">${m.league}</span>
                            <span class="match-date-text">${dateText}</span>
                        </div>
                        <div class="match-teams">
                            <div class="match-team">
                                <div class="match-team-logo">${isHome ? '🏏' : '⚔️'}</div>
                                <div class="match-team-name">${m.homeTeam}</div>
                                <div class="match-team-sub">Home</div>
                            </div>
                            <div class="match-vs">VS</div>
                            <div class="match-team">
                                <div class="match-team-logo">${!isHome ? '🏏' : '⚔️'}</div>
                                <div class="match-team-name">${m.awayTeam}</div>
                                <div class="match-team-sub">Away</div>
                            </div>
                        </div>
                        <div class="match-info">
                            <div class="match-info-item">
                                <div class="match-info-label">Venue</div>
                                <div class="match-info-value">${m.venue || 'TBD'}</div>
                            </div>
                            <div class="match-info-item">
                                <div class="match-info-label">Competition</div>
                                <div class="match-info-value">${m.league}</div>
                            </div>
                            <div class="match-info-item">
                                <div class="match-info-label">Status</div>
                                <div class="match-info-value" style="color:var(--amber);">${m.status || 'Scheduled'}</div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        async function initDynamicData() {
            try {
                const [matchesRes, rosterRes, playersRes] = await Promise.all([
                    fetch(`data/matches.json?v=${new Date().getTime()}`).then(r => r.json()).catch(() => ({ fixtures: [], results: [] })),
                    fetch(`data/roster.json?v=${new Date().getTime()}`).then(r => r.json()).catch(() => []),
                    fetch(`data/players.json?v=${new Date().getTime()}`).then(r => r.json()).catch(() => ({}))
                ]);

                // 1. Calculate Metrics
                const fixtures = matchesRes.fixtures || [];
                const results = matchesRes.results || [];
                const squadSize = rosterRes.length || 33;
                
                // Filter matches involving Arches
                const archesResults = results.filter(r => {
                    const homeLower = (r.homeTeam || '').toLowerCase();
                    const awayLower = (r.awayTeam || '').toLowerCase();
                    return homeLower.includes('arches') || awayLower.includes('arches');
                });
                const matchesPlayed = archesResults.length;
                
                // Count victories
                const victories = archesResults.filter(r => {
                    const resLower = (r.result || '').toLowerCase();
                    const noResultKeywords = ['postponed', 'abandoned', 'no result', 'cancelled', 'tbd', 'to be decided', 'postponement', 'match postponed', 'unplayed'];
                    const isNoResult = noResultKeywords.some(k => resLower.includes(k));
                    if (isNoResult) return false;
                    
                    if (resLower.includes('beat')) {
                        const winnerPart = resLower.split('beat')[0];
                        return winnerPart.includes('arches');
                    } else if (resLower.includes('won')) {
                        const winnerPart = resLower.split('won')[0];
                        return winnerPart.includes('arches');
                    } else if (resLower.includes('walkover')) {
                        return resLower.includes('arches') && (resLower.includes('to arches') || resLower.includes('won by'));
                    }
                    return false;
                }).length;
                
                const winRate = matchesPlayed > 0 ? Math.round((victories / matchesPlayed) * 100) : 52;

                // Update targets/DOM for stats
                const matchesPlayedEl = document.getElementById('hero-stat-matches');
                if (matchesPlayedEl) matchesPlayedEl.dataset.target = matchesPlayed;
                
                const victoriesEl = document.getElementById('hero-stat-victories');
                if (victoriesEl) victoriesEl.dataset.target = victories;
                
                const squadEl = document.getElementById('hero-stat-squad');
                if (squadEl) squadEl.dataset.target = squadSize;

                const statsMatchesEl = document.getElementById('stats-matches');
                if (statsMatchesEl) statsMatchesEl.dataset.target = matchesPlayed;

                const statsVictoriesEl = document.getElementById('stats-victories');
                if (statsVictoriesEl) statsVictoriesEl.dataset.target = victories;

                const statsSquadEl = document.getElementById('stats-squad');
                if (statsSquadEl) statsSquadEl.dataset.target = squadSize;

                const winRateEl = document.getElementById('hero-win-rate');
                if (winRateEl) winRateEl.textContent = `${winRate}%`;

                // 2. Filter and Sort Fixtures Chronologically (Only involving Arches)
                const archesFixtures = fixtures.filter(m => {
                    const homeLower = (m.homeTeam || '').toLowerCase();
                    const awayLower = (m.awayTeam || '').toLowerCase();
                    return homeLower.includes('arches') || awayLower.includes('arches');
                });
                const sortedFixtures = sortFixtures(archesFixtures);

                // 3. Next Match Floating Card
                if (sortedFixtures.length > 0) {
                    const nextMatch = sortedFixtures[0];
                    const nextDateEl = document.getElementById('hero-next-date');
                    if (nextDateEl) nextDateEl.textContent = (nextMatch.date || '').replace(/\n/g, ' ');
                    
                    const nextTeamsEl = document.getElementById('hero-next-teams');
                    if (nextTeamsEl) {
                        nextTeamsEl.textContent = `${nextMatch.homeTeam} vs ${nextMatch.awayTeam} · ${nextMatch.league}`;
                    }
                }

                // 4. Live Ticker
                const tickerInner = document.getElementById('tickerInner');
                if (tickerInner) {
                    const tickerItems = sortedFixtures.slice(0, 6);
                    if (tickerItems.length > 0) {
                        const tickerContent = tickerItems.map(m => {
                            const dateClean = (m.date || '').replace(/\n/g, ' ');
                            return `<div class="ticker-item"><span class="ticker-sep"></span> 🏏 ${m.homeTeam} vs ${m.awayTeam} — ${dateClean} — ${m.venue || 'TBD'}</div>`;
                        }).join('');
                        tickerInner.innerHTML = tickerContent + tickerContent;
                    }
                }

                // 5. Render Separated Upcoming Matches Grids
                // A. Upcoming Home Matches (3 matches where Arches is home team)
                const homeFixtures = sortedFixtures.filter(m => (m.homeTeam || '').toLowerCase().includes('arches')).slice(0, 3);
                renderMatchCards(homeFixtures, 'upcoming-home-matches-grid', 0);

                // B. Next Overall Matches (3 matches overall)
                const allFixtures = sortedFixtures.slice(0, 3);
                renderMatchCards(allFixtures, 'upcoming-all-matches-grid', 3);

                // 5. Player Spotlights
                document.querySelectorAll('.player-card').forEach(card => {
                    const nameEl = card.querySelector('.player-name');
                    const roleBadgeEl = card.querySelector('.player-role-badge');
                    const statsEl = card.querySelector('.player-stats');
                    if (nameEl && roleBadgeEl && statsEl) {
                        const name = nameEl.textContent.trim();
                        const roleBadge = roleBadgeEl.textContent.trim();
                        const player = findPlayerData(name, roleBadge, playersRes);
                        if (player && player.stats && player.stats.length) {
                            statsEl.innerHTML = player.stats.map(s => `
                                <div class="player-stat">
                                    <div class="player-stat-num">${s.n}</div>
                                    <div class="player-stat-label">${s.l}</div>
                                </div>
                            `).join('');
                            
                            const teamEl = card.querySelector('.player-team');
                            if (teamEl && player.jersey && player.cap) {
                                const currentParts = teamEl.innerHTML.split('&bull;');
                                const teamName = currentParts[0] ? currentParts[0].trim() : 'Team';
                                teamEl.innerHTML = `${teamName} &bull; ${player.jersey} &bull; ${player.cap}`;
                            }
                        }
                    }
                });

            } catch (err) {
                console.error("Error loading dynamic club data:", err);
            }

            // Trigger counter animations
            document.querySelectorAll('.hero-stat-number').forEach(el => {
                animateCount(el, parseInt(el.dataset.target) || 0, 1200);
            });
            document.querySelectorAll('.count').forEach(el => countObs.observe(el));
        }

        document.addEventListener('DOMContentLoaded', initDynamicData);

        /* ─────────────────────────────
           GSAP SCROLL PARALLAX (desktop only)
        ───────────────────────────── */
        if (typeof ScrollTrigger !== 'undefined' && window.matchMedia('(min-width:768px)').matches) {
            gsap.to('.logo-hero-wrap', {
                scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1 },
                y: 60, opacity: 0.5,
            });
        }
    