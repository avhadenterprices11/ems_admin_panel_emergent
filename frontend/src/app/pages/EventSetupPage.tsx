import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { eventsAPI, masterDataAPI, meetingAPI, MeetingIntegrationStatus } from '../api/events.api';
import { toast } from 'sonner';
import { FileUpload } from '../components/FileUpload';
import { EmailOverrideSection } from '../components/EmailOverrideSection';
import { CategorySelect } from '../components/shared/CategorySelect';
import { TagsSelect, TagsSelectLegacy } from '../components/shared/TagsSelect';
import {
  MOCK_USERS,
  MOCK_VENUES,
  TIMEZONES,
  validateUrl,
  normalizeUrl
} from '../utils/eventHelpers';
import { 
  ChevronLeft, MapPin, Calendar, Clock, Users, Lock, Eye,
  AlertCircle, Globe, Info, Shield, LifeBuoy,
  Plus, Video, Image, FileText, Search, Upload, X,
  Mail, ChevronDown, ChevronUp, Loader2, ExternalLink
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Checkbox } from '../components/ui/checkbox';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '../components/ui/select';
import { TagInput } from '../components/ui/tag-input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { DateTimePicker } from '../components/ui/datetime-picker';
import { format } from 'date-fns';

const EventSetupPageComponent = () => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingMeeting, setIsGeneratingMeeting] = useState(false);
  const [meetingIntegrationStatus, setMeetingIntegrationStatus] = useState<MeetingIntegrationStatus>({ zoom: false, googleMeet: false });

  // Load meeting integration status on mount
  useEffect(() => {
    meetingAPI.getIntegrationStatus()
      .then(setMeetingIntegrationStatus)
      .catch(err => console.error('Failed to load meeting integration status:', err));
  }, []);

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      description: '',
      category_id: undefined as number | undefined,
      type: 'public',
      start_at: '',
      end_at: '',
      all_day: false,
      timezone: 'America/New_York',
      reg_start_at: '',
      reg_end_at: '',
      capacity: '',
      waitlist: false,
      mode: 'in-person',
      virtual_platform: '',
      venue_id: 'custom',
      venue_name: '',
      address_1: '',
      address_2: '',
      city: '',
      state: '',
      zip: '',
      country: '',
      meeting_url: '',
      banner_image_url: '',
      promo_video_url: '',
      gallery_images: [],
      accessibility_notes: '',
      emergency_contact: '',
      agenda: [],
      meta_title: '',
      meta_description: '',
      url_slug: '',
      visibility: 'public',
      check_in_mode: 'qr',
      data_collection_form: 'standard',
      owner_id: 'user_1',
      co_hosts: [],
      tag_ids: [] as number[],
      internal_notes: '',
      partners: [],
      sponsors: [],
      email_overrides: {},
      lifecycle_status: 'draft'
    }
  });

  const { fields: agendaFields, append: appendAgenda, remove: removeAgenda } = useFieldArray({
    control,
    name: "agenda"
  });

  const { fields: partnerFields, append: appendPartner, remove: removePartner } = useFieldArray({
    control,
    name: "partners"
  });

  const { fields: sponsorFields, append: appendSponsor, remove: removeSponsor } = useFieldArray({
    control,
    name: "sponsors"
  });

  // Watch values
  const watchMode = watch('mode');
  const watchVenueId = watch('venue_id');
  const watchStart = watch('start_at');
  const watchEnd = watch('end_at');
  const watchTitle = watch('title');
  const watchDescription = watch('description');
  const watchVirtualPlatform = watch('virtual_platform');
  const watchMeetingUrl = watch('meeting_url');
  const watchTimezone = watch('timezone');

  // SEO Auto-generation - only on first input, don't override manual changes
  const [seoAutoFilled, setSeoAutoFilled] = useState({
    meta_title: false,
    meta_description: false,
    url_slug: false,
  });

  // Check if event mode requires virtual meeting
  const isVirtualMode = watchMode === 'online' || watchMode === 'hybrid';
  const canGenerateMeeting = isVirtualMode && watchVirtualPlatform && 
    ((watchVirtualPlatform === 'zoom' && meetingIntegrationStatus.zoom) ||
     (watchVirtualPlatform === 'google-meet' && meetingIntegrationStatus.googleMeet));

  // Function to generate meeting link
  const handleGenerateMeeting = async () => {
    if (!watchTitle) {
      toast.error('Please enter an event title first');
      return;
    }
    if (!watchStart || !watchEnd) {
      toast.error('Please set event start and end dates first');
      return;
    }
    if (!watchVirtualPlatform) {
      toast.error('Please select a meeting platform');
      return;
    }

    setIsGeneratingMeeting(true);
    try {
      const result = await meetingAPI.generateMeeting({
        platform: watchVirtualPlatform as 'zoom' | 'google-meet',
        topic: watchTitle,
        description: watchDescription,
        start_time: new Date(watchStart).toISOString(),
        end_time: new Date(watchEnd).toISOString(),
        timezone: watchTimezone || 'America/New_York',
      });

      if (result.success && result.meeting_url) {
        setValue('meeting_url', result.meeting_url);
        toast.success(`${watchVirtualPlatform === 'zoom' ? 'Zoom' : 'Google Meet'} meeting link generated successfully!`);
      } else {
        toast.error('Failed to generate meeting link');
      }
    } catch (error: any) {
      console.error('Meeting generation error:', error);
      toast.error(error.response?.data?.message || 'Failed to generate meeting link');
    } finally {
      setIsGeneratingMeeting(false);
    }
  };

  // Venue preset auto-fill
  useEffect(() => {
    if (watchVenueId && watchVenueId !== 'custom') {
      const venue = MOCK_VENUES.find(v => v.id === watchVenueId);
      if (venue) {
        setValue('venue_name', venue.name);
        setValue('address_1', venue.address);
        setValue('city', venue.city);
        setValue('state', venue.state);
        setValue('zip', venue.zip);
        setValue('country', venue.country);
      }
    }
  }, [watchVenueId, setValue]);

  useEffect(() => {
    if (watchTitle && !seoAutoFilled.meta_title) {
      setValue('meta_title', watchTitle);
    }
    if (watchTitle && !seoAutoFilled.url_slug) {
      const slug = watchTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setValue('url_slug', slug);
    }
  }, [watchTitle, seoAutoFilled.meta_title, seoAutoFilled.url_slug, setValue]);

  useEffect(() => {
    if (watchDescription && !seoAutoFilled.meta_description) {
      const shortDesc = watchDescription.substring(0, 160);
      setValue('meta_description', shortDesc);
    }
  }, [watchDescription, seoAutoFilled.meta_description, setValue]);

  // Handle file uploads
  const handleFileUpload = async (file, field) => {
    try {
      const url = await eventsAPI.uploadFile(file, 'events');
      setValue(field, url);
      toast.success('File uploaded successfully');
      return url;
    } catch (error) {
      toast.error('Failed to upload file');
      throw error;
    }
  };

  const handleMultipleFilesUpload = async (files, field) => {
    try {
      const fileArray = Array.from(files);
      const urls = await eventsAPI.uploadMultipleFiles(fileArray, 'events');
      setValue(field, urls);
      toast.success(`${urls.length} files uploaded successfully`);
      return urls;
    } catch (error) {
      toast.error('Failed to upload files');
      throw error;
    }
  };

  const onSubmit = async (data: any) => {
    try {
      setIsSaving(true);
      
      // Normalize all URL fields before submission
      if (data.partners) {
        data.partners = data.partners.map((partner: any) => ({
          ...partner,
          link: partner.link ? normalizeUrl(partner.link) : ''
        }));
      }
      if (data.sponsors) {
        data.sponsors = data.sponsors.map((sponsor: any) => ({
          ...sponsor,
          link: sponsor.link ? normalizeUrl(sponsor.link) : ''
        }));
      }
      
      // Map frontend fields to backend schema
      const eventData = {
        event_code: `EVT-${Date.now().toString().slice(-6)}`, // Generate unique code
        name: data.title || '',
        description: data.description || '',
        category_id: data.category_id || null,
        type: data.type || 'Conference',
        event_type: data.event_type || 'public',
        start_date: data.start_at ? new Date(data.start_at).toISOString() : new Date().toISOString(),
        end_date: data.end_at ? new Date(data.end_at).toISOString() : new Date().toISOString(),
        all_day: data.all_day || false,
        timezone: data.timezone || 'UTC',
        url_slug: data.url_slug || '',
        reg_start_at: data.reg_start_at ? new Date(data.reg_start_at).toISOString() : null,
        reg_end_at: data.reg_end_at ? new Date(data.reg_end_at).toISOString() : null,
        capacity: data.capacity || null,
        waitlist_enabled: data.waitlist || false,
        mode: data.mode || 'in-person',
        venue_id: data.venue_id || null,
        venue_name: data.venue_name || '',
        location: data.address_1 || '',
        address_line1: data.address_1 || '',
        address_line2: data.address_2 || '',
        city: data.city || '',
        state: data.state || '',
        zip_code: data.zip || '',
        country: data.country || '',
        meeting_url: data.meeting_url || null,
        accessibility_notes: data.accessibility_notes || '',
        emergency_contact: data.emergency_contact || '',
        owner: data.owner_id || 'Admin',
        banner_image_url: data.banner_image_url || null,
        gallery_images: data.gallery_images || [],
        meta_title: data.meta_title || '',
        meta_description: data.meta_description || '',
        status: data.lifecycle_status === 'published' ? 'Published' : 'Draft',
        visibility: data.visibility || 'public',
        is_registration_open: data.lifecycle_status === 'published',
        is_checkin_active: false,
        check_in_mode: data.check_in_mode || 'qr',
        data_collection_form_id: data.data_collection_form ? parseInt(data.data_collection_form) : null,
        co_hosts: data.co_hosts || [],
        tag_ids: data.tag_ids || [],
        partners: data.partners || [],
        sponsors: data.sponsors || [],
        agenda: data.agenda || [],
        email_config: data.email_overrides || null,
        internal_notes: data.internal_notes || '',
        lifecycle_status: data.lifecycle_status || 'draft',
        virtual_platform: data.virtual_platform || null,
        promo_video_url: data.promo_video_url || null,
      };
      
      const createdEvent = await eventsAPI.createEvent(eventData);
      
      toast.success('Event created successfully!');
      setTimeout(() => {
        navigate('/events');
      }, 1000);
    } catch (error: any) {
      console.error('Error creating event:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create event';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = () => {
    setValue('lifecycle_status', 'published');
    handleSubmit(onSubmit)();
  };

  const onBack = () => {
    navigate('/events');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* TOP ACTION BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button 
            type="button"
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-slate-400 hover:text-slate-600 -ml-2"
            onClick={onBack}
          >
            <ChevronLeft size={20} />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-[#1d293d]">Event Setup</h1>
            <p className="text-sm text-slate-500">Create and configure your new event</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button 
            type="button"
            variant="ghost" 
            className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            onClick={onBack}
          >
            Discard
          </Button>
          <Button 
            type="submit"
            variant="outline" 
            className="border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button 
            type="button"
            className="bg-[#0f172b] hover:bg-[#1d293d] text-white min-w-[120px]"
            onClick={handlePublish}
            disabled={isSaving}
          >
            Publish Event
          </Button>
        </div>
      </div>

      {/* 3-COLUMN GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN (2/3 WIDTH) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Event Details */}
          <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1d293d]">Event Details</h3>
              <Badge variant="outline" className="bg-blue-50 text-blue-600 border-0">Basic Info</Badge>
            </div>
            
            <div className="space-y-4">
              {/* Banner Image Upload */}
              <div className="space-y-2">
                <Controller
                  name="banner_image_url"
                  control={control}
                  render={({ field }) => (
                    <FileUpload
                      value={field.value}
                      onChange={field.onChange}
                      multiple={false}
                      accept="image/*"
                      label="Event Banner Image"
                      showPreview={true}
                      folder="events/banners"
                    />
                  )}
                />
                <p className="text-xs text-slate-400">Recommended size: 2160x1080px (2:1 ratio)</p>
              </div>

              {/* Event Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-slate-700 font-medium">
                  Event Title <span className="text-red-500">*</span>
                </Label>
                <Input 
                  id="title" 
                  placeholder="e.g. Global Tech Summit 2024" 
                  className="border-slate-200" 
                  {...register('title', { required: true })} 
                />
                {errors.title && <span className="text-xs text-red-500">Title is required</span>}
              </div>

              {/* Event Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-700 font-medium">Event Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Describe your event..." 
                  className="min-h-[120px] border-slate-200 resize-none" 
                  {...register('description')} 
                />
              </div>

              {/* Category + Public Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">Category</Label>
                  <Controller
                    name="category_id"
                    control={control}
                    render={({ field }) => (
                      <CategorySelect
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select Category"
                        showAddNew={true}
                      />
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">Public Type</Label>
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger className="border-slate-200">
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public Event</SelectItem>
                          <SelectItem value="internal">Internal Only</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Date & Time */}
          <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="text-slate-400" size={20} />
                <h3 className="text-lg font-bold text-[#1d293d]">Date & Time</h3>
              </div>
              <div className="flex items-center space-x-2">
                <Controller
                  name="all_day"
                  control={control}
                  render={({ field }) => (
                    <Checkbox 
                      id="all_day" 
                      checked={field.value} 
                      onCheckedChange={field.onChange} 
                    />
                  )}
                />
                <label htmlFor="all_day" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700">
                  All day event
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Start Date & Time <span className="text-red-500">*</span></Label>
                <Controller
                  name="start_at"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <DateTimePicker 
                      value={field.value ? new Date(field.value) : undefined}
                      onChange={(date) => field.onChange(date ? format(date, "yyyy-MM-dd'T'HH:mm") : '')}
                      placeholder="Select start date..."
                    />
                  )}
                />
                <p className="text-xs text-slate-500">Event kickoff time</p>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">End Date & Time <span className="text-red-500">*</span></Label>
                <Controller
                  name="end_at"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <DateTimePicker 
                      value={field.value ? new Date(field.value) : undefined}
                      onChange={(date) => field.onChange(date ? format(date, "yyyy-MM-dd'T'HH:mm") : '')}
                      placeholder="Select end date..."
                    />
                  )}
                />
                <p className="text-xs text-slate-500">Conclusion time</p>
                {watchEnd && watchStart && new Date(watchEnd) < new Date(watchStart) && (
                  <span className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={10} /> End time must be after start time
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-slate-700 font-medium">Timezone <span className="text-red-500">*</span></Label>
                <Button 
                  type="button" 
                  variant="link" 
                  size="sm" 
                  className="h-auto p-0 text-blue-600" 
                  onClick={() => setValue('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone)}
                >
                  Auto-detect
                </Button>
              </div>
              <Controller
                name="timezone"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="border-slate-200">
                      <SelectValue placeholder="Select Timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map(tz => (
                        <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <p className="text-xs text-slate-500 flex items-center gap-1.5 bg-slate-50 p-2 rounded-md border border-slate-100">
                <Globe size={12} /> All event times are displayed in this timezone
              </p>
            </div>
          </div>

          {/* Card 3: Registration Window */}
          <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6 space-y-6">
            <div className="flex items-center gap-2">
              <Users className="text-slate-400" size={20} />
              <h3 className="text-lg font-bold text-[#1d293d]">Registration Window</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Registration Opens</Label>
                <Controller
                  name="reg_start_at"
                  control={control}
                  render={({ field }) => (
                    <DateTimePicker 
                      value={field.value ? new Date(field.value) : undefined}
                      onChange={(date) => field.onChange(date ? format(date, "yyyy-MM-dd'T'HH:mm") : '')}
                      placeholder="Select date..."
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Registration Closes</Label>
                <Controller
                  name="reg_end_at"
                  control={control}
                  render={({ field }) => (
                    <DateTimePicker 
                      value={field.value ? new Date(field.value) : undefined}
                      onChange={(date) => field.onChange(date ? format(date, "yyyy-MM-dd'T'HH:mm") : '')}
                      placeholder="Select date..."
                    />
                  )}
                />
                {watch('reg_end_at') && watch('end_at') && new Date(watch('reg_end_at')) > new Date(watch('end_at')) && (
                  <span className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle size={10} /> Should ideally close before event ends
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div className="space-y-2">
                <Label htmlFor="capacity" className="text-slate-700 font-medium">Max Capacity</Label>
                <Input 
                  id="capacity" 
                  type="number" 
                  placeholder="Unlimited" 
                  className="border-slate-200" 
                  {...register('capacity')} 
                />
              </div>
              <div className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-slate-50/50">
                <div className="space-y-0.5">
                  <Label className="text-slate-900 font-medium">Enable Waitlist</Label>
                  <p className="text-xs text-slate-500">Allow signups after full</p>
                </div>
                <Controller
                  name="waitlist"
                  control={control}
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Card 4: Location & Mode */}
          <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6 space-y-6">
            <div className="flex items-center gap-2">
              <MapPin className="text-slate-400" size={20} />
              <h3 className="text-lg font-bold text-[#1d293d]">Location & Mode</h3>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">Event Mode</Label>
              <Controller
                name="mode"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in-person">In-Person</SelectItem>
                      <SelectItem value="online">Virtual / Online</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {(watchMode === 'in-person' || watchMode === 'hybrid') && (
              <div className="space-y-4 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">Venue Preset</Label>
                  <Controller
                    name="venue_id"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="border-slate-200 bg-slate-50">
                          <SelectValue placeholder="Select a saved venue or enter custom" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="custom">Custom Location</SelectItem>
                          <SelectGroup>
                            <SelectLabel>Saved Venues</SelectLabel>
                            {MOCK_VENUES.map(v => (
                              <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">Venue Name</Label>
                  <Input 
                    placeholder="e.g. ExCeL London" 
                    className="border-slate-200" 
                    {...register('venue_name')} 
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Address Line 1</Label>
                    <Input placeholder="Street Address" className="border-slate-200" {...register('address_1')} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Address Line 2 <span className="text-slate-400 font-normal">(Optional)</span></Label>
                    <Input placeholder="Apartment, Suite, Unit, etc." className="border-slate-200" {...register('address_2')} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">City</Label>
                    <Input placeholder="City" className="border-slate-200" {...register('city')} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">State / Region</Label>
                    <Input placeholder="State" className="border-slate-200" {...register('state')} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Postal Code</Label>
                    <Input placeholder="Zip Code" className="border-slate-200" {...register('zip')} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Country</Label>
                    <Input placeholder="Country" className="border-slate-200" {...register('country')} />
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center justify-center text-slate-400 min-h-[150px]">
                  <div className="flex flex-col items-center gap-2">
                    <MapPin size={24} />
                    <span className="text-sm">Map Preview Placeholder</span>
                    <Button type="button" variant="link" size="sm" className="text-blue-600">Open in Google Maps</Button>
                  </div>
                </div>
              </div>
            )}

            {(watchMode === 'online' || watchMode === 'hybrid') && (
              <div className="space-y-4 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
                {/* Meeting Platform Selection */}
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">Meeting Platform</Label>
                  <Controller
                    name="virtual_platform"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <SelectTrigger className="border-slate-200" data-testid="meeting-platform-select">
                          <SelectValue placeholder="Select meeting platform" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="zoom" disabled={!meetingIntegrationStatus.zoom}>
                            <div className="flex items-center gap-2">
                              <Video size={16} className="text-blue-500" />
                              <span>Zoom</span>
                              {!meetingIntegrationStatus.zoom && (
                                <Badge variant="secondary" className="ml-2 text-xs">Not configured</Badge>
                              )}
                            </div>
                          </SelectItem>
                          <SelectItem value="google-meet" disabled={!meetingIntegrationStatus.googleMeet}>
                            <div className="flex items-center gap-2">
                              <Video size={16} className="text-green-500" />
                              <span>Google Meet</span>
                              {!meetingIntegrationStatus.googleMeet && (
                                <Badge variant="secondary" className="ml-2 text-xs">Not configured</Badge>
                              )}
                            </div>
                          </SelectItem>
                          <SelectItem value="other">
                            <div className="flex items-center gap-2">
                              <Globe size={16} className="text-slate-500" />
                              <span>Other (Enter URL manually)</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <p className="text-xs text-slate-500">
                    {!meetingIntegrationStatus.zoom && !meetingIntegrationStatus.googleMeet 
                      ? 'No meeting integrations configured. Contact admin to set up Zoom or Google Meet.'
                      : 'Select a platform to auto-generate meeting link, or choose "Other" to enter manually.'}
                  </p>
                </div>

                {/* Meeting URL with Generate Button */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-700 font-medium">Meeting URL</Label>
                    {canGenerateMeeting && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={handleGenerateMeeting}
                        disabled={isGeneratingMeeting || !watchTitle || !watchStart || !watchEnd}
                        className="h-7 text-xs"
                        data-testid="generate-meeting-btn"
                      >
                        {isGeneratingMeeting ? (
                          <>
                            <Loader2 size={12} className="mr-1 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Video size={12} className="mr-1" />
                            Generate Link
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 text-slate-400" size={16} />
                    <Input 
                      placeholder={watchVirtualPlatform === 'zoom' ? 'https://zoom.us/j/...' : 
                                  watchVirtualPlatform === 'google-meet' ? 'https://meet.google.com/...' :
                                  'Enter meeting URL'}
                      className="pl-9 pr-10 border-slate-200" 
                      {...register('meeting_url')} 
                      data-testid="meeting-url-input"
                    />
                    {watchMeetingUrl && (
                      <a 
                        href={watchMeetingUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="absolute right-3 top-3 text-blue-500 hover:text-blue-600"
                        title="Open meeting link"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    {watchVirtualPlatform && watchVirtualPlatform !== 'other' && !watchMeetingUrl
                      ? 'Click "Generate Link" to create a meeting, or enter a URL manually.'
                      : 'Link for attendees to join the virtual session'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Card 5: Accessibility & Safety */}
          <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6 space-y-6">
            <div className="flex items-center gap-2">
              <Shield className="text-slate-400" size={20} />
              <h3 className="text-lg font-bold text-[#1d293d]">Accessibility & Safety</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Accessibility Information</Label>
                <Textarea 
                  placeholder="e.g. Wheelchair access via North Entrance, Sign language interpreter available upon request..." 
                  className="min-h-[80px] border-slate-200 resize-none" 
                  {...register('accessibility_notes')} 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Emergency Contact</Label>
                <Input 
                  placeholder="Name and Phone Number" 
                  className="border-slate-200" 
                  {...register('emergency_contact')} 
                />
                <p className="text-xs text-slate-500">Private internal field for staff use</p>
              </div>
            </div>
          </div>

          {/* Card 6: Event Agenda */}
          <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="text-slate-400" size={20} />
                <h3 className="text-lg font-bold text-[#1d293d]">Event Agenda</h3>
              </div>
              <Button 
                type="button" 
                variant="secondary" 
                size="sm" 
                className="bg-slate-100 hover:bg-slate-200 text-slate-700"
                onClick={() => appendAgenda({ title: '', start_time: '', end_time: '', description: '' })}
              >
                <Plus size={16} className="mr-2" /> Add Agenda Item
              </Button>
            </div>

            <div className="space-y-4">
              {agendaFields.map((field, index) => (
                <div key={field.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-4 relative group">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                    onClick={() => removeAgenda(index)}
                  >
                    <X size={16} />
                  </Button>

                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Agenda Title <span className="text-red-500">*</span></Label>
                    <Input 
                      placeholder="e.g. Opening Keynote" 
                      className="border-slate-200 bg-white" 
                      {...register(`agenda.${index}.title`, { required: true })} 
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-medium">Start Time <span className="text-red-500">*</span></Label>
                      <Input 
                        type="time" 
                        className="border-slate-200 bg-white" 
                        {...register(`agenda.${index}.start_time`, { required: true })} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-medium">End Time <span className="text-red-500">*</span></Label>
                      <Input 
                        type="time" 
                        className="border-slate-200 bg-white" 
                        {...register(`agenda.${index}.end_time`, { required: true })} 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Description</Label>
                    <Textarea 
                      placeholder="Brief details about this session" 
                      className="min-h-[80px] border-slate-200 bg-white resize-none" 
                      {...register(`agenda.${index}.description`)} 
                    />
                  </div>
                </div>
              ))}
              
              {agendaFields.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-xl">
                  <p className="text-slate-400 text-sm">No agenda items added yet.</p>
                </div>
              )}
              
              <p className="text-xs text-slate-500">Used to display the event schedule on the public event page</p>
            </div>
          </div>

          {/* Card 7: Event Media */}
          <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6 space-y-6">
            <div className="flex items-center gap-2">
              <Video className="text-slate-400" size={20} />
              <h3 className="text-lg font-bold text-[#1d293d]">Event Media</h3>
            </div>
            <div className="space-y-6">
              {/* Promo Video Upload */}
              <div className="space-y-2">
                <Controller
                  name="promo_video_url"
                  control={control}
                  render={({ field }) => (
                    <FileUpload
                      value={field.value}
                      onChange={field.onChange}
                      multiple={false}
                      accept="video/*"
                      label="Upload Promo Video"
                      showPreview={true}
                      folder="events/videos"
                    />
                  )}
                />
                <p className="text-xs text-slate-500">Optional promo video shown on the event page. Supported: MP4, MOV</p>
              </div>

              {/* Gallery Upload */}
              <div className="space-y-2">
                <Controller
                  name="gallery_images"
                  control={control}
                  render={({ field }) => (
                    <FileUpload
                      value={field.value}
                      onChange={field.onChange}
                      multiple={true}
                      accept="image/*"
                      maxFiles={20}
                      label="Gallery"
                      showPreview={true}
                      folder="events/gallery"
                    />
                  )}
                />
                <p className="text-xs text-slate-400">Upload multiple images for event gallery</p>
              </div>
            </div>
          </div>

          {/* Card 8: SEO */}
          <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6 space-y-6">
            <div className="flex items-center gap-2">
              <Search className="text-slate-400" size={20} />
              <h3 className="text-lg font-bold text-[#1d293d]">SEO</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Meta Title</Label>
                <Input placeholder="Meta Title" className="border-slate-200" {...register('meta_title')} />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Meta Description</Label>
                <Textarea placeholder="Meta Description" className="min-h-[80px] border-slate-200 resize-none" {...register('meta_description')} />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">URL Slug</Label>
                <Input placeholder="URL Slug" className="border-slate-200" {...register('url_slug')} />
                <p className="text-xs text-slate-500">Used for search engines and public event page URLs</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (1/3 WIDTH) */}
        <div className="space-y-6">
          {/* Card 1: Visibility & Controls */}
          <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6 space-y-6">
            <div className="flex items-center gap-2">
              <Eye className="text-slate-400" size={20} />
              <h3 className="text-lg font-bold text-[#1d293d]">Visibility</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Who can see this event?</Label>
                <Controller
                  name="visibility"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public (Everyone)</SelectItem>
                        <SelectItem value="private">Private (Link Only)</SelectItem>
                        <SelectItem value="invite">Invite Only</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Check-in Mode</Label>
                <Controller
                  name="check_in_mode"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="qr">QR Code Scan</SelectItem>
                        <SelectItem value="manual">Manual Lookup</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="bg-slate-200 p-2 rounded-full text-slate-500">
                  <Lock size={18} />
                </div>
                <div className="space-y-0.5">
                  <Label className="text-slate-900 font-medium">Lock Editing</Label>
                  <p className="text-xs text-slate-500">Prevent changes</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
          </div>

          {/* Card 2: Registration Form */}
          <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6 space-y-6">
            <div className="flex items-center gap-2">
              <FileText className="text-slate-400" size={20} />
              <h3 className="text-lg font-bold text-[#1d293d]">Registration Form</h3>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">Select Data Collection Form</Label>
              <Controller
                name="data_collection_form"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="border-slate-200">
                      <SelectValue placeholder="Select form" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard Registration</SelectItem>
                      <SelectItem value="vip">VIP Registration</SelectItem>
                      <SelectItem value="student">Student Registration</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <p className="text-xs text-slate-500">Used to attach custom registration questions to the event</p>
            </div>
          </div>

          {/* Card 3: Internal Info */}
          <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1d293d]">Internal Info</h3>
              <Badge variant="secondary" className="bg-slate-100 text-slate-500">Staff Only</Badge>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-700 font-medium">Primary Owner</Label>
                  <Button type="button" variant="link" size="sm" className="h-auto p-0 text-xs">Transfer</Button>
                </div>
                <Controller
                  name="owner_id"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="border-slate-200">
                        <SelectValue placeholder="Select Owner" />
                      </SelectTrigger>
                      <SelectContent>
                        {MOCK_USERS.map(u => (
                          <SelectItem key={u.id} value={u.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{u.name}</span>
                              <span className="text-xs text-slate-400 ml-2">{u.role}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <p className="text-xs text-slate-500">Responsible for this event record</p>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Co-hosts</Label>
                <Controller
                  name="co_hosts"
                  control={control}
                  render={({ field }) => (
                    <TagInput 
                      tags={field.value} 
                      setTags={field.onChange}
                      placeholder="Add User..."
                      suggestions={MOCK_USERS.map(u => u.name)}
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Tags</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="w-full">
                        <Controller
                          name="tag_ids"
                          control={control}
                          render={({ field }) => (
                            <TagsSelect 
                              value={field.value || []} 
                              onChange={field.onChange}
                              placeholder="Select tags..."
                              showAddNew={true}
                            />
                          )}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Enter tags to categorize. 5 active tags used similarly.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Internal Notes</Label>
                <Textarea 
                  placeholder="Add private notes for the team..." 
                  className="min-h-[80px] border-slate-200 resize-none" 
                  {...register('internal_notes')} 
                />
              </div>
            </div>
          </div>

          {/* Card 4: Our Partners */}
          <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="text-slate-400" size={20} />
                <h3 className="text-lg font-bold text-[#1d293d]">Our Partners</h3>
              </div>
              <Button 
                type="button" 
                variant="secondary" 
                size="sm" 
                className="bg-slate-100 hover:bg-slate-200 text-slate-700"
                onClick={() => appendPartner({ name: '', logo: '', link: '' })}
              >
                <Plus size={16} className="mr-2" /> Add Partner
              </Button>
            </div>

            <div className="space-y-4">
              {partnerFields.map((field, index) => (
                <div key={field.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-4 relative group">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                    onClick={() => removePartner(index)}
                  >
                    <X size={16} />
                  </Button>

                  <div className="space-y-2">
                    <Controller
                      name={`partners.${index}.logo`}
                      control={control}
                      render={({ field }) => (
                        <FileUpload
                          value={field.value}
                          onChange={field.onChange}
                          multiple={false}
                          accept="image/*"
                          label="Partner Logo"
                          showPreview={true}
                          folder="events/partners"
                        />
                      )}
                    />
                    <p className="text-xs text-slate-400">Supported: PNG, JPG, SVG</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Partner Name <span className="text-red-500">*</span></Label>
                    <Input 
                      placeholder="e.g. Google" 
                      className="border-slate-200 bg-white" 
                      {...register(`partners.${index}.name`, { required: true })} 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Partner Website Link</Label>
                    <Input 
                      placeholder="https://partner-website.com" 
                      className="border-slate-200 bg-white" 
                      {...register(`partners.${index}.link`, { 
                        validate: validateUrl
                      })} 
                    />
                    {errors?.partners?.[index]?.link && (
                      <p className="text-xs text-red-500">{(errors.partners[index].link as any)?.message}</p>
                    )}
                    <p className="text-xs text-slate-400">Optional. Clicking the logo or name will open this link.</p>
                  </div>
                </div>
              ))}

              {partnerFields.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-xl">
                  <p className="text-slate-400 text-sm">No partners added yet.</p>
                </div>
              )}
              
              <p className="text-xs text-slate-500">Logos and names are displayed on the public event page</p>
            </div>
          </div>

          {/* Card 5: Sponsors */}
          <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LifeBuoy className="text-slate-400" size={20} />
                <h3 className="text-lg font-bold text-[#1d293d]">Sponsors</h3>
              </div>
              <Button 
                type="button" 
                variant="secondary" 
                size="sm" 
                className="bg-slate-100 hover:bg-slate-200 text-slate-700"
                onClick={() => appendSponsor({ name: '', logo: '', link: '' })}
              >
                <Plus size={16} className="mr-2" /> Add Sponsor
              </Button>
            </div>

            <div className="space-y-4">
              {sponsorFields.map((field, index) => (
                <div key={field.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-4 relative group">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                    onClick={() => removeSponsor(index)}
                  >
                    <X size={16} />
                  </Button>

                  <div className="space-y-2">
                    <Controller
                      name={`sponsors.${index}.logo`}
                      control={control}
                      render={({ field }) => (
                        <FileUpload
                          value={field.value}
                          onChange={field.onChange}
                          multiple={false}
                          accept="image/*"
                          label="Sponsor Logo *"
                          showPreview={true}
                          folder="events/sponsors"
                        />
                      )}
                    />
                    <p className="text-xs text-slate-400">Supported: PNG, JPG, SVG</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Sponsor Name <span className="text-red-500">*</span></Label>
                    <Input 
                      placeholder="e.g. Microsoft" 
                      className="border-slate-200 bg-white" 
                      {...register(`sponsors.${index}.name`, { required: true })} 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Sponsor Website Link</Label>
                    <Input 
                      placeholder="https://sponsor-website.com" 
                      className="border-slate-200 bg-white" 
                      {...register(`sponsors.${index}.link`, { 
                        validate: validateUrl
                      })} 
                    />
                    {errors?.sponsors?.[index]?.link && (
                      <p className="text-xs text-red-500">{(errors.sponsors[index].link as any)?.message}</p>
                    )}
                    <p className="text-xs text-slate-400">Optional. Clicking the logo or name will open this link.</p>
                  </div>
                </div>
              ))}

              {sponsorFields.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-xl">
                  <p className="text-slate-400 text-sm">No sponsors added yet.</p>
                </div>
              )}
              
              <p className="text-xs text-slate-500">Sponsors may be highlighted separately on the event page</p>
            </div>
          </div>

          {/* Card 6: Email Configuration */}
          <EmailOverrideSection control={control} watch={watch} setValue={setValue} />

          {/* Card 7: Event Summary (Sticky) */}
          <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6 space-y-6 sticky top-6">
            <h3 className="text-lg font-bold text-[#1d293d]">Event Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <span className="text-slate-500 text-sm">Lifecycle</span>
                <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-0 capitalize">
                  {watch('lifecycle_status')}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar size={16} className="text-slate-400 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-xs text-slate-400 uppercase font-bold">Event Start</span>
                    <p className="text-sm text-slate-700 font-medium">
                      {watchStart ? new Date(watchStart).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

EventSetupPageComponent.displayName = 'EventSetupPage';

export const EventSetupPage = EventSetupPageComponent;