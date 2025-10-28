#!/usr/bin/env node
/* eslint-disable no-console */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import url from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const assetsDir = path.join(projectRoot, 'assets');
const previewsDir = path.join(assetsDir, 'previews');

const palette = {
  base: '#0f172a',
  primary: '#4338ca',
  secondary: '#7c3aed',
  accent: '#eace58',
  soft: '#c7d2fe',
  glow: '#38bdf8',
};

const title = 'in';
const wordmark = 'Incomex';

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true });
}

function buildIconSvg(size) {
  const borderRadius = size * 0.23;
  const strokeWidth = Math.max(8, size * 0.03);
  const fontSize = size * 0.42;
  const letterSpacing = fontSize * 0.02;

  return Buffer.from(
    `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${palette.primary}" />
          <stop offset="55%" stop-color="${palette.secondary}" />
          <stop offset="100%" stop-color="${palette.glow}" />
        </linearGradient>
        <linearGradient id="shine" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.45" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="${size}" height="${size}" rx="${borderRadius}" fill="url(#bg)" />
      <rect x="${size * 0.04}" y="${size * 0.04}" width="${size * 0.92}" height="${size * 0.92}" rx="${borderRadius}" fill="none" stroke="${palette.soft}" stroke-width="${strokeWidth}" opacity="0.35" />
      <path d="M${size * 0.05} ${size * 0.55} Q${size * 0.35} ${size * 0.25} ${size * 0.55} ${size * 0.28} T${size * 0.9} ${size * 0.1}" fill="none" stroke="url(#shine)" stroke-width="${strokeWidth * 0.7}" stroke-linecap="round" />
      <text x="50%" y="55%" text-anchor="middle" dominant-baseline="middle" fill="#fefefe" font-family="'Poppins', 'Inter', 'Helvetica Neue', Arial, sans-serif" font-weight="700" font-size="${fontSize}" letter-spacing="${letterSpacing}">
        ${title.toUpperCase()}
      </text>
    </svg>`
      .replace(/\s+/g, ' '),
  );
}

function buildForegroundSvg(size) {
  const circleRadius = size * 0.36;
  const strokeWidth = Math.max(6, size * 0.028);
  const fontSize = size * 0.34;
  const letterSpacing = fontSize * 0.025;

  return Buffer.from(
    `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="orb" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="5%" stop-color="${palette.primary}" />
          <stop offset="95%" stop-color="${palette.secondary}" />
        </linearGradient>
      </defs>
      <g transform="translate(${size / 2}, ${size / 2})">
        <circle r="${circleRadius}" fill="url(#orb)" />
        <circle r="${circleRadius}" stroke="${palette.glow}" stroke-width="${strokeWidth}" fill="none" opacity="0.35" />
        <text x="0" y="${fontSize * 0.34}" text-anchor="middle" fill="#fefefe" font-family="'Poppins','Inter','Helvetica Neue',Arial,sans-serif" font-weight="700" font-size="${fontSize}" letter-spacing="${letterSpacing}">
          ${title.toUpperCase()}
        </text>
      </g>
    </svg>`
      .replace(/\s+/g, ' '),
  );
}

function buildFaviconSvg(size) {
  const fontSize = size * 0.42;

  return Buffer.from(
    `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="spot" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stop-color="${palette.glow}" stop-opacity="0.85" />
          <stop offset="100%" stop-color="${palette.primary}" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="${size}" height="${size}" fill="${palette.base}" />
      <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.46}" fill="url(#spot)" />
      <text x="50%" y="57%" text-anchor="middle" dominant-baseline="middle" fill="#ffffff" font-family="'Inter','Helvetica Neue',Arial,sans-serif" font-weight="700" font-size="${fontSize}">
        ${title.toUpperCase()}
      </text>
    </svg>`
      .replace(/\s+/g, ' '),
  );
}

function buildWordmarkSvg(width, height) {
  const fontSize = height * 0.42;
  return Buffer.from(
    `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${palette.primary}" />
          <stop offset="100%" stop-color="${palette.secondary}" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="${palette.base}" rx="${height * 0.24}" />
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="url(#gradient)" font-family="'Poppins','Inter','Helvetica Neue',Arial,sans-serif" font-weight="700" font-size="${fontSize}" letter-spacing="${fontSize * 0.12}">
        ${wordmark.toUpperCase()}
      </text>
    </svg>`
      .replace(/\s+/g, ' '),
  );
}

async function writePng(svgBuffer, size, destination) {
  await ensureDir(path.dirname(destination));
  await sharp(svgBuffer).resize(size, size, { fit: 'cover' }).png({ compressionLevel: 9 }).toFile(destination);
}

async function writeRectangular(svgBuffer, width, height, destination) {
  await ensureDir(path.dirname(destination));
  await sharp(svgBuffer).resize(width, height, { fit: 'cover' }).png({ compressionLevel: 9 }).toFile(destination);
}

async function generate() {
  console.log('Generating brand assets for Incomex...');

  await writePng(buildIconSvg(1024), 1024, path.join(assetsDir, 'icon.png'));
  console.log('✓ Updated app icon (1024x1024).');

  await writePng(buildIconSvg(512), 512, path.join(assetsDir, 'icon-marketing.png'));
  console.log('✓ Created marketing icon (512x512).');

  await writePng(buildForegroundSvg(432), 432, path.join(assetsDir, 'adaptive-icon.png'));
  console.log('✓ Updated adaptive foreground (432x432).');

  await writePng(buildFaviconSvg(512), 512, path.join(assetsDir, 'favicon.png'));
  console.log('✓ Updated favicon (512x512).');

  await writeRectangular(buildIconSvg(2048), 1242, 2436, path.join(assetsDir, 'splash-icon.png'));
  console.log('✓ Updated splash artwork (1242x2436).');

  await ensureDir(previewsDir);
  await writeRectangular(buildIconSvg(1600), 1280, 720, path.join(previewsDir, 'youtube.png'));
  await writeRectangular(buildIconSvg(1600), 1920, 1080, path.join(previewsDir, 'promo-banner.png'));
  console.log('✓ Generated preview banners (1280x720, 1920x1080).');

  const wordmarkSvg = buildWordmarkSvg(1600, 400);
  await writeRectangular(wordmarkSvg, 1600, 400, path.join(assetsDir, 'wordmark.png'));
  console.log('✓ Added linear wordmark (1600x400).');

  await writeFile(path.join(previewsDir, 'README.txt'), `Assets generated ${new Date().toISOString()}\n`);
  console.log('Brand asset generation complete.');
}

generate().catch((error) => {
  console.error('Failed to generate icons:', error);
  process.exitCode = 1;
});
