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

const WebSocket = require("ws");
const http = require("http");

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

// ═════════════════════════════════════════════════════════════════════════════
// SERVER A — Port 8080
// PATTERN 1: Using .on() event handlers  (addEventListener / EventEmitter)
// PATTERN 3: Callback-based server processing
// PATTERN 4: async/await server processing
// ═════════════════════════════════════════════════════════════════════════════
const httpServer = http.createServer((_, res) => res.end("WS Teaching Server\n"));
const wssWithOn = new WebSocket.Server({ server: httpServer });

// ✅ PATTERN 1 — .on("connection") to get the socket, then .on() for all events
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

  // ✅ PATTERN 1 — .on("message") listens to incoming messages
  ws.on("message", async (raw) => {
    log.on(`.on('message') fired — raw bytes received`);
    log.teach("ws.on('message', handler) ← EventEmitter style listener");

    const text = raw.toString();
    let msg;
    try { msg = JSON.parse(text); } catch { msg = { type: "raw", data: text }; }

    // ── PATTERN 3: callback-request ────────────────────────────────────────
    if (msg.type === "callback-request") {
      log.cb(`callback-request received for: "${msg.data}"`);
      log.teach("PATTERN 3: calling processWithCallback(data, (err,result) => {...})");
      processWithCallback(msg.data, (err, result) => {
        if (err) {
          log.err(`Callback error: ${err.message}`);
          ws.send(JSON.stringify({ type: "callback-error", error: err.message }));
        } else {
          log.cb(`Callback succeeded — sending result back`);
          ws.send(JSON.stringify({ type: "callback-response", pattern: "WITH CALLBACK", result }));
        }
      });

      // ── PATTERN 4: async-request ───────────────────────────────────────────
    } else if (msg.type === "async-request") {
      log.nocb(`async-request received for: "${msg.data}"`);
      log.teach("PATTERN 4: using 'await processWithPromise(data)' — no callback!");
      try {
        const result = await processWithPromise(msg.data);
        log.nocb(`Async succeeded — sending result back`);
        ws.send(JSON.stringify({ type: "async-response", pattern: "WITHOUT CALLBACK (async/await)", result }));
      } catch (err) {
        log.err(`Async error: ${err.message}`);
        ws.send(JSON.stringify({ type: "async-error", error: err.message }));
      }

      // ── Echo ───────────────────────────────────────────────────────────────
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

  // ✅ PATTERN 1 — .on("close") and .on("error")
  ws.on("close", (code) => {
    log.on(`.on('close') fired. Code: ${code}`);
    log.teach("ws.on('close', handler) ← fires when client disconnects");
  });
  ws.on("error", (err) => {
    log.err(`.on('error') fired: ${err.message}`);
  });
});

// ─── Start servers ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 8080;

// Update Server A to handle both if we're on a single port (like Render)
httpServer.on("upgrade", (request, socket, head) => {
  const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;

  if (pathname === "/p2") {
    wssWithoutOn.handleUpgrade(request, socket, head, (ws) => {
      wssWithoutOn.emit("connection", ws, request);
    });
  } else {
    // Default to Pattern 1
    wssWithOn.handleUpgrade(request, socket, head, (ws) => {
      wssWithOn.emit("connection", ws, request);
    });
  }
});

// Add health check for deployments
httpServer.on("request", (req, res) => {
  if (req.url === "/health") {
    res.writeHead(200);
    res.end("ok");
    return;
  }
});

httpServer.listen(PORT, () => {
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

// If local and not explicitly restricted, we can still open 8081 for backward compat
if (!process.env.PORT) {
  try {
    const wss8081 = new WebSocket.Server({ port: 8081 });
    wss8081.on("connection", (ws) => {
      // Proxy to the same singleton logic if wanted, or just keep legacy
      wssWithoutOn.emit("connection", ws); 
    });
    console.log(`${C.yellow}[LOCAL] Also listening on Port 8081 for legacy learn files${C.reset}`);
  } catch (e) {}
}

