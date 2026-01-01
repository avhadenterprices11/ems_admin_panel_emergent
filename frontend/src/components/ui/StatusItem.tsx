import React from 'react';

interface StatusItemProps {
  label: string;
  status: string;
  statusColor: string;
}

export const StatusItem = ({ label, status, statusColor }: StatusItemProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="text-slate-600">{label}</div>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${statusColor}`} />
        <div className="text-sm font-medium text-slate-900">{status}</div>
      </div>
    </div>
  );
};
