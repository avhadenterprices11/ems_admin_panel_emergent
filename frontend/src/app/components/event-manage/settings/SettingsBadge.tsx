import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Printer,
  Move,
  Plus,
  Trash2,
  Copy,
  Check,
  Loader2,
  QrCode,
  Eye,
  EyeOff,
  Palette
} from 'lucide-react';
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Separator } from "../../ui/separator";
import { Slider } from "../../ui/slider";
import { Switch } from "../../ui/switch";
import { Badge } from "../../ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../ui/select";
import { Checkbox } from "../../ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { toast } from 'sonner';
import { 
  badgeDesignAPI, 
  eventsAPI,
  BadgeDesign, 
  BadgeDesignConfig, 
  CreateBadgeDesignInput,
  Ticket 
} from '../../../api/events.api';

interface SettingsBadgeProps {
  eventId: number;
}

const DEFAULT_VISIBLE_FIELDS = [
  { id: 'full_name', label: 'Full Name', checked: true },
  { id: 'ticket_type', label: 'Ticket Type', checked: true },
  { id: 'company', label: 'Company / Organization', checked: true },
  { id: 'job_title', label: 'Job Title', checked: true },
  { id: 'qr_code', label: 'QR Code', checked: true },
  { id: 'unique_code', label: 'Unique Code', checked: false },
  { id: 'event_name', label: 'Event Name', checked: false },
  { id: 'event_date', label: 'Event Date', checked: false },
];

const BADGE_SIZES = [
  { value: 'a6', label: 'A6 (105 x 148 mm)' },
  { value: 'credit', label: 'Credit Card (85 x 54 mm)' },
  { value: 'a7', label: 'A7 (74 x 105 mm)' },
  { value: 'custom', label: 'Custom Size' },
];

