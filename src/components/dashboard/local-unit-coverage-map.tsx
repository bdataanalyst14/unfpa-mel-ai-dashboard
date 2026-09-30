'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2, MapPin } from 'lucide-react';
import { loadLocalUnitsGeoJson, type LocalUnitGeoJson } from '@/lib/map-data';
import type { DashboardPageMetric } from '@/lib/types';

type Bounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

const WIDTH = 420;
const HEIGHT = 210;
const PADDING = 12;

export default function LocalUnitCoverageMap({ districts = [], selectedDistrict = '', compact = false }: { districts?: DashboardPageMetric[]; selectedDistrict?: string; compact?: boolean }) {
  const [geojson, setGeojson] = useState<LocalUnitGeoJson | null>(null);
  const [error, setError] = useState<string | null>(null);
  const normalize = (value: string) => value.trim().toLowerCase();
  const counts = useMemo(() => new Map(districts.map(item => [item.label.trim().toLowerCase(), item.value])), [districts]);

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
      const province = String(feature.properties.Province || feature.properties.PR_NAME || feature.properties.province || '');
      const district = String(feature.properties.DISTRICT || feature.properties.district || '');
      const palika = String(
        feature.properties.GaPa_NaPa ||
          feature.properties.PALIKA ||
          feature.properties.NAME ||
          feature.properties.name ||
          `Local unit ${index + 1}`
      );

      const value = counts.get(normalize(district));
      const count = value && /^\d+$/.test(value) ? Number(value) : null;
      const color = count === null ? '#E2E8F0' : count === 0 ? '#F8FAFC' : count < 100 ? '#93C5FD' : count < 1000 ? '#3B82F6' : '#004B87';
      return (
        <path
          key={`${palika}-${index}`}
          d={geometryToPath(feature.geometry.coordinates, feature.geometry.type, bounds)}
          fill={color}
          stroke={selectedDistrict && normalize(district) === normalize(selectedDistrict) ? '#FF6600' : 'white'}
          strokeWidth={selectedDistrict && normalize(district) === normalize(selectedDistrict) ? '0.9' : '0.35'}
        >
          <title>{[district, province].filter(Boolean).join(', ')} — district attendance: {value ?? 'Not available'}. Boundary only; no local-unit count.</title>
        </path>
      );
    });

    return (
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-full w-full" role="img" aria-label="Nepal local-unit coverage map">
        <rect width={WIDTH} height={HEIGHT} rx="8" fill="#F8FAFC" />
        <g>{paths}</g>
      </svg>
    );
  }, [geojson, counts, selectedDistrict]);

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

  if (compact) {
    return <div className="space-y-2 text-[11px] text-gray-600">
      <div className="aspect-[2/1] w-full">{renderedMap}</div>
      <p>{geojson.features.length.toLocaleString()} boundary features · District aggregates only</p>
      <p>Grey: unavailable or suppressed. Activity density is not available.</p>
    </div>;
  }

  return (
    <div className="flex h-full min-h-[220px] flex-col rounded-lg border border-gray-100 bg-gray-50/70 p-3">
      <div className="text-xs text-gray-600">
        <p className="font-semibold text-[#004B87]">District participant reach · Aggregated privacy view</p>
        {!compact && <p className="mt-1">Activity density is not yet available. No participant locations or local-unit counts are plotted.</p>}
        {selectedDistrict && <p className="mt-1">Selected district: {selectedDistrict}</p>}
      </div>
      <div className="aspect-[2/1] w-full">{renderedMap}</div>
      <div className="space-y-2 border-t border-gray-200 pt-3 text-[11px] text-gray-600">
        <p className="font-semibold">Reach density legend · district attendance counts</p>
        <div className="flex flex-wrap gap-x-3 gap-y-2">
          {[['#F8FAFC', '0'], ['#93C5FD', '5–99'], ['#3B82F6', '100–999'], ['#004B87', '1,000+'], ['#E2E8F0', 'Unavailable / suppressed']].map(([color, label]) => (
            <span key={label} className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm border border-slate-300" style={{ backgroundColor: color }} />{label}</span>
          ))}
        </div>
        <p>{geojson.features.length.toLocaleString()} boundary features{!compact && ' · Counts apply to entire districts, not individual polygons.'}</p>
        {!compact && <p>Counts 1–4 remain suppressed. Grey does not mean zero coverage.</p>}
        {!districts.length && <p>District reach is not available for this selection; geographic boundaries remain visible.</p>}
        {!compact && districts.some(item => !geojson.features.some(feature => normalize(String(feature.properties.DISTRICT ?? '')) === normalize(item.label))) && <p>Some district names do not match the boundary asset and are listed only in the supporting chart.</p>}
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
            .join(' ') + ' Z'
        )
        .join(' ')
    )
    .join(' ');
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
