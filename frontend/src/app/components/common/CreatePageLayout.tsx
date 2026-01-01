import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';

interface CreatePageLayoutProps {
  title: string;
  breadcrumb?: React.ReactNode;
  helperText?: string;
  backAction?: () => void;
  primaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  discardAction?: {
    label: string;
    onClick: () => void;
  };
  sidebar?: React.ReactNode;
  children: React.ReactNode;
}

export function CreatePageLayout({
  title,
  breadcrumb,
  helperText,
  backAction,
  primaryAction,
  secondaryAction,
  discardAction,
  sidebar,
  children
}: CreatePageLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-4">
            {/* Top Row: Back + Breadcrumb */}
            <div className="flex items-center gap-3">
              {backAction && (
                <Button variant="ghost" size="sm" onClick={backAction} className="gap-2">
                  <ArrowLeft size={16} />
                  Back
                </Button>
              )}
              {breadcrumb && (
                <div className="text-sm">
                  {breadcrumb}
                </div>
              )}
            </div>

            {/* Title + Helper + Actions */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-[#1d293d]">{title}</h1>
                {helperText && (
                  <p className="text-sm text-slate-600 mt-1">{helperText}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                {discardAction && (
                  <Button 
                    variant="outline" 
                    onClick={discardAction.onClick}
                    className="h-[38px] border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    {discardAction.label}
                  </Button>
                )}
                {secondaryAction && (
                  <Button 
                    variant="outline" 
                    onClick={secondaryAction.onClick}
                    className="h-[38px] border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    {secondaryAction.label}
                  </Button>
                )}
                {primaryAction && (
                  <Button 
                    onClick={primaryAction.onClick}
                    disabled={primaryAction.disabled}
                    className="h-[38px] bg-[#1d293d] text-white hover:bg-[#2a3a52]"
                  >
                    {primaryAction.label}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content Area (70%) */}
          <div className="flex-1 lg:w-[70%] space-y-6">
            {children}
          </div>

          {/* Sidebar (30%) */}
          {sidebar && (
            <div className="lg:w-[30%] space-y-6">
              {sidebar}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
