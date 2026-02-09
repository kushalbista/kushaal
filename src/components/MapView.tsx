import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Crosshair, Layers, Pentagon, Trash2, Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { DrawnPolygon, isWithinStudyArea } from '@/types/mapTypes';
import { toast } from 'sonner';

const CENTER: [number, number] = [87.157, 26.719];
const INITIAL_ZOOM = 11;

const STUDY_BOUNDS: [[number, number], [number, number], [number, number], [number, number]] = [
  [87.002, 26.634],
  [87.311, 26.634],
  [87.311, 26.804],
  [87.002, 26.804]
];

const TILE_SOURCES = {
  satellite: {
    name: 'Google Satellite',
    url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    attribution: '© Google'
  },
  streets: {
    name: 'Streets',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors'
  }
};

interface MapViewProps {
  onAnalyze: (geometry: DrawnPolygon) => void;
  isAnalyzing: boolean;
  onClearAnalysis: () => void;
  hasAnalysis: boolean;
}

export const MapView = ({ onAnalyze, isAnalyzing, onClearAnalysis, hasAnalysis }: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnPoints, setDrawnPoints] = useState<[number, number][]>([]);
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
        layers: [{
          id: 'raster-layer',
          type: 'raster',
          source: 'raster-tiles',
          minzoom: 0,
          maxzoom: 19
        }]
      },
      center: CENTER,
      zoom: INITIAL_ZOOM,
      maxBounds: [[86.8, 26.5], [87.5, 27.0]]
    });

    map.current.addControl(new maplibregl.ScaleControl(), 'bottom-left');

    map.current.on('load', () => {
      if (!map.current) return;

      // Study area boundary
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
        paint: { 'line-color': '#3b82f6', 'line-width': 2, 'line-dasharray': [4, 2] }
      });

      // Flood data
      map.current.addSource('flood-data', {
        type: 'geojson',
        data: '/sunsari_flood_data.geojson'
      });

      map.current.addLayer({
        id: 'flood-polygons-fill',
        type: 'fill',
        source: 'flood-data',
        paint: { 'fill-color': '#ef4444', 'fill-opacity': 0.5 }
      });

      map.current.addLayer({
        id: 'flood-polygons-outline',
        type: 'line',
        source: 'flood-data',
        paint: { 'line-color': '#dc2626', 'line-width': 1 }
      });

      // Drawing sources
      map.current.addSource('draw-polygon', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      map.current.addLayer({
        id: 'draw-polygon-fill',
        type: 'fill',
        source: 'draw-polygon',
        paint: { 'fill-color': '#facc15', 'fill-opacity': 0.25 }
      });

      map.current.addLayer({
        id: 'draw-polygon-outline',
        type: 'line',
        source: 'draw-polygon',
        paint: { 'line-color': '#facc15', 'line-width': 2.5 }
      });

      map.current.addSource('draw-points', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      map.current.addLayer({
        id: 'draw-points-layer',
        type: 'circle',
        source: 'draw-points',
        paint: {
          'circle-radius': 5,
          'circle-color': '#facc15',
          'circle-stroke-color': '#000',
          'circle-stroke-width': 1.5
        }
      });

      setMapLoaded(true);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update drawing layers when points change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const pointsSource = map.current.getSource('draw-points') as maplibregl.GeoJSONSource;
    const polySource = map.current.getSource('draw-polygon') as maplibregl.GeoJSONSource;
    if (!pointsSource || !polySource) return;

    // Update points
    pointsSource.setData({
      type: 'FeatureCollection',
      features: drawnPoints.map(p => ({
        type: 'Feature' as const,
        properties: {},
        geometry: { type: 'Point' as const, coordinates: p }
      }))
    });

    // Update polygon (need at least 3 points)
    if (drawnPoints.length >= 3) {
      polySource.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [[...drawnPoints, drawnPoints[0]]]
        }
      });
    } else if (drawnPoints.length >= 2) {
      // Show a line for 2 points
      polySource.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: drawnPoints
        }
      });
    } else {
      polySource.setData({ type: 'FeatureCollection', features: [] });
    }
  }, [drawnPoints, mapLoaded]);

  // Map click handler for drawing
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const handleClick = (e: maplibregl.MapMouseEvent) => {
      if (!isDrawing) return;
      const point: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      setDrawnPoints(prev => [...prev, point]);
    };

    const handleDblClick = (e: maplibregl.MapMouseEvent) => {
      if (!isDrawing) return;
      e.preventDefault();
      // Complete the polygon
      setIsDrawing(false);
    };

    map.current.on('click', handleClick);
    map.current.on('dblclick', handleDblClick);

    // Change cursor
    if (isDrawing) {
      map.current.getCanvas().style.cursor = 'crosshair';
      map.current.doubleClickZoom.disable();
    } else {
      map.current.getCanvas().style.cursor = '';
      map.current.doubleClickZoom.enable();
    }

    return () => {
      map.current?.off('click', handleClick);
      map.current?.off('dblclick', handleDblClick);
    };
  }, [isDrawing, mapLoaded]);

  const switchBaseLayer = useCallback((layer: 'satellite' | 'streets') => {
    if (!map.current) return;
    const source = map.current.getSource('raster-tiles') as maplibregl.RasterTileSource;
    if (source) source.setTiles([TILE_SOURCES[layer].url]);
    setActiveBaseLayer(layer);
    setShowLayerMenu(false);
  }, []);

  const startDrawing = () => {
    setDrawnPoints([]);
    setIsDrawing(true);
    onClearAnalysis();
  };

  const clearDrawing = () => {
    setDrawnPoints([]);
    setIsDrawing(false);
    onClearAnalysis();
    // Clear map layers
    if (map.current && mapLoaded) {
      const pointsSource = map.current.getSource('draw-points') as maplibregl.GeoJSONSource;
      const polySource = map.current.getSource('draw-polygon') as maplibregl.GeoJSONSource;
      pointsSource?.setData({ type: 'FeatureCollection', features: [] });
      polySource?.setData({ type: 'FeatureCollection', features: [] });
    }
  };

  const handleAnalyze = () => {
    if (drawnPoints.length < 3) {
      toast.error('Draw at least 3 points to create a polygon.');
      return;
    }

    // Check bounds
    if (!isWithinStudyArea(drawnPoints)) {
      toast.error('Please draw a plot within the Sunsari study area.');
      return;
    }

    const geometry: DrawnPolygon = {
      type: 'Polygon',
      coordinates: [[...drawnPoints, drawnPoints[0]]]
    };

    onAnalyze(geometry);
  };

  const hasPolygon = drawnPoints.length >= 3 && !isDrawing;

  return (
    <div className="w-full h-full relative overflow-hidden bg-muted">
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Toolbar */}
      <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10 flex items-center gap-1.5 p-1.5 bg-card/95 backdrop-blur-sm rounded-lg shadow-lg border border-border">
        <Button
          variant={isDrawing ? 'default' : 'ghost'}
          size="icon"
          onClick={startDrawing}
          className="h-8 w-8 md:h-9 md:w-9"
          aria-label="Draw Plot"
          disabled={isAnalyzing}
        >
          <Pentagon className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={clearDrawing}
          disabled={drawnPoints.length === 0 && !hasAnalysis}
          className="h-8 w-8 md:h-9 md:w-9 text-destructive hover:text-destructive"
          aria-label="Clear"
        >
          <Trash2 className="w-4 h-4" />
        </Button>

        {hasPolygon && (
          <>
            <div className="w-px h-6 bg-border mx-0.5" />
            <Button
              size="sm"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="h-8 md:h-9 gap-1.5 px-3"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Processing GEE Data...</span>
                </>
              ) : (
                <span>Analyze</span>
              )}
            </Button>
          </>
        )}
      </div>

      {/* Location Label */}
      <div className="absolute top-2 right-2 md:top-4 md:right-4 z-10">
        <div className="glass-strong rounded-lg px-3 py-2 md:px-4 md:py-2.5 shadow-lg">
          <p className="text-xs md:text-sm font-semibold text-foreground">Sunsari, Nepal</p>
          <p className="text-[10px] md:text-xs text-muted-foreground">26.7190°N, 87.1570°E</p>
        </div>
      </div>

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
              {Object.entries(TILE_SOURCES).map(([key, src]) => (
                <button
                  key={key}
                  onClick={() => switchBaseLayer(key as 'satellite' | 'streets')}
                  className={`w-full text-left px-3 py-1.5 rounded text-xs ${
                    activeBaseLayer === key ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                  }`}
                >
                  {src.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-20 md:bottom-4 right-2 md:right-4 z-10 flex flex-col gap-1">
        <Button variant="secondary" size="icon" onClick={() => map.current?.zoomIn()} className="h-8 w-8 md:h-9 md:w-9 glass-strong shadow-lg" aria-label="Zoom in">
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button variant="secondary" size="icon" onClick={() => map.current?.zoomOut()} className="h-8 w-8 md:h-9 md:w-9 glass-strong shadow-lg" aria-label="Zoom out">
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button variant="secondary" size="icon" onClick={() => map.current?.flyTo({ center: CENTER, zoom: INITIAL_ZOOM })} className="h-8 w-8 md:h-9 md:w-9 glass-strong shadow-lg" aria-label="Reset view">
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
      {mapLoaded && !isDrawing && drawnPoints.length === 0 && !hasAnalysis && (
        <div className="absolute bottom-20 md:bottom-16 left-1/2 -translate-x-1/2 glass-strong rounded-lg px-4 py-2 shadow-lg z-10">
          <p className="text-xs text-foreground">
            ✏️ Click "Draw Plot" then click on the map to draw a polygon
          </p>
        </div>
      )}

      {isDrawing && (
        <div className="absolute bottom-20 md:bottom-16 left-1/2 -translate-x-1/2 glass-strong rounded-lg px-4 py-2 shadow-lg z-10">
          <p className="text-xs text-foreground">
            👆 Click to add points ({drawnPoints.length} placed) • Double-click to finish
          </p>
        </div>
      )}
    </div>
  );
};
