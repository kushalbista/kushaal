import { Search, MapPin, Info } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { searchResults, SearchResult } from '@/data/mockData';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface TopBarProps {
  onSearch: (result: SearchResult) => void;
}

export const TopBar = ({ onSearch }: TopBarProps) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.length > 0) {
      const filtered = searchResults.filter(r => 
        r.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredResults(filtered);
      setIsOpen(true);
    } else {
      setFilteredResults([]);
      setIsOpen(false);
    }
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    setQuery(result.name);
    setIsOpen(false);
    onSearch(result);
  };

  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'ward': return '🏛️';
      case 'landmark': return '📍';
      case 'area': return '🗺️';
    }
  };

  return (
    <header className="h-14 sm:h-16 glass-strong border-b border-border/50 px-3 sm:px-4 lg:px-6 flex items-center justify-between z-50 relative">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary flex items-center justify-center shadow-card">
          <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-sm sm:text-lg font-semibold text-foreground tracking-tight">Bhumi Drishti</h1>
          <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Land Exposure Context</p>
        </div>
      </div>

      <div className="flex-1 max-w-md lg:max-w-xl mx-2 sm:mx-4 lg:mx-8 relative">
        <div className="relative">
          <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query && setIsOpen(true)}
            placeholder="Search area..."
            className="w-full h-8 sm:h-10 pl-8 sm:pl-10 pr-8 sm:pr-10 rounded-lg sm:rounded-xl bg-muted/50 border border-border/50 text-xs sm:text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 hidden sm:block">
                <Info className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <p className="text-xs">Search results are approximate. Boundaries may not reflect official land records.</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {isOpen && filteredResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-xl shadow-card-hover border border-border overflow-hidden animate-scale-in z-50">
            {filteredResults.map((result) => (
              <button
                key={result.id}
                onClick={() => handleSelect(result)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3 hover:bg-muted/50 transition-colors text-left"
              >
                <span className="text-base sm:text-lg">{getTypeIcon(result.type)}</span>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-foreground">{result.name}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground capitalize">{result.type}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
        <span className="px-2 py-1 rounded-md bg-secondary">Beta</span>
      </div>
    </header>
  );
};
