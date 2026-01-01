import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Save, X, MoreVertical, AlertTriangle, CheckCircle2,
  Mail, Phone, Briefcase, GraduationCap, Shield, Eye,
  Calendar, User, Users, Award, Activity, Edit3, Upload, Lock,
  Trash2, GitMerge, Globe, Building, Tag, Clock, UserCheck,
  Bell, Info, ShieldCheck, AlertCircle, Check, Plus, FileText
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { toast } from 'sonner';

interface EditPersonPageProps {
  onBack?: () => void;
}

export function EditPersonPage({ onBack }: EditPersonPageProps) {
  const navigate = useNavigate();
  const { id } = useParams();

  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [showEmailChangeDialog, setShowEmailChangeDialog] = useState(false);
  const [showRemoveAssocDialog, setShowRemoveAssocDialog] = useState(false);
  const [selectedAssociation, setSelectedAssociation] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+44 20 1234 5678',
    profilePhoto: '',
    recordStatus: 'active',
    publicVisibility: 'public',
    showOnWebsite: true,
    allowSpeakerListing: true,
    allowProfileInEmails: true,
    eventComms: true,
    awardsComms: true,
    newsletters: true,
    primaryClassification: 'alumni',
    secondaryRoles: ['speaker', 'jury_member'],
    university: 'University of Cambridge',
    degree: 'MSc',
    fieldOfStudy: 'Computer Science',
    graduationYear: '2018',
    studyCountry: 'United Kingdom',
    organization: 'TechCorp Industries',
    jobTitle: 'Senior Software Architect',
    industry: 'technology',
    yearsExperience: '8',
    linkedinUrl: 'https://linkedin.com/in/sarahjohnson',
    websiteUrl: 'https://sarahjohnson.dev',
  });

  const systemMetrics = {
    activeEvents: 5,
    juryAssignments: 2,
    historicalEmails: 47,
    lastEmailSent: '2024-12-15 14:32',
    totalEmailsSent: 47,
    bounceStatus: 'healthy',
    verificationStatus: 'verified',
    identitySource: 'University SSO',
    verifiedBy: 'System',
    verifiedOn: '2024-01-10',
    createdBy: 'Admin User',
    createdOn: '2024-01-10 09:15',
    lastUpdatedBy: 'Sarah Johnson',
    lastUpdatedOn: '2024-12-15 10:22',
    totalEventsLinked: 12,
  };

  const associations = [
    {
      id: 'assoc-1',
      type: 'event',
      name: 'Global Tech Summit 2024',
      role: 'Speaker',
      status: 'confirmed',
      constraint: 'ticket-issued',
      canRemove: false,
    },
    {
      id: 'assoc-2',
      type: 'award',
      name: 'Innovation Awards 2024',
      role: 'Jury Member',
      status: 'active',
      constraint: 'public-listing',
      canRemove: false,
    },
    {
      id: 'assoc-3',
      type: 'event',
      name: 'Alumni Networking Mixer',
      role: 'Attendee',
      status: 'invited',
      constraint: null,
      canRemove: true,
    },
    {
      id: 'assoc-4',
      type: 'dialogue',
      name: 'Future of AI Discussion',
      role: 'Panelist',
      status: 'confirmed',
      constraint: 'public-listing',
      canRemove: false,
    },
  ];

  const isHighRisk = systemMetrics.activeEvents >= 3 || systemMetrics.juryAssignments >= 1;

  const handleSave = () => {
    toast.success('Person record updated successfully');
  };

  const handleSaveDraft = () => {
    toast.success('Draft saved');
  };

  const handleDiscard = () => {
    if (confirm('Discard all changes?')) {
      navigate('/people');
    }
  };

  const handleRequestEmailChange = () => {
    setShowEmailChangeDialog(true);
  };

  const handleRemoveAssociation = (assocId: string) => {
    setSelectedAssociation(assocId);
    setShowRemoveAssocDialog(true);
  };

  const confirmRemoveAssociation = () => {
    toast.success('Association removed');
    setShowRemoveAssocDialog(false);
    setSelectedAssociation(null);
  };

  const getAssociationIcon = (type: string) => {
    switch (type) {
      case 'event': return <Calendar size={16} />;
      case 'award': return <Award size={16} />;
      case 'dialogue': return <Users size={16} />;
      default: return <FileText size={16} />;
    }
  };

  const getConstraintBadge = (constraint: string | null) => {
    if (!constraint) return null;
    
    const badges: Record<string, { label: string; className: string }> = {
      'ticket-issued': { label: 'Ticket Issued', className: 'bg-orange-100 text-orange-700 border-orange-200' },
      'public-listing': { label: 'Public Listing Active', className: 'bg-purple-100 text-purple-700 border-purple-200' },
    };

    const config = badges[constraint];
    if (!config) return null;

    return (
      <Badge variant="outline" className={`${config.className} text-xs`}>
        <Lock size={10} className="mr-1" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* STICKY HEADER (Glass Morphism) */}
      <header className="sticky top-0 z-10 bg-[#f9f9f9]/90 backdrop-blur-sm border-b border-slate-200/60 px-8 py-4 mb-6">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex flex-col gap-1">
            {/* Breadcrumb */}
            <div className="flex items-center text-sm text-slate-500 mb-1">
              <button 
                onClick={() => navigate('/people')}
                className="mr-2 hover:text-slate-800 transition-colors"
              >
                <ArrowLeft size={16} />
              </button>
              <span className="cursor-pointer hover:text-slate-700" onClick={() => navigate('/people')}>People</span>
              <span className="mx-1">/</span>
              <span className="cursor-pointer hover:text-slate-700" onClick={() => navigate('/people')}>People List</span>
              <span className="mx-1">/</span>
              <span className="text-slate-900">Edit Person</span>
            </div>
            
            {/* Title with High-Risk Badge */}
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#1d293d] tracking-tight">Edit Person</h1>
              {isHighRisk && (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  <AlertTriangle size={12} className="mr-1" />
                  High-risk edits
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-slate-500 mt-0.5">
              Manage a unified People record across events, awards, communications, and reporting
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              onClick={handleDiscard}
              className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            >
              <X size={16} className="mr-2" />
              Discard Changes
            </Button>
            <Button 
              variant="outline"
              onClick={handleSaveDraft}
              className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              <Save size={16} className="mr-2" />
              Save Draft
            </Button>
            <Button 
              className="bg-[#0f172b] hover:bg-[#0f172b]/90 text-white min-w-[120px] shadow-sm" 
              onClick={handleSave}
            >
              <CheckCircle2 size={16} className="mr-2" />
              Save Changes
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical size={18} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setShowDeactivateDialog(true)}>
                  <Lock size={14} className="mr-2" />
                  Deactivate Person
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <GitMerge size={14} className="mr-2" />
                  Merge Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Activity size={14} className="mr-2" />
                  View Activity Log
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* TWO-COLUMN LAYOUT */}
      <div className="max-w-[1600px] mx-auto px-8 py-0">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          {/* LEFT COLUMN - Editable Fields */}
          <div className="space-y-6">
            
            {/* HIGH-RISK WARNING (Conditional) */}
            {isHighRisk && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-orange-600 shrink-0 mt-0.5" size={18} />
                  <div className="text-sm text-orange-900">
                    <p className="font-medium mb-1">This person is linked to:</p>
                    <ul className="list-disc list-inside text-orange-700 space-y-0.5">
                      <li>{systemMetrics.activeEvents} active events</li>
                      <li>{systemMetrics.juryAssignments} jury assignments</li>
                      <li>{systemMetrics.historicalEmails} historical emails</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 1: IDENTITY & CONTACT */}
            <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <User className="text-slate-400" size={20} />
                <h3 className="font-bold text-[#1d293d]">Identity & Contact</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-slate-100 transition-colors">
                        <Info size={14} className="text-slate-400" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <p className="text-xs">Core identity used for emails, tickets, awards, and public visibility</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="space-y-4">
                {/* Profile Photo */}
                <div className="space-y-2">
                  <Label className="text-slate-700">Profile Photo</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-200">
                      <User className="text-slate-400" size={32} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button type="button" variant="outline" size="sm">
                        <Upload size={14} className="mr-2" />
                        Replace Photo
                      </Button>
                      <p className="text-xs text-slate-500">JPG or PNG. Max 5MB. 400x400px recommended</p>
                    </div>
                  </div>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-700">First Name <span className="text-red-500">*</span></Label>
                    <Input 
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700">Last Name <span className="text-red-500">*</span></Label>
                    <Input 
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="bg-white"
                    />
                  </div>
                </div>

                {/* Email - LOCKED */}
                <div className="space-y-2">
                  <Label className="text-slate-700 flex items-center gap-2">
                    Email Address
                    <Lock size={12} className="text-slate-400" />
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={formData.email}
                      disabled
                      className="bg-slate-50 text-slate-500"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={handleRequestEmailChange}
                    >
                      <Edit3 size={14} className="mr-2" />
                      Request Change
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500">Email changes require admin approval to prevent broken links</p>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label className="text-slate-700">Phone Number</Label>
                  <Input 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="bg-white"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: STATUS & VISIBILITY */}
            <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Shield className="text-slate-400" size={20} />
                <h3 className="font-bold text-[#1d293d]">Status & Visibility</h3>
                <Badge variant="outline" className="bg-blue-50 text-blue-600 border-0 text-xs">Governance</Badge>
              </div>

              <div className="space-y-4">
                {/* Record Status */}
                <div className="space-y-2">
                  <Label className="text-slate-700">Record Status</Label>
                  <Select value={formData.recordStatus} onValueChange={(val) => setFormData({...formData, recordStatus: val})}>
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          Active
                        </div>
                      </SelectItem>
                      <SelectItem value="deactivated">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                          Deactivated
                        </div>
                      </SelectItem>
                      <SelectItem value="archived">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                          Archived
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Public Visibility */}
                <div className="space-y-2">
                  <Label className="text-slate-700">Public Visibility</Label>
                  <Select value={formData.publicVisibility} onValueChange={(val) => setFormData({...formData, publicVisibility: val})}>
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internal">
                        <div className="flex items-center gap-2">
                          <Lock size={14} />
                          Internal Only
                        </div>
                      </SelectItem>
                      <SelectItem value="public">
                        <div className="flex items-center gap-2">
                          <Globe size={14} />
                          Public (Approved)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Visibility Toggles */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Globe className="text-slate-400" size={18} />
                      <div>
                        <p className="text-sm text-slate-700">Show on public website</p>
                        <p className="text-xs text-slate-500">Appears in alumni/member directories</p>
                      </div>
                    </div>
                    <Switch 
                      checked={formData.showOnWebsite}
                      onCheckedChange={(val) => setFormData({...formData, showOnWebsite: val})}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Users className="text-slate-400" size={18} />
                      <div>
                        <p className="text-sm text-slate-700">Allow speaker/jury listing</p>
                        <p className="text-xs text-slate-500">Can be listed publicly for events and awards</p>
                      </div>
                    </div>
                    <Switch 
                      checked={formData.allowSpeakerListing}
                      onCheckedChange={(val) => setFormData({...formData, allowSpeakerListing: val})}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Mail className="text-slate-400" size={18} />
                      <div>
                        <p className="text-sm text-slate-700">Allow profile linking in emails</p>
                        <p className="text-xs text-slate-500">Profile URL can appear in email footers</p>
                      </div>
                    </div>
                    <Switch 
                      checked={formData.allowProfileInEmails}
                      onCheckedChange={(val) => setFormData({...formData, allowProfileInEmails: val})}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: COMMUNICATION & CONSENT */}
            <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Bell className="text-slate-400" size={20} />
                <h3 className="font-bold text-[#1d293d]">Communication & Consent</h3>
                <Badge variant="outline" className="bg-green-50 text-green-600 border-0 text-xs">Consent-aware</Badge>
              </div>

              <div className="space-y-4">
                {/* Communication Preferences */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Calendar className="text-slate-400" size={18} />
                      <div>
                        <p className="text-sm text-slate-700">Event communications</p>
                        <p className="text-xs text-slate-500">Event updates, reminders, tickets</p>
                      </div>
                    </div>
                    <Switch 
                      checked={formData.eventComms}
                      onCheckedChange={(val) => setFormData({...formData, eventComms: val})}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Award className="text-slate-400" size={18} />
                      <div>
                        <p className="text-sm text-slate-700">Awards communications</p>
                        <p className="text-xs text-slate-500">Jury invites, award announcements</p>
                      </div>
                    </div>
                    <Switch 
                      checked={formData.awardsComms}
                      onCheckedChange={(val) => setFormData({...formData, awardsComms: val})}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Mail className="text-slate-400" size={18} />
                      <div>
                        <p className="text-sm text-slate-700">Announcements & newsletters</p>
                        <p className="text-xs text-slate-500">General updates and newsletters</p>
                      </div>
                    </div>
                    <Switch 
                      checked={formData.newsletters}
                      onCheckedChange={(val) => setFormData({...formData, newsletters: val})}
                    />
                  </div>
                </div>

                <Separator />

                {/* Email Statistics (Read-only) */}
                <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">Email Statistics</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Last email sent</span>
                    <span className="text-sm text-slate-900">{systemMetrics.lastEmailSent}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Total emails sent</span>
                    <span className="text-sm text-slate-900">{systemMetrics.totalEmailsSent}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Bounce health status</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-0 text-xs">
                      <CheckCircle2 size={10} className="mr-1" />
                      {systemMetrics.bounceStatus}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 4: CLASSIFICATION & ROLES */}
            <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Tag className="text-slate-400" size={20} />
                <h3 className="font-bold text-[#1d293d]">Classification & Roles</h3>
                <Badge variant="outline" className="bg-purple-50 text-purple-600 border-0 text-xs">Core Logic</Badge>
              </div>

              <div className="space-y-4">
                {/* Primary Classification */}
                <div className="space-y-2">
                  <Label className="text-slate-700">Primary Classification <span className="text-red-500">*</span></Label>
                  <Select value={formData.primaryClassification} onValueChange={(val) => setFormData({...formData, primaryClassification: val})}>
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="alumni">Alumni</SelectItem>
                      <SelectItem value="faculty">Faculty</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="industry">Industry Professional</SelectItem>
                      <SelectItem value="partner">Partner Organization</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Secondary Roles */}
                <div className="space-y-2">
                  <Label className="text-slate-700">Secondary Roles (Multi-select)</Label>
                  <div className="flex flex-wrap gap-2 p-3 border border-slate-200 rounded-lg bg-white min-h-[44px]">
                    {formData.secondaryRoles.map((role) => (
                      <Badge key={role} variant="outline" className="bg-slate-50 text-slate-700 border-slate-300">
                        {role.replace('_', ' ')}
                        <button 
                          type="button"
                          className="ml-1 hover:text-red-600"
                          onClick={() => setFormData({
                            ...formData, 
                            secondaryRoles: formData.secondaryRoles.filter(r => r !== role)
                          })}
                        >
                          <X size={12} />
                        </button>
                      </Badge>
                    ))}
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2 text-xs"
                    >
                      <Plus size={12} className="mr-1" />
                      Add Role
                    </Button>
                  </div>
                </div>

                {/* Role Context Cards */}
                <div className="space-y-2 pt-2">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Active Role Contexts</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-3">
                        <Users className="text-slate-400" size={16} />
                        <div>
                          <p className="text-sm text-slate-900">Speaker</p>
                          <p className="text-xs text-slate-500">Global Tech Summit 2024</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-0 text-xs">
                        Global
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-3">
                        <Award className="text-slate-400" size={16} />
                        <div>
                          <p className="text-sm text-slate-900">Jury Member</p>
                          <p className="text-xs text-slate-500">Innovation Awards 2024</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-0 text-xs">
                        Program
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 5: EDUCATION & ALUMNI DETAILS */}
            <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <GraduationCap className="text-slate-400" size={20} />
                <h3 className="font-bold text-[#1d293d]">Education & Alumni Details</h3>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-700">University / Institution</Label>
                    <Input 
                      value={formData.university}
                      onChange={(e) => setFormData({...formData, university: e.target.value})}
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700">Degree</Label>
                    <Input 
                      value={formData.degree}
                      onChange={(e) => setFormData({...formData, degree: e.target.value})}
                      className="bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-700">Field of Study</Label>
                    <Input 
                      value={formData.fieldOfStudy}
                      onChange={(e) => setFormData({...formData, fieldOfStudy: e.target.value})}
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700">Graduation Year</Label>
                    <Input 
                      value={formData.graduationYear}
                      onChange={(e) => setFormData({...formData, graduationYear: e.target.value})}
                      className="bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700">Study Country</Label>
                  <Select value={formData.studyCountry} onValueChange={(val) => setFormData({...formData, studyCountry: val})}>
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                      <SelectItem value="United States">United States</SelectItem>
                      <SelectItem value="Australia">Australia</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-700 flex items-center gap-2">
                    <Info size={12} />
                    Alumni status auto-updates but is manually overridable
                  </p>
                </div>
              </div>
            </div>

            {/* SECTION 6: PROFESSIONAL & PUBLIC PROFILE */}
            <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Briefcase className="text-slate-400" size={20} />
                <h3 className="font-bold text-[#1d293d]">Professional & Public Profile</h3>
                <Badge variant="outline" className="bg-orange-50 text-orange-600 border-0 text-xs">
                  <Eye size={10} className="mr-1" />
                  May appear publicly
                </Badge>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-700">Organization / Company</Label>
                    <Input 
                      value={formData.organization}
                      onChange={(e) => setFormData({...formData, organization: e.target.value})}
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700">Job Title</Label>
                    <Input 
                      value={formData.jobTitle}
                      onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                      className="bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-700">Industry Category</Label>
                    <Select value={formData.industry} onValueChange={(val) => setFormData({...formData, industry: val})}>
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="consulting">Consulting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700">Years of Experience</Label>
                    <Input 
                      value={formData.yearsExperience}
                      onChange={(e) => setFormData({...formData, yearsExperience: e.target.value})}
                      className="bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700">LinkedIn URL</Label>
                  <Input 
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData({...formData, linkedinUrl: e.target.value})}
                    className="bg-white"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700">Website / Portfolio</Label>
                  <Input 
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData({...formData, websiteUrl: e.target.value})}
                    className="bg-white"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 7: EVENT & PROGRAM ASSOCIATIONS (READ-ONLY) */}
            <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="text-slate-400" size={20} />
                  <h3 className="font-bold text-[#1d293d]">Event & Program Associations</h3>
                  <Badge variant="outline" className="bg-slate-100 text-slate-600 border-0 text-xs">
                    <Lock size={10} className="mr-1" />
                    Read-only
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                {associations.map((assoc) => (
                  <div key={assoc.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {/* Icon */}
                        <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                          {getAssociationIcon(assoc.type)}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm text-slate-900">{assoc.name}</p>
                            <Badge variant="outline" className="bg-slate-100 text-slate-600 border-0 text-xs capitalize">
                              {assoc.type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {assoc.role}
                            </Badge>
                            <Badge variant="outline" className={`text-xs ${
                              assoc.status === 'confirmed' ? 'bg-green-50 text-green-700 border-0' :
                              assoc.status === 'active' ? 'bg-blue-50 text-blue-700 border-0' :
                              'bg-slate-100 text-slate-600 border-0'
                            }`}>
                              {assoc.status}
                            </Badge>
                            {getConstraintBadge(assoc.constraint)}
                          </div>
                          {!assoc.canRemove && assoc.constraint && (
                            <p className="text-xs text-slate-500 mt-2">
                              Cannot be removed — {assoc.constraint === 'ticket-issued' ? 'ticket issued' : 'public listing active'}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye size={14} className="mr-1" />
                          View
                        </Button>
                        {assoc.canRemove ? (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleRemoveAssociation(assoc.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 size={14} className="mr-1" />
                            Remove
                          </Button>
                        ) : (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" disabled>
                                  <Lock size={14} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Cannot remove due to system constraints</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR - System Panels (Read-Only) */}
          <div className="space-y-6">
            
            {/* PANEL 1: VERIFICATION & TRUST */}
            <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="text-green-600" size={20} />
                <h3 className="font-bold text-[#1d293d]">Verification & Trust</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Verification Status</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-0 text-xs">
                    <CheckCircle2 size={10} className="mr-1" />
                    {systemMetrics.verificationStatus}
                  </Badge>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Identity Source</span>
                    <span className="text-xs text-slate-900">{systemMetrics.identitySource}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Verified By</span>
                    <span className="text-xs text-slate-900">{systemMetrics.verifiedBy}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Verified On</span>
                    <span className="text-xs text-slate-900">{systemMetrics.verifiedOn}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* PANEL 2: OWNERSHIP & AUDIT */}
            <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="text-slate-400" size={20} />
                <h3 className="font-bold text-[#1d293d]">Ownership & Audit</h3>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Created By</span>
                    <span className="text-xs text-slate-900">{systemMetrics.createdBy}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Created On</span>
                    <span className="text-xs text-slate-900">{systemMetrics.createdOn}</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Last Updated By</span>
                    <span className="text-xs text-slate-900">{systemMetrics.lastUpdatedBy}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Last Updated On</span>
                    <span className="text-xs text-slate-900">{systemMetrics.lastUpdatedOn}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Total Events Linked</span>
                    <span className="text-xs text-slate-900">{systemMetrics.totalEventsLinked}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Total Emails Sent</span>
                    <span className="text-xs text-slate-900">{systemMetrics.totalEmailsSent}</span>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full mt-2">
                  <Activity size={14} className="mr-2" />
                  View Full Activity Log
                </Button>
              </div>
            </div>

            {/* PANEL 3: DATA INTEGRITY */}
            <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="text-blue-600" size={20} />
                <h3 className="font-bold text-[#1d293d]">Data Integrity</h3>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-green-50">
                  <div className="flex items-center gap-2">
                    <Check className="text-green-600" size={14} />
                    <span className="text-sm text-green-700">Required fields complete</span>
                  </div>
                  <CheckCircle2 className="text-green-600" size={14} />
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-green-50">
                  <div className="flex items-center gap-2">
                    <Check className="text-green-600" size={14} />
                    <span className="text-sm text-green-700">Valid email</span>
                  </div>
                  <CheckCircle2 className="text-green-600" size={14} />
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-green-50">
                  <div className="flex items-center gap-2">
                    <Check className="text-green-600" size={14} />
                    <span className="text-sm text-green-700">At least one role assigned</span>
                  </div>
                  <CheckCircle2 className="text-green-600" size={14} />
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-green-50">
                  <div className="flex items-center gap-2">
                    <Check className="text-green-600" size={14} />
                    <span className="text-sm text-green-700">Classification valid</span>
                  </div>
                  <CheckCircle2 className="text-green-600" size={14} />
                </div>
              </div>
            </div>

            {/* PANEL 4: SYSTEM WARNINGS */}
            <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="text-orange-600" size={20} />
                <h3 className="font-bold text-[#1d293d]">System Warnings</h3>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-50 border border-orange-200">
                  <AlertTriangle className="text-orange-600 shrink-0" size={14} />
                  <span className="text-sm text-orange-700">Used in {systemMetrics.activeEvents} active events</span>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-50 border border-orange-200">
                  <AlertTriangle className="text-orange-600 shrink-0" size={14} />
                  <span className="text-sm text-orange-700">Active jury assignments ({systemMetrics.juryAssignments})</span>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 border border-blue-200">
                  <Info className="text-blue-600 shrink-0" size={14} />
                  <span className="text-sm text-blue-700">Public visibility enabled</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DIALOG 1: DEACTIVATE PERSON */}
      <Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate Person Record</DialogTitle>
            <DialogDescription>
              This will hide the person from active lists but preserve all historical data and associations.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-slate-600">
              Are you sure you want to deactivate this person? They will:
            </p>
            <ul className="list-disc list-inside text-sm text-slate-600 mt-2 space-y-1">
              <li>Be hidden from public directories</li>
              <li>Stop receiving communications</li>
              <li>Retain all historical associations</li>
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeactivateDialog(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-orange-600 hover:bg-orange-700"
              onClick={() => {
                setShowDeactivateDialog(false);
                toast.success('Person deactivated');
              }}
            >
              Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG 2: REQUEST EMAIL CHANGE */}
      <Dialog open={showEmailChangeDialog} onOpenChange={setShowEmailChangeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Email Address Change</DialogTitle>
            <DialogDescription>
              Email changes require admin approval to prevent broken links and ensure data integrity.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Current Email (Locked)</Label>
              <Input value={formData.email} disabled className="bg-slate-50" />
            </div>
            <div className="space-y-2">
              <Label>Requested New Email</Label>
              <Input placeholder="new.email@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Reason for Change</Label>
              <Textarea placeholder="Please explain why this email change is needed..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailChangeDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                setShowEmailChangeDialog(false);
                toast.success('Email change request submitted for admin approval');
              }}
            >
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG 3: REMOVE ASSOCIATION */}
      <Dialog open={showRemoveAssocDialog} onOpenChange={setShowRemoveAssocDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Association</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this association? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRemoveAssocDialog(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700"
              onClick={confirmRemoveAssociation}
            >
              Remove Association
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
