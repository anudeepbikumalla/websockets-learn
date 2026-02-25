# 📡 WebSocket Learning Hub

An interactive, lesson-by-lesson WebSocket course built in plain HTML/JS.
Open `index.html` to start — no install, no build step, just open in a browser.

> **Server required for live demos:** `node server.js`

---

## ✅ Completed Lessons (1–28)

### Core Fundamentals
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

### Intermediate Patterns
| # | File | Topic |
|---|---|---|
| 9 | `learn9.html` | Heartbeat & Ping-Pong (keep connections alive through load balancers) |
| 10 | `learn10.html` | Binary Data & File Transfer (`ArrayBuffer`, `Blob`, chunked upload) |
| 11 | `learn11.html` | Scaling WebSockets (Redis Pub/Sub, multiple servers) |
| 12 | `learn12.html` | WS vs SSE vs Long Polling — when to use each |
| 13 | `learn13.html` | Rate Limiting & Throttling (Token Bucket algorithm) |
| 14 | `learn14.html` | Shared Express + WS Server (Same-port patterns) |
| 15 | `learn15.html` | Presence System (Who's online registry) |
| 16 | `learn16.html` | Typing Indicators (Debouncing logic) |
| 17 | `learn17.html` | Message History & Replay (Ring buffer/DB replay) |
| 18 | `learn18.html` | Offline Queue (Message buffering) |

### Advanced & Production
| # | File | Topic |
|---|---|---|
| 19 | `learn19.html` | WebSocket with React (`useWebSocket` custom hook) |
| 20 | `learn20.html` | Socket.io comparison (Managed reconnect, namespaces) |
| 21 | `learn21.html` | WebSocket Security (CORS, Origin validation, DDoS) |
| 22 | `learn22.html` | TypeScript + WebSocket (Type safety, Zod validation) |
| 23 | `learn23.html` | Collaborative Editing (OT basics, Yjs) |
| 24 | `learn24.html` | WebRTC Signaling (P2P signaling flow) |
| 25 | `learn25.html` | Testing WebSockets (Jest, real clients vs mocks) |
| 26 | `learn26.html` | Monitoring & Logging (Metrics, JSON logs) |
| 27 | `learn27.html` | Load Testing (Artillery, benchmarks) |
| 28 | `learn28.html` | Deployment (Docker, nginx, AWS ALB, Graceful Shutdown) |

---

## 🗺️ What to Learn Next

Congratulations on finishing all 28 lessons! Here is your roadmap forward:

1. **Master the Backend:** Dive deeper into **Express.js** or **NestJS** to build robust APIs around your real-time services.
2. **Data Persistence:** Learn **PostgreSQL** (relational) and **Redis** (caching/PubSub) to handle large-scale message storage.
3. **Frontend Mastery:** Learn **React** or **Next.js** to build professional UIs for your WebSocket apps.
4. **System Design:** Study the **CAP Theorem** and **Message Queues** (Kafka/RabbitMQ) for building massive-scale distributed systems.

---

## 📁 Project Files

```
project-backend/
├── index.html                   ← Hub page (start here)
├── learn.html → learn28.html    ← All 28 interactive lessons
├── client.html                  ← Advanced 4-pattern demo
├── server.js                    ← Node.js WebSocket server  
└── WEBSOCKET_STUDY_NOTES.md     ← Comprehensive reference notes
```

## 🚀 Quick Start

```bash
# Install dependencies
npm install ws

# Start the WebSocket server
node server.js

# Open index.html in your browser
```

---

## 🔗 Repo

[github.com/anudeepbikumalla/websockets-learn](https://github.com/anudeepbikumalla/websockets-learn)
