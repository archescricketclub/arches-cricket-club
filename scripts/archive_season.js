/**
 * ARCHES CRICKET CLUB — END-OF-SEASON ARCHIVE AUTOMATION TOOL
 * 
 * Usage:
 *   node scripts/archive_season.js <season_year>
 * Example:
 *   node scripts/archive_season.js 2026
 * 
 * What it does:
 * 1. Takes all completed matches from data/matches.json and archives them into data/archive/matches_<year>.json.
 * 2. Archives player seasonal statistics into data/archive/players_<year>.json.
 * 3. Prepares a fresh data/matches.json ready for the upcoming season.
 * 4. Outputs Supabase SQL to update cloud database archive flags.
 */

const fs = require('fs');
const path = require('path');

const seasonYear = process.argv[2] || new Date().getFullYear().toString();
const rootDir = path.resolve(__dirname, '..');
const dataDir = path.join(rootDir, 'data');
const archiveDir = path.join(dataDir, 'archive');

if (!fs.existsSync(archiveDir)) {
  fs.mkdirSync(archiveDir, { recursive: true });
}

const { isSeasonLocked } = require('./season_guard');

if (isSeasonLocked(seasonYear)) {
  console.log(`\x1b[33m[LOCKED] Season ${seasonYear} is permanently locked in data/seasons_lock.json. No modifications permitted.\x1b[0m`);
  process.exit(0);
}

console.log(`Starting season archiving process for Season ${seasonYear}...`);

// 1. Archive Matches
const currentMatchesPath = path.join(dataDir, 'matches.json');
const archiveMatchesPath = path.join(archiveDir, `matches_${seasonYear}.json`);

if (fs.existsSync(currentMatchesPath)) {
  const currentMatches = JSON.parse(fs.readFileSync(currentMatchesPath, 'utf8'));
  currentMatches.season = seasonYear;
  currentMatches.isArchived = true;
  currentMatches.archivedAt = new Date().toISOString();

  fs.writeFileSync(archiveMatchesPath, JSON.stringify(currentMatches, null, 2), 'utf8');
  console.log(`- Saved ${currentMatches.results ? currentMatches.results.length : 0} results to archive: ${archiveMatchesPath}`);

  // Create new blank season template for next year
  const nextYear = (parseInt(seasonYear, 10) + 1).toString();
  const nextSeasonTemplate = {
    season: nextYear,
    isArchived: false,
    fixtures: [],
    results: []
  };
  fs.writeFileSync(currentMatchesPath, JSON.stringify(nextSeasonTemplate, null, 2), 'utf8');
  console.log(`- Reset data/matches.json ready for Season ${nextYear}`);
}

// 2. Archive Players Stats
const currentPlayersPath = path.join(dataDir, `players_${seasonYear}.json`);
const archivePlayersPath = path.join(archiveDir, `players_${seasonYear}.json`);

if (fs.existsSync(currentPlayersPath)) {
  fs.copyFileSync(currentPlayersPath, archivePlayersPath);
  console.log(`- Archived player seasonal stats to: ${archivePlayersPath}`);
}

console.log(`\nSeason ${seasonYear} successfully archived into data/archive/ folder!`);
console.log(`To mark matches as archived in Supabase, run this in SQL Editor:`);
console.log(`UPDATE public.matches SET is_archived = true WHERE season = '${seasonYear}';`);
