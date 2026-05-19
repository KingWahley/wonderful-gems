const fs = require('fs');
const path = require('path');

const pbPath = 'C:\\Users\\USER\\.gemini\\antigravity\\conversations\\1dfecb58-78fa-43e3-8640-2a9cd9dd2fbb.pb';

try {
  const buf = fs.readFileSync(pbPath);
  console.log('Successfully read binary buffer. Size:', buf.length);
  
  // Search for the title tag or sidebar style
  const searchStr = 'The Long Way CMS';
  const searchBuf = Buffer.from(searchStr, 'utf8');
  
  const index = buf.indexOf(searchBuf);
  if (index !== -1) {
    console.log(`Found "${searchStr}" at byte index:`, index);
    
    // Let's search backward for '<!DOCTYPE' or '<html' from that index
    let startIdx = index;
    while (startIdx > 0 && startIdx > index - 10000) {
      if (buf.slice(startIdx, startIdx + 15).toString('utf8').toLowerCase().includes('<!doctype') || 
          buf.slice(startIdx, startIdx + 5).toString('utf8').toLowerCase() === '<html') {
        break;
      }
      startIdx--;
    }
    
    console.log('Inferred HTML start at byte index:', startIdx);
    
    // Find the end of html
    let endIdx = index;
    while (endIdx < buf.length && endIdx < index + 35000) {
      if (buf.slice(endIdx, endIdx + 7).toString('utf8').toLowerCase() === '</html>') {
        endIdx += 7;
        break;
      }
      endIdx++;
    }
    
    console.log('Inferred HTML end at byte index:', endIdx);
    
    const htmlSlice = buf.slice(startIdx, endIdx).toString('utf8');
    fs.writeFileSync('scratch/extracted_template.html', htmlSlice, 'utf8');
    console.log('Saved extracted HTML template to scratch/extracted_template.html. Size:', htmlSlice.length);
  } else {
    console.log('Could not find search string in binary buffer. Searching for simpler substrings like "mustard"...');
    const index2 = buf.indexOf(Buffer.from('mustard', 'utf8'));
    if (index2 !== -1) {
      console.log('Found "mustard" at byte index:', index2);
      const htmlSlice = buf.slice(index2 - 200, index2 + 25000).toString('utf8');
      fs.writeFileSync('scratch/extracted_template.html', htmlSlice, 'utf8');
      console.log('Saved partial HTML to scratch/extracted_template.html');
    } else {
      console.log('Could not find "mustard" either.');
    }
  }
} catch (err) {
  console.error('Error reading pb file:', err);
}
