import { useState, useRef, useEffect, useCallback } from 'react';
import { DrawingTool } from './MapToolbar';
import { PlotData } from '@/data/mockData';

interface Point {
  x: number;
  y: number;
}

interface DrawingCanvasProps {
  activeTool: DrawingTool;
  onDrawingComplete: (points: Point[]) => void;
  onDrawingUpdate: (points: Point[]) => void;
  isDrawing: boolean;
  setIsDrawing: (drawing: boolean) => void;
  gridBounds: { rows: number; cols: number };
}

export const DrawingCanvas = ({
  activeTool,
  onDrawingComplete,
  onDrawingUpdate,
  isDrawing,
  setIsDrawing,
  gridBounds
}: DrawingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null);

  const getMousePos = useCallback((e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;
    
    if ('touches' in e) {
      clientX = e.touches[0]?.clientX ?? e.changedTouches[0]?.clientX ?? 0;
      clientY = e.touches[0]?.clientY ?? e.changedTouches[0]?.clientY ?? 0;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100
    };
  }, []);

  const drawShape = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set drawing style
    ctx.strokeStyle = 'hsl(215, 70%, 55%)';
    ctx.lineWidth = 2;
    ctx.fillStyle = 'hsla(215, 70%, 55%, 0.15)';
    ctx.setLineDash([5, 5]);

    if (activeTool === 'rectangle' && startPoint && currentPoint) {
      const x1 = (startPoint.x / 100) * canvas.width;
      const y1 = (startPoint.y / 100) * canvas.height;
      const x2 = (currentPoint.x / 100) * canvas.width;
      const y2 = (currentPoint.y / 100) * canvas.height;
      
      ctx.beginPath();
      ctx.rect(x1, y1, x2 - x1, y2 - y1);
      ctx.fill();
      ctx.stroke();
    } else if (activeTool === 'polygon' && points.length > 0) {
      ctx.beginPath();
      const firstPoint = points[0];
      ctx.moveTo((firstPoint.x / 100) * canvas.width, (firstPoint.y / 100) * canvas.height);
      
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo((points[i].x / 100) * canvas.width, (points[i].y / 100) * canvas.height);
      }
      
      if (currentPoint) {
        ctx.lineTo((currentPoint.x / 100) * canvas.width, (currentPoint.y / 100) * canvas.height);
      }
      
      if (points.length > 2) {
        ctx.closePath();
        ctx.fill();
      }
      ctx.stroke();

      // Draw vertices
      ctx.setLineDash([]);
      ctx.fillStyle = 'hsl(215, 70%, 55%)';
      points.forEach(point => {
        ctx.beginPath();
        ctx.arc((point.x / 100) * canvas.width, (point.y / 100) * canvas.height, 5, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }, [activeTool, points, startPoint, currentPoint]);

  useEffect(() => {
    drawShape();
  }, [drawShape]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeCanvas = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      drawShape();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [drawShape]);

  // Reset when tool changes
  useEffect(() => {
    setPoints([]);
    setStartPoint(null);
    setCurrentPoint(null);
    setIsDrawing(false);
  }, [activeTool, setIsDrawing]);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (activeTool === 'select' || activeTool === 'edit') return;
    
    const pos = getMousePos(e);
    
    if (activeTool === 'rectangle') {
      setStartPoint(pos);
      setIsDrawing(true);
    } else if (activeTool === 'polygon') {
      if (!isDrawing) {
        setPoints([pos]);
        setIsDrawing(true);
      } else {
        // Check if clicking near first point to close polygon
        if (points.length >= 3) {
          const firstPoint = points[0];
          const distance = Math.sqrt(
            Math.pow(pos.x - firstPoint.x, 2) + Math.pow(pos.y - firstPoint.y, 2)
          );
          if (distance < 3) {
            // Close polygon
            onDrawingComplete(points);
            setIsDrawing(false);
            return;
          }
        }
        setPoints([...points, pos]);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (activeTool === 'select' || activeTool === 'edit') return;
    if (!isDrawing && activeTool === 'rectangle') return;
    
    const pos = getMousePos(e);
    setCurrentPoint(pos);
    
    if (activeTool === 'rectangle' && startPoint) {
      onDrawingUpdate([
        startPoint,
        { x: pos.x, y: startPoint.y },
        pos,
        { x: startPoint.x, y: pos.y }
      ]);
    } else if (activeTool === 'polygon' && isDrawing) {
      onDrawingUpdate([...points, pos]);
    }
  };

  const handleMouseUp = (e: React.MouseEvent | React.TouchEvent) => {
    if (activeTool === 'rectangle' && startPoint) {
      const pos = getMousePos(e);
      const rectPoints: Point[] = [
        startPoint,
        { x: pos.x, y: startPoint.y },
        pos,
        { x: startPoint.x, y: pos.y }
      ];
      onDrawingComplete(rectPoints);
      setIsDrawing(false);
      setStartPoint(null);
    }
  };

  const handleDoubleClick = () => {
    if (activeTool === 'polygon' && points.length >= 3) {
      onDrawingComplete(points);
      setIsDrawing(false);
      setPoints([]);
    }
  };

  if (activeTool === 'select' || activeTool === 'edit') {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 z-10"
      style={{ cursor: activeTool === 'polygon' ? 'crosshair' : activeTool === 'rectangle' ? 'crosshair' : 'default' }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      />
    </div>
  );
};
