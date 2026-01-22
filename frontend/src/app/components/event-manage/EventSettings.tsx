import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, 
  CreditCard, 
  Palette, 
  Users, 
  FileText, 
  Link, 
  Shield, 
  Trash2,
  Archive,
  Globe,
  Mail,
  ExternalLink,
  Calendar,
  MapPin,
  Clock
} from 'lucide-react';
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";

// Import Settings Pages
import { SettingsGeneral } from './settings/SettingsGeneral';
import { SettingsBranding } from './settings/SettingsBranding';
import { SettingsPayment } from './settings/SettingsPayment';
import { SettingsTeam } from './settings/SettingsTeam';
import { SettingsBadge } from './settings/SettingsBadge';
import { SettingsIntegrations } from './settings/SettingsIntegrations';
import { SettingsDataPrivacy } from './settings/SettingsDataPrivacy';
import { SettingsArchive } from './settings/SettingsArchive';
import { SettingsDelete } from './settings/SettingsDelete';
import { SettingsEmail } from './settings/SettingsEmail';

interface EventSettingsProps {
  eventId?: number | string;
  onNavigateToAdvanced?: () => void;
}

export const EventSettings = ({ eventId, onNavigateToAdvanced }: EventSettingsProps) => {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
       {/* Sidebar Nav */}
       <div className="md:col-span-1 space-y-1">
          <SettingsNavItem 
            active={activeTab === 'general'} 
            label="General Details" 
            icon={<Settings size={18} />} 
            onClick={() => setActiveTab('general')}
          />
          <SettingsNavItem 
            active={activeTab === 'branding'} 
            label="Branding & Design" 
            icon={<Palette size={18} />} 
            onClick={() => setActiveTab('branding')}
          />
          <SettingsNavItem 
            active={activeTab === 'payment'} 
            label="Payment & Tax" 
            icon={<CreditCard size={18} />} 
            onClick={() => setActiveTab('payment')}
          />
          <SettingsNavItem 
            active={activeTab === 'team'} 
            label="Team & Permissions" 
            icon={<Users size={18} />} 
            onClick={() => setActiveTab('team')}
          />
          <SettingsNavItem 
            active={activeTab === 'badge'} 
            label="Badge Design" 
            icon={<FileText size={18} />} 
            onClick={() => setActiveTab('badge')}
          />
          <SettingsNavItem 
            active={activeTab === 'integrations'} 
            label="Integrations" 
            icon={<Link size={18} />} 
            onClick={() => setActiveTab('integrations')}
          />
          <SettingsNavItem 
            active={activeTab === 'privacy'} 
            label="Data & Privacy" 
            icon={<Shield size={18} />} 
            onClick={() => setActiveTab('privacy')}
          />
          <SettingsNavItem 
            active={activeTab === 'email'} 
            label="Email Configuration" 
            icon={<Mail size={18} />} 
            onClick={() => setActiveTab('email')}
          />
          <Separator className="my-2" />
          <SettingsNavItem 
            active={activeTab === 'advanced'} 
            label="Advanced Configuration" 
            icon={<Settings size={18} />} 
            onClick={() => setActiveTab('advanced')}
          />
          <Separator className="my-2" />
          <button 
            onClick={() => setActiveTab('archive')}
            className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-3 transition-colors ${activeTab === 'archive' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}
          >
              <Archive size={18} /> Archive Event
          </button>
          <button 
            onClick={() => setActiveTab('delete')}
            className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-3 transition-colors ${activeTab === 'delete' ? 'bg-rose-50 text-rose-700' : 'text-rose-600 hover:bg-rose-50'}`}
          >
              <Trash2 size={18} /> Delete Event
          </button>
       </div>

       {/* Content Area */}
       <div className="md:col-span-3 space-y-6">
          {activeTab === 'general' && eventId && <SettingsGeneral eventId={eventId} />}
          {activeTab === 'branding' && eventId && <SettingsBranding eventId={eventId} />}
          {activeTab === 'payment' && eventId && <SettingsPayment eventId={eventId} />}
          {activeTab === 'team' && <SettingsTeam />}
          {activeTab === 'badge' && eventId && <SettingsBadge eventId={typeof eventId === 'string' ? parseInt(eventId) : eventId} />}
          {activeTab === 'integrations' && eventId && <SettingsIntegrations eventId={typeof eventId === 'string' ? parseInt(eventId) : eventId} />}
          {activeTab === 'privacy' && eventId && <SettingsDataPrivacy eventId={typeof eventId === 'string' ? parseInt(eventId) : eventId} />}
          {activeTab === 'advanced' && <SettingsAdvanced onNavigate={onNavigateToAdvanced} />}
          {activeTab === 'archive' && <SettingsArchive />}
          {activeTab === 'delete' && <SettingsDelete />}
          {activeTab === 'email' && eventId && <SettingsEmail eventId={typeof eventId === 'string' ? parseInt(eventId) : eventId} />}
       </div>
    </div>
  );
};

const SettingsNavItem = ({ label, icon, active, onClick }: any) => (
    <button 
        onClick={onClick}
        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-3 transition-colors ${active ? 'bg-[#0f172b] text-white' : 'text-slate-600 hover:bg-slate-100'}`}
    >
        {icon}
        {label}
    </button>
);

const SettingsAdvanced = ({ onNavigate }: any) => (
  <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6">
    <div className="flex items-start gap-4 mb-6">
      <div className="p-3 bg-blue-50 rounded-lg">
        <Settings className="text-blue-600" size={24} />
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-bold text-[#1d293d] mb-2">Advanced Configuration</h3>
        <p className="text-sm text-slate-600">
          Manage core event settings including dates, location, agenda, SEO, accessibility, and email configuration overrides.
        </p>
      </div>
    </div>
    
    <div className="space-y-3 mb-6">
      <div className="flex items-center gap-3 text-sm text-slate-600">
        <Calendar className="text-slate-400" size={16} />
        <span>Event Details, Dates & Registration Window</span>
      </div>
      <div className="flex items-center gap-3 text-sm text-slate-600">
        <MapPin className="text-slate-400" size={16} />
        <span>Location & Venue Configuration</span>
      </div>
      <div className="flex items-center gap-3 text-sm text-slate-600">
        <Clock className="text-slate-400" size={16} />
        <span>Event Agenda & Schedule</span>
      </div>
      <div className="flex items-center gap-3 text-sm text-slate-600">
        <Globe className="text-slate-400" size={16} />
        <span>SEO & Meta Information</span>
      </div>
      <div className="flex items-center gap-3 text-sm text-slate-600">
        <Shield className="text-slate-400" size={16} />
        <span>Accessibility & Safety Settings</span>
      </div>
      <div className="flex items-center gap-3 text-sm text-slate-600">
        <Mail className="text-slate-400" size={16} />
        <span>Email Configuration Overrides</span>
      </div>
    </div>
    
    <Button 
      onClick={onNavigate}
      className="w-full bg-[#4f39f6] hover:bg-[#3d2cdb] text-white"
    >
      <ExternalLink size={16} className="mr-2" />
      Open Advanced Settings
    </Button>
  </div>
);
