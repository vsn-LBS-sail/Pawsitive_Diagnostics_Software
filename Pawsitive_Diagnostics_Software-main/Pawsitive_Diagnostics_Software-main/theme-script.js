import fs from 'fs';
import path from 'path';

const SRC_DIR = path.join(process.cwd(), 'src');

const replacements = [
  // 1. JP Palette Map
  {
    pattern: /const JP = \{[\s\S]*?\};/m,
    replace: `const JP = {
  bg: "var(--color-bg-app)",
  card: "var(--color-bg-card)",
  sumi: "var(--color-text-primary)",
  usuzumi: "var(--color-text-secondary)",
  divider: "var(--color-border-card)",
  sakura: "var(--color-primary)",
  sakuraSoft: "transparent",
  sakuraStrip: "transparent",
  fuji: "var(--color-secondary)",
  fujiSoft: "transparent",
  fujiStrip: "transparent",
  matcha: "var(--color-text-muted)",
  matchaSoft: "transparent",
  matchaStrip: "transparent",
  yuzu: "var(--color-secondary)",
  yuzuSoft: "transparent",
  yuzuStrip: "transparent",
  sora: "var(--color-secondary)",
  soraSoft: "transparent",
  soraStrip: "transparent",
  momiji: "var(--color-secondary)",
  momijiSoft: "transparent",
  momijiStrip: "transparent",
};`
  },
  
  // 2. Linear gradients (Primary buttons)
  { pattern: /background:\s*["']linear-gradient\(135deg,\s*#[A-Za-z0-9]+,\s*#[A-Za-z0-9]+\)["']/gi, replace: 'background: "var(--color-primary)"' },
  { pattern: /background:\s*["']linear-gradient\(90deg,\s*#[A-Za-z0-9]+,\s*#[A-Za-z0-9]+\)["']/gi, replace: 'background: "var(--color-bg-card)"' },

  // 3. Fonts
  // Replace style={{ fontWeight: 700 }} with style={{ fontFamily: "var(--font-heading)", fontWeight: 600 }}
  { pattern: /fontWeight:\s*700/g, replace: 'fontFamily: "var(--font-heading)", fontWeight: 600' },
  { pattern: /fontWeight:\s*800/g, replace: 'fontFamily: "var(--font-heading)", fontWeight: 600' },
  { pattern: /fontWeight:\s*900/g, replace: 'fontFamily: "var(--font-heading)", fontWeight: 600' },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      for (const rule of replacements) {
        if (rule.pattern.test(content)) {
          content = content.replace(rule.pattern, rule.replace);
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(SRC_DIR);
console.log("Global replacements finished.");
