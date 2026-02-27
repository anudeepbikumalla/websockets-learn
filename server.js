/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║         WebSocket SERVER — Teaching Mode                        ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Port 8080 → Pattern 1 (with .on())                            ║
 * ║             Pattern 3 (with callbacks)                          ║
 * ║             Pattern 4 (without callbacks / async-await)         ║
 * ║  Port 8081 → Pattern 2 (without .on() / direct properties)     ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

require('dotenv').config();
const WebSocket = require("ws");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { HfInference } = require("@huggingface/inference");

// create HF client when token is present
const hf = process.env.HF_API_TOKEN ? new HfInference({ apiKey: process.env.HF_API_TOKEN }) : null;

// ─── Color-coded logger ───────────────────────────────────────────────────────
const C = { reset: "\x1b[0m", cyan: "\x1b[36m", yellow: "\x1b[33m", green: "\x1b[32m", magenta: "\x1b[35m", red: "\x1b[31m", blue: "\x1b[34m", bold: "\x1b[1m" };
const log = {
  on: (...a) => console.log(`${C.cyan}[WITH .on()]       ${C.reset}`, ...a),
  noon: (...a) => console.log(`${C.yellow}[WITHOUT .on()]   ${C.reset}`, ...a),
  cb: (...a) => console.log(`${C.green}[WITH CALLBACK]   ${C.reset}`, ...a),
  nocb: (...a) => console.log(`${C.magenta}[ASYNC/AWAIT]     ${C.reset}`, ...a),
  info: (...a) => console.log(`${C.blue}[INFO]            ${C.reset}`, ...a),
  err: (...a) => console.log(`${C.red}[ERROR]           ${C.reset}`, ...a),
  teach: (...a) => console.log(`${C.bold}  📚 TEACHING:    ${C.reset}`, ...a),
};

// ─── TEACHING HELPER: Callback style ─────────────────────────────────────────
// Pattern 3 — Traditional Node.js callback(err, result)
function processWithCallback(data, callback) {
  log.cb(`processWithCallback("${data}", callback) called`);
  log.teach("Server is using the CALLBACK pattern: callback(err, result)");
  setTimeout(() => {
    if (!data || !data.trim()) return callback(new Error("No data provided"));
    callback(null, {
      processed: `[CALLBACK RESULT] "${data}"`,
      handledBy: "processWithCallback(data, callback)",
      style: "Traditional Node.js callback — callback(err, result)",
      note: "The 2nd argument is the callback fn. null = no error.",
      timestamp: new Date().toISOString(),
    });
  }, 600);
}

// ─── TEACHING HELPER: Promise / async-await style ────────────────────────────
// Pattern 4 — Returns a Promise; caller can use await
function processWithPromise(data) {
  log.nocb(`processWithPromise("${data}") called — returns a Promise`);
  log.teach("Server is using ASYNC/AWAIT pattern: no callback parameter!");
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!data || !data.trim()) return reject(new Error("No data provided"));
      resolve({
        processed: `[ASYNC/AWAIT RESULT] "${data}"`,
        handledBy: "await processWithPromise(data)",
        style: "Modern async/await — zero callbacks",
        note: "Returns a Promise. Caller uses 'await' instead of a callback.",
        timestamp: new Date().toISOString(),
      });
    }, 600);
  });
}

// ─── WebSocket Knowledge Base (Fallback) ──────────────────────────────────────
const wsKnowledgeBase = {
  "websocket": "WebSocket is a two-way communication protocol that enables real-time bidirectional data exchange between client and server over a single, persistent TCP connection. Unlike HTTP, it stays open, allowing servers to push data to clients without polling.",
  "pattern": "WebSocket patterns refer to different coding styles: Pattern 1 uses .on() event listeners, Pattern 2 accesses properties directly, Pattern 3 uses callbacks, and Pattern 4 uses async/await for modern, cleaner code.",
  "event": "Events in WebSocket are triggered when connection opens, receives messages, encounters errors, or closes. You handle them with .on('open'), .on('message'), .on('error'), and .on('close') listeners.",
  "async": "Async/await is modern JavaScript syntax for handling asynchronous operations cleanly without callbacks. Use 'await' before promises and wrap code in 'async' functions.",
  "callback": "A callback is a function passed as an argument to another function, executed after an operation completes. Traditional Node.js callbacks follow the pattern: callback(err, result).",
  "real-time": "Real-time communication means data flows instantly between client and server. WebSockets enable true real-time applications like chat, live updates, and collaborative tools.",
  "javascript": "JavaScript is a programming language that runs in browsers and servers (Node.js). It's essential for WebSocket programming on both client and server sides.",
  "transmission": "WebSocket message transmission involves sending data frames (text or binary) through the persistent connection. Messages are received via the 'message' event on both client and server."
};

