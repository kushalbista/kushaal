import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { PlotData } from '@/data/mockData';
import { MapToolbar, DrawingTool } from './MapToolbar';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Crosshair, Layers } from 'lucide-react';
import { PolygonRiskCard } from '@/components/UI/PolygonRiskCard';
import { useIsMobile } from '@/hooks/use-mobile';

// Sunsari study area bounds
const STUDY_BOUNDS: [[number, number], [number, number], [number, number], [number, number]] = [
  [87.002, 26.634],
  [87.311, 26.634],
  [87.311, 26.804],
  [87.002, 26.804]
];

const CENTER: [number, number] = [87.157, 26.719];
const INITIAL_ZOOM = 11;

// Free tile providers
const TILE_SOURCES = {
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles © Esri'
  },
  streets: {
    name: 'Streets',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors'
  }
};

interface ClickedFeature {
  isInFloodZone: boolean;
  properties: Record<string, unknown>;
  areaM2: number;
  coordinates: [number, number];
}

interface MapViewProps {
  selectedPlot: PlotData | null;
  selectedPlots: PlotData[];
  onSelectPlot: (plot: PlotData | null) => void;
  onSelectMultiplePlots: (plots: PlotData[]) => void;
  onFeatureClick: (feature: ClickedFeature | null) => void;
}

// Calculate polygon area using Shoelace formula (returns m²)
function calculatePolygonArea(coordinates: number[][][]): number {
  const ring = coordinates[0];
  let area = 0;
  
  for (let i = 0; i < ring.length - 1; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[i + 1];
    area += x1 * y2 - x2 * y1;
  }
  
  area = Math.abs(area) / 2;
  
  // Convert from degrees² to m² (approximate at this latitude)
  // 1 degree ≈ 111,320m at equator, adjusted for latitude
  const latRadians = (26.719 * Math.PI) / 180;
  const metersPerDegreeLat = 111320;
  const metersPerDegreeLng = 111320 * Math.cos(latRadians);
  
  return area * metersPerDegreeLat * metersPerDegreeLng;
}

