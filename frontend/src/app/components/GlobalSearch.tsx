import React, { useState, useEffect, useRef } from 'react';
import { Search, CornerDownLeft, Calendar, Users, FileText, BarChart2, Settings, Database, Key, Shield, Activity } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Badge } from '../components/ui/badge';
import { cn } from '../components/ui/utils';

interface SearchRecord {
  id: string;
  module: string;
  title: string;
  subtitle?: string;
  status?: string;
  path: string[];
  tags?: string[];
}

// Mock global search data for admin backend
const GLOBAL_INDEX: SearchRecord[] = [
  { id: '1', module: 'Users', title: 'Active Users', subtitle: '1,234 users', status: 'Active', path: ['Users', 'Active'], tags: ['users', 'active', 'members'] },
  { id: '2', module: 'Users', title: 'User Permissions', subtitle: 'Manage access', path: ['Users', 'Permissions'], tags: ['permissions', 'access', 'roles'] },
  { id: '3', module: 'Analytics', title: 'Dashboard Overview', subtitle: 'Key metrics', status: 'Live', path: ['Analytics', 'Dashboard'], tags: ['analytics', 'metrics', 'dashboard'] },
  { id: '4', module: 'Analytics', title: 'User Activity Report', subtitle: 'Last 30 days', path: ['Analytics', 'Reports'], tags: ['reports', 'activity', 'statistics'] },
  { id: '5', module: 'Content', title: 'Blog Posts', subtitle: '45 published', status: 'Active', path: ['Content', 'Blog'], tags: ['blog', 'posts', 'content'] },
  { id: '6', module: 'Content', title: 'Media Library', subtitle: '2,341 files', path: ['Content', 'Media'], tags: ['media', 'images', 'files'] },
  { id: '7', module: 'System', title: 'API Keys', subtitle: '12 active keys', path: ['System', 'API'], tags: ['api', 'keys', 'integration'] },
  { id: '8', module: 'System', title: 'System Logs', subtitle: 'View activity', path: ['System', 'Logs'], tags: ['logs', 'activity', 'audit'] },
  { id: '9', module: 'Security', title: 'Roles & Permissions', subtitle: 'Manage access', path: ['Security', 'Roles'], tags: ['roles', 'permissions', 'security'] },
  { id: '10', module: 'Security', title: 'Authentication Settings', subtitle: 'SSO & 2FA', path: ['Security', 'Auth'], tags: ['auth', 'sso', '2fa', 'security'] },
  { id: '11', module: 'Data', title: 'Database Backups', subtitle: 'Last backup: Today', status: 'Complete', path: ['Data', 'Backups'], tags: ['backup', 'database', 'data'] },
  { id: '12', module: 'Data', title: 'Data Export', subtitle: 'Export user data', path: ['Data', 'Export'], tags: ['export', 'data', 'download'] },
];

const RECENT_SEARCHES: SearchRecord[] = [
  { id: 'r1', module: 'Users', title: 'Active Users', subtitle: '1,234 users', path: ['Users', 'Active'], tags: [] },
  { id: 'r2', module: 'Analytics', title: 'Dashboard Overview', subtitle: 'Key metrics', path: ['Analytics', 'Dashboard'], tags: [] },
];

const MODULE_ICONS: Record<string, React.ReactNode> = {
  Users: <Users size={20} className="text-blue-500" />,
  Analytics: <BarChart2 size={20} className="text-purple-500" />,
  Content: <FileText size={20} className="text-green-500" />,
  System: <Settings size={20} className="text-slate-500" />,
  Security: <Shield size={20} className="text-red-500" />,
  Data: <Database size={20} className="text-orange-500" />,
};

interface GlobalSearchProps {
  onNavigate?: (page: string) => void;
}

