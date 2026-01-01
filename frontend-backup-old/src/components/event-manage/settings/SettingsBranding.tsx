import React from 'react';
import { 
  Save, 
  Image as ImageIcon,
  RotateCcw,
  UploadCloud
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

export const SettingsBranding = () => {
  return (
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-[#1d293d]">Branding & Design</h3>
              <div className="flex gap-2">
                 <Button variant="outline"><RotateCcw size={16} className="mr-2" /> Reset Defaults</Button>
                 <Button className="bg-[#0f172b]"><Save size={16} className="mr-2" /> Save Changes</Button>
              </div>
          </div>
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                   <div className="space-y-4">
                        <Label>Event Logos</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 cursor-pointer">
                                <UploadCloud size={24} className="text-slate-400 mb-2" />
                                <span className="text-sm font-medium text-slate-700">Light Logo</span>
                                <span className="text-xs text-slate-400">PNG, SVG (max 2MB)</span>
                            </div>
                            <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 cursor-pointer bg-slate-900 border-slate-700">
                                <UploadCloud size={24} className="text-slate-400 mb-2" />
                                <span className="text-sm font-medium text-white">Dark Logo</span>
                                <span className="text-xs text-slate-500">PNG, SVG (max 2MB)</span>
                            </div>
                        </div>
                   </div>

                   <div className="space-y-4">
                        <Label>Cover Image</Label>
                        <div className="border-2 border-dashed border-slate-200 rounded-lg h-32 flex flex-col items-center justify-center text-center hover:bg-slate-50 cursor-pointer">
                            <ImageIcon size={24} className="text-slate-400 mb-2" />
                            <span className="text-sm font-medium text-slate-700">Upload Cover Image</span>
                            <span className="text-xs text-slate-400">1200x400px recommended</span>
                        </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Primary Color</Label>
                            <div className="flex items-center gap-2">
                                <div className="h-10 w-10 rounded-lg border border-slate-200 overflow-hidden">
                                    <input type="color" className="h-full w-full cursor-pointer p-0 border-0" defaultValue="#0f172b" />
                                </div>
                                <Input defaultValue="#0f172b" className="font-mono" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Secondary Color</Label>
                            <div className="flex items-center gap-2">
                                <div className="h-10 w-10 rounded-lg border border-slate-200 overflow-hidden">
                                    <input type="color" className="h-full w-full cursor-pointer p-0 border-0" defaultValue="#3b82f6" />
                                </div>
                                <Input defaultValue="#3b82f6" className="font-mono" />
                            </div>
                        </div>
                   </div>

                   <div className="space-y-2">
                       <Label>Font Family</Label>
                       <Select defaultValue="inter" disabled>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="inter">Inter (System Default)</SelectItem>
                                <SelectItem value="roboto">Roboto</SelectItem>
                                <SelectItem value="poppins">Poppins</SelectItem>
                            </SelectContent>
                       </Select>
                       <p className="text-xs text-slate-500">Custom fonts are available on Enterprise plans.</p>
                   </div>
              </div>

              {/* Live Preview */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-4">Live Preview</h4>
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden pointer-events-none select-none border border-slate-100 transform scale-95 origin-top">
                      <div className="h-32 bg-slate-900 relative">
                          {/* Mock Cover */}
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-20"></div>
                      </div>
                      <div className="px-6 pb-6 -mt-10 relative">
                           <div className="h-20 w-20 bg-white rounded-xl shadow-md border-4 border-white flex items-center justify-center">
                                <div className="h-10 w-10 bg-slate-900 rounded-lg"></div>
                           </div>
                           <div className="mt-3 space-y-2">
                               <div className="h-6 w-3/4 bg-slate-800 rounded"></div>
                               <div className="h-4 w-1/2 bg-slate-200 rounded"></div>
                           </div>
                           <div className="mt-6 flex gap-3">
                               <div className="h-10 w-24 bg-[#0f172b] rounded-lg"></div>
                               <div className="h-10 w-24 bg-slate-100 rounded-lg"></div>
                           </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  );
};
