import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Image as ImageIcon,
  RotateCcw,
  Loader2,
  X,
  Upload
} from 'lucide-react';
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Separator } from "../../ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../ui/select";
import { toast } from 'sonner';
import { eventsAPI, EventBranding } from '../../../api/events.api';
import { FileUpload } from '../../FileUpload';

interface SettingsBrandingProps {
  eventId: number | string;
}

const DEFAULT_BRANDING = {
  light_logo_url: null as string | null,
  dark_logo_url: null as string | null,
  cover_image_url: null as string | null,
  primary_color: '#0f172b',
  secondary_color: '#3b82f6',
  font_family: 'inter',
};

const FONT_OPTIONS = [
  { value: 'inter', label: 'Inter' },
  { value: 'roboto', label: 'Roboto' },
  { value: 'poppins', label: 'Poppins' },
  { value: 'open-sans', label: 'Open Sans' },
  { value: 'lato', label: 'Lato' },
  { value: 'montserrat', label: 'Montserrat' },
];

export const SettingsBranding = ({ eventId }: SettingsBrandingProps) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  
  // Form state
  const [lightLogoUrl, setLightLogoUrl] = useState<string | null>(null);
  const [darkLogoUrl, setDarkLogoUrl] = useState<string | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#0f172b');
  const [secondaryColor, setSecondaryColor] = useState('#3b82f6');
  const [fontFamily, setFontFamily] = useState('inter');
  
  // Load branding data
  useEffect(() => {
    const loadBranding = async () => {
      try {
        setLoading(true);
        const branding = await eventsAPI.getEventBranding(eventId);
        setLightLogoUrl(branding.light_logo_url);
        setDarkLogoUrl(branding.dark_logo_url);
        setCoverImageUrl(branding.cover_image_url);
        setPrimaryColor(branding.primary_color || '#0f172b');
        setSecondaryColor(branding.secondary_color || '#3b82f6');
        setFontFamily(branding.font_family || 'inter');
      } catch (error) {
        console.error('Failed to load branding:', error);
        toast.error('Failed to load branding settings');
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      loadBranding();
    }
  }, [eventId]);

  // Save branding
  const handleSave = async () => {
    try {
      setSaving(true);
      await eventsAPI.updateEventBranding(eventId, {
        light_logo_url: lightLogoUrl,
        dark_logo_url: darkLogoUrl,
        cover_image_url: coverImageUrl,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        font_family: fontFamily,
      });
      toast.success('Branding settings saved successfully');
    } catch (error) {
      console.error('Failed to save branding:', error);
      toast.error('Failed to save branding settings');
    } finally {
      setSaving(false);
    }
  };

  // Reset to defaults
  const handleReset = async () => {
    try {
      setResetting(true);
      const branding = await eventsAPI.resetEventBranding(eventId);
      setLightLogoUrl(branding.light_logo_url);
      setDarkLogoUrl(branding.dark_logo_url);
      setCoverImageUrl(branding.cover_image_url);
      setPrimaryColor(branding.primary_color || '#0f172b');
      setSecondaryColor(branding.secondary_color || '#3b82f6');
      setFontFamily(branding.font_family || 'inter');
      toast.success('Branding reset to defaults');
    } catch (error) {
      console.error('Failed to reset branding:', error);
      toast.error('Failed to reset branding settings');
    } finally {
      setResetting(false);
    }
  };

  // Validate hex color and update
  const handleColorChange = (value: string, setter: (val: string) => void) => {
    // Allow typing partial hex codes
    if (value.match(/^#[0-9A-Fa-f]{0,6}$/)) {
      setter(value);
    }
  };

  // Remove uploaded image
  const handleRemoveImage = (type: 'light' | 'dark' | 'cover') => {
    if (type === 'light') setLightLogoUrl(null);
    else if (type === 'dark') setDarkLogoUrl(null);
    else setCoverImageUrl(null);
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg text-[#1d293d]">Branding & Design</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleReset}
            disabled={resetting || saving}
          >
            {resetting ? (
              <Loader2 size={16} className="mr-2 animate-spin" />
            ) : (
              <RotateCcw size={16} className="mr-2" />
            )}
            Reset Defaults
          </Button>
          <Button 
            className="bg-[#0f172b]" 
            onClick={handleSave}
            disabled={saving || resetting}
          >
            {saving ? (
              <Loader2 size={16} className="mr-2 animate-spin" />
            ) : (
              <Save size={16} className="mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>
      <Separator />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Event Logos */}
          <div className="space-y-4">
            <Label>Event Logos</Label>
            <div className="grid grid-cols-2 gap-4">
              {/* Light Logo Upload */}
              <div className="space-y-2">
                <span className="text-xs text-slate-500">Light Mode Logo</span>
                {lightLogoUrl ? (
                  <div className="relative border-2 border-slate-200 rounded-lg p-4 bg-white">
                    <img 
                      src={lightLogoUrl} 
                      alt="Light logo" 
                      className="max-h-20 mx-auto object-contain"
                    />
                    <button
                      onClick={() => handleRemoveImage('light')}
                      className="absolute top-2 right-2 p-1 bg-red-100 rounded-full hover:bg-red-200"
                    >
                      <X size={14} className="text-red-600" />
                    </button>
                  </div>
                ) : (
                  <FileUpload
                    value={lightLogoUrl || ''}
                    onChange={(url) => setLightLogoUrl(url as string)}
                    accept="image/png,image/svg+xml,image/jpeg"
                    label="Light Logo"
                    showPreview={false}
                    folder={`events/${eventId}/branding`}
                  />
                )}
              </div>

              {/* Dark Logo Upload */}
              <div className="space-y-2">
                <span className="text-xs text-slate-500">Dark Mode Logo</span>
                {darkLogoUrl ? (
                  <div className="relative border-2 border-slate-700 rounded-lg p-4 bg-slate-900">
                    <img 
                      src={darkLogoUrl} 
                      alt="Dark logo" 
                      className="max-h-20 mx-auto object-contain"
                    />
                    <button
                      onClick={() => handleRemoveImage('dark')}
                      className="absolute top-2 right-2 p-1 bg-red-100 rounded-full hover:bg-red-200"
                    >
                      <X size={14} className="text-red-600" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-700 rounded-lg bg-slate-900 overflow-hidden">
                    <FileUpload
                      value={darkLogoUrl || ''}
                      onChange={(url) => setDarkLogoUrl(url as string)}
                      accept="image/png,image/svg+xml,image/jpeg"
                      label="Dark Logo"
                      showPreview={false}
                      folder={`events/${eventId}/branding`}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <Label>Cover Image</Label>
            {coverImageUrl ? (
              <div className="relative border-2 border-slate-200 rounded-lg overflow-hidden">
                <img 
                  src={coverImageUrl} 
                  alt="Cover" 
                  className="w-full h-32 object-cover"
                />
                <button
                  onClick={() => handleRemoveImage('cover')}
                  className="absolute top-2 right-2 p-1 bg-red-100 rounded-full hover:bg-red-200"
                >
                  <X size={14} className="text-red-600" />
                </button>
              </div>
            ) : (
              <FileUpload
                value={coverImageUrl || ''}
                onChange={(url) => setCoverImageUrl(url as string)}
                accept="image/*"
                label="Upload Cover Image (1200x400px recommended)"
                showPreview={false}
                folder={`events/${eventId}/branding`}
              />
            )}
          </div>

          {/* Color Pickers */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Primary Color</Label>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg border border-slate-200 overflow-hidden flex-shrink-0">
                  <input 
                    type="color" 
                    className="h-full w-full cursor-pointer p-0 border-0" 
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                  />
                </div>
                <Input 
                  value={primaryColor} 
                  onChange={(e) => handleColorChange(e.target.value, setPrimaryColor)}
                  className="font-mono uppercase"
                  maxLength={7}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Secondary Color</Label>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg border border-slate-200 overflow-hidden flex-shrink-0">
                  <input 
                    type="color" 
                    className="h-full w-full cursor-pointer p-0 border-0" 
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                  />
                </div>
                <Input 
                  value={secondaryColor} 
                  onChange={(e) => handleColorChange(e.target.value, setSecondaryColor)}
                  className="font-mono uppercase"
                  maxLength={7}
                />
              </div>
            </div>
          </div>

          {/* Font Family */}
          <div className="space-y-2">
            <Label>Font Family</Label>
            <Select value={fontFamily} onValueChange={setFontFamily}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_OPTIONS.map(font => (
                  <SelectItem key={font.value} value={font.value}>
                    <span style={{ fontFamily: font.value }}>{font.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Live Preview */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase mb-4">Live Preview</h4>
          <div 
            className="bg-white rounded-lg shadow-sm overflow-hidden pointer-events-none select-none border border-slate-100 transform scale-95 origin-top"
            style={{ fontFamily: fontFamily }}
          >
            {/* Cover Image Area */}
            <div 
              className="h-32 relative"
              style={{ 
                backgroundColor: primaryColor,
                backgroundImage: coverImageUrl ? `url(${coverImageUrl})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {!coverImageUrl && (
                <div 
                  className="absolute inset-0 opacity-20"
                  style={{ 
                    background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`
                  }}
                />
              )}
            </div>
            
            {/* Content Area */}
            <div className="px-6 pb-6 -mt-10 relative">
              {/* Logo Container */}
              <div className="h-20 w-20 bg-white rounded-xl shadow-md border-4 border-white flex items-center justify-center overflow-hidden">
                {lightLogoUrl ? (
                  <img 
                    src={lightLogoUrl} 
                    alt="Logo preview" 
                    className="max-h-12 max-w-12 object-contain"
                  />
                ) : (
                  <div 
                    className="h-10 w-10 rounded-lg"
                    style={{ backgroundColor: primaryColor }}
                  />
                )}
              </div>
              
              {/* Text Placeholders */}
              <div className="mt-3 space-y-2">
                <div 
                  className="h-6 w-3/4 rounded"
                  style={{ backgroundColor: primaryColor }}
                />
                <div className="h-4 w-1/2 bg-slate-200 rounded" />
              </div>
              
              {/* Button Placeholders */}
              <div className="mt-6 flex gap-3">
                <div 
                  className="h-10 w-24 rounded-lg"
                  style={{ backgroundColor: primaryColor }}
                />
                <div 
                  className="h-10 w-24 rounded-lg border-2"
                  style={{ borderColor: secondaryColor, backgroundColor: `${secondaryColor}15` }}
                />
              </div>
            </div>
          </div>
          
          {/* Preview Info */}
          <div className="mt-4 text-xs text-slate-500 space-y-1">
            <p><strong>Font:</strong> {FONT_OPTIONS.find(f => f.value === fontFamily)?.label}</p>
            <p><strong>Primary:</strong> <span className="font-mono">{primaryColor}</span></p>
            <p><strong>Secondary:</strong> <span className="font-mono">{secondaryColor}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};
