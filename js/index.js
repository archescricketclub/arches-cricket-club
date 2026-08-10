document.addEventListener('DOMContentLoaded', () => {
    // Reveal Observer for scroll animations
    const revealObs = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

    // Stats Counter Animation
    const countObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            countObs.unobserve(e.target);
            const target = parseInt(e.target.dataset.target) || 0;
            animateCount(e.target, target, 1500);
        });
    }, { threshold: 0.5 });
    document.querySelectorAll('.count, .hero-stat-number').forEach(el => countObs.observe(el));

    function animateCount(el, target, duration) {
        let start = 0;
        const inc = target / (duration / 16);
        const timer = setInterval(() => {
            start += inc;
            if (start >= target) {
                el.textContent = target;
                clearInterval(timer);
            } else {
                el.textContent = Math.floor(start);
            }
        }, 16);
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

    function sortFixturesAsc(list) {
        return list.sort((a, b) => {
            const dA = parseMatchDate(a.date);
            const dB = parseMatchDate(b.date);
            if (!dA && !dB) return 0;
            if (!dA) return 1;
            if (!dB) return -1;
            return dA - dB;
        });
    }
    
    function sortFixturesDesc(list) {
        return list.sort((a, b) => {
            const dA = parseMatchDate(a.date);
            const dB = parseMatchDate(b.date);
            if (!dA && !dB) return 0;
            if (!dA) return 1;
            if (!dB) return -1;
            return dB - dA;
        });
    }

    function renderMatchCards(list, containerId, startIdx = 0) {
        const grid = document.getElementById(containerId);
        if (!grid) return;
        if (list.length === 0) {
            grid.innerHTML = `<div class="glass-card" style="grid-column:1/-1;padding:2rem;text-align:center;color:var(--muted);">No matches found</div>`;
            return;
        }
        grid.innerHTML = list.map((m, idx) => {
            const isHome = m.homeTeam.toLowerCase().includes('arches');
            const safeDate = escapeHTML((m.date || '').replace(/\n/g, ' '));
            const safeTime = escapeHTML((m.time || '').replace(/\n/g, ' '));
            const dateText = safeTime ? `${safeDate} · ${safeTime}` : safeDate;
            const safeHome = escapeHTML(m.homeTeam);
            const safeAway = escapeHTML(m.awayTeam);
            const safeVenue = escapeHTML(m.venue);
            
            // Show result if available
            let resultHtml = '';
            if (m.result && !m.result.toLowerCase().includes('tbd')) {
                 resultHtml = `<div style="font-size: 0.8rem; color: var(--gold); margin-top: 0.5rem; text-align: center;">${escapeHTML(m.result)}</div>`;
            }
            
            return `
                <div class="match-card reveal reveal-delay-${((startIdx + idx) % 3) + 1} visible">
                    <div class="match-meta">
                        <span class="match-format">${escapeHTML(m.league)}</span>
                        <span class="match-date-text">${dateText}</span>
                    </div>
                    <div class="match-teams">
                        <div class="match-team">
                            <div class="match-team-logo">${isHome ? '🏏' : '⚔️'}</div>
                            <div class="match-team-name ${isHome ? 'highlight' : ''}">${safeHome}</div>
                        </div>
                        <div class="match-vs">VS</div>
                        <div class="match-team">
                            <div class="match-team-logo">${!isHome ? '🏏' : '⚔️'}</div>
                            <div class="match-team-name ${!isHome ? 'highlight' : ''}">${safeAway}</div>
                        </div>
                    </div>
                    <div class="match-footer" style="flex-direction: column;">
                        <div class="match-venue"><i class="fa-solid fa-location-dot"></i> ${safeVenue}</div>
                        ${resultHtml}
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderTicker(matches) {
        const ticker = document.getElementById('dynamic-ticker');
        if (!ticker) return;
        
        let tickerHtml = '';
        matches.forEach(m => {
            const safeDate = escapeHTML((m.date || '').replace(/\n/g, ' '));
            const safeHome = escapeHTML(m.homeTeam);
            const safeAway = escapeHTML(m.awayTeam);
            const safeVenue = escapeHTML(m.venue);
            let icon = safeHome.toLowerCase().includes('arches') ? '🏏' : '⚔️';
            tickerHtml += `<div class="ticker-item"><span class="ticker-sep"></span> ${icon} ${safeHome} vs ${safeAway} — ${safeDate} — ${safeVenue}</div>\n`;
        });
        
        // Duplicate the content so the scrolling CSS works seamlessly
        ticker.innerHTML = tickerHtml + tickerHtml;
    }

    function showError(containerIds, message) {
        containerIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.innerHTML = `
                    <div style="grid-column:1/-1;">
                        <div class="error-state" style="padding: 2rem;">
                            <i class="fa-solid fa-triangle-exclamation" style="color:#ff4444; font-size:2rem; margin-bottom:0.5rem;"></i>
                            <div>${message}</div>
                        </div>
                    </div>
                `;
            }
        });
    }

    // Fetch Matches Data
    fetch(`data/matches.json?v=${new Date().getTime()}`)
        .then(res => {
            if (!res.ok) throw new Error('Network response was not ok');
            return res.json();
        })
        .then(data => {
            let rawFixtures = data.fixtures || [];
            let rawResults = data.results || [];
            
            const now = new Date();
            now.setHours(0,0,0,0);
            
            // Separate all known matches into Past and Future based on date
            // Note: rawResults are inherently past, rawFixtures might be past or future
            let allMatches = [...rawFixtures, ...rawResults];
            
            // Remove exact duplicates by comparing teams and date
            const uniqueMap = new Map();
            allMatches.forEach(m => {
                const key = `${m.date}-${m.homeTeam}-${m.awayTeam}`;
                if (!uniqueMap.has(key)) {
                    uniqueMap.set(key, m);
                } else if (m.result && !uniqueMap.get(key).result) {
                    // Prefer the one with a result
                    uniqueMap.set(key, m);
                }
            });
            allMatches = Array.from(uniqueMap.values());
            
            const futureMatches = sortFixturesAsc(allMatches.filter(m => {
                const matchDate = parseMatchDate(m.date);
                return matchDate && matchDate >= now;
            }));
            
            const pastMatches = sortFixturesDesc(allMatches.filter(m => {
                const matchDate = parseMatchDate(m.date);
                return !matchDate || matchDate < now;
            }));

            // --- 1. HERO "NEXT MATCH" LOGIC ---
            if (futureMatches.length > 0) {
                const nextMatch = futureMatches[0];
                const safeDate = escapeHTML((nextMatch.date || '').replace(/\n/g, ' '));
                document.getElementById('hero-next-date').textContent = safeDate;
                const safeHome = escapeHTML(nextMatch.homeTeam);
                const safeAway = escapeHTML(nextMatch.awayTeam);
                const safeFormat = escapeHTML(nextMatch.league || 'T20');
                document.getElementById('hero-next-teams').textContent = `${safeHome} vs ${safeAway} · ${safeFormat}`;
            } else if (pastMatches.length > 0) {
                // Fallback to Latest Result
                const hLabel = document.getElementById('hero-next-heading');
                if (hLabel) hLabel.textContent = "Latest Result";
                
                const latestMatch = pastMatches[0];
                const safeDate = escapeHTML((latestMatch.date || '').replace(/\n/g, ' '));
                document.getElementById('hero-next-date').textContent = safeDate;
                const safeHome = escapeHTML(latestMatch.homeTeam);
                const safeAway = escapeHTML(latestMatch.awayTeam);
                const safeFormat = escapeHTML(latestMatch.league || 'T20');
                document.getElementById('hero-next-teams').textContent = `${safeHome} vs ${safeAway} · ${safeFormat}`;
            } else {
                document.getElementById('hero-next-date').textContent = "Season Completed";
                document.getElementById('hero-next-teams').textContent = "Check back next year";
            }
            
            // --- 2. UPCOMING FIXTURES LOGIC ---
            if (futureMatches.length > 0) {
                const homeMatches = futureMatches.filter(m => m.homeTeam && m.homeTeam.toLowerCase().includes('arches')).slice(0, 3);
                const otherMatches = futureMatches.filter(m => !(m.homeTeam && m.homeTeam.toLowerCase().includes('arches'))).slice(0, 3);
                renderMatchCards(homeMatches, 'upcoming-home', 0);
                renderMatchCards(otherMatches, 'upcoming-other', 3);
            } else {
                // Fallback: Show recent results if there are no future fixtures
                const h1 = document.getElementById('home-fixtures-heading');
                if (h1) h1.textContent = "Recent Matches";
                const h2 = document.getElementById('other-fixtures-heading');
                if (h2) h2.textContent = "Earlier Matches";
                
                renderMatchCards(pastMatches.slice(0, 3), 'upcoming-home', 0);
                renderMatchCards(pastMatches.slice(3, 6), 'upcoming-other', 3);
            }
            
            // --- 3. TICKER LOGIC ---
            // Take up to 10 most recent matches/upcoming matches to form the ticker
            let tickerMatches = [];
            if (futureMatches.length >= 3) {
                tickerMatches = [...futureMatches.slice(0, 5), ...pastMatches.slice(0, 5)];
            } else {
                tickerMatches = [...futureMatches, ...pastMatches.slice(0, 10 - futureMatches.length)];
            }
            renderTicker(tickerMatches);
            
            // --- 4. STATS LOGIC ---
            let wins = 0;
            let played = 0;
            rawResults.forEach(match => {
                const resLower = (match.result || '').toLowerCase();
                const noResultKeywords = ['postponed', 'abandoned', 'no result', 'cancelled', 'tbd', 'unplayed'];
                let isNoResult = noResultKeywords.some(k => resLower.includes(k));
                
                if (!isNoResult) {
                    played++;
                    if (resLower.includes('beat arches') || resLower.includes('lost') || resLower.includes('defeat')) {
                        // Loss
                    } else if (resLower.includes('arches beat') || resLower.includes('won') || resLower.includes('walkover to arches')) {
                        wins++;
                    }
                }
            });
            
            const heroMatches = document.getElementById('hero-stat-matches');
            if (heroMatches) { heroMatches.dataset.target = played; animateCount(heroMatches, played, 1500); }
            const statsMatches = document.getElementById('stats-matches');
            if (statsMatches) { statsMatches.dataset.target = played; animateCount(statsMatches, played, 1500); }
            
            const heroVictories = document.getElementById('hero-stat-victories');
            if (heroVictories) { heroVictories.dataset.target = wins; animateCount(heroVictories, wins, 1500); }
            const statsVictories = document.getElementById('stats-victories');
            if (statsVictories) { statsVictories.dataset.target = wins; animateCount(statsVictories, wins, 1500); }
            
        })
        .catch(err => {
            console.error('Error fetching matches:', err);
            showError(['upcoming-home', 'upcoming-other'], 'Unable to load matches. Please check the Fixtures page.');
            
            const nextDate = document.getElementById('hero-next-date');
            if(nextDate) nextDate.textContent = "Unable to load";
            const nextTeams = document.getElementById('hero-next-teams');
            if(nextTeams) nextTeams.textContent = "Data unavailable";
        });
        
    // Fetch Roster Data for Squad Members stat
    fetch(`data/roster.json?v=${new Date().getTime()}`)
        .then(res => {
            if (!res.ok) throw new Error('Network response was not ok');
            return res.json();
        })
        .then(data => {
            let squadCount = 0;
            if (data.ALL_PLAYERS && Array.isArray(data.ALL_PLAYERS)) {
                squadCount = data.ALL_PLAYERS.length;
            } else {
                squadCount = Object.keys(data).length > 0 ? 30 : 0; 
            }
            
            const heroSquad = document.getElementById('hero-stat-squad');
            if (heroSquad) { heroSquad.dataset.target = squadCount; animateCount(heroSquad, squadCount, 1500); }
            const statsSquad = document.getElementById('stats-squad');
            if (statsSquad) { statsSquad.dataset.target = squadCount; animateCount(statsSquad, squadCount, 1500); }
        })
        .catch(err => {
            console.error('Error fetching roster:', err);
        });
});