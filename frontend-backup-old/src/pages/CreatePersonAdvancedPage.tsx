import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { 
  ChevronLeft, Save, X, Upload, AlertCircle, CheckCircle2, Info,
  Plus, User, Briefcase, GraduationCap, Calendar, Shield,
  Mail, Eye, Phone, ExternalLink, Building, Globe, UserCheck, Clock
} from 'lucide-react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Badge } from "../components/ui/badge";
import { Checkbox } from "../components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { toast } from "sonner";

interface CreatePersonAdvancedPageProps {
  onBack?: () => void;
}

const UNIVERSITIES = [
  'University of Oxford',
  'University of Cambridge',
  'Imperial College London',
  'London School of Economics',
  'University of Edinburgh',
  'Indian Institute of Technology (IIT)',
  'Indian Institute of Management (IIM)',
  'Delhi University',
  'Mumbai University'
];

const PROGRAMS = [
  { id: 'evt_001', name: 'Global Tech Summit 2024', type: 'Event' },
  { id: 'ad_001', name: 'Achievers Dialogue: Finance Leaders', type: 'Achievers Dialogue' },
  { id: 'aa_001', name: 'Achievers Awards 2024', type: 'Achievers Awards' },
  { id: 'conf_001', name: 'Annual Conference 2024', type: 'Conference' },
];

const INDUSTRIES = [
  'Technology', 'Finance', 'Healthcare', 'Education', 'Consulting',
  'Engineering', 'Media & Entertainment', 'Government & Public Sector',
  'Non-Profit', 'Other'
];

const ROLE_OPTIONS = [
  { value: 'attendee', label: 'Attendee', description: 'General participant' },
  { value: 'speaker', label: 'Speaker', description: 'Presents content' },
  { value: 'panelist', label: 'Panelist', description: 'Panel discussion participant' },
  { value: 'jury', label: 'Jury', description: 'Awards/competition judge' },
  { value: 'moderator', label: 'Moderator', description: 'Facilitates discussions' },
  { value: 'chief_guest', label: 'Chief Guest', description: 'VIP guest of honor' },
  { value: 'volunteer', label: 'Volunteer', description: 'Event volunteer' },
  { value: 'chapter_lead', label: 'Chapter Lead', description: 'Regional leadership' },
  { value: 'national_officer', label: 'National Officer', description: 'National leadership' },
  { value: 'staff', label: 'Staff', description: 'Internal team member' },
  { value: 'media', label: 'Media', description: 'Press/media representative' },
];

