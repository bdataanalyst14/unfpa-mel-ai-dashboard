export type MapMetric = {
  district: string;
  province: string;
  activityCount: number;
  reachCount: number;
  gbvCases?: number; // Aggregated for privacy
  density: 'high' | 'medium' | 'low' | 'none';
  lat: number;
  lng: number;
};

export const geographicMapMetrics: MapMetric[] = [
  { district: 'Morang', province: 'Koshi', activityCount: 45, reachCount: 1250, density: 'high', lat: 26.65, lng: 87.45 },
  { district: 'Bhojpur', province: 'Koshi', activityCount: 12, reachCount: 340, density: 'medium', lat: 27.15, lng: 87.05 },
  { district: 'Khotang', province: 'Koshi', activityCount: 8, reachCount: 210, density: 'low', lat: 27.20, lng: 86.80 },
  { district: 'Dhanusha', province: 'Madhesh', activityCount: 38, reachCount: 980, density: 'high', lat: 26.85, lng: 86.00 },
  { district: 'Sarlahi', province: 'Madhesh', activityCount: 5, reachCount: 120, density: 'low', lat: 26.95, lng: 85.55 },
  { district: 'Kathmandu', province: 'Bagmati', activityCount: 65, reachCount: 2450, density: 'high', lat: 27.71, lng: 85.32 },
  { district: 'Sindhuli', province: 'Bagmati', activityCount: 15, reachCount: 420, density: 'medium', lat: 27.25, lng: 85.95 },
  { district: 'Kaski', province: 'Gandaki', activityCount: 32, reachCount: 890, density: 'high', lat: 28.25, lng: 83.95 },
  { district: 'Rupandehi', province: 'Lumbini', activityCount: 28, reachCount: 760, density: 'high', lat: 27.65, lng: 83.45 },
  { district: 'Surkhet', province: 'Karnali', activityCount: 22, reachCount: 540, density: 'medium', lat: 28.55, lng: 81.65 },
  { district: 'Rukum West', province: 'Karnali', activityCount: 10, reachCount: 280, density: 'low', lat: 28.75, lng: 82.45 },
  { district: 'Humla', province: 'Karnali', activityCount: 4, reachCount: 85, density: 'low', lat: 30.00, lng: 81.75 },
  { district: 'Kailali', province: 'Sudurpashchim', activityCount: 35, reachCount: 920, density: 'high', lat: 28.75, lng: 80.65 },
  { district: 'Bajhang', province: 'Sudurpashchim', activityCount: 2, reachCount: 45, density: 'low', lat: 29.75, lng: 81.25 },
];
