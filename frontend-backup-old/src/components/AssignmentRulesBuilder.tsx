import React from 'react';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Users, Zap, GitBranch } from 'lucide-react';

interface AssignmentRulesBuilderProps {
  value: string;
  onChange: (value: string) => void;
}

export const AssignmentRulesBuilder = ({ value, onChange }: AssignmentRulesBuilderProps) => {
  return (
    <RadioGroup value={value} onValueChange={onChange} className="space-y-4">
      {/* Manual Assignment */}
      <div className="flex items-start space-x-3 border border-slate-200 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer">
        <RadioGroupItem value="manual" id="manual" className="mt-1" />
        <div className="flex-1">
          <Label htmlFor="manual" className="flex items-center gap-2 cursor-pointer">
            <Users className="h-4 w-4 text-slate-600" />
            <span className="font-medium text-sm">Manual Assignment</span>
          </Label>
          <p className="text-xs text-slate-500 mt-1">
            Admin manually assigns submissions to reviewers
          </p>
        </div>
      </div>

      {/* Auto-Assignment (Round Robin) */}
      <div className="flex items-start space-x-3 border border-slate-200 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer">
        <RadioGroupItem value="round-robin" id="round-robin" className="mt-1" />
        <div className="flex-1">
          <Label htmlFor="round-robin" className="flex items-center gap-2 cursor-pointer">
            <Zap className="h-4 w-4 text-slate-600" />
            <span className="font-medium text-sm">Auto-Assignment (Round Robin)</span>
          </Label>
          <p className="text-xs text-slate-500 mt-1">
            Automatically distribute submissions evenly across reviewers
          </p>
        </div>
      </div>

      {/* Rule-Based Assignment */}
      <div className="flex items-start space-x-3 border border-slate-200 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer">
        <RadioGroupItem value="rule-based" id="rule-based" className="mt-1" />
        <div className="flex-1">
          <Label htmlFor="rule-based" className="flex items-center gap-2 cursor-pointer">
            <GitBranch className="h-4 w-4 text-slate-600" />
            <span className="font-medium text-sm">Rule-Based Assignment</span>
          </Label>
          <p className="text-xs text-slate-500 mt-1">
            Assign based on field values, categories, or conditional logic
          </p>
        </div>
      </div>
    </RadioGroup>
  );
};
