import React, { useState, useEffect, useCallback } from 'react';
import { X, Plus, ChevronsUpDown, Check, Loader2, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { cn } from '../ui/utils';
import { toast } from 'sonner';
import { masterDataAPI, Tag } from '../../api/events.api';

interface TagsSelectProps {
  value: number[];
  onChange: (tagIds: number[]) => void;
  placeholder?: string;
  disabled?: boolean;
  showAddNew?: boolean;
  maxTags?: number;
  className?: string;
  error?: string;
}

/**
 * Reusable Tags Multi-Select Component
 * - Multi-select popover for tags
 * - Fetches tags from master data API with search support
 * - Optionally allows creating new tags inline
 * - Uses tag_ids (number[]) as value
 * - Displays selected tags as color badges
 */
export const TagsSelect = ({
  value = [],
  onChange,
  placeholder = 'Select tags',
  disabled = false,
  showAddNew = true,
  maxTags,
  className,
  error,
}: TagsSelectProps) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#3B82F6');
  const [creating, setCreating] = useState(false);

  const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#EF4444', '#6366F1', '#14B8A6'];

  // Load tags on mount
  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async (search?: string) => {
    try {
      const data = await masterDataAPI.getTags(search);
      setTags(data);
    } catch (err) {
      console.error('Failed to load tags:', err);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        loadTags(searchQuery);
      } else {
        loadTags();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleCreateTag = async () => {
    if (!newName.trim()) return;
    
    setCreating(true);
    try {
      const newTag = await masterDataAPI.createTag({ name: newName.trim(), color: newColor });
      setTags([...tags, newTag]);
      onChange([...value, newTag.id]);
      setNewName('');
      setIsAddOpen(false);
      toast.success('Tag created successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create tag');
    } finally {
      setCreating(false);
    }
  };

  const toggleTag = (tagId: number) => {
    if (value.includes(tagId)) {
      onChange(value.filter(id => id !== tagId));
    } else {
      if (maxTags && value.length >= maxTags) {
        toast.error(`Maximum ${maxTags} tags allowed`);
        return;
      }
      onChange([...value, tagId]);
    }
  };

  const removeTag = (tagId: number) => {
    onChange(value.filter(id => id !== tagId));
  };

  const selectedTags = tags.filter(t => value.includes(t.id));

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between font-normal",
              error && "border-red-500"
            )}
            disabled={disabled || loading}
            data-testid="tags-select-trigger"
          >
            {loading ? (
              <span className="flex items-center text-slate-400">
                <Loader2 size={14} className="mr-2 animate-spin" />
                Loading...
              </span>
            ) : value.length > 0 ? (
              <span>{value.length} tag{value.length > 1 ? 's' : ''} selected</span>
            ) : (
              <span className="text-slate-400">{placeholder}</span>
            )}
            <ChevronsUpDown size={14} className="ml-2 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput 
              placeholder="Search tags..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>
                {searchQuery ? 'No tags found.' : 'No tags available.'}
              </CommandEmpty>
              <CommandGroup>
                {tags.map((tag) => (
                  <CommandItem
                    key={tag.id}
                    value={tag.id.toString()}
                    onSelect={() => toggleTag(tag.id)}
                    className="cursor-pointer"
                  >
                    <Check
                      size={16}
                      className={cn(
                        "mr-2",
                        value.includes(tag.id) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span
                      className="w-3 h-3 rounded-full mr-2 shrink-0"
                      style={{ backgroundColor: tag.color || '#3B82F6' }}
                    />
                    <span className="truncate">{tag.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            {showAddNew && (
              <div className="p-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    setOpen(false);
                    setIsAddOpen(true);
                  }}
                >
                  <Plus size={14} className="mr-2" />
                  Create new tag
                </Button>
              </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag.id}
              style={{ backgroundColor: tag.color || '#3B82F6' }}
              className="text-white gap-1 pr-1"
            >
              {tag.name}
              <button
                type="button"
                onClick={() => removeTag(tag.id)}
                className="ml-1 hover:bg-white/20 rounded-full p-0.5"
              >
                <X size={12} />
              </button>
            </Badge>
          ))}
        </div>
      )}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      {/* Add Tag Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Tag</DialogTitle>
            <DialogDescription>
              Add a new tag for organizing your events.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-tag-name">Tag Name</Label>
              <Input
                id="new-tag-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter tag name"
                data-testid="new-tag-input"
              />
            </div>
            <div className="space-y-2">
              <Label>Tag Color</Label>
              <div className="flex gap-2 flex-wrap">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-transform",
                      newColor === color ? "border-slate-900 scale-110" : "border-transparent"
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewColor(color)}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateTag}
              disabled={creating || !newName.trim()}
              data-testid="create-tag-btn"
            >
              {creating && <Loader2 size={14} className="mr-2 animate-spin" />}
              Create Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/**
 * Legacy TagsSelect that works with string arrays
 * For backwards compatibility with existing forms that use tag names instead of IDs
 */
export const TagsSelectLegacy = ({
  value = [],
  onChange,
  ...props
}: Omit<TagsSelectProps, 'value' | 'onChange'> & {
  value: string[];
  onChange: (tagNames: string[]) => void;
}) => {
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    masterDataAPI.getTags().then(setTags).catch(console.error);
  }, []);

  // Convert string names to IDs
  const tagIds = value
    .map(name => tags.find(t => t.name.toLowerCase() === name.toLowerCase())?.id)
    .filter((id): id is number => id !== undefined);

  const handleChange = (ids: number[]) => {
    const names = ids
      .map(id => tags.find(t => t.id === id)?.name)
      .filter((name): name is string => name !== undefined);
    onChange(names);
  };

  return (
    <TagsSelect
      {...props}
      value={tagIds}
      onChange={handleChange}
    />
  );
};

