import re

base = r'C:\Users\Anudeep\Desktop\project-backend'
fpath = base + r'\index.html'

with open(fpath, 'r', encoding='utf-8') as f:
    content = f.read()

new_cards = """
      <!-- ── Intermediate (13-18) ─────────────────────────────── -->
      <div style="grid-column:1/-1;margin-top:16px">
        <div style="font-size:.75rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;padding:0 2px">⚡ Intermediate</div>
      </div>

      <div class="card" onclick="window.location='learn13.html'">
        <div class="card-num">13</div>
        <div class="card-body">
          <div class="card-title">Rate Limiting & Throttling 🛡️</div>
          <div class="card-desc">Token Bucket algorithm — protect your server from message flooding and DoS attacks.</div>
          <div class="card-demo">🎮 Demo: Token bucket visualizer — spam and watch it drain</div>
          <div class="card-path">learn13.html</div>
        </div>
      </div>

      <div class="card" onclick="window.location='learn14.html'">
        <div class="card-num">14</div>
        <div class="card-body">
          <div class="card-title">Shared Express + WS Server ⚡</div>
          <div class="card-desc">Mount WebSocket on an existing Express app — HTTP and WS on the same port 3000.</div>
          <div class="card-path">learn14.html</div>
        </div>
      </div>

      <div class="card" onclick="window.location='learn15.html'">
        <div class="card-num">15</div>
        <div class="card-body">
          <div class="card-title">Presence System 🟢</div>
          <div class="card-desc">Track who's online with a Map-based user registry. Broadcast join/leave events.</div>
          <div class="card-demo">🎮 Demo: Add/remove users — live online list updates</div>
          <div class="card-path">learn15.html</div>
        </div>
      </div>

      <div class="card" onclick="window.location='learn16.html'">
        <div class="card-num">16</div>
        <div class="card-body">
          <div class="card-title">Typing Indicators ⌨️</div>
          <div class="card-desc">Debounced "Alice is typing…" — send events efficiently, stop after 2s inactivity.</div>
          <div class="card-demo">🎮 Demo: Two-user chat with live typing indicators</div>
          <div class="card-path">learn16.html</div>
        </div>
      </div>

      <div class="card" onclick="window.location='learn17.html'">
        <div class="card-num">17</div>
        <div class="card-body">
          <div class="card-title">Message History & Replay 📜</div>
          <div class="card-desc">Ring buffer — store last 50 messages, replay to every new connection on join.</div>
          <div class="card-demo">🎮 Demo: Simulate new connection — history replays</div>
          <div class="card-path">learn17.html</div>
        </div>
      </div>

      <div class="card" onclick="window.location='learn18.html'">
        <div class="card-num">18</div>
        <div class="card-body">
          <div class="card-title">Offline Queue 📬</div>
          <div class="card-desc">Buffer messages while disconnected, flush automatically on reconnect.</div>
          <div class="card-demo">🎮 Demo: Go offline, queue messages, come back online</div>
          <div class="card-path">learn18.html</div>
        </div>
      </div>

      <!-- ── Advanced (19-24) ──────────────────────────────────── -->
      <div style="grid-column:1/-1;margin-top:16px">
        <div style="font-size:.75rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;padding:0 2px">🔥 Advanced</div>
      </div>

      <div class="card" onclick="window.location='learn19.html'">
        <div class="card-num">19</div>
        <div class="card-body">
          <div class="card-title">WebSocket with React ⚛️</div>
          <div class="card-desc">useWebSocket custom hook — create once, cleanup on unmount, prevent memory leaks.</div>
          <div class="card-path">learn19.html</div>
        </div>
      </div>

      <div class="card" onclick="window.location='learn20.html'">
        <div class="card-num">20</div>
        <div class="card-body">
          <div class="card-title">Socket.io ⚡</div>
          <div class="card-desc">Rooms, namespaces, auto-reconnect, Redis adapter — vs raw ws comparison.</div>
          <div class="card-path">learn20.html</div>
        </div>
      </div>

      <div class="card" onclick="window.location='learn21.html'">
        <div class="card-num">21</div>
        <div class="card-body">
          <div class="card-title">WebSocket Security 🔒</div>
          <div class="card-desc">Origin validation, message sanitization, TLS (wss://), DoS prevention checklist.</div>
          <div class="card-path">learn21.html</div>
        </div>
      </div>

      <div class="card" onclick="window.location='learn22.html'">
        <div class="card-num">22</div>
        <div class="card-body">
          <div class="card-title">TypeScript + WebSocket 🟦</div>
          <div class="card-desc">Discriminated unions, Zod runtime validation — full type safety end to end.</div>
          <div class="card-path">learn22.html</div>
        </div>
      </div>

      <div class="card" onclick="window.location='learn23.html'">
        <div class="card-num">23</div>
        <div class="card-body">
          <div class="card-title">Collaborative Editing 📝</div>
          <div class="card-desc">OT basics, conflict resolution — and when to use Yjs instead of building it yourself.</div>
          <div class="card-demo">🎮 Demo: Two editors, one shared document</div>
          <div class="card-path">learn23.html</div>
        </div>
      </div>

      <div class="card" onclick="window.location='learn24.html'">
        <div class="card-num">24</div>
        <div class="card-body">
          <div class="card-title">WebRTC Signaling 📹</div>
          <div class="card-desc">WebSocket as the signaling channel for peer-to-peer video/audio connections.</div>
          <div class="card-path">learn24.html</div>
        </div>
      </div>

      <!-- ── Testing & Production (25-28) ─────────────────────── -->
      <div style="grid-column:1/-1;margin-top:16px">
        <div style="font-size:.75rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;padding:0 2px">🏭 Testing & Production</div>
      </div>

      <div class="card" onclick="window.location='learn25.html'">
        <div class="card-num">25</div>
        <div class="card-body">
          <div class="card-title">Testing WebSockets 🧪</div>
          <div class="card-desc">Integration tests with real ws client, unit tests with jest.fn() mocks.</div>
          <div class="card-path">learn25.html</div>
        </div>
      </div>

      <div class="card" onclick="window.location='learn26.html'">
        <div class="card-num">26</div>
        <div class="card-body">
          <div class="card-title">Monitoring & Logging 📊</div>
          <div class="card-desc">JSON structured logs, /metrics endpoint for Prometheus/Grafana, alerting rules.</div>
          <div class="card-demo">🎮 Demo: Live metrics dashboard — simulate server events</div>
          <div class="card-path">learn26.html</div>
        </div>
      </div>

      <div class="card" onclick="window.location='learn27.html'">
        <div class="card-num">27</div>
        <div class="card-body">
          <div class="card-title">Load Testing ⚡</div>
          <div class="card-desc">Artillery config, benchmark scripts — how many connections can your server handle?</div>
          <div class="card-path">learn27.html</div>
        </div>
      </div>

      <div class="card" onclick="window.location='learn28.html'" style="border-color:rgba(34,197,94,.3)">
        <div class="card-num" style="color:#22c55e">28</div>
        <div class="card-body">
          <div class="card-title">Deployment 🚀</div>
          <div class="card-desc">Docker, nginx WS config, AWS ALB sticky sessions, graceful shutdown — full production checklist.</div>
          <div class="card-path" style="color:#22c55e">learn28.html — Final Lesson 🏆</div>
        </div>
      </div>
"""

# Find the closing of the last existing lesson card and the closing grid div
# We'll insert before the closing </div> of the card-grid
marker = '      <!-- end of cards -->'
if marker in content:
    content = content.replace(marker, new_cards + '\n      <!-- end of cards -->')
else:
    # fallback: insert before </div>\n    </main>
    content = content.replace('      </div>\n    </main>', new_cards + '\n      </div>\n    </main>', 1)

# Update lesson count in the header stats
content = re.sub(r'(\d+)\s*Lessons', '28 Lessons', content, count=1)

with open(fpath, 'w', encoding='utf-8') as f:
    f.write(content)

print('Done! index.html updated.')
