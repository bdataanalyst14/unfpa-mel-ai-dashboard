const fs = require('fs');
const path = require('path');

const SEARCH_PATHS = [
  'Local Unit',
  'local-unit',
  'local_unit',
  path.join('data', 'Local Unit'),
  path.join('data', 'local-unit'),
  path.join('public', 'Local Unit'),
  path.join('public', 'maps', 'Local Unit'),
  path.join('public', 'maps', 'local-unit'),
];

const OUTPUT_PATH = path.join('public', 'maps', 'local-units.geojson');
const SIMPLIFY_TOLERANCE = 0.00035;
const COORDINATE_PRECISION = 6;

function discoverShapefileFolder(repoRoot) {
  for (const candidate of SEARCH_PATHS) {
    const absolute = path.join(repoRoot, candidate);
    const components = getShapefileComponents(absolute);
    if (components) {
      return { folder: absolute, relativeFolder: candidate, components };
    }
  }

  const stack = [repoRoot];
  while (stack.length) {
    const current = stack.pop();
    let entries = [];
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }

    const components = getShapefileComponents(current);
    if (components) {
      return {
        folder: current,
        relativeFolder: path.relative(repoRoot, current) || '.',
        components,
      };
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.next') continue;
      stack.push(path.join(current, entry.name));
    }
  }

  return null;
}

function getShapefileComponents(folder) {
  if (!fs.existsSync(folder) || !fs.statSync(folder).isDirectory()) return null;

  const files = fs.readdirSync(folder);
  const byBase = new Map();
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!['.shp', '.shx', '.dbf', '.prj'].includes(ext)) continue;
    const base = path.basename(file, ext).toLowerCase();
    const current = byBase.get(base) || {};
    current[ext.slice(1)] = path.join(folder, file);
    byBase.set(base, current);
  }

  for (const components of byBase.values()) {
    if (components.shp && components.shx && components.dbf) {
      return components;
    }
  }

  return null;
}

function readDbf(dbfPath) {
  const buffer = fs.readFileSync(dbfPath);
  const recordCount = buffer.readUInt32LE(4);
  const headerLength = buffer.readUInt16LE(8);
  const recordLength = buffer.readUInt16LE(10);
  const fields = [];

  for (let offset = 32; offset < headerLength - 1; offset += 32) {
    if (buffer[offset] === 0x0d) break;
    const rawName = buffer.subarray(offset, offset + 11);
    const name = rawName.toString('latin1').replace(/\0/g, '').trim();
    const type = String.fromCharCode(buffer[offset + 11]);
    const length = buffer[offset + 16];
    const decimalCount = buffer[offset + 17];
    fields.push({ name, type, length, decimalCount });
  }

  const records = [];
  for (let index = 0; index < recordCount; index += 1) {
    const recordOffset = headerLength + index * recordLength;
    if (buffer[recordOffset] === 0x2a) {
      records.push(null);
      continue;
    }

    const record = {};
    let fieldOffset = recordOffset + 1;
    for (const field of fields) {
      const raw = buffer.subarray(fieldOffset, fieldOffset + field.length).toString('latin1').trim();
      fieldOffset += field.length;
      if (!raw) {
        record[field.name] = null;
      } else if (field.type === 'N' || field.type === 'F') {
        const number = Number(raw);
        record[field.name] = Number.isFinite(number) ? number : raw;
      } else if (field.type === 'L') {
        record[field.name] = ['Y', 'y', 'T', 't'].includes(raw);
      } else {
        record[field.name] = raw;
      }
    }
    records.push(record);
  }

  return { fields, records };
}

function readShp(shpPath) {
  const buffer = fs.readFileSync(shpPath);
  const shapes = [];
  let offset = 100;

  while (offset + 8 <= buffer.length) {
    const contentLengthWords = buffer.readInt32BE(offset + 4);
    const contentStart = offset + 8;
    const contentLength = contentLengthWords * 2;
    const nextOffset = contentStart + contentLength;
    const shapeType = buffer.readInt32LE(contentStart);

    if (shapeType === 0) {
      shapes.push(null);
    } else if (shapeType === 5 || shapeType === 15) {
      shapes.push(readPolygon(buffer, contentStart, shapeType === 15));
    } else {
      throw new Error(`Unsupported shapefile shape type ${shapeType}. Expected Polygon or PolygonZ.`);
    }

    offset = nextOffset;
  }

  return shapes;
}

function readPolygon(buffer, contentStart, hasZ) {
  const numParts = buffer.readInt32LE(contentStart + 36);
  const numPoints = buffer.readInt32LE(contentStart + 40);
  const partsOffset = contentStart + 44;
  const pointsOffset = partsOffset + numParts * 4;
  const partStarts = [];
  const rings = [];

  for (let partIndex = 0; partIndex < numParts; partIndex += 1) {
    partStarts.push(buffer.readInt32LE(partsOffset + partIndex * 4));
  }

  for (let partIndex = 0; partIndex < numParts; partIndex += 1) {
    const start = partStarts[partIndex];
    const end = partIndex + 1 < numParts ? partStarts[partIndex + 1] : numPoints;
    const ring = [];
    for (let pointIndex = start; pointIndex < end; pointIndex += 1) {
      const pointOffset = pointsOffset + pointIndex * 16;
      ring.push([
        roundCoordinate(buffer.readDoubleLE(pointOffset)),
        roundCoordinate(buffer.readDoubleLE(pointOffset + 8)),
      ]);
    }
    rings.push(closeRing(simplifyRing(ring, SIMPLIFY_TOLERANCE)));
  }

  // Skip Z/M payloads by relying on record lengths; points were already read.
  void hasZ;
  return ringsToGeometry(rings);
}

