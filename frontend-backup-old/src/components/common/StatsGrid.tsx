import React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { Info } from 'lucide-react';

interface Stat {
  label: string;
  value: string;
  color?: string;
  icon?: React.ReactNode;
  tooltip?: string;
}

interface StatsGridProps {
  stats: Stat[];
}

export const StatsGrid = ({ stats }: StatsGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div 
          key={index} 
          className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              {stat.icon && (
                <div className={`p-1.5 rounded-lg ${stat.color ? stat.color.replace('text-', 'bg-').replace('-600', '-50') : 'bg-slate-50'}`}>
                  {stat.icon}
                </div>
              )}
              <span>{stat.label}</span>
            </div>
            {stat.tooltip && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-slate-400 hover:text-slate-600 transition-colors">
                    <Info size={14} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={4}>
                  {stat.tooltip}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <div className={`text-2xl font-bold ${stat.color || 'text-slate-900'}`}>
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
};

StatsGrid.displayName = 'StatsGrid';