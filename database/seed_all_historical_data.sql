-- ==============================================================================
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
INSERT INTO public.players (name, slug, jersey, cap, role) VALUES ('Wasim SM', 'wasim-sm', '#1', 'WSM1', 'All-Rounder') ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role) VALUES ('Anvesh Choudary Mannuru', 'anvesh-choudary-mannuru', '#2', 'AM28', 'All-Rounder') ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role) VALUES ('Srini Nadakuditi', 'srini-nadakuditi', '#3', 'SRI3', 'All-Rounder') ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role) VALUES ('Hanu K', 'hanu-k', '#4', 'HK04', 'All-Rounder') ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role) VALUES ('Madhu Yellanur', 'madhu-yellanur', '#5', 'MY05', 'All-Rounder') ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role) VALUES ('Harish C', 'harish-c', '#6', 'HC06', 'All-Rounder') ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role) VALUES ('Tulasi Gangadhar Thatavarthi', 'tulasi-gangadhar-thatavarthi', '#7', 'TT07', 'All-Rounder') ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role) VALUES ('Harsha Sai', 'harsha-sai', '#8', 'VK18', 'All-Rounder') ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role) VALUES ('Venkateswarrao Jyothi', 'venkateswarrao-jyothi', '#9', 'VJ09', 'All-Rounder') ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role) VALUES ('Vinay Tummala', 'vinay-tummala', '#10', 'VT10', 'All-Rounder') ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role) VALUES ('Kishan Karneedi', 'kishan-karneedi', '#11', 'KK11', 'All-Rounder') ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role) VALUES ('Surya Pavan Teja Tummala', 'surya-pavan-teja-tummala', '#14', 'PA14', 'All-Rounder') ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role) VALUES ('Vonga Vishnu', 'vonga-vishnu', '#15', 'VV15', 'All-Rounder') ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role) VALUES ('Ali Rizwan', 'ali-rizwan', '#16', 'AR69', 'All-Rounder') ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role) VALUES ('Vijay Varma', 'vijay-varma', '#17', 'VV17', 'All-Rounder') ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role) VALUES ('Raja Mouli Yadavalli', 'raja-mouli-yadavalli', '#18', 'RY18', 'All-Rounder') ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role) VALUES ('Asad Murtuza', 'asad-murtuza', '#22', 'AM04', 'All-Rounder') ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role) VALUES ('Dushyanth Reddy B', 'dushyanth-reddy-b', '#23', 'DB23', 'All-Rounder') ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role) VALUES ('Yonggicho Paul', 'yonggicho-paul', '#25', 'PMY25', 'All-Rounder') ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role) VALUES ('Anil Narra', 'anil-narra', '#30', 'AN30', 'All-Rounder') ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role) VALUES ('Veerendra Babu Nagari', 'veerendra-babu-nagari', '#44', 'VB44', 'All-Rounder') ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role) VALUES ('Chandra Obula Reddy B', 'chandra-obula-reddy-b', '#45', 'CH45', 'All-Rounder') ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role) VALUES ('Abhiram Donepudi', 'abhiram-donepudi', '#48', 'AB48', 'All-Rounder') ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role) VALUES ('Deepak Sai', 'deepak-sai', '#50', 'AD39', 'All-Rounder') ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role) VALUES ('Sarmad Butt', 'sarmad-butt', '#56', 'SB56', 'All-Rounder') ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role) VALUES ('Banu Chand Kandukuri', 'banu-chand-kandukuri', '#63', 'KBC63', 'All-Rounder') ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role) VALUES ('Arush Nimmagadda', 'arush-nimmagadda', '#72', 'AN72', 'All-Rounder') ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role) VALUES ('Kiran Maheswaram', 'kiran-maheswaram', '#75', 'KM75', 'All-Rounder') ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role) VALUES ('Haneef Shaik', 'haneef-shaik', '#77', 'HS77', 'All-Rounder') ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role) VALUES ('Veera SR Nimmakayala', 'veera-sr-nimmakayala', '#88', 'VN88', 'All-Rounder') ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role) VALUES ('Rohit Singh', 'rohit-singh', '#98', 'RS98', 'All-Rounder') ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role) VALUES ('Charan Reddy Datla', 'charan-reddy-datla', '#99', 'CR99', 'All-Rounder') ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role) VALUES ('Anshuman Singh Baghel', 'anshuman-singh-baghel', '#181', 'ASB18', 'All-Rounder') ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role) VALUES ('Yashwanth', 'yashwanth', '#777', 'CY777', 'All-Rounder') ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role) VALUES ('Anji Reddy', 'anji-reddy', '#999', 'AR999', 'All-Rounder') ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role) VALUES ('Harish Padmanabhuni ', 'harish-padmanabhuni', '#—', 'PH1', 'All-Rounder') ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role) VALUES ('Sri', 'sri', '#—', 'SRI', 'All-Rounder') ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role) VALUES ('Jayasurya Sukhavasi', 'jayasurya-sukhavasi', '#TBD', 'JS', 'All-Rounder') ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;

