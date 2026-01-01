import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Trophy,
  Plus,
  Search,
  Filter,
  Download,
  FileText,
  Upload,
  Eye,
  Clock,
  Award,
  Gavel,
  Users
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Separator } from '../components/ui/separator';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ScrollArea } from '../components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

interface Entry {
  id: string;
  title: string;
  category: string;
  applicant: string;
  organization: string;
  status: 'Pending Review' | 'Scored';
  score: number | null;
  submittedAt: string;
  description: string;
  files: string[];
}

const mockEntries: Entry[] = [
  {
    id: "ENT-001",
    title: "Sustainable Water Purification System",
    category: "Innovation",
    applicant: "John Doe",
    organization: "GreenTech Solutions",
    status: "Pending Review",
    score: null,
    submittedAt: "Jan 15, 2024",
    description: "A novel approach to water purification using solar energy and nanomaterials. This innovative system combines renewable energy with cutting-edge filtration technology to provide clean drinking water in resource-limited settings. The solution has been tested in three pilot communities with remarkable results, achieving 99.9% removal of contaminants while reducing energy costs by 70%.",
    files: ["Project_Proposal.pdf", "Technical_Schematics.pdf", "Impact_Assessment.docx"]
  },
  {
    id: "ENT-002",
    title: "AI-Driven Crop Monitoring Platform",
    category: "Technology",
    applicant: "Sarah Smith",
    organization: "AgriFuture",
    status: "Scored",
    score: 8.5,
    submittedAt: "Jan 18, 2024",
    description: "Using satellite imagery and machine learning to predict crop health, optimize irrigation, and increase agricultural yields by up to 35%. The platform analyzes multispectral data to detect early signs of disease, nutrient deficiencies, and water stress, enabling farmers to take proactive measures.",
    files: ["Presentation_Deck.pdf", "Demo_Video.mp4"]
  },
  {
    id: "ENT-003",
    title: "Community Healthcare App",
    category: "Social Impact",
    applicant: "David Johnson",
    organization: "HealthBridge",
    status: "Pending Review",
    score: null,
    submittedAt: "Jan 20, 2024",
    description: "A mobile application connecting rural communities with healthcare professionals through telemedicine, reducing travel time and improving access to medical advice and prescriptions.",
    files: ["App_Overview.pdf", "User_Testimonials.pdf", "Technical_Documentation.pdf"]
  }
];

