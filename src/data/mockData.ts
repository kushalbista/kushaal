// Mock data for Bhumi Drishti MVP - Gongabu, Kathmandu

export interface PlotData {
  id: string;
  gridX: number;
  gridY: number;
  exposureLevel: 'low' | 'moderate' | 'elevated';
  exposureIntensity: number; // 0-100
  indicators: {
    floodExposure: {
      level: 'Low' | 'Medium' | 'High';
      yearsAffected: number;
      totalYears: number;
      lastFloodYear: number | null;
      riverProximity: number; // meters
      riverName: string;
    };
    drainageRisk: {
      level: 'Low' | 'Medium' | 'High';
      isLowLying: boolean;
      isWaterConvergence: boolean;
      flowAccumulation: 'Minimal' | 'Moderate' | 'Significant';
    };
    terrainSlope: {
      category: 'Flat' | 'Moderate' | 'Steep';
      slopePercent: number;
      aspect: string;
    };
    elevation: {
      plotElevation: number;
      wardAverage: number;
      difference: number;
      relativePosition: 'Lower' | 'Similar' | 'Higher';
    };
    roadAccessibility: {
      distanceMeters: number;
      accessLevel: 'Good' | 'Moderate' | 'Limited';
      nearestRoad: string;
    };
    surroundingLandUse: {
      dominant: string;
      categories: string[];
    };
    soilType: {
      type: string;
      category: 'Alluvial' | 'Clay-Dominant' | 'Sandy-Loam' | 'Mixed';
      disclaimer: string;
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

const landUseOptions = [
  'Settlement',
  'Agriculture',
  'River',
  'Open Land',
  'Commercial',
  'Industrial',
  'Green Space',
  'Mixed Use'
];

const roadNames = [
  'Ring Road',
  'Tokha Road',
  'Samakhusi Road',
  'Basundhara Road',
  'Gongabu Main Road',
  'Local Access Road'
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
  const getExposurePattern = (x: number, y: number): number => {
    const centerX = gridCols / 2;
    const bottomBias = (y / gridRows) * 30;
    const centerProximity = Math.abs(x - centerX) / centerX;
    const randomFactor = Math.random() * 40;
    return Math.min(100, Math.max(0, bottomBias + (1 - centerProximity) * 25 + randomFactor));
  };

  const soilTypes = [
    { type: 'Alluvial Deposit', category: 'Alluvial' as const },
    { type: 'Sandy Loam', category: 'Sandy-Loam' as const },
    { type: 'Clay-Rich Soil', category: 'Clay-Dominant' as const },
    { type: 'Mixed Sediment', category: 'Mixed' as const },
  ];

  for (let y = 0; y < gridRows; y++) {
    const row: PlotData[] = [];
    for (let x = 0; x < gridCols; x++) {
      const intensity = getExposurePattern(x, y);
      const exposureLevel = intensity < 35 ? 'low' : intensity < 65 ? 'moderate' : 'elevated';
      
      const yearsAffected = Math.floor(intensity / 18);
      const plotElevation = 1310 - (y * 3) + (Math.random() * 10 - 5);
      const wardAverage = 1300;
      const elevDiff = Math.round(plotElevation - wardAverage);
      const soil = soilTypes[Math.floor(Math.random() * soilTypes.length)];
      
      // River proximity - closer to bottom = closer to river
      const riverProximity = Math.round(500 - (y * 40) + (Math.random() * 100));
      
      // Road distance
      const roadDistance = Math.round(50 + Math.random() * 400);
      
      // Slope calculation
      const slopePercent = Math.round(Math.random() * 15);
      
      // Determine levels based on data
      const floodLevel: 'Low' | 'Medium' | 'High' = yearsAffected < 2 ? 'Low' : yearsAffected < 4 ? 'Medium' : 'High';
      const drainageLevel: 'Low' | 'Medium' | 'High' = intensity < 35 ? 'Low' : intensity < 65 ? 'Medium' : 'High';
      const accessLevel: 'Good' | 'Moderate' | 'Limited' = roadDistance < 100 ? 'Good' : roadDistance < 250 ? 'Moderate' : 'Limited';
      const slopeCategory: 'Flat' | 'Moderate' | 'Steep' = slopePercent < 5 ? 'Flat' : slopePercent < 10 ? 'Moderate' : 'Steep';
      const relativePosition: 'Lower' | 'Similar' | 'Higher' = elevDiff < -5 ? 'Lower' : elevDiff > 5 ? 'Higher' : 'Similar';

      // Random land use
      const shuffledLandUse = [...landUseOptions].sort(() => Math.random() - 0.5);
      
      row.push({
        id: `gongabu-${x}-${y}`,
        gridX: x,
        gridY: y,
        exposureLevel,
        exposureIntensity: Math.round(intensity),
        indicators: {
          floodExposure: {
            level: floodLevel,
            yearsAffected,
            totalYears: 10,
            lastFloodYear: yearsAffected > 0 ? 2019 + Math.floor(Math.random() * 5) : null,
            riverProximity: Math.max(50, riverProximity),
            riverName: 'Bishnumati River'
          },
          drainageRisk: {
            level: drainageLevel,
            isLowLying: elevDiff < -3,
            isWaterConvergence: intensity > 50 && slopePercent < 5,
            flowAccumulation: intensity < 35 ? 'Minimal' : intensity < 65 ? 'Moderate' : 'Significant'
          },
          terrainSlope: {
            category: slopeCategory,
            slopePercent,
            aspect: ['North', 'South', 'East', 'West', 'Northeast', 'Southeast'][Math.floor(Math.random() * 6)]
          },
          elevation: {
            plotElevation: Math.round(plotElevation),
            wardAverage,
            difference: elevDiff,
            relativePosition
          },
          roadAccessibility: {
            distanceMeters: roadDistance,
            accessLevel,
            nearestRoad: roadNames[Math.floor(Math.random() * roadNames.length)]
          },
          surroundingLandUse: {
            dominant: shuffledLandUse[0],
            categories: shuffledLandUse.slice(0, 3)
          },
          soilType: {
            type: soil.type,
            category: soil.category,
            disclaimer: 'Indicative only, derived from regional soil maps. Not soil bearing capacity or construction suitability.'
          }
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
