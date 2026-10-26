-- ==============================================================================
-- ARCHES CRICKET CLUB — PRODUCTION CLOUD DATABASE SCHEMA
-- Target Engine: PostgreSQL 15+ (Compatible with Supabase, Neon, AWS RDS)
-- Features: Strict Unique Constraints (Anti-duplication), RLS Security, Auto-timestamps
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. PLAYERS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,                       -- Unique identifier (e.g. 'wasim-sm')
    jersey TEXT,                                     -- e.g. '#1'
    cap TEXT UNIQUE,                                 -- Unique cap number (e.g. 'WSM1')
    role TEXT NOT NULL DEFAULT 'All-Rounder',         -- 'Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'
    batting_style TEXT DEFAULT 'Right-hand bat',
    bowling_style TEXT DEFAULT 'Right-arm medium',
    avatar_url TEXT DEFAULT 'assets/images/placeholder-player.png',
    bio TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_players_slug ON public.players(slug);
CREATE INDEX IF NOT EXISTS idx_players_active ON public.players(is_active);

-- ==============================================================================
-- 3. PLAYER STATS TABLE (Season & Career Statistics)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.player_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
    season TEXT NOT NULL,                            -- e.g. '2025', '2026', 'Career'
    matches_played INT NOT NULL DEFAULT 0,
    innings INT NOT NULL DEFAULT 0,
    runs INT NOT NULL DEFAULT 0,
    highest_score TEXT NOT NULL DEFAULT '0',
    batting_average NUMERIC(6,2) NOT NULL DEFAULT 0.00,
    strike_rate NUMERIC(6,2) NOT NULL DEFAULT 0.00,
    hundreds INT NOT NULL DEFAULT 0,
    fifties INT NOT NULL DEFAULT 0,
    wickets INT NOT NULL DEFAULT 0,
    overs_bowled NUMERIC(6,1) NOT NULL DEFAULT 0.0,
    runs_conceded INT NOT NULL DEFAULT 0,
    bowling_average NUMERIC(6,2) NOT NULL DEFAULT 0.00,
    economy_rate NUMERIC(6,2) NOT NULL DEFAULT 0.00,
    best_bowling TEXT DEFAULT '0/0',
    five_wickets INT NOT NULL DEFAULT 0,
    catches INT NOT NULL DEFAULT 0,
    stumpings INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- Strict Constraint: One stats record per player per season prevents duplicate stats
    CONSTRAINT unique_player_season UNIQUE (player_id, season)
);

CREATE INDEX IF NOT EXISTS idx_player_stats_season ON public.player_stats(season);

-- ==============================================================================
-- 4. MATCHES TABLE (Fixtures & Results)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_date DATE,
    date_display TEXT NOT NULL,                      -- e.g. 'SAT 8 AUG'
    league TEXT NOT NULL DEFAULT 'Senior League 3',  -- 'Senior League 3', 'Junior League 10', etc.
    team TEXT NOT NULL DEFAULT 'Arches 1st XI',      -- 'Arches 1st XI' or 'Arches 2nd XI'
    home_team TEXT NOT NULL,
    away_team TEXT NOT NULL,
    venue TEXT NOT NULL DEFAULT 'TBC',
    status TEXT NOT NULL DEFAULT 'scheduled',        -- 'scheduled', 'completed', 'abandoned', 'tbd'
    result TEXT,                                     -- e.g. 'Arches 1st XI won by 113 runs'
    winner TEXT,                                     -- 'Arches 1st XI', 'Opponent', 'Draw', 'No Result'
    scorecard_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- Strict Constraint: Prevents duplicate match entry on same date between same teams
    CONSTRAINT unique_match UNIQUE (date_display, home_team, away_team)
);

CREATE INDEX IF NOT EXISTS idx_matches_date ON public.matches(match_date);
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);

-- ==============================================================================
-- 5. HONOURS BOARD TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.honours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    season TEXT NOT NULL,                            -- e.g. '2024', '2025'
    award_name TEXT NOT NULL,                        -- e.g. 'Player of the Year', 'Best Batsman'
    category TEXT NOT NULL DEFAULT 'Club',           -- 'Senior', 'Junior', 'Club'
    recipient_name TEXT NOT NULL,
    player_id UUID REFERENCES public.players(id) ON DELETE SET NULL,
    stats_highlight TEXT,                            -- e.g. '542 runs @ 45.16'
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- Strict Constraint: Prevents awarding the same trophy twice to the same person in one year
    CONSTRAINT unique_honour UNIQUE (season, award_name, recipient_name)
);

-- ==============================================================================
-- 6. REGISTRATIONS TABLE (Club Membership Sign-ups)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,                      -- Anti-duplicate: 1 registration per email
    phone TEXT,
    preferred_role TEXT DEFAULT 'All-Rounder',
    experience_level TEXT DEFAULT 'Intermediate',
    previous_club TEXT,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'pending',          -- 'pending', 'contacted', 'approved', 'declined'
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 7. CONTACT MESSAGES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',              -- 'new', 'read', 'replied'
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 8. GALLERY MEDIA TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_url TEXT NOT NULL UNIQUE,
    caption TEXT,
    category TEXT NOT NULL DEFAULT 'matches',        -- 'matches', 'events', 'trophy', 'training'
    season TEXT DEFAULT '2025',
    is_approved BOOLEAN NOT NULL DEFAULT false,      -- Moderation queue
    uploaded_by TEXT DEFAULT 'web_submission',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.honours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ PERMISSIONS (Anyone can view team info on the website)
CREATE POLICY "Allow public read active players" 
    ON public.players FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read player stats" 
    ON public.player_stats FOR SELECT USING (true);

CREATE POLICY "Allow public read matches" 
    ON public.matches FOR SELECT USING (true);

CREATE POLICY "Allow public read honours" 
    ON public.honours FOR SELECT USING (true);

CREATE POLICY "Allow public read approved gallery" 
    ON public.gallery FOR SELECT USING (is_approved = true);

-- PUBLIC INSERT PERMISSIONS (Anyone can submit registrations and contact inquiries)
CREATE POLICY "Allow public insert registrations" 
    ON public.registrations FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert contact messages" 
    ON public.contact_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public submit photos to gallery moderation" 
    ON public.gallery FOR INSERT WITH CHECK (is_approved = false);

-- ADMIN PERMISSIONS (Authenticated admins full control)
CREATE POLICY "Admins full access players" 
    ON public.players FOR ALL TO authenticated USING (true);

CREATE POLICY "Admins full access stats" 
    ON public.player_stats FOR ALL TO authenticated USING (true);

CREATE POLICY "Admins full access matches" 
    ON public.matches FOR ALL TO authenticated USING (true);

CREATE POLICY "Admins full access honours" 
    ON public.honours FOR ALL TO authenticated USING (true);

CREATE POLICY "Admins full access registrations" 
    ON public.registrations FOR ALL TO authenticated USING (true);

CREATE POLICY "Admins full access contact" 
    ON public.contact_messages FOR ALL TO authenticated USING (true);

CREATE POLICY "Admins full access gallery" 
    ON public.gallery FOR ALL TO authenticated USING (true);
