# 📡 WebSocket Learning Hub
### 🚀 [Launch Live Demo](https://anudeepbikumalla.github.io/websockets-learn/)

An interactive, premium lesson-by-lesson WebSocket course built for modern developers. 
Master real-time communication from basics to advanced production patterns — no install (for UI), no build step, just open and learn.

---

## ✨ Features
- **28 Interactive Lessons**: From lifecycle basics to Redis scaling and WebRTC.
- **Live Backend Integration**: Automatically connects to a production-ready Render.com backend.
- **Backend Status Monitoring**: Visual health indicator shows if the server is "Online" or "Sleeping".
- **Zero Configuration**: Ready to use immediately on GitHub Pages or locally.
- **Premium UI**: Modern, dark-themed aesthetics with rich interactive simulators.

---

## ✅ Completed Lessons (1–28)

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

## 🌎 Live Deployment

### 1. Hosted UI (GitHub Pages)
The UI is automatically deployed via GitHub Actions.
URL: `https://anudeepbikumalla.github.io/websockets-learn/`

### 2. Hosted Backend (Render.com)
The Node.js backend runs on Render's free tier.
URL: `https://websockets-learn-backend.onrender.com/health`

### 🔌 Intelligent Connection
- **Automatic**: The Hub detects its environment. On GitHub Pages, it defaults to the **Render Backend**.
- **Cold Starts**: If the server has been idle, it might take **30-50 seconds** to wake up. Watch the **Backend Status Bar** at the top of the hub!
- **Settings**: Click the ⚙️ icon in the bottom right to manually change the Backend URL if needed.

---

## 🚀 Local Development

```bash
# 1. Install dependencies
npm install ws

# 2. Start the local server
node server.js

# 3. Open index.html in your browser
```

## 📁 Project Structure
- `index.html`: The Hub & Curriculum.
- `learn*.html`: 28 Interactive Lessons.
- `client.html`: Advanced 4-Pattern Demo.
- `server.js`: Universal WebSocket Server.
- `config.js`: Dynamic URL Resolution Logic.
- `WEBSOCKET_STUDY_NOTES.md`: Comprehensive reference guide.

---

## 🔗 Repository
[github.com/anudeepbikumalla/websockets-learn](https://github.com/anudeepbikumalla/websockets-learn)
