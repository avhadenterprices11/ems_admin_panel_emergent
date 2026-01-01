import React from 'react';
import { Info } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";

interface InheritanceInfoIconProps {
  context: 'global' | 'event' | 'ticket';
}

export const InheritanceInfoIcon = ({ context }: InheritanceInfoIconProps) => {
  const getMessage = () => {
    switch (context) {
      case 'global':
        return 'Global email templates apply to all events unless overridden at the event or ticket level.';
      case 'event':
        return 'Event-level overrides apply to this specific event. When disabled, global templates are used. Ticket-level overrides take precedence.';
      case 'ticket':
        return 'Ticket-level overrides apply only to this ticket type. When disabled, event-level overrides (if any) or global templates are used.';
      default:
        return 'Email template inheritance information';
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full h-5 w-5 bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
        >
          <Info size={12} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Email Template Inheritance</h4>
          <p className="text-xs text-slate-600">{getMessage()}</p>
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="text-xs text-slate-500">
              <strong>Priority:</strong> Ticket Override → Event Override → Global Template
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
