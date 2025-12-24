import { Search, MapPin, User, Settings, Plus, Menu, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { searchResults, SearchResult } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface TopBarProps {
  onSearch: (result: SearchResult) => void;
  onAnalyzeNew?: () => void;
}

export const TopBar = ({ onSearch, onAnalyzeNew }: TopBarProps) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

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
    <header className="h-14 md:h-16 bg-card border-b border-border px-3 md:px-6 flex items-center justify-between z-50 relative shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary flex items-center justify-center shadow-sm">
          <MapPin className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
        </div>
        <div className="hidden sm:block">
          <h1 className="text-base md:text-lg font-bold text-foreground tracking-tight">Bhumi Drishti</h1>
          <p className="text-[10px] md:text-xs text-muted-foreground -mt-0.5">भूमि दृष्टि</p>
        </div>
        <h1 className="sm:hidden text-sm font-bold text-foreground">Bhumi Drishti</h1>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-md lg:max-w-xl mx-3 md:mx-6 relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query && setIsOpen(true)}
            placeholder={isMobile ? "Search..." : "Search area: Gongabu, Kathmandu"}
            className="w-full h-9 md:h-10 pl-9 md:pl-10 pr-4 rounded-lg bg-secondary/50 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
            aria-label="Search for a location"
          />
        </div>

        {isOpen && filteredResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-lg shadow-lg border border-border overflow-hidden animate-scale-in z-50">
            {filteredResults.map((result) => (
              <button
                key={result.id}
                onClick={() => handleSelect(result)}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-secondary/50 transition-colors text-left"
              >
                <span className="text-base">{getTypeIcon(result.type)}</span>
                <div>
                  <p className="text-sm font-medium text-foreground">{result.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{result.type}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Actions */}
      <div className="hidden md:flex items-center gap-2">
        <Button 
          onClick={onAnalyzeNew}
          size="sm" 
          className="gap-1.5 h-9"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden lg:inline">Analyze New Plot</span>
          <span className="lg:hidden">New</span>
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Settings">
          <Settings className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Profile">
          <User className="w-4 h-4" />
        </Button>
      </div>

      {/* Mobile Menu Button */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="md:hidden h-9 w-9"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Menu"
      >
        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-card border-b border-border shadow-lg p-4 md:hidden animate-slide-up z-50">
          <div className="flex flex-col gap-2">
            <Button 
              onClick={() => {
                onAnalyzeNew?.();
                setMobileMenuOpen(false);
              }}
              className="w-full justify-start gap-2"
            >
              <Plus className="w-4 h-4" />
              Analyze New Plot
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <User className="w-4 h-4" />
              Profile
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};