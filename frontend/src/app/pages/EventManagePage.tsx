import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ChevronLeft, 
  Calendar, 
  ExternalLink, 
  LayoutDashboard,
  Loader2
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
import { eventsAPI } from '../api/events.api';
import { toast } from 'sonner';

interface EventDetail {
  id: number;
  event_code: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  type: string;
  location: string;
  mode: string;
}

export function EventManagePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await eventsAPI.getEventById(id);
        setEvent(data);
      } catch (err: any) {
        console.error('Error fetching event:', err);
        setError(err.response?.data?.message || 'Failed to load event');
        toast.error('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);
  
  const handleBack = () => {
    navigate('/events');
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    
    if (start.toDateString() === end.toDateString()) {
      return start.toLocaleDateString('en-US', options);
    }
    
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', options)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published':
        return 'text-emerald-600 bg-emerald-50';
      case 'Draft':
        return 'text-slate-600 bg-slate-100';
      case 'Archived':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          <p className="text-slate-500">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-slate-500">{error || 'Event not found'}</p>
        <Button onClick={handleBack} variant="outline">
          <ChevronLeft size={16} className="mr-2" />
          Back to Events
        </Button>
      </div>
    );
  }

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
                <Calendar size={14} /> {formatDateRange(event.start_date, event.end_date)}
              </span>
              <span>•</span>
              <span className={`font-medium px-2 py-0.5 rounded-full text-xs ${getStatusColor(event.status)}`}>
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
            <EventOverview eventId={event.id} />
          </TabsContent>
          <TabsContent value="tickets" className="mt-0 animate-in fade-in zoom-in-95 duration-200">
            <EventTickets eventId={event.id} />
          </TabsContent>
          <TabsContent value="registrations" className="mt-0 animate-in fade-in zoom-in-95 duration-200">
            <EventRegistrations eventId={event.id} />
          </TabsContent>
          <TabsContent value="attendees" className="mt-0 animate-in fade-in zoom-in-95 duration-200">
            <EventAttendees eventId={event.id} />
          </TabsContent>
          <TabsContent value="communications" className="mt-0 animate-in fade-in zoom-in-95 duration-200">
            <EventCommunications eventId={event.id} />
          </TabsContent>
          <TabsContent value="reports" className="mt-0 animate-in fade-in zoom-in-95 duration-200">
            <EventReports eventId={event.id} />
          </TabsContent>
          <TabsContent value="settings" className="mt-0 animate-in fade-in zoom-in-95 duration-200">
            <EventSettings eventId={event.id} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
