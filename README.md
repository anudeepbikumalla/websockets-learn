# 📡 WebSocket Learning Hub

### 🚀 [Launch Live Demo](https://htmlpreview.github.io/?https://github.com/anudeepbikumalla/websockets-learn/blob/main/index.html)

An interactive, lesson-by-lesson WebSocket course built in plain HTML/JS.
Open `index.html` to start — no build step needed, just open in a browser.

> **Server required for live demos:** `node server.js`

---

## ✨ Features
- **28 Interactive Lessons**: From lifecycle basics to Redis scaling and WebRTC.
- **Premium UI**: Modern, dark-themed aesthetics with rich interactive simulators.
- **Zero Build Step**: Plain HTML/CSS/JS — works in any browser.
- **Customizable Backend**: Connect to any WebSocket server via the Settings modal.

---

## 🌎 Live Demo

Browse all lessons online — no setup required:

| Page | Link |
|---|---|
| 🏠 **Hub** | [Open Hub](https://htmlpreview.github.io/?https://github.com/anudeepbikumalla/websockets-learn/blob/main/index.html) |
| 📖 Lesson 1 | [WebSocket Basics](https://htmlpreview.github.io/?https://github.com/anudeepbikumalla/websockets-learn/blob/main/learn.html) |
| 📖 Lesson 2 | [Listeners vs Properties](https://htmlpreview.github.io/?https://github.com/anudeepbikumalla/websockets-learn/blob/main/learn2.html) |
| 📖 Lesson 3 | [Callbacks vs Async](https://htmlpreview.github.io/?https://github.com/anudeepbikumalla/websockets-learn/blob/main/learn3.html) |
| 📖 Lesson 4 | [Live Chat Project](https://htmlpreview.github.io/?https://github.com/anudeepbikumalla/websockets-learn/blob/main/learn4.html) |
| 📖 Lesson 5–28 | Replace `learn4.html` with `learn5.html` through `learn28.html` in the URL |

---

## ✅ All 28 Lessons

### Core Fundamentals
| # | File | Topic |
|---|---|---|
| 1 | `learn.html` | WebSocket Basics & Lifecycle (`open`, `message`, `close`, `error`) |
| 2 | `learn2.html` | `addEventListener` vs `onmessage` (And why overwriting breaks things) |
| 3 | `learn3.html` | Callbacks vs Async/Await (Callback hell → Clean async code) |
| 4 | `learn4.html` | **Mini Project** — Live Chat App (Capstone for Lessons 1–3) |
| 5 | `learn5.html` | Error Handling & Auto-Reconnect (Exponential backoff) |
| 6 | `learn6.html` | Broadcasting — Server sends to all connected clients |
| 7 | `learn7.html` | Rooms & Channels (`Map<string, Set<WebSocket>>`) |
| 8 | `learn8.html` | Authentication (Token query string, JWT flow) |

### Intermediate Patterns
| # | File | Topic |
|---|---|---|
| 9 | `learn9.html` | Heartbeat & Ping-Pong (Keep connections alive) |
| 10 | `learn10.html` | Binary Data & File Transfer (`ArrayBuffer`, `Blob`) |
| 11 | `learn11.html` | Scaling WebSockets (Redis Pub/Sub, Multi-server) |
| 12 | `learn12.html` | WS vs SSE vs Long Polling — When to use each |
| 13 | `learn13.html` | Rate Limiting (Token Bucket algorithm) |
| 14 | `learn14.html` | Shared Express + WS Server (Same-port patterns) |
| 15 | `learn15.html` | Presence System (Who's online registry) |
| 16 | `learn16.html` | Typing Indicators (Debouncing logic) |
| 17 | `learn17.html` | Message History & Replay (Ring buffer/DB replay) |
| 18 | `learn18.html` | Offline Queue (Message buffering) |

### Advanced & Production
| # | File | Topic |
|---|---|---|
| 19 | `learn19.html` | WebSocket with React (`useWebSocket` hook) |
| 20 | `learn20.html` | Socket.io comparison (Managed reconnect, namespaces) |
| 21 | `learn21.html` | WebSocket Security (CORS, Origin validation, DDoS) |
| 22 | `learn22.html` | TypeScript + WebSocket (Type safety, Zod validation) |
| 23 | `learn23.html` | Collaborative Editing (OT basics, Yjs) |
| 24 | `learn24.html` | WebRTC Signaling (P2P signaling flow) |
| 25 | `learn25.html` | Testing WebSockets (Jest, real clients vs mocks) |
| 26 | `learn26.html` | Monitoring & Logging (Metrics, JSON logs) |
| 27 | `learn27.html` | Load Testing (Artillery, benchmarks) |
| 28 | `learn28.html` | Deployment (Docker, Nginx, ALB, Graceful Shutdown) |

---

## 🚀 Local Development

```bash
# 1. Install dependencies
npm install ws

# 2. Start the WebSocket server
node server.js

# 3. Open index.html in your browser
```

---

## 📁 Project Structure

```
project-backend/
├── index.html                   ← Hub page (start here)
├── learn.html → learn28.html    ← All 28 interactive lessons
├── client.html                  ← Advanced 4-pattern demo
├── server.js                    ← Node.js WebSocket server
├── config.js                    ← WebSocket URL configuration
└── WEBSOCKET_STUDY_NOTES.md     ← Comprehensive reference notes
```

---

## 🔗 Repository

[github.com/anudeepbikumalla/websockets-learn](https://github.com/anudeepbikumalla/websockets-learn)