function getKnowledgeBasedResponse(question) {
  const lowerQ = question.toLowerCase();
  for (const [key, answer] of Object.entries(wsKnowledgeBase)) {
    if (lowerQ.includes(key)) {
      return answer;
    }
  }
  return "Great question! While I don't have a specific answer in my knowledge base, this is typically covered in WebSocket tutorials. Try asking about patterns, events, callbacks, or async/await for more detailed responses.";
}

// ═════════════════════════════════════════════════════════════════════════════

const wssWithOn = new WebSocket.Server({ noServer: true });
const wssWithoutOn = new WebSocket.Server({ noServer: true });

// ─── Static File Serving ──────────────────────────────────────────────────────
function serveStaticFile(req, res) {
  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = path.join(__dirname, filePath);
  
  // Security: Prevent path traversal attacks
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  // Try to serve the file
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // If file not found, try to send 404 or index.html for other routes
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end("File not found");
      } else {
        res.writeHead(500);
        res.end("Server error");
      }
      return;
    }

    // Determine content type
    let contentType = 'text/plain';
    if (filePath.endsWith('.html')) contentType = 'text/html';
    else if (filePath.endsWith('.js')) contentType = 'application/javascript';
    else if (filePath.endsWith('.css')) contentType = 'text/css';
    else if (filePath.endsWith('.json')) contentType = 'application/json';

    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
}

const httpServer = http.createServer(async (req, res) => {
  // ─── AI Chat API endpoint ──────────────────────────────────────────────────
  if (req.method === "POST" && req.url === "/api/chat") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", async () => {
      try {
        const { question } = JSON.parse(body);
        if (!question) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: "Question required" }));
        }

        const HF_API_TOKEN = process.env.HF_API_TOKEN;
        if (!HF_API_TOKEN) {
          res.writeHead(500, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ 
            response: "⚠️ AI not configured yet. Instructor needs to add HF_API_TOKEN to .env file"
          }));
        }

        // Use official HF inference client
        if (!hf) {
          res.writeHead(500, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ response: "HF client not initialized" }));
        }

        // Use HfInference SDK for text generation (better model support)
        const systemPrompt = "You are an expert WebSocket programming tutor. Answer questions about WebSocket patterns, event handling, async programming, real-time communication, and JavaScript. Keep answers concise (2-3 sentences), practical, and beginner-friendly.";
        const fullPrompt = `${systemPrompt}\n\nQuestion: ${question}\n\nAnswer:`;

        let aiResponse;
        try {
          const result = await hf.textGeneration({
            model: "EleutherAI/gpt-neo-125M",
            inputs: fullPrompt,
            parameters: {
              max_new_tokens: 150,
              temperature: 0.7
            }
          });
          aiResponse = result.generated_text?.split("Answer:")[1]?.trim() || result.generated_text || null;
        } catch (apiError) {
          console.log("HF API unavailable, using knowledge base fallback...");
          aiResponse = null;
        }

        // Fall back to knowledge base if HF API fails
        if (!aiResponse) {
          aiResponse = getKnowledgeBasedResponse(question);
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ response: aiResponse }));
      } catch (error) {
        console.error("Chat error:", error.message);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ 
          response: `❌ Chat error: ${error.message}`
        }));
      }
    });
    return;
  }

  // ─── Health check ─────────────────────────────────────────────────────────
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    return res.end("ok");
  }

  // ─── Serve static files (HTML, JS, CSS, etc) ──────────────────────────────────
  if (req.method === "GET") {
    return serveStaticFile(req, res);
  }

  res.writeHead(404);
  res.end("Not Found\n");
});

