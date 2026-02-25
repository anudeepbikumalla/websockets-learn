# 📡 WebSocket Learning Hub

An interactive, lesson-by-lesson WebSocket course built in plain HTML/JS.
Open `index.html` to start — no install, no build step, just open in a browser.

> **Server required for live demos:** `node server.js`

---

## ✅ Completed Lessons (1–12)

| # | File | Topic |
|---|---|---|
| 1 | `learn.html` | WebSocket Basics & Lifecycle (`open`, `message`, `close`, `error`) |
| 2 | `learn2.html` | `addEventListener` vs `onmessage` (and why overwriting silently breaks things) |
| 3 | `learn3.html` | Callbacks vs Async/Await (callback hell → clean async code) |
| 4 | `learn4.html` | Mini Project — Live Chat App (capstone for Lessons 1–3) |
| 5 | `learn5.html` | Error Handling & Auto-Reconnect (exponential backoff, close codes) |
| 6 | `learn6.html` | Broadcasting — server sends to all connected clients |
| 7 | `learn7.html` | Rooms & Channels (`Map<string, Set<WebSocket>>`) |
| 8 | `learn8.html` | Authentication (token query string, JWT flow, close code 4001) |
| 9 | `learn9.html` | Heartbeat & Ping-Pong (keep connections alive through load balancers) |
| 10 | `learn10.html` | Binary Data & File Transfer (`ArrayBuffer`, `Blob`, chunked upload) |
| 11 | `learn11.html` | Scaling WebSockets (Redis Pub/Sub, multiple servers) |
| 12 | `learn12.html` | WS vs SSE vs Long Polling — when to use each |

---

## 🔜 Future Lessons (13+)

### Intermediate

| # | File | Topic |
|---|---|---|
| 13 | `learn13.html` | **Rate Limiting & Throttling** — prevent message flooding; token bucket algorithm |
| 14 | `learn14.html` | **Shared HTTP + WS Server** — mount WebSocket on an existing Express.js server |
| 15 | `learn15.html` | **Presence System** — "who's online" using join/leave events and a user registry |
| 16 | `learn16.html` | **Typing Indicators** — detect and broadcast "User is typing…" in real-time |
| 17 | `learn17.html` | **Message History & Replay** — store messages in DB, replay missed messages on reconnect |
| 18 | `learn18.html` | **Offline Queue** — buffer messages while client is disconnected, flush on reconnect |

### Advanced

| # | File | Topic |
|---|---|---|
| 19 | `learn19.html` | **WebSocket with React** — `useWebSocket` custom hook, cleanup on unmount |
| 20 | `learn20.html` | **Socket.io** — managed reconnect, rooms, namespaces, Redis adapter |
| 21 | `learn21.html` | **WebSocket Security** — CORS, Origin header validation, DDoS protection |
| 22 | `learn22.html` | **WebSocket with TypeScript** — typed messages, discriminated unions, zod validation |
| 23 | `learn23.html` | **Collaborative Editing** — Operational Transformation (OT) basics, conflict resolution |
| 24 | `learn24.html` | **WebRTC via WebSocket Signaling** — use WS as the signaling channel for P2P video/audio |

### Testing & Production

| # | File | Topic |
|---|---|---|
| 25 | `learn25.html` | **Testing WebSockets** — Jest + `ws` mock, integration tests, simulating close events |
| 26 | `learn26.html` | **Monitoring & Logging** — connection counts, message rates, Prometheus metrics |
| 27 | `learn27.html` | **Load Testing** — `autocannon`, `artillery` — how many concurrent connections can your server hold? |
| 28 | `learn28.html` | **Deployment** — Docker, nginx WebSocket proxy config, AWS EC2 + ALB setup |

---

## 📁 Project Files

```
project-backend/
├── index.html                  ← Hub page (start here)
├── learn.html → learn12.html   ← Completed lessons
├── client.html                 ← Advanced 4-pattern demo
├── server.js                   ← Node.js WebSocket server  
└── WEBSOCKET_STUDY_NOTES.md    ← Reference notes for all lessons
```

## 🚀 Quick Start

```bash
# Install dependencies
npm install ws

# Start the WebSocket server
node server.js

# Open index.html in your browser
# (no build step needed)
```

---

## 🔗 Repo

[github.com/anudeepbikumalla/websockets-learn](https://github.com/anudeepbikumalla/websockets-learn)