export const MapView = ({
  selectedPlots,
  onSelectMultiplePlots,
  onFeatureClick
}: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeTool, setActiveTool] = useState<DrawingTool>('select');
  const [activeBaseLayer, setActiveBaseLayer] = useState<'satellite' | 'streets'>('satellite');
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const isMobile = useIsMobile();

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'raster-tiles': {
            type: 'raster',
            tiles: [TILE_SOURCES.satellite.url],
            tileSize: 256,
            attribution: TILE_SOURCES.satellite.attribution
          }
        },
        layers: [
          {
            id: 'raster-layer',
            type: 'raster',
            source: 'raster-tiles',
            minzoom: 0,
            maxzoom: 19
          }
        ]
      },
      center: CENTER,
      zoom: INITIAL_ZOOM,
      maxBounds: [
        [86.8, 26.5],
        [87.5, 27.0]
      ]
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'bottom-right');
    map.current.addControl(new maplibregl.ScaleControl(), 'bottom-left');

    map.current.on('load', () => {
      if (!map.current) return;

      // Add study area boundary
      map.current.addSource('study-boundary', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [[...STUDY_BOUNDS, STUDY_BOUNDS[0]]]
          }
        }
      });

      map.current.addLayer({
        id: 'study-boundary-line',
        type: 'line',
        source: 'study-boundary',
        paint: {
          'line-color': '#3b82f6',
          'line-width': 2,
          'line-dasharray': [4, 2]
        }
      });

      // Load flood data GeoJSON
      map.current.addSource('flood-data', {
        type: 'geojson',
        data: '/sunsari_flood_data.geojson'
      });

      map.current.addLayer({
        id: 'flood-polygons-fill',
        type: 'fill',
        source: 'flood-data',
        paint: {
          'fill-color': '#ef4444',
          'fill-opacity': 0.5
        }
      });

      map.current.addLayer({
        id: 'flood-polygons-outline',
        type: 'line',
        source: 'flood-data',
        paint: {
          'line-color': '#dc2626',
          'line-width': 1
        }
      });

      setMapLoaded(true);
    });

    // Click handler specifically for flood layer - High Risk
    map.current.on('click', 'flood-polygons-fill', (e) => {
      if (!map.current || !e.features || e.features.length === 0) return;
      
      const feature = e.features[0];
      const properties = feature.properties || {};
      
      // Use total_impact_ha from GeoJSON if available, otherwise calculate
      let areaM2 = 0;
      if (properties.total_impact_ha) {
        areaM2 = Number(properties.total_impact_ha) * 10000; // Convert ha to m²
      } else {
        const geometry = feature.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon;
        if (geometry.type === 'Polygon') {
          areaM2 = calculatePolygonArea(geometry.coordinates);
        } else if (geometry.type === 'MultiPolygon') {
          areaM2 = geometry.coordinates.reduce((total, poly) => {
            return total + calculatePolygonArea(poly);
          }, 0);
        }
      }

      onFeatureClick({
        isInFloodZone: true,
        properties,
        areaM2,
        coordinates: [e.lngLat.lng, e.lngLat.lat]
      });
    });

    // Click handler for areas outside flood polygons - Safe Zone
    map.current.on('click', (e) => {
      if (!map.current) return;

      const features = map.current.queryRenderedFeatures(e.point, {
        layers: ['flood-polygons-fill']
      });

      // Only trigger if NOT clicking on a flood polygon
      if (features.length === 0) {
        const lng = e.lngLat.lng;
        const lat = e.lngLat.lat;
        const inStudyArea = lng >= 87.002 && lng <= 87.311 && lat >= 26.634 && lat <= 26.804;

        if (inStudyArea) {
          onFeatureClick({
            isInFloodZone: false,
            properties: {},
            areaM2: 0,
            coordinates: [lng, lat]
          });
        } else {
          onFeatureClick(null);
        }
      }
    });

    // Change cursor on hover
    map.current.on('mouseenter', 'flood-polygons-fill', () => {
      if (map.current) map.current.getCanvas().style.cursor = 'pointer';
    });

    map.current.on('mouseleave', 'flood-polygons-fill', () => {
      if (map.current) map.current.getCanvas().style.cursor = '';
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [onFeatureClick]);

  // Switch base layer
  const switchBaseLayer = useCallback((layer: 'satellite' | 'streets') => {
    if (!map.current) return;
    
    const source = map.current.getSource('raster-tiles') as maplibregl.RasterTileSource;
    if (source) {
      source.setTiles([TILE_SOURCES[layer].url]);
    }
    setActiveBaseLayer(layer);
    setShowLayerMenu(false);
  }, []);

  const handleZoomIn = () => map.current?.zoomIn();
  const handleZoomOut = () => map.current?.zoomOut();
  const handleResetView = () => {
    map.current?.flyTo({ center: CENTER, zoom: INITIAL_ZOOM });
  };

  const handleToolChange = (tool: DrawingTool) => {
    setActiveTool(tool);
  };

  const handleClear = () => {
    onSelectMultiplePlots([]);
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-muted">
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Map Toolbar */}
      <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10">
        <MapToolbar
          activeTool={activeTool}
          onToolChange={handleToolChange}
          onUndo={() => {}}
          onClear={handleClear}
          onConfirm={() => {}}
          hasDrawing={selectedPlots.length > 0}
          canUndo={false}
        />
      </div>

      {/* Location Label */}
      <div className="absolute top-2 right-2 md:top-4 md:right-4 z-10">
        <div className="glass-strong rounded-lg px-3 py-2 md:px-4 md:py-2.5 shadow-lg">
          <p className="text-xs md:text-sm font-semibold text-foreground">Sunsari, Nepal</p>
          <p className="text-[10px] md:text-xs text-muted-foreground">26.7190°N, 87.1570°E</p>
        </div>
      </div>

      {/* Polygon Risk Card */}
      {selectedPlots.length > 0 && !isMobile && (
        <PolygonRiskCard 
          selectedPlots={selectedPlots}
          className="absolute top-20 left-2 md:top-24 md:left-4 z-10 max-w-xs"
        />
      )}

      {/* Layer Switcher */}
      <div className="absolute top-20 right-2 md:top-20 md:right-4 z-10">
        <div className="relative">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className="h-8 w-8 md:h-9 md:w-9 glass-strong shadow-lg"
            aria-label="Switch layers"
          >
            <Layers className="w-4 h-4" />
          </Button>
          
          {showLayerMenu && (
            <div className="absolute right-0 mt-1 glass-strong rounded-lg shadow-lg p-2 min-w-[120px]">
              <button
                onClick={() => switchBaseLayer('satellite')}
                className={`w-full text-left px-3 py-1.5 rounded text-xs ${
                  activeBaseLayer === 'satellite' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                }`}
              >
                Satellite
              </button>
              <button
                onClick={() => switchBaseLayer('streets')}
                className={`w-full text-left px-3 py-1.5 rounded text-xs ${
                  activeBaseLayer === 'streets' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                }`}
              >
                Streets
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-20 md:bottom-4 right-2 md:right-4 z-10 flex flex-col gap-1">
        <Button
          variant="secondary"
          size="icon"
          onClick={handleZoomIn}
          className="h-8 w-8 md:h-9 md:w-9 glass-strong shadow-lg"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={handleZoomOut}
          className="h-8 w-8 md:h-9 md:w-9 glass-strong shadow-lg"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={handleResetView}
          className="h-8 w-8 md:h-9 md:w-9 glass-strong shadow-lg"
          aria-label="Reset view"
        >
          <Crosshair className="w-4 h-4" />
        </Button>
      </div>

      {/* Loading indicator */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}

      {/* Instructions */}
      {mapLoaded && activeTool === 'select' && (
        <div className="absolute bottom-20 md:bottom-16 left-1/2 -translate-x-1/2 glass-strong rounded-lg px-4 py-2 shadow-lg z-10">
          <p className="text-xs text-foreground">
            👆 Click on the map to check flood risk status
          </p>
        </div>
      )}
    </div>
  );
};
