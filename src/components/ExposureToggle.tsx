import { cn } from '@/lib/utils';

type RiskLevel = 'all' | 'low' | 'moderate' | 'elevated';

interface ExposureToggleProps {
  selectedLevel: RiskLevel;
  onLevelChange: (level: RiskLevel) => void;
}

export const ExposureToggle = ({ selectedLevel, onLevelChange }: ExposureToggleProps) => {
  const levels: { id: RiskLevel; label: string; color: string; activeColor: string }[] = [
    { 
      id: 'all', 
      label: 'All', 
      color: 'text-muted-foreground hover:text-foreground',
      activeColor: 'bg-secondary text-foreground'
    },
    { 
      id: 'low', 
      label: 'Low', 
      color: 'text-muted-foreground hover:text-[hsl(var(--risk-low))]',
      activeColor: 'bg-[hsl(var(--risk-low-bg))] text-[hsl(var(--risk-low))] border-[hsl(var(--risk-low))]/30'
    },
    { 
      id: 'moderate', 
      label: 'Moderate', 
      color: 'text-muted-foreground hover:text-[hsl(var(--risk-moderate))]',
      activeColor: 'bg-[hsl(var(--risk-moderate-bg))] text-[hsl(var(--risk-moderate))] border-[hsl(var(--risk-moderate))]/30'
    },
    { 
      id: 'elevated', 
      label: 'Elevated', 
      color: 'text-muted-foreground hover:text-[hsl(var(--risk-elevated))]',
      activeColor: 'bg-[hsl(var(--risk-elevated-bg))] text-[hsl(var(--risk-elevated))] border-[hsl(var(--risk-elevated))]/30'
    },
  ];

  return (
    <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-lg">
      {levels.map((level) => (
        <button
          key={level.id}
          onClick={() => onLevelChange(level.id)}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-md transition-all border border-transparent",
            selectedLevel === level.id
              ? level.activeColor
              : level.color
          )}
          aria-pressed={selectedLevel === level.id}
        >
          {level.label}
        </button>
      ))}
    </div>
  );
};