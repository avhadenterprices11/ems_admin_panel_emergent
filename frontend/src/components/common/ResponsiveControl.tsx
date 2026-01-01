import React from 'react';
import { Button } from '../ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';

interface ResponsiveControlProps {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export const ResponsiveControl = ({ label, icon, children }: ResponsiveControlProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="h-[38px] border-slate-200 text-slate-600 hover:bg-slate-50 gap-2 font-medium"
        >
          {icon}
          <span className="hidden sm:inline">{label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56" sideOffset={8}>
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

ResponsiveControl.displayName = 'ResponsiveControl';

export const ResponsiveMenuItem = DropdownMenuItem;
export const ResponsiveMenuCheckboxItem = DropdownMenuCheckboxItem;
export const ResponsiveMenuLabel = DropdownMenuLabel;
export const ResponsiveMenuSeparator = DropdownMenuSeparator;