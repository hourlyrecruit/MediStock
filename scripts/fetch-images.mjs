#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const imagesDir = join(root, 'src', 'assets', 'images');
const sourceDir = join(imagesDir, 'source');
const manifestPath = join(imagesDir, 'manifest.ts');
const creditsPath = join(root, 'docs', 'IMAGE_CREDITS.md');
const force = process.argv.includes('--force');
const MIN_BYTES = 20 * 1024;
const LICENCE = 'Unsplash License (https://unsplash.com/license)';

const IMAGES = [
  {
    key: 'heroPharmacy',
    file: 'hero-pharmacy',
    id: '1576602976047-174e57a47881',
    width: 2400,
    height: 1600,
    alt: 'Bright, modern pharmacy interior with neatly stocked white shelves',
    widths: [480, 960, 1440, 2400],
  },
  {
    key: 'shelves',
    file: 'shelves',
    id: '1586015555751-63bb77f4322a',
    width: 1600,
    height: 1067,
    alt: 'Medicine bottles lined up on a pharmacy shelf in soft focus',
    widths: [480, 960, 1440, 1600],
  },
  {
    key: 'capsules',
    file: 'capsules',
    id: '1512069772995-ec65ed45afd6',
    width: 1600,
    height: 1067,
    alt: 'Close-up of assorted capsules and tablets',
    widths: [480, 960, 1440, 1600],
  },
  {
    key: 'supplies',
    file: 'supplies',
    id: '1603398938378-e54eab446dde',
    width: 1600,
    height: 1067,
    alt: 'Stethoscope, pill organiser, blister pack and thermometer on a white surface',
    widths: [480, 960, 1440, 1600],
  },
  {
    key: 'dashboardTile',
    file: 'dashboard-tile',
    id: '1631549916768-4119b2e5f926',
    width: 1600,
    height: 1067,
    alt: 'Blister packs of tablets and capsules arranged together',
    widths: [480, 960, 1440, 1600],
  },
  {
    key: 'bottleStill',
    file: 'bottle-still',
    id: '1626716493137-b67fe9501e76',
    width: 1200,
    height: 900,
    alt: 'Hand holding a vintage glass bottle of aspirin tablets',
    widths: [480, 960, 1200],
  },
];

const photoUrl = (img) =>
  `https://images.unsplash.com/photo-${img.id}?w=${img.width}&h=${img.height}&fit=crop&crop=entropy&q=80&fm=jpg`;

const isJpeg = (buf) => buf.length > MIN_BYTES && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;

