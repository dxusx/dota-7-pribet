// Antigravity <-> Figma Live Bridge Server
import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = 8765;
let commandQueue = [];
let commandHistory = [];
let commandIdCounter = 0;
let lastPluginPing = 0;
let waitingPollResponses = [];

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Figma-Token');
}

const server = http.createServer((req, res) => {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  // 1. Health / Status check
  if (url.pathname === '/api/status') {
    const isPluginActive = (Date.now() - lastPluginPing) < 5000;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      running: true,
      port: PORT,
      pluginConnected: isPluginActive,
      lastPingSecAgo: Math.round((Date.now() - lastPluginPing) / 1000),
      pendingCommands: commandQueue.length,
      historyCount: commandHistory.length
    }));
    return;
  }

  // 2. Figma Plugin Polls for commands (Long polling or fast poll)
  if (url.pathname === '/api/poll') {
    lastPluginPing = Date.now();
    const lastSeenId = parseInt(url.searchParams.get('lastId') || '0', 10);

    // Check if there are commands newer than lastSeenId
    const pending = commandQueue.filter(cmd => cmd.id > lastSeenId);
    if (pending.length > 0) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ commands: pending }));
      return;
    }

    // Otherwise, hold response for up to 3 seconds for real-time responsiveness
    const timeout = setTimeout(() => {
      // Remove from waiting list
      waitingPollResponses = waitingPollResponses.filter(w => w.res !== res);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ commands: [] }));
    }, 3000);

    waitingPollResponses.push({ res, timeout });
    return;
  }

  // 3. Post a command from Antigravity Agent to Figma
  if (url.pathname === '/api/execute' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const command = {
          id: ++commandIdCounter,
          timestamp: Date.now(),
          action: payload.action || 'EVAL',
          data: payload.data || {},
          code: payload.code || null
        };

        commandQueue.push(command);
        commandHistory.push(command);
        if (commandQueue.length > 50) commandQueue.shift();

        // Immediately wake up all waiting long-poll listeners
        while (waitingPollResponses.length > 0) {
          const waiter = waitingPollResponses.shift();
          clearTimeout(waiter.timeout);
          waiter.res.writeHead(200, { 'Content-Type': 'application/json' });
          waiter.res.end(JSON.stringify({ commands: [command] }));
        }

        console.log(`[BRIDGE] Enqueued Command #${command.id} [${command.action}]`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, commandId: command.id }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // 4. Figma Plugin reports back result of execution
  if (url.pathname === '/api/result' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const result = JSON.parse(body);
        lastPluginPing = Date.now();
        console.log(`[BRIDGE] Result for Command #${result.commandId}: ${result.success ? 'SUCCESS' : 'FAILED'} — ${result.message || ''}`);
        
        // Update history
        const item = commandHistory.find(c => c.id === result.commandId);
        if (item) {
          item.result = result;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ received: true }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // 5. Serve Avatars & Images
  if (url.pathname.startsWith('/avatars/')) {
    const filename = path.basename(url.pathname);
    const filepath = path.join('./public/avatars', filename);
    if (fs.existsSync(filepath)) {
      const mime = filename.endsWith('.png') ? 'image/png' : filename.endsWith('.svg') ? 'image/svg+xml' : 'image/jpeg';
      res.writeHead(200, { 'Content-Type': mime });
      res.end(fs.readFileSync(filepath));
      return;
    }
  }

  // 6. Base64 Avatar Endpoint for Figma
  if (url.pathname === '/api/avatar-base64') {
    const filename = url.searchParams.get('name') || 'gojo_avatar.png';
    const filepath = path.join('./public/avatars', path.basename(filename));
    if (fs.existsSync(filepath)) {
      const b64 = fs.readFileSync(filepath).toString('base64');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, base64: b64 }));
      return;
    }
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Avatar not found' }));
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`====================================================`);
  console.log(`🚀 Antigravity Figma Live Bridge Server running!`);
  console.log(`📡 URL: http://127.0.0.1:${PORT}`);
  console.log(`💡 Status check: http://127.0.0.1:${PORT}/api/status`);
  console.log(`====================================================`);
});
