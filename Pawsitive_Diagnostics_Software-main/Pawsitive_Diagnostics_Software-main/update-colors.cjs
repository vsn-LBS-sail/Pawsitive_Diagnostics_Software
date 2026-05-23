const fs = require('fs');

const files = [
  'src/routes/onboarding.avatar.tsx',
  'src/routes/onboarding.dog.tsx',
  'src/routes/onboarding.owner-info.tsx',
  'src/routes/onboarding.details.tsx',
  'src/routes/avatar-setup.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  
  let content = fs.readFileSync(file, 'utf8');

  // Replace pink background with blue bg app
  content = content.replace(/#FAFAF8/g, 'var(--color-bg-app)');
  content = content.replace(/#F5EDE8/g, 'var(--color-bg-app)');
  content = content.replace(/#FFF0F5/g, 'var(--color-bg-card-elevated)');
  content = content.replace(/#FFFAFB/g, 'var(--color-bg-app)');
  
  // Pink colors to blue primary
  content = content.replace(/#E8829A/g, 'var(--color-primary)');
  content = content.replace(/#E87090/g, 'var(--color-primary)');
  content = content.replace(/rgba\(232,130,154/g, 'rgba(68,127,152');
  
  // Text colors
  content = content.replace(/#2C2C2C/g, 'var(--color-text-primary)');
  content = content.replace(/#8A8A8A/g, 'var(--color-text-secondary)');
  content = content.replace(/#C4B8B4/g, 'var(--color-text-muted)');

  fs.writeFileSync(file, content);
}
console.log("Colors replaced in onboarding screens");
