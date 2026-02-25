"""
enhance_lessons.py — Inject beginner-friendly educational sections into all 28 lesson pages.
Adds: Quick Cheat Sheet, Key Takeaways, Production Pattern (where applicable).
"""
import re, os

# ─── LESSON CONTENT ───────────────────────────────────────────────────
# Each lesson gets: cheat_sheet (list of [code, description] rows),
# takeaways (list of bullet strings), and optionally production_code.

LESSONS = {
    "learn.html": {
        "title": "WebSocket Basics",
        "cheat": [
            ["new WebSocket(url)", "Opens a connection to the server", "When YOU call it"],
            ["ws.addEventListener('open', fn)", "Runs your function when connected", "Automatically when server accepts"],
            ["ws.send('hello')", "Sends a message to the server", "When YOU call it"],
            ["ws.addEventListener('message', fn)", "Runs your function when server replies", "Every time server sends data"],
            ["ws.close()", "Ends the connection cleanly", "When YOU call it"],
            ["ws.addEventListener('close', fn)", "Runs your function when disconnected", "After connection ends"],
            ["ws.addEventListener('error', fn)", "Runs your function if something fails", "If connection breaks"],
            ["ws.readyState", "0=Connecting, 1=Open, 2=Closing, 3=Closed", "Check anytime"],
        ],
        "takeaways": [
            "Think of WebSocket like a <strong>phone call</strong> — once connected, both sides can talk freely without hanging up and dialing again.",
            "<code>new WebSocket(url)</code> is like pressing the <strong>call button</strong>. The browser dials the server.",
            "Events (<code>open</code>, <code>message</code>, <code>close</code>, <code>error</code>) are like <strong>notifications on your phone</strong> — they fire automatically when something happens.",
            "Always handle the <code>error</code> and <code>close</code> events — real connections <strong>will</strong> drop eventually.",
            "Use <code>ws.readyState</code> to check the connection status before sending messages.",
        ],
        "code_title": "Minimal WebSocket client",
        "code": """// 1. Connect to the server (like dialing a phone number)
const ws = new WebSocket('ws://localhost:8080');

// 2. When the call connects — say hello
ws.addEventListener('open', () => {
  console.log('Connected!');   // Phone picked up!
  ws.send('Hello server!');    // Start talking
});

// 3. When the server talks back — listen
ws.addEventListener('message', (event) => {
  console.log('Server said:', event.data);
});

// 4. When the call ends — log it
ws.addEventListener('close', (event) => {
  console.log('Disconnected. Code:', event.code);
});

// 5. If something goes wrong — handle it
ws.addEventListener('error', (err) => {
  console.error('Connection error!', err);
});"""
    },

    "learn2.html": {
        "title": "Event Listeners vs Properties",
        "cheat": [
            ["ws.onmessage = fn", "Sets ONE handler (overwrites previous!)", "❌ Fragile — only 1 allowed"],
            ["ws.addEventListener('message', fn)", "Adds a handler (allows multiple!)", "✅ Safe — stack as many as you want"],
            ["ws.onmessage = null", "Removes the handler", "Dangerous if you forget"],
            ["ws.removeEventListener('message', fn)", "Removes a specific handler", "Clean and explicit"],
        ],
        "takeaways": [
            "<code>ws.onmessage = fn</code> is like writing on a <strong>whiteboard</strong> — the next person erases what you wrote.",
            "<code>ws.addEventListener</code> is like a <strong>bulletin board</strong> — everyone can pin their note and nothing gets overwritten.",
            "If two parts of your code both set <code>ws.onmessage</code>, <strong>only the last one works</strong>. This is a silent, hard-to-find bug.",
            "Always prefer <code>addEventListener</code> — it's the modern, safe, scalable pattern.",
            "This same rule applies to all events: <code>onopen</code>, <code>onclose</code>, <code>onerror</code>, <code>onmessage</code>.",
        ],
        "code_title": "Safe pattern — use addEventListener",
        "code": """const ws = new WebSocket('ws://localhost:8080');

// ✅ GOOD — Multiple handlers, nothing gets overwritten
ws.addEventListener('message', (event) => {
  // Handler 1: Update the chat UI
  displayMessage(event.data);
});

ws.addEventListener('message', (event) => {
  // Handler 2: Log for debugging
  console.log('Raw message:', event.data);
});

// ❌ BAD — This would OVERWRITE any previous handler:
// ws.onmessage = (event) => { ... };
// If someone else also writes ws.onmessage = ..., yours is gone!"""
    },

    "learn3.html": {
        "title": "Callbacks vs Async/Await",
        "cheat": [
            ["callback(err, result)", "Old pattern — pass a function to call later", "Node.js classic style"],
            ["async function fn()", "Declares a function that can use await", "Modern JavaScript"],
            ["await somePromise", "Pauses until the Promise resolves", "Only inside async functions"],
            ["try { } catch (e) { }", "Catches errors from await", "Replaces error-first callbacks"],
            [".then().catch()", "Promise chain — older async style", "Still works, but await is cleaner"],
        ],
        "takeaways": [
            "Callbacks = giving someone your <strong>phone number</strong> and saying \"call me when it's ready.\" Works, but chains get messy.",
            "Async/Await = <strong>waiting in line</strong> at a counter. You pause, get your result, and continue. Clean and linear.",
            "\"Callback Hell\" happens when you nest callbacks inside callbacks — code moves <strong>further and further right</strong> ➡️➡️➡️.",
            "With <code>await</code>, error handling is just <code>try/catch</code> — the same pattern you use for everything else.",
            "<strong>Rule of thumb:</strong> Always use <code>async/await</code> in new code. Only use callbacks when a library forces you to.",
        ],
        "code_title": "Async/await — the modern way",
        "code": """// ❌ OLD WAY — Callback (nested and messy)
getData(userId, (err, user) => {
  if (err) { console.error(err); return; }
  getOrders(user.id, (err, orders) => {
    if (err) { console.error(err); return; }
    // Imagine 5 more levels deep... 😰
  });
});

// ✅ MODERN WAY — Async/Await (flat and clean)
async function loadUserData(userId) {
  try {
    const user = await getData(userId);    // Step 1: get user
    const orders = await getOrders(user.id); // Step 2: get orders
    const details = await getDetails(orders); // Step 3: get details
    return details;  // Done! No nesting needed.
  } catch (err) {
    console.error('Something failed:', err); // One catch for all
  }
}"""
    },

    "learn4.html": {
        "title": "Live Chat App",
        "cheat": [
            ["new WebSocket(url)", "Connect to chat server", "Lesson 1 pattern"],
            ["ws.addEventListener('open', fn)", "Enable send button when connected", "Lesson 2 pattern"],
            ["ws.send(JSON.stringify(msg))", "Send structured messages", "Always use JSON"],
            ["JSON.parse(event.data)", "Read structured messages", "Parse server replies"],
            ["await / async", "Clean send function", "Lesson 3 pattern"],
        ],
        "takeaways": [
            "A chat app combines <strong>all three lessons</strong>: connection (L1), event listeners (L2), and async patterns (L3).",
            "Always send <strong>JSON objects</strong> instead of plain strings — it lets you add metadata like username, timestamp, message type.",
            "Disable the send button when <strong>not connected</strong> — check <code>ws.readyState === WebSocket.OPEN</code> before sending.",
            "Show connection status to the user (green dot = connected, red = disconnected) — <strong>never leave them guessing</strong>.",
            "This is your first real WebSocket app! Every chat app (WhatsApp, Slack, Discord) uses this exact same pattern at its core.",
        ],
        "code_title": "Chat app core pattern",
        "code": """const ws = new WebSocket('ws://localhost:8080');

// Show connection status to the user
ws.addEventListener('open', () => {
  statusDot.style.background = 'green'; // Visual feedback!
  sendButton.disabled = false;          // Enable sending
});

// Display incoming messages
ws.addEventListener('message', (event) => {
  const msg = JSON.parse(event.data);  // Always parse JSON
  addMessageToChat(msg.text, 'server'); // Add to chat UI
});

// Send button click handler
async function sendMessage() {
  const text = input.value.trim();
  if (!text || ws.readyState !== WebSocket.OPEN) return;

  // Send as structured JSON (not plain text!)
  ws.send(JSON.stringify({
    type: 'chat',           // Message type
    text: text,             // The actual message
    timestamp: Date.now()   // When it was sent
  }));

  addMessageToChat(text, 'mine');  // Show in our chat
  input.value = '';                // Clear the input
}"""
    },

    "learn5.html": {
        "title": "Error Handling & Auto-Reconnect",
        "cheat": [
            ["event.code", "Why the connection closed (1000=normal)", "In the close event"],
            ["event.wasClean", "true if server said goodbye properly", "In the close event"],
            ["event.reason", "Optional text explanation", "In the close event"],
            ["Math.min(1000 * 2**n, 30000)", "Exponential backoff formula", "Wait 1s, 2s, 4s, 8s..."],
            ["clearTimeout(timer)", "Cancel a pending reconnect", "When user disconnects manually"],
        ],
        "takeaways": [
            "Connections <strong>will</strong> drop — WiFi changes, server restarts, timeouts. Your app must handle this gracefully.",
            "Close code <code>1000</code> means <strong>intentional close</strong> — don't auto-reconnect. Any other code = unexpected = try again.",
            "<strong>Exponential backoff</strong> = wait longer between each retry (1s → 2s → 4s → 8s). This avoids flooding a struggling server.",
            "Always set a <strong>max retry limit</strong> (e.g., 8 attempts). Don't retry forever — tell the user if it's truly down.",
            "The <code>error</code> event is <strong>always followed by close</strong>. Put your reconnect logic in <code>close</code>, not <code>error</code>.",
        ],
        "code_title": "Auto-reconnect with exponential backoff",
        "code": """let ws, retries = 0;
const MAX_RETRIES = 8;  // Give up after 8 attempts
let retryTimer = null;

function connect() {
  ws = new WebSocket('ws://localhost:8080');

  ws.addEventListener('open', () => {
    console.log('✅ Connected!');
    retries = 0;  // Reset counter on success!
  });

  ws.addEventListener('close', (event) => {
    // Code 1000 = user clicked disconnect. Don't retry.
    if (event.code === 1000) return;

    // Too many retries? Give up.
    if (retries >= MAX_RETRIES) {
      console.log('❌ Server unreachable after 8 tries');
      return;
    }

    // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 30s max
    const delay = Math.min(1000 * 2 ** retries, 30000);
    console.log(`🔄 Retry #${retries + 1} in ${delay/1000}s…`);
    retries++;
    retryTimer = setTimeout(connect, delay);
  });

  ws.addEventListener('error', () => {
    // Error always triggers close — reconnect logic is there
    console.error('⚠️ Connection error');
  });
}

connect(); // Start the first connection"""
    },

    "learn6.html": {
        "title": "Broadcasting",
        "cheat": [
            ["wss.clients", "Set of ALL connected WebSocket clients", "Server-side (ws library)"],
            ["wss.clients.forEach(client =&gt; ...)", "Loop through every connected user", "To broadcast"],
            ["client.readyState === WebSocket.OPEN", "Check if client is still connected", "Always check before sending"],
            ["client.send(data)", "Send data to one specific client", "Inside the forEach loop"],
        ],
        "takeaways": [
            "Broadcasting = sending a message to <strong>ALL connected clients</strong>. Like a group announcement on a PA system.",
            "The server keeps a <code>Set</code> of all connected clients in <code>wss.clients</code> — loop through it to broadcast.",
            "<strong>Always check</strong> <code>readyState === WebSocket.OPEN</code> before sending — some clients may have disconnected.",
            "You can broadcast to <strong>everyone except the sender</strong> by checking <code>if (client !== ws)</code>.",
            "This is the foundation for features like live chat rooms, live sports scores, and multiplayer game state sync.",
        ],
        "code_title": "Server-side broadcasting",
        "code": """const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', (message) => {
    // Broadcast to ALL clients (including sender)
    wss.clients.forEach((client) => {
      // Always check if client is still connected!
      if (client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });

  // Broadcast to everyone EXCEPT the sender
  ws.on('message', (message) => {
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });
});"""
    },

    "learn7.html": {
        "title": "Rooms & Channels",
        "cheat": [
            ["Map&lt;string, Set&lt;WebSocket&gt;&gt;", "Data structure for rooms", "roomName → set of clients"],
            ["rooms.get(name).add(ws)", "Add a client to a room", "On join request"],
            ["rooms.get(name).delete(ws)", "Remove a client from a room", "On leave or disconnect"],
            ["rooms.get(name).forEach(client =&gt; ...)", "Broadcast to room only", "Send to room members"],
        ],
        "takeaways": [
            "Rooms let you broadcast to a <strong>subset</strong> of users instead of everyone. Like separate group chats.",
            "A room is just a <code>Map</code> of room names → <code>Set</code> of WebSocket connections. No magic library needed.",
            "When a client <strong>disconnects</strong>, remove them from ALL rooms they were in — otherwise you get ghost members.",
            "A single client can be in <strong>multiple rooms</strong> at once (like being in #general and #random on Slack).",
            "This pattern is the foundation of chat apps, game lobbies, and notification channels.",
        ],
        "code_title": "Room management on the server",
        "code": """const rooms = new Map(); // { 'room-name': Set<WebSocket> }

function joinRoom(ws, roomName) {
  // Create the room if it doesn't exist
  if (!rooms.has(roomName)) {
    rooms.set(roomName, new Set());
  }
  rooms.get(roomName).add(ws);   // Add this client to the room
  console.log(`Client joined #${roomName}`);
}

function leaveRoom(ws, roomName) {
  const room = rooms.get(roomName);
  if (room) {
    room.delete(ws);             // Remove this client
    if (room.size === 0) {
      rooms.delete(roomName);    // Clean up empty rooms
    }
  }
}

function broadcastToRoom(roomName, message, sender) {
  const room = rooms.get(roomName);
  if (!room) return;

  room.forEach((client) => {
    // Send to everyone in the room EXCEPT the sender
    if (client !== sender && client.readyState === 1) {
      client.send(JSON.stringify(message));
    }
  });
}"""
    },

    "learn8.html": {
        "title": "Authentication",
        "cheat": [
            ["new WebSocket(url + '?token=xxx')", "Send auth token in URL query", "Client connects with token"],
            ["new URL(req.url, 'http://x').searchParams", "Extract token from URL on server", "Server reads the token"],
            ["ws.close(4001, 'Unauthorized')", "Reject connection with custom code", "If token is invalid"],
            ["jwt.verify(token, secret)", "Validate a JWT token", "Server-side check"],
        ],
        "takeaways": [
            "WebSockets can't send custom HTTP headers during the handshake — so we pass the <strong>token in the URL query string</strong>.",
            "Always <strong>validate the token on the server</strong> immediately during the connection event. Reject bad tokens instantly.",
            "Custom close codes 4000-4999 are yours to define — use <code>4001</code> for unauthorized, <code>4002</code> for expired token, etc.",
            "JWTs (JSON Web Tokens) are the most common auth method — they contain user data encoded inside the token itself.",
            "Never trust the client — <strong>always verify server-side</strong>. A malicious user can send any token they want.",
        ],
        "code_title": "WebSocket authentication flow",
        "code": """// CLIENT — Connect with auth token in URL
const token = localStorage.getItem('auth_token');
const ws = new WebSocket(`ws://localhost:8080?token=${token}`);

// SERVER — Validate the token on connection
wss.on('connection', (ws, req) => {
  // 1. Extract token from the URL query string
  const url = new URL(req.url, 'http://localhost');
  const token = url.searchParams.get('token');

  // 2. Verify the token (using JWT or your own logic)
  try {
    const user = jwt.verify(token, SECRET_KEY);
    ws.userId = user.id;  // Attach user info to connection
    ws.send(JSON.stringify({ type: 'auth', status: 'ok' }));
  } catch (err) {
    // 3. Reject invalid tokens immediately!
    ws.close(4001, 'Invalid or expired token');
    return; // Stop processing
  }

  ws.on('message', (msg) => {
    console.log(`Message from user ${ws.userId}:`, msg);
  });
});"""
    },

    "learn9.html": {
        "title": "Heartbeat & Ping-Pong",
        "cheat": [
            ["ws.ping()", "Server sends a ping frame (built-in)", "Server-side only"],
            ["ws.on('pong', fn)", "Server detects client responded", "Client is still alive!"],
            ["setInterval(checkAlive, 30000)", "Run heartbeat check every 30 seconds", "Server-side timer"],
            ["ws.isAlive = true", "Flag to track if client responded", "Reset on each pong"],
            ["ws.terminate()", "Force-kill a dead connection", "If no pong received"],
        ],
        "takeaways": [
            "A <strong>heartbeat</strong> is like periodically asking \"Are you still there?\" — if no response, the connection is dead.",
            "Without heartbeats, a dropped connection can stay \"open\" for <strong>hours</strong> — zombie connections waste server resources.",
            "The WebSocket protocol has built-in <strong>ping/pong frames</strong> — browsers auto-respond to pings, no client code needed!",
            "Use <code>setInterval</code> on the server to ping all clients every 30 seconds. Terminate anyone who doesn't respond.",
            "Load balancers (AWS ALB, Nginx) also use heartbeats — configure their timeout to match yours.",
        ],
        "code_title": "Server-side heartbeat",
        "code": """const wss = new WebSocket.Server({ port: 8080 });

// Every new connection starts as alive
wss.on('connection', (ws) => {
  ws.isAlive = true;  // Mark as alive

  // When client responds to ping, mark alive again
  ws.on('pong', () => {
    ws.isAlive = true;
  });
});

// Every 30 seconds, check all connections
const heartbeat = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) {
      // No pong since last check = dead connection
      console.log('💀 Terminating dead connection');
      return ws.terminate();  // Force close
    }

    ws.isAlive = false;  // Reset flag
    ws.ping();           // Send ping — browser auto-responds
  });
}, 30000);  // 30 second interval

// Clean up when server shuts down
wss.on('close', () => clearInterval(heartbeat));"""
    },

    "learn10.html": {
        "title": "Binary Data & File Transfer",
        "cheat": [
            ["ws.binaryType = 'arraybuffer'", "Tell WebSocket to receive binary as ArrayBuffer", "Set on client before receiving"],
            ["new Uint8Array(buffer)", "Create a typed array from raw bytes", "For reading binary data"],
            ["file.slice(start, end)", "Split a file into chunks", "For chunked upload"],
            ["new Blob([chunk1, chunk2])", "Reassemble chunks into a file", "Server-side or client-side"],
            ["ws.send(arrayBuffer)", "Send binary data directly", "No need to base64 encode"],
        ],
        "takeaways": [
            "WebSocket can send <strong>binary data directly</strong> — no need to convert to text first (like base64). Much faster!",
            "Set <code>ws.binaryType = 'arraybuffer'</code> on the client to receive binary data as an <code>ArrayBuffer</code> instead of a <code>Blob</code>.",
            "For large files, <strong>split into chunks</strong> (e.g., 64KB each) and send them one at a time. This avoids memory spikes.",
            "Send a JSON \"header\" message first (filename, size, type), then send the binary chunks. The server knows what to expect.",
            "This pattern is used in real apps for file sharing, screen sharing, and audio/video streaming.",
        ],
        "code_title": "Chunked file upload over WebSocket",
        "code": """const CHUNK_SIZE = 64 * 1024; // 64KB chunks

async function uploadFile(file, ws) {
  // Step 1: Tell the server what's coming
  ws.send(JSON.stringify({
    type: 'file-start',
    name: file.name,
    size: file.size,
    totalChunks: Math.ceil(file.size / CHUNK_SIZE)
  }));

  // Step 2: Send the file in chunks
  for (let offset = 0; offset < file.size; offset += CHUNK_SIZE) {
    const chunk = file.slice(offset, offset + CHUNK_SIZE);
    const buffer = await chunk.arrayBuffer();
    ws.send(buffer);  // Send binary directly — fast!
  }

  // Step 3: Tell the server we're done
  ws.send(JSON.stringify({ type: 'file-end' }));
}"""
    },

    "learn11.html": {
        "title": "Scaling WebSockets",
        "cheat": [
            ["redis.publish(channel, msg)", "Send message to Redis channel", "From any server instance"],
            ["redis.subscribe(channel)", "Listen to a Redis channel", "On server startup"],
            ["redis.on('message', fn)", "Handle messages from other servers", "Broadcast locally"],
            ["Sticky sessions", "Route same user to same server", "Load balancer config"],
        ],
        "takeaways": [
            "A single server can handle ~10K-65K WebSocket connections. Beyond that, you need <strong>multiple servers</strong>.",
            "The problem: User A on Server 1 sends a message, but User B is on Server 2. Server 2 <strong>doesn't know</strong> about the message.",
            "<strong>Redis Pub/Sub</strong> solves this — every server subscribes to a shared channel. When one server gets a message, it publishes to Redis, and all servers receive it.",
            "Sticky sessions ensure a user's requests always go to the <strong>same server</strong> — important because WebSocket is stateful.",
            "In production, use managed services like AWS ElastiCache (Redis) and ALB (load balancer) to handle this automatically.",
        ],
        "code_title": "Multi-server broadcasting with Redis",
        "code": """const Redis = require('ioredis');
const pub = new Redis();  // Publisher
const sub = new Redis();  // Subscriber

// Subscribe to the broadcast channel
sub.subscribe('chat-messages');

// When another server publishes, broadcast locally
sub.on('message', (channel, message) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);  // Send to our local clients
    }
  });
});

// When a local client sends a message...
wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    // Publish to Redis — ALL servers will receive this
    pub.publish('chat-messages', data.toString());
  });
});"""
    },

    "learn12.html": {
        "title": "WS vs SSE vs Long Polling",
        "cheat": [
            ["WebSocket", "Full duplex — both sides talk freely", "Chat, games, collaboration"],
            ["SSE (Server-Sent Events)", "Server → Client only (one-way)", "Notifications, live feeds"],
            ["Long Polling", "Client keeps asking, server holds response", "Fallback for old browsers"],
            ["new EventSource(url)", "Client opens an SSE connection", "Auto-reconnects built in"],
            ["res.write('data: hi\\n\\n')", "Server sends an SSE event", "Keep connection open"],
        ],
        "takeaways": [
            "<strong>WebSocket</strong> = phone call (both sides talk). <strong>SSE</strong> = radio broadcast (server talks, you listen). <strong>Long Polling</strong> = texting \"any news?\" every few seconds.",
            "Use <strong>WebSocket</strong> when BOTH client and server need to send messages (chat, games, live editing).",
            "Use <strong>SSE</strong> when only the server needs to push updates (stock prices, notifications, live feeds). Simpler than WebSocket!",
            "Use <strong>Long Polling</strong> only as a fallback — it wastes resources because the client keeps reconnecting.",
            "SSE has <strong>built-in auto-reconnect</strong> — WebSocket does not (you have to code it yourself, like in Lesson 5).",
        ],
        "code_title": "Comparison — same feature, three ways",
        "code": """// === WebSocket (two-way) ===
const ws = new WebSocket('ws://server/chat');
ws.send('Hello!');                            // Client → Server ✅
ws.addEventListener('message', (e) => {});    // Server → Client ✅

// === SSE (one-way: server → client) ===
const sse = new EventSource('/notifications');
sse.addEventListener('message', (e) => {});   // Server → Client ✅
// ❌ Cannot send to server (use fetch() for that)

// === Long Polling (wasteful but works everywhere) ===
async function poll() {
  const res = await fetch('/poll');  // Ask server for updates
  const data = await res.json();    // Server holds response until data ready
  handleUpdate(data);               // Process the update
  poll();  // Immediately ask again (infinite loop)
}
poll();"""
    },

    "learn13.html": {
        "title": "Rate Limiting",
        "cheat": [
            ["Token Bucket", "Allow bursts, refill over time", "Most common algorithm"],
            ["tokens--", "Consume a token per message", "If tokens > 0, allow"],
            ["setInterval(() =&gt; tokens++, refillRate)", "Refill tokens over time", "Server-side timer"],
            ["ws.close(4008, 'Rate limited')", "Kick abusive clients", "Custom close code"],
        ],
        "takeaways": [
            "Without rate limiting, a single malicious client can send <strong>thousands of messages per second</strong> and crash your server.",
            "The <strong>Token Bucket</strong> algorithm: You have N tokens. Each message costs 1 token. Tokens refill over time. No tokens = message rejected.",
            "This is like a <strong>coffee punch card</strong> — you get 10 free coffees, use them up, and have to wait for new ones.",
            "Set reasonable limits: e.g., 10 messages per second for chat, 1 message per second for expensive operations.",
            "Always <strong>warn the user</strong> before disconnecting them. Send a warning at 80% usage, disconnect at 100%.",
        ],
        "code_title": "Token Bucket rate limiter",
        "code": """class TokenBucket {
  constructor(maxTokens, refillRate) {
    this.tokens = maxTokens;     // Start full
    this.maxTokens = maxTokens;  // Maximum capacity
    this.refillRate = refillRate; // Tokens added per second

    // Refill tokens over time
    setInterval(() => {
      this.tokens = Math.min(this.maxTokens, this.tokens + 1);
    }, 1000 / this.refillRate);
  }

  // Returns true if message is allowed, false if rate limited
  consume() {
    if (this.tokens > 0) {
      this.tokens--;
      return true;   // ✅ Allowed
    }
    return false;     // ❌ Rate limited!
  }
}

// Give each client their own bucket (10 msgs max, refill 2/sec)
wss.on('connection', (ws) => {
  const bucket = new TokenBucket(10, 2);

  ws.on('message', (data) => {
    if (!bucket.consume()) {
      ws.send(JSON.stringify({ error: '⚠️ Slow down! Rate limited.' }));
      return; // Drop the message
    }
    // Process the message normally...
  });
});"""
    },

    "learn14.html": {
        "title": "Shared Express + WS Server",
        "cheat": [
            ["server = http.createServer(app)", "Create HTTP server from Express app", "Shared server"],
            ["new WebSocket.Server({ server })", "Attach WS to same HTTP server", "Same port!"],
            ["server.listen(PORT)", "One port for both HTTP and WS", "Instead of app.listen()"],
        ],
        "takeaways": [
            "By default, Express and WebSocket run on <strong>different ports</strong>. But you can share one port for both!",
            "Create the HTTP server from Express using <code>http.createServer(app)</code>, then pass it to <code>WebSocket.Server</code>.",
            "This means your REST API and WebSocket server are <strong>one deployment</strong> — simpler to manage and deploy.",
            "Use REST for CRUD operations, WebSocket for real-time updates. <strong>Best of both worlds.</strong>",
            "This is the pattern used by most production apps — a REST API with a WebSocket upgrade endpoint.",
        ],
        "code_title": "Express + WebSocket on same port",
        "code": """const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app); // Create HTTP server from Express

// Attach WebSocket to the SAME server
const wss = new WebSocket.Server({ server });

// REST endpoints (normal Express)
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', wsClients: wss.clients.size });
});

// WebSocket handler
wss.on('connection', (ws) => {
  ws.send('Hello from shared server!');
});

// ONE listen() for both HTTP and WebSocket
server.listen(8080, () => {
  console.log('HTTP + WS running on port 8080');
});"""
    },

    "learn15.html": {
        "title": "Presence System",
        "cheat": [
            ["onlineUsers = new Map()", "Track who is currently online", "userId → WebSocket"],
            ["onlineUsers.set(userId, ws)", "Mark user as online on connect", "Join event"],
            ["onlineUsers.delete(userId)", "Mark user as offline on disconnect", "Leave event"],
            ["broadcast({ type: 'presence', users: [...] })", "Notify everyone of changes", "On join/leave"],
        ],
        "takeaways": [
            "A presence system answers one question: <strong>\"Who is online right now?\"</strong> — like the green dots in Slack.",
            "Use a <code>Map</code> to track online users: <code>userId → WebSocket connection</code>. Add on connect, delete on disconnect.",
            "When someone joins or leaves, <strong>broadcast the updated user list</strong> to everyone. This keeps all clients in sync.",
            "Handle the <code>close</code> event carefully — a user might have <strong>multiple tabs open</strong>. Only mark offline when ALL tabs close.",
            "This pattern is used in Slack, Discord, Zoom, Google Docs — anywhere you see \"5 people online\" or typing indicators.",
        ],
        "code_title": "Server-side presence tracking",
        "code": """const onlineUsers = new Map(); // userId → ws

wss.on('connection', (ws, req) => {
  const userId = authenticate(req); // Get user from token

  // Mark user as online
  onlineUsers.set(userId, ws);
  broadcastPresence(); // Tell everyone

  ws.on('close', () => {
    // Mark user as offline
    onlineUsers.delete(userId);
    broadcastPresence(); // Tell everyone
  });
});

function broadcastPresence() {
  const userList = Array.from(onlineUsers.keys());
  const msg = JSON.stringify({
    type: 'presence',
    users: userList,        // ['alice', 'bob', 'charlie']
    count: userList.length  // 3
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}"""
    },

    "learn16.html": {
        "title": "Typing Indicators",
        "cheat": [
            ["ws.send({type: 'typing', user})", "Notify server that user is typing", "On keydown/input"],
            ["debounce(sendTyping, 300)", "Don't spam typing events", "Wait 300ms between sends"],
            ["setTimeout(clearTyping, 3000)", "Auto-clear \"typing\" after 3 seconds", "If user stops typing"],
        ],
        "takeaways": [
            "Typing indicators show <strong>\"Alice is typing...\"</strong> in real-time. This makes conversations feel alive.",
            "<strong>Debouncing</strong> is critical — don't send a typing event for every keystroke. Wait until the user pauses for 300ms.",
            "Auto-clear the indicator after <strong>3 seconds of silence</strong>. Otherwise it stays forever if the user stops and doesn't send.",
            "Only broadcast typing to the <strong>relevant room/conversation</strong> — not to all users globally.",
            "This is a simple but powerful UX pattern — it tells the other person to <strong>wait before leaving the chat</strong>.",
        ],
        "code_title": "Typing indicator with debounce",
        "code": """// CLIENT — Send typing events (debounced)
let typingTimer;
input.addEventListener('input', () => {
  clearTimeout(typingTimer);

  // Only send one 'typing' event per 300ms
  typingTimer = setTimeout(() => {
    ws.send(JSON.stringify({
      type: 'typing',
      user: myUsername
    }));
  }, 300);
});

// CLIENT — Show and auto-clear typing indicator
ws.addEventListener('message', (event) => {
  const msg = JSON.parse(event.data);
  if (msg.type === 'typing') {
    showTyping(msg.user); // Display "Alice is typing..."

    // Clear after 3 seconds if no more typing events
    clearTimeout(window.typingClearTimer);
    window.typingClearTimer = setTimeout(() => {
      hideTyping(msg.user);
    }, 3000);
  }
});"""
    },

    "learn17.html": {
        "title": "Message History & Replay",
        "cheat": [
            ["ringBuffer = []", "Fixed-size array for recent messages", "In-memory storage"],
            ["ringBuffer.push(msg)", "Add message to history", "On each new message"],
            ["ringBuffer.slice(-50)", "Get last 50 messages", "On client connect"],
            ["ws.send(JSON.stringify(history))", "Send history to new client", "On connection open"],
        ],
        "takeaways": [
            "New users joining a chat should see the <strong>recent conversation</strong>, not an empty screen. This is message replay.",
            "A <strong>ring buffer</strong> is a fixed-size array that overwrites the oldest message when full. Perfect for \"last N messages\".",
            "When a client connects, send them the buffered messages <strong>first</strong>, styled differently (grayed out), then a divider line.",
            "For production, use a <strong>database</strong> (PostgreSQL) instead of in-memory arrays — they survive server restarts.",
            "Mark historical messages differently from live ones so users can tell what's old and what's new.",
        ],
        "code_title": "Message replay on join",
        "code": """const HISTORY_SIZE = 50;
const messageHistory = []; // Ring buffer

wss.on('connection', (ws) => {
  // Step 1: Send recent history to the new client
  ws.send(JSON.stringify({
    type: 'history',
    messages: messageHistory.slice(-HISTORY_SIZE)
  }));

  // Step 2: Handle new messages
  ws.on('message', (data) => {
    const msg = JSON.parse(data);
    msg.timestamp = Date.now();

    // Add to history (ring buffer — keep only last N)
    messageHistory.push(msg);
    if (messageHistory.length > HISTORY_SIZE) {
      messageHistory.shift(); // Remove oldest
    }

    // Broadcast to all clients as a live message
    broadcast(JSON.stringify({ type: 'live', ...msg }));
  });
});"""
    },

    "learn18.html": {
        "title": "Offline Queue",
        "cheat": [
            ["queue = []", "Buffer for unsent messages", "Client-side array"],
            ["queue.push(msg)", "Save message when offline", "When ws.readyState !== OPEN"],
            ["queue.forEach(msg =&gt; ws.send(msg))", "Flush queue on reconnect", "In the open handler"],
        ],
        "takeaways": [
            "Users will go offline — WiFi drops, subway tunnels, laptop lid closes. Their messages <strong>should not be lost</strong>.",
            "An <strong>offline queue</strong> buffers messages in an array. When the connection comes back, flush (send) the entire queue.",
            "Check <code>ws.readyState === WebSocket.OPEN</code> before sending. If not open, push to the queue instead.",
            "Set a <strong>max queue size</strong> (e.g., 100 messages) to avoid memory issues if the user is offline for a long time.",
            "For critical apps, also save the queue to <code>localStorage</code> so it survives page refreshes.",
        ],
        "code_title": "Offline message queue",
        "code": """const queue = []; // Messages waiting to be sent
const MAX_QUEUE = 100;

function send(data) {
  const message = JSON.stringify(data);

  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(message);  // Online — send immediately
  } else {
    // Offline — save to queue (with size limit)
    if (queue.length < MAX_QUEUE) {
      queue.push(message);
      console.log(`📦 Queued (${queue.length} waiting)`);
    }
  }
}

// When connection comes back, flush the queue
ws.addEventListener('open', () => {
  console.log(`🔄 Flushing ${queue.length} queued messages...`);
  while (queue.length > 0) {
    ws.send(queue.shift());  // Send oldest first
  }
});"""
    },
}

