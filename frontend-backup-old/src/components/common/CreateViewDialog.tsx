import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';

interface CreateViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddView: (name: string) => void;
}

export const CreateViewDialog = ({ open, onOpenChange, onAddView }: CreateViewDialogProps) => {
  const [viewName, setViewName] = useState('');

  const handleSave = () => {
    if (viewName.trim()) {
      onAddView(viewName);
      setViewName('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Current View</DialogTitle>
          <DialogDescription>
            Save your current filters and settings as a reusable view.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="view-name">View Name</Label>
            <Input
              id="view-name"
              value={viewName}
              onChange={(e) => setViewName(e.target.value)}
              placeholder="e.g., Upcoming Events"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save View</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

CreateViewDialog.displayName = 'CreateViewDialog';