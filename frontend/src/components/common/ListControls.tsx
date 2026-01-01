import React from 'react';
import { Input } from '../ui/input';
import { Search } from 'lucide-react';

interface ListControlsProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  scopeSelector?: React.ReactNode;
  filterControl?: React.ReactNode;
  sortControl?: React.ReactNode;
  columnsControl?: React.ReactNode;
  moreControl?: React.ReactNode;
}

export const ListControls = ({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search...",
  scopeSelector,
  filterControl,
  sortControl,
  columnsControl,
  moreControl
}: ListControlsProps) => {
  return (
    <div className="flex flex-col gap-3">
      {/* Scope selector (badges) row - if provided */}
      {scopeSelector && (
        <div className="shrink-0">
          {scopeSelector}
        </div>
      )}
      
      {/* Single row: Search + Filter + Sort + Columns + More */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-[38px] bg-white border-slate-200 text-slate-700"
          />
        </div>
        {filterControl}
        {sortControl}
        {columnsControl}
        {moreControl && (
          <div className="ml-auto">
            {moreControl}
          </div>
        )}
      </div>
    </div>
  );
};

ListControls.displayName = 'ListControls';