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

  // 2. Default: use localhost with proper protocol (http->ws, https->wss)
  const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
  return `${protocol}localhost:${defaultPort}`;
}

// Expose globally for all learn*.html files
window.getWsUrl = getWsUrl;

// Load AI chatbox helper — with better error handling and fallback
(function loadAIChatbox(){
  try {
    // Only load if DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        const s = document.createElement('script');
        s.src = 'ai-chatbox.js?v=' + Date.now();
        s.async = true;
        s.onerror = function() { console.error('Failed to load ai-chatbox.js'); };
        document.body.appendChild(s);
      });
    } else {
      const s = document.createElement('script');
      s.src = 'ai-chatbox.js?v=' + Date.now();
      s.async = true;
      s.onerror = function() { console.error('Failed to load ai-chatbox.js'); };
      document.body.appendChild(s);
    }
  } catch (e) {
    console.warn('AI chatbox failed to load:', e);
  }
})();
