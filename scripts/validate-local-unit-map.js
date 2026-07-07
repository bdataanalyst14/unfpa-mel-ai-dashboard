const fs = require('fs');
const path = require('path');

const MAP_PATH = path.join(process.cwd(), 'public', 'maps', 'local-units.geojson');
const NAME_FIELD_PATTERN = /(gapa|napa|palika|local|mun|municip|gaun|name)/i;
const ID_FIELD_PATTERN = /(code|id|hlcit|gid|objectid)/i;
const DISTRICT_FIELD_PATTERN = /(district|dist)/i;
const PROVINCE_FIELD_PATTERN = /(^province$|province|pr_?name)/i;

function findField(properties, pattern) {
  return Object.keys(properties).find((key) => pattern.test(key));
}

function main() {
  if (!fs.existsSync(MAP_PATH)) {
    throw new Error('public/maps/local-units.geojson does not exist. Run npm run prepare:local-unit-map first.');
  }

  const raw = fs.readFileSync(MAP_PATH, 'utf8');
  const geojson = JSON.parse(raw);

  if (geojson.type !== 'FeatureCollection') {
    throw new Error(`Expected FeatureCollection, received ${geojson.type}`);
  }

  if (!Array.isArray(geojson.features) || geojson.features.length === 0) {
    throw new Error('Expected at least one local-unit feature.');
  }

  const firstFeatureWithProperties = geojson.features.find(
    (feature) => feature && feature.properties && Object.keys(feature.properties).length > 0
  );

  if (!firstFeatureWithProperties) {
    throw new Error('Expected at least one feature with properties.');
  }

  const properties = firstFeatureWithProperties.properties;
  const nameField = findField(properties, NAME_FIELD_PATTERN);
  const idField = findField(properties, ID_FIELD_PATTERN);
  const districtField = findField(properties, DISTRICT_FIELD_PATTERN);
  const provinceField = findField(properties, PROVINCE_FIELD_PATTERN) || findField(properties, /state/i);

  if (!nameField) {
    throw new Error('No likely local-unit name field found in feature properties.');
  }

  const summary = {
    path: path.relative(process.cwd(), MAP_PATH),
    type: geojson.type,
    featureCount: geojson.features.length,
    firstFeatureGeometryType: firstFeatureWithProperties.geometry?.type || null,
    propertyFields: Object.keys(properties),
    likelyFields: {
      province: provinceField || null,
      district: districtField || null,
      localUnitName: nameField,
      localUnitId: idField || null,
    },
  };

  console.log(JSON.stringify(summary, null, 2));
}

main();
