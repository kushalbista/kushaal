import { Lightbulb, Shield } from 'lucide-react';

interface ContextSectionProps {
  items: string[];
}

export const ContextSection = ({ items }: ContextSectionProps) => {
  return (
    <div className="bg-card rounded-xl p-4 shadow-card border border-border/50">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-4 h-4 text-accent" />
        <h3 className="text-sm font-medium text-foreground">Local Context</h3>
      </div>
      
      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-start gap-2 p-2.5 rounded-lg bg-secondary/50 border border-border/30"
          >
            <Shield className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">{item}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mt-3 italic">
        Informational only. Mitigation feasibility depends on design and cost.
      </p>
    </div>
  );
};