export const SettingsBadge: React.FC<SettingsBadgeProps> = ({ eventId }) => {
  // State
  const [designs, setDesigns] = useState<BadgeDesign[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedDesign, setSelectedDesign] = useState<BadgeDesign | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form state for selected design
  const [name, setName] = useState('');
  const [ticketTypeId, setTicketTypeId] = useState<string>('');
  const [badgeSize, setBadgeSize] = useState('a6');
  const [customWidth, setCustomWidth] = useState<number>(105);
  const [customHeight, setCustomHeight] = useState<number>(148);
  const [orientation, setOrientation] = useState('portrait');
  const [isEventDefault, setIsEventDefault] = useState(false);
  const [visibleFields, setVisibleFields] = useState<string[]>(['full_name', 'ticket_type', 'company', 'job_title', 'qr_code']);
  const [fontSizeScale, setFontSizeScale] = useState(1.0);
  const [primaryColor, setPrimaryColor] = useState('#0f172b');
  const [secondaryColor, setSecondaryColor] = useState('#3b82f6');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [showPunchHole, setShowPunchHole] = useState(true);
  const [qrCodeSize, setQrCodeSize] = useState(80);

  // New design form
  const [newDesignName, setNewDesignName] = useState('');
  const [newDesignTicketType, setNewDesignTicketType] = useState<string>('');

  // Fetch data
  const fetchDesigns = async () => {
    try {
      setLoading(true);
      const [designsData, ticketsData] = await Promise.all([
        badgeDesignAPI.getDesigns(eventId),
        eventsAPI.getTickets(eventId)
      ]);
      setDesigns(designsData);
      setTickets(ticketsData);
      
      // Select first design by default
      if (designsData.length > 0 && !selectedDesign) {
        selectDesign(designsData[0]);
      }
    } catch (error) {
      console.error('Error fetching badge designs:', error);
      toast.error('Failed to load badge designs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesigns();
  }, [eventId]);

  // Select a design and populate form
  const selectDesign = (design: BadgeDesign) => {
    setSelectedDesign(design);
    setName(design.name);
    setTicketTypeId(design.ticket_type_id?.toString() || '');
    setBadgeSize(design.badge_size);
    setCustomWidth(design.custom_width || 105);
    setCustomHeight(design.custom_height || 148);
    setOrientation(design.orientation);
    setIsEventDefault(design.is_event_default);
    setVisibleFields(design.design_config.visible_fields || []);
    setFontSizeScale(design.design_config.font_size_scale || 1.0);
    setPrimaryColor(design.design_config.primary_color || '#0f172b');
    setSecondaryColor(design.design_config.secondary_color || '#3b82f6');
    setBackgroundColor(design.design_config.background_color || '#ffffff');
    setLogoUrl(design.design_config.logo_url);
    setShowPunchHole(design.design_config.show_punch_hole !== false);
    setQrCodeSize(design.design_config.qr_code_size || 80);
  };

  // Toggle visible field
  const toggleField = (fieldId: string) => {
    setVisibleFields(prev => 
      prev.includes(fieldId) 
        ? prev.filter(f => f !== fieldId)
        : [...prev, fieldId]
    );
  };

  // Create new design
  const handleCreateDesign = async () => {
    if (!newDesignName.trim()) {
      toast.error('Please enter a design name');
      return;
    }

    try {
      setSaving(true);
      const data: CreateBadgeDesignInput = {
        name: newDesignName.trim(),
        ticket_type_id: newDesignTicketType && newDesignTicketType !== 'all' ? parseInt(newDesignTicketType) : null,
        is_event_default: false
      };
      const newDesign = await badgeDesignAPI.createDesign(eventId, data);
      toast.success('Badge design created');
      setIsCreateOpen(false);
      setNewDesignName('');
      setNewDesignTicketType('');
      await fetchDesigns();
      selectDesign(newDesign);
    } catch (error) {
      console.error('Error creating design:', error);
      toast.error('Failed to create design');
    } finally {
      setSaving(false);
    }
  };

  // Save current design
  const handleSave = async () => {
    if (!selectedDesign) return;

    try {
      setSaving(true);
      const designConfig: Partial<BadgeDesignConfig> = {
        visible_fields: visibleFields,
        font_size_scale: fontSizeScale,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        background_color: backgroundColor,
        logo_url: logoUrl,
        show_punch_hole: showPunchHole,
        qr_code_size: qrCodeSize
      };

      await badgeDesignAPI.updateDesign(eventId, selectedDesign.id, {
        name,
        is_event_default: isEventDefault,
        badge_size: badgeSize,
        custom_width: badgeSize === 'custom' ? customWidth : null,
        custom_height: badgeSize === 'custom' ? customHeight : null,
        orientation,
        design_config: designConfig
      });

      toast.success('Badge design saved');
      fetchDesigns();
    } catch (error) {
      console.error('Error saving design:', error);
      toast.error('Failed to save design');
    } finally {
      setSaving(false);
    }
  };

  // Delete design
  const handleDelete = async () => {
    if (!selectedDesign || selectedDesign.is_global_default) return;

    try {
      await badgeDesignAPI.deleteDesign(eventId, selectedDesign.id);
      toast.success('Badge design deleted');
      setSelectedDesign(null);
      fetchDesigns();
    } catch (error) {
      console.error('Error deleting design:', error);
      toast.error('Failed to delete design');
    }
  };

  // Duplicate design
  const handleDuplicate = async () => {
    if (!selectedDesign) return;

    try {
      const newDesign = await badgeDesignAPI.duplicateDesign(eventId, selectedDesign.id);
      toast.success('Badge design duplicated');
      fetchDesigns();
      selectDesign(newDesign);
    } catch (error) {
      console.error('Error duplicating design:', error);
      toast.error('Failed to duplicate design');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg text-[#1d293d]">Badge Design</h3>
            <p className="text-sm text-slate-500 mt-1">
              Design ticket badges for different ticket types. The design will be used when printing badges or generating tickets.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsCreateOpen(true)} data-testid="create-badge-design-btn">
              <Plus size={16} className="mr-2" /> New Design
            </Button>
          </div>
        </div>
      </div>

      {/* Design Selector */}
      {designs.length > 0 && (
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <Label className="text-sm font-medium mb-2 block">Select Design</Label>
          <div className="flex flex-wrap gap-2">
            {designs.map((design) => (
              <button
                key={design.id}
                onClick={() => selectDesign(design)}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  selectedDesign?.id === design.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                data-testid={`badge-design-${design.id}`}
              >
                <span className="font-medium">{design.name}</span>
                {design.is_global_default && (
                  <Badge variant="secondary" className="ml-2 text-xs">Global</Badge>
                )}
                {design.is_event_default && (
                  <Badge variant="outline" className="ml-2 text-xs">Default</Badge>
                )}
                {design.ticket_type_name && (
                  <Badge className="ml-2 text-xs bg-violet-100 text-violet-700">{design.ticket_type_name}</Badge>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Design Editor */}
      {selectedDesign && (
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-[#1d293d]">
              Editing: {selectedDesign.name}
            </h3>
            <div className="flex gap-2">
              {!selectedDesign.is_global_default && (
                <Button variant="outline" size="sm" onClick={handleDelete}>
                  <Trash2 size={14} className="mr-1" /> Delete
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleDuplicate}>
                <Copy size={14} className="mr-1" /> Duplicate
              </Button>
              <Button variant="outline" size="sm">
                <Printer size={14} className="mr-1" /> Print Test
              </Button>
              <Button 
                className="bg-[#0f172b]" 
                size="sm" 
                onClick={handleSave}
                disabled={saving}
                data-testid="save-badge-design-btn"
              >
                {saving ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Save size={14} className="mr-1" />}
                Save Design
              </Button>
            </div>
          </div>
          <Separator className="mb-6" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Settings Column */}
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label>Design Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1"
                    data-testid="badge-design-name"
                  />
                </div>

                {!selectedDesign.is_global_default && (
                  <div>
                    <Label>Ticket Type (Optional)</Label>
                    <Select value={ticketTypeId} onValueChange={setTicketTypeId}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Apply to all tickets" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Apply to all tickets</SelectItem>
                        {tickets.map((ticket) => (
                          <SelectItem key={ticket.id} value={ticket.id.toString()}>
                            {ticket.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-500 mt-1">
                      Assign this design to a specific ticket type
                    </p>
                  </div>
                )}

                {!selectedDesign.is_global_default && (
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Set as Event Default</Label>
                      <p className="text-xs text-slate-500">Used when no ticket-specific design exists</p>
                    </div>
                    <Switch
                      checked={isEventDefault}
                      onCheckedChange={setIsEventDefault}
                    />
                  </div>
                )}
              </div>

              <Separator />

              {/* Badge Size */}
              <div className="space-y-4">
                <div>
                  <Label>Badge Size</Label>
                  <Select value={badgeSize} onValueChange={setBadgeSize}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BADGE_SIZES.map((size) => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {badgeSize === 'custom' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Width (mm)</Label>
                      <Input
                        type="number"
                        value={customWidth}
                        onChange={(e) => setCustomWidth(parseInt(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Height (mm)</Label>
                      <Input
                        type="number"
                        value={customHeight}
                        onChange={(e) => setCustomHeight(parseInt(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <Label>Orientation</Label>
                  <div className="flex gap-2 mt-1">
                    <Button
                      variant={orientation === 'portrait' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setOrientation('portrait')}
                    >
                      Portrait
                    </Button>
                    <Button
                      variant={orientation === 'landscape' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setOrientation('landscape')}
                    >
                      Landscape
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Visible Fields */}
              <div className="space-y-4">
                <Label>Visible Fields</Label>
                <div className="space-y-2">
                  {DEFAULT_VISIBLE_FIELDS.map((field) => (
                    <div 
                      key={field.id} 
                      className="flex items-center space-x-2 border p-3 rounded-lg bg-white hover:bg-slate-50 cursor-pointer"
                      onClick={() => toggleField(field.id)}
                    >
                      <Move size={14} className="text-slate-400 cursor-move" />
                      <Checkbox
                        id={field.id}
                        checked={visibleFields.includes(field.id)}
                        onCheckedChange={() => toggleField(field.id)}
                      />
                      <label htmlFor={field.id} className="text-sm font-medium cursor-pointer flex-1">
                        {field.label}
                      </label>
                      {visibleFields.includes(field.id) ? (
                        <Eye size={14} className="text-green-500" />
                      ) : (
                        <EyeOff size={14} className="text-slate-300" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Style Options */}
              <div className="space-y-4">
                <Label>Style Options</Label>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <Label className="text-sm">Font Size Scale</Label>
                    <span className="text-xs text-slate-500">{fontSizeScale.toFixed(1)}x</span>
                  </div>
                  <Slider 
                    value={[fontSizeScale * 50]} 
                    onValueChange={([v]) => setFontSizeScale(v / 50)}
                    max={100} 
                    step={5} 
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <Label className="text-sm">QR Code Size</Label>
                    <span className="text-xs text-slate-500">{qrCodeSize}px</span>
                  </div>
                  <Slider 
                    value={[qrCodeSize]} 
                    onValueChange={([v]) => setQrCodeSize(v)}
                    min={40}
                    max={150} 
                    step={10} 
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-sm">Primary Color</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer"
                      />
                      <Input
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="flex-1 font-mono text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm">Secondary Color</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer"
                      />
                      <Input
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="flex-1 font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm">Show Punch Hole</Label>
                  <Switch
                    checked={showPunchHole}
                    onCheckedChange={setShowPunchHole}
                  />
                </div>
              </div>
            </div>

            {/* Preview Area */}
            <div className="lg:col-span-2 bg-slate-100 rounded-xl p-8 flex items-center justify-center min-h-[500px]">
              <div 
                className="bg-white shadow-lg rounded-lg border border-slate-200 relative overflow-hidden flex flex-col items-center px-6 text-center transition-all"
                style={{
                  width: orientation === 'portrait' ? '300px' : '420px',
                  height: orientation === 'portrait' ? '420px' : '300px',
                  backgroundColor: backgroundColor,
                  paddingTop: showPunchHole ? '64px' : '32px'
                }}
              >
                {/* Punch Hole */}
                {showPunchHole && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-200 rounded-full"></div>
                )}

                {/* Logo Placeholder */}
                <div 
                  className="rounded mb-4"
                  style={{ 
                    height: '40px', 
                    width: '100px', 
                    backgroundColor: primaryColor 
                  }}
                ></div>

                {/* Name */}
                {visibleFields.includes('full_name') && (
                  <h2 
                    className="font-bold mb-1"
                    style={{ 
                      fontSize: `${1.5 * fontSizeScale}rem`,
                      color: primaryColor
                    }}
                  >
                    Sarah Williams
                  </h2>
                )}

                {/* Job Title */}
                {visibleFields.includes('job_title') && (
                  <p 
                    className="text-sm font-medium mb-0.5"
                    style={{ color: '#64748b' }}
                  >
                    Head of Operations
                  </p>
                )}

                {/* Company */}
                {visibleFields.includes('company') && (
                  <p 
                    className="text-sm mb-4"
                    style={{ color: '#94a3b8' }}
                  >
                    NISAU
                  </p>
                )}

                {/* Event Name */}
                {visibleFields.includes('event_name') && (
                  <p 
                    className="text-xs mb-2"
                    style={{ color: '#64748b' }}
                  >
                    Tech Conference 2026
                  </p>
                )}

                {/* Event Date */}
                {visibleFields.includes('event_date') && (
                  <p 
                    className="text-xs mb-2"
                    style={{ color: '#94a3b8' }}
                  >
                    March 15, 2026
                  </p>
                )}

                {/* Ticket Type */}
                {visibleFields.includes('ticket_type') && (
                  <div 
                    className="w-full py-2 font-bold uppercase text-sm tracking-wider mb-4 text-white"
                    style={{ backgroundColor: secondaryColor }}
                  >
                    VIP Access
                  </div>
                )}

                {/* QR Code */}
                {visibleFields.includes('qr_code') && (
                  <div 
                    className="mt-auto mb-4 p-2 border border-slate-200 rounded"
                    style={{ width: qrCodeSize + 16, height: qrCodeSize + 16 }}
                  >
                    <QrCode 
                      size={qrCodeSize} 
                      style={{ color: primaryColor }} 
                    />
                  </div>
                )}

                {/* Unique Code */}
                {visibleFields.includes('unique_code') && (
                  <p 
                    className="font-mono text-xs mb-4"
                    style={{ color: '#64748b' }}
                  >
                    ABC123
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {designs.length === 0 && !loading && (
        <div className="bg-white p-12 rounded-xl border border-slate-100 shadow-sm text-center">
          <Palette className="h-12 w-12 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-700 mb-2">No Badge Designs Yet</h3>
          <p className="text-slate-500 mb-4">Create your first badge design to get started</p>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus size={16} className="mr-2" /> Create Design
          </Button>
        </div>
      )}

      {/* Create Design Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Create Badge Design</DialogTitle>
            <DialogDescription>
              Create a new badge design for this event
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Design Name *</Label>
              <Input
                placeholder="e.g., VIP Badge, Student Badge"
                value={newDesignName}
                onChange={(e) => setNewDesignName(e.target.value)}
                data-testid="new-badge-design-name"
              />
            </div>
            <div className="space-y-2">
              <Label>Ticket Type (Optional)</Label>
              <Select value={newDesignTicketType} onValueChange={setNewDesignTicketType}>
                <SelectTrigger>
                  <SelectValue placeholder="Apply to all tickets" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Apply to all tickets</SelectItem>
                  {tickets.map((ticket) => (
                    <SelectItem key={ticket.id} value={ticket.id.toString()}>
                      {ticket.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                Leave empty to use as event default, or select a ticket type for specific design
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateDesign} 
              disabled={saving || !newDesignName.trim()}
              data-testid="confirm-create-badge-design"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create Design
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
