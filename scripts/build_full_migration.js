const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const dataDir = path.join(rootDir, 'data');
const archiveDir = path.join(dataDir, 'archive');
const outSqlPath = path.join(rootDir, 'database', 'seed_all_historical_data.sql');

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return "'" + String(str).replace(/'/g, "''").replace(/\\/g, '\\\\') + "'";
}

let sql = `-- ==============================================================================
-- ARCHES CRICKET CLUB — COMPLETE HISTORICAL & CURRENT DATABASE MIGRATION
-- Includes:
--   1. All 38 Players & Roster
--   2. All Matches segregated by Season (2025 Archive vs 2026 Live) across all 5 leagues
--   3. All 71 Honours Board & Milestone Records (Centuries, 50s, 5-Wickets, Hat-tricks)
--   4. All 2025, 2026 & All-Time Career Player Stats
-- ==============================================================================

-- 1. EXTENSIONS & SCHEMA ADJUSTMENTS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ensure matches table has season and is_archived fields
ALTER TABLE public.matches 
  ADD COLUMN IF NOT EXISTS season TEXT NOT NULL DEFAULT '2026',
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS scorecard_url TEXT;

-- Ensure honours table has milestone fields
ALTER TABLE public.honours 
  ADD COLUMN IF NOT EXISTS record TEXT,
  ADD COLUMN IF NOT EXISTS opponent TEXT,
  ADD COLUMN IF NOT EXISTS league TEXT,
  ADD COLUMN IF NOT EXISTS match_date TEXT,
  ADD COLUMN IF NOT EXISTS type TEXT;

-- Drop old unique constraints if needed to allow season segregation
ALTER TABLE public.matches DROP CONSTRAINT IF EXISTS unique_match;
ALTER TABLE public.matches ADD CONSTRAINT unique_match UNIQUE (season, date_display, home_team, away_team);

ALTER TABLE public.honours DROP CONSTRAINT IF EXISTS unique_honour;
ALTER TABLE public.honours ADD CONSTRAINT unique_honour UNIQUE (season, category, recipient_name, record, match_date);

-- Clean reset: clears any partial runs so everything imports 100% fresh
TRUNCATE public.player_stats, public.matches, public.honours, public.players CASCADE;

-- ==============================================================================
-- 2. PLAYERS (38 Members)
-- ==============================================================================
`;

// 1. Players from roster.json
const roster = JSON.parse(fs.readFileSync(path.join(dataDir, 'roster.json'), 'utf8'));
for (const p of roster) {
  const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const cap = p.cap || slug.substring(0, 4).toUpperCase();
  const jersey = p.jersey || null;
  sql += `INSERT INTO public.players (name, slug, jersey, cap, role) VALUES (${escapeSql(p.name)}, ${escapeSql(slug)}, ${escapeSql(jersey)}, ${escapeSql(cap)}, 'All-Rounder') ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;\n`;
}

// 2. Matches segregated by Season: 2026 (Live) and 2025 (Archive)
sql += `\n-- ==============================================================================
-- 3. MATCHES (2026 Live Season & 2025 Archived Season)
-- ==============================================================================
`;

// Read 2026 matches
const matches2026 = JSON.parse(fs.readFileSync(path.join(dataDir, 'matches_2026.json'), 'utf8'));
const list2026 = [...(matches2026.fixtures || []), ...(matches2026.results || [])];
sql += `-- A. 2026 SEASON MATCHES (${list2026.length} matches - Live Season)\n`;

for (const m of list2026) {
  const dateDisplay = (m.date || 'TBD').replace(/\n/g, ' ').trim();
  const home = (m.homeTeam || 'TBC').trim();
  const away = (m.awayTeam || 'TBC').trim();
  const league = m.league || 'Senior League 3';
  const team = (home.includes('2nd') || away.includes('2nd')) ? 'Arches 2nd XI' : (home.includes('MW') || away.includes('MW')) ? 'Arches Midweek XI' : 'Arches 1st XI';
  const venue = m.venue || 'TBC';
  const status = m.result ? 'completed' : 'scheduled';
  const result = m.result || null;
  const scorecardUrl = m.scorecardUrl || null;

  let winner = null;
  if (result) {
    if (result.includes('Arches')) winner = 'Arches';
    else if (result.includes('won')) winner = 'Opponent';
    else if (result.includes('tied') || result.includes('drawn')) winner = 'Draw';
    else winner = 'No Result';
  }

  sql += `INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner, scorecard_url)
VALUES ('2026', false, ${escapeSql(dateDisplay)}, ${escapeSql(league)}, ${escapeSql(team)}, ${escapeSql(home)}, ${escapeSql(away)}, ${escapeSql(venue)}, ${escapeSql(status)}, ${escapeSql(result)}, ${escapeSql(winner)}, ${escapeSql(scorecardUrl)})
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner, scorecard_url = EXCLUDED.scorecard_url;\n`;
}

