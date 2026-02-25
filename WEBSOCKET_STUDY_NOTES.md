# 📚 WebSocket Study Notes
> Created: Feb 25, 2026 | Your personal reference guide

---

## 🧠 What is a WebSocket?

| | HTTP (Normal) | WebSocket |
|---|---|---|
| Analogy | 📬 Sending a letter | 📞 A phone call |
| Connection | Opens & closes every request | Stays OPEN |
| Direction | One-way (you ask, server answers) | Two-way (both can talk anytime) |
| Server can message you first? | ❌ No | ✅ Yes |
| Speed | Slower (reconnect each time) | Faster (one connection) |
| Used for | Loading web pages, REST APIs | Chat, games, live data |

**Simple rule**: If data needs to update "live" without you refreshing → use WebSocket.

---

## 🔄 The 4 Lifecycle Events (ALWAYS happen in this order)

```
📞 CONNECT  →  ✅ OPEN  →  💬 SEND/RECEIVE  →  📵 CLOSE
```

### Step 1 — Connect (you dial)
```js
const ws = new WebSocket('ws://localhost:8080');
// This ONE line opens the connection
```

### Step 2 — Open (server picks up)
```js
ws.addEventListener('open', () => {
  console.log('Connected! 🎉');
  // Now you can send messages
});
```

### Step 3 — Send & Receive (talking)
```js
// YOU send to server
ws.send('Hello!');

// Server sends to YOU → this fires automatically
ws.addEventListener('message', (event) => {
  console.log('Server said:', event.data);
});
```

### Step 4 — Close (hang up)
```js
// YOU end the call
ws.close();

// Fires automatically after closing
ws.addEventListener('close', () => {
  console.log('Disconnected 👋');
});
```

### Bonus — Error Event
```js
ws.addEventListener('error', () => {
  console.log('Something went wrong ❌');
});
```

---

## 📋 Quick Reference Cheatsheet

| Code | What it does |
|---|---|
| `new WebSocket(url)` | Open a connection |
| `ws.send('text')` | Send message to server |
| `ws.close()` | Close the connection |
| `ws.readyState` | 0=Connecting, 1=Open, 2=Closing, 3=Closed |
| `addEventListener('open', fn)` | Runs when connected |
| `addEventListener('message', fn)` | Runs when server sends data |
| `addEventListener('close', fn)` | Runs when disconnected |
| `addEventListener('error', fn)` | Runs if connection fails |

---

## 🌍 Real World Apps That Use WebSockets

| App | Why |
|---|---|
| 💬 WhatsApp / Slack | Messages arrive without refreshing |
| 🎮 Online Games | Player positions update in real-time |
| 📈 Stock apps | Prices update live |
| 🤝 Google Docs | See others typing live |
| 🤖 ChatGPT | Streams words to you one by one |

---

## 📁 Your Demo Files

| File | What it is |
|---|---|
| `learn.html` | Lesson 1 — WebSocket Basics |
| `learn2.html` | Lesson 2 — addEventListener vs onmessage |
| `learn3.html` | Lesson 3 — Callbacks vs Async/Await |
| `learn4.html` | Lesson 4 — Mini Project: Live Chat App |
| `client.html` | Advanced demo — all 4 patterns |
| `server.js` | The Node.js WebSocket server |

---

## Lesson 3 — Callbacks vs Async/Await

### Why do we need them?
Some work takes time (e.g. server processing). You need to "wait without freezing" — that's what both of these patterns do.

### 📞 Callbacks (the OLD way)
You pass a function as an argument. That function gets "called back" when the work is done.

```js
function processData(data, callback) {
  setTimeout(() => {
    callback(null, { result: data }); // null = no error
  }, 600);
}

processData("hello", (err, result) => {
  console.log(result); // runs after 600ms
});
```

**Problem — Callback Hell 😱** (when you chain 3+ steps):
```js
getUser("Alice", (err, user) => {
  getOrders(user.id, (err, orders) => {
    getDetails(orders[0], (err, detail) => {
      // 6 levels deep — impossible to read!
    });
  });
});
```

### ✨ Async/Await (the MODERN way)
Use `await` to pause at a line until the result is ready. Reads like normal English!

```js
async function handleMessage(data) {
  try {
    const result = await processData(data); // pauses here
    console.log(result);                    // continues here
  } catch (err) {
    console.log("Error:", err);
  }
}
```

**Same 3 steps, but clean:**
```js
// Callbacks (messy)                // Async/Await (clean)
getUser("Alice", (err, user) => {   const user   = await getUser("Alice");
  getOrders(user.id, ...);          const orders = await getOrders(user.id);
});                                 const detail = await getDetails(orders[0]);
```

### Quick Comparison

| | Callbacks | Async/Await |
|---|---|---|
| Readability | ❌ Nested pyramid | ✅ Flat, top-to-bottom |
| Error handling | Manual `if(err)` everywhere | Clean `try/catch` |
| Chaining | ❌ Callback inside callback | ✅ Just add another `await` |
| Modern? | Old style | ✅ Always use this |

---

## ▶️ How to Run Your Demo

```bash
# In your terminal (project-backend folder):
node server.js

# Then open in browser:
learn4.html     ← Lesson 4 (Mini Project: Live Chat)
learn5.html     ← Lesson 5 (Error Handling & Auto-Reconnect)
client.html     ← Advanced demo (all 4 patterns)
```

---

## Lesson 5 — Error Handling & Auto-Reconnect

