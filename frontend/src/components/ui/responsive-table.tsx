import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Checkbox } from './checkbox';
import { cn } from './utils';

export interface MobileCardConfig<T> {
  idField: (item: T) => string;
  titleField: (item: T) => React.ReactNode;
  valueField: (item: T) => React.ReactNode;
  statusField: (item: T) => React.ReactNode;
  expandedFields: {
    label: string;
    value: (item: T) => React.ReactNode;
  }[];
  actions?: (item: T) => React.ReactNode;
}

interface ResponsiveTableProps<T> {
  data: T[];
  mobileConfig: MobileCardConfig<T>;
  renderDesktop: () => React.ReactNode;
  selectedRows?: string[];
  onToggleRow?: (id: string) => void;
}

export function ResponsiveTable<T>({
  data,
  mobileConfig,
  renderDesktop,
  selectedRows = [],
  onToggleRow
}: ResponsiveTableProps<T>) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <>
      {/* Desktop View */}
      <div className="hidden lg:block">
        {renderDesktop()}
      </div>

      {/* Mobile View */}
      <div className="lg:hidden space-y-3">
        {data.map((item) => {
          const id = mobileConfig.idField(item);
          const isExpanded = expandedRows.has(id);
          const isSelected = selectedRows.includes(id);

          return (
            <div 
              key={id}
              className={cn(
                "bg-white rounded-xl border border-slate-100 overflow-hidden transition-colors",
                isSelected && "bg-slate-50/80 border-slate-200"
              )}
            >
              {/* Card Header */}
              <div 
                className="p-4 cursor-pointer"
                onClick={() => toggleExpand(id)}
              >
                <div className="flex items-start gap-3">
                  {onToggleRow && (
                    <div onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleRow(id)}
                        className="mt-1"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-[#1d293d] text-sm truncate">
                          {mobileConfig.titleField(item)}
                        </div>
                        <div className="text-xs text-[#62748e] mt-0.5">
                          {id}
                        </div>
                      </div>
                      <div className="shrink-0">
                        {mobileConfig.statusField(item)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="font-bold text-sm text-[#1d293d]">
                        {mobileConfig.valueField(item)}
                      </div>
                      <button className="text-slate-400 p-1">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-slate-100 p-4 bg-slate-50/30 space-y-3">
                  {mobileConfig.expandedFields.map((field, index) => (
                    <div key={index} className="flex justify-between items-start gap-4">
                      <span className="text-xs text-slate-500 font-medium shrink-0">
                        {field.label}
                      </span>
                      <span className="text-xs text-[#1d293d] text-right">
                        {field.value(item)}
                      </span>
                    </div>
                  ))}
                  {mobileConfig.actions && (
                    <div className="pt-2 border-t border-slate-100">
                      {mobileConfig.actions(item)}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

ResponsiveTable.displayName = 'ResponsiveTable';