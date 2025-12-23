// Mock data for Bhumi Drishti MVP - Kathmandu Valley

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
  };
  contextualInfo: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  areaName: string;
}

export interface SearchResult {
  id: string;
  name: string;
  type: 'ward' | 'landmark' | 'area';
  coordinates: { lat: number; lng: number };
}

// Generate mock heatmap grid data for Kathmandu Valley
export const generateHeatmapGrid = (): PlotData[][] => {
  const gridSize = 10;
  const grid: PlotData[][] = [];
  
  const areaNames = [
    'Thamel', 'Durbar Marg', 'Balaju', 'Baneshwor', 'Koteshwor',
    'Kalanki', 'Chabahil', 'Bouddha', 'Lazimpat', 'Maharajgunj',
    'Patan', 'Lalitpur', 'Bhaktapur', 'Kirtipur', 'Tokha',
    'Gongabu', 'Samakhusi', 'Dillibazar', 'Putalisadak', 'Jawalakhel'
  ];

  const contextualInfoOptions = [
    "Raised plinth construction observed nearby",
    "Drainage improvements completed in 2021",
    "Community flood preparedness programs active",
    "Green infrastructure present in the area",
    "Traditional water management systems documented",
    "Permeable surfaces observed in vicinity"
  ];

  for (let y = 0; y < gridSize; y++) {
    const row: PlotData[] = [];
    for (let x = 0; x < gridSize; x++) {
      // Generate realistic exposure patterns
      const baseIntensity = Math.random();
      const centralBias = 1 - (Math.abs(x - 5) + Math.abs(y - 5)) / 10;
      const intensity = Math.min(100, Math.max(0, (baseIntensity * 0.6 + centralBias * 0.4) * 100));
      
      const exposureLevel = intensity < 35 ? 'low' : intensity < 65 ? 'moderate' : 'elevated';
      
      const yearsAffected = Math.floor(intensity / 20);
      const plotElevation = 1280 + Math.random() * 100 + (y * 5);
      const wardAverage = 1320;

      row.push({
        id: `plot-${x}-${y}`,
        gridX: x,
        gridY: y,
        exposureLevel,
        exposureIntensity: Math.round(intensity),
        indicators: {
          floodHistory: {
            yearsAffected,
            totalYears: 10,
            lastFloodYear: yearsAffected > 0 ? 2020 + Math.floor(Math.random() * 4) : null,
          },
          elevation: {
            plotElevation: Math.round(plotElevation),
            wardAverage,
            difference: Math.round(plotElevation - wardAverage),
          },
          drainageProximity: {
            distanceMeters: Math.round(50 + Math.random() * 500),
            drainageType: Math.random() > 0.5 ? 'Primary Canal' : 'Secondary Drain',
          },
        },
        contextualInfo: contextualInfoOptions
          .sort(() => Math.random() - 0.5)
          .slice(0, 2 + Math.floor(Math.random() * 2)),
        coordinates: {
          lat: 27.7172 + (y - 5) * 0.005,
          lng: 85.324 + (x - 5) * 0.005,
        },
        areaName: areaNames[Math.floor(Math.random() * areaNames.length)],
      });
    }
    grid.push(row);
  }
  
  return grid;
};

export const searchResults: SearchResult[] = [
  { id: '1', name: 'Thamel, Ward 26', type: 'ward', coordinates: { lat: 27.7156, lng: 85.3123 } },
  { id: '2', name: 'Durbar Square', type: 'landmark', coordinates: { lat: 27.7044, lng: 85.3076 } },
  { id: '3', name: 'Bouddhanath Stupa', type: 'landmark', coordinates: { lat: 27.7215, lng: 85.3620 } },
  { id: '4', name: 'Baneshwor, Ward 10', type: 'ward', coordinates: { lat: 27.6884, lng: 85.3384 } },
  { id: '5', name: 'Patan Durbar Area', type: 'area', coordinates: { lat: 27.6728, lng: 85.3250 } },
  { id: '6', name: 'Ring Road - Kalanki', type: 'area', coordinates: { lat: 27.6944, lng: 85.2816 } },
  { id: '7', name: 'Bagmati Corridor', type: 'area', coordinates: { lat: 27.6895, lng: 85.3174 } },
  { id: '8', name: 'Bishnumati Area', type: 'area', coordinates: { lat: 27.7089, lng: 85.3056 } },
];

export const layerOptions = [
  { id: 'flood', label: 'Flood Extents', description: 'Historical flood polygons (year-wise)', enabled: true },
  { id: 'drainage', label: 'Drainage Network', description: 'Primary and secondary drainage features', enabled: false },
  { id: 'elevation', label: 'Elevation Shading', description: 'Terrain elevation visualization', enabled: false },
];