export function CreatePersonAdvancedPage({ onBack }: CreatePersonAdvancedPageProps) {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [emailExists, setEmailExists] = useState(false);
  const [showAddRoleDialog, setShowAddRoleDialog] = useState(false);

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      profile_photo: '',
      primary_classification: '',
      secondary_roles: [] as string[],
      university: '',
      degree: '',
      field_of_study: '',
      graduation_year: '',
      student_status: '',
      study_country: '',
      organization: '',
      job_title: '',
      industry: '',
      years_of_experience: '',
      linkedin_url: '',
      website: '',
      associations: [] as Array<{
        program_type: string;
        program_id: string;
        program_name: string;
        role: string;
        status: string;
      }>,
      record_status: 'active',
      public_visibility: 'internal',
      can_appear_website: false,
      can_appear_events: true,
      can_appear_speaker: false,
      receive_events: true,
      receive_awards: true,
      receive_announcements: true,
    }
  });

  const { fields: associations, append: appendAssociation, remove: removeAssociation } = useFieldArray({
    control,
    name: "associations"
  });

  const watchEmail = watch('email');
  const watchFirstName = watch('first_name');
  const watchLastName = watch('last_name');
  const watchClassification = watch('primary_classification');

  // Email duplicate check
  useEffect(() => {
    if (watchEmail && watchEmail.includes('@')) {
      const timeout = setTimeout(() => {
        setEmailExists(watchEmail === 'duplicate@example.com');
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [watchEmail]);

  // Live validation
  const validations = {
    hasValidName: watchFirstName && watchLastName,
    hasValidEmail: watchEmail && watchEmail.includes('@') && !emailExists,
    hasRoleAssigned: selectedRoles.length > 0,
    hasClassification: watchClassification !== '',
  };

  const handleAddRole = (role: string) => {
    if (!selectedRoles.includes(role)) {
      const updated = [...selectedRoles, role];
      setSelectedRoles(updated);
      setValue('secondary_roles', updated);
    }
  };

  const handleRemoveRole = (role: string) => {
    const updated = selectedRoles.filter(r => r !== role);
    setSelectedRoles(updated);
    setValue('secondary_roles', updated);
  };

  const getRoleLabel = (value: string) => {
    return ROLE_OPTIONS.find(r => r.value === value)?.label || value;
  };

  const handleAddAssociation = () => {
    appendAssociation({
      program_type: '',
      program_id: '',
      program_name: '',
      role: '',
      status: 'invited'
    });
  };

  const onSubmit = (data: any) => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Person record created successfully!');
      navigate('/people');
    }, 1000);
  };

  const handleSaveDraft = () => {
    toast.success('Draft saved successfully');
  };

  const handleDiscard = () => {
    if (confirm('Are you sure you want to discard all changes?')) {
      navigate('/people');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="min-h-screen bg-slate-50">
      {/* STICKY HEADER (Glass Morphism) */}
      <header className="sticky top-0 z-10 bg-[#f9f9f9]/90 backdrop-blur-sm border-b border-slate-200/60 px-8 py-4 mb-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex flex-col gap-1">
            {/* Breadcrumb */}
            <div className="flex items-center text-sm text-slate-500 mb-1">
              <button 
                type="button"
                onClick={() => navigate('/people')}
                className="mr-2 hover:text-slate-800 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="cursor-pointer hover:text-slate-700" onClick={() => navigate('/people')}>People</span>
              <span className="mx-1">/</span>
              <span className="cursor-pointer hover:text-slate-700" onClick={() => navigate('/people')}>People List</span>
              <span className="mx-1">/</span>
              <span className="text-slate-900">Add New Person</span>
            </div>
            
            {/* Title & Description */}
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-[#1d293d] tracking-tight">Add New Person</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Create a unified People record used across registrations, events, awards, communications, and reporting.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button 
              type="button" 
              variant="ghost"
              onClick={handleDiscard}
              className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            >
              Discard
            </Button>
            <Button 
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              <Save size={16} className="mr-2" />
              Save Draft
            </Button>
            <Button 
              type="submit"
              className="bg-[#0f172b] hover:bg-[#0f172b]/90 text-white min-w-[120px] shadow-sm"
              disabled={isSaving}
            >
              <CheckCircle2 size={16} className="mr-2" />
              Create Person
            </Button>
          </div>
        </div>
      </header>

      {/* TWO-COLUMN LAYOUT */}
      <div className="max-w-6xl mx-auto px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN - Primary Data (Editable) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* SECTION 1: IDENTITY & CONTACT */}
            <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <User className="text-slate-400" size={20} />
                <h3 className="text-lg font-bold text-[#1d293d]">Identity & Contact</h3>
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

              <div className="space-y-6">
                {/* Profile Photo */}
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">Profile Photo</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-200">
                      <User className="text-slate-400" size={32} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button type="button" variant="outline" size="sm">
                        <Upload size={14} className="mr-2" />
                        Upload Photo
                      </Button>
                      <p className="text-xs text-slate-500">JPG, PNG or GIF. Max 5MB. Recommended 400x400px</p>
                    </div>
                  </div>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name" className="text-slate-700 font-medium">
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      id="first_name" 
                      placeholder="e.g. Arjun" 
                      className="border-slate-200" 
                      {...register('first_name', { required: true })} 
                    />
                    {errors.first_name && <span className="text-xs text-red-500">First name is required</span>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name" className="text-slate-700 font-medium">
                      Last Name <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      id="last_name" 
                      placeholder="e.g. Patel" 
                      className="border-slate-200" 
                      {...register('last_name', { required: true })} 
                    />
                    {errors.last_name && <span className="text-xs text-red-500">Last name is required</span>}
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-medium">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="email" 
                    type="email"
                    placeholder="e.g. arjun.patel@university.ac.uk" 
                    className="border-slate-200" 
                    {...register('email', { required: true, pattern: /^\S+@\S+$/i })} 
                  />
                  {errors.email && <span className="text-xs text-red-500">Valid email is required</span>}
                  {emailExists && (
                    <div className="flex items-center gap-2 text-amber-600 text-xs mt-1">
                      <AlertCircle size={12} />
                      <span>This email already exists in the system. Consider editing the existing record.</span>
                    </div>
                  )}
                  <p className="text-xs text-slate-500">Primary unique identifier. Used for login and communications.</p>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-slate-700 font-medium">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 text-slate-400" size={16} />
                    <Input 
                      id="phone" 
                      placeholder="+44 20 1234 5678" 
                      className="pl-9 border-slate-200" 
                      {...register('phone')} 
                    />
                  </div>
                  <p className="text-xs text-slate-500">International format preferred</p>
                </div>
              </div>
            </div>

            {/* SECTION 2: CLASSIFICATION & ROLES */}
            <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Shield className="text-slate-400" size={20} />
                <h3 className="text-lg font-bold text-[#1d293d]">Classification & Roles</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-slate-100 transition-colors">
                        <Info size={14} className="text-slate-400" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <p className="text-xs">Reflects multi-role reality. Roles do NOT imply event assignment (handled separately).</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="space-y-6">
                {/* Primary Classification */}
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">
                    Primary Classification <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="primary_classification"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="border-slate-200">
                          <SelectValue placeholder="Select primary classification" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="alumni">Alumni</SelectItem>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="dignitary">Dignitary</SelectItem>
                          <SelectItem value="internal_team">Internal Team</SelectItem>
                          <SelectItem value="partner">Partner / Sponsor</SelectItem>
                          <SelectItem value="vendor">Vendor</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.primary_classification && <span className="text-xs text-red-500">Classification is required</span>}
                </div>

                {/* Secondary Roles */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-700 font-medium">Secondary Roles</Label>
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowAddRoleDialog(true)}
                    >
                      <Plus size={14} className="mr-1" />
                      Add Role
                    </Button>
                  </div>
                  
                  {selectedRoles.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedRoles.map(role => (
                        <Badge 
                          key={role} 
                          variant="secondary" 
                          className="pl-3 pr-2 py-1.5 gap-2"
                        >
                          {getRoleLabel(role)}
                          <button
                            type="button"
                            onClick={() => handleRemoveRole(role)}
                            className="hover:bg-slate-300 rounded-full p-0.5 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-lg">
                      <p className="text-slate-400 text-sm">No roles assigned yet</p>
                    </div>
                  )}
                  <p className="text-xs text-slate-500">
                    Multi-role support. These are contextual across different programs.
                  </p>
                </div>
              </div>
            </div>

            {/* SECTION 3: EDUCATION & ALUMNI (Conditional) */}
            {(watchClassification === 'student' || watchClassification === 'alumni') && (
              <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <GraduationCap className="text-slate-400" size={20} />
                  <h3 className="text-lg font-bold text-[#1d293d]">Education & Alumni Details</h3>
                  <Badge variant="outline" className="text-xs">Critical for NISAU Identity</Badge>
                </div>

                <div className="space-y-6">
                  {/* University */}
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">University / Institution</Label>
                    <Controller
                      name="university"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="border-slate-200">
                            <SelectValue placeholder="Search or select university" />
                          </SelectTrigger>
                          <SelectContent>
                            {UNIVERSITIES.map(uni => (
                              <SelectItem key={uni} value={uni}>{uni}</SelectItem>
                            ))}
                            <SelectItem value="other">+ Add New Institution</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  {/* Degree & Field of Study */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="degree" className="text-slate-700 font-medium">Degree</Label>
                      <Input 
                        id="degree" 
                        placeholder="e.g. MSc Computer Science" 
                        className="border-slate-200" 
                        {...register('degree')} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="field_of_study" className="text-slate-700 font-medium">Field of Study</Label>
                      <Input 
                        id="field_of_study" 
                        placeholder="e.g. Artificial Intelligence" 
                        className="border-slate-200" 
                        {...register('field_of_study')} 
                      />
                    </div>
                  </div>

                  {/* Graduation Year & Study Country */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="graduation_year" className="text-slate-700 font-medium">Graduation Year</Label>
                      <Input 
                        id="graduation_year" 
                        type="number"
                        placeholder="e.g. 2024" 
                        className="border-slate-200" 
                        {...register('graduation_year')} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-medium">Study Country</Label>
                      <Controller
                        name="study_country"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="border-slate-200">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="uk">United Kingdom</SelectItem>
                              <SelectItem value="india">India</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>

                  {/* Student/Alumni Status */}
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Student / Alumni Status</Label>
                    <Controller
                      name="student_status"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="border-slate-200">
                            <SelectValue placeholder="Auto-derived from graduation year" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="current_student">Current Student</SelectItem>
                            <SelectItem value="recent_graduate">Recent Graduate (0-2 years)</SelectItem>
                            <SelectItem value="alumni">Alumni (2+ years)</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 4: ORGANIZATION & PROFESSIONAL INFO */}
            <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Briefcase className="text-slate-400" size={20} />
                <h3 className="text-lg font-bold text-[#1d293d]">Organization & Professional Info</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-slate-100 transition-colors">
                        <Info size={14} className="text-slate-400" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <p className="text-xs">Used for Achievers credibility, jury vetting, and speaker profiles</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="space-y-6">
                {/* Organization & Job Title */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="organization" className="text-slate-700 font-medium">Organization / Company</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 text-slate-400" size={16} />
                      <Input 
                        id="organization" 
                        placeholder="e.g. Google UK" 
                        className="pl-9 border-slate-200" 
                        {...register('organization')} 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="job_title" className="text-slate-700 font-medium">Job Title</Label>
                    <Input 
                      id="job_title" 
                      placeholder="e.g. Senior Software Engineer" 
                      className="border-slate-200" 
                      {...register('job_title')} 
                    />
                  </div>
                </div>

                {/* Industry & Experience */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Industry Category</Label>
                    <Controller
                      name="industry"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="border-slate-200">
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                          <SelectContent>
                            {INDUSTRIES.map(ind => (
                              <SelectItem key={ind} value={ind.toLowerCase().replace(/\s+/g, '_')}>{ind}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Years of Experience</Label>
                    <Controller
                      name="years_of_experience"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="border-slate-200">
                            <SelectValue placeholder="Select range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0-2">0-2 years</SelectItem>
                            <SelectItem value="3-5">3-5 years</SelectItem>
                            <SelectItem value="6-10">6-10 years</SelectItem>
                            <SelectItem value="11-15">11-15 years</SelectItem>
                            <SelectItem value="16+">16+ years</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                {/* LinkedIn */}
                <div className="space-y-2">
                  <Label htmlFor="linkedin_url" className="text-slate-700 font-medium">LinkedIn Profile URL</Label>
                  <div className="relative">
                    <ExternalLink className="absolute left-3 top-3 text-slate-400" size={16} />
                    <Input 
                      id="linkedin_url" 
                      placeholder="https://linkedin.com/in/..." 
                      className="pl-9 border-slate-200" 
                      {...register('linkedin_url')} 
                    />
                  </div>
                </div>

                {/* Website */}
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-slate-700 font-medium">Personal Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 text-slate-400" size={16} />
                    <Input 
                      id="website" 
                      placeholder="https://..." 
                      className="pl-9 border-slate-200" 
                      {...register('website')} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 5: EVENT & PROGRAM ASSOCIATIONS */}
            <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="text-slate-400" size={20} />
                  <h3 className="text-lg font-bold text-[#1d293d]">Event & Program Associations</h3>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" className="inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-slate-100 transition-colors">
                          <Info size={14} className="text-slate-400" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <p className="text-xs">Defines where and how this person participates. Roles here override general roles contextually.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm"
                  onClick={handleAddAssociation}
                >
                  <Plus size={14} className="mr-1" />
                  Add Association
                </Button>
              </div>

              <div className="space-y-3">
                {associations.map((field, index) => (
                  <div key={field.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-4 relative group">
                    {/* Remove Button */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                      onClick={() => removeAssociation(index)}
                    >
                      <X size={16} />
                    </Button>

                    {/* Row 1: Program Type & Name */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-slate-700 font-medium text-sm">Program Type</Label>
                        <Controller
                          name={`associations.${index}.program_type`}
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="border-slate-200 bg-white h-9 text-sm">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="event">Event</SelectItem>
                                <SelectItem value="achievers_dialogue">Achievers Dialogue</SelectItem>
                                <SelectItem value="achievers_awards">Achievers Awards</SelectItem>
                                <SelectItem value="conference">Conference</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-700 font-medium text-sm">Program / Event Name</Label>
                        <Controller
                          name={`associations.${index}.program_name`}
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="border-slate-200 bg-white h-9 text-sm">
                                <SelectValue placeholder="Search program" />
                              </SelectTrigger>
                              <SelectContent>
                                {PROGRAMS.map(prog => (
                                  <SelectItem key={prog.id} value={prog.id}>
                                    <div className="flex flex-col">
                                      <span className="text-sm">{prog.name}</span>
                                      <span className="text-xs text-slate-500">{prog.type}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>

                    {/* Row 2: Role & Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-slate-700 font-medium text-sm">Role for this Program</Label>
                        <Controller
                          name={`associations.${index}.role`}
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="border-slate-200 bg-white h-9 text-sm">
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                {ROLE_OPTIONS.map(role => (
                                  <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-700 font-medium text-sm">Status</Label>
                        <Controller
                          name={`associations.${index}.status`}
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="border-slate-200 bg-white h-9 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="invited">Invited</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="withdrawn">Withdrawn</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Empty State */}
                {associations.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-xl">
                    <p className="text-slate-400 text-sm">No program associations yet</p>
                    <p className="text-xs text-slate-500 mt-1">Add associations to link this person to events or programs</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - System, Status & Control */}
          <div className="space-y-6">
            
            {/* SECTION 6: STATUS & VISIBILITY */}
            <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Eye className="text-slate-400" size={20} />
                <h3 className="text-lg font-bold text-[#1d293d]">Status & Visibility</h3>
              </div>

              <div className="space-y-6">
                {/* Record Status */}
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">Record Status</Label>
                  <Controller
                    name="record_status"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="border-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="text-green-600" size={14} />
                              Active
                            </div>
                          </SelectItem>
                          <SelectItem value="inactive">
                            <div className="flex items-center gap-2">
                              <X className="text-slate-400" size={14} />
                              Inactive
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {/* Public Visibility */}
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">Public Visibility</Label>
                  <Controller
                    name="public_visibility"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="border-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hidden">Hidden</SelectItem>
                          <SelectItem value="internal">Internal Only</SelectItem>
                          <SelectItem value="public">Public (Approved)</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {/* Visibility Toggles */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-slate-900 font-medium text-sm">Can appear on public website</Label>
                      <p className="text-xs text-slate-500">Show in directory listings</p>
                    </div>
                    <Controller
                      name="can_appear_website"
                      control={control}
                      render={({ field }) => (
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      )}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-slate-900 font-medium text-sm">Can appear on event pages</Label>
                      <p className="text-xs text-slate-500">Display in event rosters</p>
                    </div>
                    <Controller
                      name="can_appear_events"
                      control={control}
                      render={({ field }) => (
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      )}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-slate-900 font-medium text-sm">Can appear as speaker/jury</Label>
                      <p className="text-xs text-slate-500">Show in featured listings</p>
                    </div>
                    <Controller
                      name="can_appear_speaker"
                      control={control}
                      render={({ field }) => (
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 7: COMMUNICATION & CONSENT */}
            <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Mail className="text-slate-400" size={20} />
                <h3 className="text-lg font-bold text-[#1d293d]">Communication & Consent</h3>
              </div>

              <div className="space-y-4">
                {/* Event Communications */}
                <div className="flex items-start gap-3">
                  <Controller
                    name="receive_events"
                    control={control}
                    render={({ field }) => (
                      <Checkbox 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-1"
                      />
                    )}
                  />
                  <div className="space-y-0.5">
                    <Label className="text-slate-900 font-medium text-sm cursor-pointer">
                      Receive event communications
                    </Label>
                    <p className="text-xs text-slate-500">Invitations, reminders, updates</p>
                  </div>
                </div>

                {/* Awards Communications */}
                <div className="flex items-start gap-3">
                  <Controller
                    name="receive_awards"
                    control={control}
                    render={({ field }) => (
                      <Checkbox 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-1"
                      />
                    )}
                  />
                  <div className="space-y-0.5">
                    <Label className="text-slate-900 font-medium text-sm cursor-pointer">
                      Receive awards-related emails
                    </Label>
                    <p className="text-xs text-slate-500">Nominations, jury invites, results</p>
                  </div>
                </div>

                {/* Announcements */}
                <div className="flex items-start gap-3">
                  <Controller
                    name="receive_announcements"
                    control={control}
                    render={({ field }) => (
                      <Checkbox 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-1"
                      />
                    )}
                  />
                  <div className="space-y-0.5">
                    <Label className="text-slate-900 font-medium text-sm cursor-pointer">
                      Receive announcements & updates
                    </Label>
                    <p className="text-xs text-slate-500">Newsletter, general updates</p>
                  </div>
                </div>

                {/* Info Note */}
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-xs text-slate-500">
                    <Info className="inline mr-1" size={12} />
                    These preferences control inclusion in automated email workflows.
                  </p>
                </div>
              </div>
            </div>

            {/* SECTION 8: VERIFICATION & TRUST */}
            <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <UserCheck className="text-slate-400" size={20} />
                <h3 className="text-lg font-bold text-[#1d293d]">Verification & Trust</h3>
                <Badge variant="secondary" className="text-xs">Read Only</Badge>
              </div>

              <div className="space-y-4">
                {/* Verification Status */}
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium text-sm">Verification Status</Label>
                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                    <AlertCircle className="text-amber-500" size={16} />
                    <span className="text-sm text-slate-700">Unverified</span>
                  </div>
                  <p className="text-xs text-slate-500">Will update after email verification</p>
                </div>

                {/* Identity Source */}
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium text-sm">Identity Source</Label>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-700">Manual Admin Entry</span>
                  </div>
                </div>

                {/* Verification Details */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-slate-500 mb-1">Last Verified</div>
                    <div className="text-slate-700 font-medium">—</div>
                  </div>
                  <div>
                    <div className="text-slate-500 mb-1">Verified By</div>
                    <div className="text-slate-700 font-medium">—</div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 9: OWNERSHIP & AUDIT */}
            <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Clock className="text-slate-400" size={20} />
                <h3 className="text-lg font-bold text-[#1d293d]">Ownership & Audit</h3>
                <Badge variant="secondary" className="text-xs">Read Only</Badge>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-start">
                  <span className="text-slate-500">Created By</span>
                  <span className="text-slate-700 font-medium">Current Admin</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-slate-500">Created On</span>
                  <span className="text-slate-700 font-medium">
                    {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-slate-500">Last Updated</span>
                  <span className="text-slate-700 font-medium">—</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-slate-500">Last Event</span>
                  <span className="text-slate-700 font-medium">—</span>
                </div>
              </div>
            </div>

            {/* SECTION 10: DATA INTEGRITY */}
            <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Shield className="text-slate-400" size={20} />
                <h3 className="text-lg font-bold text-[#1d293d]">Data Integrity</h3>
              </div>

              <div className="space-y-3">
                {/* Valid Name */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-2">
                    {validations.hasValidName ? (
                      <CheckCircle2 className="text-green-600" size={16} />
                    ) : (
                      <AlertCircle className="text-slate-300" size={16} />
                    )}
                    <span className="text-sm text-slate-700">Valid Name</span>
                  </div>
                  {validations.hasValidName && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-0 text-xs">✓</Badge>
                  )}
                </div>

                {/* Valid Email */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-2">
                    {validations.hasValidEmail ? (
                      <CheckCircle2 className="text-green-600" size={16} />
                    ) : (
                      <AlertCircle className="text-slate-300" size={16} />
                    )}
                    <span className="text-sm text-slate-700">Valid Email</span>
                  </div>
                  {validations.hasValidEmail && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-0 text-xs">✓</Badge>
                  )}
                </div>

                {/* Role Assigned */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-2">
                    {validations.hasRoleAssigned ? (
                      <CheckCircle2 className="text-green-600" size={16} />
                    ) : (
                      <AlertCircle className="text-slate-300" size={16} />
                    )}
                    <span className="text-sm text-slate-700">Role Assigned</span>
                  </div>
                  {validations.hasRoleAssigned && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-0 text-xs">✓</Badge>
                  )}
                </div>

                {/* Classification Assigned */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-2">
                    {validations.hasClassification ? (
                      <CheckCircle2 className="text-green-600" size={16} />
                    ) : (
                      <AlertCircle className="text-slate-300" size={16} />
                    )}
                    <span className="text-sm text-slate-700">Classification Assigned</span>
                  </div>
                  {validations.hasClassification && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-0 text-xs">✓</Badge>
                  )}
                </div>
              </div>

              {/* Info Banner */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <p className="text-xs text-blue-700">
                  <Info className="inline mr-1" size={12} />
                  Draft state allowed. Complete all fields before creating final record.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Role Dialog */}
      <Dialog open={showAddRoleDialog} onOpenChange={setShowAddRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Secondary Role</DialogTitle>
            <DialogDescription>
              Select roles that apply to this person across various programs
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {ROLE_OPTIONS.map(role => (
              <button
                key={role.value}
                type="button"
                onClick={() => {
                  handleAddRole(role.value);
                  setShowAddRoleDialog(false);
                }}
                disabled={selectedRoles.includes(role.value)}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  selectedRoles.includes(role.value)
                    ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                    : 'border-slate-200 hover:border-blue-500 hover:bg-blue-50'
                }`}
              >
                <div className="font-medium text-sm">{role.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{role.description}</div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </form>
  );
}
