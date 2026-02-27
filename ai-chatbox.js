// ai-chatbox.js — lightweight local assistant for lesson explanations
(function(){
  'use strict';
  
  try {
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

    // Markup
    const btn = document.createElement('button'); 
    btn.id = 'aiChatBtn'; 
    btn.title = 'Ask the lesson assistant'; 
    btn.textContent = '💬';
    
    const panel = document.createElement('div'); 
    panel.id = 'aiChatPanel';
    panel.innerHTML = `<div id="aiChatHeader">Lesson Assistant 💡</div>
      <div id="aiChatBody"><div class="aiMsg bot">👋 Hi! Select code in the lesson and click "Explain Selection", or type a question like "Explain addEventListener" or "Pros and cons of callbacks"</div></div>
      <div id="aiChatInputWrap"><input id="aiChatInput" placeholder="Ask about code..." /><button id="aiExplainSel">Explain Selection</button></div>`;
    
    document.body.appendChild(btn); 
    document.body.appendChild(panel);

    const body = panel.querySelector('#aiChatBody');
    const input = panel.querySelector('#aiChatInput');
    const explainSelBtn = panel.querySelector('#aiExplainSel');

    btn.addEventListener('click', () => { 
      panel.classList.toggle('show'); 
      if (panel.classList.contains('show')) {
        input.focus(); 
      }
    });

    function appendMessage(text, who='bot'){
      const d = document.createElement('div'); 
      d.className = 'aiMsg ' + (who==='bot' ? 'bot' : 'user'); 
      d.textContent = text; 
      body.appendChild(d); 
      body.scrollTop = body.scrollHeight; 
    }

    // Knowledge base — explanations + pros/cons
    const KB = {
      'addEventListener': {
        title: 'addEventListener / .on()',
        text: 'Registers one or more handlers for the same event. Can add multiple listeners. Preferred for modular code.',
        pros: ['Multiple listeners per event', 'Can removeEventListener() individually', 'Standard DOM/Node pattern'],
        cons: ['Slightly more verbose', 'Must track references to remove']
      },
      'onmessage': {
        title: 'ws.onmessage / onopen (direct properties)',
        text: 'Assigns a single handler to an event property. Simple syntax but overwrites previous handler.',
        pros: ['Shorter syntax', 'Easy for quick demos'],
        cons: ['Only ONE handler per event', 'New assignment overwrites old']
      },
      'callbacks': {
        title: 'Callbacks (callback(err, result))',
        text: 'Traditional Node.js pattern. Function passed to be called when async work completes.',
        pros: ['Simple and universal', 'Compatible with old APIs'],
        cons: ['Nested callbacks (callback hell)', 'Manual error handling']
      },
      'async/await': {
        title: 'Async/Await / Promises',
        text: 'Modern pattern using Promises. Reads top-to-bottom. Uses try/catch for errors.',
        pros: ['Very readable', 'Easy error handling with try/catch', 'Good for chaining ops'],
        cons: ['Requires Promise-aware code', 'Must mark callers async']
      },
      'joinroom': {
        title: 'joinRoom / rooms Map pattern',
        text: 'Use Map of roomName → Set<WebSocket>. Add sockets to Sets on join, remove on disconnect.',
        pros: ['Targeted broadcasts save bandwidth', 'Simple and flexible', 'One socket in many rooms'],
        cons: ['Needs cleanup on disconnect', 'Large rooms need memory management']
      },
      'broadcast': {
        title: 'broadcastRoom / wss.clients',
        text: 'Send messages to selected sockets. Always check readyState === OPEN before sending.',
        pros: ['Simple delivery to many', 'Works for announcements'],
        cons: ['Naive broadcast wastes bandwidth', 'Must filter carefully']
      },
      'reconnect': {
        title: 'Auto-reconnect / Exponential backoff',
        text: 'Use exponential backoff to avoid thundering reconnection. Cap retries. Provide user feedback.',
        pros: ['Prevents server overload', 'Improves UX with auto-retry'],
        cons: ['Avoid infinite loops', 'Complex with expiring auth tokens']
      },
      'auth': {
        title: 'Auth (tokens in URL / wss)',
        text: 'Pass short-lived JWT in query string. Always use wss:// in production because URL tokens may leak in logs.',
        pros: ['Works where headers unsupported', 'Simple to implement'],
        cons: ['Tokens in URL may leak', 'Must use TLS (wss://) in production']
      },
      'getwsurl': {
        title: 'getWsUrl() helper',
        text: 'Resolves ws/wss URL for client. Respects custom overrides. Uses wss when page is https.',
        pros: ['Centralizes URL logic', 'Supports custom overrides'],
        cons: ['If default wrong, all lessons fail', 'Keep updated when port changes']
      },
      'map': {
        title: 'Map data structure',
        text: 'JavaScript Map stores key-value pairs. Perfect for rooms (key=roomName, value=Set of WebSockets).',
        pros: ['Ordered key-value storage', 'Better than plain object for dynamic keys'],
        cons: ['Less compatible with old browsers', 'Slightly slower than objects']
      },
      'set': {
        title: 'Set data structure',
        text: 'JavaScript Set stores unique values. Perfect for tracking unique WebSocket connections in a room.',
        pros: ['Auto-handles uniqueness', 'Fast lookup/deletion'],
        cons: ['Unordered', 'Not directly iterable in order']
      }
    };

    function findKnowledge(text){
      if (!text) return [];
      const t = (text || '').toLowerCase();
      const hits = [];
      Object.keys(KB).forEach(k => { 
        if (t.includes(k) || t.includes(k.replace(/\W/g,''))) {
          hits.push(KB[k]); 
        }
      });
      return hits;
    }

    function generateReply(input){
      if (!input || !input.trim()) {
        return "Select code or type a function name (e.g. 'addEventListener', 'joinRoom', 'async/await')";
      }
      const sel = input.trim();
      const hits = findKnowledge(sel);
      if (hits.length) {
        let out = '';
        hits.forEach(h => {
          out += `🎯 **${h.title}**\n${h.text}\n\n✅ Pros: ${h.pros.join(', ')}\n\n❌ Cons: ${h.cons.join(', ')}\n\n---\n`;
        });
        return out;
      }
      // Heuristic matching
      if (/getWsUrl|new WebSocket|ws\.|addEventListener|onmessage|joinRoom|broadcastRoom|callback|Promise|jwt|token|wss:|Map|Set/.test(sel)){
        const possible = [];
        if (/getWsUrl|wss:|new WebSocket/.test(sel)) possible.push(KB['getwsurl']);
        if (/addEventListener|onmessage|ws\./.test(sel)) possible.push(KB['addeventlistener'] || KB['addEventListener']);
        if (/joinRoom|rooms|map/.test(sel)) { possible.push(KB['joinroom']); possible.push(KB['map']); }
        if (/broadcast|wss\.clients/.test(sel)) possible.push(KB['broadcast']);
        if (/callback/.test(sel)) possible.push(KB['callbacks']);
        if (/Promise|async|await/.test(sel)) possible.push(KB['async/await']);
        if (/jwt|token|auth/.test(sel)) possible.push(KB['auth']);
        if (/set|Set/.test(sel)) possible.push(KB['set']);
        const filtered = possible.filter(Boolean).filter((v, i, a) => a.indexOf(v) === i); // dedupe
        if (filtered.length){
          return filtered.map(h => `🎯 **${h.title}**\n${h.text}\n\n✅ Pros: ${h.pros.join(', ')}\n\n❌ Cons: ${h.cons.join(', ')}`).join('\n\n---\n');
        }
      }
      return "Try a simpler question: 'Explain addEventListener' or 'Pros and cons of callbacks vs async/await'";
    }

    // User actions
    input.addEventListener('keydown', (e)=>{
      if (e.key === 'Enter'){
        const txt = input.value.trim(); 
        if (!txt) return;
        appendMessage(txt, 'user'); 
        input.value = '';
        setTimeout(()=>{ 
          const reply = generateReply(txt);
          appendMessage(reply, 'bot'); 
        }, 100);
      }
    });

    explainSelBtn.addEventListener('click', ()=>{
      const sel = (window.getSelection && window.getSelection().toString()) || '';
      if (!sel) { 
        appendMessage('❌ Select some code or text first'); 
        return; 
      }
      appendMessage(sel.substring(0, 100) + (sel.length > 100 ? '...' : ''), 'user'); 
      setTimeout(()=>{ 
        const reply = generateReply(sel);
        appendMessage(reply, 'bot'); 
      }, 100);
    });

    // Add "Explain" button on code blocks on hover
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
        appendMessage(text.substring(0, 100) + (text.length > 100 ? '...' : ''), 'user'); 
        setTimeout(()=>{ 
          const reply = generateReply(text);
          if (!panel.classList.contains('show')) panel.classList.add('show');
          appendMessage(reply, 'bot'); 
        }, 100); 
      });
      el.style.position = 'relative';
      el.appendChild(b); 
      el.__explainBtn = b;
      el.addEventListener('mouseleave', ()=>{ 
        if (el.__explainBtn){ 
          el.__explainBtn.remove(); 
          el.__explainBtn = null; 
        } 
      }, {once:true});
    });

  } catch (err) {
    console.error('AI Chatbox error:', err);
  }
})();
