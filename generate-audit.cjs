const fs = require('fs');
const path = require('path');

function scanDirectory(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      scanDirectory(filePath, fileList);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const files = scanDirectory(path.join(__dirname, 'src'));
let auditMarkdown = '# File Audit for Global Spacing Script\n\n| Filename | Property | Old Value | New Value |\n|---|---|---|---|\n';

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  const relPath = path.relative(__dirname, file).replace(/\\/g, '/');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check padding: 16 (often edge padding or card padding)
    const padMatch = line.match(/padding:\s*["']?(\d+)[A-Za-z%]*\s*["']?/);
    if (padMatch && padMatch[1] === '16') {
      // Check if it's a card padding (usually has background or borderRadius near it)
      const prevLines = lines.slice(Math.max(0, i - 3), i).join(' ');
      if (prevLines.includes('borderRadius') || prevLines.includes('background') || line.includes('16px 16px')) {
        auditMarkdown += `| ${relPath} | padding | ${padMatch[0]} | padding: "20px 18px" |\n`;
      } else {
        auditMarkdown += `| ${relPath} | padding | ${padMatch[0]} | padding: 20 |\n`;
      }
    }
    
    // Check gap: 8 or 10 or 12 for cards
    const gapMatch = line.match(/gap:\s*["']?(\d+)[A-Za-z%]*\s*["']?/);
    if (gapMatch) {
      const gapVal = parseInt(gapMatch[1], 10);
      if (gapVal < 16 && (line.includes('flexDirection: "column"') || lines[Math.max(0, i-1)].includes('flexDirection: "column"'))) {
        auditMarkdown += `| ${relPath} | gap | ${gapMatch[0]} | gap: 16 |\n`;
      }
    }
  }
}

fs.writeFileSync('audit.md', auditMarkdown);
console.log('Audit completed.');
