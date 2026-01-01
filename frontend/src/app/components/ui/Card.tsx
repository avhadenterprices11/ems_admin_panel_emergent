import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Card = ({ title, children, className = '' }: CardProps) => {
  return (
    <div className={`bg-white rounded-2xl p-6 border border-slate-200 ${className}`}>
      {title && <h3 className="mb-4">{title}</h3>}
      {children}
    </div>
  );
};
