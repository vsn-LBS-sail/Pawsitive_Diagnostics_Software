const fs = require('fs');

const files = [
  'src/routes/onboarding.details.tsx',
  'src/routes/onboarding.owner-info.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Change White form card background
  content = content.replace(/background: "#FFFFFF", boxShadow: "0 4px 22px rgba\(0,0,0,0\.06\)"/g, 'background: "#B9D8E1", boxShadow: "0 4px 22px rgba(0,0,0,0.06)"');
  
  // Change inputs bg-transparent to background: "#FFFFFF"
  content = content.replace(/className="w-full bg-transparent/g, 'className="w-full bg-white');
  content = content.replace(/className="flex-1 bg-transparent/g, 'className="flex-1 bg-white');
  content = content.replace(/className="bg-transparent/g, 'className="bg-white');

  fs.writeFileSync(file, content);
}
console.log("Updated onboarding cards and inputs.");
