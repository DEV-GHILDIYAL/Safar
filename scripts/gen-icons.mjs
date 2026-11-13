// Generates Safar's app icon + splash PNGs (no dependencies). Run: node scripts/gen-icons.mjs
// Glyph: a saffron disc with a dark "S" road (Safar) ending in a white destination dot.
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const S = 1024;
const BG = [0x0a, 0x0c, 0x10];
const ACCENT = [0xff, 0x7a, 0x3d];
const WHITE = [0xf5, 0xf6, 0xf8];

const CRC = new Int32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c;
});
const crc32 = (buf) => {
  let c = -1;
  for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
};
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(rgba) {
  const raw = Buffer.alloc((S * 4 + 1) * S);
  for (let y = 0; y < S; y++) {
    raw[y * (S * 4 + 1)] = 0;
    rgba.copy(raw, y * (S * 4 + 1) + 1, y * S * 4, (y + 1) * S * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(S, 0);
  ihdr.writeUInt32BE(S, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const cov = (d) => Math.min(1, Math.max(0, 0.5 - d)); // signed distance -> AA coverage
const len = (x, y) => Math.hypot(x, y);

/** Signed distances (px) for disc, S road and destination dot, at scale k (disc radius = k * S). */
function shapes(px, py, k) {
  const c = S / 2;
  const R = k * S;
  const r = R * 0.3; // S arc radius
  const w = R * 0.17; // road width
  const x = px - c;
  const y = py - c;
  const disc = len(x, y) - R;
  const c1 = -r; // top arc centre y
  const c2 = r; // bottom arc centre y
  const endTop = [r, c1];
  const endBot = [-r, c2];
  let dTop = Math.abs(len(x, y - c1) - r) - w / 2;
  if (x > 0 && y > c1) dTop = Math.min(len(x - endTop[0], y - endTop[1]), len(x, y)) - w / 2;
  let dBot = Math.abs(len(x, y - c2) - r) - w / 2;
  if (x < 0 && y < c2) dBot = Math.min(len(x - endBot[0], y - endBot[1]), len(x, y)) - w / 2;
  const road = Math.min(dTop, dBot);
  const dot = len(x - endTop[0], y - endTop[1]) - w * 0.95;
  const dotRing = len(x - endTop[0], y - endTop[1]) - w * 1.45;
  return { disc, road, dot, dotRing };
}

function render({ k, background, mono }) {
  const out = Buffer.alloc(S * S * 4);
  for (let py = 0; py < S; py++) {
    for (let px = 0; px < S; px++) {
      // 2x2 supersampling
      let r = 0, g = 0, b = 0, a = 0;
      for (const [ox, oy] of [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]]) {
        const s = shapes(px + ox, py + oy, k);
        let col = background ? [...BG] : [0, 0, 0];
        let alpha = background ? 1 : 0;
        const blend = (c2, t) => {
          if (t <= 0) return;
          col = col.map((v, i) => v * (1 - t) + c2[i] * t);
          alpha = alpha * (1 - t) + t;
        };
        const discCov = cov(s.disc);
        if (mono) {
          // White disc with the road knocked out (alpha only matters).
          const hole = Math.max(cov(s.road), cov(s.dotRing));
          blend(WHITE, discCov * (1 - hole));
          blend(WHITE, cov(s.dot));
        } else {
          blend(ACCENT, discCov);
          blend(BG, Math.min(discCov, Math.max(cov(s.road), cov(s.dotRing))));
          blend(WHITE, Math.min(discCov, cov(s.dot)));
        }
        r += col[0] * alpha; g += col[1] * alpha; b += col[2] * alpha; a += alpha;
      }
      const i = (py * S + px) * 4;
      out[i] = a ? Math.round(r / a) : 0;
      out[i + 1] = a ? Math.round(g / a) : 0;
      out[i + 2] = a ? Math.round(b / a) : 0;
      out[i + 3] = Math.round((a / 4) * 255);
    }
  }
  return png(out);
}

function solid(rgb) {
  const out = Buffer.alloc(S * S * 4);
  for (let i = 0; i < S * S; i++) out.set([...rgb, 255], i * 4);
  return png(out);
}

writeFileSync('assets/icon.png', render({ k: 0.36, background: true }));
writeFileSync('assets/android-icon-foreground.png', render({ k: 0.27, background: false }));
writeFileSync('assets/android-icon-monochrome.png', render({ k: 0.27, background: false, mono: true }));
writeFileSync('assets/android-icon-background.png', solid(BG));
writeFileSync('assets/splash-icon.png', render({ k: 0.42, background: false }));
writeFileSync('assets/favicon.png', render({ k: 0.48, background: true }));
console.log('icons written');
