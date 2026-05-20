const fs = require('fs');
const path = require('path');

// Check both process.env and .env.local
const envPath = path.resolve(__dirname, '../.env.local');
let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

console.log('Process Env Keys:', Object.keys(process.env).filter(k => k.includes('SUPABASE') || k.includes('DATABASE') || k.includes('KEY') || k.includes('SECRET') || k.includes('POSTGRES')));
console.log('.env.local contents:', envContent);
