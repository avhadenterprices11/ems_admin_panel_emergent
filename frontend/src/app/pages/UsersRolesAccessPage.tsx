import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Shield, Grid3x3, Globe, UserCog, CheckSquare, Lock, Activity,
  Search, Filter, MoreVertical, Edit, Ban, Eye, FileText, CheckCircle2,
  XCircle, AlertCircle, Clock, Mail, UserPlus, Settings, X, Check,
  Download, RefreshCw, Trash2, Copy, History, AlertTriangle, Info,
  LogOut, Smartphone, Play, Plus, ChevronDown, ChevronRight, Zap,
  Target, ShieldAlert, ShieldCheck, Network
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Switch } from '../components/ui/switch';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Checkbox } from '../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { toast } from 'sonner';
import { cn } from '../components/ui/utils';

type SectionType = 'users' | 'roles' | 'permissions' | 'scopes' | 'assignments' | 'approvals' | 'security' | 'audit';

interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  scopes: string[];
  status: 'active' | 'suspended' | 'invited';
  lastActive: string;
  avatar?: string;
}

interface Role {
  id: string;
  name: string;
  type: 'system' | 'custom';
  scope: string;
  description: string;
  userCount: number;
  status: 'active' | 'deprecated';
  permissions: string[];
  createdAt: string;
  requiresApproval: boolean;
}

interface Permission {
  id: string;
  module: string;
  feature: string;
  action: string;
  condition?: string;
  riskLevel: 'low' | 'medium' | 'high';
}

interface AccessScope {
  id: string;
  type: 'global' | 'event' | 'program' | 'award' | 'region';
  name: string;
  description: string;
  entities: string[];
}

interface RoleAssignment {
  id: string;
  userId: string;
  userName: string;
  roleId: string;
  roleName: string;
  scope: string;
  assignedBy: string;
  assignedDate: string;
  expiresAt?: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  details: string;
  ipAddress: string;
  status: 'success' | 'failed';
}

