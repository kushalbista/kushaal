import { useState } from 'react';
import { 
  Pentagon, 
  Square, 
  Edit3, 
  Undo2, 
  Trash2, 
  Check,
  MousePointer2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export type DrawingTool = 'select' | 'polygon' | 'rectangle' | 'edit';

interface MapToolbarProps {
  activeTool: DrawingTool;
  onToolChange: (tool: DrawingTool) => void;
  onUndo: () => void;
  onClear: () => void;
  onConfirm: () => void;
  hasDrawing: boolean;
  canUndo: boolean;
}

export const MapToolbar = ({
  activeTool,
  onToolChange,
  onUndo,
  onClear,
  onConfirm,
  hasDrawing,
  canUndo
}: MapToolbarProps) => {
  const isMobile = useIsMobile();

  const tools = [
    { id: 'select' as DrawingTool, icon: MousePointer2, label: 'Select', description: 'Click to select plots' },
    { id: 'polygon' as DrawingTool, icon: Pentagon, label: 'Polygon', description: 'Draw custom shape' },
    { id: 'rectangle' as DrawingTool, icon: Square, label: 'Rectangle', description: 'Draw rectangle' },
    { id: 'edit' as DrawingTool, icon: Edit3, label: 'Edit', description: 'Edit existing shape' },
  ];

  const ToolButton = ({ tool }: { tool: typeof tools[0] }) => {
    const Icon = tool.icon;
    const isActive = activeTool === tool.id;

    const button = (
      <Button
        variant={isActive ? "default" : "ghost"}
        size="icon"
        onClick={() => onToolChange(tool.id)}
        className={cn(
          "h-8 w-8 md:h-9 md:w-9",
          isActive && "shadow-sm"
        )}
        aria-label={tool.label}
        aria-pressed={isActive}
      >
        <Icon className="w-4 h-4" />
      </Button>
    );

    if (isMobile) return button;

    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs font-medium">{tool.label}</p>
          <p className="text-xs text-muted-foreground">{tool.description}</p>
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <div className="flex items-center gap-1 p-1.5 bg-card/95 backdrop-blur-sm rounded-lg shadow-lg border border-border">
      {/* Drawing Tools */}
      <div className="flex items-center gap-0.5">
        {tools.map((tool) => (
          <ToolButton key={tool.id} tool={tool} />
        ))}
      </div>

      {/* Separator */}
      <div className="w-px h-6 bg-border mx-1" />

      {/* Action Buttons */}
      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={onUndo}
          disabled={!canUndo}
          className="h-8 w-8 md:h-9 md:w-9"
          aria-label="Undo"
        >
          <Undo2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClear}
          disabled={!hasDrawing}
          className="h-8 w-8 md:h-9 md:w-9 text-destructive hover:text-destructive"
          aria-label="Clear"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Confirm Button */}
      {hasDrawing && (
        <>
          <div className="w-px h-6 bg-border mx-1" />
          <Button
            size="sm"
            onClick={onConfirm}
            className="h-8 md:h-9 gap-1.5 px-3"
          >
            <Check className="w-4 h-4" />
            <span className="hidden sm:inline">Analyze</span>
          </Button>
        </>
      )}
    </div>
  );
};