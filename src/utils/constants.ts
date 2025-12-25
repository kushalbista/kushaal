// Application constants

// Gongabu, Kathmandu coordinates
export const DEFAULT_LOCATION = {
  lat: 27.7350,
  lng: 85.3206,
  name: 'Gongabu, Kathmandu',
  wardNumber: 13
} as const;

// Grid configuration
export const GRID_CONFIG = {
  rows: 8,
  cols: 10,
  cellSpacing: 2
} as const;

// Risk thresholds
export const RISK_THRESHOLDS = {
  low: 35,
  moderate: 65
} as const;

// Data source metadata
export const DATA_SOURCE = {
  name: 'Historical Flood & Satellite Data',
  yearRange: '2009–2019',
  disclaimer: 'Historical data analysis only. This is not a legal, financial, or official land assessment.',
  sources: ['Municipal records', 'Satellite imagery', 'Geological surveys']
} as const;

// 360 view placeholder images by risk level
export const PLACEHOLDER_360_IMAGES = {
  default: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=2048&h=1024&fit=crop',
  low: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=2048&h=1024&fit=crop',
  moderate: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=2048&h=1024&fit=crop',
  high: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=2048&h=1024&fit=crop'
} as const;

// Animation durations
export const ANIMATION = {
  fast: 150,
  normal: 300,
  slow: 500
} as const;
