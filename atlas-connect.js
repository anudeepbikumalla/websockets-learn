require('dotenv').config();
const axios = require('axios');
const DigestFetch = require('digest-fetch').default;
const { exec } = require('child_process');
const os = require('os');

// Config
console.log('📝 Loading environment variables...');
const PUBLIC_KEY = process.env.ATLAS_PUBLIC_KEY;
const PRIVATE_KEY = process.env.ATLAS_PRIVATE_KEY;
const PROJECT_ID = process.env.ATLAS_PROJECT_ID;
const COMPASS_PATH = process.env.COMPASS_PATH || 'mongodb-compass';

console.log('🔑 Public Key length:', PUBLIC_KEY ? PUBLIC_KEY.length : 0);
console.log('🔑 Private Key length:', PRIVATE_KEY ? PRIVATE_KEY.length : 0);
console.log('📂 Project ID:', PROJECT_ID);

async function getPublicIP() {
  try {
    const response = await axios.get('https://api.ipify.org?format=json');
    return response.data.ip;
  } catch (error) {
    console.error('❌ Failed to get public IP:', error.message);
    // Do not exit the process for IP lookup failures — continue without Atlas update
    return null;
  }
}

async function updateAtlasAllowlist(ip) {
  console.log(`📡 Detected Public IP: ${ip}`);

  if (!ip) {
    console.log('ℹ️ No public IP detected, skipping Atlas allowlist update.');
    return;
  }

  if (!PUBLIC_KEY || !PRIVATE_KEY || !PROJECT_ID) {
    console.warn('⚠️ Missing Atlas credentials in .env — skipping Atlas allowlist update.');
    console.warn('Tip: set ATLAS_PUBLIC_KEY, ATLAS_PRIVATE_KEY and ATLAS_PROJECT_ID in your .env with correct values.');
    return;
  }

  const client = new DigestFetch(PUBLIC_KEY, PRIVATE_KEY);
  const url = `https://cloud.mongodb.com/api/atlas/v1.0/groups/${PROJECT_ID}/accessList`;

  try {
    console.log('🔄 Updating Atlas Access List...');
    const response = await client.fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([{
        ipAddress: ip,
        comment: `Auto-added via automation script (${new Date().toLocaleDateString()})`
      }])
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Atlas Access List updated successfully!');
    } else {
      const errorMsg = data.detail || data.reason || response.statusText;
      console.error('❌ Atlas API Error:', errorMsg);

      if (response.status === 403 || (typeof errorMsg === 'string' && errorMsg.includes('not authorized for this resource'))) {
        console.log(`
\x1b[31m\x1b[1m╭─────────────────────────────────────────────────────────────────╮
│ 🛑 MONGODB ATLAS PERMISSION ERROR                               │
╰─────────────────────────────────────────────────────────────────╯\x1b[0m
\x1b[33mYour API key is active, but it DOES NOT have the correct role 
to automatically add your IP address to the allowlist.

\x1b[36m👉 HOW TO FIX THIS IN 30 SECONDS:\x1b[0m
\x1b[37m1.\x1b[0m Log into your MongoDB Atlas dashboard.
\x1b[37m2.\x1b[0m Go to Access Management > Project Access (or Organization Access).
\x1b[37m3.\x1b[0m Find the API Key you are using in your .env file.
\x1b[37m4.\x1b[0m Edit its permissions and assign it the \x1b[32m\x1b[1m"Project Owner"\x1b[0m role.
\x1b[37m5.\x1b[0m Save and run \x1b[32mnpm start\x1b[0m again!

\x1b[90m(The server will still boot up, but database requests from new IPs will fail)\x1b[0m
`);
      }
      // Continue without exiting — user can still run the server locally
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

function launchCompass() {
  console.log('🚀 Launching MongoDB Compass and connecting...');

  const connectionString = process.env.MONGODB_CONNECTION_STRING;

  // On Windows, 'start' can find registered apps. 
  // We pass the connection string as an argument.
  let cmd;
  if (COMPASS_PATH === 'mongodb-compass') {
    cmd = connectionString ? `start mongodb-compass "${connectionString}"` : `start mongodb-compass`;
  } else {
    cmd = connectionString ? `"${COMPASS_PATH}" "${connectionString}"` : `"${COMPASS_PATH}"`;
  }

  exec(cmd, (err) => {
    if (err) {
      console.warn('⚠️ Could not launch Compass automatically. You might need to check your COMPASS_PATH or MONGODB_CONNECTION_STRING in .env');
      console.error('Error detail:', err.message);
    } else {
      console.log('✨ Compass opened and connecting!');
    }
  });
}

async function main() {
  try {
    console.log('🛠️  MongoDB Automation Tool');
    console.log('--------------------------');
    const ip = await getPublicIP();
    if (ip) {
      await updateAtlasAllowlist(ip);
    } else {
      console.log('ℹ️ Skipping Atlas allowlist update due to missing public IP.');
    }
    launchCompass();
  } catch (err) {
    console.error('⚠️ Atlas automation warning:', err.message);
    console.log('✅ Continuing without Atlas — you can still run the server locally.');
  }
}

// Run main but don't exit on error — let server.js continue
main();