-- ==============================================================================
-- 3. MATCHES (2026 Live Season & 2025 Archived Season)
-- ==============================================================================
-- A. 2026 SEASON MATCHES (26 matches - Live Season)
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner, scorecard_url)
VALUES ('2026', false, '31 August 2026', 'Junior League 10', 'Arches 2nd XI', 'Arches 2nd XI', 'Belfast Superkings 3rd XI', 'Londonderry Park, Newtownards', 'completed', 'Arches 2nd XI won by 14 runs', 'Arches', 'https://cricketireland.nvplay.com/match/352374f9-2ac5-4f73-83f2-8052aabc3bac')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner, scorecard_url = EXCLUDED.scorecard_url;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner, scorecard_url)
VALUES ('2026', false, '23 August 2026', 'Junior League 10', 'Arches 2nd XI', 'Belfast Superkings 2nd XI', 'Arches 2nd XI', 'TBC, TBC', 'completed', 'Belfast Superkings 2nd XI won by 4 wickets', 'Opponent', 'https://cricketireland.nvplay.com/match/e33896a5-47ed-410d-9e77-3338fe016d58')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner, scorecard_url = EXCLUDED.scorecard_url;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner, scorecard_url)
VALUES ('2026', false, '22 August 2026', 'Mercury Senior League 3', 'Arches 1st XI', 'Arches 1st XI', 'Victoria 1st XI', 'TBC, TBC', 'completed', 'Victoria 1st XI won by 28 runs', 'Opponent', 'https://cricketireland.nvplay.com/match/bb3eba57-6d27-41e4-acbc-49b938d4bd2c')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner, scorecard_url = EXCLUDED.scorecard_url;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner, scorecard_url)
VALUES ('2026', false, '15 August 2026', 'Mercury Senior League 3', 'Arches 1st XI', 'Arches 1st XI', 'Amigos Belfast 1st XI', 'City of Belfast Playing Fields (Amigos Belfast), Mallusk', 'completed', 'Arches 1st XI won by 113 runs', 'Arches', 'https://cricketireland.nvplay.com/match/ad23698e-75c0-402a-b50e-3e8a758b0e60')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner, scorecard_url = EXCLUDED.scorecard_url;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner, scorecard_url)
VALUES ('2026', false, '9 August 2026', 'Junior League 10', 'Arches 2nd XI', 'Arches 2nd XI', 'Cooke Collegians 4th XI', 'TBC, TBC', 'completed', 'Arches 2nd XI won by 64 runs', 'Arches', 'https://cricketireland.nvplay.com/match/2c050b03-9b65-4c04-90ca-5cea22ef166e')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner, scorecard_url = EXCLUDED.scorecard_url;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner, scorecard_url)
VALUES ('2026', false, '8 August 2026', 'Mercury Senior League 3', 'Arches 1st XI', 'Dundrum 1st XI', 'Arches 1st XI', 'The Meadow, Dundrum', 'completed', 'Dundrum 1st XI won by 80 runs', 'Opponent', 'https://cricketireland.nvplay.com/match/a48b20db-a334-44bd-8c4d-c5d96743a69a')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner, scorecard_url = EXCLUDED.scorecard_url;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner, scorecard_url)
VALUES ('2026', false, '6 August 2026', 'Midweek League Playoffs', 'Arches Midweek XI', 'Arches MW XI', 'Dunmurry MW2 XI', 'City of Belfast Playing Fields (Dunmurry), Mallusk', 'completed', 'Dunmurry MW2 XI won by 101 runs', 'Opponent', 'https://cricketireland.nvplay.com/match/85f4dcb4-aea3-4acb-8c72-2d00a5272722')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner, scorecard_url = EXCLUDED.scorecard_url;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner, scorecard_url)
VALUES ('2026', false, '2 August 2026', 'Mercury Senior League 3', 'Arches 1st XI', 'Arches 1st XI', 'NIMACC 1st XI', 'City of Belfast Playing Fields (NIMA), Mallusk', 'completed', 'Arches 1st XI won by 1 wicket', 'Arches', 'https://cricketireland.nvplay.com/match/4d8f44b2-29e0-43b2-9fa3-c1d676a13ef6')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner, scorecard_url = EXCLUDED.scorecard_url;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner, scorecard_url)
VALUES ('2026', false, '1 August 2026', 'Development Cup', 'Arches 2nd XI', 'Arches 2nd XI', 'Amigos Belfast 2nd XI', 'TBC, TBC', 'completed', 'Amigos Belfast 2nd XI won by 10 runs', 'Opponent', 'https://cricketireland.nvplay.com/match/3a89fcf1-567b-4230-8e6d-eac41ef659eb')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner, scorecard_url = EXCLUDED.scorecard_url;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner, scorecard_url)
VALUES ('2026', false, '29 July 2026', 'Midweek League Playoffs', 'Arches Midweek XI', 'Muckamore MW1 XI', 'Arches MW XI', 'Moylena, Muckamore', 'completed', 'Arches MW XI won by 13 runs', 'Arches', 'https://cricketireland.nvplay.com/match/9d6c20d4-bf55-4ad8-a013-3d521a0cc24a')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner, scorecard_url = EXCLUDED.scorecard_url;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner, scorecard_url)
VALUES ('2026', false, '26 July 2026', 'Junior League 10', 'Arches 2nd XI', 'Arches 2nd XI', 'Ardent Blues 4th XI', 'TBC, TBC', 'completed', 'Arches 2nd XI won by 9 wickets', 'Arches', 'https://cricketireland.nvplay.com/match/c8d2cfb6-b69d-4828-b2ee-1a305f5dd004')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner, scorecard_url = EXCLUDED.scorecard_url;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner, scorecard_url)
VALUES ('2026', false, '25 July 2026', 'Mercury Senior League 3', 'Arches 1st XI', 'Drumaness Superkings 1st XI', 'Arches 1st XI', 'The Village Ground, Drumaness', 'completed', 'Drumaness Superkings 1st XI won by 37 runs', 'Opponent', 'https://cricketireland.nvplay.com/match/24166874-1bf6-4c61-a13b-96301557e7ac')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner, scorecard_url = EXCLUDED.scorecard_url;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner, scorecard_url)
VALUES ('2026', false, '22 July 2026', 'Midweek League Group B', 'Arches Midweek XI', 'CSNI MW XI', 'Arches MW XI', 'Stormont, Belfast', 'completed', 'Arches MW XI won by 50 runs', 'Arches', 'https://cricketireland.nvplay.com/match/03878c09-aec0-4edd-aed3-6b8c2a24917e')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner, scorecard_url = EXCLUDED.scorecard_url;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner, scorecard_url)
VALUES ('2026', false, '19 July 2026', 'Junior League 10', 'Arches 2nd XI', 'Downpatrick 3rd XI', 'Arches 2nd XI', 'TBC, TBC', 'completed', 'Arches 2nd XI won by 22 runs', 'Arches', 'https://cricketireland.nvplay.com/match/37dd46b4-e2bc-4544-8bb0-0b21c42e636d')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner, scorecard_url = EXCLUDED.scorecard_url;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner, scorecard_url)
VALUES ('2026', false, '19 July 2026', 'Mercury Senior League 3', 'Arches 1st XI', 'Arches 1st XI', 'Belfast Superkings 1st XI', 'City of Belfast Playing Fields (BSK), Mallusk', 'completed', 'Belfast Superkings 1st XI won by 4 wickets', 'Opponent', 'https://cricketireland.nvplay.com/match/8b50e82b-0af5-4ae4-a05b-75a06a67001a')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner, scorecard_url = EXCLUDED.scorecard_url;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner, scorecard_url)
VALUES ('2026', false, '18 July 2026', 'Development Cup', 'Arches 2nd XI', 'Lisburn 5th XI', 'Arches 2nd XI', 'Victoria Park, Belfast', 'completed', 'Arches 2nd XI won by 5 wickets', 'Arches', 'https://cricketireland.nvplay.com/match/ba702836-b12d-4648-a793-969128180c54')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner, scorecard_url = EXCLUDED.scorecard_url;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner, scorecard_url)
VALUES ('2026', false, '14 July 2026', 'Midweek League Group B', 'Arches Midweek XI', 'Arches MW XI', 'Dunmurry MW2 XI', 'TBC, TBC', 'completed', 'Arches MW XI won by 5 wickets', 'Arches', 'https://cricketireland.nvplay.com/match/43dbf251-9006-401e-9ff8-1bee03739131')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner, scorecard_url = EXCLUDED.scorecard_url;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner, scorecard_url)
VALUES ('2026', false, '12 July 2026', 'Junior League 10', 'Arches 2nd XI', 'Amigos Belfast 3rd XI', 'Arches 2nd XI', 'TBC, TBC', 'completed', 'Arches 2nd XI won by 79 runs', 'Arches', 'https://cricketireland.nvplay.com/match/cfc11f4e-eeb1-462a-bb1c-9a249e682128')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner, scorecard_url = EXCLUDED.scorecard_url;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner, scorecard_url)
VALUES ('2026', false, '8 July 2026', 'Midweek League Group B', 'Arches Midweek XI', 'Muckamore MW2 XI', 'Arches MW XI', 'Moylena, Muckamore', 'completed', 'Muckamore MW2 XI won by 7 wickets', 'Opponent', 'https://cricketireland.nvplay.com/match/bd72db2e-eb7c-4bdb-90a8-83d32a2bd719')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner, scorecard_url = EXCLUDED.scorecard_url;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner, scorecard_url)
VALUES ('2026', false, '5 July 2026', 'Junior League 10', 'Arches 2nd XI', 'Arches 2nd XI', 'Dungannon 1st XI', 'TBC, TBC', 'completed', 'Dungannon 1st XI won by 31 runs', 'Opponent', 'https://cricketireland.nvplay.com/match/ad26359d-98c5-4cc5-a788-8035a14ecb6b')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner, scorecard_url = EXCLUDED.scorecard_url;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner, scorecard_url)
VALUES ('2026', false, '4 July 2026', 'Mercury Senior League 3', 'Arches 1st XI', 'Ards & Donaghadee 1st XI', 'Arches 1st XI', 'Northfield, Donaghadee', 'completed', 'Ards & Donaghadee 1st XI won by 106 runs', 'Opponent', 'https://cricketireland.nvplay.com/match/f492c80f-64d3-4df1-a3d0-415fb2f267e7')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner, scorecard_url = EXCLUDED.scorecard_url;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner, scorecard_url)
VALUES ('2026', false, '30 June 2026', 'Midweek League Group B', 'Arches Midweek XI', 'Arches MW XI', 'Cliftonville Academy MW XI', 'TBC, TBC', 'completed', 'Arches MW XI won by 7 wickets', 'Arches', 'https://cricketireland.nvplay.com/match/d6f92803-9fae-4c72-9cd2-632b7fd5236b')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner, scorecard_url = EXCLUDED.scorecard_url;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner, scorecard_url)
VALUES ('2026', false, '27 June 2026', 'Mercury Senior League 3', 'Arches 1st XI', 'Victoria 1st XI', 'Arches 1st XI', 'Lurgan Park, Lurgan', 'completed', 'Victoria 1st XI won by 8 wickets', 'Opponent', 'https://cricketireland.nvplay.com/match/79b5303d-feb1-4a33-b0c2-6b4134218c08')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner, scorecard_url = EXCLUDED.scorecard_url;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner, scorecard_url)
VALUES ('2026', false, '25 June 2026', 'Lagan Valley Steels T20 Shield', 'Arches 1st XI', 'Ards & Donaghadee 1st XI', 'Arches 1st XI', 'Northfield, Donaghadee', 'completed', 'Ards & Donaghadee 1st XI won by 24 runs', 'Opponent', 'https://cricketireland.nvplay.com/match/61057371-7652-4578-9f56-76ed38930428')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner, scorecard_url = EXCLUDED.scorecard_url;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner, scorecard_url)
VALUES ('2026', false, '24 June 2026', 'Mercury Senior League 3', 'Arches 1st XI', 'Belfast Superkings 1st XI', 'Arches 1st XI', 'City of Belfast Playing Fields (BSK), Mallusk', 'completed', 'Belfast Superkings 1st XI won by 62 runs', 'Opponent', 'https://cricketireland.nvplay.com/match/afc6cb9b-93fa-4497-bbc7-86da38b0a73e')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner, scorecard_url = EXCLUDED.scorecard_url;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner, scorecard_url)
VALUES ('2026', false, '23 June 2026', 'Midweek League Group B', 'Arches Midweek XI', 'Cooke Collegians MW XI', 'Arches MW XI', 'Pirrie Park, Belfast', 'completed', 'Arches MW XI won by 27 runs', 'Arches', 'https://cricketireland.nvplay.com/match/2cba90aa-9a4d-48e9-bd19-f9f00b3627bf')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner, scorecard_url = EXCLUDED.scorecard_url;