// ✅ PATTERN 1, 3, 4 — Logic for wssWithOn
wssWithOn.on("connection", (ws, req) => {
  const ip = req.socket.remoteAddress;
  log.on(`New client connected from ${ip}`);
  log.teach(".on('connection', handler) ← this is how we receive new clients");

  ws.send(JSON.stringify({
    type: "server-lesson",
    pattern: "PATTERN 1 — WITH .on()",
    port: 8080,
    message: "Connected to Port 8080! Server uses ws.on('message', handler)",
    serverCode: "ws.on('message', (data) => { ... })",
  }));

  // Logic remains the same...
  ws.on("message", async (raw) => {
    const text = raw.toString();
    let msg;
    try { msg = JSON.parse(text); } catch { msg = { type: "raw", data: text }; }

    if (msg.type === "callback-request") {
      processWithCallback(msg.data, (err, result) => {
        if (err) ws.send(JSON.stringify({ type: "callback-error", error: err.message }));
        else ws.send(JSON.stringify({ type: "callback-response", pattern: "WITH CALLBACK", result }));
      });
    } else if (msg.type === "async-request") {
      try {
        const result = await processWithPromise(msg.data);
        ws.send(JSON.stringify({ type: "async-response", pattern: "WITHOUT CALLBACK (async/await)", result }));
      } catch (err) {
        ws.send(JSON.stringify({ type: "async-error", error: err.message }));
      }
    } else {
      ws.send(JSON.stringify({
        type: "echo",
        pattern: "PATTERN 1 — WITH .on()",
        echo: `[Port 8080 .on()] You sent: "${msg.data || text}"`,
        serverCode: "ws.on('message', handler)",
        timestamp: new Date().toISOString(),
      }));
    }
  });

  ws.on("close", (code) => log.on(`.on('close') fired. Code: ${code}`));
  ws.on("error", (err) => log.err(`.on('error') fired: ${err.message}`));
});

// ✅ PATTERN 2 — Logic for wssWithoutOn (Direct Properties)
wssWithoutOn.on("connection", (ws, req) => {
  log.noon(`New client connected (Pattern 2)`);

  ws.send(JSON.stringify({
    type: "server-lesson",
    pattern: "PATTERN 2 — WITHOUT .on()",
    port: 8081,
    message: "Connected to Port 8081! Server uses ws.onmessage = (event) {}",
    serverCode: "ws.onmessage = (event) => { ... }",
  }));

  ws.onmessage = (event) => {
    const text = event.data.toString();
    let msg;
    try { msg = JSON.parse(text); } catch { msg = { data: text }; }

    ws.send(JSON.stringify({
      type: "echo",
      pattern: "PATTERN 2 — WITHOUT .on()",
      echo: `[Port 8081 ws.onmessage] You sent: "${msg.data || text}"`,
      serverCode: "ws.onmessage = (event) => { ... }",
      note: "onmessage only allows ONE handler. .on() allows multiple.",
      timestamp: new Date().toISOString(),
    }));
  };

  ws.onclose = (event) => log.noon(`ws.onclose fired. Code: ${event.code}`);
  ws.onerror = (event) => log.err(`ws.onerror fired`);
});

// ─── Start servers ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 8082;

httpServer.on("upgrade", (request, socket, head) => {
  const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;

  if (pathname === "/p2") {
    wssWithoutOn.handleUpgrade(request, socket, head, (ws) => {
      wssWithoutOn.emit("connection", ws, request);
    });
  } else {
    wssWithOn.handleUpgrade(request, socket, head, (ws) => {
      wssWithOn.emit("connection", ws, request);
    });
  }
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`
${C.bold}${C.blue}╔══════════════════════════════════════════════════════════════════╗
║         WebSocket Teaching Server — DEPLOYMENT READY             ║
╠══════════════════════════════════════════════════════════════════╣
║  ${C.cyan}Main Port: ${PORT}${C.blue}                                             ║
║  ${C.green}Health Check: /health${C.blue}                                           ║
║                                                                  ║
║  Default: Pattern 1 (With .on)                                   ║
║  Path /p2: Pattern 2 (Without .on)                               ║
╚══════════════════════════════════════════════════════════════════╝${C.reset}
  `);
});

// Port 8081 legacy support removed — all lessons now use 8082