// Simple tag input that creates tags on the fly (for inline text input)
interface SimpleTagInputProps {
  value: number[];
  onChange: (tagIds: number[]) => void;
  placeholder?: string;
  className?: string;
}

export const SimpleTagInput = ({
  value = [],
  onChange,
  placeholder = 'Add tag...',
  className,
}: SimpleTagInputProps) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    masterDataAPI.getTags().then((data) => {
      setTags(data);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const selectedTags = tags.filter(t => value.includes(t.id));

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      
      // Check if tag exists
      const existingTag = tags.find(t => t.name.toLowerCase() === inputValue.trim().toLowerCase());
      
      if (existingTag) {
        if (!value.includes(existingTag.id)) {
          onChange([...value, existingTag.id]);
        }
      } else {
        // Create new tag
        try {
          const newTag = await masterDataAPI.createTag({ name: inputValue.trim() });
          setTags([...tags, newTag]);
          onChange([...value, newTag.id]);
          toast.success(`Tag "${newTag.name}" created`);
        } catch (err: any) {
          toast.error(err.response?.data?.message || 'Failed to create tag');
        }
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (tagId: number) => {
    onChange(value.filter(id => id !== tagId));
  };

  return (
    <div className={cn(
      'flex flex-wrap gap-2 p-2 border border-slate-200 rounded-lg bg-white min-h-[42px]',
      className
    )}>
      {selectedTags.map((tag) => (
        <Badge
          key={tag.id}
          style={{ backgroundColor: tag.color || '#3B82F6' }}
          className="text-white gap-1 pr-1"
        >
          {tag.name}
          <button
            type="button"
            onClick={() => removeTag(tag.id)}
            className="ml-1 hover:bg-white/20 rounded-full p-0.5"
          >
            <X size={12} />
          </button>
        </Badge>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? placeholder : ''}
        disabled={loading}
        className="flex-1 border-0 outline-none p-0 h-auto min-w-[120px] text-sm bg-transparent"
      />
    </div>
  );
};
