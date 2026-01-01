import React from 'react';
import { 
  Archive,
  AlertTriangle
} from 'lucide-react';
import { Button } from "../../ui/button";
import { Separator } from "../../ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../ui/alert-dialog";

export const SettingsArchive = () => {
  return (
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-[#1d293d]">Archive Event</h3>
          </div>
          <Separator />
          
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col items-center text-center space-y-4 max-w-2xl mx-auto my-8">
               <div className="h-12 w-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 mb-2">
                   <Archive size={24} />
               </div>
               <h4 className="text-lg font-bold text-[#1d293d]">Archive this event?</h4>
               <p className="text-slate-600">
                   Archiving will make this event <strong>read-only</strong> for all team members. 
                   Public pages will be unpublished, and ticket sales will stop immediately.
                   You can unarchive it later if needed.
               </p>
               
               <AlertDialog>
                  <AlertDialogTrigger asChild>
                      <Button variant="outline" className="border-slate-300">
                          Archive Event
                      </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                      <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                              This action will unpublish the event and disable all data collection. 
                              Existing data will remain accessible in read-only mode.
                          </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-[#0f172b]">Confirm Archive</AlertDialogAction>
                      </AlertDialogFooter>
                  </AlertDialogContent>
               </AlertDialog>
          </div>
      </div>
  );
};
