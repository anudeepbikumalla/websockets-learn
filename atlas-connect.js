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
    process.exit(1);
  }
}

async function updateAtlasAllowlist(ip) {
  console.log(`📡 Detected Public IP: ${ip}`);

  if (!PUBLIC_KEY || !PRIVATE_KEY || !PROJECT_ID) {
    console.error('❌ Missing Atlas credentials in .env file!');
    process.exit(1);
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
      console.error('❌ Atlas API Error:', data.detail || data.reason || response.statusText);
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
  console.log('🛠️  MongoDB Automation Tool');
  console.log('--------------------------');
  const ip = await getPublicIP();
  await updateAtlasAllowlist(ip);
  launchCompass();
}

main().catch(err => {
  console.error('💥 TOP-LEVEL ERROR:');
  console.error(err);
  process.exit(1);
});
