# Arches Cricket Club — Cloud Database Setup Guide

This guide explains how to activate your **free, always-accessible, secure cloud PostgreSQL database** on **Supabase** in under 3 minutes.

---

## Why Supabase PostgreSQL?
1. **100% Free**: Includes a 500 MB PostgreSQL database, 50,000 active users/month, and 1 GB file storage.
2. **Eliminates Duplicate Data**: Strict database constraints (`UNIQUE(email)`, `UNIQUE(jersey)`, `UNIQUE(date, opponent)`) prevent duplicate registrations or repeated matches.
3. **Always Accessible**: Hosted in the cloud with 99.9% uptime and automatic backups.
4. **Secure (Row Level Security)**: Public visitors can view fixtures and rosters, but member personal emails/phones are protected from public viewing.

---

## 3-Minute Setup Instructions

### Step 1: Create Your Free Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and click **"Start your project"** (Sign in with GitHub or email).
2. Click **"New Project"**.
3. Fill in:
   * **Name**: `arches-cricket-club`
   * **Database Password**: Choose a strong password and save it.
   * **Region**: Choose `Europe (London)` or `Europe (Ireland)`.
   * **Pricing Plan**: Free Tier.
4. Click **"Create new project"** (it takes about 60 seconds to provision).

---

### Step 2: Run the Database Schema & Seed Data
1. In your Supabase project dashboard, click on the **SQL Editor** tab (the `>_` icon on the left sidebar).
2. Click **"New Query"**.
3. Open `database/schema.sql` from your project folder, copy its contents, paste them into the SQL Editor, and click **Run**.
   * *This creates the `players`, `player_stats`, `matches`, `honours`, `registrations`, `contact_messages`, and `gallery` tables with all security policies.*
4. Click **"New Query"** again.
5. Open `database/seed_data.sql`, copy its contents, paste them into the SQL Editor, and click **Run**.
   * *This seeds all existing 38 club players, season matches, and honours into your cloud database.*

---

### Step 3: Connect Your Website
1. In your Supabase dashboard, click the **Settings (gear icon)** at the bottom left -> **API**.
2. Copy:
   * **Project URL** (e.g. `https://xyzabcdefghijklm.supabase.co`)
   * **Project API Keys** -> `anon` `public` (the public key).
3. Open `config.js` in your website folder and paste them:
   ```javascript
   SUPABASE_URL: "https://your-project-id.supabase.co",
   SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   ```
4. Save and deploy! Your website is now powered by a live cloud database.
