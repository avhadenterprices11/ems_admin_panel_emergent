import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
  tooltipText?: string;
}

export const MetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  colorClass, 
  bgClass,
  tooltipText
}: MetricCardProps) => (
  <div className="bg-white p-5 rounded-2xl shadow-md flex flex-col justify-between min-w-[180px] h-[130px] relative overflow-hidden group hover:shadow-lg transition-all border border-gray-50/50">
    {/* Top Row: Title + Info Tooltip */}
    <div className="flex justify-between items-start">
      <span className="text-[#253154] font-medium text-[15px]">{title}</span>
      <div className="text-gray-300">
        <TooltipProvider>
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px] cursor-help hover:text-[#0e042f] hover:border-[#0e042f] transition-colors">
                i
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-[#0e042f] text-white border-none shadow-xl px-3 py-2 rounded-xl text-xs font-medium z-50">
              <p>{tooltipText || `View detailed ${title} analytics`}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
    
    {/* Bottom Row: Icon + Value */}
    <div className="flex items-end gap-3 mt-2">
      <div className={`w-10 h-10 ${bgClass} rounded-xl flex items-center justify-center shrink-0`}>
        <Icon size={20} className={colorClass} strokeWidth={2} />
      </div>
      <span className="text-[28px] font-bold text-[#253154] leading-none mb-1">{value}</span>
    </div>
    
    {/* Decorative Background Element - Appears on Hover */}
    <div className="absolute -right-6 -bottom-6 opacity-5 pointer-events-none transform rotate-12 group-hover:scale-110 transition-transform duration-500">
      <Icon size={80} className="text-[#253154]" />
    </div>
  </div>
);
