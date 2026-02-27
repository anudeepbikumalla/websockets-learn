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

// =====================================================================
// AI CHATBOX - Simple and Reliable
// =====================================================================
(function initAIChatbox(){
  // Inject styles
  const styles = document.createElement('style');
  styles.textContent = `
    #lessonChatBtn {
      position: fixed;
      right: 20px;
      bottom: 20px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #7c3aed, #5b21b6);
      color: white;
      border: 2px solid white;
      font-size: 28px;
      cursor: pointer;
      z-index: 10000;
      box-shadow: 0 4px 20px rgba(124, 58, 237, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }
    #lessonChatBtn:hover {
      transform: scale(1.15);
      box-shadow: 0 6px 30px rgba(124, 58, 237, 0.6);
    }
    #lessonChatPanel {
      position: fixed;
      right: 20px;
      bottom: 90px;
      width: 400px;
      height: 550px;
      background: #ffffff;
      border-radius: 15px;
      box-shadow: 0 10px 50px rgba(0, 0, 0, 0.2);
      display: none;
      flex-direction: column;
      z-index: 10000;
      border: 1px solid #e5e7eb;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    #lessonChatPanel.show { display: flex; }
    #lessonChatHeader {
      padding: 16px;
      background: linear-gradient(135deg, #7c3aed, #5b21b6);
      color: white;
      font-weight: 700;
      font-size: 16px;
      border-radius: 15px 15px 0 0;
    }
    #lessonChatMessages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .msgItem {
      padding: 12px 14px;
      border-radius: 10px;
      word-wrap: break-word;
      line-height: 1.5;
      font-size: 14px;
      max-width: 90%;
    }
    .msgUser {
      align-self: flex-end;
      background: #7c3aed;
      color: white;
      border-radius: 10px 0 10px 10px;
    }
    .msgBot {
      align-self: flex-start;
      background: #f3f4f6;
      color: #1f2937;
      border-radius: 0 10px 10px 10px;
    }
    #lessonChatInput {
      padding: 14px 16px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      gap: 10px;
      align-items: center;
    }
    #lessonChatInput input {
      flex: 1;
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 14px;
      font-family: inherit;
      outline: none;
    }
    #lessonChatInput input:focus {
      border-color: #7c3aed;
      box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
    }
    #lessonChatSendBtn {
      padding: 10px 16px;
      background: #7c3aed;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.2s;
    }
    #lessonChatSendBtn:hover { background: #6d28d9; }
  `;
  document.head.appendChild(styles);

  const KB = {
    addEventListener: {
      explanation: "addEventListener() allows you to attach multiple event listeners to the same element. Each listener is stored separately, so you can add and remove them independently without affecting others.",
      pros: ["Multiple listeners per event", "Remove listeners individually with removeEventListener()", "Non-destructive - doesn't overwrite existing handlers", "Standard DOM pattern used everywhere"],
      cons: ["More verbose syntax", "Must keep references to handlers if you want to remove them later"],
      when: "Use this for production code, complex apps, and when you need fine control over event handling",
      example: "element.addEventListener('click', handler1);\nelement.addEventListener('click', handler2);\n// Both handlers fire!"
    },
    onmessage: {
      explanation: "onmessage is a direct property assignment. You set ws.onmessage = function() { }. Simple but limited - assigning a new function overwrites the previous one.",
      pros: ["Very simple syntax", "Easy for quick demos and learning"],
      cons: ["Only ONE handler allowed", "New assignment destroys old handler", "Not production-ready"],
      when: "Use this for quick prototypes and learning. NOT for real applications.",
      example: "ws.onmessage = (event) => console.log(event.data);"
    },
    callback: {
      explanation: "Callbacks are functions passed as arguments to other functions. Called with (error, result) pattern. Traditional Node.js style but can lead to 'callback hell'.",
      pros: ["Universal pattern", "Works everywhere", "Simple to understand initially"],
      cons: ["Deeply nested callbacks become hard to read", "Error handling is manual", "Difficult to debug"],
      when: "Used in legacy code and some APIs, but async/await is preferred now",
      example: "function load(url, callback) {\n  // ...get data\n  callback(null, data);\n}"
    },
    async: {
      explanation: "async/await is modern JavaScript for handling asynchronous operations with Promises. Reads like synchronous code but is actually async. Uses try/catch for errors.",
      pros: ["Reads like regular code", "Try/catch error handling", "Much easier to chain operations", "Cleaner than callbacks and .then()"],
      cons: ["Requires caller to be async too", "Slightly more overhead"],
      when: "Use this for modern JavaScript. It's the current best practice.",
      example: "async function load(url) {\n  try {\n    const data = await fetch(url);\n    return data;\n  } catch(e) { console.error(e); }\n}"
    },
    joinroom: {
      explanation: "joinRoom is a pattern where you store clients in a Map<roomName, Set<WebSocket>>. When a client joins a room, you add their socket to that room's set.",
      pros: ["Targeted broadcasts save bandwidth", "Flexible - clients can be in multiple rooms", "Simple to implement"],
      cons: ["Need cleanup when clients disconnect", "Memory management for large rooms"],
      when: "Use this in chat apps, online games, collaborative tools - anywhere you need group messaging",
      example: "const rooms = new Map();\nfunction joinRoom(ws, roomName) {\n  if (!rooms.has(roomName)) rooms.set(roomName, new Set());\n  rooms.get(roomName).add(ws);\n}"
    },
    broadcast: {
      explanation: "Broadcasting sends a message to all clients in a room. Loop through the room's Set and send to each socket if readyState is OPEN.",
      pros: ["Simple implementation", "Works for announcements"],
      cons: ["Inefficient if naive (sends to disconnected sockets)", "Can overload bandwidth"],
      when: "Use after implementing rooms. Always check readyState before sending.",
      example: "rooms.get(roomName).forEach(client => {\n  if (client.readyState === WebSocket.OPEN) {\n    client.send(JSON.stringify(msg));\n  }\n});"
    },
    reconnect: {
      explanation: "Reconnection logic uses exponential backoff to retry connections. Starts with short delays, then increases to prevent server overload.",
      pros: ["Prevents thundering herd problem", "Better UX with automatic recovery", "Configurable backoff strategy"],
      cons: ["Complex with expiring auth tokens", "Must cap max retries"],
      when: "Use when you need resilient connections that survive network hiccups",
      example: "function reconnect(attempt = 0) {\n  const delay = Math.min(1000 * Math.pow(2, attempt), 30000);\n  setTimeout(() => { ws = new WebSocket(url); }, delay);\n}"
    },
    auth: {
      explanation: "WebSocket auth passes a JWT token in the URL query string: ws://server.com?token=xyz. Always use wss:// (secure) in production because URLs leak in logs.",
      pros: ["Works without HTTP headers", "Simple to implement"],
      cons: ["Tokens visible in logs if not using wss://", "URL not meant for sensitive data", "Must use TLS in production"],
      when: "Use for APIs that don't support header auth. Always use wss:// and short-lived tokens.",
      example: "const token = getToken();\nconst ws = new WebSocket(`wss://server.com/ws?token=${token}`);"
    },
    getwsurl: {
      explanation: "getWsUrl() is a helper that returns the correct WebSocket URL based on page protocol. Returns ws:// for HTTP, wss:// for HTTPS.",
      pros: ["Centralizes URL logic", "Supports custom overrides via localStorage", "Works in all deployment scenarios"],
      cons: ["If default wrong, all lessons fail", "Must sync with server port"],
      when: "Use in all WebSocket clients to handle protocol detection automatically",
      example: "function getWsUrl(port = 8082) {\n  const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';\n  return protocol + 'localhost:' + port;\n}"
    },
    map: {
      explanation: "Map is a JavaScript data structure for key-value pairs. Unlike objects, maps preserve insertion order and allow any value as a key.",
      pros: ["Better than plain objects for dynamic keys", "Built-in iteration", "Clear key-value semantics"],
      cons: ["Slightly slower than objects", "Less compatible with old browsers"],
      when: "Use Map for rooms, user sessions, or anything with dynamic string keys",
      example: "const rooms = new Map();\nrooms.set('general', new Set());\nrooms.set('gaming', new Set());"
    },
    set: {
      explanation: "Set is a collection of unique values. Perfect for storing unique WebSocket connections in a room.",
      pros: ["Guaranteed uniqueness", "Fast add/has/delete operations", "Perfect for storing connections"],
      cons: ["Unordered", "Can't index like arrays"],
      when: "Use Set to store unique connections in each room",
      example: "const generalRoom = new Set();\ngeneralRoom.add(ws1);\ngeneralRoom.add(ws2);"
    }
  };

  function findAnswer(query) {
    const q = query.toLowerCase();
    
    // Find matching topic
    let topic = null;
    for (const [key, value] of Object.entries(KB)) {
      if (q.includes(key.toLowerCase())) {
        topic = { key, value };
        break;
      }
    }
    
    if (!topic) {
      return "I'm not sure about that topic. Try asking about: addEventListener, onmessage, callbacks, async, joinroom, broadcast, reconnect, auth, getwsurl, map, or set.";
    }
    
    const { key, value } = topic;
    
    // Detect what type of answer they want
    if (q.includes('pro') || q.includes('advantage') || q.includes('benefit') || q.includes('good')) {
      return `✅ **Pros of ${key}:**\n${value.pros.map(p => '• ' + p).join('\n')}`;
    }
    
    if (q.includes('con') || q.includes('disadvantage') || q.includes('problem') || q.includes('bad') || q.includes('issue')) {
      return `⚠️ **Cons of ${key}:**\n${value.cons.map(c => '• ' + c).join('\n')}`;
    }
    
    if (q.includes('example') || q.includes('code') || q.includes('show')) {
      return `📝 **Example of ${key}:**\n\`\`\`javascript\n${value.example}\n\`\`\``;
    }
    
    if (q.includes('when') || q.includes('use') || q.includes('apply')) {
      return `🎯 **When to use ${key}:**\n${value.when}`;
    }
    
    // Default: return full answer
    return `📖 **${key}:**\n${value.explanation}\n\n✅ **Pros:** ${value.pros.join(', ')}\n\n⚠️ **Cons:** ${value.cons.join(', ')}\n\n🎯 **When:** ${value.when}`;
  }

  function init() {
    const btn = document.createElement('button');
    btn.id = 'lessonChatBtn';
    btn.textContent = '💬';

    const panel = document.createElement('div');
    panel.id = 'lessonChatPanel';

    const header = document.createElement('div');
    header.id = 'lessonChatHeader';
    header.textContent = '💡 Lesson Assistant';

    const msgs = document.createElement('div');
    msgs.id = 'lessonChatMessages';

    const botMsg = document.createElement('div');
    botMsg.className = 'msgItem msgBot';
    botMsg.textContent = 'Hi! Ask me about WebSocket patterns. Examples: "addEventListener", "async/await", "joinroom"';
    msgs.appendChild(botMsg);

    const input = document.createElement('div');
    input.id = 'lessonChatInput';

    const inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.placeholder = 'Ask anything...';

    const sendBtn = document.createElement('button');
    sendBtn.id = 'lessonChatSendBtn';
    sendBtn.textContent = 'Send';

    input.appendChild(inputField);
    input.appendChild(sendBtn);

    panel.appendChild(header);
    panel.appendChild(msgs);
    panel.appendChild(input);

    document.body.appendChild(btn);
    document.body.appendChild(panel);

    btn.addEventListener('click', () => {
      panel.classList.toggle('show');
      if (panel.classList.contains('show')) inputField.focus();
    });

    function sendMessage() {
      const text = inputField.value.trim();
      if (!text) return;

      const userMsg = document.createElement('div');
      userMsg.className = 'msgItem msgUser';
      userMsg.textContent = text;
      msgs.appendChild(userMsg);

      inputField.value = '';
      msgs.scrollTop = msgs.scrollHeight;

      setTimeout(() => {
        const reply = findAnswer(text);
        const botMsg = document.createElement('div');
        botMsg.className = 'msgItem msgBot';
        botMsg.textContent = reply;
        msgs.appendChild(botMsg);
        msgs.scrollTop = msgs.scrollHeight;
      }, 200);
    }

    sendBtn.addEventListener('click', sendMessage);
    inputField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  }

  if (document.body) {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
