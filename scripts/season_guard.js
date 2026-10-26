/**
 * ARCHES CRICKET CLUB - SEASON LOCK GUARD MODULE
 * 
 * Protects verified historical seasons (2025, 2026) from accidental overwrite
 * or mutation by scraping scripts, automated sync jobs, or archive tools.
 */

const fs = require('fs');
const path = require('path');

const lockFilePath = path.join(__dirname, '..', 'data', 'seasons_lock.json');

function getLockedSeasons() {
  try {
    if (fs.existsSync(lockFilePath)) {
      const lockData = JSON.parse(fs.readFileSync(lockFilePath, 'utf8'));
      return lockData.locked_seasons || ['2025', '2026'];
    }
  } catch (e) {
    console.warn('[GUARD WARNING] Failed to read seasons_lock.json, falling back to defaults:', e.message);
  }
  return ['2025', '2026'];
}

function assertSeasonUnlocked(season) {
  const locked = getLockedSeasons();
  const seasonStr = season ? season.toString().trim() : '';
  if (locked.includes(seasonStr)) {
    const errorMsg = `[OPERATION BLOCKED] Season ${seasonStr} is permanently locked. Historical seasons are immutable and cannot be modified or overwritten.`;
    console.error(`\x1b[31m${errorMsg}\x1b[0m`);
    throw new Error(errorMsg);
  }
  return true;
}

function isSeasonLocked(season) {
  const locked = getLockedSeasons();
  return locked.includes(season ? season.toString().trim() : '');
}

module.exports = {
  getLockedSeasons,
  assertSeasonUnlocked,
  isSeasonLocked
};
