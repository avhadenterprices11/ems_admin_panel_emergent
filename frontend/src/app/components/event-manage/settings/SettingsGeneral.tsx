import React, { useState, useEffect, useCallback } from 'react';
import { 
  Save, 
  MapPin,
  Calendar,
  Check,
  ChevronsUpDown,
  X,
  Plus,
  Search,
  FileText,
  Image as ImageIcon,
  ShieldAlert,
  Upload,
  Clock,
  Users,
  Globe,
  Video,
  Trash2,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Separator } from "../../ui/separator";
import { Textarea } from "../../ui/textarea";
import { Badge } from "../../ui/badge";
import { Switch } from "../../ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { cn } from "../../ui/utils";
import { toast } from "sonner";
import { 
  eventsAPI, 
  masterDataAPI, 
  EventGeneralDetails, 
  Category, 
  Tag, 
  UserBasic,
  UpdateEventGeneralDetailsInput 
} from '../../../api/events.api';

interface SettingsGeneralProps {
  eventId: number | string;
}

export const SettingsGeneral = ({ eventId }: SettingsGeneralProps) => {
  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState<EventGeneralDetails | null>(null);
  
  // Master data
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [users, setUsers] = useState<UserBasic[]>([]);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [eventType, setEventType] = useState('conference');
  const [visibility, setVisibility] = useState('public');
  const [checkInMode, setCheckInMode] = useState('qr_code');
  const [owner, setOwner] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [coHostIds, setCoHostIds] = useState<number[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [timezone, setTimezone] = useState('');
  const [regStartAt, setRegStartAt] = useState('');
  const [regEndAt, setRegEndAt] = useState('');
  const [capacity, setCapacity] = useState('');
  const [waitlistEnabled, setWaitlistEnabled] = useState(false);
  const [mode, setMode] = useState('in_person');
  const [venueName, setVenueName] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [stateProvince, setStateProvince] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [bannerImageUrl, setBannerImageUrl] = useState('');
  const [promoVideoUrl, setPromoVideoUrl] = useState('');
  const [accessibilityNotes, setAccessibilityNotes] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  // UI state
  const [tagOpen, setTagOpen] = useState(false);
  const [coHostOpen, setCoHostOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isAddTagOpen, setIsAddTagOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3B82F6');

  // Load initial data
  useEffect(() => {
    loadData();
  }, [eventId]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [details, cats, tags, userList] = await Promise.all([
        eventsAPI.getEventGeneralDetails(eventId),
        masterDataAPI.getCategories(),
        masterDataAPI.getTags(),
        masterDataAPI.getUsers(),
      ]);

      setFormData(details);
      setCategories(cats);
      setAvailableTags(tags);
      setUsers(userList);

      // Populate form fields
      setName(details.name || '');
      setDescription(details.description || '');
      setCategoryId(details.category_id || undefined);
      setEventType(details.type || 'conference');
      setVisibility(details.visibility || 'public');
      setCheckInMode(details.check_in_mode || 'qr_code');
      setOwner(details.owner || '');
      setSelectedTagIds(details.tags?.map(t => t.id) || []);
      setCoHostIds(details.co_hosts?.map(c => c.user_id) || []);
      setStartDate(details.start_date ? new Date(details.start_date).toISOString().slice(0, 16) : '');
      setEndDate(details.end_date ? new Date(details.end_date).toISOString().slice(0, 16) : '');
      setAllDay(details.all_day || false);
      setTimezone(details.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
      setRegStartAt(details.reg_start_at ? new Date(details.reg_start_at).toISOString().slice(0, 16) : '');
      setRegEndAt(details.reg_end_at ? new Date(details.reg_end_at).toISOString().slice(0, 16) : '');
      setCapacity(details.capacity?.toString() || '');
      setWaitlistEnabled(details.waitlist_enabled || false);
      setMode(details.mode || 'in_person');
      setVenueName(details.venue_name || '');
      setAddressLine1(details.address_line1 || '');
      setAddressLine2(details.address_line2 || '');
      setCity(details.city || '');
      setStateProvince(details.state || '');
      setZipCode(details.zip_code || '');
      setCountry(details.country || '');
      setMeetingUrl(details.meeting_url || '');
      setBannerImageUrl(details.banner_image_url || '');
      setPromoVideoUrl(details.promo_video_url || '');
      setAccessibilityNotes(details.accessibility_notes || '');
      setEmergencyContact(details.emergency_contact || '');

    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.response?.data?.message || 'Failed to load event details');
      toast.error('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData: UpdateEventGeneralDetailsInput = {
        name,
        description,
        category_id: categoryId,
        type: eventType,
        visibility,
        check_in_mode: checkInMode,
        owner,
        tag_ids: selectedTagIds,
        cohost_ids: coHostIds,
        start_date: startDate ? new Date(startDate).toISOString() : undefined,
        end_date: endDate ? new Date(endDate).toISOString() : undefined,
        all_day: allDay,
        timezone,
        reg_start_at: regStartAt ? new Date(regStartAt).toISOString() : undefined,
        reg_end_at: regEndAt ? new Date(regEndAt).toISOString() : undefined,
        capacity: capacity ? parseInt(capacity) : undefined,
        waitlist_enabled: waitlistEnabled,
        mode,
        venue_name: venueName,
        address_line1: addressLine1,
        address_line2: addressLine2,
        city,
        state: stateProvince,
        zip_code: zipCode,
        country,
        meeting_url: meetingUrl,
        banner_image_url: bannerImageUrl,
        promo_video_url: promoVideoUrl,
        accessibility_notes: accessibilityNotes,
        emergency_contact: emergencyContact,
      };

      const updated = await eventsAPI.updateEventGeneralDetails(eventId, updateData);
      setFormData(updated);
      toast.success('Event details saved successfully');
    } catch (err: any) {
      console.error('Error saving:', err);
      toast.error(err.response?.data?.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const newCat = await masterDataAPI.createCategory({ name: newCategoryName.trim() });
      setCategories([...categories, newCat]);
      setCategoryId(newCat.id);
      setNewCategoryName('');
      setIsAddCategoryOpen(false);
      toast.success('Category created successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create category');
    }
  };

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;
    try {
      const newTag = await masterDataAPI.createTag({ name: newTagName.trim(), color: newTagColor });
      setAvailableTags([...availableTags, newTag]);
      setSelectedTagIds([...selectedTagIds, newTag.id]);
      setNewTagName('');
      setIsAddTagOpen(false);
      toast.success('Tag created successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create tag');
    }
  };

  const toggleTag = (tagId: number) => {
    if (selectedTagIds.includes(tagId)) {
      setSelectedTagIds(selectedTagIds.filter(id => id !== tagId));
    } else {
      setSelectedTagIds([...selectedTagIds, tagId]);
    }
  };

  const toggleCoHost = (userId: number) => {
    if (coHostIds.includes(userId)) {
      setCoHostIds(coHostIds.filter(id => id !== userId));
    } else {
      setCoHostIds([...coHostIds, userId]);
    }
  };

  const getSelectedTags = () => availableTags.filter(t => selectedTagIds.includes(t.id));
  const getSelectedCoHosts = () => users.filter(u => coHostIds.includes(u.id));

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        <span className="ml-2 text-slate-500">Loading event details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={loadData}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6" data-testid="settings-general">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg text-[#1d293d]">General Details</h3>
        <Button 
          className="bg-[#0f172b]" 
          onClick={handleSave} 
          disabled={saving}
          data-testid="save-changes-btn"
        >
          {saving ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Save size={16} className="mr-2" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
      <Separator />
      
      {/* SECTION 1: EVENT BANNER */}
      <div className="grid gap-4">
        <h4 className="font-bold text-slate-900 flex items-center gap-2">
          <ImageIcon size={18} className="text-slate-400" /> Event Banner
        </h4>
        <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer group">
          <Upload size={32} className="text-slate-300 mb-2 group-hover:text-slate-400" />
          <p className="text-sm text-slate-500">Drag and drop your banner image here, or click to browse</p>
          <p className="text-xs text-slate-400 mt-1">Recommended size: 1920x600px</p>
        </div>
        {bannerImageUrl && (
          <div className="flex items-center gap-2">
            <Input 
              value={bannerImageUrl} 
              onChange={(e) => setBannerImageUrl(e.target.value)}
              placeholder="Banner image URL"
              className="flex-1"
            />
            <Button variant="ghost" size="icon" onClick={() => setBannerImageUrl('')}>
              <X size={16} />
            </Button>
          </div>
        )}
      </div>
      <Separator />

      {/* SECTION 2: BASIC INFO */}
      <div className="grid gap-4">
        <h4 className="font-bold text-slate-900 flex items-center gap-2">
          <FileText size={18} className="text-slate-400" /> Basic Information
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="event-name">Event Name *</Label>
            <Input 
              id="event-name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter event name"
              data-testid="event-name-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <div className="flex gap-2">
              <Select value={categoryId?.toString()} onValueChange={(v) => setCategoryId(parseInt(v))}>
                <SelectTrigger className="flex-1" data-testid="category-select">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={() => setIsAddCategoryOpen(true)}>
                <Plus size={16} />
              </Button>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea 
            id="description" 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your event..."
            rows={4}
            data-testid="description-input"
          />
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Event Type</Label>
            <Select value={eventType} onValueChange={setEventType}>
              <SelectTrigger data-testid="event-type-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conference">Conference</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
                <SelectItem value="meetup">Meetup</SelectItem>
                <SelectItem value="webinar">Webinar</SelectItem>
                <SelectItem value="seminar">Seminar</SelectItem>
                <SelectItem value="networking">Networking</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Visibility</Label>
            <Select value={visibility} onValueChange={setVisibility}>
              <SelectTrigger data-testid="visibility-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="unlisted">Unlisted</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Check-in Mode</Label>
            <Select value={checkInMode} onValueChange={setCheckInMode}>
              <SelectTrigger data-testid="checkin-mode-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="qr_code">QR Code</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <Separator />

      {/* SECTION 3: ORGANIZER & TAGS */}
      <div className="grid gap-4">
        <h4 className="font-bold text-slate-900 flex items-center gap-2">
          <Users size={18} className="text-slate-400" /> Organizer & Tags
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Event Owner</Label>
            <Input 
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="Owner name"
              data-testid="owner-input"
            />
          </div>
          <div className="space-y-2">
            <Label>Co-hosts</Label>
            <Popover open={coHostOpen} onOpenChange={setCoHostOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between" data-testid="cohosts-trigger">
                  {coHostIds.length > 0 ? `${coHostIds.length} selected` : "Select co-hosts"}
                  <ChevronsUpDown size={14} className="ml-2 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                <Command>
                  <CommandInput placeholder="Search users..." />
                  <CommandList>
                    <CommandEmpty>No users found.</CommandEmpty>
                    <CommandGroup>
                      {users.map((user) => (
                        <CommandItem key={user.id} onSelect={() => toggleCoHost(user.id)}>
                          <Check className={cn("mr-2 h-4 w-4", coHostIds.includes(user.id) ? "opacity-100" : "opacity-0")} />
                          <span>{user.name || user.email}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {coHostIds.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {getSelectedCoHosts().map((user) => (
                  <Badge key={user.id} variant="secondary" className="gap-1">
                    {user.name || user.email}
                    <X size={12} className="cursor-pointer" onClick={() => toggleCoHost(user.id)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label>Tags</Label>
          <Popover open={tagOpen} onOpenChange={setTagOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between" data-testid="tags-trigger">
                {selectedTagIds.length > 0 ? `${selectedTagIds.length} tags selected` : "Select tags"}
                <ChevronsUpDown size={14} className="ml-2 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput placeholder="Search tags..." />
                <CommandList>
                  <CommandEmpty>No tags found.</CommandEmpty>
                  <CommandGroup>
                    {availableTags.map((tag) => (
                      <CommandItem key={tag.id} onSelect={() => toggleTag(tag.id)}>
                        <Check className={cn("mr-2 h-4 w-4", selectedTagIds.includes(tag.id) ? "opacity-100" : "opacity-0")} />
                        <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: tag.color || '#3B82F6' }} />
                        {tag.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
              <div className="p-2 border-t">
                <Button variant="ghost" size="sm" className="w-full" onClick={() => { setTagOpen(false); setIsAddTagOpen(true); }}>
                  <Plus size={14} className="mr-2" /> Create new tag
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          {selectedTagIds.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {getSelectedTags().map((tag) => (
                <Badge key={tag.id} style={{ backgroundColor: tag.color || '#3B82F6' }} className="text-white gap-1">
                  {tag.name}
                  <X size={12} className="cursor-pointer" onClick={() => toggleTag(tag.id)} />
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
      <Separator />

      {/* SECTION 4: DATE & TIME */}
      <div className="grid gap-4">
        <h4 className="font-bold text-slate-900 flex items-center gap-2">
          <Calendar size={18} className="text-slate-400" /> Date & Time
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Start Date & Time</Label>
            <Input 
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              data-testid="start-date-input"
            />
          </div>
          <div className="space-y-2">
            <Label>End Date & Time</Label>
            <Input 
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              data-testid="end-date-input"
            />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Timezone</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger data-testid="timezone-select">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                <SelectItem value="Europe/London">London (GMT)</SelectItem>
                <SelectItem value="Europe/Paris">Central European (CET)</SelectItem>
                <SelectItem value="Asia/Tokyo">Japan (JST)</SelectItem>
                <SelectItem value="Asia/Singapore">Singapore (SGT)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2 pt-8">
            <Switch checked={allDay} onCheckedChange={setAllDay} id="all-day" />
            <Label htmlFor="all-day">All-day event</Label>
          </div>
        </div>
      </div>
      <Separator />

      {/* SECTION 5: REGISTRATION */}
      <div className="grid gap-4">
        <h4 className="font-bold text-slate-900 flex items-center gap-2">
          <Clock size={18} className="text-slate-400" /> Registration Settings
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Registration Opens</Label>
            <Input 
              type="datetime-local"
              value={regStartAt}
              onChange={(e) => setRegStartAt(e.target.value)}
              data-testid="reg-start-input"
            />
          </div>
          <div className="space-y-2">
            <Label>Registration Closes</Label>
            <Input 
              type="datetime-local"
              value={regEndAt}
              onChange={(e) => setRegEndAt(e.target.value)}
              data-testid="reg-end-input"
            />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Capacity</Label>
            <Input 
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="Maximum attendees"
              data-testid="capacity-input"
            />
          </div>
          <div className="flex items-center space-x-2 pt-8">
            <Switch checked={waitlistEnabled} onCheckedChange={setWaitlistEnabled} id="waitlist" />
            <Label htmlFor="waitlist">Enable waitlist when capacity is reached</Label>
          </div>
        </div>
      </div>
      <Separator />

      {/* SECTION 6: LOCATION */}
      <div className="grid gap-4">
        <h4 className="font-bold text-slate-900 flex items-center gap-2">
          <MapPin size={18} className="text-slate-400" /> Location
        </h4>
        <div className="space-y-2">
          <Label>Event Mode</Label>
          <div className="flex gap-2">
            {['in_person', 'virtual', 'hybrid'].map((m) => (
              <Button
                key={m}
                variant={mode === m ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode(m)}
                className={mode === m ? 'bg-[#0f172b]' : ''}
                data-testid={`mode-${m}-btn`}
              >
                {m === 'in_person' && <MapPin size={14} className="mr-1" />}
                {m === 'virtual' && <Video size={14} className="mr-1" />}
                {m === 'hybrid' && <Globe size={14} className="mr-1" />}
                {m.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Button>
            ))}
          </div>
        </div>
        
        {(mode === 'in_person' || mode === 'hybrid') && (
          <>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Venue Name</Label>
                <Input 
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  placeholder="Enter venue name"
                  data-testid="venue-name-input"
                />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Input 
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Country"
                  data-testid="country-input"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address Line 1</Label>
              <Input 
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                placeholder="Street address"
                data-testid="address1-input"
              />
            </div>
            <div className="space-y-2">
              <Label>Address Line 2</Label>
              <Input 
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                placeholder="Suite, floor, etc."
              />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  data-testid="city-input"
                />
              </div>
              <div className="space-y-2">
                <Label>State/Province</Label>
                <Input 
                  value={stateProvince}
                  onChange={(e) => setStateProvince(e.target.value)}
                  placeholder="State"
                />
              </div>
              <div className="space-y-2">
                <Label>ZIP/Postal Code</Label>
                <Input 
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="ZIP Code"
                />
              </div>
            </div>
          </>
        )}
        
        {(mode === 'virtual' || mode === 'hybrid') && (
          <div className="space-y-2">
            <Label>Meeting URL</Label>
            <Input 
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              placeholder="https://zoom.us/j/..."
              data-testid="meeting-url-input"
            />
          </div>
        )}
      </div>
      <Separator />

      {/* SECTION 7: EVENT MEDIA */}
      <div className="grid gap-4">
        <h4 className="font-bold text-slate-900 flex items-center gap-2">
          <Video size={18} className="text-slate-400" /> Event Media
        </h4>
        <div className="space-y-2">
          <Label>Promo Video URL</Label>
          <Input 
            value={promoVideoUrl}
            onChange={(e) => setPromoVideoUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            data-testid="promo-video-input"
          />
          <p className="text-xs text-slate-400">YouTube or Vimeo URL</p>
        </div>
        <div className="space-y-2">
          <Label>Event Photos</Label>
          <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer">
            <Upload size={24} className="text-slate-300 mb-2" />
            <p className="text-sm text-slate-500">Drag and drop photos here</p>
            <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB each</p>
          </div>
        </div>
      </div>
      <Separator />

      {/* SECTION 8: ACCESSIBILITY & SAFETY */}
      <div className="grid gap-4">
        <h4 className="font-bold text-slate-900 flex items-center gap-2">
          <ShieldAlert size={18} className="text-slate-400" /> Accessibility & Safety
        </h4>
        <div className="space-y-2">
          <Label>Accessibility Information</Label>
          <Textarea 
            value={accessibilityNotes}
            onChange={(e) => setAccessibilityNotes(e.target.value)}
            placeholder="Describe accessibility features (wheelchair access, hearing loops, etc.)"
            rows={3}
            data-testid="accessibility-input"
          />
        </div>
        <div className="space-y-2">
          <Label>Emergency Contact</Label>
          <Input 
            value={emergencyContact}
            onChange={(e) => setEmergencyContact(e.target.value)}
            placeholder="+1 (555) 000-0000"
            data-testid="emergency-contact-input"
          />
          <p className="text-xs text-slate-400">Contact number for emergencies during the event</p>
        </div>
      </div>

      {/* ADD CATEGORY DIALOG */}
      <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>Add a new category for your events.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Category Name</Label>
              <Input 
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter category name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCategoryOpen(false)}>Cancel</Button>
            <Button onClick={handleAddCategory}>Create Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ADD TAG DIALOG */}
      <Dialog open={isAddTagOpen} onOpenChange={setIsAddTagOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Tag</DialogTitle>
            <DialogDescription>Add a new tag for your events.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tag Name</Label>
              <Input 
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Enter tag name"
              />
            </div>
            <div className="space-y-2">
              <Label>Tag Color</Label>
              <div className="flex gap-2">
                {['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#EF4444'].map((color) => (
                  <button
                    key={color}
                    className={cn("w-8 h-8 rounded-full border-2", newTagColor === color ? "border-slate-900" : "border-transparent")}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewTagColor(color)}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTagOpen(false)}>Cancel</Button>
            <Button onClick={handleAddTag}>Create Tag</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
