const fs = require('fs');
const path = require('path');

// Create a simple PNG icon using data URL
function createIcon(size) {
  // Simple blue square with white text as base64 PNG
  const canvas = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="#3b82f6"/>
      <circle cx="${size/2}" cy="${size/2}" r="${size/4}" fill="#fbbf24"/>
      <text x="${size/2}" y="${size/1.5}" font-size="${size/8}" fill="#ffffff" text-anchor="middle" font-family="Arial" font-weight="bold">Solar</text>
    </svg>
  `;
  
  return canvas;
}

// Generate icons
const icon192 = createIcon(192);
const icon512 = createIcon(512);

// Save as SVG first (will work as fallback)
fs.writeFileSync(path.join(__dirname, '../public/icon-192x192.svg'), icon192);
fs.writeFileSync(path.join(__dirname, '../public/icon-512x512.svg'), icon512);

console.log('✅ Icons generated successfully!');
console.log('📁 Files created:');
console.log('   - public/icon-192x192.svg');
console.log('   - public/icon-512x512.svg');
