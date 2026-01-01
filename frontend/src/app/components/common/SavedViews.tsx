import React from 'react';
import { Badge } from '../ui/badge';

export interface View {
  id: string;
  label: string;
  type: 'system' | 'custom';
}

interface SavedViewsProps {
  views: View[];
  activeViewId: string;
  onViewChange: (viewId: string) => void;
}

export const SavedViews = ({ views, activeViewId, onViewChange }: SavedViewsProps) => {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {views.map(view => (
        <Badge
          key={view.id}
          variant="outline"
          onClick={() => onViewChange(view.id)}
          className={`cursor-pointer transition-colors border-0 px-3 py-1.5 text-sm font-medium ${
            activeViewId === view.id
              ? 'bg-black text-white hover:bg-black/90'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {view.label}
        </Badge>
      ))}
    </div>
  );
};

SavedViews.displayName = 'SavedViews';
