-- ==============================================================================
-- ARCHES CRICKET CLUB — INITIAL DATABASE SEED SCRIPT
-- Populated automatically from existing repository JSON files
-- ==============================================================================

-- 1. SEED PLAYERS (38 members)
INSERT INTO public.players (name, slug, jersey, cap, role)
VALUES ('Wasim SM', 'wasim-sm', '#1', 'WSM1', 'All-Rounder')
ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role)
VALUES ('Anvesh Choudary Mannuru', 'anvesh-choudary-mannuru', '#2', 'AM28', 'All-Rounder')
ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role)
VALUES ('Srini Nadakuditi', 'srini-nadakuditi', '#3', 'SRI3', 'All-Rounder')
ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role)
VALUES ('Hanu K', 'hanu-k', '#4', 'HK04', 'All-Rounder')
ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role)
VALUES ('Madhu Yellanur', 'madhu-yellanur', '#5', 'MY05', 'All-Rounder')
ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role)
VALUES ('Harish C', 'harish-c', '#6', 'HC06', 'All-Rounder')
ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role)
VALUES ('Tulasi Gangadhar Thatavarthi', 'tulasi-gangadhar-thatavarthi', '#7', 'TT07', 'All-Rounder')
ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role)
VALUES ('Harsha Sai', 'harsha-sai', '#8', 'VK18', 'All-Rounder')
ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role)
VALUES ('Venkateswarrao Jyothi', 'venkateswarrao-jyothi', '#9', 'VJ09', 'All-Rounder')
ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role)
VALUES ('Vinay Tummala', 'vinay-tummala', '#10', 'VT10', 'All-Rounder')
ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role)
VALUES ('Kishan Karneedi', 'kishan-karneedi', '#11', 'KK11', 'All-Rounder')
ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role)
VALUES ('Surya Pavan Teja Tummala', 'surya-pavan-teja-tummala', '#14', 'PA14', 'All-Rounder')
ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role)
VALUES ('Vonga Vishnu', 'vonga-vishnu', '#15', 'VV15', 'All-Rounder')
ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role)
VALUES ('Ali Rizwan', 'ali-rizwan', '#16', 'AR69', 'All-Rounder')
ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role)
VALUES ('Vijay Varma', 'vijay-varma', '#17', 'VV17', 'All-Rounder')
ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role)
VALUES ('Raja Mouli Yadavalli', 'raja-mouli-yadavalli', '#18', 'RY18', 'All-Rounder')
ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role)
VALUES ('Asad Murtuza', 'asad-murtuza', '#22', 'AM04', 'All-Rounder')
ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role)
VALUES ('Dushyanth Reddy B', 'dushyanth-reddy-b', '#23', 'DB23', 'All-Rounder')
ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role)
VALUES ('Yonggicho Paul', 'yonggicho-paul', '#25', 'PMY25', 'All-Rounder')
ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role)
VALUES ('Anil Narra', 'anil-narra', '#30', 'AN30', 'All-Rounder')
ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role)
VALUES ('Veerendra Babu Nagari', 'veerendra-babu-nagari', '#44', 'VB44', 'All-Rounder')
ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role)
VALUES ('Chandra Obula Reddy B', 'chandra-obula-reddy-b', '#45', 'CH45', 'All-Rounder')
ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role)
VALUES ('Abhiram Donepudi', 'abhiram-donepudi', '#48', 'AB48', 'All-Rounder')
ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role)
VALUES ('Deepak Sai', 'deepak-sai', '#50', 'AD39', 'All-Rounder')
ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role)
VALUES ('Sarmad Butt', 'sarmad-butt', '#56', 'SB56', 'All-Rounder')
ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role)
VALUES ('Banu Chand Kandukuri', 'banu-chand-kandukuri', '#63', 'KBC63', 'All-Rounder')
ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role)
VALUES ('Arush Nimmagadda', 'arush-nimmagadda', '#72', 'AN72', 'All-Rounder')
ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role)
VALUES ('Kiran Maheswaram', 'kiran-maheswaram', '#75', 'KM75', 'All-Rounder')
ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role)
VALUES ('Haneef Shaik', 'haneef-shaik', '#77', 'HS77', 'All-Rounder')
ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role)
VALUES ('Veera SR Nimmakayala', 'veera-sr-nimmakayala', '#88', 'VN88', 'All-Rounder')
ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role)
VALUES ('Rohit Singh', 'rohit-singh', '#98', 'RS98', 'All-Rounder')
ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role)
VALUES ('Charan Reddy Datla', 'charan-reddy-datla', '#99', 'CR99', 'All-Rounder')
ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role)
VALUES ('Anshuman Singh Baghel', 'anshuman-singh-baghel', '#181', 'ASB18', 'All-Rounder')
ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role)
VALUES ('Yashwanth', 'yashwanth', '#777', 'CY777', 'All-Rounder')
ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role)
VALUES ('Anji Reddy', 'anji-reddy', '#999', 'AR999', 'All-Rounder')
ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role)
VALUES ('Harish Padmanabhuni ', 'harish-padmanabhuni', '#—', 'PH1', 'All-Rounder')
ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role)
VALUES ('Sri', 'sri', '#—', 'SRI', 'All-Rounder')
ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;
INSERT INTO public.players (name, slug, jersey, cap, role)
VALUES ('Jayasurya Sukhavasi', 'jayasurya-sukhavasi', '#TBD', 'JS', 'All-Rounder')
ON CONFLICT (slug) DO UPDATE SET jersey = EXCLUDED.jersey, cap = EXCLUDED.cap;

