import React, { useState, useEffect } from 'react';
import {
  Plus,
  Mail,
  MessageSquare,
  Send,
  Clock,
  FileEdit,
  MoreHorizontal,
  Copy,
  Pause,
  Play,
  BarChart2,
  Trash2,
  Users,
  RefreshCw,
  Loader2,
  AlertCircle,
  Settings,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '../ui/dialog';
import { ResponsiveTable, MobileCardConfig } from '../ui/responsive-table';
import { CommsCampaignBuilder } from './communications/CommsCampaignBuilder';
import { CommsTemplateEditor } from './communications/CommsTemplateEditor';
import { CommsAudienceBuilder } from './communications/CommsAudienceBuilder';
import { CommsSettings } from './communications/CommsSettings';
import { eventsAPI, Campaign, MessageTemplate, AudienceSegment, CreateSegmentInput } from '../../api/events.api';
import { toast } from 'sonner';

interface EventCommunicationsProps {
  eventId: number;
}

const TemplateCard = ({ 
  template, 
  onEdit, 
  onDuplicate, 
  onDelete 
}: { 
  template: MessageTemplate; 
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div 
      className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      data-testid={`template-card-${template.id}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2 rounded-lg ${template.channel === 'email' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
          {template.channel === 'email' ? <Mail size={20} /> : <MessageSquare size={20} />}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2" data-testid={`template-menu-${template.id}`}>
              <MoreHorizontal size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicate}>Duplicate</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-rose-600" onClick={onDelete}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <h4 className="font-bold text-[#1d293d] mb-1">{template.name}</h4>
      <p className="text-xs text-slate-500">Last edited {formatDate(template.updated_at)}</p>
    </div>
  );
};

const SegmentCard = ({ 
  segment, 
  onEdit, 
  onRefresh, 
  onDelete 
}: { 
  segment: AudienceSegment; 
  onEdit: () => void;
  onRefresh: () => void;
  onDelete: () => void;
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div 
      className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
      data-testid={`segment-card-${segment.id}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
          <Users size={20} />
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={segment.is_active ? 'default' : 'secondary'} className={segment.is_active ? 'bg-emerald-100 text-emerald-700' : ''}>
            {segment.is_active ? 'Active' : 'Inactive'}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2" data-testid={`segment-menu-${segment.id}`}>
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={onRefresh}>
                <RefreshCw size={14} className="mr-2" /> Refresh Count
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-rose-600" onClick={onDelete}>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <h4 className="font-bold text-[#1d293d] mb-1">{segment.name}</h4>
      {segment.description && <p className="text-xs text-slate-500 mb-2">{segment.description}</p>}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Users size={12} /> {segment.estimated_count} attendees
        </span>
        <span>Updated: {formatDate(segment.last_evaluated_at)}</span>
      </div>
      <div className="mt-3 pt-3 border-t border-slate-100">
        <div className="flex gap-1 flex-wrap">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            {segment.match_type === 'ALL' ? 'Match ALL' : 'Match ANY'}
          </Badge>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            {segment.rules_json.length} rule{segment.rules_json.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export const EventCommunications: React.FC<EventCommunicationsProps> = ({ eventId }) => {
  // Data state
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [segments, setSegments] = useState<AudienceSegment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI state
  const [viewMode, setViewMode] = useState<'list' | 'create-campaign' | 'edit-campaign' | 'create-template' | 'edit-template' | 'create-segment' | 'edit-segment'>('list');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<AudienceSegment | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'campaign' | 'template' | 'segment'>('campaign');
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch data
  const fetchCampaigns = async () => {
    try {
      const data = await eventsAPI.getCampaigns(eventId);
      setCampaigns(data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Failed to load campaigns');
    }
  };

  const fetchTemplates = async () => {
    try {
      const data = await eventsAPI.getTemplates(eventId);
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    }
  };

  const fetchSegments = async () => {
    try {
      const data = await eventsAPI.getSegments(eventId);
      setSegments(data);
    } catch (error) {
      console.error('Error fetching segments:', error);
      toast.error('Failed to load segments');
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchCampaigns(), fetchTemplates(), fetchSegments()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, [eventId]);

  // Campaign actions
  const handleEditCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setViewMode('edit-campaign');
  };

  const handleDuplicateCampaign = async (campaignId: number) => {
    try {
      await eventsAPI.duplicateCampaign(eventId, campaignId);
      toast.success('Campaign duplicated successfully');
      fetchCampaigns();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to duplicate campaign');
    }
  };

  const handleSendCampaign = async (campaignId: number) => {
    try {
      const result = await eventsAPI.sendCampaign(eventId, campaignId);
      if (result.success) {
        toast.success(`Campaign sent to ${result.recipientCount} recipients`);
        fetchCampaigns();
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send campaign');
    }
  };

  const handlePauseCampaign = async (campaignId: number) => {
    try {
      await eventsAPI.pauseCampaign(eventId, campaignId);
      toast.success('Campaign paused');
      fetchCampaigns();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to pause campaign');
    }
  };

  const handleResumeCampaign = async (campaignId: number) => {
    try {
      await eventsAPI.resumeCampaign(eventId, campaignId);
      toast.success('Campaign resumed');
      fetchCampaigns();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resume campaign');
    }
  };

  const handleDeleteCampaign = async () => {
    if (!deleteItemId) return;
    try {
      setIsDeleting(true);
      await eventsAPI.deleteCampaign(eventId, deleteItemId);
      toast.success('Campaign deleted successfully');
      fetchCampaigns();
      setDeleteDialogOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete campaign');
    } finally {
      setIsDeleting(false);
    }
  };

  // Template actions
  const handleEditTemplate = (template: MessageTemplate) => {
    setSelectedTemplate(template);
    setViewMode('edit-template');
  };

  const handleDuplicateTemplate = async (templateId: number) => {
    try {
      await eventsAPI.duplicateTemplate(eventId, templateId);
      toast.success('Template duplicated successfully');
      fetchTemplates();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to duplicate template');
    }
  };

  const handleDeleteTemplate = async () => {
    if (!deleteItemId) return;
    try {
      setIsDeleting(true);
      await eventsAPI.deleteTemplate(eventId, deleteItemId);
      toast.success('Template deleted successfully');
      fetchTemplates();
      setDeleteDialogOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete template');
    } finally {
      setIsDeleting(false);
    }
  };

  // Segment actions
  const handleEditSegment = (segment: AudienceSegment) => {
    setSelectedSegment(segment);
    setViewMode('edit-segment');
  };

  const handleRefreshSegment = async (segmentId: number) => {
    try {
      await eventsAPI.refreshSegment(eventId, segmentId);
      toast.success('Segment count refreshed');
      fetchSegments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to refresh segment');
    }
  };

  const handleDeleteSegment = async () => {
    if (!deleteItemId) return;
    try {
      setIsDeleting(true);
      await eventsAPI.deleteSegment(eventId, deleteItemId);
      toast.success('Segment deleted successfully');
      fetchSegments();
      setDeleteDialogOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete segment');
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDelete = (type: 'campaign' | 'template' | 'segment', id: number) => {
    setDeleteType(type);
    setDeleteItemId(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (deleteType === 'campaign') handleDeleteCampaign();
    else if (deleteType === 'template') handleDeleteTemplate();
    else if (deleteType === 'segment') handleDeleteSegment();
  };

  // Campaign save handler
  const handleCampaignSave = async (data: any, sendNow: boolean) => {
    try {
      if (selectedCampaign) {
        await eventsAPI.updateCampaign(eventId, selectedCampaign.id, data);
        if (sendNow) {
          await eventsAPI.sendCampaign(eventId, selectedCampaign.id);
          toast.success('Campaign updated and sent');
        } else {
          toast.success('Campaign updated successfully');
        }
      } else {
        const campaign = await eventsAPI.createCampaign(eventId, data);
        if (sendNow) {
          await eventsAPI.sendCampaign(eventId, campaign.id);
          toast.success('Campaign created and sent');
        } else {
          toast.success('Campaign created successfully');
        }
      }
      fetchCampaigns();
      setViewMode('list');
      setSelectedCampaign(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save campaign');
    }
  };

  // Template save handler
  const handleTemplateSave = async (data: any) => {
    try {
      if (selectedTemplate) {
        await eventsAPI.updateTemplate(eventId, selectedTemplate.id, data);
        toast.success('Template updated successfully');
      } else {
        await eventsAPI.createTemplate(eventId, data);
        toast.success('Template created successfully');
      }
      fetchTemplates();
      setViewMode('list');
      setSelectedTemplate(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save template');
    }
  };

  // Segment save handler
  const handleSegmentSave = async (data: CreateSegmentInput) => {
    try {
      if (selectedSegment) {
        await eventsAPI.updateSegment(eventId, selectedSegment.id, data);
        toast.success('Segment updated successfully');
      } else {
        await eventsAPI.createSegment(eventId, data);
        toast.success('Segment created successfully');
      }
      fetchSegments();
      setViewMode('list');
      setSelectedSegment(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save segment');
    }
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Render campaign builder
  if (viewMode === 'create-campaign' || viewMode === 'edit-campaign') {
    return (
      <CommsCampaignBuilder 
        eventId={eventId}
        campaign={selectedCampaign}
        templates={templates}
        onCancel={() => { setViewMode('list'); setSelectedCampaign(null); }} 
        onSave={handleCampaignSave} 
      />
    );
  }

  // Render template editor
  if (viewMode === 'create-template' || viewMode === 'edit-template') {
    return (
      <CommsTemplateEditor 
        eventId={eventId}
        template={selectedTemplate}
        onCancel={() => { setViewMode('list'); setSelectedTemplate(null); }} 
        onSave={handleTemplateSave} 
      />
    );
  }

  // Render segment builder
  if (viewMode === 'create-segment' || viewMode === 'edit-segment') {
    return (
      <CommsAudienceBuilder 
        eventId={eventId}
        segment={selectedSegment}
        onCancel={() => { setViewMode('list'); setSelectedSegment(null); }} 
        onSave={handleSegmentSave} 
      />
    );
  }

  // Mobile config for campaigns
  const mobileConfig: MobileCardConfig<Campaign> = {
    idField: (camp) => camp.id.toString(),
    titleField: (camp) => camp.name,
    valueField: (camp) => (
      <div className="flex items-center gap-1.5 text-slate-600 text-xs font-medium">
        {camp.channel === 'email' ? <Mail size={14} /> : <MessageSquare size={14} />}
        {camp.channel.charAt(0).toUpperCase() + camp.channel.slice(1)}
      </div>
    ),
    statusField: (camp) => (
      <Badge variant="outline" className={`font-normal border-0 px-2 py-0 h-5 text-[10px] ${
        camp.status === 'sent' ? 'bg-emerald-50 text-emerald-600' :
        camp.status === 'scheduled' ? 'bg-blue-50 text-blue-600' :
        camp.status === 'paused' ? 'bg-amber-50 text-amber-600' :
        'bg-slate-100 text-slate-500'
      }`}>
        {camp.status.charAt(0).toUpperCase() + camp.status.slice(1)}
      </Badge>
    ),
    expandedFields: [
      { label: "Date", value: (c) => formatDate(c.sent_at || c.scheduled_at) },
      { label: "Recipients", value: (c) => c.total_recipients > 0 ? c.total_recipients.toLocaleString() : '-' },
      {
        label: "Performance",
        value: (c) => c.status === 'sent' ? (
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-600">
              <span className="font-bold">{c.open_rate}%</span> Open
            </span>
            <span className="text-slate-600">
              <span className="font-bold">{c.click_rate}%</span> Click
            </span>
          </div>
        ) : <span className="text-xs text-slate-400">No data yet</span>
      }
    ],
    actions: (camp) => (
      <Button size="sm" variant="outline" className="w-full" onClick={() => handleEditCampaign(camp)}>
        Manage Campaign
      </Button>
    )
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <Tabs defaultValue="campaigns" className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <TabsList className="bg-white border border-slate-200 justify-start h-10 p-1 flex-wrap">
          <TabsTrigger value="campaigns" className="data-[state=active]:bg-slate-100" data-testid="campaigns-tab">
            All Campaigns
          </TabsTrigger>
          <TabsTrigger value="templates" className="data-[state=active]:bg-slate-100" data-testid="templates-tab">
            Templates
          </TabsTrigger>
          <TabsTrigger value="segments" className="data-[state=active]:bg-slate-100" data-testid="segments-tab">
            Audience Segments
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-slate-100" data-testid="settings-tab">
            Settings
          </TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <Button 
            className="bg-[#0f172b]" 
            onClick={() => { setSelectedCampaign(null); setViewMode('create-campaign'); }}
            data-testid="new-campaign-btn"
          >
            <Plus size={16} className="mr-2" /> New Campaign
          </Button>
        </div>
      </div>

      {/* Tab 1: All Campaigns */}
      <TabsContent value="campaigns" className="space-y-6">
        {campaigns.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center">
            <Mail size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No campaigns yet</h3>
            <p className="text-sm text-slate-500 mb-4">Create your first campaign to start communicating with attendees</p>
            <Button 
              className="bg-[#0f172b]"
              onClick={() => { setSelectedCampaign(null); setViewMode('create-campaign'); }}
            >
              <Plus size={16} className="mr-2" /> Create Campaign
            </Button>
          </div>
        ) : (
          <ResponsiveTable
            data={campaigns}
            mobileConfig={mobileConfig}
            renderDesktop={() => (
              <div className="bg-white rounded-[20px] border border-slate-100 shadow-sm overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50">
                      <TableHead className="text-[#253154] font-bold">Campaign Name</TableHead>
                      <TableHead className="text-[#253154] font-bold">Type</TableHead>
                      <TableHead className="text-[#253154] font-bold">Status</TableHead>
                      <TableHead className="text-[#253154] font-bold">Recipients</TableHead>
                      <TableHead className="text-[#253154] font-bold">Performance</TableHead>
                      <TableHead className="text-right text-[#253154] font-bold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((camp) => (
                      <TableRow key={camp.id} className="hover:bg-slate-50/60" data-testid={`campaign-row-${camp.id}`}>
                        <TableCell>
                          <div className="font-medium text-[#1d293d]">{camp.name}</div>
                          <div className="text-xs text-slate-400">{formatDate(camp.sent_at || camp.scheduled_at || camp.created_at)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            {camp.channel === 'email' ? <Mail size={16} /> : <MessageSquare size={16} />}
                            {camp.channel.charAt(0).toUpperCase() + camp.channel.slice(1)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`font-normal border-0 ${
                            camp.status === 'sent' ? 'bg-emerald-50 text-emerald-600' :
                            camp.status === 'scheduled' ? 'bg-blue-50 text-blue-600' :
                            camp.status === 'paused' ? 'bg-amber-50 text-amber-600' :
                            camp.status === 'sending' ? 'bg-violet-50 text-violet-600' :
                            'bg-slate-100 text-slate-500'
                          }`}>
                            {camp.status === 'sent' && <Send size={12} className="mr-1" />}
                            {camp.status === 'scheduled' && <Clock size={12} className="mr-1" />}
                            {camp.status === 'draft' && <FileEdit size={12} className="mr-1" />}
                            {camp.status === 'paused' && <Pause size={12} className="mr-1" />}
                            {camp.status === 'sending' && <Loader2 size={12} className="mr-1 animate-spin" />}
                            {camp.status.charAt(0).toUpperCase() + camp.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {camp.total_recipients > 0 ? camp.total_recipients.toLocaleString() : '-'}
                        </TableCell>
                        <TableCell>
                          {camp.status === 'sent' ? (
                            <div className="flex items-center gap-3 text-xs">
                              <span className="text-slate-600"><span className="font-bold">{camp.open_rate}%</span> Open</span>
                              <span className="text-slate-600"><span className="font-bold">{camp.click_rate}%</span> Click</span>
                            </div>
                          ) : <span className="text-xs text-slate-400">No data yet</span>}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400" data-testid={`campaign-menu-${camp.id}`}>
                                <MoreHorizontal size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {['draft', 'scheduled'].includes(camp.status) && (
                                <DropdownMenuItem onClick={() => handleEditCampaign(camp)}>
                                  <FileEdit className="mr-2 h-4 w-4" /> Edit Campaign
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleDuplicateCampaign(camp.id)}>
                                <Copy className="mr-2 h-4 w-4" /> Duplicate
                              </DropdownMenuItem>
                              {camp.status === 'draft' && (
                                <DropdownMenuItem onClick={() => handleSendCampaign(camp.id)}>
                                  <Send className="mr-2 h-4 w-4" /> Send Now
                                </DropdownMenuItem>
                              )}
                              {camp.status === 'scheduled' && (
                                <DropdownMenuItem onClick={() => handlePauseCampaign(camp.id)}>
                                  <Pause className="mr-2 h-4 w-4" /> Pause
                                </DropdownMenuItem>
                              )}
                              {camp.status === 'paused' && (
                                <DropdownMenuItem onClick={() => handleResumeCampaign(camp.id)}>
                                  <Play className="mr-2 h-4 w-4" /> Resume
                                </DropdownMenuItem>
                              )}
                              {camp.status === 'sent' && (
                                <DropdownMenuItem>
                                  <BarChart2 className="mr-2 h-4 w-4" /> View Performance
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-rose-600 focus:text-rose-600" onClick={() => confirmDelete('campaign', camp.id)}>
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
        )}
      </TabsContent>

      {/* Tab 2: Templates */}
      <TabsContent value="templates" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {templates.map((template) => (
            <TemplateCard 
              key={template.id}
              template={template}
              onEdit={() => handleEditTemplate(template)}
              onDuplicate={() => handleDuplicateTemplate(template.id)}
              onDelete={() => confirmDelete('template', template.id)}
            />
          ))}
          <div
            className="border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center p-6 hover:bg-slate-50 cursor-pointer text-slate-400 flex-col gap-2"
            onClick={() => { setSelectedTemplate(null); setViewMode('create-template'); }}
            data-testid="create-template-btn"
          >
            <Plus size={24} />
            <span className="font-medium">Create Template</span>
          </div>
        </div>
      </TabsContent>

      {/* Tab 3: Audience Segments */}
      <TabsContent value="segments" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {segments.map((segment) => (
            <SegmentCard 
              key={segment.id}
              segment={segment}
              onEdit={() => handleEditSegment(segment)}
              onRefresh={() => handleRefreshSegment(segment.id)}
              onDelete={() => confirmDelete('segment', segment.id)}
            />
          ))}
          <div
            className="border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center p-6 hover:bg-slate-50 cursor-pointer text-slate-400 flex-col gap-2"
            onClick={() => { setSelectedSegment(null); setViewMode('create-segment'); }}
            data-testid="create-segment-btn"
          >
            <Plus size={24} />
            <span className="font-medium">Create Segment</span>
          </div>
        </div>
      </TabsContent>

      {/* Tab 4: Settings */}
      <TabsContent value="settings" className="space-y-6">
        <CommsSettings eventId={eventId} />
      </TabsContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-rose-500" />
              Delete {deleteType.charAt(0).toUpperCase() + deleteType.slice(1)}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {deleteType}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Tabs>
  );
};
