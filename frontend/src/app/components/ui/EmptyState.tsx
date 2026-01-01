import React from 'react';

interface EmptyStateProps {
  message: string;
  icon?: React.ReactNode;
}

export const EmptyState = ({ message, icon }: EmptyStateProps) => {
  return (
    <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
      {icon && <div className="mb-4 flex justify-center">{icon}</div>}
      <p className="text-slate-500">{message}</p>
    </div>
  );
};