# ─── Add stubs for lessons 19-28 (theory-heavy, shorter cheat sheets) ───
ADVANCED_LESSONS = {
    "learn19.html": {
        "title": "WebSocket with React",
        "cheat": [
            ["useEffect(() =&gt; { ... }, [])", "Connect WebSocket once on mount", "React lifecycle"],
            ["useRef()", "Keep ws reference across renders", "Survives re-renders"],
            ["useState([])", "Store messages in React state", "Triggers re-render"],
            ["return () =&gt; ws.close()", "Cleanup on unmount", "In useEffect return"],
        ],
        "takeaways": [
            "In React, open the WebSocket in <code>useEffect</code> with an empty dependency array <code>[]</code> — runs once on mount.",
            "Store the WebSocket in a <code>useRef</code> — not <code>useState</code> — because changing it should NOT cause a re-render.",
            "Store messages in <code>useState</code> so the UI updates when new messages arrive.",
            "Always <strong>close the connection in the cleanup function</strong> (<code>return () => ws.close()</code>) to avoid memory leaks.",
            "Extract this into a custom <code>useWebSocket</code> hook that you can reuse across your entire app.",
        ],
    },
    "learn20.html": {
        "title": "Socket.io Comparison",
        "cheat": [
            ["io(url)", "Connect with Socket.io (auto-reconnect!)", "Built-in reconnection"],
            ["socket.emit('event', data)", "Send named events", "Like ws.send but with names"],
            ["socket.on('event', fn)", "Listen to named events", "Automatic JSON parsing"],
            ["socket.join('room')", "Join a room (built-in!)", "No manual Map needed"],
        ],
        "takeaways": [
            "Socket.io is a <strong>library on top of WebSocket</strong>. It adds auto-reconnect, rooms, namespaces, and fallback transport.",
            "Raw WebSocket = more control, less features. Socket.io = more features, less control. <strong>Both are valid choices.</strong>",
            "Socket.io <strong>is NOT a WebSocket</strong> — it uses its own protocol. A raw WS client can't talk to a Socket.io server.",
            "Use raw WebSocket when you need maximum performance or minimal bundle size.",
            "Use Socket.io when you want batteries-included features and don't mind the extra ~40KB.",
        ],
    },
    "learn21.html": {
        "title": "WebSocket Security",
        "cheat": [
            ["Origin header check", "Verify request comes from your domain", "Prevent cross-origin attacks"],
            ["wss:// (TLS)", "Encrypted WebSocket connections", "Always use in production"],
            ["Input validation", "Sanitize all incoming messages", "Prevent XSS/injection"],
            ["Rate limiting", "Throttle messages per client", "Prevent DDoS"],
        ],
        "takeaways": [
            "<strong>Always use wss://</strong> (WebSocket Secure) in production — it encrypts data like HTTPS does for HTTP.",
            "Validate the <code>Origin</code> header on the server — reject connections from unknown domains to prevent CSRF attacks.",
            "<strong>Never trust client data.</strong> Always validate and sanitize every message before processing or broadcasting.",
            "Combine authentication (Lesson 8) + rate limiting (Lesson 13) + input validation = a secure WebSocket server.",
            "WebSocket connections bypass CORS — this makes them more dangerous if not properly secured.",
        ],
    },
    "learn22.html": {
        "title": "TypeScript + WebSocket",
        "cheat": [
            ["interface Message { type: string; data: any; }", "Define message shapes", "Compile-time safety"],
            ["z.object({ type: z.string() })", "Zod runtime validation schema", "Validate at runtime too"],
            ["schema.parse(data)", "Validate data matches schema", "Throws if invalid"],
        ],
        "takeaways": [
            "TypeScript adds <strong>compile-time type checking</strong> — catch errors before your code even runs.",
            "Define <strong>interfaces</strong> for every message type (ChatMessage, AuthMessage, ErrorMessage) to prevent bugs.",
            "Compile-time types are not enough — use <strong>Zod</strong> for runtime validation because network data can be anything.",
            "Type your WebSocket wrapper function so <code>send()</code> only accepts valid message types.",
            "This pattern catches bugs <strong>before they reach production</strong> — worth the small overhead.",
        ],
    },
    "learn23.html": {
        "title": "Collaborative Editing",
        "cheat": [
            ["OT (Operational Transform)", "Merge concurrent edits", "Google Docs approach"],
            ["CRDT (Yjs, Automerge)", "Conflict-free data structures", "Modern approach"],
            ["Y.Doc()", "Create a shared Yjs document", "Automatically syncs"],
        ],
        "takeaways": [
            "The challenge: two people edit the same text at the same time. <strong>Whose edit wins?</strong> Both should!",
            "<strong>OT (Operational Transform)</strong> = transform operations so they apply correctly in any order. Complex but proven (Google Docs).",
            "<strong>CRDTs</strong> = data structures that mathematically guarantee no conflicts. Simpler to use (Yjs, Automerge).",
            "For new projects, <strong>use Yjs + WebSocket</strong> — it handles the hard parts and gives you real-time collaboration for free.",
            "Collaborative editing is one of the hardest real-time problems. Don't build from scratch — use a library.",
        ],
    },
    "learn24.html": {
        "title": "WebRTC Signaling",
        "cheat": [
            ["RTCPeerConnection()", "Create a direct peer connection", "Browser-to-browser"],
            ["WebSocket for signaling", "Exchange connection info via WS", "Before P2P starts"],
            ["createOffer() / createAnswer()", "SDP exchange — describe your connection", "Handshake steps"],
            ["addIceCandidate()", "Share network route info", "NAT traversal"],
        ],
        "takeaways": [
            "WebRTC = <strong>direct peer-to-peer</strong> connections (no server in between). Perfect for video/voice calls.",
            "But peers need to <strong>find each other first</strong> — that's what WebSocket signaling does (exchange connection details).",
            "The flow: WebSocket connects both users → they exchange SDP offers/answers → ICE candidates find the route → P2P connection established.",
            "After the P2P connection is established, the WebSocket signaling server is <strong>no longer needed</strong>.",
            "WebSocket = signaling (small text messages). WebRTC = media (video/audio streams). They work together!",
        ],
    },
    "learn25.html": {
        "title": "Testing WebSockets",
        "cheat": [
            ["new WebSocket(url) in tests", "Create real test client", "Integration test"],
            ["jest.fn()", "Mock WebSocket for unit tests", "No server needed"],
            ["ws.on('message', resolve)", "Wait for message with Promise", "Async test pattern"],
        ],
        "takeaways": [
            "<strong>Unit tests</strong> = mock the WebSocket (test your logic without a real server). Fast but less realistic.",
            "<strong>Integration tests</strong> = run a real server and connect real clients. Slower but catches real bugs.",
            "Use <code>Promise</code> wrappers to make async WebSocket tests readable: <code>await waitForMessage(ws)</code>.",
            "Test edge cases: rapid disconnect/reconnect, malformed messages, auth failures, rate limiting.",
            "Always test the <strong>close and error paths</strong> — they're where most production bugs hide.",
        ],
    },
    "learn26.html": {
        "title": "Monitoring & Logging",
        "cheat": [
            ["connections.gauge", "Track active connection count", "Real-time metric"],
            ["messages.counter", "Count total messages sent", "Throughput metric"],
            ["JSON structured logs", "Machine-readable log format", "For log aggregation"],
        ],
        "takeaways": [
            "You can't fix what you can't see. <strong>Monitor connection count, message throughput, and error rates.</strong>",
            "Use <strong>structured JSON logs</strong> instead of plain text — tools like Datadog and Elasticsearch can parse them.",
            "Track <strong>connection duration</strong> — if connections are very short-lived, something is wrong (reconnect loops, auth failures).",
            "Set up alerts: connection count drops to 0, error rate spikes, message latency exceeds 1 second.",
            "Log the <code>close code</code> and <code>close reason</code> for every disconnection — this is your debugging lifeline.",
        ],
    },
    "learn27.html": {
        "title": "Load Testing",
        "cheat": [
            ["artillery quick --count 100", "Simulate 100 concurrent clients", "Quick load test"],
            ["artillery run config.yml", "Detailed load test from config", "Production testing"],
            ["phases: rampTo: 1000", "Gradually increase load", "Find your breaking point"],
        ],
        "takeaways": [
            "Load testing tells you: <strong>How many users can my server handle before it crashes?</strong>",
            "Use <strong>Artillery</strong> — it supports WebSocket out of the box and can simulate thousands of concurrent connections.",
            "Ramp up gradually (10 → 100 → 1000 users) to find exactly where your server starts struggling.",
            "Monitor <strong>CPU, memory, and response latency</strong> during the test. The first to spike is your bottleneck.",
            "Test on hardware <strong>identical to production</strong> — testing on your laptop gives misleading results.",
        ],
    },
    "learn28.html": {
        "title": "Deployment",
        "cheat": [
            ["Dockerfile", "Containerize your WS server", "Consistent environments"],
            ["nginx proxy_pass", "Reverse proxy for WebSocket", "Need Upgrade header support"],
            ["proxy_set_header Upgrade $http_upgrade", "Enable WS through nginx", "Critical nginx config"],
            ["graceful shutdown", "Close all connections before exit", "process.on('SIGTERM')"],
        ],
        "takeaways": [
            "Use <strong>Docker</strong> to containerize your server — it runs the same everywhere (dev, staging, prod).",
            "Nginx needs special config for WebSocket — you must pass <code>Upgrade</code> and <code>Connection</code> headers.",
            "<strong>Graceful shutdown</strong>: When the server stops, close all WebSocket connections cleanly (code 1001) before exiting.",
            "Use health checks (<code>/health</code> endpoint) so load balancers know when your server is ready.",
            "In production: Docker container → behind nginx → load balanced → auto-scaled → monitored. That's the full stack.",
        ],
    },
}