export const GlobalSearch = ({ onNavigate }: GlobalSearchProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredResults = query.trim()
    ? GLOBAL_INDEX.filter(item => {
        const searchTerm = query.toLowerCase();
        return (
          item.title.toLowerCase().includes(searchTerm) ||
          item.subtitle?.toLowerCase().includes(searchTerm) ||
          item.module.toLowerCase().includes(searchTerm) ||
          item.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      })
    : [];

  const groupedResults = filteredResults.reduce((acc, item) => {
    if (!acc[item.module]) {
      acc[item.module] = [];
    }
    acc[item.module].push(item);
    return acc;
  }, {} as Record<string, SearchRecord[]>);

  const displayResults = query.trim() ? filteredResults : RECENT_SEARCHES;
  const maxResults = 8;
  const hasMoreResults = filteredResults.length > maxResults;

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 0);
      }

      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setQuery('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Arrow key navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, displayResults.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && displayResults[selectedIndex]) {
        e.preventDefault();
        handleSelect(displayResults[selectedIndex]);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, displayResults]);

  const handleSelect = (result: SearchRecord) => {
    onNavigate?.(result.module.toLowerCase());
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(0);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#90a1b9]" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClick={() => setIsOpen(true)}
            className="w-full h-9 bg-white/10 border border-white/20 rounded-lg pl-9 pr-16 text-white placeholder:text-[#90a1b9] focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
            aria-label="Global search"
            aria-expanded={isOpen}
            aria-controls="search-results"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
            <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/20 rounded text-[10px] text-[#90a1b9]">⌘</kbd>
            <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/20 rounded text-[10px] text-[#90a1b9]">K</kbd>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[600px] max-h-[500px] overflow-y-auto p-2 bg-white border border-slate-200 shadow-xl rounded-xl"
        align="center"
        sideOffset={8}
        id="search-results"
      >
        {!query.trim() && (
          <div className="px-3 py-2 text-xs text-slate-400 uppercase tracking-wider">
            Recent Searches
          </div>
        )}

        {query.trim() && filteredResults.length === 0 && (
          <div className="px-3 py-8 text-center text-slate-400">
            No results found for "{query}"
          </div>
        )}

        {query.trim() && Object.keys(groupedResults).length > 0 && (
          <div className="space-y-4">
            {Object.entries(groupedResults).map(([module, results]) => (
              <div key={module}>
                <div className="px-3 py-2 text-xs text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  {MODULE_ICONS[module]}
                  {module}
                </div>
                <div className="space-y-1">
                  {results.slice(0, maxResults).map((result, idx) => {
                    const globalIndex = displayResults.findIndex(r => r.id === result.id);
                    return (
                      <SearchResultItem
                        key={result.id}
                        result={result}
                        isSelected={globalIndex === selectedIndex}
                        onClick={() => handleSelect(result)}
                        moduleIcon={MODULE_ICONS[result.module]}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
            {hasMoreResults && (
              <div className="px-3 py-2 text-xs text-slate-400 text-center">
                + {filteredResults.length - maxResults} more results
              </div>
            )}
          </div>
        )}

        {!query.trim() && RECENT_SEARCHES.length > 0 && (
          <div className="space-y-1">
            {RECENT_SEARCHES.map((result, idx) => (
              <SearchResultItem
                key={result.id}
                result={result}
                isSelected={idx === selectedIndex}
                onClick={() => handleSelect(result)}
                moduleIcon={MODULE_ICONS[result.module]}
              />
            ))}
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-slate-100 px-3 py-2 text-xs text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px]">↑↓</kbd> Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px]">↵</kbd> Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px]">Esc</kbd> Close
            </span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

interface SearchResultItemProps {
  result: SearchRecord;
  isSelected: boolean;
  onClick: () => void;
  moduleIcon: React.ReactNode;
}

const SearchResultItem = ({ result, isSelected, onClick, moduleIcon }: SearchResultItemProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "py-2.5 px-3 rounded-lg cursor-pointer border transition-all",
        isSelected 
          ? "bg-slate-50 border-slate-100" 
          : "bg-white border-transparent hover:bg-slate-50"
      )}
      aria-selected={isSelected}
      role="option"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0" aria-hidden="true">
            {moduleIcon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-slate-900 truncate">{result.title}</div>
            {result.subtitle && (
              <div className="text-sm text-slate-500 truncate">{result.subtitle}</div>
            )}
          </div>
          {result.status && (
            <Badge variant="secondary" className="text-xs flex-shrink-0">
              {result.status}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="text-xs text-slate-400">
            {result.path.join(' › ')}
          </div>
          {isSelected && (
            <CornerDownLeft size={10} className="text-slate-400" aria-hidden="true" />
          )}
        </div>
      </div>
    </div>
  );
};