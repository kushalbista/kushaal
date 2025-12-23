import { AlertCircle } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="glass-strong border-t border-border/50 px-4 lg:px-6 py-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
        <p>
          All data is historical and approximate. Bhumi Drishti does not determine land value, suitability, or legal status.
        </p>
      </div>
    </footer>
  );
};