export const UsersRolesAccessPage = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<SectionType>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showAccessPreview, setShowAccessPreview] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const [users] = useState<User[]>([
    {
      id: 'U001',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@nisau.org',
      roles: ['Super Admin', 'Event Manager'],
      scopes: ['Global'],
      status: 'active',
      lastActive: '2 hours ago'
    },
    {
      id: 'U002',
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@nisau.org',
      roles: ['Event Manager'],
      scopes: ['Event: Annual Conference 2024'],
      status: 'active',
      lastActive: '1 day ago'
    },
    {
      id: 'U003',
      name: 'Priya Patel',
      email: 'priya.patel@nisau.org',
      roles: ['Awards Manager', 'Jury Coordinator'],
      scopes: ['Award: Student Excellence 2024'],
      status: 'active',
      lastActive: '3 hours ago'
    },
    {
      id: 'U004',
      name: 'Mohammed Ali',
      email: 'mohammed.ali@nisau.org',
      roles: ['Jury Member'],
      scopes: ['Award: Student Excellence 2024'],
      status: 'active',
      lastActive: '5 days ago'
    },
    {
      id: 'U005',
      name: 'Emma Thompson',
      email: 'emma.thompson@nisau.org',
      roles: ['Volunteer Coordinator'],
      scopes: ['Region: London'],
      status: 'suspended',
      lastActive: '2 weeks ago'
    },
    {
      id: 'U006',
      name: 'David Chen',
      email: 'david.chen@nisau.org',
      roles: ['Finance Manager'],
      scopes: ['Global'],
      status: 'active',
      lastActive: '30 minutes ago'
    }
  ]);

  const [roles] = useState<Role[]>([
    {
      id: 'R001',
      name: 'Super Admin',
      type: 'system',
      scope: 'Global',
      description: 'Full system access with all permissions',
      userCount: 2,
      status: 'active',
      permissions: ['all'],
      createdAt: '2023-01-15',
      requiresApproval: true
    },
    {
      id: 'R002',
      name: 'Event Manager',
      type: 'custom',
      scope: 'Event-specific',
      description: 'Manage events, registrations, and event communications',
      userCount: 15,
      status: 'active',
      permissions: ['events.create', 'events.edit', 'registrations.manage'],
      createdAt: '2023-02-20',
      requiresApproval: false
    },
    {
      id: 'R003',
      name: 'Awards Manager',
      type: 'custom',
      scope: 'Award-specific',
      description: 'Create and manage awards, nominations, and jury',
      userCount: 8,
      status: 'active',
      permissions: ['awards.create', 'awards.manage', 'jury.assign'],
      createdAt: '2023-03-10',
      requiresApproval: true
    },
    {
      id: 'R004',
      name: 'Jury Member',
      type: 'custom',
      scope: 'Award-specific',
      description: 'Review and evaluate award nominations',
      userCount: 45,
      status: 'active',
      permissions: ['nominations.view', 'nominations.evaluate'],
      createdAt: '2023-03-15',
      requiresApproval: false
    },
    {
      id: 'R005',
      name: 'Finance Manager',
      type: 'custom',
      scope: 'Global',
      description: 'Manage financial transactions and reporting',
      userCount: 5,
      status: 'active',
      permissions: ['finance.view', 'finance.create', 'finance.export'],
      createdAt: '2023-04-01',
      requiresApproval: true
    }
  ]);

  const [permissions] = useState<Permission[]>([
    // Events Module
    { id: 'P001', module: 'Events', feature: 'Events', action: 'Create', riskLevel: 'medium' },
    { id: 'P002', module: 'Events', feature: 'Events', action: 'Edit', condition: 'Only own events', riskLevel: 'low' },
    { id: 'P003', module: 'Events', feature: 'Events', action: 'Delete', riskLevel: 'high' },
    { id: 'P004', module: 'Events', feature: 'Registrations', action: 'View', riskLevel: 'low' },
    { id: 'P005', module: 'Events', feature: 'Registrations', action: 'Manage', riskLevel: 'medium' },
    { id: 'P006', module: 'Events', feature: 'Registrations', action: 'Export', condition: 'Approval required', riskLevel: 'high' },
    
    // People Module
    { id: 'P007', module: 'People', feature: 'Profiles', action: 'View', condition: 'Masked PII', riskLevel: 'low' },
    { id: 'P008', module: 'People', feature: 'Profiles', action: 'Edit', riskLevel: 'medium' },
    { id: 'P009', module: 'People', feature: 'Profiles', action: 'Delete', riskLevel: 'high' },
    { id: 'P010', module: 'People', feature: 'Personal Data', action: 'Export', condition: 'Approval required', riskLevel: 'high' },
    
    // Communications Module
    { id: 'P011', module: 'Communications', feature: 'Email Campaigns', action: 'Create', riskLevel: 'medium' },
    { id: 'P012', module: 'Communications', feature: 'Email Campaigns', action: 'Send', condition: 'Approval required', riskLevel: 'high' },
    { id: 'P013', module: 'Communications', feature: 'SMS', action: 'Send', riskLevel: 'high' },
    
    // Awards Module
    { id: 'P014', module: 'Awards', feature: 'Awards', action: 'Create', riskLevel: 'medium' },
    { id: 'P015', module: 'Awards', feature: 'Nominations', action: 'View', riskLevel: 'low' },
    { id: 'P016', module: 'Awards', feature: 'Nominations', action: 'Evaluate', riskLevel: 'medium' },
    { id: 'P017', module: 'Awards', feature: 'Jury', action: 'Assign', riskLevel: 'medium' },
    
    // Finance Module
    { id: 'P018', module: 'Finance', feature: 'Transactions', action: 'View', riskLevel: 'medium' },
    { id: 'P019', module: 'Finance', feature: 'Transactions', action: 'Create', riskLevel: 'high' },
    { id: 'P020', module: 'Finance', feature: 'Transactions', action: 'Export', condition: 'Approval required', riskLevel: 'high' }
  ]);

  const [scopes] = useState<AccessScope[]>([
    {
      id: 'S001',
      type: 'global',
      name: 'Global Access',
      description: 'Access to all resources across the platform',
      entities: ['All Events', 'All Awards', 'All People']
    },
    {
      id: 'S002',
      type: 'event',
      name: 'Annual Conference 2024',
      description: 'Limited to this specific event',
      entities: ['Event', 'Registrations', 'Attendees']
    },
    {
      id: 'S003',
      type: 'award',
      name: 'Student Excellence Awards 2024',
      description: 'Limited to this award program',
      entities: ['Nominations', 'Jury', 'Winners']
    },
    {
      id: 'S004',
      type: 'region',
      name: 'London Region',
      description: 'Events and programs in London',
      entities: ['Events', 'People', 'Volunteers']
    },
    {
      id: 'S005',
      type: 'program',
      name: 'Innovation Program 2024',
      description: 'Multi-event program scope',
      entities: ['3 Events', 'Participants', 'Resources']
    }
  ]);

  const [assignments] = useState<RoleAssignment[]>([
    { id: 'A001', userId: 'U001', userName: 'Sarah Johnson', roleId: 'R001', roleName: 'Super Admin', scope: 'Global', assignedBy: 'System', assignedDate: '2023-01-15', expiresAt: undefined },
    { id: 'A002', userId: 'U001', userName: 'Sarah Johnson', roleId: 'R002', roleName: 'Event Manager', scope: 'Global', assignedBy: 'Admin', assignedDate: '2023-02-01', expiresAt: undefined },
    { id: 'A003', userId: 'U002', userName: 'Rajesh Kumar', roleId: 'R002', roleName: 'Event Manager', scope: 'Event: Annual Conference 2024', assignedBy: 'Sarah Johnson', assignedDate: '2024-03-15', expiresAt: '2024-12-31' },
    { id: 'A004', userId: 'U003', userName: 'Priya Patel', roleId: 'R003', roleName: 'Awards Manager', scope: 'Award: Student Excellence 2024', assignedBy: 'Sarah Johnson', assignedDate: '2024-04-01', expiresAt: '2024-12-31' },
    { id: 'A005', userId: 'U004', userName: 'Mohammed Ali', roleId: 'R004', roleName: 'Jury Member', scope: 'Award: Student Excellence 2024', assignedBy: 'Priya Patel', assignedDate: '2024-05-10', expiresAt: '2024-11-30' },
    { id: 'A006', userId: 'U005', userName: 'Emma Thompson', roleId: 'R006', roleName: 'Volunteer Coordinator', scope: 'Region: London', assignedBy: 'Admin', assignedDate: '2024-02-20', expiresAt: undefined },
    { id: 'A007', userId: 'U006', userName: 'David Chen', roleId: 'R005', roleName: 'Finance Manager', scope: 'Global', assignedBy: 'Sarah Johnson', assignedDate: '2024-04-01', expiresAt: undefined },
    { id: 'A008', userId: 'U003', userName: 'Priya Patel', roleId: 'R007', roleName: 'Jury Coordinator', scope: 'Award: Student Excellence 2024', assignedBy: 'Sarah Johnson', assignedDate: '2024-04-01', expiresAt: '2024-12-31' }
  ]);

  const [auditLogs] = useState<AuditLog[]>([
    { id: 'L001', timestamp: '2024-12-20 14:32:15', actor: 'Sarah Johnson', action: 'Assigned Role', target: 'Rajesh Kumar → Event Manager', details: 'Scope: Annual Conference 2024', ipAddress: '192.168.1.45', status: 'success' },
    { id: 'L002', timestamp: '2024-12-20 13:15:22', actor: 'Sarah Johnson', action: 'Created Role', target: 'Communications Manager', details: 'Custom role with email permissions', ipAddress: '192.168.1.45', status: 'success' },
    { id: 'L003', timestamp: '2024-12-20 11:42:10', actor: 'Admin', action: 'Suspended User', target: 'Emma Thompson', details: 'Reason: Policy violation', ipAddress: '192.168.1.12', status: 'success' },
    { id: 'L004', timestamp: '2024-12-20 10:20:05', actor: 'Priya Patel', action: 'Invited User', target: 'john.doe@nisau.org', details: 'Role: Jury Member', ipAddress: '92.45.123.89', status: 'success' },
    { id: 'L005', timestamp: '2024-12-19 16:55:33', actor: 'David Chen', action: 'Modified Permissions', target: 'Finance Manager role', details: 'Added export permission', ipAddress: '185.23.45.67', status: 'success' },
    { id: 'L006', timestamp: '2024-12-19 14:12:18', actor: 'Unknown', action: 'Failed Login', target: 'admin@nisau.org', details: 'Invalid credentials (3rd attempt)', ipAddress: '45.89.120.34', status: 'failed' },
    { id: 'L007', timestamp: '2024-12-19 11:30:42', actor: 'Sarah Johnson', action: 'Reset 2FA', target: 'Rajesh Kumar', details: 'User requested reset', ipAddress: '192.168.1.45', status: 'success' },
    { id: 'L008', timestamp: '2024-12-19 09:15:11', actor: 'System', action: 'Role Expired', target: 'Mohammed Ali → Jury Member', details: 'Auto-removed due to expiration', ipAddress: 'System', status: 'success' },
    { id: 'L009', timestamp: '2024-12-18 17:22:55', actor: 'Sarah Johnson', action: 'Impersonated User', target: 'Priya Patel', details: 'Troubleshooting access issue', ipAddress: '192.168.1.45', status: 'success' },
    { id: 'L010', timestamp: '2024-12-18 15:10:33', actor: 'Admin', action: 'Enabled 2FA', target: 'Global Security Policy', details: 'Enforced for all admin roles', ipAddress: '192.168.1.12', status: 'success' }
  ]);

  const sidebarItems = [
    { id: 'users' as SectionType, icon: Users, label: 'Users Management', status: 'configured' },
    { id: 'roles' as SectionType, icon: Shield, label: 'Roles & Responsibilities', status: 'configured' },
    { id: 'permissions' as SectionType, icon: Grid3x3, label: 'Permissions Matrix', status: 'configured' },
    { id: 'scopes' as SectionType, icon: Globe, label: 'Access Scopes', status: 'configured' },
    { id: 'assignments' as SectionType, icon: UserCog, label: 'Role Assignments', status: 'configured' },
    { id: 'approvals' as SectionType, icon: CheckSquare, label: 'Approval Policies', status: 'configured' },
    { id: 'security' as SectionType, icon: Lock, label: 'Security & Authentication', status: 'configured' },
    { id: 'audit' as SectionType, icon: Activity, label: 'Access Audit Logs', status: 'configured' }
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      active: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle2 },
      suspended: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: XCircle },
      invited: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: Mail },
      deprecated: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', icon: XCircle }
    };
    const config = configs[status as keyof typeof configs];
    const Icon = config.icon;
    
    return (
      <Badge variant="outline" className={`${config.bg} ${config.text} ${config.border} text-xs`}>
        <Icon size={10} className="mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getRiskBadge = (riskLevel: string) => {
    const configs = {
      low: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
      medium: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
      high: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' }
    };
    const config = configs[riskLevel as keyof typeof configs];
    
    return (
      <Badge variant="outline" className={`${config.bg} ${config.text} ${config.border} text-xs`}>
        {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto px-8 py-5">
          <div className="flex items-center gap-2 mb-3 text-sm">
            <button
              onClick={() => navigate('/settings')}
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Settings
            </button>
            <span className="text-slate-400">→</span>
            <span className="text-slate-900 font-medium">Users, Roles & Access</span>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 mb-1">
                Users, Roles & Access
              </h1>
              <p className="text-sm text-slate-500">
                Comprehensive RBAC system with granular permissions and access control
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2">
                <Download size={16} />
                Export Users
              </Button>
              <Button className="gap-2" onClick={() => setShowInviteDialog(true)}>
                <UserPlus size={16} />
                Invite User
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Layout Container */}
      <div className="max-w-[1600px] mx-auto px-8 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="col-span-3">
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden sticky top-24">
              {/* Search */}
              <div className="p-4 border-b border-slate-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={14} />
                  <Input
                    placeholder="Search sections..."
                    className="pl-9 text-sm h-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Navigation */}
              <nav className="p-2">
                {sidebarItems.map((item) => {
                  const isActive = activeSection === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg mb-1 transition-all text-sm flex items-center justify-between",
                        isActive
                          ? "bg-blue-50 text-blue-900 border border-blue-200"
                          : "text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Icon size={14} />
                        <span className={isActive ? 'font-medium' : ''}>{item.label}</span>
                      </div>
                      {item.status === 'configured' && (
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Right Content Panel */}
          <div className="col-span-9">
            {activeSection === 'users' && (
              <UsersSection
                users={users}
                getStatusBadge={getStatusBadge}
                getInitials={getInitials}
                setShowInviteDialog={setShowInviteDialog}
                setSelectedUser={setSelectedUser}
              />
            )}

            {activeSection === 'roles' && (
              <RolesSection
                roles={roles}
                getStatusBadge={getStatusBadge}
                setShowRoleDialog={setShowRoleDialog}
                setSelectedRole={setSelectedRole}
              />
            )}

            {activeSection === 'permissions' && (
              <PermissionsSection
                permissions={permissions}
                getRiskBadge={getRiskBadge}
              />
            )}

            {activeSection === 'scopes' && (
              <ScopesSection scopes={scopes} />
            )}

            {activeSection === 'assignments' && (
              <AssignmentsSection assignments={assignments} />
            )}

            {activeSection === 'approvals' && (
              <ApprovalsSection />
            )}

            {activeSection === 'security' && (
              <SecuritySection />
            )}

            {activeSection === 'audit' && (
              <AuditSection auditLogs={auditLogs} getStatusBadge={getStatusBadge} />
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <InviteUserDialog open={showInviteDialog} onOpenChange={setShowInviteDialog} />
      <CreateRoleDialog open={showRoleDialog} onOpenChange={setShowRoleDialog} />
    </div>
  );
};

// ==================== SECTION COMPONENTS ====================

const UsersSection = ({ users, getStatusBadge, getInitials, setShowInviteDialog, setSelectedUser }: any) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-1">Users Management</h2>
            <p className="text-sm text-slate-500">Manage platform users and their access permissions</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {users.filter((u: User) => u.status === 'active').length} Active Users
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
          <Input
            placeholder="Search users by name or email..."
            className="pl-10"
            value={userSearchQuery}
            onChange={(e) => setUserSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="invited">Invited</SelectItem>
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="super-admin">Super Admin</SelectItem>
            <SelectItem value="event-manager">Event Manager</SelectItem>
            <SelectItem value="awards-manager">Awards Manager</SelectItem>
            <SelectItem value="jury">Jury Member</SelectItem>
          </SelectContent>
        </Select>
        <Button className="gap-2 ml-auto" onClick={() => setShowInviteDialog(true)}>
          <UserPlus size={16} />
          Invite User
        </Button>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Roles</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Scopes</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Last Active</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user: User) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-medium">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-slate-900">{user.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-slate-600">{user.email}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 flex-wrap">
                    {user.roles.map((role, idx) => (
                      <Badge key={idx} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 flex-wrap">
                    {user.scopes.map((scope, idx) => (
                      <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                        {scope}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {getStatusBadge(user.status)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 text-sm text-slate-600">
                    <Clock size={14} className="text-slate-400" />
                    {user.lastActive}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical size={14} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                        <Edit size={14} className="mr-2" />
                        Edit User
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Eye size={14} className="mr-2" />
                        Impersonate
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <RefreshCw size={14} className="mr-2" />
                        Reset 2FA
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Activity size={14} className="mr-2" />
                        Activity Log
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {user.status === 'active' ? (
                        <DropdownMenuItem className="text-red-600">
                          <Ban size={14} className="mr-2" />
                          Suspend User
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem className="text-green-600">
                          <Check size={14} className="mr-2" />
                          Activate User
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info size={20} className="text-blue-600 mt-0.5 shrink-0" />
          <div className="text-sm text-blue-900">
            <strong>User Management Best Practices:</strong> Always assign roles with the minimum required permissions. Use scopes to limit access to specific events, awards, or regions. Review user access regularly.
          </div>
        </div>
      </div>
    </div>
  );
};

const RolesSection = ({ roles, getStatusBadge, setShowRoleDialog, setSelectedRole }: any) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-1">Roles & Responsibilities</h2>
            <p className="text-sm text-slate-500">Define roles and their associated permissions</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
              {roles.filter((r: Role) => r.type === 'system').length} System Roles
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {roles.filter((r: Role) => r.type === 'custom').length} Custom Roles
            </Badge>
          </div>
        </div>
      </div>

      {/* Create Role Button */}
      <div className="flex justify-end">
        <Button className="gap-2" onClick={() => setShowRoleDialog(true)}>
          <Plus size={16} />
          Create Custom Role
        </Button>
      </div>

      {/* Roles Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Role Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Scope</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Description</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Users</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {roles.map((role: Role) => (
              <tr key={role.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Shield size={16} className="text-slate-400" />
                    <span className="font-medium text-slate-900">{role.name}</span>
                    {role.requiresApproval && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <ShieldAlert size={14} className="text-amber-600" />
                          </TooltipTrigger>
                          <TooltipContent>Requires approval to assign</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={
                    role.type === 'system' 
                      ? 'bg-slate-50 text-slate-700 border-slate-200' 
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }>
                    {role.type === 'system' ? 'System' : 'Custom'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-slate-600">{role.scope}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-slate-600">{role.description}</span>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    {role.userCount} {role.userCount === 1 ? 'user' : 'users'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {getStatusBadge(role.status)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" className="h-8" onClick={() => setSelectedRole(role)}>
                      <Edit size={14} className="mr-1" />
                      Edit
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical size={14} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem>
                          <Eye size={14} className="mr-2" />
                          View Permissions
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy size={14} className="mr-2" />
                          Clone Role
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {role.type === 'custom' && (
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 size={14} className="mr-2" />
                            Deprecate Role
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PermissionsSection = ({ permissions, getRiskBadge }: any) => {
  const [expandedModules, setExpandedModules] = useState<string[]>(['Events']);

  const groupedPermissions = permissions.reduce((acc: any, perm: Permission) => {
    if (!acc[perm.module]) {
      acc[perm.module] = [];
    }
    acc[perm.module].push(perm);
    return acc;
  }, {});

  const toggleModule = (module: string) => {
    setExpandedModules(prev =>
      prev.includes(module)
        ? prev.filter(m => m !== module)
        : [...prev, module]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Permissions Matrix</h2>
        <p className="text-sm text-slate-500">Granular permissions available across all platform modules</p>
      </div>

      {/* Permissions by Module */}
      <div className="space-y-3">
        {Object.entries(groupedPermissions).map(([module, perms]: [string, any]) => (
          <div key={module} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleModule(module)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {expandedModules.includes(module) ? (
                  <ChevronDown size={18} className="text-slate-400" />
                ) : (
                  <ChevronRight size={18} className="text-slate-400" />
                )}
                <span className="font-semibold text-slate-900">{module}</span>
                <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                  {perms.length} permissions
                </Badge>
              </div>
            </button>

            {expandedModules.includes(module) && (
              <div className="border-t border-slate-200">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Feature</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Action</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Condition</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Risk Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {perms.map((perm: Permission) => (
                      <tr key={perm.id} className="hover:bg-slate-50">
                        <td className="px-6 py-3">
                          <span className="text-sm font-medium text-slate-900">{perm.feature}</span>
                        </td>
                        <td className="px-6 py-3">
                          <span className="text-sm text-slate-600">{perm.action}</span>
                        </td>
                        <td className="px-6 py-3">
                          {perm.condition ? (
                            <span className="text-xs text-slate-500 italic">{perm.condition}</span>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-3">
                          {getRiskBadge(perm.riskLevel)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Info Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="text-amber-600 mt-0.5 shrink-0" />
          <div className="text-sm text-amber-900">
            <strong>Permission Risk Levels:</strong> High-risk permissions require approval and are audited. Always assign the minimum necessary permissions to each role.
          </div>
        </div>
      </div>
    </div>
  );
};

const ScopesSection = ({ scopes }: any) => {
  const getScopeTypeBadge = (type: string) => {
    const configs = {
      global: 'bg-blue-50 text-blue-700 border-blue-200',
      event: 'bg-green-50 text-green-700 border-green-200',
      program: 'bg-purple-50 text-purple-700 border-purple-200',
      award: 'bg-pink-50 text-pink-700 border-pink-200',
      region: 'bg-orange-50 text-orange-700 border-orange-200'
    };
    
    return (
      <Badge variant="outline" className={configs[type as keyof typeof configs]}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Access Scopes</h2>
        <p className="text-sm text-slate-500">Define resource boundaries for role assignments</p>
      </div>

      {/* Scopes Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Scope Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Description</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Entities</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {scopes.map((scope: AccessScope) => (
              <tr key={scope.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <span className="font-medium text-slate-900">{scope.name}</span>
                </td>
                <td className="px-4 py-3">
                  {getScopeTypeBadge(scope.type)}
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-slate-600">{scope.description}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 flex-wrap">
                    {scope.entities.map((entity, idx) => (
                      <Badge key={idx} variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 text-xs">
                        {entity}
                      </Badge>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AssignmentsSection = ({ assignments }: any) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Role Assignments</h2>
        <p className="text-sm text-slate-500">Track all role assignments and their expiration dates</p>
      </div>

      {/* Assignments Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Role</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Scope</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Assigned By</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Expires</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {assignments.map((assignment: RoleAssignment) => (
              <tr key={assignment.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <span className="font-medium text-slate-900">{assignment.userName}</span>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    {assignment.roleName}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-slate-600">{assignment.scope}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-slate-600">{assignment.assignedBy}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-slate-600">{assignment.assignedDate}</span>
                </td>
                <td className="px-4 py-3">
                  {assignment.expiresAt ? (
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-amber-600" />
                      <span className="text-sm text-amber-700">{assignment.expiresAt}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-400">Never</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="sm" className="h-8">
                    <Eye size={14} className="mr-1" />
                    Preview Access
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ApprovalsSection = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Approval Policies</h2>
        <p className="text-sm text-slate-500">Configure approval workflows for sensitive role assignments</p>
      </div>
      <div className="p-12 text-center bg-white border border-slate-200 rounded-lg">
        <CheckSquare className="mx-auto text-slate-400 mb-4" size={48} />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Approval Policies Configuration</h3>
        <p className="text-sm text-slate-500">Approval workflow settings will be configured here</p>
      </div>
    </div>
  );
};

const SecuritySection = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Security & Authentication</h2>
        <p className="text-sm text-slate-500">Configure authentication and security policies</p>
      </div>
      <div className="p-12 text-center bg-white border border-slate-200 rounded-lg">
        <Lock className="mx-auto text-slate-400 mb-4" size={48} />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Security Settings</h3>
        <p className="text-sm text-slate-500">2FA, session timeout, and password policies will be configured here</p>
      </div>
    </div>
  );
};

const AuditSection = ({ auditLogs, getStatusBadge }: any) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-1">Access Audit Logs</h2>
            <p className="text-sm text-slate-500">Complete audit trail of all access control changes</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download size={16} />
            Export Logs
          </Button>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Timestamp</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Actor</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Action</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Target</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Details</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">IP Address</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {auditLogs.map((log: AuditLog) => (
              <tr key={log.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <span className="text-sm font-mono text-slate-600">{log.timestamp}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-slate-900">{log.actor}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-slate-900">{log.action}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-slate-600">{log.target}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-slate-500">{log.details}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-mono text-slate-600">{log.ipAddress}</span>
                </td>
                <td className="px-4 py-3">
                  {getStatusBadge(log.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ==================== DIALOGS ====================

const InviteUserDialog = ({ open, onOpenChange }: any) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Invite New User</DialogTitle>
          <DialogDescription>
            Send an invitation to join your organization with specific roles and permissions
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name *</Label>
              <Input placeholder="Enter first name" />
            </div>
            <div className="space-y-2">
              <Label>Last Name *</Label>
              <Input placeholder="Enter last name" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email Address *</Label>
            <Input type="email" placeholder="user@organization.com" />
          </div>

          <div className="space-y-2">
            <Label>Assign Roles *</Label>
            <div className="space-y-2 p-4 border border-slate-200 rounded-lg max-h-48 overflow-y-auto">
              <div className="flex items-center gap-2">
                <Checkbox id="role-admin" />
                <label htmlFor="role-admin" className="text-sm flex-1">Super Admin</label>
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">Requires Approval</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="role-event" />
                <label htmlFor="role-event" className="text-sm">Event Manager</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="role-awards" />
                <label htmlFor="role-awards" className="text-sm flex-1">Awards Manager</label>
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">Requires Approval</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="role-jury" />
                <label htmlFor="role-jury" className="text-sm">Jury Member</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="role-finance" />
                <label htmlFor="role-finance" className="text-sm flex-1">Finance Manager</label>
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">Requires Approval</Badge>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Access Scope</Label>
            <Select defaultValue="global">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">Global Access</SelectItem>
                <SelectItem value="event">Event-Specific</SelectItem>
                <SelectItem value="award">Award-Specific</SelectItem>
                <SelectItem value="region">Region-Specific</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Personal Message (Optional)</Label>
            <Textarea rows={3} placeholder="Add a welcome message..." />
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Info size={16} className="text-blue-600 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-900">
                The user will receive an email invitation with a secure link to set up their account. They must complete setup within 7 days.
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => {
            toast.success('Invitation sent successfully');
            onOpenChange(false);
          }}>
            Send Invitation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const CreateRoleDialog = ({ open, onOpenChange }: any) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Custom Role</DialogTitle>
          <DialogDescription>
            Define a new role with specific permissions and scope
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Role Name *</Label>
            <Input placeholder="e.g., Communications Manager" />
          </div>

          <div className="space-y-2">
            <Label>Description *</Label>
            <Textarea rows={2} placeholder="Describe this role's responsibilities..." />
          </div>

          <div className="space-y-2">
            <Label>Default Scope</Label>
            <Select defaultValue="event">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">Global</SelectItem>
                <SelectItem value="event">Event-Specific</SelectItem>
                <SelectItem value="award">Award-Specific</SelectItem>
                <SelectItem value="region">Region-Specific</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="require-approval" />
            <label htmlFor="require-approval" className="text-sm">Require approval to assign this role</label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => {
            toast.success('Role created successfully');
            onOpenChange(false);
          }}>
            Create Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
