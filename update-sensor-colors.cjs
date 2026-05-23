const fs = require('fs');
const path = require('path');

const newPalette = `const P = {
  primary: "#447F98",
  deep:    "#1C3A47",
  mid:     "#4A7FA5",
  soft:    "#B9D8E1",
  pale:    "#D6EBF3",
  accent:  "#447F98",
  muted:   "#A8CCD8",
  light:   "#B9D8E1",
  darker:  "#1C3A47",
};`;

const dir = path.join(__dirname, 'src', 'routes');
const files = fs.readdirSync(dir);

for (const file of files) {
  if (file.endsWith('-sense.tsx')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace the P block
    content = content.replace(/const P = \{[^}]+\};/s, newPalette);
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated palette in ${file}`);
  }
}
