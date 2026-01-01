import React from 'react';
import { 
  Save, 
  UserPlus,
  MoreHorizontal,
  Shield,
  Trash2,
  Mail
} from 'lucide-react';
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Badge } from "../../ui/badge";
import { Separator } from "../../ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../ui/dropdown-menu";

export const SettingsTeam = () => {
  return (
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-[#1d293d]">Team & Permissions</h3>
              <Button className="bg-[#0f172b]"><UserPlus size={16} className="mr-2" /> Invite Member</Button>
          </div>
          <Separator />
          
          <div className="space-y-6">
               <Table>
                   <TableHeader>
                       <TableRow className="bg-slate-50/50">
                           <TableHead>User</TableHead>
                           <TableHead>Role</TableHead>
                           <TableHead>Status</TableHead>
                           <TableHead className="text-right">Actions</TableHead>
                       </TableRow>
                   </TableHeader>
                   <TableBody>
                       <TableRow>
                           <TableCell>
                               <div className="font-medium">Sarah Williams</div>
                               <div className="text-xs text-slate-500">sarah@nisau.org</div>
                           </TableCell>
                           <TableCell>
                               <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-0">Owner</Badge>
                           </TableCell>
                           <TableCell><span className="text-sm text-emerald-600 font-medium">Active</span></TableCell>
                           <TableCell className="text-right">
                               <Button variant="ghost" size="icon" disabled>
                                   <MoreHorizontal size={16} className="text-slate-300" />
                               </Button>
                           </TableCell>
                       </TableRow>
                       <TableRow>
                           <TableCell>
                               <div className="font-medium">Mike Johnson</div>
                               <div className="text-xs text-slate-500">mike@nisau.org</div>
                           </TableCell>
                           <TableCell>
                               <Badge variant="outline" className="text-slate-600">Admin</Badge>
                           </TableCell>
                           <TableCell><span className="text-sm text-emerald-600 font-medium">Active</span></TableCell>
                           <TableCell className="text-right">
                               <DropdownMenu>
                                   <DropdownMenuTrigger asChild>
                                       <Button variant="ghost" size="icon">
                                           <MoreHorizontal size={16} className="text-slate-400" />
                                       </Button>
                                   </DropdownMenuTrigger>
                                   <DropdownMenuContent align="end">
                                       <DropdownMenuItem>Change Role</DropdownMenuItem>
                                       <DropdownMenuItem className="text-rose-600">Remove Access</DropdownMenuItem>
                                   </DropdownMenuContent>
                               </DropdownMenu>
                           </TableCell>
                       </TableRow>
                       <TableRow>
                           <TableCell>
                               <div className="font-medium">Guest User</div>
                               <div className="text-xs text-slate-500">guest@example.com</div>
                           </TableCell>
                           <TableCell>
                               <Badge variant="outline" className="text-slate-600">Viewer</Badge>
                           </TableCell>
                           <TableCell><span className="text-sm text-amber-600 font-medium">Pending</span></TableCell>
                           <TableCell className="text-right">
                               <DropdownMenu>
                                   <DropdownMenuTrigger asChild>
                                       <Button variant="ghost" size="icon">
                                           <MoreHorizontal size={16} className="text-slate-400" />
                                       </Button>
                                   </DropdownMenuTrigger>
                                   <DropdownMenuContent align="end">
                                       <DropdownMenuItem><Mail className="mr-2 h-4 w-4" /> Resend Invite</DropdownMenuItem>
                                       <DropdownMenuItem className="text-rose-600">Cancel Invite</DropdownMenuItem>
                                   </DropdownMenuContent>
                               </DropdownMenu>
                           </TableCell>
                       </TableRow>
                   </TableBody>
               </Table>

               <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                   <h4 className="font-bold text-sm text-[#1d293d] mb-3 flex items-center gap-2">
                       <Shield size={14} /> Permission Matrix
                   </h4>
                   <div className="grid grid-cols-5 gap-2 text-xs text-center">
                       <div className="text-left font-medium text-slate-500">Feature</div>
                       <div className="font-bold">Owner</div>
                       <div className="font-bold text-slate-600">Admin</div>
                       <div className="font-bold text-slate-600">Staff</div>
                       <div className="font-bold text-slate-600">Viewer</div>

                       <div className="text-left py-2 border-t border-slate-200">Event Settings</div>
                       <div className="py-2 border-t border-slate-200 text-emerald-600">Full</div>
                       <div className="py-2 border-t border-slate-200 text-emerald-600">Full</div>
                       <div className="py-2 border-t border-slate-200 text-slate-400">-</div>
                       <div className="py-2 border-t border-slate-200 text-slate-400">View</div>

                       <div className="text-left py-2 border-t border-slate-200">Financials</div>
                       <div className="py-2 border-t border-slate-200 text-emerald-600">Full</div>
                       <div className="py-2 border-t border-slate-200 text-slate-400">-</div>
                       <div className="py-2 border-t border-slate-200 text-slate-400">-</div>
                       <div className="py-2 border-t border-slate-200 text-slate-400">-</div>
                       
                       <div className="text-left py-2 border-t border-slate-200">Check-in</div>
                       <div className="py-2 border-t border-slate-200 text-emerald-600">Full</div>
                       <div className="py-2 border-t border-slate-200 text-emerald-600">Full</div>
                       <div className="py-2 border-t border-slate-200 text-emerald-600">Execute</div>
                       <div className="py-2 border-t border-slate-200 text-slate-400">-</div>
                   </div>
               </div>
          </div>
      </div>
  );
};