-- B. 2025 SEASON MATCHES (54 matches - Archived Season)
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, 'TBD', 'Junior League 10', 'Arches 2nd XI', 'Arches 2nd XI', 'Dungannon 1st XI', 'TBC, TBC', 'scheduled', NULL, NULL)
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, 'SUN 12 JUL', 'Junior League 10', 'Arches 2nd XI', 'Amigos Belfast 3rd XI', 'Arches 2nd XI', 'TBC, TBC', 'scheduled', NULL, NULL)
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, 'TBD', 'Midweek League', 'Arches Midweek XI', 'Muckamore MW2 XI', 'Arches MW XI', 'Moylena, Muckamore', 'scheduled', NULL, NULL)
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, 'TBD', 'Midweek League', 'Arches Midweek XI', 'Arches MW XI', 'Dunmurry MW2 XI', 'TBC, TBC', 'scheduled', NULL, NULL)
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, '4th July', 'Senior League 3', 'Arches 1st XI', 'Ards & Donaghadee', 'Arches 1st XI', 'TBD', 'scheduled', NULL, NULL)
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, '18th July', 'Senior League 3', 'Arches 1st XI', 'Arches 1st XI', 'Belfast Superkings', 'TBD', 'scheduled', NULL, NULL)
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, '1st August', 'Senior League 3', 'Arches 1st XI', 'Arches 1st XI', 'NIMACC', 'TBD', 'scheduled', NULL, NULL)
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, '8th August', 'Senior League 3', 'Arches 1st XI', 'Dundrum', 'Arches 1st XI', 'TBD', 'scheduled', NULL, NULL)
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, '5th July', 'Junior League 10', 'Arches 2nd XI', 'Arches 2nd XI', 'Dungannon', 'Victoria Park, Belfast', 'scheduled', NULL, NULL)
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, '12th July', 'Junior League 10', 'Arches 2nd XI', 'Amigos Belfast 3', 'Arches 2nd XI', 'TBD', 'scheduled', NULL, NULL)
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, '19th July', 'Junior League 10', 'Arches 2nd XI', 'Downpatrick 3', 'Arches 2nd XI', 'TBD', 'scheduled', NULL, NULL)
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, '26th July', 'Junior League 10', 'Arches 2nd XI', 'Arches 2nd XI', 'Ardent Blues 4', 'Victoria Park, Belfast', 'scheduled', NULL, NULL)
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, '9th August', 'Junior League 10', 'Arches 2nd XI', 'Arches 2nd XI', 'Cooke Collegians 4', 'Victoria Park, Belfast', 'scheduled', NULL, NULL)
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, '23rd August', 'Junior League 10', 'Arches 2nd XI', 'Belfast Superkings 2', 'Arches 2nd XI', 'TBD', 'scheduled', NULL, NULL)
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, '29th August', 'Junior League 10', 'Arches 2nd XI', 'Arches 2nd XI', 'Belfast Superkings 3', 'Victoria Park, Belfast', 'scheduled', NULL, NULL)
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, '8th July', 'Midweek League', 'Arches Midweek XI', 'Muckamore 2', 'Arches MW XI', 'TBD', 'scheduled', NULL, NULL)
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, '14th July', 'Midweek League', 'Arches Midweek XI', 'Arches MW XI', 'Dunmurry 2', 'Victoria Park, Belfast', 'scheduled', NULL, NULL)
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, '22nd July', 'Midweek League', 'Arches Midweek XI', 'CSNI', 'Arches MW XI', 'TBD', 'scheduled', NULL, NULL)
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, 'SAT 27 JUN', 'Senior League 3', 'Arches 1st XI', 'Arches 1st XI', 'Victoria 1st XI', 'Lurgan Park, Lurgan', 'completed', 'Victoria 1st XI won by 8 wickets', 'Opponent')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, 'WED 24 JUN', 'Senior League 3', 'Arches 1st XI', 'Belfast Superkings 1st XI', 'Arches 1st XI', 'City of Belfast Playing Fields (BSK), Mallusk', 'completed', 'Belfast Superkings 1st XI won by 62 runs', 'Opponent')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, 'WED 24 JUN', 'Senior League 3', 'Arches 1st XI', 'Arches 1st XI', 'Dundrum 1st XI', 'The Meadow, Dundrum', 'completed', 'Arches 1st XI won by 36 runs', 'Arches')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, 'WED 24 JUN', 'Senior League 3', 'Arches 1st XI', 'Arches 1st XI', 'Amigos Belfast 1st XI', 'TBC, TBC', 'completed', 'Amigos Belfast 1st XI won by 4 wickets', 'Opponent')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, 'WED 24 JUN', 'Senior League 3', 'Arches 1st XI', 'Arches 1st XI', 'Belfast Superkings 1st XI', 'City of Belfast Playing Fields (BSK), Mallusk', 'completed', 'Match Abandoned', 'No Result')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, 'TBD', 'Junior League 10', 'Arches 2nd XI', 'Templepatrick 4th XI', 'Arches 2nd XI', 'TBC, TBC', 'completed', 'Arches 2nd XI won by 5 wickets', 'Arches')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, 'TBD', 'Junior League 10', 'Arches 2nd XI', 'North Down 4th XI', 'Arches 2nd XI', 'The Green, Comber', 'completed', 'Arches 2nd XI won by 7 wickets', 'Arches')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, 'TBD', 'Junior League 10', 'Arches 2nd XI', 'Arches 2nd XI', 'CI 5th XI', 'TBC, TBC', 'completed', 'CI 5th XI won by 2 wickets', 'Opponent')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, 'SAT 6 JUN', 'Junior League 10', 'Arches 2nd XI', 'Arches 2nd XI', 'Lurgan 3rd XI', 'TBC, TBC', 'completed', 'Lurgan 3rd XI won by 4 wickets', 'Opponent')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, 'TBD', 'Midweek League', 'Arches Midweek XI', 'Cliftonville Academy MW XI', 'Arches MW XI', 'TBC, TBC', 'completed', 'Arches MW XI won by 7 wickets', 'Arches')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, 'TBD', 'Midweek League', 'Arches Midweek XI', 'Arches MW XI', 'Cooke Collegians MW XI', 'Pirrie Park, Belfast', 'completed', 'Arches MW XI won by 27 runs', 'Arches')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, '6 SEP 2025', 'Development Cup', 'Arches 2nd XI', 'Amigos Belfast 2nd XI', 'Arches 2nd XI', 'The Green (Upper Ground), Comber', 'completed', 'Arches 2nd XI won by 4 wickets', 'Arches')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, '2 AUG 2025', 'Development Cup', 'Arches 2nd XI', 'Arches 2nd XI', 'Dunmurry 4th XI', 'TBC, TBC', 'completed', 'Arches 2nd XI won by 58 runs', 'Arches')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, '16 JUL 2025', 'Development Cup', 'Arches 2nd XI', 'Lisburn 5th XI', 'Arches 2nd XI', 'Wallace Park, Lisburn', 'completed', 'Arches 2nd XI won by 4 wickets', 'Arches')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, '16 JUL 2025', 'Development Cup', 'Arches 2nd XI', 'Victoria 3rd XI', 'Arches 2nd XI', 'Victoria Park, Belfast', 'completed', 'Arches 2nd XI won by 7 wickets', 'Arches')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, 'TBD', 'T20 Shield Cup', 'Arches 1st XI', 'Ards & Donaghadee 1st XI', 'Arches 1st XI', 'Northfield, Donaghadee', 'completed', 'Ards & Donaghadee 1st XI won by 24 runs', 'Opponent')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, '27th June', 'Senior League 3', 'Arches 1st XI', 'Arches 1st XI', 'Victoria', 'TBD', 'completed', 'Victoria beat Arches by 8 wickets', 'Arches')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, '24th June', 'Senior League 3', 'Arches 1st XI', 'Belfast Superkings', 'Arches 1st XI', 'TBD', 'completed', 'Belfast Superkings beat Arches by 62 runs', 'Arches')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, '20th June', 'Senior League 3', 'Arches 1st XI', 'Arches 1st XI', 'Dundrum', 'TBD', 'completed', 'Arches beat Dundrum by 36 runs', 'Arches')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, '13th June', 'Senior League 3', 'Arches 1st XI', 'Arches 1st XI', 'Amigos Belfast', 'TBD', 'completed', 'Amigos Belfast beat Arches by 4 wickets', 'Arches')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, '30th May', 'Senior League 3', 'Arches 1st XI', 'Belfast Superkings', 'Arches 1st XI', 'TBD', 'completed', 'Belfast Superkings v Arches – Abandoned', 'Arches')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, '23rd May', 'Senior League 3', 'Arches 1st XI', 'Drumaness Superkings', 'Arches 1st XI', 'TBD', 'completed', 'Drumaness Superkings beat Arches by 235 runs', 'Arches')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, '17th May', 'Senior League 3', 'Arches 1st XI', 'NIMACC', 'Arches 1st XI', 'TBD', 'completed', 'NIMACC beat Arches by 98 runs (DLS)', 'Arches')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, '2nd May', 'Senior League 3', 'Arches 1st XI', 'Arches 1st XI', 'Ards & Donaghadee', 'TBD', 'completed', 'Ards & Donaghadee beat Arches by 7 wickets', 'Arches')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, '21st June', 'Junior League 10', 'Arches 2nd XI', 'Templepatrick 4', 'Arches 2nd XI', 'TBD', 'completed', 'Arches 2 beat Templepatrick 4 by 5 wickets', 'Arches')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, '14th June', 'Junior League 10', 'Arches 2nd XI', 'North Down 4', 'Arches 2nd XI', 'TBD', 'completed', 'Arches beat North Down by 7 wickets', 'Arches')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, '7th June', 'Junior League 10', 'Arches 2nd XI', 'Arches 2nd XI', 'CI 5', 'Victoria Park, Belfast', 'completed', 'CI 5 beat Arches 2 by 2 wickets', 'Arches')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, '6th June', 'Junior League 10', 'Arches 2nd XI', 'Arches 2nd XI', 'Lurgan 3', 'Victoria Park, Belfast', 'completed', 'Lurgan 3 beat Arches 2 by 4 wickets', 'Arches')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, '10th May', 'Junior League 10', 'Arches 2nd XI', 'Arches 2nd XI', 'NIMACC', 'Victoria Park, Belfast', 'completed', 'Arches 2 beat NIMACC 2 – NIMACC 2 played an inelgible player', 'Arches')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, '30th June', 'Midweek League', 'Arches 1st XI', 'Arches v Cliftonville Academy', 'Ardent Blues 2 v CSNI', 'TBD', 'completed', 'Muckamore 2 beat Cregagh – Cregagh unable to field a team', 'No Result')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, '23rd June', 'Midweek League', 'Arches Midweek XI', 'Arches MW XI', 'Cooke Collegians', 'Victoria Park, Belfast', 'completed', 'Arches beat Cooke Collegians by 27 runs', 'Arches')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, '16th June', 'Midweek League', 'Arches Midweek XI', 'Cregagh', 'Arches MW XI', 'TBD', 'completed', 'Arches beat Cregagh by 9 wickets', 'Arches')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, '2nd June', 'Midweek League', 'Arches Midweek XI', 'Belfast', 'Arches MW XI', 'TBD', 'completed', 'Arches beat Belfast by 9 wickets', 'Arches')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, '26th May', 'Midweek League', 'Arches Midweek XI', 'Arches MW XI', 'Ardent Blues 2', 'Victoria Park, Belfast', 'completed', 'Ardent Blues 2 beat Arches by 7 wickets', 'Arches')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, 'TBD', 'Development Cup', 'Arches 2nd XI', 'CSNI 5th XI', 'Arches 2nd XI', 'Londonderry Park, Newtownards', 'completed', 'Arches 2nd XI won by 7 wickets', 'Arches')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (season, is_archived, date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2025', true, 'TBD', 'Development Cup', 'Arches 2nd XI', 'Saintfield 3rd XI', 'Arches 2nd XI', 'TBC, TBC', 'completed', 'Arches 2nd XI won by 5 wickets', 'Arches')
ON CONFLICT (season, date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;

-- ==============================================================================
-- 4. HONOURS BOARD & CLUB MILESTONES (71 records: Centuries, 50s, 5-Wickets, Hat-tricks)
-- ==============================================================================
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2026', 'FIVE WICKETS', 'five-wickets', 'Abubakar Rehmani', '8-7', 'Dundrum', 'Senior League 3', '20th June 2026', 'bowling', '8-7 vs Dundrum') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2026', 'FIVE WICKETS', 'five-wickets', 'Veerendra Babu Nagari', '5-53', 'NIMACC', 'Senior League 3', '17th May 2026', 'bowling', '5-53 vs NIMACC') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2026', 'HALF CENTURY', 'half-century', 'Ali Rizwan', '61*', 'North Down 4', 'Junior League 10', '14th June 2026', 'batting', '61* vs North Down 4') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2026', 'HALF CENTURY', 'half-century', 'Ali Rizwan', '60', 'CI 5', 'Junior League 10', '7th June 2026', 'batting', '60 vs CI 5') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2026', 'HALF CENTURY', 'half-century', 'Abubakar Rehmani', '50', 'Lurgan 3', 'Junior League 10', '6th June 2026', 'batting', '50 vs Lurgan 3') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2026', 'HALF CENTURY', 'half-century', 'Anil Narra', '58', 'NIMACC', 'Junior League 10', '10th May 2026', 'batting', '58 vs NIMACC') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2026', 'MIDWEEK 30', 'midweek-30', 'Vonga Vishnu', '30*', 'Cooke Collegians', 'Midweek League', '23rd June 2026', 'batting', '30* vs Cooke Collegians') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2026', 'MIDWEEK 30', 'midweek-30', 'Wasim SM', '31*', 'Cooke Collegians', 'Midweek League', '23rd June 2026', 'batting', '31* vs Cooke Collegians') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2026', 'MIDWEEK 30', 'midweek-30', 'Ali Rizwan', '33*', 'Cregagh', 'Midweek League', '16th June 2026', 'batting', '33* vs Cregagh') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2026', 'MIDWEEK 30', 'midweek-30', 'Vonga Vishnu', '31*', 'Cregagh', 'Midweek League', '16th June 2026', 'batting', '31* vs Cregagh') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2026', 'MIDWEEK 30', 'midweek-30', 'Asad Murtuza', '34*', 'Cregagh', 'Midweek League', '16th June 2026', 'batting', '34* vs Cregagh') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2026', 'MIDWEEK 30', 'midweek-30', 'Ali Rizwan', '33*', 'Belfast', 'Midweek League', '2nd June 2026', 'batting', '33* vs Belfast') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2026', 'MIDWEEK 30', 'midweek-30', 'Srini Nadakuditi', '33*', 'Belfast', 'Midweek League', '2nd June 2026', 'batting', '33* vs Belfast') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2026', 'MIDWEEK 30', 'midweek-30', 'Vonga Vishnu', '35*', 'Ardent Blues 2', 'Midweek League', '26th May 2026', 'batting', '35* vs Ardent Blues 2') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2026', 'HALF CENTURY', 'half-century', 'Arush Nimmagadda', '65', 'Drumaness Superkings 1st', 'Senior League 3', '25th July 2026', 'batting', '65 vs Drumaness Superkings 1st') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2026', 'HALF CENTURY', 'half-century', 'Dushyanth Reddy B', '55', 'Amigos Belfast 1st', 'NCU Mercury Senior League 3', '15th August 2026', 'batting', '55 vs Amigos Belfast 1st') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2026', 'HALF CENTURY', 'half-century', 'Abubakar Rehmani', '64', 'Amigos Belfast 1st', 'NCU Mercury Senior League 3', '15th August 2026', 'batting', '64 vs Amigos Belfast 1st') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2026', 'HALF CENTURY', 'half-century', 'Vonga Vishnu', '62', 'Cooke Collegians 4th', 'NCU Junior League 10', '9th August 2026', 'batting', '62 vs Cooke Collegians 4th') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2026', 'HALF CENTURY', 'half-century', 'Kishan Karneedi', '66', 'Cooke Collegians 4th', 'NCU Junior League 10', '9th August 2026', 'batting', '66 vs Cooke Collegians 4th') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2026', 'HALF CENTURY', 'half-century', 'Vijaykumar Hugar', '56', 'Dundrum 1st', 'NCU Mercury Senior League 3', '8th August 2026', 'batting', '56 vs Dundrum 1st') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2026', 'MIDWEEK 30', 'midweek-30', 'Vonga Vishnu', '35*', 'Dunmurry MW2', 'NCU Midweek League Playoffs', '6th August 2026', 'batting', '35* vs Dunmurry MW2') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2026', 'HALF CENTURY', 'half-century', 'Vonga Vishnu', '56', 'NIMACC 1st', 'NCU Mercury Senior League 3', '2nd August 2026', 'batting', '56 vs NIMACC 1st') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2026', 'HALF CENTURY', 'half-century', 'Asad Murtuza', '50*', 'NIMACC 1st', 'NCU Mercury Senior League 3', '2nd August 2026', 'batting', '50* vs NIMACC 1st') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2026', 'HALF CENTURY', 'half-century', 'Ali Rizwan', '68', 'Amigos Belfast 2nd', 'NCU Development Cup', '1st August 2026', 'batting', '68 vs Amigos Belfast 2nd') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2026', 'MIDWEEK 30', 'midweek-30', 'Wasim SM', '30*', 'Muckamore MW1', 'NCU Midweek League Playoffs', '29th July 2026', 'batting', '30* vs Muckamore MW1') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2026', 'HALF CENTURY', 'half-century', 'Ali Rizwan', '63*', 'Ardent Blues 4th', 'NCU Junior League 10', '26th July 2026', 'batting', '63* vs Ardent Blues 4th') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2026', 'HALF CENTURY', 'half-century', 'Vijaykumar Hugar', '58*', 'Ardent Blues 4th', 'NCU Junior League 10', '26th July 2026', 'batting', '58* vs Ardent Blues 4th') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2026', 'HALF CENTURY', 'half-century', 'Vonga Vishnu', '51', 'Drumaness Superkings 1st', 'NCU Mercury Senior League 3', '25th July 2026', 'batting', '51 vs Drumaness Superkings 1st') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2026', 'MIDWEEK 30', 'midweek-30', 'Vijaykumar Hugar', '30*', 'CSNI MW', 'NCU Midweek League Group B', '22nd July 2026', 'batting', '30* vs CSNI MW') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2026', 'MIDWEEK 30', 'midweek-30', 'Kishan Karneedi', '33*', 'CSNI MW', 'NCU Midweek League Group B', '22nd July 2026', 'batting', '33* vs CSNI MW') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2026', 'MIDWEEK 3W', 'midweek-3w', 'Kiran Maheswaram', '3-25', 'CSNI MW', 'NCU Midweek League Group B', '22nd July 2026', 'bowling', '3-25 vs CSNI MW') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2026', 'MIDWEEK 30', 'midweek-30', 'Ali Rizwan', '34*', 'Dunmurry MW2', 'NCU Midweek League Group B', '14th July 2026', 'batting', '34* vs Dunmurry MW2') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2026', 'MIDWEEK 30', 'midweek-30', 'Asad Murtuza', '32*', 'Dunmurry MW2', 'NCU Midweek League Group B', '14th July 2026', 'batting', '32* vs Dunmurry MW2') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2026', 'CENTURY', 'century', 'Ali Rizwan', '127*', 'Amigos Belfast 3rd', 'NCU Junior League 10', '12th July 2026', 'batting', '127* vs Amigos Belfast 3rd') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2026', 'MIDWEEK 30', 'midweek-30', 'Asad Murtuza', '31*', 'Muckamore MW2', 'NCU Midweek League Group B', '8th July 2026', 'batting', '31* vs Muckamore MW2') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2026', 'MIDWEEK 3W', 'midweek-3w', 'Haneef Shaik', '3-18', 'Muckamore MW2', 'NCU Midweek League Group B', '8th July 2026', 'bowling', '3-18 vs Muckamore MW2') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2026', 'MIDWEEK 30', 'midweek-30', 'Vonga Vishnu', '33*', 'Cliftonville Academy MW', 'NCU Midweek League Group B', '30th June 2026', 'batting', '33* vs Cliftonville Academy MW') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2026', 'MIDWEEK 30', 'midweek-30', 'Wasim SM', '31*', 'Cliftonville Academy MW', 'NCU Midweek League Group B', '30th June 2026', 'batting', '31* vs Cliftonville Academy MW') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2025', 'HALF CENTURY', 'half-century', 'Dushyanth Reddy B', '73', 'Belfast Superkings', 'Senior League 3', '23rd August 2025', 'batting', '73 vs Belfast Superkings') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2025', 'FIVE WICKETS', 'five-wickets', 'Veerendra Babu Nagari', '5-17', 'Amigos Belfast', 'Senior League 3', '9th August 2025', 'bowling', '5-17 vs Amigos Belfast') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2025', 'HALF CENTURY', 'half-century', 'Asad Murtuza', '68', 'Larne', 'Senior League 3', '3rd August 2025', 'batting', '68 vs Larne') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2025', 'FIVE WICKETS', 'five-wickets', 'Kishan Karneedi', '5-22', 'Dunmurry', 'Senior League 3', '26th July 2025', 'bowling', '5-22 vs Dunmurry') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2025', 'HALF CENTURY', 'half-century', 'Anil Narra', '53', 'NIMACC', 'Senior League 3', '19th July 2025', 'batting', '53 vs NIMACC') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2025', 'HALF CENTURY', 'half-century', 'Srini Nadakuditi', '54', 'Amigos Belfast', 'Junior League 10', '24th August 2025', 'batting', '54 vs Amigos Belfast') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2025', 'CENTURY', 'century', 'Rohit Singh', '114', 'Victoria', 'Junior League 10', '16th August 2025', 'batting', '114 vs Victoria') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2025', 'CENTURY', 'century', 'Ali Rizwan', '131', 'Amigos Belfast', 'Junior League 10', '8th June 2025', 'batting', '131 vs Amigos Belfast') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2025', 'FIVE WICKETS', 'five-wickets', 'Yaungicha Mirthivada', '5-31', 'Amigos Belfast', 'Junior League 10', '8th June 2025', 'bowling', '5-31 vs Amigos Belfast') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2025', 'CENTURY', 'century', 'Ali Rizwan', '101*', 'NIMACC', 'Junior League 10', '1st June 2025', 'batting', '101* vs NIMACC') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2025', 'HALF CENTURY', 'half-century', 'Dushyanth Reddy B', '62', 'Dunmurry', 'Development Cup', '2025', 'batting', '62 vs Dunmurry') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2025', 'HALF CENTURY', 'half-century', 'Rohit Singh', '83', 'Dunmurry', 'Development Cup', '2025', 'batting', '83 vs Dunmurry') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2025', 'MIDWEEK 3W', 'midweek-3w', 'Harsha Sai', '3-26', 'Holywood MW', 'Midweek League', '22nd July 2025', 'bowling', '3-26 vs Holywood MW') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2025', 'MIDWEEK 30', 'midweek-30', 'Srini Nadakuditi', '35*', 'Dunmurry MW', 'Midweek League', '9th July 2025', 'batting', '35* vs Dunmurry MW') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2025', 'MIDWEEK 30', 'midweek-30', 'Kiran Maheswaram', '31*', 'CSNI MW', 'Midweek League', '1st July 2025', 'batting', '31* vs CSNI MW') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2025', 'MIDWEEK 30', 'midweek-30', 'Kishan Karneedi', '35*', 'Cooke Collegians MW', 'Midweek League', '24th June 2025', 'batting', '35* vs Cooke Collegians MW') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2025', 'MIDWEEK 3W', 'midweek-3w', 'Veera SR Nimmakayala', '3-19', 'Cooke Collegians MW', 'Midweek League', '24th June 2025', 'bowling', '3-19 vs Cooke Collegians MW') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2025', 'MIDWEEK 3W', 'midweek-3w', 'Kishan Karneedi', '4-15', 'Cooke Collegians MW', 'Midweek League', '24th June 2025', 'bowling', '4-15 vs Cooke Collegians MW') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2025', 'MIDWEEK 30', 'midweek-30', 'Kishan Karneedi', '32*', 'Lisburn MW', 'Midweek League', '19th June 2025', 'batting', '32* vs Lisburn MW') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2025', 'MIDWEEK 3W', 'midweek-3w', 'Dushyanth Reddy B', '3-26', 'Dunmurry MW', 'Midweek League', '3rd June 2025', 'bowling', '3-26 vs Dunmurry MW') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2025', 'MIDWEEK 30', 'midweek-30', 'Ali Rizwan', '34', 'Dunmurry MW', 'Midweek League', '3rd June 2025', 'batting', '34 vs Dunmurry MW') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2025', 'MIDWEEK 30', 'midweek-30', 'Kishan Karneedi', '32*', 'Dunmurry MW', 'Midweek League', '3rd June 2025', 'batting', '32* vs Dunmurry MW') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2025', 'MIDWEEK 30', 'midweek-30', 'Ali Rizwan', '35*', 'CSNI MW', 'Midweek League', '28th May 2025', 'batting', '35* vs CSNI MW') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2025', 'MIDWEEK 30', 'midweek-30', 'Sarmad Butt', '30', 'CSNI MW', 'Midweek League', '28th May 2025', 'batting', '30 vs CSNI MW') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2025', 'MIDWEEK 3W', 'midweek-3w', 'Anshul Krishali', '3-26', 'CSNI MW', 'Midweek League', '28th May 2025', 'bowling', '3-26 vs CSNI MW') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2025', 'MIDWEEK 3W', 'midweek-3w', 'Kishan Karneedi', '3-21', 'Cooke Collegians MW', 'Midweek League', '20th May 2025', 'bowling', '3-21 vs Cooke Collegians MW') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2025', 'MIDWEEK 30', 'midweek-30', 'Ali Rizwan', '32*', 'Cooke Collegians MW', 'Midweek League', '20th May 2025', 'batting', '32* vs Cooke Collegians MW') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2025', 'MIDWEEK 30', 'midweek-30', 'Chandra Obula Reddy B', '31*', 'Cooke Collegians MW', 'Midweek League', '20th May 2025', 'batting', '31* vs Cooke Collegians MW') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2025', 'MIDWEEK 30', 'midweek-30', 'Anshul Krishali', '30*', 'Lisburn MW', 'Midweek League', '15th May 2025', 'batting', '30* vs Lisburn MW') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2025', 'MIDWEEK 30', 'midweek-30', 'Ali Rizwan', '30*', 'Lisburn MW', 'Midweek League', '15th May 2025', 'batting', '30* vs Lisburn MW') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2025', 'MIDWEEK 30', 'midweek-30', 'Sarmad Butt', '32*', 'Lisburn MW', 'Midweek League', '15th May 2025', 'batting', '32* vs Lisburn MW') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2025', 'HAT TRICK', 'hat-trick', 'Kishan Karneedi', 'Hat-trick', 'vs Dunmurry', 'Senior League 3', '26th July 2025', 'bowling', 'Hat-trick vs vs Dunmurry') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, record, opponent, league, match_date, type, stats_highlight) VALUES ('2026', 'HALF CENTURY', 'half-century', 'Ali Rizwan', '63', 'Ardent Blues 4th XI', 'Junior League 10', '26th July 2026', 'batting', '63 vs Ardent Blues 4th XI') ON CONFLICT (season, category, recipient_name, record, match_date) DO NOTHING;

