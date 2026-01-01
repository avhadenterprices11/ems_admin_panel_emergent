import React, { useState } from 'react';
import { 
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
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

export const SettingsDelete = () => {
  const [confirmText, setConfirmText] = useState("");
  const eventName = "Global Tech Summit 2024";
  const isMatch = confirmText === eventName;

  return (
      <div className="bg-white p-6 rounded-xl border border-red-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-rose-600 flex items-center gap-2">
                  <AlertTriangle size={20} /> Danger Zone
              </h3>
          </div>
          <Separator className="bg-red-100" />
          
          <div className="space-y-6">
              <div className="p-4 bg-red-50 text-red-900 rounded-lg text-sm border border-red-100">
                  <strong>Warning:</strong> This action cannot be undone. This will permanently delete the event 
                  <strong> {eventName}</strong>, including all tickets, registrations, and attendee data.
              </div>

              <div className="space-y-3 max-w-md">
                  <Label>To confirm, type "{eventName}" below:</Label>
                  <Input 
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder={eventName}
                        className="border-red-200 focus-visible:ring-red-500"
                  />
              </div>

              <div className="pt-4">
                   <AlertDialog>
                      <AlertDialogTrigger asChild>
                          <Button 
                            variant="destructive" 
                            disabled={!isMatch}
                            className="bg-rose-600 hover:bg-rose-700"
                          >
                              <Trash2 size={16} className="mr-2" /> Permanently Delete Event
                          </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                          <AlertDialogHeader>
                              <AlertDialogTitle className="text-rose-600">Final Confirmation</AlertDialogTitle>
                              <AlertDialogDescription>
                                  You are about to delete <strong>{eventName}</strong>. 
                                  All data will be wiped from our servers immediately. This is not reversible.
                              </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction className="bg-rose-600 hover:bg-rose-700">
                                  Yes, Delete Everything
                              </AlertDialogAction>
                          </AlertDialogFooter>
                      </AlertDialogContent>
                   </AlertDialog>
              </div>
          </div>
      </div>
  );
};