LESSONS.update(ADVANCED_LESSONS)

# ─── HTML TEMPLATE ────────────────────────────────────────────────────

def build_section(data):
    """Build the HTML for all three educational sections."""
    title = data['title']
    cheat = data.get('cheat', [])
    takeaways = data.get('takeaways', [])
    code = data.get('code', '')
    code_title = data.get('code_title', f'{title} — production pattern')

    html = '\n\n  <!-- ═══ BEGINNER REFERENCE SECTIONS ═══ -->\n'
    html += '  <div style="max-width:880px;margin:0 auto;padding:0 24px 32px">\n'

    # ── CHEAT SHEET ──
    if cheat:
        has_third_col = len(cheat[0]) > 2
        html += '    <!-- 📋 Quick Cheat Sheet -->\n'
        html += '    <div style="background:#111827;border:1px solid #1f2d45;border-radius:14px;overflow:hidden;margin-bottom:24px">\n'
        html += f'      <div style="padding:14px 18px;border-bottom:1px solid #1f2d45;font-weight:700;font-size:.95rem;color:#e2e8f0">📋 Quick Cheat Sheet — {title}</div>\n'
        html += '      <div style="overflow-x:auto">\n'
        html += '        <table style="width:100%;border-collapse:collapse;font-size:.83rem">\n'
        html += '          <thead><tr>'
        html += '<th style="padding:10px 14px;background:#1a2235;color:#94a3b8;font-weight:600;font-size:.75rem;text-transform:uppercase;letter-spacing:.4px;border-bottom:1px solid #1f2d45;text-align:left">Code</th>'
        html += '<th style="padding:10px 14px;background:#1a2235;color:#94a3b8;font-weight:600;font-size:.75rem;text-transform:uppercase;letter-spacing:.4px;border-bottom:1px solid #1f2d45;text-align:left">What it does</th>'
        if has_third_col:
            html += '<th style="padding:10px 14px;background:#1a2235;color:#94a3b8;font-weight:600;font-size:.75rem;text-transform:uppercase;letter-spacing:.4px;border-bottom:1px solid #1f2d45;text-align:left">When</th>'
        html += '</tr></thead>\n'
        html += '          <tbody>\n'
        for row in cheat:
            html += '            <tr>'
            html += f'<td style="padding:10px 14px;border-bottom:1px solid #1f2d45;color:#7dd3fc;font-family:\'Fira Code\',monospace;font-size:.78rem"><code>{row[0]}</code></td>'
            html += f'<td style="padding:10px 14px;border-bottom:1px solid #1f2d45;color:#e2e8f0">{row[1]}</td>'
            if has_third_col:
                html += f'<td style="padding:10px 14px;border-bottom:1px solid #1f2d45;color:#94a3b8;font-size:.78rem">{row[2]}</td>'
            html += '</tr>\n'
        html += '          </tbody>\n'
        html += '        </table>\n'
        html += '      </div>\n'
        html += '    </div>\n\n'

    # ── KEY TAKEAWAYS ──
    if takeaways:
        html += '    <!-- 💡 Key Takeaways -->\n'
        html += '    <div style="background:rgba(56,189,248,.05);border:1px solid rgba(56,189,248,.18);border-radius:14px;padding:18px 20px;margin-bottom:24px">\n'
        html += '      <div style="font-weight:700;font-size:.95rem;color:#38bdf8;margin-bottom:12px">💡 Key Takeaways for Beginners</div>\n'
        for t in takeaways:
            html += f'      <div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:10px;font-size:.86rem;color:#cbd5e1;line-height:1.65"><span style="color:#38bdf8;flex-shrink:0">▸</span><span>{t}</span></div>\n'
        html += '    </div>\n\n'

    # ── PRODUCTION CODE ──
    if code:
        html += '    <!-- 💻 Production Pattern -->\n'
        html += '    <div style="background:#111827;border:1px solid #1f2d45;border-radius:14px;overflow:hidden;margin-bottom:24px">\n'
        html += f'      <div style="padding:14px 18px;border-bottom:1px solid #1f2d45;font-weight:700;font-size:.95rem;color:#86efac">💻 {code_title}</div>\n'
        html += f'      <pre style="margin:0;padding:16px 18px;font-family:\'Fira Code\',monospace;font-size:.78rem;color:#94a3b8;overflow-x:auto;line-height:1.8;background:#0d1117"><code>{code}</code></pre>\n'
        html += '    </div>\n'

    html += '  </div>\n'
    return html