-- ==============================================================================
-- 5. PLAYER STATISTICS (2025, 2026, and All-Time Career Stats)
-- ==============================================================================

-- Stats for 2025 (30 players)
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2025', 32, 843, '131', 1, '1-13'
FROM public.players WHERE slug = 'ali-rizwan'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2025', 34, 583, '73', 33, '4-30'
FROM public.players WHERE slug = 'dushyanth-reddy-b'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2025', 38, 496, '53', 7, '2-14'
FROM public.players WHERE slug = 'anil-narra'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2025', 23, 439, '54', 2, '2-38'
FROM public.players WHERE slug = 'srini-nadakuditi'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2025', 42, 404, '37', 54, '5-22'
FROM public.players WHERE slug = 'kishan-karneedi'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2025', 13, 311, '68', 0, '-'
FROM public.players WHERE slug = 'asad-murtuza'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2025', 8, 260, '114', 3, '1-3'
FROM public.players WHERE slug = 'rohit-singh'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2025', 31, 259, '31*', 31, '3-20'
FROM public.players WHERE slug = 'chandra-obula-reddy-b'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2025', 17, 201, '37', 22, '5-17'
FROM public.players WHERE slug = 'veerendra-babu-nagari'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2025', 16, 191, '47', 11, '2-21'
FROM public.players WHERE slug = 'vinay-tummala'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2025', 11, 178, '32*', 0, '0-8'
FROM public.players WHERE slug = 'sarmad-butt'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2025', 21, 132, '22*', 1, '1-10'
FROM public.players WHERE slug = 'charan-reddy-datla'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2025', 16, 120, '37', 18, '4-36'
FROM public.players WHERE slug = 'veera-sr-nimmakayala'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2025', 24, 117, '31*', 10, '2-11'
FROM public.players WHERE slug = 'kiran-maheswaram'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2025', 13, 98, '37', 2, '1-3'
FROM public.players WHERE slug = 'tulasi-gangadhar-thatavarthi'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2025', 15, 97, '27*', 13, '4-32'
FROM public.players WHERE slug = 'surya-pavan-teja-tummala'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2025', 9, 88, '46*', 7, '2-23'
FROM public.players WHERE slug = 'deepak-sai'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2025', 24, 70, '16', 19, '3-15'
FROM public.players WHERE slug = 'harsha-sai'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2025', 4, 59, '27', 0, '-'
FROM public.players WHERE slug = 'abhiram-donepudi'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2025', 13, 53, '30*', 10, '3-26'
FROM public.players WHERE slug = 'anshul-krishali'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2025', 5, 48, '20', 2, '2-26'
FROM public.players WHERE slug = 'jayasurya-sukhavasi'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2025', 11, 32, '11*', 0, '-'
FROM public.players WHERE slug = 'arush-nimmagadda'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2025', 15, 23, '10', 13, '3-26'
FROM public.players WHERE slug = 'venkateswarrao-jyothi'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2025', 7, 19, '10*', 6, '5-31'
FROM public.players WHERE slug = 'yaungicha-mirthivada'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2025', 2, 7, '4', 0, '-'
FROM public.players WHERE slug = 'hanu-k'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2025', 5, 6, '5', 6, '3-14'
FROM public.players WHERE slug = 'madhu-yellanur'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2025', 6, 4, '2', 4, '2-13'
FROM public.players WHERE slug = 'raja-mouli-yadavalli'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2025', 3, 4, '2', 0, '-'
FROM public.players WHERE slug = 'banu-chand-kandukuri'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2025', 1, 2, '2*', 0, '-'
FROM public.players WHERE slug = 'sharan-bezawada'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2025', 1, 0, '0', 3, '3-25'
FROM public.players WHERE slug = 'anvesh-choudary-mannuru'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;

