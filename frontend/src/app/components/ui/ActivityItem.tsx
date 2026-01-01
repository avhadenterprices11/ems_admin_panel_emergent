import React from 'react';

interface ActivityItemProps {
  title: string;
  description: string;
  time: string;
}

export const ActivityItem = ({ title, description, time }: ActivityItemProps) => {
  return (
    <div className="flex items-start gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
      <div className="flex-1">
        <div className="font-medium text-slate-900">{title}</div>
        <div className="text-sm text-slate-500">{description}</div>
      </div>
      <div className="text-xs text-slate-400 flex-shrink-0">{time}</div>
    </div>
  );
};
