export const LOCAL_UNITS_GEOJSON_URL = '/maps/local-units.geojson';

export type LocalUnitGeoJsonProperties = Record<string, string | number | boolean | null>;

export type LocalUnitGeoJsonFeature = {
  type: 'Feature';
  properties: LocalUnitGeoJsonProperties;
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
};

export type LocalUnitGeoJson = {
  type: 'FeatureCollection';
  name?: string;
  features: LocalUnitGeoJsonFeature[];
};

export async function loadLocalUnitsGeoJson(): Promise<LocalUnitGeoJson> {
  const response = await fetch(LOCAL_UNITS_GEOJSON_URL);
  if (!response.ok) {
    throw new Error(`Failed to load local-unit map asset: ${response.status}`);
  }

  const geojson = (await response.json()) as LocalUnitGeoJson;
  if (geojson.type !== 'FeatureCollection' || !Array.isArray(geojson.features)) {
    throw new Error('Invalid local-unit GeoJSON asset.');
  }

  return geojson;
}
