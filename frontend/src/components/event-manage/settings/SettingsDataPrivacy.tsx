import React from 'react';
import { 
  Save, 
  Shield,
  Download,
  FileText,
  Lock
} from 'lucide-react';
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Separator } from "../../ui/separator";
import { Switch } from "../../ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../ui/select";

export const SettingsDataPrivacy = () => {
  return (
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-[#1d293d]">Data & Privacy</h3>
              <Button className="bg-[#0f172b]"><Save size={16} className="mr-2" /> Save Changes</Button>
          </div>
          <Separator />
          
          <div className="space-y-8">
               <div className="space-y-4">
                   <h4 className="font-bold text-[#1d293d] flex items-center gap-2">
                       <Shield size={18} className="text-slate-400" /> Compliance
                   </h4>
                   <div className="flex items-center justify-between border p-4 rounded-lg">
                       <div className="space-y-0.5">
                           <Label className="text-base">GDPR Consent Field</Label>
                           <p className="text-sm text-slate-500">Require attendees to agree to data processing during registration.</p>
                       </div>
                       <Switch defaultChecked />
                   </div>
                   <div className="grid gap-2">
                       <Label>Privacy Policy URL</Label>
                       <Input placeholder="https://nisau.org.uk/privacy" />
                   </div>
               </div>

               <Separator />

               <div className="space-y-4">
                   <h4 className="font-bold text-[#1d293d] flex items-center gap-2">
                       <Lock size={18} className="text-slate-400" /> Data Retention
                   </h4>
                   <div className="grid gap-2 max-w-md">
                       <Label>Automatic Deletion</Label>
                       <Select defaultValue="365">
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="90">90 Days after event</SelectItem>
                                <SelectItem value="180">6 Months after event</SelectItem>
                                <SelectItem value="365">1 Year after event</SelectItem>
                                <SelectItem value="forever">Never (Manual deletion only)</SelectItem>
                            </SelectContent>
                       </Select>
                       <p className="text-xs text-slate-500">Personally Identifiable Information (PII) will be scrubbed after this period.</p>
                   </div>
               </div>

               <Separator />

               <div className="space-y-4">
                   <h4 className="font-bold text-[#1d293d] flex items-center gap-2">
                       <Download size={18} className="text-slate-400" /> Data Export
                   </h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-3">
                           <div className="font-medium text-[#1d293d]">Full Event Data</div>
                           <p className="text-xs text-slate-500">Includes all registrations, tickets, and check-in logs in CSV format.</p>
                           <Button variant="outline" size="sm" className="w-full">
                               <Download size={14} className="mr-2" /> Download CSV
                           </Button>
                       </div>
                       <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-3">
                           <div className="font-medium text-[#1d293d]">Audit Logs</div>
                           <p className="text-xs text-slate-500">System access logs and administrative actions for security audits.</p>
                           <Button variant="outline" size="sm" className="w-full">
                               <FileText size={14} className="mr-2" /> Download JSON
                           </Button>
                       </div>
                   </div>
               </div>
          </div>
      </div>
  );
};
