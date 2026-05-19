const keys = Object.keys(process.env);
for (const key of keys) {
  if (key.includes('SUPABASE') || key.includes('DATABASE') || key.includes('POSTGRES') || key.includes('DB') || key.includes('KEY')) {
    console.log(`${key}: ${process.env[key] ? process.env[key].substring(0, 15) + '...' : 'undefined'}`);
  }
}
