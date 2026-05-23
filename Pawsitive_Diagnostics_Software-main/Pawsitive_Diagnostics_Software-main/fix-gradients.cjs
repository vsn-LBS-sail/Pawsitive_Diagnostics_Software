const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walk(dirPath, callback);
    } else {
      if (f.endsWith('.tsx')) {
         callback(dirPath);
      }
    }
  });
}

const files = [];
walk('src', (f) => files.push(f));

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Replace PrimaryButton gradient
  if (content.includes('PrimaryButton') && content.includes('linear-gradient')) {
    content = content.replace(/background: `linear-gradient\(135deg, \$\{accent\}, \$\{darker\}\)`,/g, 'background: "#447F98",');
    changed = true;
  }

  // Replace Bottom CTAs linear-gradient
  if (content.includes('background: "linear-gradient(135deg,#E8678A 0%,#F48BA9 100%)"')) {
    content = content.replace(/background: "linear-gradient\(135deg,#E8678A 0%,#F48BA9 100%\)",/g, 'background: "#447F98",');
    changed = true;
  }

  // Check Health report tabs button
  if (content.includes('linear-gradient(135deg, #E8829A, #C86882)')) {
      content = content.replace(/background: active \? "linear-gradient\(135deg, #E8829A, #C86882\)" : "transparent",/g, 'background: active ? "#447F98" : "transparent",');
      changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
  }
}
console.log("Done fixing gradients.");
