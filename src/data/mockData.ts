// Mock data for Bhumi Drishti MVP - Gongabu, Kathmandu

export interface PlotData {
  id: string;
  gridX: number;
  gridY: number;
  exposureLevel: 'low' | 'moderate' | 'elevated';
  exposureIntensity: number; // 0-100
  indicators: {
    floodHistory: {
      yearsAffected: number;
      totalYears: number;
      lastFloodYear: number | null;
    };
    elevation: {
      plotElevation: number;
      wardAverage: number;
      difference: number;
    };
    drainageProximity: {
      distanceMeters: number;
      drainageType: string;
    };
    soilType: {
      type: string;
      permeability: 'low' | 'medium' | 'high';
    };
    waterTable: {
      depthMeters: number;
      seasonalVariation: string;
    };
  };
  contextualInfo: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  areaName: string;
  plotNumber: string;
}

export interface SearchResult {
  id: string;
  name: string;
  type: 'ward' | 'landmark' | 'area';
  coordinates: { lat: number; lng: number };
}

// Gongabu-specific plot names
const gongabuLocations = [
  'Gongabu Bus Park',
  'Gongabu Chowk',
  'Tokha Road Junction',
  'Samakhusi Danda',
  'Basundhara Link',
  'Gangabu Settlement',
  'Near Tiktok Restaurant',
  'Gongabu Market Area',
  'Bishnumati Corridor',
  'Ring Road Section',
  'Residential Zone A',
  'Residential Zone B',
  'Commercial Block',
  'Mixed Use Area',
  'Near Ganesh Temple',
  'School Area',
];

const contextualInfoOptions = [
  "Raised plinth construction observed nearby",
  "Drainage improvements completed in 2022",
  "Community flood preparedness programs active",
  "Green infrastructure present in the area",
  "Traditional water management systems documented",
  "Permeable surfaces observed in vicinity",
  "Road drainage upgraded in 2023",
  "Near Bishnumati River flood plain",
  "Seasonal waterlogging reported historically",
  "Improved stormwater management installed",
];

// Generate mock heatmap grid data for Gongabu area
export const generateHeatmapGrid = (): PlotData[][] => {
  const gridRows = 8;
  const gridCols = 10;
  const grid: PlotData[][] = [];
  
  // Gongabu base coordinates
  const baseLat = 27.7350;
  const baseLng = 85.3150;
  
  // Create exposure pattern based on typical Gongabu topography
  // Higher exposure near the center-bottom (lower elevation, near drainage)
  const getExposurePattern = (x: number, y: number): number => {
    // Simulate lower areas having higher exposure
    const centerX = gridCols / 2;
    const bottomBias = (y / gridRows) * 30; // Bottom has higher base exposure
    const centerProximity = Math.abs(x - centerX) / centerX;
    
    // Random variation
    const randomFactor = Math.random() * 40;
    
    // Combine factors
    return Math.min(100, Math.max(0, bottomBias + (1 - centerProximity) * 25 + randomFactor));
  };

  const soilTypes = [
    { type: 'Alluvial', permeability: 'medium' as const },
    { type: 'Sandy Loam', permeability: 'high' as const },
    { type: 'Clay', permeability: 'low' as const },
    { type: 'Silty Clay', permeability: 'low' as const },
  ];

  for (let y = 0; y < gridRows; y++) {
    const row: PlotData[] = [];
    for (let x = 0; x < gridCols; x++) {
      const intensity = getExposurePattern(x, y);
      const exposureLevel = intensity < 35 ? 'low' : intensity < 65 ? 'moderate' : 'elevated';
      
      const yearsAffected = Math.floor(intensity / 18);
      const plotElevation = 1310 - (y * 3) + (Math.random() * 10 - 5);
      const wardAverage = 1300;
      const soil = soilTypes[Math.floor(Math.random() * soilTypes.length)];

      row.push({
        id: `gongabu-${x}-${y}`,
        gridX: x,
        gridY: y,
        exposureLevel,
        exposureIntensity: Math.round(intensity),
        indicators: {
          floodHistory: {
            yearsAffected,
            totalYears: 10,
            lastFloodYear: yearsAffected > 0 ? 2019 + Math.floor(Math.random() * 5) : null,
          },
          elevation: {
            plotElevation: Math.round(plotElevation),
            wardAverage,
            difference: Math.round(plotElevation - wardAverage),
          },
          drainageProximity: {
            distanceMeters: Math.round(30 + Math.random() * 400),
            drainageType: y > gridRows / 2 ? 'Bishnumati Tributary' : 'Municipal Drain',
          },
          soilType: soil,
          waterTable: {
            depthMeters: Math.round(3 + Math.random() * 8),
            seasonalVariation: intensity > 50 ? 'High (1-2m)' : 'Moderate (0.5-1m)',
          },
        },
        contextualInfo: contextualInfoOptions
          .sort(() => Math.random() - 0.5)
          .slice(0, 2 + Math.floor(Math.random() * 2)),
        coordinates: {
          lat: baseLat - (y * 0.0008),
          lng: baseLng + (x * 0.0008),
        },
        areaName: gongabuLocations[Math.floor(Math.random() * gongabuLocations.length)],
        plotNumber: `GB-${String(y + 1).padStart(2, '0')}${String(x + 1).padStart(2, '0')}`,
      });
    }
    grid.push(row);
  }
  
  return grid;
};

export const searchResults: SearchResult[] = [
  { id: '1', name: 'Gongabu Bus Park', type: 'landmark', coordinates: { lat: 27.7355, lng: 85.3160 } },
  { id: '2', name: 'Gongabu Chowk', type: 'landmark', coordinates: { lat: 27.7348, lng: 85.3155 } },
  { id: '3', name: 'Tokha Road', type: 'area', coordinates: { lat: 27.7365, lng: 85.3140 } },
  { id: '4', name: 'Samakhusi Danda', type: 'area', coordinates: { lat: 27.7340, lng: 85.3180 } },
  { id: '5', name: 'Basundhara Link Road', type: 'area', coordinates: { lat: 27.7370, lng: 85.3200 } },
  { id: '6', name: 'Bishnumati Area', type: 'area', coordinates: { lat: 27.7330, lng: 85.3120 } },
  { id: '7', name: 'Ring Road - Gongabu', type: 'area', coordinates: { lat: 27.7360, lng: 85.3150 } },
  { id: '8', name: 'Gangabu Settlement', type: 'area', coordinates: { lat: 27.7345, lng: 85.3170 } },
];

export const layerOptions = [
  { id: 'flood', label: 'Flood Extents', description: 'Historical flood polygons (year-wise)', enabled: true },
  { id: 'drainage', label: 'Drainage Network', description: 'Bishnumati tributaries and municipal drains', enabled: false },
  { id: 'elevation', label: 'Elevation Shading', description: 'Terrain elevation visualization', enabled: false },
  { id: 'soil', label: 'Soil Types', description: 'Soil permeability mapping', enabled: false },
];
