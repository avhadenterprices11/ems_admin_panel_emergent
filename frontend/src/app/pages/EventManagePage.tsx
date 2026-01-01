import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ChevronLeft, 
  Calendar, 
  ExternalLink, 
  LayoutDashboard
} from 'lucide-react';
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { EventOverview } from '../components/event-manage/EventOverview';
import { EventTickets } from '../components/event-manage/EventTickets';
import { EventRegistrations } from '../components/event-manage/EventRegistrations';
import { EventAttendees } from '../components/event-manage/EventAttendees';
import { EventCommunications } from '../components/event-manage/EventCommunications';
import { EventReports } from '../components/event-manage/EventReports';
import { EventSettings } from '../components/event-manage/EventSettings';

// Mock event data - in real app would fetch from API
const mockEvent = {
  id: '1',
  name: 'Global Tech Summit 2024',
  date: 'Jan 15 - Jan 17, 2024',
  status: 'Published'
};

export function EventManagePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  
  const event = mockEvent; // In real app: fetch based on id
  
  const handleBack = () => {
    navigate('/events');
  };

  return (
    <div className="flex flex-col h-full gap-6">
      {/* 1. BREADCRUMB NAVIGATION */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <span className="cursor-pointer hover:text-slate-700" onClick={handleBack}>
            Events
          </span>
          <span>/</span>
          <span className="text-slate-900 font-medium">{event.name}</span>
        </div>
      </div>

      {/* 2. PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Back Button + Event Info */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack} className="-ml-2">
            <ChevronLeft size={24} className="text-slate-400" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#1d293d]">{event.name}</h1>
            <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
              <span className="flex items-center gap-1">
                <Calendar size={14} /> {event.date}
              </span>
              <span>•</span>
              <span className="text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full text-xs">
                {event.status}
              </span>
            </div>
          </div>
        </div>
        
        {/* Right: Action Buttons */}
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <ExternalLink size={16} className="mr-2" /> Preview Page
          </Button>
          <Button className="bg-[#0f172b] hover:bg-[#1d293d]">
            <LayoutDashboard size={16} className="mr-2" /> Event Dashboard
          </Button>
        </div>
      </div>

      {/* 3. TAB NAVIGATION */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="bg-slate-100/80 p-1.5 rounded-[14px] flex w-full overflow-x-auto no-scrollbar">
            <TabsList className="bg-transparent h-auto w-full justify-start gap-1 p-0">
              <TabsTrigger 
                value="overview" 
                className="rounded-[10px] px-3.5 py-2.5 text-sm font-medium text-slate-500 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm data-[state=active]:font-semibold hover:bg-slate-200/50 hover:text-slate-700 transition-all border-none"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="tickets" 
                className="rounded-[10px] px-3.5 py-2.5 text-sm font-medium text-slate-500 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm data-[state=active]:font-semibold hover:bg-slate-200/50 hover:text-slate-700 transition-all border-none"
              >
                Tickets
              </TabsTrigger>
              <TabsTrigger 
                value="registrations" 
                className="rounded-[10px] px-3.5 py-2.5 text-sm font-medium text-slate-500 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm data-[state=active]:font-semibold hover:bg-slate-200/50 hover:text-slate-700 transition-all border-none"
              >
                Registrations
              </TabsTrigger>
              <TabsTrigger 
                value="attendees" 
                className="rounded-[10px] px-3.5 py-2.5 text-sm font-medium text-slate-500 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm data-[state=active]:font-semibold hover:bg-slate-200/50 hover:text-slate-700 transition-all border-none"
              >
                Attendees & Check-in
              </TabsTrigger>
              <TabsTrigger 
                value="communications" 
                className="rounded-[10px] px-3.5 py-2.5 text-sm font-medium text-slate-500 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm data-[state=active]:font-semibold hover:bg-slate-200/50 hover:text-slate-700 transition-all border-none"
              >
                Communications
              </TabsTrigger>
              <TabsTrigger 
                value="reports" 
                className="rounded-[10px] px-3.5 py-2.5 text-sm font-medium text-slate-500 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm data-[state=active]:font-semibold hover:bg-slate-200/50 hover:text-slate-700 transition-all border-none"
              >
                Reports
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="rounded-[10px] px-3.5 py-2.5 text-sm font-medium text-slate-500 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm data-[state=active]:font-semibold hover:bg-slate-200/50 hover:text-slate-700 transition-all border-none"
              >
                Settings
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Divider Line */}
        <div className="h-px bg-slate-100 w-full -mt-2" />

        {/* 4. TAB CONTENT */}
        <div className="flex-1 pt-6">
          <TabsContent value="overview" className="mt-0 h-full animate-in fade-in zoom-in-95 duration-200">
            <EventOverview />
          </TabsContent>
          <TabsContent value="tickets" className="mt-0 animate-in fade-in zoom-in-95 duration-200">
            <EventTickets />
          </TabsContent>
          <TabsContent value="registrations" className="mt-0 animate-in fade-in zoom-in-95 duration-200">
            <EventRegistrations />
          </TabsContent>
          <TabsContent value="attendees" className="mt-0 animate-in fade-in zoom-in-95 duration-200">
            <EventAttendees />
          </TabsContent>
          <TabsContent value="communications" className="mt-0 animate-in fade-in zoom-in-95 duration-200">
            <EventCommunications />
          </TabsContent>
          <TabsContent value="reports" className="mt-0 animate-in fade-in zoom-in-95 duration-200">
            <EventReports />
          </TabsContent>
          <TabsContent value="settings" className="mt-0 animate-in fade-in zoom-in-95 duration-200">
            <EventSettings />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
