import React, { useState } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  FileText, 
  Users,
  Settings, 
  ChevronRight,
  Bell,
  Search,
  Menu,
  Mail,
  DollarSign,
  BarChart3,
  Video,
  Award
} from 'lucide-react';
import { GlobalSearch } from './GlobalSearch';
import { HeaderNotification } from './ui/HeaderNotification';
import { HeaderProfile } from './ui/HeaderProfile';
import { cn } from '../components/ui/utils';

function classNames(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

interface AdminLayoutProps {
  userName?: string;
  userAvatar?: string;
}

export const AdminLayout = ({ 
  userName = 'Admin User',
  userAvatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
}: AdminLayoutProps) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Get active page from current route
  const activePage = location.pathname.split('/')[1] || 'dashboard';

  const handleNav = (page: string) => {
    navigate(`/${page}`);
    setSidebarOpen(false);
  };

  const handleSearchNavigate = (page: string) => {
    navigate(`/${page}`);
  };

  return (
    <div className="bg-app-bg min-h-screen w-full font-sans text-app-heading flex relative overflow-hidden">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
          role="button"
          aria-label="Close navigation menu"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={classNames(
          "fixed lg:static top-4 left-4 h-[calc(100vh-32px)] w-[287px] bg-app-sidebar-bg text-[#99a1af] flex flex-col z-50 rounded-[40px] shadow-[0px_25px_50px_-12px_rgba(89,22,139,0.4)] border border-white/5 transition-transform duration-300 ease-in-out shrink-0 ml-4 my-4",
          isSidebarOpen ? "translate-x-0" : "-translate-x-[120%] lg:translate-x-0 lg:ml-4"
        )}
        aria-label="Main navigation"
        role="navigation"
      >
        {/* 1. Fixed Top Section (Logo) */}
        <div className="flex-none px-8 pt-8 pb-4">
          <div className="mb-8 flex items-center gap-3">
            <div className="h-12 flex items-center">
              <div className="text-2xl font-bold text-white tracking-tight">
                Admin<span className="text-purple-400">Panel</span>
              </div>
            </div>
          </div>
          
          <NavItem 
            icon={<Home size={20} />} 
            label="Dashboard" 
            active={activePage === 'dashboard'} 
            onClick={() => handleNav('dashboard')}
          />
        </div>

        {/* 2. Scrollable Middle Section */}
        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-1 custom-scrollbar-dark">
          <NavItem 
            icon={<Calendar size={20} />} 
            label="Events" 
            active={activePage === 'events' || activePage === ''} 
            onClick={() => handleNav('events')}
          />
          <NavItem 
            icon={<Video size={20} />} 
            label="Conferences" 
            active={activePage === 'conferences'} 
            onClick={() => handleNav('conferences')}
          />
          <NavItem 
            icon={<Award size={20} />} 
            label="Awards" 
            active={activePage === 'awards'} 
            onClick={() => handleNav('awards')}
          />
          <NavItem 
            icon={<FileText size={20} />} 
            label="Forms & Workflows" 
            active={activePage === 'forms'} 
            onClick={() => handleNav('forms')}
          />
          <NavItem 
            icon={<Users size={20} />} 
            label="People" 
            active={activePage === 'people'} 
            onClick={() => handleNav('people')}
          />
          <NavItem 
            icon={<Mail size={20} />} 
            label="Communications" 
            active={activePage === 'communications'} 
            onClick={() => handleNav('communications')}
          />
          <NavItem 
            icon={<DollarSign size={20} />} 
            label="Finance" 
            active={activePage === 'finance'} 
            onClick={() => handleNav('finance')}
          />
          <NavItem 
            icon={<BarChart3 size={20} />} 
            label="Reports & Analytics" 
            active={activePage === 'reports'} 
            onClick={() => handleNav('reports/analytics')}
          />
        </div>

        {/* 3. Fixed Bottom Section (Settings) */}
        <div className="flex-none px-6 py-6 pb-8 mt-auto">
          <NavItem 
            icon={<Settings size={20} />} 
            label="Settings" 
            active={activePage === 'settings'} 
            onClick={() => handleNav('settings')}
          />
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <div className="flex-none px-4 md:px-8 pt-4 md:pt-8 pb-4 relative z-30">
          <header className="bg-app-sidebar-bg rounded-[22px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] min-h-[56px] md:h-[72px] flex items-center justify-between px-4 md:px-8 transition-all duration-300 gap-3">
            {/* Left: Menu Button */}
            <div className="flex items-center">
              <button 
                className="lg:hidden p-2 text-[#90a1b9] hover:text-white transition-colors"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open navigation menu"
                aria-expanded={isSidebarOpen}
                type="button"
              >
                <Menu size={24} /> 
              </button>
            </div>
            
            {/* Center: Search */}
            <div className="flex-1 max-w-[448px] mx-auto">
              <GlobalSearch onNavigate={handleSearchNavigate} />
            </div>

            {/* Right: Notifications + Profile */}
            <div className="flex items-center gap-2 md:gap-6">
              <HeaderNotification hasUnread={true} />
              <HeaderProfile userName={userName} userAvatar={userAvatar} />
            </div>
          </header>
        </div>

        {/* Main Content Area - Renders child routes */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 pb-8 custom-scrollbar-light" role="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// NavItem Component
interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

function NavItem({ icon, label, active, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={classNames(
        "relative flex items-center gap-4 px-4 py-3 rounded-[16px] cursor-pointer transition-all duration-200 group overflow-hidden border border-transparent w-full text-left focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-app-sidebar-bg",
        active 
          ? "bg-gradient-to-r from-white/10 to-white/5 text-white shadow-lg border-white/5" 
          : "hover:bg-white/5 hover:text-white"
      )}
      aria-current={active ? 'page' : undefined}
      type="button"
    >
      <div 
        className={classNames(
          "flex items-center justify-center transition-transform duration-200", 
          active ? "scale-105" : "group-hover:scale-105"
        )} 
        aria-hidden="true"
      >
        {icon}
      </div>
      <span className="text-[15px] tracking-wide font-normal">{label}</span>
    </button>
  );
}