function ringsToGeometry(rings) {
  const polygons = [];
  let currentPolygon = null;

  for (const ring of rings) {
    if (ring.length < 4) continue;
    const isOuter = signedRingArea(ring) < 0 || currentPolygon === null;
    if (isOuter) {
      currentPolygon = [ensureOrientation(ring, false)];
      polygons.push(currentPolygon);
    } else {
      currentPolygon.push(ensureOrientation(ring, true));
    }
  }

  if (polygons.length === 1) {
    return { type: 'Polygon', coordinates: polygons[0] };
  }

  return { type: 'MultiPolygon', coordinates: polygons };
}

function signedRingArea(ring) {
  let area = 0;
  for (let index = 0; index < ring.length - 1; index += 1) {
    const [x1, y1] = ring[index];
    const [x2, y2] = ring[index + 1];
    area += x1 * y2 - x2 * y1;
  }
  return area / 2;
}

function ensureOrientation(ring, clockwise) {
  const area = signedRingArea(ring);
  const isClockwise = area < 0;
  if (isClockwise === clockwise) return ring;
  return [...ring].reverse();
}

function simplifyRing(ring, tolerance) {
  if (ring.length <= 5) return ring;
  const open = ring.slice(0, -1);
  const simplified = douglasPeucker(open, tolerance);
  return simplified.length >= 3 ? simplified : open;
}

function douglasPeucker(points, tolerance) {
  if (points.length <= 2) return points;
  let maxDistance = 0;
  let maxIndex = 0;
  const first = points[0];
  const last = points[points.length - 1];

  for (let index = 1; index < points.length - 1; index += 1) {
    const distance = perpendicularDistance(points[index], first, last);
    if (distance > maxDistance) {
      maxDistance = distance;
      maxIndex = index;
    }
  }

  if (maxDistance <= tolerance) {
    return [first, last];
  }

  const left = douglasPeucker(points.slice(0, maxIndex + 1), tolerance);
  const right = douglasPeucker(points.slice(maxIndex), tolerance);
  return left.slice(0, -1).concat(right);
}

function perpendicularDistance(point, lineStart, lineEnd) {
  const [x, y] = point;
  const [x1, y1] = lineStart;
  const [x2, y2] = lineEnd;
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (dx === 0 && dy === 0) {
    return Math.hypot(x - x1, y - y1);
  }
  return Math.abs(dy * x - dx * y + x2 * y1 - y2 * x1) / Math.hypot(dx, dy);
}

function closeRing(ring) {
  if (!ring.length) return ring;
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first[0] === last[0] && first[1] === last[1]) return ring;
  return [...ring, first];
}

function roundCoordinate(value) {
  return Number(value.toFixed(COORDINATE_PRECISION));
}

function summarizeFields(fields) {
  const lowerNames = fields.map((field) => field.name.toLowerCase());
  const findByPattern = (pattern) => fields.find((field) => pattern.test(field.name.toLowerCase()))?.name || null;

  return {
    province: findByPattern(/^province$|province|pr_?name/) || findByPattern(/state/),
    district: findByPattern(/district|dist/),
    localUnitName: findByPattern(/gapa|napa|palika|local|mun|municip|gaun|name/),
    localUnitId: findByPattern(/local.*code|code|id|hlcit|gid|objectid|state_code/),
    all: lowerNames,
  };
}

function main() {
  const repoRoot = process.cwd();
  const discovered = discoverShapefileFolder(repoRoot);
  if (!discovered) {
    throw new Error('No shapefile folder found in the configured relative search paths or repository fallback scan.');
  }

  const { fields, records } = readDbf(discovered.components.dbf);
  const shapes = readShp(discovered.components.shp);
  const features = [];

  for (let index = 0; index < shapes.length; index += 1) {
    const geometry = shapes[index];
    const properties = records[index];
    if (!geometry || !properties) continue;
    features.push({ type: 'Feature', properties, geometry });
  }

  const geojson = {
    type: 'FeatureCollection',
    name: 'nepal-local-units',
    crs: {
      type: 'name',
      properties: {
        name: 'GEOGCS["NepalDD",DATUM["D_Everest_Bangladesh"]]',
      },
    },
    features,
  };

  const outputPath = path.join(repoRoot, OUTPUT_PATH);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(geojson)}\n`);

  const stats = fs.statSync(outputPath);
  const summary = {
    shapefileFolder: discovered.relativeFolder,
    files: Object.fromEntries(
      Object.entries(discovered.components).map(([key, value]) => [key, path.relative(repoRoot, value)])
    ),
    fieldSummary: summarizeFields(fields),
    fields: fields.map((field) => ({
      name: field.name,
      type: field.type,
      length: field.length,
      decimalCount: field.decimalCount,
    })),
    featureCount: features.length,
    output: OUTPUT_PATH,
    outputBytes: stats.size,
  };

  console.log(JSON.stringify(summary, null, 2));
}

main();
