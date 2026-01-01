import React from 'react';
import { Bell } from 'lucide-react';

interface HeaderNotificationProps {
  hasUnread?: boolean;
}

export const HeaderNotification = ({ hasUnread = true }: HeaderNotificationProps) => {
  return (
    <button 
      className="relative p-2 text-[#99a1af] hover:text-white transition-colors"
      aria-label="View notifications"
      type="button"
    >
      <Bell size={20} />
      {hasUnread && (
        <span 
          className="absolute top-1.5 right-2 w-2 h-2 bg-[#fb2c36] rounded-full border-2 border-app-sidebar-bg" 
          aria-label="Unread notifications" 
        />
      )}
    </button>
  );
};
