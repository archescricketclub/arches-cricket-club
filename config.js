// Arches Cricket Club Website Configuration
const CONFIG = {
  // Google Apps Script Web App URL for email notifications & backups
  SCRIPT_URL: "https://script.google.com/macros/s/AKfycby6yPpAFHWMxLRI__oo2u5f1zZx1sXGgLQ-VvJ7mgfkBEOC-32_oD-mKOoW4GMXiBsy/exec",

  // ─── CLOUD DATABASE CONFIG (SUPABASE POSTGRESQL) ───
  // Free, secure cloud database preventing duplicate or missing data.
  SUPABASE_URL: "https://lmmdvmjplbvovtzktdyx.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtbWR2bWpwbGJ2b3Z0emt0ZHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwMTQzNDIsImV4cCI6MjEwODU5MDM0Mn0.JQr1_L987leubcRhres4zwG5imwXIN9og52TsRhbDGQ",

  /**
   * Helper to submit payloads to Google Apps Script.
   * Bypasses CORS issues and handles both JSON and plain-text responses.
   */
  submitForm: function(payload) {
    return fetch(this.SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(payload)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error("Network response was not ok (status: " + response.status + ")");
      }
      return response.text();
    })
    .then(text => {
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        const cleanText = text.trim().toLowerCase();
        if (cleanText === 'success' || cleanText.indexOf('success') !== -1) {
          data = { result: 'success' };
        } else {
          data = { result: 'error', error: text };
        }
      }
      return data;
    });
  }
};

window.CONFIG = CONFIG;
