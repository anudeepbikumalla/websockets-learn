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

// Load AI chatbox — embedded directly for reliable initialization
(function initAIChatbox(){
  'use strict';
  
  console.log('🤖 AI Chatbox: Initializing...');
  
  function createChatbox(){
    try {
      console.log('🤖 AI Chatbox: Creating DOM elements...');
      
      // Styles
      const css = `
      #aiChatBtn{position:fixed;right:20px;bottom:20px;width:56px;height:56px;border-radius:50%;background:#7c3aed;color:#fff;border:none;box-shadow:0 6px 18px rgba(124,58,237,0.24);cursor:pointer;font-size:22px;z-index:9999;transition:transform .2s}
      #aiChatBtn:hover{transform:scale(1.1)}
      #aiChatPanel{position:fixed;right:20px;bottom:88px;width:360px;max-height:60vh;background:#0b1220;color:#e6eef8;border-radius:12px;box-shadow:0 12px 36px rgba(2,6,23,0.6);overflow:hidden;display:none;flex-direction:column;font-family:Inter, sans-serif;z-index:9999}
      #aiChatPanel.show{display:flex}
      #aiChatHeader{padding:12px 14px;background:linear-gradient(90deg,#7c3aed,#0284c7);color:#fff;font-weight:700;font-size:.9rem}
      #aiChatBody{padding:12px;flex:1;overflow-y:auto;font-size:.88rem;line-height:1.5}
      .aiMsg{margin-bottom:10px;padding:8px 10px;border-radius:8px;word-wrap:break-word}
      .aiMsg.user{background:#152431;color:#cfe8ff;text-align:right}
      .aiMsg.bot{background:#071025;color:#e6eef8}
      #aiChatInputWrap{display:flex;padding:10px;border-top:1px solid rgba(255,255,255,0.03);gap:8px}
      #aiChatInput{flex:1;padding:8px 10px;border-radius:8px;border:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.02);color:#dbeafe;font-family:Inter;font-size:.8rem}
      #aiChatInput::placeholder{color:rgba(220,230,255,0.4)}
      #aiChatInput:focus{outline:none;border-color:#7c3aed;background:rgba(124,58,237,0.08)}
      #aiExplainSel{background:#7c3aed;border:none;padding:6px 10px;border-radius:8px;cursor:pointer;color:#fff;font-size:.8rem;font-weight:600;white-space:nowrap}
      #aiExplainSel:hover{background:#6d28d9}
      .explainBtn{position:absolute;right:8px;top:8px;padding:4px 8px;border-radius:6px;border:none;background:#7c3aed;color:#fff;cursor:pointer;font-size:.7rem;z-index:9999;transition:background .2s}
      .explainBtn:hover{background:#6d28d9}
      @media(max-width:480px){#aiChatPanel{width:calc(100vw - 40px);bottom:70px}}
      `;
      const style = document.createElement('style'); 
      style.textContent = css; 
      document.head.appendChild(style);

      // Create button
      const btn = document.createElement('button'); 
      btn.id = 'aiChatBtn'; 
      btn.title = 'Ask the lesson assistant'; 
      btn.textContent = '💬';
      
      // Create panel
      const panel = document.createElement('div'); 
      panel.id = 'aiChatPanel';
      panel.innerHTML = `<div id="aiChatHeader">Lesson Assistant 💡</div>
        <div id="aiChatBody"><div class="aiMsg bot">👋 Hi! Select code in the lesson and click "Explain Selection", or type a question like "Explain addEventListener" or "Pros and cons of callbacks"</div></div>
        <div id="aiChatInputWrap"><input id="aiChatInput" placeholder="Ask about code..." /><button id="aiExplainSel">Explain Selection</button></div>`;
      
      document.body.appendChild(btn); 
      document.body.appendChild(panel);
      
      console.log('🤖 AI Chatbox: DOM created, button at bottom-right ✓');

      const body = panel.querySelector('#aiChatBody');
      const input = panel.querySelector('#aiChatInput');
      const explainSelBtn = panel.querySelector('#aiExplainSel');

      // Toggle panel
      btn.addEventListener('click', () => { 
        panel.classList.toggle('show'); 
        if (panel.classList.contains('show')) input.focus(); 
      });

      // Append message to chat
      function appendMessage(text, who='bot'){
        const d = document.createElement('div'); 
        d.className = 'aiMsg ' + (who==='bot' ? 'bot' : 'user'); 
        d.textContent = text; 
        body.appendChild(d); 
        body.scrollTop = body.scrollHeight; 
      }

      // Knowledge base
      const KB = {
        'addEventListener': {title:'addEventListener / .on()',text:'Registers one or more handlers. Preferred for modular code.',pros:['Multiple listeners','Individually removable','Standard DOM/Node pattern'],cons:['More verbose','Must track references']},
        'onmessage': {title:'ws.onmessage / onopen',text:'Single handler via property assignment.',pros:['Short syntax','Easy for demos'],cons:['Only ONE handler','Overwrites previous']},
        'callbacks': {title:'Callbacks',text:'Function passed as argument to be called on completion.',pros:['Simple','Universal'],cons:['Callback hell','Manual errors']},
        'async/await': {title:'Async/Await / Promises',text:'Modern pattern using Promises with try/catch.',pros:['Very readable','Easy errors','Good for chaining'],cons:['Requires Promise-aware code','Callers must be async']},
        'joinroom': {title:'joinRoom / rooms',text:'Map of roomName → Set<WebSocket>.',pros:['Targeted broadcasts','Simple/flexible','One socket in many rooms'],cons:['Cleanup needed','Memory management']},
        'broadcast': {title:'broadcastRoom / wss.clients',text:'Send to selected sockets. Check readyState === OPEN.',pros:['Simple delivery','Works for announcements'],cons:['Wastes bandwidth if naive','Filter carefully']},
        'reconnect': {title:'Auto-reconnect',text:'Exponential backoff to avoid overload.',pros:['Prevents overload','Better UX'],cons:['Avoid infinite loops','Complex with expiring tokens']},
        'auth': {title:'Auth (tokens in URL)',text:'Pass JWT in query. Always use wss:// in production.',pros:['Works without headers','Simple'],cons:['Tokens leak in logs','Must use TLS']},
        'getwsurl': {title:'getWsUrl() helper',text:'Resolves ws/wss URL. Respects overrides. Uses wss when https.',pros:['Centralizes logic','Supports overrides'],cons:['If wrong, all lessons fail','Keep updated']}
      };

      function findKnowledge(text){
        if (!text) return [];
        const t = (text || '').toLowerCase();
        const hits = [];
        Object.keys(KB).forEach(k => { 
          if (t.includes(k)) hits.push(KB[k]); 
        });
        return hits;
      }

      function generateReply(input){
        if (!input || !input.trim()) return "Select code or type a function name like 'addEventListener' or 'joinRoom'";
        const sel = input.trim();
        const hits = findKnowledge(sel);
        if (hits.length) {
          return hits.map(h => `🎯 **${h.title}**\n${h.text}\n\n✅ Pros: ${h.pros.join(', ')}\n\n❌ Cons: ${h.cons.join(', ')}`).join('\n\n---\n');
        }
        return "Try: 'Explain addEventListener' or 'Pros/cons of callbacks'";
      }

      // Input handler
      input.addEventListener('keydown', (e)=>{
        if (e.key === 'Enter'){
          const txt = input.value.trim(); 
          if (!txt) return;
          appendMessage(txt, 'user'); 
          input.value = '';
          setTimeout(()=>appendMessage(generateReply(txt), 'bot'), 100);
        }
      });

      // Explain selection
      explainSelBtn.addEventListener('click', ()=>{
        const sel = (window.getSelection && window.getSelection().toString()) || '';
        if (!sel) return appendMessage('❌ Select some code first'); 
        appendMessage(sel.substring(0, 100) + (sel.length > 100 ? '...' : ''), 'user'); 
        setTimeout(()=>appendMessage(generateReply(sel), 'bot'), 100);
      });

      // Add explain buttons to code blocks
      document.addEventListener('mouseover', (e)=>{
        const el = e.target.closest('.code, pre');
        if (!el || el.__explainBtn) return;
        const b = document.createElement('button'); 
        b.className = 'explainBtn';
        b.textContent = '📖';
        b.title = 'Explain this code';
        b.addEventListener('click', (ev)=>{ 
          ev.stopPropagation(); 
          const text = el.innerText || el.textContent; 
          appendMessage(text.substring(0, 100), 'user'); 
          if (!panel.classList.contains('show')) panel.classList.add('show');
          setTimeout(()=>appendMessage(generateReply(text), 'bot'), 100); 
        });
        el.style.position = 'relative';
        el.appendChild(b); 
        el.__explainBtn = b;
        el.addEventListener('mouseleave', ()=>{ if (el.__explainBtn){ el.__explainBtn.remove(); el.__explainBtn = null; }}, {once:true});
      });
      
      console.log('🤖 AI Chatbox: Ready! Look for the 💬 button at the bottom-right corner');
    } catch (err) {
      console.error('🤖 AI Chatbox error:', err);
    }
  }

  // Create chatbox when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createChatbox);
  } else {
    createChatbox();
  }
})();
