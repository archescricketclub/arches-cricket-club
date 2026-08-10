/**
 * main.js
 * Core shared JavaScript for Arches Cricket Club website.
 * Handles mobile navigation, scroll effects, and utility functions.
 */

// Mobile Navigation Toggle
function toggleMobileNav() {
  const nav = document.getElementById('mobileNav');
  const hamburger = document.getElementById('hamburger');
  if (nav && hamburger) {
    nav.classList.toggle('open');
    hamburger.classList.toggle('open');
    document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
  }
}

// Close mobile nav when clicking outside
document.addEventListener('click', (e) => {
  const nav = document.getElementById('mobileNav');
  const hamburger = document.getElementById('hamburger');
  if (nav && hamburger) {
    if (nav.classList.contains('open') && !nav.contains(e.target) && !hamburger.contains(e.target)) {
      nav.classList.remove('open');
      hamburger.classList.remove('open');
      document.body.style.overflow = '';
    }
  }
});

// Sticky Navbar Scroll Effect
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (navbar) {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }
}, { passive: true });

// Reveal elements on scroll (Intersection Observer)
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.08 });

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
});

/**
 * Utility function to sanitize HTML strings to prevent XSS
 * @param {string} str - The string to sanitize
 * @returns {string} - The sanitized string
 */
function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Global UI Helper to handle loading and error states in grids
function showLoading(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Loading data...</p>
      </div>
    `;
  }
}

function showError(containerId, message) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = `
      <div class="error-state">
        <i class="fa-solid fa-triangle-exclamation error-icon"></i>
        <div class="error-title">Oops! Something went wrong</div>
        <p class="error-desc">${escapeHTML(message)}</p>
      </div>
    `;
  }
}
