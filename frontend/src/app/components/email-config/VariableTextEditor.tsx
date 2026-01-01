import React, { useState, useRef, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";

interface VariableTextEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  variables: string[];
  multiline?: boolean;
}

export function VariableTextEditor({
  label,
  value,
  onChange,
  placeholder = "Enter text...",
  variables,
  multiline = false
}: VariableTextEditorProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    
    // Prevent manual entry of {{ or }}
    if (newValue.includes('{{') || newValue.includes('}}')) {
      return;
    }
    
    onChange(newValue);
  };

  const insertVariable = (variable: string) => {
    if (!inputRef.current) return;
    
    const cursorPos = inputRef.current.selectionStart || 0;
    const textBefore = value.substring(0, cursorPos);
    const textAfter = value.substring(cursorPos);
    
    // Add spacing around variable if needed
    const needsSpaceBefore = textBefore.length > 0 && !textBefore.endsWith(' ');
    const needsSpaceAfter = textAfter.length > 0 && !textAfter.startsWith(' ');
    
    const newValue = 
      textBefore + 
      (needsSpaceBefore ? ' ' : '') + 
      variable + 
      (needsSpaceAfter ? ' ' : '') + 
      textAfter;
    
    onChange(newValue);
    setDropdownOpen(false);
    
    // Focus back to input after insertion
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const removeVariable = (variableName: string, index: number) => {
    // Find the position of the variable to remove
    let currentIndex = 0;
    let position = -1;
    let searchPos = 0;
    
    while (currentIndex <= index && searchPos < value.length) {
      const nextPos = value.indexOf(variableName, searchPos);
      if (nextPos === -1) break;
      if (currentIndex === index) {
        position = nextPos;
        break;
      }
      currentIndex++;
      searchPos = nextPos + variableName.length;
    }
    
    if (position !== -1) {
      const before = value.substring(0, position);
      const after = value.substring(position + variableName.length);
      
      // Clean up extra spaces
      const newValue = (before + after).replace(/\s{2,}/g, ' ').trim();
      onChange(newValue);
    }
  };

  const renderDisplayContent = () => {
    const segments: Array<{ type: 'text' | 'variable'; content: string; index: number }> = [];
    let remaining = value;
    let variableIndex = 0;
    
    while (remaining.length > 0) {
      // Find the next variable
      let nextVarPos = -1;
      let foundVariable = '';
      
      for (const variable of variables) {
        const pos = remaining.indexOf(variable);
        if (pos !== -1 && (nextVarPos === -1 || pos < nextVarPos)) {
          nextVarPos = pos;
          foundVariable = variable;
        }
      }
      
      if (nextVarPos === -1) {
        // No more variables, rest is text
        if (remaining) {
          segments.push({ type: 'text', content: remaining, index: -1 });
        }
        break;
      } else {
        // Add text before variable
        if (nextVarPos > 0) {
          segments.push({ type: 'text', content: remaining.substring(0, nextVarPos), index: -1 });
        }
        // Add variable
        segments.push({ type: 'variable', content: foundVariable, index: variableIndex++ });
        // Continue with remaining text
        remaining = remaining.substring(nextVarPos + foundVariable.length);
      }
    }
    
    return segments.map((segment, idx) => {
      if (segment.type === 'text') {
        return <span key={idx} className="whitespace-pre-wrap">{segment.content}</span>;
      } else {
        const displayName = segment.content;
        return (
          <Badge
            key={idx}
            variant="secondary"
            className="bg-purple-100 text-purple-700 hover:bg-purple-100 border border-purple-200 px-2 py-[1px] text-[11px] font-medium inline-flex items-center gap-1 cursor-default select-none rounded-full mx-0.5 align-middle leading-none"
          >
            <span className="font-mono">{displayName}</span>
            <button
              type="button"
              onClick={() => removeVariable(segment.content, segment.index)}
              className="hover:bg-purple-200 rounded-full p-[2px] transition-colors -mr-0.5"
            >
              <X size={10} strokeWidth={3} />
            </button>
          </Badge>
        );
      }
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-slate-700">{label}</Label>
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-purple-700 hover:text-purple-800 hover:bg-purple-50"
            >
              <Plus size={14} className="mr-1" />
              Insert Variable
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 max-h-[300px] overflow-y-auto">
            {variables.map((variable) => (
              <DropdownMenuItem key={variable} onClick={() => insertVariable(variable)}>
                <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-xs font-mono">
                  {variable}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="relative">
        {/* Display Layer (Visible Pills) */}
        <div className="absolute inset-0 pointer-events-none z-10 px-3 py-2.5 rounded-md overflow-auto">
          <div className={multiline ? "flex flex-wrap gap-y-1" : "flex flex-wrap items-center gap-y-1"}>
            {renderDisplayContent()}
          </div>
        </div>

        {/* Input Layer (Transparent, Receives Input) */}
        {multiline ? (
          <Textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={value}
            onChange={handleTextChange}
            placeholder={placeholder}
            className="relative z-0 bg-white text-transparent caret-slate-600 selection:bg-purple-200 selection:text-transparent min-h-[120px] resize-none"
            style={{ caretColor: '#475569' }}
          />
        ) : (
          <Input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            value={value}
            onChange={handleTextChange}
            placeholder={placeholder}
            className="relative z-0 bg-white text-transparent caret-slate-600 selection:bg-purple-200 selection:text-transparent"
            style={{ caretColor: '#475569' }}
          />
        )}
      </div>
    </div>
  );
}