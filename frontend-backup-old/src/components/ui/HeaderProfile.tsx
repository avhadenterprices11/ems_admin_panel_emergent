import React from 'react';
import { ChevronDown } from 'lucide-react';

interface HeaderProfileProps {
  userName: string;
  userAvatar: string;
}

export const HeaderProfile = ({ userName, userAvatar }: HeaderProfileProps) => {
  return (
    <div className="flex items-center gap-2 md:gap-3">
      <div className="hidden sm:block text-right">
        <div className="text-sm font-normal text-[#d1d5dc]">{userName}</div>
      </div>
      <div className="relative">
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#c27aff] to-[#fb64b6] p-[2px] cursor-pointer">
          <img 
            src={userAvatar} 
            alt={`${userName} profile picture`}
            className="w-full h-full object-cover rounded-full border-2 border-app-sidebar-bg" 
          />
        </div>
      </div>
      <ChevronDown size={16} className="text-[#99a1af] hidden md:block" aria-hidden="true" />
    </div>
  );
};
