import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Calendar,
  Plus,
  List,
  Grid,
  Clock,
  MapPin,
  Mic,
  MoreHorizontal,
  Edit2,
  Trash2,
  Users,
  UserCheck,
  BarChart2,
  FileText,
  Megaphone
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Separator } from '../components/ui/separator';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '../components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { ResponsiveTable, MobileCardConfig } from '../components/ui/responsive-table';

interface Session {
  id: string;
  title: string;
  speaker: string;
  time: string;
  room: string;
  capacity: number;
  registered: number;
  status: 'Scheduled' | 'Completed' | 'Live' | 'Cancelled';
}

interface SessionGroup {
  date: string;
  day: string;
  sessions: Session[];
}

interface Speaker {
  id: string;
  name: string;
  designation: string;
  bio: string;
  image?: string | null;
}

const initialSessionsByDate: SessionGroup[] = [
  {
    date: "Apr 15, 2024",
    day: "Day 1",
    sessions: [
      { id: "SES-001", title: "Opening Keynote: Future of Education", speaker: "Dr. Sarah Smith", time: "09:00 AM - 10:00 AM", room: "Main Hall", capacity: 500, registered: 450, status: "Completed" },
      { id: "SES-002", title: "AI in Modern Classrooms", speaker: "Prof. Michael Chen", time: "10:30 AM - 11:30 AM", room: "Room A", capacity: 100, registered: 95, status: "Completed" },
      { id: "SES-003", title: "Student Engagement Strategies", speaker: "Emily Rodriguez", time: "02:00 PM - 03:30 PM", room: "Room B", capacity: 80, registered: 72, status: "Scheduled" },
      { id: "SES-004", title: "Workshop: Interactive Learning Tools", speaker: "-", time: "04:00 PM - 05:00 PM", room: "Workshop Area", capacity: 50, registered: 48, status: "Scheduled" }
    ]
  },
  {
    date: "Apr 16, 2024",
    day: "Day 2",
    sessions: [
      { id: "SES-005", title: "Panel: Global Education Trends", speaker: "Multiple Speakers", time: "09:00 AM - 10:30 AM", room: "Main Hall", capacity: 500, registered: 420, status: "Live" },
      { id: "SES-006", title: "Digital Assessment Methods", speaker: "Dr. James Wilson", time: "11:00 AM - 12:00 PM", room: "Room C", capacity: 120, registered: 115, status: "Scheduled" },
      { id: "SES-007", title: "Closing Ceremony", speaker: "Conference Organizers", time: "05:00 PM - 06:00 PM", room: "Main Hall", capacity: 500, registered: 400, status: "Scheduled" }
    ]
  }
];

