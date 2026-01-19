import React, { useState, useEffect } from 'react';
import { Plus, ChevronsUpDown, Check, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { cn } from '../ui/utils';
import { toast } from 'sonner';
import { masterDataAPI, Category } from '../../api/events.api';

interface CategorySelectProps {
  value?: number;
  onChange: (categoryId: number | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  showAddNew?: boolean;
  className?: string;
  error?: string;
}

/**
 * Reusable Category Select Component
 * - Single-select dropdown for categories
 * - Fetches categories from master data API
 * - Optionally allows creating new categories inline
 * - Uses category_id (number) as value
 */
export const CategorySelect = ({
  value,
  onChange,
  placeholder = 'Select category',
  disabled = false,
  showAddNew = true,
  className,
  error,
}: CategorySelectProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await masterDataAPI.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newName.trim()) return;
    
    setCreating(true);
    try {
      const newCategory = await masterDataAPI.createCategory({ name: newName.trim() });
      setCategories([...categories, newCategory]);
      onChange(newCategory.id);
      setNewName('');
      setIsAddOpen(false);
      toast.success('Category created successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create category');
    } finally {
      setCreating(false);
    }
  };

  const handleSelectChange = (val: string) => {
    if (val === '__ADD_NEW__') {
      setIsAddOpen(true);
    } else if (val === '__NONE__') {
      onChange(undefined);
    } else {
      onChange(parseInt(val));
    }
  };

  const selectedCategory = categories.find(c => c.id === value);

  return (
    <div className={className}>
      <Select
        value={value?.toString() || '__NONE__'}
        onValueChange={handleSelectChange}
        disabled={disabled || loading}
      >
        <SelectTrigger 
          className={cn(error && 'border-red-500')}
          data-testid="category-select-trigger"
        >
          {loading ? (
            <span className="flex items-center text-slate-400">
              <Loader2 size={14} className="mr-2 animate-spin" />
              Loading...
            </span>
          ) : (
            <SelectValue placeholder={placeholder}>
              {selectedCategory?.name || placeholder}
            </SelectValue>
          )}
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__NONE__" className="text-slate-400">
            {placeholder}
          </SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id.toString()}>
              {cat.name}
            </SelectItem>
          ))}
          {showAddNew && (
            <SelectItem 
              value="__ADD_NEW__" 
              className="text-blue-600 font-medium"
            >
              <span className="flex items-center">
                <Plus size={14} className="mr-2" />
                Create New Category
              </span>
            </SelectItem>
          )}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      {/* Add Category Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>
              Add a new category for organizing your events.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-category-name">Category Name</Label>
              <Input
                id="new-category-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter category name"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateCategory()}
                data-testid="new-category-input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateCategory} 
              disabled={creating || !newName.trim()}
              data-testid="create-category-btn"
            >
              {creating && <Loader2 size={14} className="mr-2 animate-spin" />}
              Create Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Export for backwards compatibility - returns category name instead of ID
export const CategorySelectLegacy = ({
  value,
  onChange,
  ...props
}: Omit<CategorySelectProps, 'value' | 'onChange'> & {
  value?: string;
  onChange: (categorySlug: string) => void;
}) => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    masterDataAPI.getCategories().then(setCategories).catch(console.error);
  }, []);

  const categoryId = categories.find(c => c.slug === value || c.name.toLowerCase() === value?.toLowerCase())?.id;

  const handleChange = (id: number | undefined) => {
    const cat = categories.find(c => c.id === id);
    onChange(cat?.slug || cat?.name.toLowerCase() || '');
  };

  return (
    <CategorySelect
      {...props}
      value={categoryId}
      onChange={handleChange}
    />
  );
};
