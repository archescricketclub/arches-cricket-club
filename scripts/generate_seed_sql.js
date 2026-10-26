const fs = require('fs');
const path = require('path');

const dataDir = path.resolve(__dirname, '..', 'data');
const outSqlPath = path.resolve(__dirname, '..', 'database', 'seed_data.sql');

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return "'" + String(str).replace(/'/g, "''").replace(/\\/g, '\\\\') + "'";
}

let sql = `-- ==============================================================================
-- ARCHES CRICKET CLUB — INITIAL DATABASE SEED SCRIPT
-- Populated automatically from existing repository JSON files
-- ==============================================================================

`;

// 1. Seed Players from roster.json
const rosterPath = path.join(dataDir, 'roster.json');
if (fs.existsSync(rosterPath)) {
  const roster = JSON.parse(fs.readFileSync(rosterPath, 'utf8'));
  sql += `-- 1. SEED PLAYERS (${roster.length} members)\n`;
  for (const p of roster) {
    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const cap = p.cap || slug.substring(0, 4).toUpperCase();
    const jersey = p.jersey || null;
    sql += `INSERT INTO public.players (name, slug, jersey, cap, role)
VALUES (${escapeSql(p.name)}, ${escapeSql(slug)}, ${escapeSql(jersey)}, ${escapeSql(cap)}, 'All-Rounder')
ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;\n`;
  }
  sql += '\n';
}

// 2. Seed Matches from matches.json
const matchesPath = path.join(dataDir, 'matches.json');
if (fs.existsSync(matchesPath)) {
  const matchesData = JSON.parse(fs.readFileSync(matchesPath, 'utf8'));
  const allMatches = [...(matchesData.fixtures || []), ...(matchesData.results || [])];
  sql += `-- 2. SEED MATCHES (${allMatches.length} matches)\n`;
  for (const m of allMatches) {
    const isCompleted = !!m.result;
    const status = isCompleted ? 'completed' : 'scheduled';
    const league = m.league || 'Senior League 3';
    const team = m.homeTeam && m.homeTeam.includes('2nd') ? 'Arches 2nd XI' : 'Arches 1st XI';
    const venue = m.venue || 'TBC';
    const dateDisplay = (m.date || 'TBD').replace(/\n/g, ' ');

    let winner = null;
    if (m.result) {
      if (m.result.includes('Arches')) winner = 'Arches';
      else if (m.result.includes('won')) winner = 'Opponent';
      else if (m.result.includes('tied') || m.result.includes('drawn')) winner = 'Draw';
      else winner = 'No Result';
    }

    sql += `INSERT INTO public.matches (date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES (${escapeSql(dateDisplay)}, ${escapeSql(league)}, ${escapeSql(team)}, ${escapeSql(m.homeTeam)}, ${escapeSql(m.awayTeam)}, ${escapeSql(venue)}, ${escapeSql(status)}, ${escapeSql(m.result || null)}, ${escapeSql(winner)})
ON CONFLICT (date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;\n`;
  }
  sql += '\n';
}

// 3. Seed Honours from honours.json
const honoursPath = path.join(dataDir, 'honours.json');
if (fs.existsSync(honoursPath)) {
  const honoursData = JSON.parse(fs.readFileSync(honoursPath, 'utf8'));
  sql += `-- 3. SEED HONOURS BOARD\n`;
  // honoursData can be an object with seasons or an array
  if (Array.isArray(honoursData)) {
    for (const h of honoursData) {
      sql += `INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES (${escapeSql(h.season || '2025')}, ${escapeSql(h.award || h.award_name)}, ${escapeSql(h.category || 'Club')}, ${escapeSql(h.recipient || h.recipient_name)}, ${escapeSql(h.stats || null)})
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;\n`;
    }
  } else if (typeof honoursData === 'object') {
    for (const [season, awards] of Object.entries(honoursData)) {
      if (Array.isArray(awards)) {
        for (const a of awards) {
          sql += `INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES (${escapeSql(season)}, ${escapeSql(a.award || a.title || 'Award')}, 'Club', ${escapeSql(a.recipient || a.player || 'Arches CC Member')}, ${escapeSql(a.stats || null)})
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;\n`;
        }
      }
    }
  }
  sql += '\n';
}

fs.writeFileSync(outSqlPath, sql, 'utf8');
console.log(`Seeding SQL generated successfully at: ${outSqlPath}`);
