import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface FormCardProps {
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
}

export function FormCard({ 
  title, 
  children, 
  collapsible = false, 
  defaultExpanded = true,
  onToggle 
}: FormCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    onToggle?.(newState);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div 
        className={`px-6 py-4 border-b border-slate-100 ${collapsible ? 'cursor-pointer hover:bg-slate-50 transition-colors' : ''}`}
        onClick={collapsible ? handleToggle : undefined}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#1d293d]">{title}</h3>
          {collapsible && (
            <button className="text-slate-400 hover:text-slate-600 transition-colors">
              {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {(!collapsible || isExpanded) && (
        <div className="px-6 py-5">
          {children}
        </div>
      )}
    </div>
  );
}

interface SidebarCardProps {
  title: string;
  children: React.ReactNode;
}

export function SidebarCard({ title, children }: SidebarCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden sticky top-24">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-bold text-[#1d293d]">{title}</h3>
      </div>
      <div className="px-5 py-4">
        {children}
      </div>
    </div>
  );
}