// Read 2025 archived matches
const matches2025 = JSON.parse(fs.readFileSync(path.join(archiveDir, 'matches_2025.json'), 'utf8'));
const list2025 = [...(matches2025.fixtures || []), ...(matches2025.results || [])];
sql += `\n-- B. 2025 SEASON MATCHES (${list2025.length} matches - Archived Season)\n`;

for (const m of list2025) {
  const dateDisplay = (m.date || 'TBD').replace(/\n/g, ' ').trim();
  const home = (m.homeTeam || 'TBC').trim();
  const away = (m.awayTeam || 'TBC').trim();
  const league = m.league || 'Senior League 3';
  const team = (home.includes('2nd') || away.includes('2nd')) ? 'Arches 2nd XI' : (home.includes('MW') || away.includes('MW')) ? 'Arches Midweek XI' : 'Arches 1st XI';
  const venue = m.venue || 'TBC';
  const status = m.result ? 'completed' : 'scheduled';
  const result = m.result || null;

  let winner = null;
  if (result) {
    if (result.includes('Arches')) winner = 'Arches';
    else if (result.includes('won')) winner = 'Opponent';
    else if (result.includes('tied') || result.includes('drawn')) winner = 'Draw';
    else winner = 'No Result';
  }

  sql += `INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, ${escapeSql(dateDisplay)}, ${escapeSql(league)}, ${escapeSql(team)}, ${escapeSql(home)}, ${escapeSql(away)}, ${escapeSql(venue)}, ${escapeSql(status)}, ${escapeSql(result)}, ${escapeSql(winner)})
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;\n`;
}

// 3. Honours Board (71 milestone records)
sql += `\n-- ==============================================================================
-- 4. HONOURS BOARD & CLUB MILESTONES (71 records: Centuries, 50s, 5-Wickets, Hat-tricks)
-- ==============================================================================
`;

const honours = JSON.parse(fs.readFileSync(path.join(dataDir, 'honours.json'), 'utf8'));
for (const h of honours) {
  const season = h.season || '2026';
  const category = h.category || 'milestone';
  const name = h.name || 'Member';
  const record = h.record || '';
  const dateStr = h.date || '';
  const opp = h.opponent || '';
  const league = h.league || '';
  const type = h.type || 'batting';
  const awardName = category.replace(/-/g, ' ').toUpperCase();

  sql += `INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES (${escapeSql(season)}, ${escapeSql(awardName)}, ${escapeSql(category)}, ${escapeSql(name)}, ${escapeSql(record)}, ${escapeSql(opp)}, ${escapeSql(league)}, ${escapeSql(dateStr)}, ${escapeSql(type)}, ${escapeSql(record + ' vs ' + opp)}) ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;\n`;
}

// 4. Player Statistics (2025, 2026, Career)
sql += `\n-- ==============================================================================
-- 5. PLAYER STATISTICS (2025, 2026, and All-Time Career Stats)
-- ==============================================================================
`;

const career = JSON.parse(fs.readFileSync(path.join(dataDir, 'career_stats.json'), 'utf8'));

for (const seasonKey of ['2025', '2026', 'all']) {
  const seasonLabel = seasonKey === 'all' ? 'Career' : seasonKey;
  const list = career[seasonKey] || [];
  sql += `\n-- Stats for ${seasonLabel} (${list.length} players)\n`;
  for (const s of list) {
    const slug = s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const batRuns = s.batting ? s.batting.runs || 0 : 0;
    const hs = s.batting ? String(s.batting.hs || '0') : '0';
    const batMatches = s.batting ? s.batting.matches || 0 : 0;
    const bowlWkts = s.bowling ? s.bowling.wickets || 0 : 0;
    const bestFig = s.bowling ? String(s.bowling.bestFig || '0/0') : '0/0';
    const bowlMatches = s.bowling ? s.bowling.matches || 0 : 0;
    const matchesPlayed = Math.max(batMatches, bowlMatches);

    sql += `INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, ${escapeSql(seasonLabel)}, ${matchesPlayed}, ${batRuns}, ${escapeSql(hs)}, ${bowlWkts}, ${escapeSql(bestFig)}
FROM public.players WHERE slug = ${escapeSql(slug)}
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;\n`;
  }
}

fs.writeFileSync(outSqlPath, sql, 'utf8');
console.log(`Generated full clean-reset migration SQL: ${outSqlPath}`);
