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
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Upload } from 'lucide-react';

export interface ImportField {
  id: string;
  label: string;
  required: boolean;
  type: 'text' | 'email' | 'date' | 'select' | 'number';
  options?: string[];
}

export type ImportMode = 'create' | 'update' | 'upsert';

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moduleName: string;
  fields: ImportField[];
  onImport: (file: File, mode: ImportMode) => void;
}

export const ImportDialog = ({
  open,
  onOpenChange,
  moduleName,
  fields,
  onImport
}: ImportDialogProps) => {
  const [mode, setMode] = useState<ImportMode>('create');
  const [file, setFile] = useState<File | null>(null);

  const handleImport = () => {
    if (file) {
      onImport(file, mode);
      setFile(null);
      onOpenChange(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import {moduleName}</DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file to import {moduleName.toLowerCase()}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* File Upload */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Choose File</Label>
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-slate-300 transition-colors">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                <p className="text-sm text-slate-600">
                  {file ? file.name : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-slate-400 mt-1">CSV or Excel file</p>
              </label>
            </div>
          </div>

          {/* Import Mode */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Import Mode</Label>
            <RadioGroup value={mode} onValueChange={(value: any) => setMode(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="create" id="create" />
                <Label htmlFor="create" className="font-normal cursor-pointer">
                  Create new records only
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="update" id="update" />
                <Label htmlFor="update" className="font-normal cursor-pointer">
                  Update existing records only
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="upsert" id="upsert" />
                <Label htmlFor="upsert" className="font-normal cursor-pointer">
                  Create new and update existing
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Required Fields Info */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
            <p className="text-sm font-medium text-blue-900 mb-2">Required Fields</p>
            <ul className="text-xs text-blue-700 space-y-1">
              {fields.filter(f => f.required).map(field => (
                <li key={field.id}>• {field.label}</li>
              ))}
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!file}>
            <Upload size={16} className="mr-2" />
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

ImportDialog.displayName = 'ImportDialog';