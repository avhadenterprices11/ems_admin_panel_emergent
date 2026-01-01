import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  Search,
  Grid3x3,
  List,
  Building,
  Users,
  UserCheck,
  Calendar,
  Mail,
  Shield,
  Lock,
  CreditCard,
  Globe,
  Bell,
  Plug,
  FolderOpen,
  FileText,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { cn } from '../components/ui/utils';

interface SettingsDomain {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  status?: 'configured' | 'not-set' | 'attention';
  route?: string;
}

export const SettingsPage = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const settingsDomains: SettingsDomain[] = [
    {
      id: 'org-identity',
      icon: Building,
      title: 'Organization & Identity',
      description: 'Core organization profile, branding, and domain configuration',
      status: 'configured',
      route: '/settings/organization-identity'
    },
    {
      id: 'users-access',
      icon: Users,
      title: 'Users, Roles & Access',
      description: 'Manage users, roles, permissions, and security policies',
      status: 'configured',
      route: '/settings/users-roles-access'
    },
    {
      id: 'people-identity',
      icon: UserCheck,
      title: 'People & Identity System',
      description: 'Person records, identity logic, classification, and verification',
      status: 'configured',
      route: '/settings/people-identity-system'
    },
    {
      id: 'events-programs',
      icon: Calendar,
      title: 'Events, Programs & Awards',
      description: 'Event defaults, registrations, awards, and workflows',
      status: 'configured',
      route: '/settings/events-programs-awards'
    },
    {
      id: 'communications',
      icon: Mail,
      title: 'Communications & Campaigns',
      description: 'Email, campaigns, sender identities, and messaging rules',
      status: 'configured',
      route: '/settings/communications-campaigns-settings'
    },
    {
      id: 'delivery-safety',
      icon: Shield,
      title: 'Delivery & Safety Controls',
      description: 'Quiet hours, rate limits, suppression, and delivery safety',
      status: 'configured',
      route: '/settings/delivery-safety-controls'
    },
    {
      id: 'compliance-privacy',
      icon: Lock,
      title: 'Compliance & Privacy',
      description: 'GDPR, consent management, data retention, and audit logs',
      status: 'configured',
      route: '/settings/compliance-privacy'
    },
    {
      id: 'notifications',
      icon: Bell,
      title: 'Notifications & Alerts',
      description: 'Channels, alerts, escalation, and notification policies',
      status: 'configured',
      route: '/settings/notifications-alerts'
    },
    {
      id: 'finance-payments',
      icon: CreditCard,
      title: 'Finance & Payments',
      description: 'Payment providers, tax rates, invoices, and refunds',
      status: 'configured',
      route: '/settings/finance-payments-settings'
    },
    {
      id: 'localization',
      icon: Globe,
      title: 'Localization & Regions',
      description: 'Languages, regions, timezones, and formatting rules',
      status: 'configured',
      route: '/settings/localization-regions'
    },
    {
      id: 'policies-legal',
      icon: FileText,
      title: 'Policies & Legal',
      description: 'Policy library, consent tracking, and legal enforcement',
      status: 'configured',
      route: '/settings/policies-legal'
    },
    {
      id: 'files-assets',
      icon: FolderOpen,
      title: 'Files & Assets',
      description: 'Storage, uploads, file categories, and asset management',
      status: 'configured',
      route: '/settings/files-assets'
    },
    {
      id: 'integrations-apis',
      icon: Plug,
      title: 'Integrations & APIs',
      description: 'Third-party integrations, API access, webhooks, and developer tools',
      status: 'configured',
      route: '/settings/integrations-apis'
    },
    {
      id: 'advanced-system',
      icon: Sliders,
      title: 'Advanced & System',
      description: 'Feature flags, emergency controls, and system configuration',
      status: 'configured',
      route: '/settings/advanced-system'
    }
  ];

  const getStatusBadge = (status?: string) => {
    if (!status) return null;

    switch (status) {
      case 'configured':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-0 text-xs font-medium">
            Configured
          </Badge>
        );
      case 'not-set':
        return (
          <Badge variant="outline" className="bg-slate-100 text-slate-600 border-0 text-xs font-medium">
            Not Set
          </Badge>
        );
      case 'attention':
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-0 text-xs font-medium">
            Requires Attention
          </Badge>
        );
      default:
        return null;
    }
  };

  const filteredDomains = settingsDomains.filter(domain =>
    domain.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    domain.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDomainClick = (domain: SettingsDomain) => {
    if (domain.route) {
      navigate(domain.route);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 -mx-8">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 bg-[#f9f9f9]/90 backdrop-blur-sm border-b border-slate-200/60 px-8 py-6 mb-8">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1.5">
              <h1 className="text-2xl font-bold text-[#1d293d] tracking-tight">Settings</h1>
              <p className="text-sm text-slate-500">
                Manage organization preferences, governance, and system configurations
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "px-3 py-2 rounded transition-all",
                    viewMode === 'grid'
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  )}
                  title="Grid View"
                >
                  <Grid3x3 size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "px-3 py-2 rounded transition-all",
                    viewMode === 'list'
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  )}
                  title="List View"
                >
                  <List size={16} />
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                <Input
                  placeholder="Search settings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-[300px] bg-white shadow-sm border-slate-200"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1280px] mx-auto px-8 pb-12">
        {filteredDomains.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Settings className="text-slate-400" size={28} />
            </div>
            <p className="text-slate-600 font-medium mb-1">No settings found</p>
            <p className="text-sm text-slate-500">Try a different search term</p>
          </div>
        ) : viewMode === 'grid' ? (
          <GridView 
            domains={filteredDomains} 
            getStatusBadge={getStatusBadge}
            onDomainClick={handleDomainClick}
          />
        ) : (
          <ListView 
            domains={filteredDomains} 
            getStatusBadge={getStatusBadge}
            onDomainClick={handleDomainClick}
          />
        )}
      </main>
    </div>
  );
};

