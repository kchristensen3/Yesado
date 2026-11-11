import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Vector SVG for favicon (browser tabs in light & dark mode)
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
  <defs>
    <linearGradient id="yesadoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10B981" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
    <linearGradient id="sparkleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FBBF24" />
      <stop offset="100%" stop-color="#F59E0B" />
    </linearGradient>
  </defs>
  <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#yesadoGrad)" />
  <path d="M9 13.5L16 8L23 13.5" stroke="#A7F3D0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.95" />
  <path d="M10 18.5L14 22.5L22.5 13.5" stroke="#FFFFFF" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M24 5L24.8 7.2L27 8L24.8 8.8L24 11L23.2 8.8L21 8L23.2 7.2Z" fill="url(#sparkleGrad)" />
</svg>`;

// 2. Full-bleed SVG for Apple Touch Icon & PWA icons (iOS Safari automatically applies squircle mask to square icons)
const appleTouchSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="appleBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10B981" />
      <stop offset="100%" stop-color="#047857" />
    </linearGradient>
    <linearGradient id="sparkleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE68A" />
      <stop offset="100%" stop-color="#F59E0B" />
    </linearGradient>
  </defs>
  <!-- Full bleed emerald gradient background -->
  <rect width="512" height="512" fill="url(#appleBg)" />
  
  <!-- Subtle circular radiant depth glow -->
  <circle cx="256" cy="220" r="230" fill="#34D399" opacity="0.18" />
  
  <!-- Friendly house roof accent -->
  <path d="M144 224 L256 128 L368 224" stroke="#A7F3D0" stroke-width="36" stroke-linecap="round" stroke-linejoin="round" opacity="0.95" fill="none" />
  
  <!-- Bold joyful celebratory checkmark -->
  <path d="M160 296 L226 362 L362 216" stroke="#FFFFFF" stroke-width="48" stroke-linecap="round" stroke-linejoin="round" fill="none" />
  
  <!-- Playful celebratory star sparkle in upper right -->
  <path d="M384 84 L396 118 L430 130 L396 142 L384 176 L372 142 L338 130 L372 118 Z" fill="url(#sparkleGrad)" />
</svg>`;

// 3. Maskable PWA SVG with safe padding (inner 80% circle)
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="maskBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10B981" />
      <stop offset="100%" stop-color="#047857" />
    </linearGradient>
    <linearGradient id="sparkleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE68A" />
      <stop offset="100%" stop-color="#F59E0B" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#maskBg)" />
  <circle cx="256" cy="256" r="180" fill="#34D399" opacity="0.15" />
  
  <!-- Centered safe-zone iconography -->
  <path d="M164 240 L256 160 L348 240" stroke="#A7F3D0" stroke-width="30" stroke-linecap="round" stroke-linejoin="round" opacity="0.95" fill="none" />
  <path d="M176 300 L230 354 L344 232" stroke="#FFFFFF" stroke-width="40" stroke-linecap="round" stroke-linejoin="round" fill="none" />
  <path d="M366 120 L376 146 L402 156 L376 166 L366 192 L356 166 L330 156 L356 146 Z" fill="url(#sparkleGrad)" />
</svg>`;

async function generate() {
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSvg);
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), faviconSvg);
  console.log('Saved SVG files.');

  // Render Apple Touch Icon (180x180 PNG required for iOS Safari home screen)
  await sharp(Buffer.from(appleTouchSvg))
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png (180x180)');

  // Render Apple Touch Icon precomposed fallback
  await sharp(Buffer.from(appleTouchSvg))
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon-precomposed.png'));

  // Render 192x192 PWA Icon
  await sharp(Buffer.from(appleTouchSvg))
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Generated pwa-192x192.png');

  // Render 512x512 PWA Icon
  await sharp(Buffer.from(appleTouchSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Generated pwa-512x512.png');

  // Render 512x512 Maskable Icon
  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Generated pwa-maskable-512x512.png');

  // Render 32x32 Favicon PNG
  await sharp(Buffer.from(faviconSvg))
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon-32x32.png'));

  // Render 16x16 Favicon PNG
  await sharp(Buffer.from(faviconSvg))
    .resize(16, 16)
    .png()
    .toFile(path.join(publicDir, 'favicon-16x16.png'));

  // Generate favicon.ico from 32x32
  await sharp(Buffer.from(faviconSvg))
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log('Generated favicon-32x32.png, favicon-16x16.png, favicon.ico');
}

generate().catch(console.error);