export const ConferenceManagePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("agenda");
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isAddSessionOpen, setIsAddSessionOpen] = useState(false);
  const [isAddSpeakerOpen, setIsAddSpeakerOpen] = useState(false);
  const [sessionData, setSessionData] = useState<SessionGroup[]>(initialSessionsByDate);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [newSession, setNewSession] = useState({
    title: '',
    speaker: '',
    startTime: '',
    endTime: '',
    room: '',
    capacity: ''
  });
  const [newSpeaker, setNewSpeaker] = useState({
    name: '',
    designation: '',
    bio: ''
  });

  const conference = {
    id: id || 'CONF-001',
    name: 'Global Education Summit 2024',
    dates: 'Apr 15-16, 2024',
    status: 'Active'
  };

  const handleAddSession = () => {
    const newSessionObj: Session = {
      id: `SES-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      title: newSession.title,
      speaker: newSession.speaker,
      time: `${newSession.startTime} - ${newSession.endTime}`,
      room: newSession.room,
      capacity: parseInt(newSession.capacity),
      registered: 0,
      status: "Scheduled"
    };

    const updatedData = [...sessionData];
    updatedData[0].sessions.push(newSessionObj);
    setSessionData(updatedData);
    setIsAddSessionOpen(false);
    setNewSession({ title: '', speaker: '', startTime: '', endTime: '', room: '', capacity: '' });
  };

  const handleAddSpeaker = () => {
    const speakerObj: Speaker = {
      id: `SPK-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      name: newSpeaker.name,
      designation: newSpeaker.designation,
      bio: newSpeaker.bio,
      image: null
    };
    setSpeakers([...speakers, speakerObj]);
    setIsAddSpeakerOpen(false);
    setNewSpeaker({ name: '', designation: '', bio: '' });
  };

  const getStatusColor = (status: Session['status']) => {
    switch (status) {
      case 'Scheduled':
        return "bg-blue-50 text-blue-600";
      case 'Completed':
        return "bg-slate-100 text-slate-500";
      case 'Live':
        return "bg-emerald-50 text-emerald-600 animate-pulse";
      case 'Cancelled':
        return "bg-rose-50 text-rose-600";
      default:
        return "bg-slate-100 text-slate-500";
    }
  };

  const sessionConfig: MobileCardConfig<Session> = {
    idField: (session) => session.id,
    titleField: (session) => session.title,
    valueField: (session) => (
      <span className="text-slate-500 text-xs font-medium">
        {session.time}
      </span>
    ),
    statusField: (session) => (
      <Badge className={`font-medium border-0 px-2 py-0 h-5 text-[10px] ${getStatusColor(session.status)}`}>
        {session.status}
      </Badge>
    ),
    expandedFields: [
      { label: "Speaker", value: (s) => s.speaker },
      { label: "Room", value: (s) => s.room },
      { 
        label: "Attendance", 
        value: (s) => (
          <div className="flex flex-col gap-1 w-full">
            <div className="flex items-center justify-between text-xs">
              <span>{s.registered} / {s.capacity}</span>
            </div>
            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full" 
                style={{ width: `${(s.registered / s.capacity) * 100}%` }}
              />
            </div>
          </div>
        )
      },
    ],
    actions: (session) => (
      <div className="flex gap-2 w-full">
        <Button size="sm" variant="outline" className="flex-1">Edit</Button>
        <Button size="sm" variant="ghost" className="text-red-600 flex-1">Delete</Button>
      </div>
    )
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-slate-500 text-sm">
        <span className="cursor-pointer hover:text-slate-700" onClick={() => navigate('/conferences')}>
          Conferences
        </span>
        <span>/</span>
        <span className="text-slate-900 font-medium">{conference.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/conferences')} className="-ml-2">
            <ChevronLeft size={24} className="text-slate-400" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#1d293d]">
              {conference.name}
            </h1>
            <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
              <span className="flex items-center gap-1">
                <Calendar size={14} /> {conference.dates}
              </span>
              <span>•</span>
              <span className="text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full text-xs">
                {conference.status}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">Schedule View</Button>
          <Button className="bg-[#0f172b]">Conference Dashboard</Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col">
        <div className="border-b border-slate-200 overflow-x-auto">
          <TabsList className="bg-transparent h-12 w-full justify-start gap-6 p-0 min-w-max">
            <TabsTrigger 
              value="agenda" 
              className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-[#0f172b] data-[state=active]:shadow-none px-2 bg-transparent"
            >
              Agenda & Sessions
            </TabsTrigger>
            <TabsTrigger 
              value="speakers" 
              className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-[#0f172b] data-[state=active]:shadow-none px-2 bg-transparent"
            >
              Speakers
            </TabsTrigger>
            <TabsTrigger 
              value="venues" 
              className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-[#0f172b] data-[state=active]:shadow-none px-2 bg-transparent"
            >
              Venues & Rooms
            </TabsTrigger>
            <TabsTrigger 
              value="sponsors" 
              className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-[#0f172b] data-[state=active]:shadow-none px-2 bg-transparent"
            >
              Exhibitors & Sponsors
            </TabsTrigger>
            <TabsTrigger 
              value="staff" 
              className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-[#0f172b] data-[state=active]:shadow-none px-2 bg-transparent"
            >
              Volunteers & Staff
            </TabsTrigger>
            <TabsTrigger 
              value="checkin" 
              className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-[#0f172b] data-[state=active]:shadow-none px-2 bg-transparent"
            >
              Session Check-in
            </TabsTrigger>
            <TabsTrigger 
              value="reports" 
              className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-[#0f172b] data-[state=active]:shadow-none px-2 bg-transparent"
            >
              Reports
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 py-6">
          {/* TAB 1: AGENDA & SESSIONS */}
          <TabsContent value="agenda" className="mt-0">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-bold text-slate-800">Conference Schedule</h2>
                  <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className={`h-7 text-xs ${viewMode === 'list' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}
                      onClick={() => setViewMode('list')}
                    >
                      <List size={14} className="mr-1"/> List View
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className={`h-7 text-xs ${viewMode === 'grid' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid size={14} className="mr-1"/> Grid View
                    </Button>
                  </div>
                </div>
                <Button 
                  className="bg-[#0f172b] hover:bg-[#1d293d]" 
                  onClick={() => setIsAddSessionOpen(true)}
                >
                  <Plus size={16} className="mr-2" /> Add Session
                </Button>
              </div>

              {/* Sessions by Date */}
              {sessionData.map((group, index) => (
                <div key={index} className="flex flex-col gap-4">
                  {/* Date Header */}
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-sm font-bold border border-blue-100">
                      {group.date}
                    </div>
                    <span className="text-slate-400 text-sm font-medium">{group.day}</span>
                    <div className="h-[1px] flex-1 bg-slate-100"></div>
                  </div>

                  {/* List or Grid View */}
                  {viewMode === 'list' ? (
                    <ResponsiveTable
                      data={group.sessions}
                      mobileConfig={sessionConfig}
                      renderDesktop={() => (
                        <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                                <TableHead className="w-[30%] font-bold text-[#253154] text-xs uppercase tracking-wider pl-6">
                                  Session Title
                                </TableHead>
                                <TableHead className="w-[20%] font-bold text-[#253154] text-xs uppercase tracking-wider">
                                  Speaker
                                </TableHead>
                                <TableHead className="w-[15%] font-bold text-[#253154] text-xs uppercase tracking-wider">
                                  Time
                                </TableHead>
                                <TableHead className="w-[15%] font-bold text-[#253154] text-xs uppercase tracking-wider">
                                  Room
                                </TableHead>
                                <TableHead className="w-[10%] font-bold text-[#253154] text-xs uppercase tracking-wider">
                                  Capacity
                                </TableHead>
                                <TableHead className="w-[10%] font-bold text-[#253154] text-xs uppercase tracking-wider">
                                  Status
                                </TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {group.sessions.map((session) => (
                                <TableRow key={session.id} className="hover:bg-slate-50/60 group">
                                  <TableCell className="pl-6">
                                    <div className="flex flex-col gap-1">
                                      <span className="font-bold text-[#1d293d] text-sm">
                                        {session.title}
                                      </span>
                                      <span className="text-[11px] text-slate-400">
                                        {session.id}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      {session.speaker !== "-" && (
                                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                          {session.speaker.charAt(0)}
                                        </div>
                                      )}
                                      <span className="text-sm text-slate-600">
                                        {session.speaker}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                      <Clock size={14} className="text-slate-400" />
                                      {session.time}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                      <MapPin size={14} className="text-slate-400" />
                                      {session.room}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex flex-col gap-1">
                                      <div className="flex items-center gap-1 text-xs">
                                        <span className="font-medium text-slate-700">
                                          {session.registered}
                                        </span>
                                        <span className="text-slate-400">
                                          / {session.capacity}
                                        </span>
                                      </div>
                                      <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                          className="h-full bg-blue-500 rounded-full" 
                                          style={{ width: `${(session.registered / session.capacity) * 100}%` }}
                                        />
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge className={`font-medium border-0 ${getStatusColor(session.status)}`}>
                                      {session.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="h-8 w-8 text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                          <MoreHorizontal size={16} />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem>
                                          <Edit2 className="mr-2 h-4 w-4" /> Edit Session
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600 focus:text-red-600">
                                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {group.sessions.map((session) => (
                        <div 
                          key={session.id} 
                          className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <Badge className={`font-medium border-0 ${getStatusColor(session.status)}`}>
                              {session.status}
                            </Badge>
                            <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2 text-slate-400">
                              <MoreHorizontal size={16} />
                            </Button>
                          </div>
                          <h3 className="font-bold text-[#1d293d] mb-2 line-clamp-2">
                            {session.title}
                          </h3>
                          <div className="space-y-2 text-sm text-slate-600 mb-4">
                            <div className="flex items-center gap-2">
                              <Mic size={14} className="text-slate-400" /> 
                              {session.speaker}
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock size={14} className="text-slate-400" /> 
                              {session.time}
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin size={14} className="text-slate-400" /> 
                              {session.room}
                            </div>
                          </div>
                          <Separator className="mb-3" />
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500">Registered</span>
                            <span className="font-bold text-slate-700">
                              {session.registered} / {session.capacity}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5">
                            <div 
                              className="h-full bg-blue-500 rounded-full" 
                              style={{ width: `${(session.registered / session.capacity) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* TAB 2: SPEAKERS */}
          <TabsContent value="speakers" className="mt-0">
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm min-h-[400px]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg">Speaker Management</h3>
                <Button size="sm" onClick={() => setIsAddSpeakerOpen(true)}>
                  <Mic className="mr-2 h-4 w-4" /> Add Speaker
                </Button>
              </div>
              
              {speakers.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                  <Users size={48} className="mx-auto mb-4 opacity-20" />
                  <p>No speakers added yet.</p>
                  <Button variant="link" onClick={() => setIsAddSpeakerOpen(true)}>
                    Add your first speaker
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {speakers.map((speaker) => (
                    <div 
                      key={speaker.id} 
                      className="bg-white border border-slate-100 rounded-xl p-4 text-center hover:shadow-md transition-shadow"
                    >
                      <Avatar className="w-20 h-20 mx-auto mb-3">
                        <AvatarFallback className="bg-slate-100 text-slate-400 text-xl font-bold">
                          {speaker.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <h4 className="font-bold text-[#1d293d]">{speaker.name}</h4>
                      <p className="text-xs text-blue-600 font-medium mb-2">
                        {speaker.designation}
                      </p>
                      <p className="text-xs text-slate-500 line-clamp-3 mb-4">
                        {speaker.bio}
                      </p>
                      <div className="flex justify-center gap-2">
                        <Button variant="outline" size="sm" className="h-7 text-xs">
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-400">
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* TAB 3: VENUES & ROOMS */}
          <TabsContent value="venues" className="mt-0">
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm min-h-[400px] flex flex-col items-center justify-center text-center">
              <MapPin size={48} className="text-slate-300 mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">
                No venues added yet
              </h3>
              <p className="text-slate-500 text-sm mb-6 max-w-xs">
                Define rooms and locations for your conference sessions.
              </p>
              <Button variant="outline">
                <Plus size={16} className="mr-2"/> Add Venue
              </Button>
            </div>
          </TabsContent>

          {/* TAB 4: EXHIBITORS & SPONSORS */}
          <TabsContent value="sponsors" className="mt-0">
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm min-h-[400px] flex flex-col items-center justify-center text-center">
              <Megaphone size={48} className="text-slate-300 mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">
                No sponsors added yet
              </h3>
              <p className="text-slate-500 text-sm mb-6 max-w-xs">
                Manage exhibitors, partners, and sponsor tiers.
              </p>
              <Button variant="outline">
                <Plus size={16} className="mr-2"/> Add Sponsor
              </Button>
            </div>
          </TabsContent>

          {/* TAB 5: VOLUNTEERS & STAFF */}
          <TabsContent value="staff" className="mt-0">
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm min-h-[400px] flex flex-col items-center justify-center text-center">
              <Users size={48} className="text-slate-300 mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">
                No volunteers assigned yet
              </h3>
              <p className="text-slate-500 text-sm mb-6 max-w-xs">
                Assign staff and volunteers to specific sessions or areas.
              </p>
              <Button variant="outline">
                <Plus size={16} className="mr-2"/> Add Volunteer
              </Button>
            </div>
          </TabsContent>

          {/* TAB 6: SESSION CHECK-IN */}
          <TabsContent value="checkin" className="mt-0">
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm min-h-[400px] flex flex-col items-center justify-center text-center">
              <UserCheck size={48} className="text-slate-300 mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">
                No sessions available for check-in
              </h3>
              <p className="text-slate-500 text-sm mb-6 max-w-xs">
                Check-in will become available once sessions are active and have registered attendees.
              </p>
            </div>
          </TabsContent>

          {/* TAB 7: REPORTS */}
          <TabsContent value="reports" className="mt-0">
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm min-h-[400px] flex flex-col items-center justify-center text-center">
              <BarChart2 size={48} className="text-slate-300 mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">
                No reports generated yet
              </h3>
              <p className="text-slate-500 text-sm mb-6 max-w-xs">
                Generate post-conference analytics and attendance reports.
              </p>
              <Button variant="outline">
                <FileText size={16} className="mr-2"/> Generate Report
              </Button>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Add Session Sheet */}
      <Sheet open={isAddSessionOpen} onOpenChange={setIsAddSessionOpen}>
        <SheetContent className="overflow-y-auto w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Add Session</SheetTitle>
            <SheetDescription>
              Create a new session for the conference agenda.
            </SheetDescription>
          </SheetHeader>

          <div className="py-6 space-y-6">
            <div className="space-y-2">
              <Label>Session Title</Label>
              <Input 
                placeholder="e.g. Keynote Speech" 
                value={newSession.title}
                onChange={(e) => setNewSession({...newSession, title: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Speaker(s)</Label>
              <Input 
                placeholder="e.g. John Doe" 
                value={newSession.speaker}
                onChange={(e) => setNewSession({...newSession, speaker: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input 
                  type="time" 
                  value={newSession.startTime}
                  onChange={(e) => setNewSession({...newSession, startTime: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input 
                  type="time" 
                  value={newSession.endTime}
                  onChange={(e) => setNewSession({...newSession, endTime: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Room</Label>
                <Input 
                  placeholder="e.g. Hall A" 
                  value={newSession.room}
                  onChange={(e) => setNewSession({...newSession, room: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Capacity</Label>
                <Input 
                  type="number" 
                  placeholder="e.g. 100" 
                  value={newSession.capacity}
                  onChange={(e) => setNewSession({...newSession, capacity: e.target.value})}
                />
              </div>
            </div>
          </div>

          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline">Cancel</Button>
            </SheetClose>
            <Button className="bg-[#0f172b]" onClick={handleAddSession}>
              Save Session
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Add Speaker Sheet */}
      <Sheet open={isAddSpeakerOpen} onOpenChange={setIsAddSpeakerOpen}>
        <SheetContent className="overflow-y-auto w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Add Speaker</SheetTitle>
            <SheetDescription>
              Add a new speaker to the conference.
            </SheetDescription>
          </SheetHeader>

          <div className="py-6 space-y-6">
            <div className="flex items-center justify-center mb-6">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center border-2 border-dashed border-slate-300 cursor-pointer hover:bg-slate-50">
                <div className="text-center">
                  <Plus size={24} className="mx-auto text-slate-400 mb-1" />
                  <span className="text-[10px] text-slate-500 uppercase font-bold">
                    Photo
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Name</Label>
              <Input 
                placeholder="e.g. Dr. Sarah Smith" 
                value={newSpeaker.name}
                onChange={(e) => setNewSpeaker({...newSpeaker, name: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Designation / Title</Label>
              <Input 
                placeholder="e.g. Keynote Speaker, CEO" 
                value={newSpeaker.designation}
                onChange={(e) => setNewSpeaker({...newSpeaker, designation: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea 
                placeholder="Short biography..." 
                rows={4}
                value={newSpeaker.bio}
                onChange={(e) => setNewSpeaker({...newSpeaker, bio: e.target.value})}
              />
            </div>
          </div>

          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline">Cancel</Button>
            </SheetClose>
            <Button className="bg-[#0f172b]" onClick={handleAddSpeaker}>
              Save Speaker
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};