// Grid View Component
const GridView = ({ 
  domains, 
  getStatusBadge,
  onDomainClick
}: { 
  domains: SettingsDomain[];
  getStatusBadge: (status?: string) => React.ReactNode;
  onDomainClick: (domain: SettingsDomain) => void;
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {domains.map((domain) => (
        <DomainCard
          key={domain.id}
          domain={domain}
          statusBadge={getStatusBadge(domain.status)}
          onDomainClick={onDomainClick}
        />
      ))}
    </div>
  );
};

// Domain Card Component
const DomainCard = ({ 
  domain, 
  statusBadge,
  onDomainClick
}: { 
  domain: SettingsDomain;
  statusBadge: React.ReactNode;
  onDomainClick: (domain: SettingsDomain) => void;
}) => {
  const Icon = domain.icon;
  
  return (
    <button
      onClick={() => onDomainClick(domain)}
      className="group bg-white rounded-2xl border border-slate-200 p-6 text-left hover:shadow-lg hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-5">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center group-hover:from-blue-50 group-hover:to-blue-100 transition-all duration-200">
          <Icon className="text-slate-700 group-hover:text-blue-600 transition-colors" size={24} />
        </div>
        {statusBadge && <div className="mt-1">{statusBadge}</div>}
      </div>
      
      <h3 className="font-bold text-[#1d293d] text-base mb-2 group-hover:text-blue-600 transition-colors">
        {domain.title}
      </h3>
      
      <p className="text-sm text-slate-600 leading-relaxed mb-4 min-h-[40px]">
        {domain.description}
      </p>

      <div className="flex items-center text-slate-400 group-hover:text-blue-600 transition-colors">
        <span className="text-xs font-medium mr-1">Configure</span>
        <ChevronRight size={14} />
      </div>
    </button>
  );
};

// List View Component
const ListView = ({ 
  domains, 
  getStatusBadge,
  onDomainClick
}: { 
  domains: SettingsDomain[];
  getStatusBadge: (status?: string) => React.ReactNode;
  onDomainClick: (domain: SettingsDomain) => void;
}) => {
  return (
    <div className="space-y-3">
      {domains.map((domain) => (
        <DomainRow
          key={domain.id}
          domain={domain}
          statusBadge={getStatusBadge(domain.status)}
          onDomainClick={onDomainClick}
        />
      ))}
    </div>
  );
};

// Domain Row Component
const DomainRow = ({ 
  domain, 
  statusBadge,
  onDomainClick
}: { 
  domain: SettingsDomain;
  statusBadge: React.ReactNode;
  onDomainClick: (domain: SettingsDomain) => void;
}) => {
  const Icon = domain.icon;
  
  return (
    <button
      onClick={() => onDomainClick(domain)}
      className="group w-full bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:border-slate-300 transition-all duration-200 flex items-center gap-4 text-left"
    >
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center shrink-0 group-hover:from-blue-50 group-hover:to-blue-100 transition-all duration-200">
        <Icon className="text-slate-700 group-hover:text-blue-600 transition-colors" size={24} />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-[#1d293d] text-base mb-1 group-hover:text-blue-600 transition-colors">
          {domain.title}
        </h3>
        <p className="text-sm text-slate-600">
          {domain.description}
        </p>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        {statusBadge}
        <ChevronRight className="text-slate-400 group-hover:text-blue-600 transition-colors" size={18} />
      </div>
    </button>
  );
};