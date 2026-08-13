'use client';

import React, { useState, useMemo } from 'react';
import { nepalMapBoundaries } from '@/data/geo/nepal-map-base';
import { geographicMapMetrics } from '@/data/mock/geographic-map-metrics';
import { Info, ShieldCheck } from 'lucide-react';
import type { Activity } from '@/lib/types';

// Constants to match the generation script
const MIN_LNG = 80.0;
const MAX_LNG = 89.2;
const MIN_LAT = 25.8;
const MAX_LAT = 31.0;
const MAP_WIDTH = 900;
const MAP_HEIGHT = 420;

function project(lng: number, lat: number) {
  const x = ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * MAP_WIDTH;
  const y = ((MAX_LAT - lat) / (MAX_LAT - MIN_LAT)) * MAP_HEIGHT;
  return { x, y };
}

export default function GeographicCoverageMap({
  activities,
  hideGbv = false,
}: {
  activities?: Activity[];
  hideGbv?: boolean;
}) {
  const [metricView, setMetricView] = useState<'activity' | 'reach' | 'gbv'>('activity');
  const [viewLevel, setViewLevel] = useState<'district' | 'province' | 'palika'>('district');
  const mapMetrics = useMemo(() => {
    if (!activities) return geographicMapMetrics;

    return geographicMapMetrics.flatMap((metric) => {
      const matching = activities.filter((row) => row.district === metric.district);
      if (matching.length === 0) return [];
      const activityCount = matching.length;
      return [{
        ...metric,
        activityCount,
        reachCount: matching.reduce((sum, row) => sum + row.totalParticipants, 0),
        density:
          activityCount >= 8
            ? 'high' as const
            : activityCount >= 4
              ? 'medium' as const
              : 'low' as const,
      }];
    });
  }, [activities]);

  const metricLabel = useMemo(() => {
    switch (metricView) {
      case 'activity': return 'Activity Density';
      case 'reach': return 'Participant Reach';
      case 'gbv': return 'GBV Case Support';
      default: return 'Activity Density';
    }
  }, [metricView]);

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-1">Map View</label>
            <div className="flex bg-gray-50 p-0.5 rounded-md border border-gray-200">
              <button 
                onClick={() => setMetricView('activity')}
                className={`min-h-11 cursor-pointer px-3 py-1 text-xs rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004B87] ${metricView === 'activity' ? 'bg-white text-[#004B87] shadow-sm font-semibold' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Activity
              </button>
              <button 
                onClick={() => setMetricView('reach')}
                className={`min-h-11 cursor-pointer px-3 py-1 text-xs rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004B87] ${metricView === 'reach' ? 'bg-white text-[#004B87] shadow-sm font-semibold' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Reach
              </button>
              {!hideGbv ? (
                <button
                  onClick={() => setMetricView('gbv')}
                  className={`min-h-11 cursor-pointer px-3 py-1 text-xs rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004B87] ${metricView === 'gbv' ? 'bg-white text-[#004B87] shadow-sm font-semibold' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  GBV
                </button>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-1">View By</label>
            <div className="flex bg-gray-50 p-0.5 rounded-md border border-gray-200">
              <button 
                onClick={() => setViewLevel('district')}
                className={`min-h-11 cursor-pointer px-3 py-1 text-xs rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004B87] ${viewLevel === 'district' ? 'bg-white text-[#004B87] shadow-sm font-semibold' : 'text-gray-500 hover:text-gray-700'}`}
              >
                District
              </button>
              <button 
                onClick={() => setViewLevel('province')}
                className={`min-h-11 cursor-pointer px-3 py-1 text-xs rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004B87] ${viewLevel === 'province' ? 'bg-white text-[#004B87] shadow-sm font-semibold' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Province
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium bg-blue-50/50 px-3 py-1.5 rounded-full border border-blue-100">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>Aggregated Privacy View Active</span>
        </div>
      </div>

      {/* Map Canvas - More compact card */}
      <div className="relative flex-1 bg-white border border-gray-100 rounded-xl shadow-inner overflow-hidden min-h-[400px]">
        {/* Header - tighter positioning */}
        <div className="absolute top-3 left-3 z-10">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">Programme Coverage Map</h2>
          <p className="text-xs text-gray-500 font-medium">Aggregated implementation coverage by {metricLabel.toLowerCase()}</p>
        </div>

        {/* Integrated Legend - bottom right, closer to map */}
        <div className="absolute bottom-4 right-4 z-10 bg-white/95 backdrop-blur-sm p-2.5 rounded-md border border-gray-200 shadow-md">
          <p className="text-[10px] font-bold text-gray-500 uppercase mb-1.5 tracking-wider">Density Legend</p>
          <div className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#004B87]" />
            <span>High Coverage</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF6600]" />
            <span>Medium Coverage</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFB06F]" />
            <span>Initial Presence</span>
          </div>
        </div>

        {/* SVG Map - centered, larger, reduced padding */}
        <svg 
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} 
          className="w-full h-full p-12"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Nepal Programme Coverage Map"
        >
          {/* Base Layer: Nepal Boundaries - stronger outline */}
          <g className="map-base">
            {nepalMapBoundaries.map((boundary) => (
              <path
                key={boundary.id}
                d={boundary.path}
                className="fill-gray-50 stroke-gray-600 hover:fill-gray-100 transition-colors duration-200"
                strokeWidth="1.5"
              >
                <title>{boundary.localUnit}, {boundary.district}, Province {boundary.province}</title>
              </path>
            ))}
          </g>

          {/* Data Layer: Metric Bubbles - improved visibility */}
          <g className="map-metrics">
            {mapMetrics.map((metric) => {
              const { x, y } = project(metric.lng, metric.lat);
              
              // Scale radius based on metric
              let radius = 10;
              if (metricView === 'reach') {
                radius = Math.max(6, Math.min(25, metric.reachCount / 50));
              } else if (metricView === 'gbv') {
                radius = 12;
              } else {
                radius = Math.max(8, Math.min(20, metric.activityCount * 0.8));
              }

              let color = '#FFB06F';
              if (metric.density === 'high') color = '#004B87';
              else if (metric.density === 'medium') color = '#FF6600';

              return (
                <g key={metric.district} className="cursor-pointer group">
                  {/* Outer ring for better visibility */}
                  <circle
                    cx={x}
                    cy={y}
                    r={radius + 3}
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="2"
                  />
                  {/* Main marker */}
                  <circle
                    cx={x}
                    cy={y}
                    r={radius}
                    fill={color}
                    fillOpacity="0.8"
                    className="stroke-white hover:fill-opacity-100 transition-all duration-200"
                    strokeWidth="2"
                  >
                    <title>{metric.district}: {metric.activityCount} activities</title>
                  </circle>
                  {/* District Label - show on hover */}
                  <text
                    x={x}
                    y={y + radius + 10}
                    textAnchor="middle"
                    className="text-[9px] font-bold fill-gray-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  >
                    {metric.district}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {activities && mapMetrics.length === 0 ? (
          <div
            className="absolute inset-0 flex items-center justify-center bg-white/90 p-8 text-center"
            role="status"
            data-empty-kind="map"
          >
            <div>
              <p className="text-sm font-semibold text-gray-900">No map data for the selected filters</p>
              <p className="mt-1 text-xs text-gray-600">
                Matching activity rows do not include a validated district map point.
              </p>
            </div>
          </div>
        ) : null}

        {/* Privacy Note - bottom left, subtle styling */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 text-[10px] text-gray-500 font-medium">
          <Info className="w-3 h-3" />
          <span>Privacy Secured: Survivor-level data is never stored or rendered.</span>
        </div>
      </div>
    </div>
  );
}
