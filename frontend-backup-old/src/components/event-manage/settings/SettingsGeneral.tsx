import React, { useState } from 'react';
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
  Trash2
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
  CommandSeparator,
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
import { DateTimePicker } from "../../ui/datetime-picker";
import { cn } from "../../ui/utils";
import { toast } from "sonner";

// Mock Data
const existingTags = ["Technology", "Innovation", "Networking", "Business", "Startup", "AI", "Design"];
const teamMembers = [
    { value: "mike", label: "Mike Johnson" },
    { value: "sarah", label: "Sarah Williams" },
    { value: "alex", label: "Alex Chen" },
    { value: "emily", label: "Emily Davis" }
];

const MOCK_VENUES = [
  { id: 'ven_1', name: 'ExCeL London', address: 'Royal Victoria Dock, London E16 1XL, UK' },
  { id: 'ven_2', name: 'Moscone Center', address: '747 Howard St, San Francisco, CA 94103, USA' },
];

export const SettingsGeneral = () => {
  // ALL STATE DECLARATIONS
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [regOpen, setRegOpen] = useState<Date>();
  const [regClose, setRegClose] = useState<Date>();
  const [eventMode, setEventMode] = useState('hybrid');
  const [categories, setCategories] = useState([
    { value: 'conference', label: 'Conference' },
    { value: 'awards', label: 'Awards' },
    { value: 'meetup', label: 'Meetup' },
    { value: 'workshop', label: 'Workshop' },
  ]);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [coHosts, setCoHosts] = useState<string[]>([]);
  const [coHostOpen, setCoHostOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(["Technology", "Innovation"]);
  const [tagOpen, setTagOpen] = useState(false);
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [availableTags, setAvailableTags] = useState(existingTags);
  const [address, setAddress] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const [capacity, setCapacity] = useState('500');
  const [waitlistEnabled, setWaitlistEnabled] = useState(true);
  const [agendaItems, setAgendaItems] = useState<Array<{
    title: string;
    startTime: string;
    endTime: string;
    description: string;
  }>>([]);

  // ALL HANDLERS
  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const newId = newCategoryName.toLowerCase().replace(/\s+/g, '-');
      setCategories([...categories, { value: newId, label: newCategoryName }]);
      setNewCategoryName('');
      setIsAddCategoryOpen(false);
      toast.success('Category added successfully');
    }
  };

  const toggleCoHost = (value: string) => {
    if (coHosts.includes(value)) {
        setCoHosts(coHosts.filter(id => id !== value));
    } else {
        setCoHosts([...coHosts, value]);
    }
  };

  const toggleTag = (tag: string) => {
      if (selectedTags.includes(tag)) {
          setSelectedTags(selectedTags.filter(t => t !== tag));
      } else {
          setSelectedTags([...selectedTags, tag]);
      }
  };

  const handleCreateTag = () => {
      if (newTagName && !availableTags.includes(newTagName)) {
          setAvailableTags([...availableTags, newTagName]);
          setSelectedTags([...selectedTags, newTagName]);
          setNewTagName("");
          setIsTagDialogOpen(false);
          toast.success('Tag created successfully');
      }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setAddress(val);
      if (val.length > 3) {
          setAddressSuggestions([
              `${val} Street, London, UK`,
              `${val} Avenue, New York, USA`,
              `${val} Road, Sydney, Australia`
          ]);
          setIsAddressOpen(true);
      } else {
          setAddressSuggestions([]);
          setIsAddressOpen(false);
      }
  };

  const selectAddress = (addr: string) => {
      setAddress(addr);
      setIsAddressOpen(false);
  };
  
  const handleAddAgendaItem = () => {
    setAgendaItems([...agendaItems, {
      title: '',
      startTime: '',
      endTime: '',
      description: ''
    }]);
  };
  
  const handleRemoveAgendaItem = (index: number) => {
    setAgendaItems(agendaItems.filter((_, i) => i !== index));
  };
  
  const updateAgendaItem = (index: number, field: string, value: string) => {
    const updated = [...agendaItems];
    updated[index] = { ...updated[index], [field]: value };
    setAgendaItems(updated);
  };

  return (
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
          {/* HEADER */}
          <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-[#1d293d]">General Details</h3>
              <Button className="bg-[#0f172b]"><Save size={16} className="mr-2" /> Save Changes</Button>
          </div>
          <Separator />
          
          {/* SECTION 1: EVENT BANNER */}
          <div className="grid gap-4">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <ImageIcon size={18} className="text-slate-400" /> Event Banner
              </h4>
              <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="bg-slate-100 p-3 rounded-full mb-3 group-hover:bg-slate-200 transition-colors">
                  <ImageIcon className="text-slate-400" size={24} />
                </div>
                <p className="text-sm font-medium text-slate-700">Drag & drop or click to upload</p>
                <p className="text-xs text-slate-400 mt-1">Recommended size: 2160x1080px (2:1 ratio)</p>
              </div>
          </div>
          
          <Separator />
          
          {/* SECTION 2: BASIC INFO WITH EVENT NAME, CATEGORY, DESCRIPTION */}
          <div className="grid gap-6">
              {/* Event Name + Category Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="grid gap-2">
                      <Label>Event Name <span className="text-red-500">*</span></Label>
                      <Input defaultValue="Global Tech Summit 2024" />
                  </div>
                  <div className="grid gap-2">
                      <Label>Category <span className="text-red-500">*</span></Label>
                      <Select defaultValue="conference">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                          ))}
                          <SelectItem value="ADD_NEW" className="text-blue-600 font-medium">+ Add New Category</SelectItem>
                        </SelectContent>
                      </Select>
                  </div>
              </div>
              
              {/* Description */}
              <div className="grid gap-2">
                  <Label>Description</Label>
                  <Textarea defaultValue="A comprehensive technology summit bringing together industry leaders and innovators." className="min-h-[100px]" />
              </div>

              {/* Event Type, Visibility, Check-in Mode */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="grid gap-2">
                      <Label>Event Type</Label>
                      <Select defaultValue="public">
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="public">Public</SelectItem>
                                <SelectItem value="private">Private</SelectItem>
                            </SelectContent>
                      </Select>
                  </div>
                  <div className="grid gap-2">
                      <Label>Visibility</Label>
                      <Select defaultValue="public">
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="public">Public (Listed)</SelectItem>
                                <SelectItem value="private">Private (Unlisted)</SelectItem>
                                <SelectItem value="invite">Invite Only</SelectItem>
                            </SelectContent>
                      </Select>
                  </div>
                  <div className="grid gap-2">
                      <Label>Check-in Mode</Label>
                      <Select defaultValue="both">
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="qr">QR Code Scan</SelectItem>
                                <SelectItem value="manual">Manual Lookup</SelectItem>
                                <SelectItem value="both">Both</SelectItem>
                            </SelectContent>
                      </Select>
                  </div>
              </div>

              {/* Event Owner */}
              <div className="grid gap-2">
                  <Label>Event Owner</Label>
                  <Select defaultValue="sarah">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="sarah">Sarah Williams (You)</SelectItem>
                            <SelectItem value="mike">Mike Johnson</SelectItem>
                            <SelectItem value="admin">Admin Team</SelectItem>
                        </SelectContent>
                  </Select>
              </div>

              {/* CRITICAL PATTERN: CO-HOSTS MULTI-SELECT */}
              <div className="grid gap-2">
                  <Label>Co-hosts</Label>
                  <Popover open={coHostOpen} onOpenChange={setCoHostOpen}>
                      <PopoverTrigger asChild>
                          <Button variant="outline" role="combobox" aria-expanded={coHostOpen} className="w-full justify-between h-auto min-h-[40px]">
                              {coHosts.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                      {coHosts.map(hostId => {
                                          const member = teamMembers.find(m => m.value === hostId);
                                          return (
                                              <Badge key={hostId} variant="secondary" className="mr-1">
                                                  {member?.label}
                                                  <X className="ml-1 h-3 w-3 cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleCoHost(hostId); }} />
                                              </Badge>
                                          );
                                      })}
                                  </div>
                              ) : (
                                  <span className="text-muted-foreground">Select co-hosts...</span>
                              )}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0">
                          <Command>
                              <CommandInput placeholder="Search team..." />
                              <CommandList>
                                  <CommandEmpty>No team member found.</CommandEmpty>
                                  <CommandGroup>
                                      {teamMembers.map((member) => (
                                          <CommandItem key={member.value} value={member.label} onSelect={() => toggleCoHost(member.value)}>
                                              <Check className={cn("mr-2 h-4 w-4", coHosts.includes(member.value) ? "opacity-100" : "opacity-0")} />
                                              {member.label}
                                          </CommandItem>
                                      ))}
                                  </CommandGroup>
                              </CommandList>
                          </Command>
                      </PopoverContent>
                  </Popover>
              </div>

              {/* CRITICAL PATTERN: TAGS MULTI-SELECT WITH CREATE NEW */}
              <div className="grid gap-2">
                    <Label>Event Tags</Label>
                    <Popover open={tagOpen} onOpenChange={setTagOpen}>
                      <PopoverTrigger asChild>
                          <Button variant="outline" role="combobox" aria-expanded={tagOpen} className="w-full justify-between h-auto min-h-[40px]">
                              {selectedTags.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                      {selectedTags.map(tag => (
                                          <Badge key={tag} variant="secondary" className="mr-1">
                                              {tag}
                                              <X className="ml-1 h-3 w-3 cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleTag(tag); }} />
                                          </Badge>
                                      ))}
                                  </div>
                              ) : (
                                  <span className="text-muted-foreground">Select tags...</span>
                              )}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0">
                          <Command>
                              <CommandInput placeholder="Search tags..." />
                              <CommandList>
                                  <CommandEmpty>No tags found.</CommandEmpty>
                                  <CommandGroup heading="Existing Tags">
                                      {availableTags.map((tag) => (
                                          <CommandItem key={tag} value={tag} onSelect={() => toggleTag(tag)}>
                                              <Check className={cn("mr-2 h-4 w-4", selectedTags.includes(tag) ? "opacity-100" : "opacity-0")} />
                                              {tag}
                                          </CommandItem>
                                      ))}
                                  </CommandGroup>
                                  <CommandSeparator />
                                  <CommandGroup>
                                      <CommandItem onSelect={() => { setIsTagDialogOpen(true); setTagOpen(false); }}>
                                          <Plus className="mr-2 h-4 w-4" /> Create New Tag
                                      </CommandItem>
                                  </CommandGroup>
                              </CommandList>
                          </Command>
                      </PopoverContent>
                  </Popover>

                  {/* Create Tag Dialog */}
                  <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Tag</DialogTitle>
                                <DialogDescription>Create a new tag for your event.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label>Tag Name</Label>
                                    <Input value={newTagName} onChange={(e) => setNewTagName(e.target.value)} placeholder="e.g. Workshop" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsTagDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleCreateTag}>Create Tag</Button>
                            </DialogFooter>
                        </DialogContent>
                  </Dialog>
              </div>

              <Separator />

              {/* SECTION 3: DATE & TIME */}
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <Calendar size={18} className="text-slate-400" /> Date & Time
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="grid gap-2">
                      <Label>Start Date & Time <span className="text-red-500">*</span></Label>
                      <DateTimePicker value={startDate} onChange={setStartDate} />
                  </div>
                  <div className="grid gap-2">
                      <Label>End Date & Time <span className="text-red-500">*</span></Label>
                      <DateTimePicker value={endDate} onChange={setEndDate} />
                  </div>
              </div>
              
              <div className="grid gap-2">
                  <Label>Timezone</Label>
                  <Select defaultValue="gmt">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                          <SelectItem value="gmt">London (GMT/BST)</SelectItem>
                          <SelectItem value="est">New York (EST/EDT)</SelectItem>
                          <SelectItem value="pst">Los Angeles (PST/PDT)</SelectItem>
                          <SelectItem value="jst">Tokyo (JST)</SelectItem>
                      </SelectContent>
                  </Select>
              </div>

              <Separator />

              {/* SECTION 4: REGISTRATION WINDOW */}
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <Users size={18} className="text-slate-400" /> Registration Window
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="grid gap-2">
                      <Label>Registration Opens</Label>
                      <DateTimePicker value={regOpen} onChange={setRegOpen} />
                  </div>
                  <div className="grid gap-2">
                      <Label>Registration Closes</Label>
                      <DateTimePicker value={regClose} onChange={setRegClose} />
                  </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <div className="grid gap-2">
                  <Label htmlFor="capacity">Max Capacity</Label>
                  <Input 
                    id="capacity" 
                    type="number" 
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="Unlimited" 
                  />
                </div>
                <div className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-slate-50/50">
                  <div className="space-y-0.5">
                    <Label className="text-slate-900 font-medium">Enable Waitlist</Label>
                    <p className="text-xs text-slate-500">Allow signups after full</p>
                  </div>
                  <Switch checked={waitlistEnabled} onCheckedChange={setWaitlistEnabled} />
                </div>
              </div>

              <Separator />

              {/* SECTION 5: LOCATION & MODE */}
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <MapPin size={18} className="text-slate-400" /> Location & Mode
              </h4>
              
              <div className="grid gap-2">
                  <Label>Event Mode</Label>
                  <Select value={eventMode} onValueChange={setEventMode}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="in-person">In-Person</SelectItem>
                            <SelectItem value="online">Virtual / Online</SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                  </Select>
              </div>

              {/* CONDITIONAL: IN-PERSON/HYBRID FIELDS */}
              {(eventMode === 'in-person' || eventMode === 'hybrid') && (
                <div className="grid gap-4 pt-4 border-t border-slate-100">
                    <div className="grid gap-2">
                        <Label>Venue Preset</Label>
                        <Select>
                          <SelectTrigger><SelectValue placeholder="Select a saved venue or enter custom" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="custom">Custom Location</SelectItem>
                            {MOCK_VENUES.map(v => (
                              <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="grid gap-2">
                        <Label>Venue Name</Label>
                        <Input placeholder="e.g. ExCeL London" />
                    </div>
                    
                    {/* CRITICAL PATTERN: ADDRESS AUTOCOMPLETE */}
                    <div className="grid gap-2 relative">
                        <Label>Address</Label>
                        <Popover open={isAddressOpen} onOpenChange={setIsAddressOpen}>
                            <PopoverTrigger asChild>
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        placeholder="Start typing address..." 
                                        className="pl-9"
                                        value={address}
                                        onChange={handleAddressChange}
                                        autoComplete="off"
                                    />
                                </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
                                <Command>
                                    <CommandList>
                                        <CommandGroup heading="Suggestions">
                                            {addressSuggestions.map((addr, i) => (
                                                <CommandItem key={i} value={addr} onSelect={() => selectAddress(addr)}>
                                                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                                                    {addr}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        <p className="text-xs text-slate-500">We'll automatically detect city, state, and zip code.</p>
                    </div>

                    <div className="grid gap-2">
                        <Label>Google Maps Link (Optional)</Label>
                        <Input placeholder="https://maps.google.com/..." />
                    </div>
                </div>
              )}
              
              {/* CONDITIONAL: VIRTUAL/HYBRID FIELDS */}
              {(eventMode === 'online' || eventMode === 'hybrid') && (
                <div className="grid gap-2 pt-4 border-t border-slate-100">
                  <Label>Meeting URL</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 text-slate-400" size={16} />
                    <Input placeholder="https://zoom.us/j/..." className="pl-9" />
                  </div>
                  <p className="text-xs text-slate-500">Link for attendees to join the virtual session</p>
                </div>
              )}

              <Separator />

              {/* SECTION 6: EVENT AGENDA (Dynamic List) */}
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                    <FileText size={18} className="text-slate-400" /> Event Agenda
                </h4>
                <Button variant="outline" size="sm" onClick={handleAddAgendaItem}>
                  <Plus size={14} className="mr-1" /> Add Item
                </Button>
              </div>
              
              <div className="space-y-3">
                {agendaItems.map((item, index) => (
                  <div key={index} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-4 relative group">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                      onClick={() => handleRemoveAgendaItem(index)}
                    >
                      <Trash2 size={16} />
                    </Button>

                    <div className="grid gap-2">
                      <Label className="text-sm">Agenda Title</Label>
                      <Input 
                        placeholder="e.g. Opening Keynote" 
                        value={item.title}
                        onChange={(e) => updateAgendaItem(index, 'title', e.target.value)}
                        className="bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label className="text-sm">Start Time</Label>
                        <Input 
                          type="time" 
                          value={item.startTime}
                          onChange={(e) => updateAgendaItem(index, 'startTime', e.target.value)}
                          className="bg-white"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-sm">End Time</Label>
                        <Input 
                          type="time" 
                          value={item.endTime}
                          onChange={(e) => updateAgendaItem(index, 'endTime', e.target.value)}
                          className="bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label className="text-sm">Description</Label>
                      <Textarea 
                        placeholder="Brief details about this session" 
                        value={item.description}
                        onChange={(e) => updateAgendaItem(index, 'description', e.target.value)}
                        className="min-h-[60px] bg-white resize-none"
                      />
                    </div>
                  </div>
                ))}
                
                {agendaItems.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-xl">
                    <p className="text-slate-400 text-sm">No agenda items added yet</p>
                  </div>
                )}
              </div>
          </div>
      </div>
  );
};
