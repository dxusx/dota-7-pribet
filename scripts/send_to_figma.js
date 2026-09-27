// CLI helper to send commands to the Figma Live Bridge
const action = process.argv[2] || 'CREATE_HEROES';
const BRIDGE_URL = 'http://127.0.0.1:8765';

async function send() {
  try {
    let payload = { action };

    if (action.toUpperCase() === 'CREATE_HEROES') {
      payload = { action: 'CREATE_HEROES', data: {} };
    } else if (action.toUpperCase() === 'TEXT') {
      const text = process.argv[3] || 'Привет из Antigravity AI!';
      const x = parseFloat(process.argv[4] || '1000');
      const y = parseFloat(process.argv[5] || '1000');
      payload = {
        action: 'CREATE_TEXT',
        data: { text, x, y, width: 3940, fontSize: 120 }
      };
    } else if (action.toUpperCase() === 'EVAL') {
      const code = process.argv[3] || 'console.log("hello from eval");';
      payload = { action: 'EVAL', code };
    }

    console.log(`Sending command [${payload.action}] to ${BRIDGE_URL}...`);
    const res = await fetch(`${BRIDGE_URL}/api/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    }

    const data = await res.json();
    console.log(`Command successfully enqueued! Command ID: ${data.commandId}`);
  } catch (err) {
    console.error(`Failed to send command to Figma bridge:`, err.message);
    console.error(`Make sure the bridge server is running: 'node scripts/figma_bridge_server.js'`);
  }
}

send();