export const AwardManagePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("entries");
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(mockEntries[0].id);

  const award = {
    id: id || 'AWD-2024-01',
    name: 'India UK Achievers Honours 2024',
    deadline: 'Jan 30, 2024',
    status: 'Judging In Progress'
  };

  const selectedEntry = mockEntries.find(e => e.id === selectedEntryId);

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-slate-500 text-sm">
        <span className="cursor-pointer hover:text-slate-700" onClick={() => navigate('/awards')}>
          Awards
        </span>
        <span>/</span>
        <span className="text-slate-900 font-medium">{award.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/awards')} className="-ml-2">
            <ChevronLeft size={24} className="text-slate-400" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#1d293d]">
              {award.name}
            </h1>
            <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
              <span className="flex items-center gap-1">
                <Trophy size={14} /> Deadline: {award.deadline}
              </span>
              <span>•</span>
              <span className="text-purple-600 font-medium bg-purple-50 px-2 py-0.5 rounded-full text-xs">
                {award.status}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">Preview Form</Button>
          <Button className="bg-[#0f172b]">Award Dashboard</Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col min-h-0">
        <div className="border-b border-slate-200 overflow-x-auto shrink-0">
          <TabsList className="bg-transparent h-12 w-full justify-start gap-6 p-0 min-w-max">
            <TabsTrigger 
              value="overview" 
              className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-[#0f172b] data-[state=active]:shadow-none px-2 bg-transparent"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="categories" 
              className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-[#0f172b] data-[state=active]:shadow-none px-2 bg-transparent"
            >
              Categories
            </TabsTrigger>
            <TabsTrigger 
              value="entries" 
              className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-[#0f172b] data-[state=active]:shadow-none px-2 bg-transparent"
            >
              Entries & Review
            </TabsTrigger>
            <TabsTrigger 
              value="judges" 
              className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-[#0f172b] data-[state=active]:shadow-none px-2 bg-transparent"
            >
              Judges
            </TabsTrigger>
            <TabsTrigger 
              value="scoring" 
              className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-[#0f172b] data-[state=active]:shadow-none px-2 bg-transparent"
            >
              Scoring
            </TabsTrigger>
            <TabsTrigger 
              value="results" 
              className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-[#0f172b] data-[state=active]:shadow-none px-2 bg-transparent"
            >
              Results
            </TabsTrigger>
            <TabsTrigger 
              value="certificates" 
              className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-[#0f172b] data-[state=active]:shadow-none px-2 bg-transparent"
            >
              Certificates
            </TabsTrigger>
            <TabsTrigger 
              value="reports" 
              className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-[#0f172b] data-[state=active]:shadow-none px-2 bg-transparent"
            >
              Reports
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 py-6 min-h-0">
          {/* TAB 1: OVERVIEW */}
          <TabsContent value="overview" className="mt-0 h-full overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column - Program Details */}
              <div className="col-span-2 flex flex-col gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
                  <h3 className="font-bold text-lg text-[#1d293d]">Program Details</h3>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="programName">Program Name</Label>
                    <Input id="programName" defaultValue={award.name} />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      className="min-h-[120px]" 
                      placeholder="Enter a brief description of the awards program..." 
                      defaultValue="Celebrating the achievements of Indian students and alumni who have undertaken their higher education in the UK."
                    />
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <div className="grid gap-2">
                    <h4 className="font-medium text-sm text-slate-700 mb-2">Key Dates</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="entryStart">Entry Start Date</Label>
                        <Input id="entryStart" type="date" defaultValue="2023-11-01" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="entryEnd">Entry End Date</Label>
                        <Input id="entryEnd" type="date" defaultValue="2024-01-30" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="judgingStart">Judging Start Date</Label>
                        <Input id="judgingStart" type="date" defaultValue="2024-02-01" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="judgingEnd">Judging End Date</Label>
                        <Input id="judgingEnd" type="date" defaultValue="2024-02-28" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Status & Actions */}
              <div className="flex flex-col gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
                  <h3 className="font-bold text-lg text-[#1d293d]">Program Status</h3>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-sm">Current Status</span>
                    <Badge className="bg-purple-50 text-purple-600 hover:bg-purple-100 border-0">
                      {award.status}
                    </Badge>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 text-sm">Total Categories</span>
                      <span className="font-bold text-[#1d293d]">12</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 text-sm">Total Entries</span>
                      <span className="font-bold text-[#1d293d]">450</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 text-sm">Judges Assigned</span>
                      <span className="font-bold text-[#1d293d]">24</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3">
                  <Button className="w-full bg-[#0f172b] hover:bg-[#1d293d] h-11">
                    Publish Program
                  </Button>
                  <Button variant="outline" className="w-full h-11 border-slate-200 text-slate-600 hover:text-slate-800">
                    Save Draft
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: ENTRIES & REVIEW (3-PANEL) */}
          <TabsContent value="entries" className="mt-0 h-full">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 flex overflow-hidden h-full">
              {/* Left Panel - Entry List */}
              <div className="w-1/3 min-w-[320px] border-r border-slate-200 flex flex-col bg-slate-50/50">
                {/* Search & Filters */}
                <div className="p-4 border-b border-slate-200 space-y-3 bg-white">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input placeholder="Search entries..." className="pl-9 bg-slate-50" />
                  </div>
                  
                  <div className="flex gap-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-full bg-slate-50">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="innovation">Innovation</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="impact">Social Impact</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon" className="shrink-0 bg-slate-50">
                      <Filter size={16} />
                    </Button>
                  </div>
                </div>
                
                {/* Entry List */}
                <ScrollArea className="flex-1">
                  <div className="divide-y divide-slate-100">
                    {mockEntries.map((entry) => (
                      <div 
                        key={entry.id}
                        onClick={() => setSelectedEntryId(entry.id)}
                        className={`p-4 cursor-pointer transition-colors hover:bg-slate-50 ${
                          selectedEntryId === entry.id 
                            ? 'bg-white border-l-4 border-l-[#0f172b] shadow-sm' 
                            : 'border-l-4 border-l-transparent'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                            {entry.id}
                          </span>
                          {entry.status === "Scored" ? (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[10px] px-1.5 py-0">
                              Scored: {entry.score}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-100 text-[10px] px-1.5 py-0">
                              Pending
                            </Badge>
                          )}
                        </div>

                        <h4 className="font-bold text-slate-800 text-sm mb-1 line-clamp-1">
                          {entry.title}
                        </h4>

                        <p className="text-xs text-slate-500 mb-2">
                          {entry.applicant} • {entry.organization}
                        </p>

                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <Award size={12} />
                          <span className="truncate">{entry.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Main Panel - Entry Details */}
              <div className="flex-1 flex flex-col bg-white overflow-hidden">
                {selectedEntry ? (
                  <div className="h-full flex flex-col">
                    {/* Entry Header */}
                    <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-white">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="font-normal bg-slate-100 text-slate-600">
                            {selectedEntry.category}
                          </Badge>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock size={12} /> Submitted {selectedEntry.submittedAt}
                          </span>
                        </div>

                        <h2 className="text-2xl font-bold text-slate-900 mb-2">
                          {selectedEntry.title}
                        </h2>

                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-blue-50 text-blue-600 text-xs">
                              {selectedEntry.applicant.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-sm">
                            <span className="font-medium text-slate-900">
                              {selectedEntry.applicant}
                            </span>
                            <span className="text-slate-400"> from </span>
                            <span className="text-slate-500">
                              {selectedEntry.organization}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" /> Download All
                      </Button>
                    </div>
                    
                    {/* Entry Content */}
                    <div className="flex-1 overflow-y-auto">
                      <div className="max-w-4xl mx-auto p-8 space-y-8">
                        
                        {/* Abstract Section */}
                        <section>
                          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                            <FileText size={18} className="text-slate-400" /> Abstract
                          </h3>
                          <p className="text-slate-600 leading-relaxed text-sm">
                            {selectedEntry.description}
                          </p>
                        </section>

                        <Separator />

                        {/* Attached Files Section */}
                        <section>
                          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                            <Upload size={18} className="text-slate-400" /> Attached Files
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {selectedEntry.files.map((file, i) => (
                              <div 
                                key={i} 
                                className="flex items-center p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                              >
                                <div className="h-8 w-8 bg-slate-100 rounded flex items-center justify-center mr-3 text-slate-500">
                                  <FileText size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-slate-700 truncate">
                                    {file}
                                  </p>
                                  <p className="text-xs text-slate-400">PDF • 2.4 MB</p>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                                  <Eye size={14} />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </section>

                        <Separator />

                        {/* Scoring Rubric Section */}
                        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
                          <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-[#1d293d]">
                            <Gavel size={18} className="text-[#1d293d]" /> Judge Scoring
                          </h3>
                          
                          <div className="space-y-6">
                            {/* Scoring Criteria */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              {/* Innovation */}
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <Label className="font-medium">Innovation</Label>
                                  <span className="text-xs text-slate-400">Max 10</span>
                                </div>
                                <Input 
                                  type="number" 
                                  min="0" 
                                  max="10" 
                                  placeholder="0" 
                                  className="bg-white" 
                                />
                                <p className="text-[10px] text-slate-500">
                                  Originality of the solution
                                </p>
                              </div>

                              {/* Impact */}
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <Label className="font-medium">Impact</Label>
                                  <span className="text-xs text-slate-400">Max 10</span>
                                </div>
                                <Input 
                                  type="number" 
                                  min="0" 
                                  max="10" 
                                  placeholder="0" 
                                  className="bg-white" 
                                />
                                <p className="text-[10px] text-slate-500">
                                  Measurable results
                                </p>
                              </div>

                              {/* Feasibility */}
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <Label className="font-medium">Feasibility</Label>
                                  <span className="text-xs text-slate-400">Max 10</span>
                                </div>
                                <Input 
                                  type="number" 
                                  min="0" 
                                  max="10" 
                                  placeholder="0" 
                                  className="bg-white" 
                                />
                                <p className="text-[10px] text-slate-500">
                                  Implementation potential
                                </p>
                              </div>
                            </div>
                            
                            {/* Judge Comments */}
                            <div className="space-y-2">
                              <Label className="font-medium">Judge Comments</Label>
                              <Textarea 
                                className="min-h-[100px] bg-white" 
                                placeholder="Provide feedback on this entry..." 
                              />
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end pt-2">
                              <Button className="bg-[#0f172b] hover:bg-[#1d293d] min-w-[120px]">
                                Submit Score
                              </Button>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                    <Award size={48} className="opacity-20 mb-4" />
                    <p>Select an entry to review</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: CATEGORIES */}
          <TabsContent value="categories" className="mt-0">
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-lg">Award Categories</h3>
            </div>
          </TabsContent>

          {/* TAB 4: JUDGES */}
          <TabsContent value="judges" className="mt-0">
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm min-h-[400px]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg">Judging Panel</h3>
                <Button size="sm">
                  <Gavel className="mr-2 h-4 w-4" /> Invite Judge
                </Button>
              </div>
              <div className="text-center py-20 text-slate-400">
                <Users size={48} className="mx-auto mb-4 opacity-20" />
                <p>Judges list will appear here.</p>
              </div>
            </div>
          </TabsContent>

          {/* TAB 5: SCORING */}
          <TabsContent value="scoring" className="mt-0">
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-lg">Scoring Configuration</h3>
            </div>
          </TabsContent>

          {/* TAB 6: RESULTS */}
          <TabsContent value="results" className="mt-0">
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-lg">Results & Winners</h3>
            </div>
          </TabsContent>

          {/* TAB 7: CERTIFICATES */}
          <TabsContent value="certificates" className="mt-0">
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-lg">Certificates</h3>
            </div>
          </TabsContent>

          {/* TAB 8: REPORTS */}
          <TabsContent value="reports" className="mt-0">
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-lg">Reports</h3>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