### Why connections fail
- Server crashes / restarts
- WiFi drops / phone switches network
- Load balancers kill idle connections after ~60s
- Browser tab goes to sleep

### The 2 events to watch
```js
ws.addEventListener('error', (e) => { /* always followed by 'close' */ });

ws.addEventListener('close', (event) => {
  console.log(event.code);      // why it closed (number)
  console.log(event.wasClean);  // true = intentional, false = crash
});
```

### Close Codes Cheatsheet

| Code | Meaning | Reconnect? |
|---|---|---|
| 1000 | Normal / intentional | ❌ No |
| 1001 | Going away (page nav) | ⚠️ Maybe |
| 1006 | Abnormal (network drop) | ✅ Yes |
| 1011 | Server internal error | ✅ Yes |
| 4000–4999 | Custom app codes | Depends |

### ✅ Production Auto-Reconnect Pattern
```js
let ws, retries = 0, maxRetries = 8, retryTimer = null;

function connect() {
  ws = new WebSocket('ws://localhost:8080');

  ws.addEventListener('open', () => {
    retries = 0;  // reset on success!
  });

  ws.addEventListener('close', (event) => {
    if (event.code === 1000) return;  // intentional — don't reconnect
    if (retries >= maxRetries) return; // gave up

    const delay = Math.min(1000 * 2 ** retries, 30000); // exponential backoff
    retries++;
    retryTimer = setTimeout(connect, delay);
  });
}

connect();
```

### Exponential Backoff delays
| Retry | Formula | Wait |
|---|---|---|
| 1 | 1000 × 2⁰ | 1s |
| 2 | 1000 × 2¹ | 2s |
| 3 | 1000 × 2² | 4s |
| 4 | 1000 × 2³ | 8s |
| 5+ | capped | 30s max |

### Golden Rules
1. **Always use exponential backoff** — never reconnect instantly
2. **Set max retries** (8) — then show user a "refresh" message
3. **Reset counter on success** — `retries = 0` when `open` fires
4. **Don't reconnect on code 1000** — that's intentional
5. **Show "Reconnecting..." UI** — users need feedback
6. **clearTimeout on clean close** — stop retry timers

---

---

## Lesson 6 — Broadcasting

**What is it?** The server forwards one message to every connected client.

### The core loop
```js
wss.clients.forEach((client) => {
  if (client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify({ type: 'broadcast', text: msg }));
  }
});
```
- `wss.clients` — live Set, auto-managed by the server
- Always check `readyState === OPEN` before calling `send()`

### Variants
| Pattern | Code | Used for |
|---|---|---|
| **All clients** | loop over all | announcements, dashboards |
| **Others only** | `if (client !== ws)` | chat (sender sees own msg instantly) |

---

## Lesson 7 — Rooms & Channels

**What are rooms?** A `Map<string, Set<WebSocket>>` on the server.

```js
const rooms = new Map();
function joinRoom(ws, name) {
  if (!rooms.has(name)) rooms.set(name, new Set());
  rooms.get(name).add(ws);
}
function broadcastRoom(name, msg, exclude) {
  rooms.get(name)?.forEach(c => {
    if (c !== exclude && c.readyState === WebSocket.OPEN)
      c.send(JSON.stringify(msg));
  });
}
ws.on('close', () => rooms.forEach(r => r.delete(ws))); // cleanup!
```

### Client-side join
```js
ws.send(JSON.stringify({ type: 'join', room: 'general' }));
ws.send(JSON.stringify({ type: 'message', room: 'general', text: 'Hello!' }));
```

### Rules
- `delete` socket from all rooms on `close`
- Validate room names server-side (don't trust client)
- One client can join many rooms

---

## Lesson 8 — Authentication

**Problem:** WebSocket API can't set custom headers → pass token in URL.

```js
// Client: pass JWT in query string
const ws = new WebSocket(`ws://localhost:8080?token=${token}`);

// Server: read and verify
wss.on('connection', (ws, req) => {
  const { query } = url.parse(req.url, true);
  if (!VALID_TOKENS.has(query.token)) {
    ws.close(4001, 'Unauthorized'); // custom close code!
    return;
  }
  ws.username = getUsernameFromToken(query.token);
});
```

### Custom close codes for auth
| Code | Meaning |
|---|---|
| 4001 | Unauthorized |
| 4002 | Token expired |
| 4003 | Banned |

### Production JWT Flow
1. User POSTs `/api/login` → gets JWT
2. Open `wss://server?token=<JWT>`
3. Server verifies on connection
4. On close code 4001 → redirect to login

### Rules
- Always use `wss://` in production (tokens are in the URL!)
- Keep tokens short-lived (expire in 1 hour)
- Use cookies as alternative (sent automatically by browser)

---

## 📁 All Files

| File | What it is |
|---|---|
| `index.html` | Home hub — all lessons listed |
| `learn.html` | Lesson 1 — WebSocket Basics |
| `learn2.html` | Lesson 2 — addEventListener vs onmessage |
| `learn3.html` | Lesson 3 — Callbacks vs Async/Await |
| `learn4.html` | Lesson 4 — Mini Project: Live Chat |
| `learn5.html` | Lesson 5 — Error Handling & Auto-Reconnect |
| `learn6.html` | Lesson 6 — Broadcasting |
| `learn7.html` | Lesson 7 — Rooms & Channels |
| `learn8.html` | Lesson 8 — Authentication |
| `client.html` | Advanced demo — all 4 patterns |
| `server.js` | Node.js WebSocket server |

**Local path:** `C:\Users\Anudeep\Desktop\project-backend\`