-- Stats for 2026 (32 players)
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2026', 32, 997, '127*', 0, '0-3'
FROM public.players WHERE slug = 'ali-rizwan'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2026', 29, 596, '80', 7, '3-57'
FROM public.players WHERE slug = 'wasim-sm'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2026', 27, 503, '62', 25, '3-18'
FROM public.players WHERE slug = 'vonga-vishnu'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2026', 34, 482, '66', 38, '3-22'
FROM public.players WHERE slug = 'kishan-karneedi'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2026', 30, 480, '50*', 0, '0-12'
FROM public.players WHERE slug = 'asad-murtuza'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2026', 30, 362, '58', 0, '0-11'
FROM public.players WHERE slug = 'anil-narra'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2026', 15, 337, '77', 27, '8-7'
FROM public.players WHERE slug = 'abubakar-rehmani'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2026', 23, 256, '58*', 4, '1-6'
FROM public.players WHERE slug = 'vijaykumar-hugar'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2026', 15, 244, '33*', 0, '-'
FROM public.players WHERE slug = 'srini-nadakuditi'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2026', 25, 225, '34*', 13, '2-11'
FROM public.players WHERE slug = 'chandra-obula-reddy-b'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2026', 16, 183, '65', 0, '0-26'
FROM public.players WHERE slug = 'arush-nimmagadda'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2026', 15, 177, '48', 21, '5-53'
FROM public.players WHERE slug = 'veerendra-babu-nagari'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2026', 14, 156, '55', 3, '2-17'
FROM public.players WHERE slug = 'dushyanth-reddy-b'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2026', 22, 122, '28*', 13, '3-25'
FROM public.players WHERE slug = 'kiran-maheswaram'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2026', 28, 103, '27', 31, '3-27'
FROM public.players WHERE slug = 'harsha-sai'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2026', 11, 77, '27*', 9, '3-25'
FROM public.players WHERE slug = 'surya-pavan-teja-tummala'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2026', 16, 67, '23', 15, '4-37'
FROM public.players WHERE slug = 'venkateswarrao-jyothi'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2026', 12, 54, '15*', 8, '3-25'
FROM public.players WHERE slug = 'tulasi-gangadhar-thatavarthi'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2026', 1, 45, '45*', 4, '4-30'
FROM public.players WHERE slug = 'veera-sr-nimmakayala'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2026', 3, 36, '18', 1, '1-12'
FROM public.players WHERE slug = 'yaungicha-mirthivada'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2026', 12, 31, '16', 5, '2-22'
FROM public.players WHERE slug = 'purvik-prasad'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2026', 9, 21, '14', 0, '-'
FROM public.players WHERE slug = 'charan-reddy-datla'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2026', 4, 20, '16', 1, '1-5'
FROM public.players WHERE slug = 'deepak-sai'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2026', 3, 19, '14', 0, '-'
FROM public.players WHERE slug = 'sarmad-butt'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2026', 2, 19, '18', 0, '-'
FROM public.players WHERE slug = 'jayasurya-sukhavasi'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2026', 24, 18, '12*', 36, '4-47'
FROM public.players WHERE slug = 'haneef-shaik'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2026', 1, 15, '15*', 1, '1-31'
FROM public.players WHERE slug = 'anvesh-choudary-mannuru'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2026', 3, 8, '4', 3, '2-22'
FROM public.players WHERE slug = 'yashwanth'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2026', 2, 7, '5', 0, '-'
FROM public.players WHERE slug = 'vinay-tummala'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2026', 1, 6, '6', 0, '-'
FROM public.players WHERE slug = 'rohit-singh'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2026', 3, 0, '0', 1, '1-13'
FROM public.players WHERE slug = 'anshuman-singh-baghel'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, '2026', 2, 0, '0', 2, '2-28'
FROM public.players WHERE slug = 'raja-mouli-yadavalli'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;

