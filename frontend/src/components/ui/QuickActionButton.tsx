import React from 'react';

interface QuickActionButtonProps {
  icon: React.ReactNode;
  label: string;
  color: string;
  onClick?: () => void;
}

export const QuickActionButton = ({ icon, label, color, onClick }: QuickActionButtonProps) => {
  return (
    <button 
      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-colors ${color}`}
      onClick={onClick}
      type="button"
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
};
