/**
 * Centralized WebSocket Configuration (config.js)
 * Handles WebSocket URL resolution for local development.
 */

function getWsUrl(defaultPort = 8082) {
  // 1. Check for user-defined URL in localStorage
  const customUrl = localStorage.getItem('ws_server_url');
  if (customUrl) {
    let url = customUrl.trim();
    if (!url.startsWith('ws://') && !url.startsWith('wss://')) {
      url = (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + url;
    }

    // Ensure port is present if none specified (and no path)
    const urlObj = new URL(url);
    if (!urlObj.port && (urlObj.pathname === '/' || urlObj.pathname === '')) {
      urlObj.port = defaultPort;
      url = urlObj.toString();
    }

    // If Pattern 2 (8081) is requested, route to /p2 path
    if (defaultPort === 8081) {
      const parsed = new URL(url);
      if (parsed.pathname === '/' || parsed.pathname === '') {
        parsed.pathname = '/p2';
      }
      return parsed.toString();
    }
    return url;
  }

  // 2. Default: always use localhost for development
  return `ws://localhost:${defaultPort}`;
}

// Expose globally for all learn*.html files
window.getWsUrl = getWsUrl;

// Load AI chatbox helper (adds a floating assistant to every page that includes config.js)
(function loadAIChatbox(){
  try {
    const s = document.createElement('script');
    s.src = 'ai-chatbox.js';
    s.defer = true;
    document.head.appendChild(s);
  } catch (e) {
    console.warn('AI chatbox failed to load:', e);
  }
})();