-- Stats for Career (38 players)
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, 'Career', 64, 1840, '131', 1, '1-13'
FROM public.players WHERE slug = 'ali-rizwan'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, 'Career', 76, 886, '66', 92, '5-22'
FROM public.players WHERE slug = 'kishan-karneedi'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, 'Career', 68, 858, '58', 7, '2-14'
FROM public.players WHERE slug = 'anil-narra'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, 'Career', 43, 791, '68', 0, '0-12'
FROM public.players WHERE slug = 'asad-murtuza'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, 'Career', 48, 739, '73', 36, '4-30'
FROM public.players WHERE slug = 'dushyanth-reddy-b'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, 'Career', 38, 683, '54', 2, '2-38'
FROM public.players WHERE slug = 'srini-nadakuditi'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, 'Career', 29, 596, '80', 7, '3-57'
FROM public.players WHERE slug = 'wasim-sm'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, 'Career', 27, 503, '62', 25, '3-18'
FROM public.players WHERE slug = 'vonga-vishnu'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, 'Career', 55, 484, '34*', 44, '3-20'
FROM public.players WHERE slug = 'chandra-obula-reddy-b'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, 'Career', 32, 378, '48', 43, '5-17'
FROM public.players WHERE slug = 'veerendra-babu-nagari'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, 'Career', 15, 337, '77', 27, '8-7'
FROM public.players WHERE slug = 'abubakar-rehmani'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, 'Career', 9, 266, '114', 3, '1-3'
FROM public.players WHERE slug = 'rohit-singh'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, 'Career', 23, 256, '58*', 4, '1-6'
FROM public.players WHERE slug = 'vijaykumar-hugar'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, 'Career', 46, 239, '31*', 23, '3-25'
FROM public.players WHERE slug = 'kiran-maheswaram'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, 'Career', 27, 215, '65', 0, '0-26'
FROM public.players WHERE slug = 'arush-nimmagadda'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, 'Career', 17, 198, '47', 11, '2-21'
FROM public.players WHERE slug = 'vinay-tummala'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, 'Career', 14, 197, '32*', 0, '0-8'
FROM public.players WHERE slug = 'sarmad-butt'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, 'Career', 26, 174, '27*', 22, '4-32'
FROM public.players WHERE slug = 'surya-pavan-teja-tummala'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, 'Career', 52, 173, '27', 50, '3-15'
FROM public.players WHERE slug = 'harsha-sai'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, 'Career', 17, 165, '45*', 22, '4-30'
FROM public.players WHERE slug = 'veera-sr-nimmakayala'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, 'Career', 30, 153, '22*', 1, '1-10'
FROM public.players WHERE slug = 'charan-reddy-datla'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, 'Career', 25, 152, '37', 10, '3-25'
FROM public.players WHERE slug = 'tulasi-gangadhar-thatavarthi'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, 'Career', 13, 108, '46*', 8, '2-23'
FROM public.players WHERE slug = 'deepak-sai'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, 'Career', 31, 90, '23', 28, '4-37'
FROM public.players WHERE slug = 'venkateswarrao-jyothi'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, 'Career', 7, 67, '20', 2, '2-26'
FROM public.players WHERE slug = 'jayasurya-sukhavasi'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, 'Career', 4, 59, '27', 0, '-'
FROM public.players WHERE slug = 'abhiram-donepudi'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, 'Career', 9, 55, '18', 7, '5-31'
FROM public.players WHERE slug = 'yaungicha-mirthivada'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, 'Career', 13, 53, '30*', 10, '3-26'
FROM public.players WHERE slug = 'anshul-krishali'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, 'Career', 12, 31, '16', 5, '2-22'
FROM public.players WHERE slug = 'purvik-prasad'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, 'Career', 24, 18, '12*', 36, '4-47'
FROM public.players WHERE slug = 'haneef-shaik'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, 'Career', 2, 15, '15*', 4, '3-25'
FROM public.players WHERE slug = 'anvesh-choudary-mannuru'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, 'Career', 3, 8, '4', 3, '2-22'
FROM public.players WHERE slug = 'yashwanth'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, 'Career', 2, 7, '4', 0, '-'
FROM public.players WHERE slug = 'hanu-k'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, 'Career', 5, 6, '5', 6, '3-14'
FROM public.players WHERE slug = 'madhu-yellanur'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, 'Career', 8, 4, '2', 6, '2-13'
FROM public.players WHERE slug = 'raja-mouli-yadavalli'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, 'Career', 3, 4, '2', 0, '-'
FROM public.players WHERE slug = 'banu-chand-kandukuri'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, 'Career', 1, 2, '2*', 0, '-'
FROM public.players WHERE slug = 'sharan-bezawada'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
INSERT INTO public.player_stats (player_id, season, matches_played, runs, highest_score, wickets, best_bowling)
SELECT id, 'Career', 3, 0, '0', 1, '1-13'
FROM public.players WHERE slug = 'anshuman-singh-baghel'
ON CONFLICT (player_id, season) DO UPDATE SET matches_played = EXCLUDED.matches_played, runs = EXCLUDED.runs, highest_score = EXCLUDED.highest_score, wickets = EXCLUDED.wickets, best_bowling = EXCLUDED.best_bowling;
