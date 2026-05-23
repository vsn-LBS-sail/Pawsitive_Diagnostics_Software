const fs = require('fs');

// --- 1. index.tsx ---
const idxFile = 'src/routes/index.tsx';
let idxContent = fs.readFileSync(idxFile, 'utf8');

idxContent = idxContent.replace(
  /"linear-gradient\(180deg, #FFF0F5 0%, #FFE4EE 50%, #FFF0F5 100%\)"/g,
  '"linear-gradient(180deg, #EAF4F9 0%, #D6E9F3 50%, #EAF4F9 100%)"'
);
idxContent = idxContent.replace(/color="#E87090"/g, 'color="#447F98"');
idxContent = idxContent.replace(/rgba\(244,63,114,0\.3\)/g, 'rgba(68,127,152,0.3)');
idxContent = idxContent.replace(/"linear-gradient\(135deg, #F43F72 0%, #FF6B8A 100%\)"/g, '"#447F98"');
idxContent = idxContent.replace(/rgba\(244,63,114,0\.4\)/g, 'rgba(68,127,152,0.4)');
idxContent = idxContent.replace(/rgba\(244,63,114,0\.6\)/g, 'rgba(68,127,152,0.6)');
idxContent = idxContent.replace(/color: "#F43F72"/g, 'color: "#447F98"');
idxContent = idxContent.replace(/background: "#F43F72"/g, 'background: "#447F98"');
idxContent = idxContent.replace(/background: "#F3D0D9"/g, 'background: "#A8CCD8"');
fs.writeFileSync(idxFile, idxContent);

// --- 2. language.tsx ---
const langFile = 'src/routes/language.tsx';
let langContent = fs.readFileSync(langFile, 'utf8');

langContent = langContent.replace(/#E8829A/g, '#447F98');
langContent = langContent.replace(/rgba\(232,130,154,0\.35\)/g, 'rgba(68,127,152,0.35)');
langContent = langContent.replace(/rgba\(232,130,154,0\.2\)/g, 'rgba(68,127,152,0.2)');
langContent = langContent.replace(
  /"linear-gradient\(160deg, #FFF0F5 0%, #F5F0FF 50%, #F0F5FF 100%\)"/g,
  '"linear-gradient(160deg, #EAF4F9 0%, #E5ECEF 50%, #D6E9F3 100%)"'
);
langContent = langContent.replace(/#FFD4E8/g, '#A8CCD8');
langContent = langContent.replace(/#9A6B6B/g, '#4A7FA5');
fs.writeFileSync(langFile, langContent);

console.log("Updated splash and language theme.");
