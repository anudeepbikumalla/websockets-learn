// ai-chatbox.js — lightweight local assistant for lesson explanations
(function(){
  // Styles
  const css = `
  #aiChatBtn{position:fixed;right:20px;bottom:20px;width:56px;height:56px;border-radius:50%;background:#7c3aed;color:#fff;border:none;box-shadow:0 6px 18px rgba(124,58,237,0.24);cursor:pointer;font-size:22px;z-index:9999}
  #aiChatPanel{position:fixed;right:20px;bottom:88px;width:360px;max-height:60vh;background:#0b1220;color:#e6eef8;border-radius:12px;box-shadow:0 12px 36px rgba(2,6,23,0.6);overflow:hidden;display:flex;flex-direction:column;font-family:Inter, sans-serif;z-index:9999}
  #aiChatHeader{padding:12px 14px;background:linear-gradient(90deg,#7c3aed,#0284c7);color:#fff;font-weight:700}
  #aiChatBody{padding:12px;flex:1;overflow:auto;font-size:.9rem}
  .aiMsg{margin-bottom:10px;padding:8px 10px;border-radius:8px}
  .aiMsg.user{background:#152431;color:#cfe8ff;align-self:flex-end}
  .aiMsg.bot{background:#071025;color:#e6eef8}
  #aiChatInputWrap{display:flex;padding:10px;border-top:1px solid rgba(255,255,255,0.03);gap:8px}
  #aiChatInput{flex:1;padding:8px 10px;border-radius:8px;border:1px solid rgba(255,255,255,0.06);background:transparent;color:#dbeafe}
  #aiExplainSel{background:#fff;border:none;padding:6px 8px;border-radius:8px;cursor:pointer}
  `;
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  // Markup
  const btn = document.createElement('button'); btn.id = 'aiChatBtn'; btn.title = 'Ask the lesson assistant'; btn.textContent = '💬';
  const panel = document.createElement('div'); panel.id = 'aiChatPanel'; panel.style.display = 'none';
  panel.innerHTML = `<div id="aiChatHeader">Lesson Assistant — Ask about examples, features, pros/cons</div>
    <div id="aiChatBody"><div class="aiMsg bot">Hi — select code or type a question, then press Enter. Try: "Explain joinRoom" or select a code block and click Explain Selection.</div></div>
    <div id="aiChatInputWrap"><input id="aiChatInput" placeholder="Ask about WebSocket code or features..." /><button id="aiExplainSel">Explain Selection</button></div>`;
  document.body.appendChild(btn); document.body.appendChild(panel);

  const body = panel.querySelector('#aiChatBody');
  const input = panel.querySelector('#aiChatInput');
  const explainSelBtn = panel.querySelector('#aiExplainSel');

  btn.addEventListener('click', () => { panel.style.display = panel.style.display === 'none' ? 'flex' : 'none'; if (panel.style.display !== 'none') input.focus(); });

  function appendMessage(text, who='bot'){
    const d = document.createElement('div'); d.className = 'aiMsg ' + (who==='bot' ? 'bot' : 'user'); d.innerHTML = text; body.appendChild(d); body.scrollTop = body.scrollHeight; }

  // Knowledge base (canned) — explanations + pros/cons
  const KB = {
    'addEventListener': {
      title: 'addEventListener / .on()',
      text: 'Registers one or more handlers for the same event. Preferred for modular code and when multiple listeners are needed. Works both in browser and Node EventEmitter contexts.',
      pros: ['Multiple listeners per event', 'Can remove specific listener', 'Composable for larger apps'],
      cons: ['Slightly more verbose than direct property', 'Needs references to remove specific listener']
    },
    'onmessage': {
      title: 'ws.onmessage / onopen (direct properties)',
      text: 'Assigns a single handler to an event property. Simpler syntax but overwrites any previous handler.',
      pros: ['Shorter syntax', 'Easy for quick demos'],
      cons: ['Only one handler allowed', 'Less flexible for complex apps']
    },
    'callbacks': {
      title: 'Callbacks (callback(err, result))',
      text: 'Traditional Node.js pattern where a function is passed to be called when async work completes.',
      pros: ['Simple and universal', 'Compatible with old APIs'],
      cons: ['Nested callbacks (callback hell)', 'Manual error handling everywhere']
    },
    'async/await': {
      title: 'Async/Await / Promises',
      text: 'Modern pattern using Promises; code reads top-to-bottom and uses try/catch for errors.',
      pros: ['Readable', 'Easy error handling with try/catch', 'Good for chaining async ops'],
      cons: ['Requires Promise-aware code', 'Must mark callers async when using await']
    },
    'joinroom': {
      title: 'joinRoom / rooms Map pattern',
      text: 'Use a Map of roomName → Set<WebSocket> to store memberships. Add sockets to Sets on join and remove on disconnect.',
      pros: ['Targeted broadcasts reduce bandwidth', 'Simple to implement', 'Flexible (one socket in many rooms)'],
      cons: ['Needs cleanup on disconnect', 'Large numbers of rooms require memory management']
    },
    'broadcast': {
      title: 'broadcastRoom / wss.clients',
      text: 'Broadcast loops send messages to selected sockets. Always check readyState === OPEN before sending.',
      pros: ['Simple delivery to many clients', 'Works for announcements'],
      cons: ['Naive broadcast to all clients wastes bandwidth', 'Must filter recipients carefully']
    },
    'reconnect': {
      title: 'Auto-reconnect / Exponential backoff',
      text: 'Use exponential backoff to avoid thundering reconnection storms. Cap retries and provide user feedback.',
      pros: ['Prevents overload', 'Improves UX by retrying automatically'],
      cons: ['Must avoid infinite loops', 'Complex when dealing with auth tokens that expire']
    },
    'auth': {
      title: 'Auth (tokens in URL / wss)',
      text: 'Pass short-lived tokens in the query string or prefer cookies; use wss:// in production because tokens in URLs are visible in logs.',
      pros: ['Works where headers aren\'t supported', 'Simple to implement'],
      cons: ['Tokens in URL may leak via logs', 'Use TLS (wss://) always in production']
    },
    'getwsurl': {
      title: 'getWsUrl() helper',
      text: 'Resolves a usable ws/wss URL for the client, respects custom URL overrides and page protocol. Use wss when page is https.',
      pros: ['Centralizes URL logic', 'Supports custom overrides via localStorage'],
      cons: ['If default is wrong, all lessons fail — keep updated when server port changes']
    }
  };

  function findKnowledge(text){
    const t = (text || '').toLowerCase();
    const hits = [];
    Object.keys(KB).forEach(k => { if (t.includes(k) || t.includes(k.replace(/\W/g,''))) hits.push(KB[k]); });
    return hits;
  }

  function generateReply(input){
    if (!input || !input.trim()) return "I couldn't find anything to explain — try selecting code or asking about a function name (e.g. 'joinRoom', 'addEventListener').";
    const sel = input.trim();
    const hits = findKnowledge(sel);
    if (hits.length) {
      let out = '';
      hits.forEach(h => {
        out += `<strong>${h.title}</strong><br>${h.text}<br><em>Pros:</em> ${h.pros.join(', ')}<br><em>Cons:</em> ${h.cons.join(', ')}<br><br>`;
      });
      return out;
    }
    // If looks like code, try heuristic matches
    if (/getWsUrl|new WebSocket|ws\.addEventListener|ws\.onmessage|joinRoom|broadcastRoom|processWithCallback|processWithPromise|jwt|token|wss:/.test(sel)){
      // find matching KB keys
      const possible = [];
      if (/getWsUrl|wss:|new WebSocket/.test(sel)) possible.push(KB.getwsurl || KB['getwsurl']);
      if (/addEventListener|onmessage|ws\./.test(sel)) possible.push(KB['addeventlistener'] || KB['addEventListener']);
      if (/joinRoom|rooms/.test(sel)) possible.push(KB['joinroom']);
      if (/broadcast|wss\.clients/.test(sel)) possible.push(KB['broadcast']);
      if (/callback/.test(sel)) possible.push(KB['callbacks']);
      if (/processWithPromise|async|await/.test(sel)) possible.push(KB['async/await']);
      if (/jwt|token/.test(sel)) possible.push(KB['auth']);
      // filter nulls
      const filtered = possible.filter(Boolean);
      if (filtered.length){
        return filtered.map(h => `<strong>${h.title}</strong><br>${h.text}<br><em>Pros:</em> ${h.pros.join(', ')}<br><em>Cons:</em> ${h.cons.join(', ')}<br><br>`).join('\n');
      }
    }
    return "I don't have a direct canned answer for that selection — try a simpler question like 'Explain addEventListener' or 'Pros and cons of async/await vs callbacks'.";
  }

  // User actions
  input.addEventListener('keydown', (e)=>{
    if (e.key === 'Enter'){
      const txt = input.value.trim(); if (!txt) return;
      appendMessage(txt, 'user'); input.value = '';
      setTimeout(()=>{ appendMessage(generateReply(txt), 'bot'); }, 250);
    }
  });

  explainSelBtn.addEventListener('click', ()=>{
    const sel = (window.getSelection && window.getSelection().toString()) || '';
    if (!sel) { appendMessage('Select some code or text first and try Explain Selection.'); return; }
    appendMessage(sel, 'user'); setTimeout(()=>{ appendMessage(generateReply(sel), 'bot'); }, 250);
  });

  // Optional: add small helper to highlight code blocks with "Explain" on hover
  document.addEventListener('mouseover', (e)=>{
    const el = e.target.closest('.code, pre');
    if (!el) return;
    if (el.__explainBtn) return;
    const b = document.createElement('button'); b.textContent = 'Explain in Chat'; b.style.cssText = 'position:absolute;right:8px;top:8px;padding:6px 8px;border-radius:6px;border:none;background:#7c3aed;color:#fff;cursor:pointer;font-size:.72rem;z-index:9999';
    b.addEventListener('click', (ev)=>{ ev.stopPropagation(); const text = el.innerText || el.textContent; appendMessage(text, 'user'); setTimeout(()=>{ appendMessage(generateReply(text), 'bot'); }, 250); });
    el.style.position = 'relative'; el.appendChild(b); el.__explainBtn = b;
    el.addEventListener('mouseleave', ()=>{ if (el.__explainBtn){ el.__explainBtn.remove(); el.__explainBtn = null; } }, {once:true});
  });
})();