const jpegSize = (buf) => {
  let offset = 2;
  while (offset < buf.length) {
    if (buf[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buf[offset + 1];
    const length = buf.readUInt16BE(offset + 2);
    const isSof = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isSof) {
      return { height: buf.readUInt16BE(offset + 5), width: buf.readUInt16BE(offset + 7) };
    }
    offset += 2 + length;
  }
  return null;
};

const placeholderSvg = ({ width, height, alt }) => {
  const cx = Math.round(width * 0.62);
  const cy = Math.round(height * 0.5);
  const r = Math.round(Math.min(width, height) * 0.16);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${alt}">
  <defs>
    <radialGradient id="g" cx="65%" cy="40%" r="80%">
      <stop offset="0" stop-color="#fafaf8"/>
      <stop offset="0.45" stop-color="#eef5f1"/>
      <stop offset="1" stop-color="#d6d3ce"/>
    </radialGradient>
    <linearGradient id="c" x1="0" x2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="0.5" stop-color="#ffffff"/>
      <stop offset="0.5" stop-color="#1f6b4f"/>
      <stop offset="1" stop-color="#1f6b4f"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <g transform="translate(${cx} ${cy}) rotate(-28)" opacity="0.9">
    <rect x="${-r * 1.6}" y="${-r * 0.55}" width="${r * 3.2}" height="${r * 1.1}" rx="${r * 0.55}" fill="url(#c)"/>
  </g>
  <g transform="translate(${Math.round(width * 0.3)} ${Math.round(height * 0.32)})" fill="#1f6b4f" opacity="0.55">
    <rect x="${-r * 0.18}" y="${-r * 0.55}" width="${r * 0.36}" height="${r * 1.1}" rx="${r * 0.1}"/>
    <rect x="${-r * 0.55}" y="${-r * 0.18}" width="${r * 1.1}" height="${r * 0.36}" rx="${r * 0.1}"/>
  </g>
</svg>
`;
};

const download = async (img) => {
  const target = join(sourceDir, `${img.file}.jpg`);
  if (!force && existsSync(target) && isJpeg(readFileSync(target))) {
    return { ok: true, path: target, cached: true };
  }
  try {
    const res = await fetch(photoUrl(img), { signal: AbortSignal.timeout(30000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (!isJpeg(buf)) throw new Error(`not a JPEG or smaller than ${MIN_BYTES} bytes (${buf.length})`);
    writeFileSync(target, buf);
    return { ok: true, path: target, cached: false };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
};


const manifestSource = (entries) => {
  const imports = [];
  const items = [];
  for (const e of entries) {
    const base = `./source/${e.file}.${e.ext}`;
    const w = e.widths.join(';');
    const fallbackWidth = Math.min(1440, e.width);
    imports.push(
      `import ${e.key}Avif from '${base}?w=${w}&format=avif&as=srcset';`,
      `import ${e.key}Webp from '${base}?w=${w}&format=webp&as=srcset';`,
      `import ${e.key}JpgSet from '${base}?w=${w}&format=jpg&as=srcset';`,
      `import ${e.key}Jpg from '${base}?w=${fallbackWidth}&format=jpg&as=url';`,
      `import ${e.key}Blur from '${base}?w=24&format=webp&inline';`,
    );
    items.push(`  ${e.key}: {
    key: '${e.key}',
    src: {
      avif: ${e.key}Avif,
      webp: ${e.key}Webp,
      jpgSrcset: ${e.key}JpgSet,
      jpg: ${e.key}Jpg,
      placeholder: ${e.key}Blur,
    },
    width: ${e.width},
    height: ${e.height},
    alt: ${JSON.stringify(e.alt)},
    credit: {
      photographer: ${JSON.stringify(e.photographer)},
      source: ${JSON.stringify(e.source)},
      licence: ${JSON.stringify(e.licence)},
    },
    isPlaceholder: ${e.ext === 'svg'},
  },`);
  }
  return `${imports.join('\n')}

export interface ImageCredit {
  photographer: string;
  source: string;
  licence: string;
}

export interface ImageSources {
  avif: string;
  webp: string;
  jpgSrcset: string;
  jpg: string;
  placeholder: string;
}

export interface ImageEntry {
  key: ImageKey;
  src: ImageSources;
  width: number;
  height: number;
  alt: string;
  credit: ImageCredit;
  isPlaceholder: boolean;
}

export type ImageKey = ${entries.map((e) => `'${e.key}'`).join(' | ')};

export const images: Record<ImageKey, ImageEntry> = {
${items.join('\n')}
};

export const imageKeys = Object.keys(images) as ImageKey[];
`;
};

const creditsSource = (entries) => `# Image credits

All photographs are downloaded once by \`scripts/fetch-images.mjs\` into \`src/assets/images/source/\` and committed; nothing is hotlinked at runtime.

| File | Subject | Photographer | Source | Licence |
|---|---|---|---|---|
${entries
  .map(
    (e) =>
      `| \`${e.file}.${e.ext}\` | ${e.alt} | ${e.photographer} | ${e.ext === 'svg' ? 'Generated placeholder' : `[${e.source}](${e.source})`} | ${e.licence} |`,
  )
  .join('\n')}

The Unsplash License allows free commercial and non-commercial use without permission or attribution; credit is given here as a courtesy. The CDN photo IDs do not expose the photographer, so names still need to be looked up on unsplash.com before public launch.
`;

const main = async () => {
  mkdirSync(sourceDir, { recursive: true });
  const entries = [];
  for (const img of IMAGES) {
    const result = await download(img);
    const svgPath = join(sourceDir, `${img.file}.svg`);
    if (result.ok) {
      if (existsSync(svgPath)) rmSync(svgPath);
      const size = jpegSize(readFileSync(result.path)) ?? { width: img.width, height: img.height };
      entries.push({
        ...img,
        ...size,
        widths: img.widths.filter((w) => w <= size.width),
        ext: 'jpg',
        photographer: 'Unsplash contributor',
        source: `https://images.unsplash.com/photo-${img.id}`,
        licence: LICENCE,
      });
      console.log(`ok   ${img.file}.jpg ${size.width}x${size.height}${result.cached ? ' (cached)' : ''}`);
    } else {
      writeFileSync(svgPath, placeholderSvg(img));
      entries.push({
        ...img,
        ext: 'svg',
        photographer: 'MediStock (generated)',
        source: 'scripts/fetch-images.mjs',
        licence: 'Project asset',
      });
      console.warn(`miss ${img.file}: ${result.error} -> ${img.file}.svg placeholder`);
    }
  }
  writeFileSync(manifestPath, manifestSource(entries));
  writeFileSync(creditsPath, creditsSource(entries));
  console.log(`wrote ${manifestPath}`);
  console.log(`wrote ${creditsPath}`);
};

await main();