-- 2. SEED MATCHES (15 matches)
INSERT INTO public.matches (date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('TBD', 'Senior League 3', 'Arches 1st XI', 'Victoria 1st XI', 'Arches 1st XI', 'TBC, TBC', 'completed', 'Victoria 1st XI won by 28 runs', 'Opponent')
ON CONFLICT (date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('TBD', 'Senior League 3', 'Arches 1st XI', 'Arches 1st XI', 'Amigos Belfast 1st XI', 'City of Belfast Playing Fields (Amigos Belfast), Mallusk', 'completed', 'Arches 1st XI won by 113 runs', 'Arches')
ON CONFLICT (date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('SAT 8 AUG', 'Senior League 3', 'Arches 1st XI', 'Dundrum 1st XI', 'Arches 1st XI', 'The Meadow, Dundrum', 'completed', 'Dundrum 1st XI won by 80 runs', 'Opponent')
ON CONFLICT (date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('SUN 2 AUG', 'Senior League 3', 'Arches 1st XI', 'NIMACC 1st XI', 'Arches 1st XI', 'City of Belfast Playing Fields (NIMA), Mallusk', 'completed', 'Arches 1st XI won by 1 wicket', 'Arches')
ON CONFLICT (date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('SUN 2 AUG', 'Senior League 3', 'Arches 1st XI', 'Drumaness Superkings 1st XI', 'Arches 1st XI', 'The Village Ground, Drumaness', 'completed', 'Drumaness Superkings 1st XI won by 37 runs', 'Opponent')
ON CONFLICT (date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('MON 31 AUG', 'Junior League 10', 'Arches 2nd XI', 'Arches 2nd XI', 'Belfast Superkings 3rd XI', 'Londonderry Park, Newtownards', 'completed', 'Arches 2nd XI won by 14 runs', 'Arches')
ON CONFLICT (date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('MON 31 AUG', 'Junior League 10', 'Arches 2nd XI', 'Arches 2nd XI', 'Belfast Superkings 2nd XI', 'TBC, TBC', 'completed', 'Belfast Superkings 2nd XI won by 4 wickets', 'Opponent')
ON CONFLICT (date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('THU 6 AUG', 'Midweek League', 'Arches 1st XI', 'Dunmurry MW2 XI', 'Arches MW XI', 'City of Belfast Playing Fields (Dunmurry), Mallusk', 'completed', 'Dunmurry MW2 XI won by 101 runs', 'Opponent')
ON CONFLICT (date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('WED 29 JUL', 'Midweek League', 'Arches 1st XI', 'Arches MW XI', 'Muckamore MW1 XI', 'Moylena, Muckamore', 'completed', 'Arches MW XI won by 13 runs', 'Arches')
ON CONFLICT (date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('WED 29 JUL', 'Midweek League', 'Arches 1st XI', 'Arches MW XI', 'CSNI MW XI', 'Stormont, Belfast', 'completed', 'Arches MW XI won by 50 runs', 'Arches')
ON CONFLICT (date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('6 SEP 2025', 'Development Cup', 'Arches 2nd XI', 'Amigos Belfast 2nd XI', 'Arches 2nd XI', 'The Green (Upper Ground), Comber', 'completed', 'Arches 2nd XI won by 4 wickets', 'Arches')
ON CONFLICT (date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('2 AUG 2025', 'Development Cup', 'Arches 2nd XI', 'Arches 2nd XI', 'Dunmurry 4th XI', 'TBC, TBC', 'completed', 'Arches 2nd XI won by 58 runs', 'Arches')
ON CONFLICT (date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('16 JUL 2025', 'Development Cup', 'Arches 1st XI', 'Lisburn 5th XI', 'Arches 2nd XI', 'Wallace Park, Lisburn', 'completed', 'Arches 2nd XI won by 4 wickets', 'Arches')
ON CONFLICT (date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('16 JUL 2025', 'Development Cup', 'Arches 1st XI', 'Victoria 3rd XI', 'Arches 2nd XI', 'Victoria Park, Belfast', 'completed', 'Arches 2nd XI won by 7 wickets', 'Arches')
ON CONFLICT (date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;
INSERT INTO public.matches (date_display, league, team, home_team, away_team, venue, status, result, winner)
VALUES ('TBD', 'T20 Shield Cup', 'Arches 1st XI', 'Ards & Donaghadee 1st XI', 'Arches 1st XI', 'Northfield, Donaghadee', 'completed', 'Ards & Donaghadee 1st XI won by 24 runs', 'Opponent')
ON CONFLICT (date_display, home_team, away_team) DO UPDATE SET result = EXCLUDED.result, status = EXCLUDED.status, winner = EXCLUDED.winner;

-- 3. SEED HONOURS BOARD
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2026', NULL, 'five-wickets', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2026', NULL, 'five-wickets', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2026', NULL, 'half-century', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2026', NULL, 'half-century', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2026', NULL, 'half-century', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2026', NULL, 'half-century', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2026', NULL, 'midweek-30', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2026', NULL, 'midweek-30', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2026', NULL, 'midweek-30', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2026', NULL, 'midweek-30', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2026', NULL, 'midweek-30', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2026', NULL, 'midweek-30', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2026', NULL, 'midweek-30', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2026', NULL, 'midweek-30', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2026', NULL, 'half-century', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2026', NULL, 'half-century', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2026', NULL, 'half-century', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2026', NULL, 'half-century', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2026', NULL, 'half-century', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2026', NULL, 'half-century', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2026', NULL, 'midweek-30', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2026', NULL, 'half-century', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2026', NULL, 'half-century', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2026', NULL, 'half-century', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2026', NULL, 'midweek-30', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2026', NULL, 'half-century', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2026', NULL, 'half-century', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2026', NULL, 'half-century', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2026', NULL, 'midweek-30', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2026', NULL, 'midweek-30', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2026', NULL, 'midweek-3w', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2026', NULL, 'midweek-30', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2026', NULL, 'midweek-30', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2026', NULL, 'century', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2026', NULL, 'midweek-30', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2026', NULL, 'midweek-3w', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2026', NULL, 'midweek-30', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2026', NULL, 'midweek-30', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2025', NULL, 'half-century', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2025', NULL, 'five-wickets', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2025', NULL, 'half-century', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2025', NULL, 'five-wickets', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2025', NULL, 'half-century', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2025', NULL, 'half-century', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2025', NULL, 'century', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2025', NULL, 'century', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2025', NULL, 'five-wickets', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2025', NULL, 'century', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2025', NULL, 'half-century', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2025', NULL, 'half-century', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2025', NULL, 'midweek-3w', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2025', NULL, 'midweek-30', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2025', NULL, 'midweek-30', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2025', NULL, 'midweek-30', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2025', NULL, 'midweek-3w', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2025', NULL, 'midweek-3w', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2025', NULL, 'midweek-30', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2025', NULL, 'midweek-3w', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2025', NULL, 'midweek-30', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2025', NULL, 'midweek-30', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2025', NULL, 'midweek-30', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2025', NULL, 'midweek-30', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2025', NULL, 'midweek-3w', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2025', NULL, 'midweek-3w', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2025', NULL, 'midweek-30', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2025', NULL, 'midweek-30', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2025', NULL, 'midweek-30', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2025', NULL, 'midweek-30', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2025', NULL, 'midweek-30', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2025', NULL, 'hat-trick', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;
INSERT INTO public.honours (season, award_name, category, recipient_name, stats_highlight)
VALUES ('2026', NULL, 'half-century', NULL, NULL)
ON CONFLICT (season, award_name, recipient_name) DO NOTHING;

