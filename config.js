// Arches Cricket Club Website Configuration
const CONFIG = {
  // Replace this with your Google Apps Script Web App URL after deploying the custom script.
  SCRIPT_URL: "https://script.google.com/macros/s/AKfycbxPJ6QsCUfQQImmSjKEbAo7w7vuV6WDeVbQ4Tb8qphoNeBya031nv_jNDGzt9Bay2Lljw/exec",

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
        // If Google Apps Script returns plain text "Success", convert to standard response format
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