# ─── INJECTION LOGIC ──────────────────────────────────────────────────

def inject_into_file(filepath, lesson_key):
    if lesson_key not in LESSONS:
        return False

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Skip if already enhanced
    if 'BEGINNER REFERENCE SECTIONS' in content:
        print(f'  ⏭️  Already enhanced: {filepath}')
        return False

    section_html = build_section(LESSONS[lesson_key])

    # Find injection point: before the nav bar (either class-based or inline-style)
    # Pattern 1: <div class="nav-bar">
    idx = content.find('<div class="nav-bar">')
    # Pattern 2: inline-style nav
    if idx == -1:
        idx = content.find('<div style="display:flex;gap:10px;justify-content:center;padding:24px')
    # Pattern 3: before </body>
    if idx == -1:
        idx = content.find('</body>')

    if idx == -1:
        print(f'  ❌ No injection point found: {filepath}')
        return False

    new_content = content[:idx] + section_html + '\n' + content[idx:]

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f'  ✅ Enhanced: {filepath}')
    return True


# ─── MAIN ─────────────────────────────────────────────────────────────

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))

    lesson_files = {
        "learn.html": "learn.html",
        "learn2.html": "learn2.html",
        "learn3.html": "learn3.html",
        "learn4.html": "learn4.html",
        "learn5.html": "learn5.html",
        "learn6.html": "learn6.html",
        "learn7.html": "learn7.html",
        "learn8.html": "learn8.html",
        "learn9.html": "learn9.html",
        "learn10.html": "learn10.html",
        "learn11.html": "learn11.html",
        "learn12.html": "learn12.html",
        "learn13.html": "learn13.html",
        "learn14.html": "learn14.html",
        "learn15.html": "learn15.html",
        "learn16.html": "learn16.html",
        "learn17.html": "learn17.html",
        "learn18.html": "learn18.html",
        "learn19.html": "learn19.html",
        "learn20.html": "learn20.html",
        "learn21.html": "learn21.html",
        "learn22.html": "learn22.html",
        "learn23.html": "learn23.html",
        "learn24.html": "learn24.html",
        "learn25.html": "learn25.html",
        "learn26.html": "learn26.html",
        "learn27.html": "learn27.html",
        "learn28.html": "learn28.html",
    }

    count = 0
    for lesson_key, filename in lesson_files.items():
        filepath = os.path.join(base_dir, filename)
        if os.path.exists(filepath):
            if inject_into_file(filepath, lesson_key):
                count += 1
        else:
            print(f'  ⚠️  File not found: {filepath}')

    print(f'\n🏁 Done! Enhanced {count} lesson files.')


if __name__ == '__main__':
    main()
