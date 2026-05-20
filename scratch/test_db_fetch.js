const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const value = parts.slice(1).join('=').trim();
    process.env[key] = value;
  }
});

const { fetchMediaAssets } = require('../lib/db');

async function run() {
  console.log("Testing fetchMediaAssets from lib/db.js...");
  try {
    const assets = await fetchMediaAssets();
    console.log(`Success! Fetched ${assets.length} assets.`);
    console.log("Assets:", JSON.stringify(assets, null, 2));
  } catch (err) {
    console.error("Failed to fetch:", err);
  }
}

run();
