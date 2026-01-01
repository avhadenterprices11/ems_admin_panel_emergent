import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Download } from 'lucide-react';

export interface ExportColumn {
  id: string;
  label: string;
}

export interface ExportOptions {
  scope: 'all' | 'selected';
  format: 'csv' | 'xlsx' | 'json' | 'pdf';
  columns: string[];
  includeHeaders: boolean;
}

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moduleName: string;
  totalCount: number;
  selectedCount?: number;
  columns: ExportColumn[];
  supportsDateRange?: boolean;
  onExport: (options: ExportOptions) => void;
}

export const ExportDialog = ({
  open,
  onOpenChange,
  moduleName,
  totalCount,
  selectedCount,
  columns,
  onExport
}: ExportDialogProps) => {
  const [scope, setScope] = useState<'all' | 'selected'>('all');
  const [format, setFormat] = useState<'csv' | 'xlsx' | 'json' | 'pdf'>('csv');
  const [selectedColumns, setSelectedColumns] = useState<string[]>(columns.map(c => c.id));
  const [includeHeaders, setIncludeHeaders] = useState(true);

  const handleExport = () => {
    onExport({
      scope,
      format,
      columns: selectedColumns,
      includeHeaders
    });
    onOpenChange(false);
  };

  const toggleColumn = (columnId: string) => {
    setSelectedColumns(prev =>
      prev.includes(columnId)
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export {moduleName}</DialogTitle>
          <DialogDescription>
            Choose what data to export and in which format.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* Scope Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Export Scope</Label>
            <RadioGroup value={scope} onValueChange={(value: any) => setScope(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all" className="font-normal cursor-pointer">
                  All {moduleName} ({totalCount} records)
                </Label>
              </div>
              {selectedCount && selectedCount > 0 && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="selected" id="selected" />
                  <Label htmlFor="selected" className="font-normal cursor-pointer">
                    Selected {moduleName} ({selectedCount} records)
                  </Label>
                </div>
              )}
            </RadioGroup>
          </div>

          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Export Format</Label>
            <RadioGroup value={format} onValueChange={(value: any) => setFormat(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="font-normal cursor-pointer">CSV (.csv)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="xlsx" id="xlsx" />
                <Label htmlFor="xlsx" className="font-normal cursor-pointer">Excel (.xlsx)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json" className="font-normal cursor-pointer">JSON (.json)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf" className="font-normal cursor-pointer">PDF (.pdf)</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Column Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Columns to Export</Label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-3">
              {columns.map(column => (
                <div key={column.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={column.id}
                    checked={selectedColumns.includes(column.id)}
                    onCheckedChange={() => toggleColumn(column.id)}
                  />
                  <Label htmlFor={column.id} className="text-sm font-normal cursor-pointer">
                    {column.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="headers"
              checked={includeHeaders}
              onCheckedChange={(checked) => setIncludeHeaders(checked as boolean)}
            />
            <Label htmlFor="headers" className="font-normal cursor-pointer">
              Include column headers
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={selectedColumns.length === 0}>
            <Download size={16} className="mr-2" />
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

ExportDialog.displayName = 'ExportDialog';