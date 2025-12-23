import { Layers, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { layerOptions } from '@/data/mockData';
import { cn } from '@/lib/utils';

export const LayerControls = () => {
  const [layers, setLayers] = useState(layerOptions);
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleLayer = (id: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === id ? { ...layer, enabled: !layer.enabled } : layer
    ));
  };

  return (
    <div className="absolute top-4 right-4 z-20">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="glass rounded-xl p-3 shadow-card hover:shadow-card-hover transition-all"
      >
        <Layers className="w-5 h-5 text-foreground" />
      </button>

      {isExpanded && (
        <div className="absolute top-14 right-0 w-64 glass rounded-xl shadow-card-hover p-4 animate-scale-in">
          <h3 className="text-sm font-semibold text-foreground mb-3">Map Layers</h3>
          <div className="space-y-2">
            {layers.map((layer) => (
              <button
                key={layer.id}
                onClick={() => toggleLayer(layer.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-2.5 rounded-lg transition-all text-left",
                  layer.enabled 
                    ? "bg-primary/10 border border-primary/20" 
                    : "hover:bg-muted/50"
                )}
              >
                {layer.enabled ? (
                  <Eye className="w-4 h-4 text-primary shrink-0" />
                ) : (
                  <EyeOff className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
                <div>
                  <p className={cn(
                    "text-sm font-medium",
                    layer.enabled ? "text-foreground" : "text-muted-foreground"
                  )}>{layer.label}</p>
                  <p className="text-xs text-muted-foreground">{layer.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
