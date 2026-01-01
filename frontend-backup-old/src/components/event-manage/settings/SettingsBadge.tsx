import React from 'react';
import { 
  Save, 
  Printer,
  Move,
  Type,
  QrCode
} from 'lucide-react';
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Separator } from "../../ui/separator";
import { Slider } from "../../ui/slider";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../ui/select";
import { Checkbox } from "../../ui/checkbox";

export const SettingsBadge = () => {
  return (
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-[#1d293d]">Badge Design</h3>
              <div className="flex gap-2">
                 <Button variant="outline"><Printer size={16} className="mr-2" /> Print Test</Button>
                 <Button className="bg-[#0f172b]"><Save size={16} className="mr-2" /> Save Design</Button>
              </div>
          </div>
          <Separator />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="space-y-6">
                   <div className="grid gap-2">
                       <Label>Badge Size</Label>
                       <Select defaultValue="a6">
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="a6">A6 (105 x 148 mm)</SelectItem>
                                <SelectItem value="credit">Credit Card (85 x 54 mm)</SelectItem>
                                <SelectItem value="custom">Custom Size</SelectItem>
                            </SelectContent>
                       </Select>
                   </div>

                   <div className="space-y-4">
                       <Label>Visible Fields</Label>
                       <div className="space-y-2">
                           {['Full Name', 'Ticket Type', 'Company / Organization', 'Job Title', 'QR Code'].map((field) => (
                               <div key={field} className="flex items-center space-x-2 border p-3 rounded-lg bg-white">
                                   <Move size={14} className="text-slate-400 cursor-move" />
                                   <Checkbox id={field} defaultChecked />
                                   <label htmlFor={field} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                       {field}
                                   </label>
                               </div>
                           ))}
                       </div>
                   </div>

                   <div className="space-y-4">
                       <div className="flex justify-between">
                           <Label>Font Size Scale</Label>
                           <span className="text-xs text-slate-500">1.2x</span>
                       </div>
                       <Slider defaultValue={[20]} max={100} step={1} />
                   </div>
               </div>

               {/* Preview Area */}
               <div className="lg:col-span-2 bg-slate-100 rounded-xl p-8 flex items-center justify-center min-h-[400px]">
                   <div className="bg-white w-[300px] h-[420px] shadow-lg rounded-lg border border-slate-200 relative overflow-hidden flex flex-col items-center pt-16 px-6 text-center">
                       {/* Punch Hole */}
                       <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-200 rounded-full"></div>

                       {/* Logo */}
                       <div className="h-12 w-32 bg-slate-900 rounded mb-8"></div>

                       {/* Name */}
                       <h2 className="text-2xl font-bold text-[#1d293d] mb-2">Sarah Williams</h2>
                       
                       {/* Job/Company */}
                       <p className="text-sm text-slate-500 font-medium mb-1">Head of Operations</p>
                       <p className="text-sm text-slate-400 mb-8">NISAU</p>

                       {/* Ticket Type */}
                       <div className="w-full bg-blue-600 text-white py-2 font-bold uppercase text-sm tracking-wider mb-8">
                           VIP Access
                       </div>

                       {/* QR Code */}
                       <div className="mt-auto mb-8 p-2 border border-slate-200 rounded">
                           <QrCode size={80} className="text-slate-900" />
                       </div>
                   </div>
               </div>
          </div>
      </div>
  );
};
