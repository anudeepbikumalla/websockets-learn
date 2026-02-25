/**
 * theme.js — Dark/Light theme toggle with localStorage persistence
 * Adds a floating toggle button to every page
 */
(function () {
  const STORAGE_KEY = 'ws_hub_theme';

  // CSS variables for light theme — injected dynamically
  const LIGHT_VARS = `
    --bg: #f0f2f5;
    --card: #ffffff;
    --card2: #f8f9fb;
    --card3: #eef1f5;
    --border: #d1d5db;
    --text: #1f2937;
    --dim: #4b5563;
    --muted: #6b7280;
    --blue: #2563eb;
    --green: #16a34a;
    --yellow: #ca8a04;
    --orange: #ea580c;
    --red: #dc2626;
    --purple: #7c3aed;
  `;

  /** Apply the stored theme on page load */
  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
      // Override CSS variables
      root.style.cssText += LIGHT_VARS.replace(/\n/g, '');
      // Fix specific elements
      document.body.style.background = '#f0f2f5';
      document.body.style.color = '#1f2937';
    } else {
      root.removeAttribute('data-theme');
      root.style.cssText = '';
      document.body.style.background = '';
      document.body.style.color = '';
    }
  }

  /** Get stored theme */
  function getTheme() {
    return localStorage.getItem(STORAGE_KEY) || 'dark';
  }

  /** Toggle and persist */
  function toggleTheme() {
    const current = getTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
    updateButton(next);
  }

  /** Update button icon */
  function updateButton(theme) {
    const btn = document.getElementById('theme-toggle-btn');
    if (btn) {
      btn.textContent = theme === 'dark' ? '☀️' : '🌙';
      btn.title = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    }
  }

  /** Create the floating toggle button */
  function createToggle() {
    const btn = document.createElement('button');
    btn.id = 'theme-toggle-btn';
    btn.onclick = toggleTheme;

    // Style the button
    Object.assign(btn.style, {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      border: '2px solid rgba(255,255,255,.15)',
      background: 'rgba(17,24,39,.85)',
      backdropFilter: 'blur(8px)',
      fontSize: '1.3rem',
      cursor: 'pointer',
      zIndex: '9999',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 20px rgba(0,0,0,.3)',
      transition: 'transform .2s, box-shadow .2s',
    });

    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'scale(1.1)';
      btn.style.boxShadow = '0 6px 24px rgba(0,0,0,.4)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'scale(1)';
      btn.style.boxShadow = '0 4px 20px rgba(0,0,0,.3)';
    });

    document.body.appendChild(btn);
    return btn;
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    const theme = getTheme();
    createToggle();
    updateButton(theme);
    applyTheme(theme);
  }

  // Expose globally
  window.WSTheme = { getTheme, toggleTheme, applyTheme };
})();
