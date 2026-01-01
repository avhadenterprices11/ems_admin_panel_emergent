import React from 'react';
import { 
  Save, 
  CreditCard,
  Building2,
  Receipt
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

export const SettingsPayment = () => {
  return (
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-[#1d293d]">Payment & Tax</h3>
              <Button className="bg-[#0f172b]"><Save size={16} className="mr-2" /> Save Changes</Button>
          </div>
          <Separator />
          
          <div className="space-y-8">
               <div className="grid gap-4 max-w-md">
                   <Label>Currency</Label>
                   <Select defaultValue="usd">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="usd">USD ($)</SelectItem>
                            <SelectItem value="gbp">GBP (£)</SelectItem>
                            <SelectItem value="eur">EUR (€)</SelectItem>
                            <SelectItem value="inr">INR (₹)</SelectItem>
                        </SelectContent>
                   </Select>
               </div>

               <Separator />

               <div className="space-y-4">
                   <h4 className="font-bold text-[#1d293d] flex items-center gap-2">
                       <CreditCard size={18} className="text-slate-400" /> Payment Methods
                   </h4>
                   <div className="space-y-4">
                       <div className="flex items-center justify-between border p-4 rounded-lg">
                           <div className="flex items-center gap-3">
                               <div className="h-8 w-12 bg-slate-100 rounded flex items-center justify-center font-bold text-slate-500 text-xs">STRIPE</div>
                               <div>
                                   <div className="font-medium">Stripe</div>
                                   <div className="text-xs text-slate-500">Accept credit cards securely</div>
                               </div>
                           </div>
                           <Switch defaultChecked />
                       </div>
                       <div className="flex items-center justify-between border p-4 rounded-lg">
                           <div className="flex items-center gap-3">
                               <div className="h-8 w-12 bg-slate-100 rounded flex items-center justify-center font-bold text-slate-500 text-xs">RAZOR</div>
                               <div>
                                   <div className="font-medium">Razorpay</div>
                                   <div className="text-xs text-slate-500">Popular in India</div>
                               </div>
                           </div>
                           <Switch />
                       </div>
                       <div className="flex items-center justify-between border p-4 rounded-lg">
                           <div className="flex items-center gap-3">
                               <div className="h-8 w-12 bg-slate-100 rounded flex items-center justify-center font-bold text-slate-500 text-xs">CASH</div>
                               <div>
                                   <div className="font-medium">Offline / Invoice</div>
                                   <div className="text-xs text-slate-500">Collect payment at venue or via bank transfer</div>
                               </div>
                           </div>
                           <Switch defaultChecked />
                       </div>
                   </div>
               </div>

               <Separator />

               <div className="space-y-4">
                   <h4 className="font-bold text-[#1d293d] flex items-center gap-2">
                       <Receipt size={18} className="text-slate-400" /> Tax Configuration
                   </h4>
                   <div className="flex items-center justify-between mb-4">
                       <Label>Enable Tax Collection</Label>
                       <Switch defaultChecked />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                       <div className="grid gap-2">
                           <Label>Tax Name</Label>
                           <Input placeholder="e.g. VAT" defaultValue="VAT" />
                       </div>
                       <div className="grid gap-2">
                           <Label>Percentage (%)</Label>
                           <Input type="number" placeholder="20" defaultValue="20" />
                       </div>
                   </div>
               </div>

               <Separator />

               <div className="space-y-4">
                   <h4 className="font-bold text-[#1d293d] flex items-center gap-2">
                       <Building2 size={18} className="text-slate-400" /> Invoice Details
                   </h4>
                   <div className="grid gap-4">
                       <div className="grid gap-2">
                           <Label>Legal Entity Name</Label>
                           <Input placeholder="Company Name Ltd." />
                       </div>
                       <div className="grid gap-2">
                           <Label>Billing Address</Label>
                           <Input placeholder="123 Business St, London, UK" />
                       </div>
                       <div className="grid gap-2">
                           <Label>Tax ID / GST / VAT Number</Label>
                           <Input placeholder="GB123456789" />
                       </div>
                   </div>
               </div>
          </div>
      </div>
  );
};
