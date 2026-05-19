const fs = require('fs');

const pbPath = 'C:\\Users\\USER\\.gemini\\antigravity\\conversations\\1dfecb58-78fa-43e3-8640-2a9cd9dd2fbb.pb';

try {
  const buf = fs.readFileSync(pbPath);
  console.log('Size:', buf.length);
  
  // Print hex representation of the first 200 bytes
  console.log('First 200 bytes hex:');
  console.log(buf.slice(0, 200).toString('hex'));
  
  console.log('First 200 bytes as UTF-8:');
  console.log(buf.slice(0, 200).toString('utf8'));
  
  // Search for the word 'Kyoto' or 'Long' in UTF-8 and UTF-16
  const kutf8 = Buffer.from('Kyoto', 'utf8');
  const kutf16 = Buffer.from('Kyoto', 'utf16le');
  
  console.log('Kyoto UTF-8 index:', buf.indexOf(kutf8));
  console.log('Kyoto UTF-16 index:', buf.indexOf(kutf16));
  
} catch (err) {
  console.error(err);
}
