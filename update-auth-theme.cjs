const fs = require('fs');

const file = 'src/routes/auth.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace pink owner accent colors
content = content.replace(/accent="#F472B6"/g, 'accent="#447F98"');
content = content.replace(/accentSoftBorder="#FCE7F3"/g, 'accentSoftBorder="#EAF4F9"');
content = content.replace(/iconBg="#FFF0F5"/g, 'iconBg="#EAF4F9"');
content = content.replace(/rgba\(244,114,182,0\.1\)/g, 'rgba(68,127,152,0.15)');
content = content.replace(/color: "#F472B6"/g, 'color: "#447F98"');
content = content.replace(/fill="#F9A8D4"/g, 'fill="#A8CCD8"');
content = content.replace(/color: "#F9A8D4"/g, 'color: "#A8CCD8"');

// Replace general accent colors
content = content.replace(/accent = isOwner \? "#E8829A" : "#7BB5B0"/g, 'accent = isOwner ? "#447F98" : "#2C3E50"');
content = content.replace(/accentBg = isOwner \? "#FFE4EC" : "#E4F2F0"/g, 'accentBg = isOwner ? "#EAF4F9" : "#E5ECEF"');
content = content.replace(/color="#E87090"/g, 'color="#447F98"');

// Replace Doodle colors
content = content.replace(/fill="#E8829A"/g, 'fill="#A8CCD8"'); // Owner doodle body
content = content.replace(/stroke="#E8829A"/g, 'stroke="#447F98"'); // Collar
content = content.replace(/fill="#F2A0B0"/g, 'fill="#EAF4F9"'); // Blush
content = content.replace(/fill="#E8829A"/g, 'fill="#A8CCD8"'); // Clinic cross (wait, already replaced above, let's fix it manually or let the previous line do it)

// Replace JField and primary button focus states
content = content.replace(/"#E8829A"/g, '"#447F98"');
content = content.replace(/"#FFFAFB"/g, '"#FFFFFF"');
content = content.replace(/rgba\(232,130,154,0\.1\)/g, 'rgba(68,127,152,0.15)');

fs.writeFileSync(file, content);
console.log("Updated auth.tsx colors.");
