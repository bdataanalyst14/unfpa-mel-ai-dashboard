'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2, MapPin } from 'lucide-react';
import { loadLocalUnitsGeoJson, type LocalUnitGeoJson } from '@/lib/map-data';

type Bounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

const WIDTH = 420;
const HEIGHT = 210;
const PADDING = 12;

export default function LocalUnitCoverageMap() {
  const [geojson, setGeojson] = useState<LocalUnitGeoJson | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    loadLocalUnitsGeoJson()
      .then((data) => {
        if (isMounted) setGeojson(data);
      })
      .catch((err: unknown) => {
        if (isMounted) setError(err instanceof Error ? err.message : 'Unable to load map layer.');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const renderedMap = useMemo(() => {
    if (!geojson) return null;
    const bounds = getBounds(geojson);
    const paths = geojson.features.map((feature, index) => {
      const province = String(feature.properties.PR_NAME || feature.properties.province || '');
      const district = String(feature.properties.DISTRICT || feature.properties.district || '');
      const palika = String(
        feature.properties.GaPa_NaPa ||
          feature.properties.PALIKA ||
          feature.properties.NAME ||
          feature.properties.name ||
          `Local unit ${index + 1}`
      );

      return (
        <path
          key={`${palika}-${index}`}
          d={geometryToPath(feature.geometry.coordinates, feature.geometry.type, bounds)}
          className="fill-[#D9E8F6] stroke-white transition-colors hover:fill-[#FFB06F]"
          strokeWidth="0.65"
        >
          <title>{[palika, district, province].filter(Boolean).join(', ')}</title>
        </path>
      );
    });

    return (
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-full w-full" role="img" aria-label="Nepal local-unit coverage map">
        <rect width={WIDTH} height={HEIGHT} rx="8" fill="#F8FAFC" />
        <g>{paths}</g>
      </svg>
    );
  }, [geojson]);

  if (error) {
    return (
      <div className="flex h-full min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed border-amber-200 bg-amber-50 p-4 text-center">
        <MapPin className="mb-2 h-5 w-5 text-amber-600" />
        <p className="text-xs font-semibold text-amber-800">Local-unit map layer unavailable</p>
        <p className="mt-1 text-[11px] text-amber-700">{error}</p>
      </div>
    );
  }

  if (!geojson) {
    return (
      <div className="flex h-full min-h-[220px] items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50">
        <Loader2 className="h-5 w-5 animate-spin text-[#004B87]" />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[220px] flex-col rounded-lg border border-gray-100 bg-gray-50/70 p-3">
      <div className="min-h-0 flex-1">{renderedMap}</div>
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-gray-100 pt-3 text-[10px] text-gray-500">
        <span>{geojson.features.length.toLocaleString()} local-unit boundaries</span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-[#FF6600]" />
          Hover boundary
        </span>
      </div>
    </div>
  );
}

function getBounds(geojson: LocalUnitGeoJson): Bounds {
  const bounds = {
    minX: Number.POSITIVE_INFINITY,
    minY: Number.POSITIVE_INFINITY,
    maxX: Number.NEGATIVE_INFINITY,
    maxY: Number.NEGATIVE_INFINITY,
  };

  for (const feature of geojson.features) {
    visitCoordinatePairs(feature.geometry.coordinates, (x, y) => {
      bounds.minX = Math.min(bounds.minX, x);
      bounds.minY = Math.min(bounds.minY, y);
      bounds.maxX = Math.max(bounds.maxX, x);
      bounds.maxY = Math.max(bounds.maxY, y);
    });
  }

  return bounds;
}

function geometryToPath(coordinates: number[][][] | number[][][][], type: string, bounds: Bounds) {
  const polygons = type === 'MultiPolygon' ? (coordinates as number[][][][]) : [coordinates as number[][][]];
  return polygons
    .map((polygon) =>
      polygon
        .map((ring) =>
          ring
            .map(([x, y], index) => {
              const [screenX, screenY] = projectPoint(x, y, bounds);
              return `${index === 0 ? 'M' : 'L'}${screenX.toFixed(2)} ${screenY.toFixed(2)}`;
            })
            .join(' ')
        )
        .join(' Z ')
    )
    .join(' Z ');
}

function projectPoint(x: number, y: number, bounds: Bounds) {
  const availableWidth = WIDTH - PADDING * 2;
  const availableHeight = HEIGHT - PADDING * 2;
  const scale = Math.min(availableWidth / (bounds.maxX - bounds.minX), availableHeight / (bounds.maxY - bounds.minY));
  const mapWidth = (bounds.maxX - bounds.minX) * scale;
  const mapHeight = (bounds.maxY - bounds.minY) * scale;
  const offsetX = (WIDTH - mapWidth) / 2;
  const offsetY = (HEIGHT - mapHeight) / 2;

  return [offsetX + (x - bounds.minX) * scale, offsetY + (bounds.maxY - y) * scale];
}

function visitCoordinatePairs(value: unknown, visitor: (x: number, y: number) => void) {
  if (!Array.isArray(value)) return;
  if (typeof value[0] === 'number' && typeof value[1] === 'number') {
    visitor(value[0], value[1]);
    return;
  }
  for (const child of value) {
    visitCoordinatePairs(child, visitor);
  }
}
