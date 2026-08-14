/**
 * One-off generator: dense hex land points for Live View globe.
 * Run: node scripts/generate-live-globe-land-points.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import * as topojson from 'topojson-client';
import { geoEquirectangular, geoPath } from 'd3-geo';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const landTopo = require('world-atlas/land-50m.json');
const land = topojson.feature(landTopo, landTopo.objects.land);

const W = 2880;
const H = 1440;

function createBitmaskContext(width, height) {
  const data = new Uint8Array(width * height);
  let pts = [];

  function fillPolygon(points) {
    if (points.length < 3) return;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const [, y] of points) {
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    const y0 = Math.max(0, Math.floor(minY));
    const y1 = Math.min(height - 1, Math.ceil(maxY));
    for (let y = y0; y <= y1; y += 1) {
      const crossings = [];
      for (let i = 0, n = points.length; i < n; i += 1) {
        const [x1, y1] = points[i];
        const [x2, y2] = points[(i + 1) % n];
        if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) {
          const dy = y2 - y1;
          if (dy === 0) continue;
          crossings.push(x1 + ((y - y1) / dy) * (x2 - x1));
        }
      }
      crossings.sort((a, b) => a - b);
      for (let i = 0; i + 1 < crossings.length; i += 2) {
        const xStart = Math.max(0, Math.floor(crossings[i]));
        const xEnd = Math.min(width - 1, Math.ceil(crossings[i + 1]));
        const row = y * width;
        for (let x = xStart; x <= xEnd; x += 1) data[row + x] = 1;
      }
    }
  }

  return {
    data,
    beginPath() {
      pts = [];
    },
    moveTo(x, y) {
      // d3-geo does not call fill(); start of a new ring → fill previous.
      if (pts.length >= 3) fillPolygon(pts);
      pts = [[x, y]];
    },
    lineTo(x, y) {
      pts.push([x, y]);
    },
    closePath() {
      if (pts.length >= 3) fillPolygon(pts);
      pts = [];
    },
    arc() {},
    rect(x, y, w, h) {
      const x0 = Math.max(0, Math.floor(x));
      const y0 = Math.max(0, Math.floor(y));
      const x1 = Math.min(width - 1, Math.ceil(x + w));
      const y1 = Math.min(height - 1, Math.ceil(y + h));
      for (let yy = y0; yy <= y1; yy += 1) {
        const row = yy * width;
        for (let xx = x0; xx <= x1; xx += 1) data[row + xx] = 1;
      }
    },
    fill() {
      if (pts.length >= 3) fillPolygon(pts);
      pts = [];
    },
    flush() {
      if (pts.length >= 3) fillPolygon(pts);
      pts = [];
    },
  };
}

const t0 = Date.now();
const ctx = createBitmaskContext(W, H);
const projection = geoEquirectangular().fitSize([W, H], { type: 'Sphere' });
const draw = geoPath(projection, ctx);
draw(land);
ctx.flush();

let painted = 0;
for (let i = 0; i < ctx.data.length; i += 1) if (ctx.data[i]) painted += 1;

const points = [];
const LAT_STEP = 0.55;
for (let lat = -58; lat <= 83; lat += LAT_STEP) {
  const row = Math.round((lat + 90) / LAT_STEP);
  const cosLat = Math.cos((lat * Math.PI) / 180);
  const lngStep = Math.min(1.6, LAT_STEP / Math.max(0.22, Math.abs(cosLat)));
  const offset = row % 2 === 0 ? 0 : lngStep / 2;
  for (let lng = -180 + offset; lng < 180; lng += lngStep) {
    const xy = projection([lng, lat]);
    if (!xy) continue;
    const [x, y] = xy;
    const ix = Math.round(x);
    const iy = Math.round(y);
    if (ix < 0 || iy < 0 || ix >= W || iy >= H) continue;
    if (ctx.data[iy * W + ix]) {
      points.push([Math.round(lat * 100) / 100, Math.round(lng * 100) / 100]);
    }
  }
}

const out = path.join(
  __dirname,
  '../src/components/analytics/liveGlobeLandPoints.data.json',
);
fs.writeFileSync(out, JSON.stringify(points));
console.log(
  JSON.stringify({
    points: points.length,
    painted,
    ms: Date.now() - t0,
    bytes: fs.statSync(out).size,
  }),
);
