const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

const sizes = [16, 32, 48, 128];
const assetsDir = path.join(__dirname, '../assets');

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

sizes.forEach(size => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#4f46e5';
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
  ctx.fill();

  // Text
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size/2}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('JA', size/2, size/2 + size/16);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(assetsDir, `icon${size}.png`), buffer);
  console.log(`Generated icon${size}.png`);
});
