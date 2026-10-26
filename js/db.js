/**
 * ARCHES CRICKET CLUB — CLOUD DATABASE & DATA ADAPTER
 * Connects directly to Supabase PostgreSQL when credentials exist in config.js.
 * Automatically falls back to local data/*.json files if cloud keys are not configured yet.
 */

(function (window) {
  'use strict';

  const DB = {
    client: null,

    init: function () {
      if (window.CONFIG && window.CONFIG.SUPABASE_URL && window.CONFIG.SUPABASE_ANON_KEY) {
        if (window.supabase && typeof window.supabase.createClient === 'function') {
          this.client = window.supabase.createClient(window.CONFIG.SUPABASE_URL, window.CONFIG.SUPABASE_ANON_KEY);
          console.log('[DB] Connected to Supabase Cloud Database');
        }
      }
      return this;
    },

    /**
     * Fetch Matches (Fixtures & Results)
     */
    getMatches: async function () {
      if (this.client) {
        try {
          const { data, error } = await this.client
            .from('matches')
            .select('*')
            .order('match_date', { ascending: false });
          if (!error && data) {
            const fixtures = data.filter(m => m.status === 'scheduled');
            const results = data.filter(m => m.status === 'completed');
            return { fixtures, results };
          }
        } catch (err) {
          console.warn('[DB] Supabase query failed, falling back to local JSON:', err);
        }
      }
      // Fallback to local JSON
      const res = await fetch(`data/matches.json?v=${Date.now()}`);
      return await res.json();
    },

    /**
     * Fetch Players Roster & Stats
     */
    getPlayers: async function () {
      if (this.client) {
        try {
          const { data, error } = await this.client
            .from('players')
            .select('*, player_stats(*)')
            .eq('is_active', true)
            .order('name', { ascending: true });
          if (!error && data && data.length > 0) {
            return data;
          }
        } catch (err) {
          console.warn('[DB] Supabase query failed, falling back to local JSON:', err);
        }
      }
      // Fallback to local JSON
      const res = await fetch(`data/roster.json?v=${Date.now()}`);
      return await res.json();
    },

    /**
     * Fetch Honours Board
     */
    getHonours: async function () {
      if (this.client) {
        try {
          const { data, error } = await this.client
            .from('honours')
            .select('*')
            .order('season', { ascending: false });
          if (!error && data && data.length > 0) {
            return data;
          }
        } catch (err) {
          console.warn('[DB] Supabase query failed, falling back to local JSON:', err);
        }
      }
      // Fallback to local JSON
      const res = await fetch(`data/honours.json?v=${Date.now()}`);
      return await res.json();
    },

    /**
     * Submit Club Registration (with anti-duplicate protection)
     */
    registerMember: async function (formData) {
      // 1. If Supabase is active, insert to prevent duplicate email
      if (this.client) {
        try {
          const { data, error } = await this.client
            .from('registrations')
            .insert([{
              full_name: formData.fullName || formData.name,
              email: formData.email,
              phone: formData.phone,
              preferred_role: formData.role || formData.preferredRole,
              experience_level: formData.experience,
              message: formData.message
            }]);
          if (error) {
            if (error.code === '23505') { // Postgres unique_violation error code
              return { result: 'error', error: 'This email is already registered with Arches CC!' };
            }
            throw error;
          }
        } catch (err) {
          console.error('[DB] Registration database error:', err);
        }
      }

      // 2. Also forward to Google Apps Script for immediate notification email
      if (window.CONFIG && typeof window.CONFIG.submitForm === 'function') {
        formData.action = 'register';
        return await window.CONFIG.submitForm(formData);
      }

      return { result: 'success' };
    },

    /**
     * Submit Contact Message
     */
    sendContactMessage: async function (formData) {
      if (this.client) {
        try {
          await this.client
            .from('contact_messages')
            .insert([{
              name: formData.name,
              email: formData.email,
              phone: formData.phone || null,
              subject: formData.subject || 'Website Inquiry',
              message: formData.message
            }]);
        } catch (err) {
          console.error('[DB] Contact database error:', err);
        }
      }

      if (window.CONFIG && typeof window.CONFIG.submitForm === 'function') {
        formData.action = 'contact';
        return await window.CONFIG.submitForm(formData);
      }

      return { result: 'success' };
    }
  };

  // Auto-init on load
  document.addEventListener('DOMContentLoaded', function () {
    DB.init();
  });

  window.DB = DB;

})(window);
