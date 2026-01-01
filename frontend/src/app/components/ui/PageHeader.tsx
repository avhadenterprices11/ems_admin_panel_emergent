import React from 'react';
import { Button } from './button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './dropdown-menu';
import { ChevronDown } from 'lucide-react';

interface PageHeaderProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  dateRangePicker?: React.ReactNode;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    dropdownItems?: React.ReactNode;
  };
  secondaryActions?: React.ReactNode;
}

export const PageHeader = ({ 
  title, 
  description, 
  action,
  dateRangePicker,
  primaryAction,
  secondaryActions
}: PageHeaderProps) => {
  // New layout for Events page (with date picker and actions)
  if (dateRangePicker || primaryAction || secondaryActions) {
    return (
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left: Date Range Picker */}
        <div className="shrink-0">
          {dateRangePicker}
        </div>
        
        {/* Right: Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {secondaryActions}
          {primaryAction && (
            primaryAction.dropdownItems ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    onClick={primaryAction.onClick}
                    className="h-[38px] bg-[#0e042f] hover:bg-[#1d293d] text-white w-full md:w-auto shadow-sm rounded-xl"
                  >
                    {primaryAction.icon}
                    {primaryAction.label}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {primaryAction.dropdownItems}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={primaryAction.onClick}
                className="h-[38px] bg-[#0e042f] hover:bg-[#1d293d] text-white w-full md:w-auto shadow-sm rounded-xl"
              >
                {primaryAction.icon}
                {primaryAction.label}
              </Button>
            )
          )}
        </div>
      </div>
    );
  }

  // Original layout for other pages (with title and description)
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="space-y-1">
        <h1>{title}</h1>
        {description && <p className="text-app-text-muted">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};