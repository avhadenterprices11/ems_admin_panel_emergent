import React from 'react';
import { 
  Save, 
  Webhook,
  Key,
  Mail,
  MessageSquare,
  Map,
  CheckCircle2
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
import { Badge } from "../../ui/badge";

export const SettingsIntegrations = () => {
  return (
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-[#1d293d]">Integrations</h3>
              <Button className="bg-[#0f172b]"><Save size={16} className="mr-2" /> Save Changes</Button>
          </div>
          <Separator />
          
          <div className="space-y-6">
               <div className="flex items-start gap-4 p-4 border rounded-xl bg-white">
                   <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                       <Mail size={24} />
                   </div>
                   <div className="flex-1 space-y-2">
                       <div className="flex justify-between items-center">
                           <Label className="text-base font-bold">Email Service Provider</Label>
                           <Switch defaultChecked />
                       </div>
                       <p className="text-sm text-slate-500">Handle high-volume email delivery for tickets and campaigns.</p>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                           <Select defaultValue="sendgrid">
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="sendgrid">SendGrid</SelectItem>
                                    <SelectItem value="aws">AWS SES</SelectItem>
                                    <SelectItem value="smtp">Custom SMTP</SelectItem>
                                </SelectContent>
                           </Select>
                           <Input type="password" value="••••••••••••••••" readOnly className="bg-slate-50" />
                       </div>
                       <div className="flex items-center text-xs text-emerald-600 font-medium mt-1">
                           <CheckCircle2 size={12} className="mr-1" /> Connected to SendGrid
                       </div>
                   </div>
               </div>

               <div className="flex items-start gap-4 p-4 border rounded-xl bg-white">
                   <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                       <MessageSquare size={24} />
                   </div>
                   <div className="flex-1 space-y-2">
                       <div className="flex justify-between items-center">
                           <Label className="text-base font-bold">SMS Gateway</Label>
                           <Switch />
                       </div>
                       <p className="text-sm text-slate-500">Send SMS notifications via Twilio or MessageBird.</p>
                       <Select disabled>
                            <SelectTrigger><SelectValue placeholder="Select Provider" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="twilio">Twilio</SelectItem>
                                <SelectItem value="messagebird">MessageBird</SelectItem>
                            </SelectContent>
                       </Select>
                   </div>
               </div>

               <div className="flex items-start gap-4 p-4 border rounded-xl bg-white">
                   <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                       <Map size={24} />
                   </div>
                   <div className="flex-1 space-y-2">
                       <div className="flex justify-between items-center">
                           <Label className="text-base font-bold">Google Maps API</Label>
                           <Switch defaultChecked />
                       </div>
                       <p className="text-sm text-slate-500">Display interactive maps on event pages.</p>
                       <Input type="password" value="••••••••••••••••••••••" readOnly className="bg-slate-50" />
                   </div>
               </div>

               <Separator />

               <div className="space-y-4">
                   <h4 className="font-bold text-[#1d293d] flex items-center gap-2">
                       <Webhook size={18} className="text-slate-400" /> Webhooks
                   </h4>
                   <div className="grid gap-2">
                       <Label>Payload URL</Label>
                       <Input placeholder="https://api.yourdomain.com/webhooks/nisau" />
                       <p className="text-xs text-slate-500">We'll send POST requests for 'ticket.sold' and 'attendee.checked_in' events.</p>
                   </div>
                   <div className="grid gap-2">
                       <Label>Secret Key</Label>
                       <div className="flex gap-2">
                           <Input value="whsec_..." readOnly className="font-mono bg-slate-50" />
                           <Button variant="outline">Regenerate</Button>
                       </div>
                   </div>
               </div>

               <div className="space-y-4">
                   <h4 className="font-bold text-[#1d293d] flex items-center gap-2">
                       <Key size={18} className="text-slate-400" /> Developer API
                   </h4>
                   <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                       <div>
                           <div className="font-medium">Public API Key</div>
                           <code className="text-xs text-slate-500">pk_live_51Hz...</code>
                       </div>
                       <Button variant="outline" size="sm">Copy</Button>
                   </div>
               </div>
          </div>
      </div>
  );
};
