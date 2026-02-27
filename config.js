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

// AI Chat - powered by real AI on the backend
  // No predefined values - genuine responses from AI model

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

    async function sendMessage() {
      const text = inputField.value.trim();
      if (!text) return;

      // Show user message
      const userMsg = document.createElement('div');
      userMsg.className = 'msgItem msgUser';
      userMsg.textContent = text;
      msgs.appendChild(userMsg);

      inputField.value = '';
      msgs.scrollTop = msgs.scrollHeight;

      try {
        // Call real AI API on backend
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: text })
        });

        const data = await response.json();
        
        // Show bot response
        const botMsg = document.createElement('div');
        botMsg.className = 'msgItem msgBot';
        botMsg.textContent = data.response || 'No response from AI';
        msgs.appendChild(botMsg);
        msgs.scrollTop = msgs.scrollHeight;
      } catch (error) {
        const errMsg = document.createElement('div');
        errMsg.className = 'msgItem msgBot';
        errMsg.textContent = '❌ Error connecting to AI: ' + error.message;
        errMsg.style.color = '#dc2626';
        msgs.appendChild(errMsg);
        msgs.scrollTop = msgs.scrollHeight;
      }
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
