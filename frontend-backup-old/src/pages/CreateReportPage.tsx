import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, PieChart, Table as TableIcon, Filter, CheckCircle2, AlertCircle,
  Plus, X, ChevronDown, ChevronRight, Save, Trash2, Copy,
  Calculator, Play, AlertTriangle, Info, LineChart,
  History, Download, Bell
} from 'lucide-react';
import { CreatePageLayout } from '../components/common/CreatePageLayout';
import { FormCard, SidebarCard } from '../components/common/FormCard';
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";
import { Checkbox } from "../components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Separator } from "../components/ui/separator";
import { toast } from 'sonner';

interface CreateReportPageProps {
  onBack?: () => void;
}

interface Metric {
  id: string;
  name: string;
  aggregation: 'count' | 'sum' | 'avg' | 'min' | 'max' | 'unique';
  alias?: string;
  filter?: { field: string; operator: string; value: string };
}

interface FilterCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface FilterGroup {
  id: string;
  logic: 'AND' | 'OR';
  conditions: FilterCondition[];
}

export function CreateReportPage({ onBack }: CreateReportPageProps) {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState({
    name: '',
    category: 'registrations',
    dataSource: 'events',
    metrics: [] as Metric[],
    dimensions: ['Event Name', 'Ticket Type'] as string[],
    visualization: 'table',
    sortBy: '',
    sortOrder: 'desc' as 'asc' | 'desc',
    limitResults: 100,
    // Visualization config
    xAxis: '',
    yAxis: '',
    colorBy: '',
    stackedMode: false,
    percentageMode: false,
    // Export config
    exportFormat: 'xlsx',
    includeTimestamp: true,
    selectedColumns: [] as string[],
    fileNameTemplate: '',
    // Scheduling
    isScheduled: false,
    frequency: 'weekly',
    timezone: 'UTC',
    recipients: [] as string[],
    notifyOnFailure: true
  });

  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData] = useState([
    { event: 'Innovation Summit', registrations: 245, revenue: '$24,500', date: '2024-12-15' },
    { event: 'Tech Conference', registrations: 189, revenue: '$18,900', date: '2024-12-16' },
    { event: 'Awards Gala', registrations: 156, revenue: '$31,200', date: '2024-12-17' }
  ]);
  const [expandedSections, setExpandedSections] = useState({
    basics: true,
    metrics: true,
    filters: true,
    preview: false,
    visualization: true,
    export: false,
    advanced: false
  });
  const [showDerivedBuilder, setShowDerivedBuilder] = useState(false);
  const [queryComplexity] = useState<'low' | 'medium' | 'high'>('low');
  const [expandedMetrics, setExpandedMetrics] = useState<Set<string>>(new Set());
  const [savedFilterPresets] = useState(['Last 30 Days + Paid Only', 'This Quarter', 'High Value Customers']);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleMetric = (metricName: string) => {
    const existing = reportData.metrics.find(m => m.name === metricName);
    if (existing) {
      setReportData(prev => ({
        ...prev,
        metrics: prev.metrics.filter(m => m.name !== metricName)
      }));
    } else {
      setReportData(prev => ({
        ...prev,
        metrics: [...prev.metrics, { id: `${Date.now()}`, name: metricName, aggregation: 'sum' }]
      }));
    }
  };

  const toggleMetricExpanded = (metricId: string) => {
    setExpandedMetrics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(metricId)) {
        newSet.delete(metricId);
      } else {
        newSet.add(metricId);
      }
      return newSet;
    });
  };

  const activeFilterCount = filterGroups.reduce((acc, g) => acc + g.conditions.length, 0);

  const addFilterGroup = () => {
    setFilterGroups([...filterGroups, {
      id: `group-${Date.now()}`,
      logic: 'AND',
      conditions: [{ id: `cond-${Date.now()}`, field: '', operator: 'equals', value: '' }]
    }]);
  };

  const addConditionToGroup = (groupId: string) => {
    setFilterGroups(groups =>
      groups.map(g =>
        g.id === groupId
          ? { ...g, conditions: [...g.conditions, { id: `cond-${Date.now()}`, field: '', operator: 'equals', value: '' }] }
          : g
      )
    );
  };

  const removeFilterGroup = (groupId: string) => {
    setFilterGroups(groups => groups.filter(g => g.id !== groupId));
  };

  const removeCondition = (groupId: string, conditionId: string) => {
    setFilterGroups(groups =>
      groups.map(g =>
        g.id === groupId
          ? { ...g, conditions: g.conditions.filter(c => c.id !== conditionId) }
          : g
      )
    );
  };

  const updateCondition = (groupId: string, conditionId: string, field: 'field' | 'operator' | 'value', value: string) => {
    setFilterGroups(groups =>
      groups.map(g =>
        g.id === groupId
          ? {
              ...g,
              conditions: g.conditions.map(c =>
                c.id === conditionId ? { ...c, [field]: value } : c
              )
            }
          : g
      )
    );
  };

  const updateGroupLogic = (groupId: string, logic: 'AND' | 'OR') => {
    setFilterGroups(groups =>
      groups.map(g => (g.id === groupId ? { ...g, logic } : g))
    );
  };

  const runPreview = () => {
    setShowPreview(true);
    setExpandedSections(prev => ({ ...prev, preview: true }));
    toast.success('Preview generated successfully');
  };

  const isReportValid = reportData.name.length > 0 && reportData.metrics.length > 0;

  const getCompletionSteps = () => [
    { label: 'Report Name', done: reportData.name.length > 0 },
    { label: 'Data Source', done: reportData.dataSource.length > 0 },
    { label: 'Metrics Selected', done: reportData.metrics.length > 0 },
    { label: 'Dimensions Selected', done: reportData.dimensions.length > 0 },
    { label: 'Visualization Configured', done: reportData.visualization.length > 0 }
  ];

  const completionPercentage = Math.round(
    (getCompletionSteps().filter(s => s.done).length / getCompletionSteps().length) * 100
  );

  const isVisualizationCompatible = (vizType: string) => {
    if (vizType === 'pie' && reportData.metrics.length > 1) return false;
    if ((vizType === 'bar' || vizType === 'line') && reportData.dimensions.length === 0) return false;
    return true;
  };

  const removeDimension = (dimension: string) => {
    setReportData(prev => ({
      ...prev,
      dimensions: prev.dimensions.filter(d => d !== dimension)
    }));
  };

  return (
    <CreatePageLayout
      title="Create Custom Report"
      breadcrumb={<span className="text-slate-500">Reports & Analytics / Reports / Create Report</span>}
      helperText="Build enterprise-grade reports with advanced metrics, filters, and automated delivery."
      backAction={() => navigate('/reports/analytics')}
      primaryAction={{
        label: "Create Report",
        onClick: () => {
          toast.success('Report created successfully');
          console.log("Creating Report", reportData);
          navigate('/reports/analytics');
        },
        disabled: !isReportValid
      }}
      secondaryAction={{
        label: "Save Draft",
        onClick: () => toast.success('Draft saved')
      }}
      discardAction={{
        label: "Discard",
        onClick: () => navigate('/reports/analytics')
      }}
      sidebar={
        <>
          {/* Sidebar Card 1: Query Performance */}
          <SidebarCard title="Query Performance">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Query Cost</span>
                <Badge 
                  variant={queryComplexity === 'low' ? 'secondary' : queryComplexity === 'medium' ? 'outline' : 'destructive'}
                  className={
                    queryComplexity === 'low' 
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : queryComplexity === 'medium'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }
                >
                  {queryComplexity.toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Est. Execution</span>
                <span className="text-sm font-medium text-slate-900">~1.2s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Est. Rows</span>
                <span className="text-sm font-medium text-slate-900">~2,400</span>
              </div>
            </div>
          </SidebarCard>

          {/* Sidebar Card 2: Report Completeness */}
          <SidebarCard title="Report Completeness">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Progress</span>
                <span className="text-sm font-semibold text-slate-900">{completionPercentage}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 mb-3">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <div className="flex flex-col gap-2">
                {getCompletionSteps().map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    {step.done ? (
                      <CheckCircle2 size={14} className="text-emerald-500" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300" />
                    )}
                    <span className={`text-xs ${step.done ? 'text-slate-900' : 'text-slate-500'}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </SidebarCard>

          {/* Sidebar Card 3: Quick Actions */}
          <SidebarCard title="Quick Actions">
            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                <History size={14} />
                Version History
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                <Copy size={14} />
                Duplicate Report
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                <Download size={14} />
                Export Config
              </Button>
            </div>
          </SidebarCard>
        </>
      }
    >
      {/* Section 1: Report Basics */}
      <FormCard 
        title="Report Basics"
        collapsible
        defaultExpanded={expandedSections.basics}
        onToggle={() => toggleSection('basics')}
      >
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <Label htmlFor="rep-name">Report Name <span className="text-red-500">*</span></Label>
            <Input 
              id="rep-name" 
              placeholder="e.g. Q1 Registration Summary" 
              value={reportData.name}
              onChange={(e) => setReportData({...reportData, name: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Report Category <span className="text-red-500">*</span></Label>
              <Select 
                value={reportData.category}
                onValueChange={(val) => setReportData({...reportData, category: val})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="registrations">Registrations</SelectItem>
                  <SelectItem value="sales">Sales & Revenue</SelectItem>
                  <SelectItem value="attendance">Attendance</SelectItem>
                  <SelectItem value="communications">Communications</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Data Source <span className="text-red-500">*</span></Label>
              <Select 
                value={reportData.dataSource}
                onValueChange={(val) => setReportData({...reportData, dataSource: val})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="events">Events Module</SelectItem>
                  <SelectItem value="conferences">Conferences Module</SelectItem>
                  <SelectItem value="people">People Directory</SelectItem>
                  <SelectItem value="finance">Finance Records</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </FormCard>

      {/* Section 2: Metrics & Dimensions */}
      <FormCard 
        title="Metrics & Dimensions"
        collapsible
        defaultExpanded={expandedSections.metrics}
        onToggle={() => toggleSection('metrics')}
      >
        <div className="space-y-6">
          {/* Metrics Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Select Metrics</Label>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => setShowDerivedBuilder(!showDerivedBuilder)}
              >
                <Calculator size={14} />
                Add Derived Metric
              </Button>
            </div>

            {/* Selected Metrics with Advanced Controls */}
            <div className="space-y-2">
              {reportData.metrics.map((metric) => {
                const isExpanded = expandedMetrics.has(metric.id);
                return (
                  <div key={metric.id} className="border border-slate-200 rounded-lg bg-white">
                    {/* Metric Header */}
                    <div className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-2 flex-1">
                        <button
                          onClick={() => toggleMetricExpanded(metric.id)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                        <span className="font-medium text-sm text-slate-900">{metric.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {metric.aggregation.toUpperCase()}
                        </Badge>
                        {metric.alias && (
                          <Badge variant="secondary" className="text-xs">
                            as "{metric.alias}"
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReportData(prev => ({
                          ...prev,
                          metrics: prev.metrics.filter(m => m.id !== metric.id)
                        }))}
                      >
                        <X size={14} />
                      </Button>
                    </div>

                    {/* Expanded Metric Controls */}
                    {isExpanded && (
                      <div className="border-t border-slate-200 p-3 bg-slate-50 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          {/* Aggregation */}
                          <div className="space-y-1">
                            <Label className="text-xs text-slate-600">Aggregation</Label>
                            <Select
                              value={metric.aggregation}
                              onValueChange={(val: any) => {
                                setReportData(prev => ({
                                  ...prev,
                                  metrics: prev.metrics.map(m =>
                                    m.id === metric.id ? { ...m, aggregation: val } : m
                                  )
                                }));
                              }}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="count">Count</SelectItem>
                                <SelectItem value="sum">Sum</SelectItem>
                                <SelectItem value="avg">Average</SelectItem>
                                <SelectItem value="min">Minimum</SelectItem>
                                <SelectItem value="max">Maximum</SelectItem>
                                <SelectItem value="unique">Unique Count</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Alias */}
                          <div className="space-y-1">
                            <Label className="text-xs text-slate-600">Display Name (Alias)</Label>
                            <Input
                              placeholder="Optional"
                              className="h-8 text-xs"
                              value={metric.alias || ''}
                              onChange={(e) => {
                                setReportData(prev => ({
                                  ...prev,
                                  metrics: prev.metrics.map(m =>
                                    m.id === metric.id ? { ...m, alias: e.target.value } : m
                                  )
                                }));
                              }}
                            />
                          </div>
                        </div>

                        {/* Metric-Level Filter */}
                        <div className="space-y-1">
                          <Label className="text-xs text-slate-600">Metric Filter (Optional)</Label>
                          <div className="flex gap-2">
                            <Select defaultValue="greater-than">
                              <SelectTrigger className="h-8 text-xs w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="greater-than">Greater than</SelectItem>
                                <SelectItem value="less-than">Less than</SelectItem>
                                <SelectItem value="equals">Equals</SelectItem>
                                <SelectItem value="not-equals">Not equals</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input placeholder="Value" className="h-8 text-xs" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Available Metrics */}
            <div className="space-y-2">
              <Label className="text-xs text-slate-500">Available Metrics</Label>
              <div className="grid grid-cols-2 gap-2">
                {['Total Registrations', 'Revenue', 'Refunds', 'Check-ins', 'No-shows', 'Conversion Rate'].map(m => (
                  <div key={m} className="flex items-center gap-2">
                    <Checkbox 
                      id={`metric-${m}`} 
                      checked={reportData.metrics.some(metric => metric.name === m)}
                      onCheckedChange={() => toggleMetric(m)}
                    />
                    <Label htmlFor={`metric-${m}`} className="text-sm font-normal cursor-pointer">{m}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Derived Metrics Builder */}
            {showDerivedBuilder && (
              <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-blue-900">Create Derived Metric</Label>
                  <Button variant="ghost" size="sm" onClick={() => setShowDerivedBuilder(false)}>
                    <X size={14} />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Input placeholder="Display Name (e.g. Net Revenue)" className="text-sm" />
                  <div className="flex gap-2 items-center">
                    <Select>
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Select Metric A" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="revenue">Revenue</SelectItem>
                        <SelectItem value="refunds">Refunds</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select defaultValue="subtract">
                      <SelectTrigger className="w-[120px] text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="add">+</SelectItem>
                        <SelectItem value="subtract">−</SelectItem>
                        <SelectItem value="multiply">×</SelectItem>
                        <SelectItem value="divide">÷</SelectItem>
                        <SelectItem value="percent">% change</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Select Metric B" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="revenue">Revenue</SelectItem>
                        <SelectItem value="refunds">Refunds</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button size="sm" className="w-full">
                    <Plus size={14} className="mr-2" />
                    Add Derived Metric
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Dimensions Section */}
          <div className="space-y-4">
            <Label>Dimensions (Group By)</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Add Dimension" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="event">Event Name</SelectItem>
                <SelectItem value="ticket">Ticket Type</SelectItem>
                <SelectItem value="city">City</SelectItem>
                <SelectItem value="country">Country</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2">
              {reportData.dimensions.map((dimension) => (
                <Badge key={dimension} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 pr-1">
                  {dimension}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-4 w-4 ml-1 hover:text-red-600"
                    onClick={() => removeDimension(dimension)}
                  >
                    <X size={12} />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Sort & Limit Controls */}
          <div className="space-y-4">
            <Label>Sort & Limit</Label>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-slate-600">Sort By</Label>
                <Select
                  value={reportData.sortBy}
                  onValueChange={(val) => setReportData({...reportData, sortBy: val})}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select metric" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="registrations">Total Registrations</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-600">Order</Label>
                <Select
                  value={reportData.sortOrder}
                  onValueChange={(val: 'asc' | 'desc') => setReportData({...reportData, sortOrder: val})}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Descending</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-600">Limit (Top N)</Label>
                <Input
                  type="number"
                  className="h-9 text-sm"
                  value={reportData.limitResults}
                  onChange={(e) => setReportData({...reportData, limitResults: parseInt(e.target.value)})}
                />
              </div>
            </div>
          </div>
        </div>
      </FormCard>

      {/* Section 3: Filters */}
      <FormCard 
        title="Filters"
        collapsible
        defaultExpanded={expandedSections.filters}
        onToggle={() => toggleSection('filters')}
      >
        <div className="space-y-4">
          {/* Active Filters Summary */}
          {activeFilterCount > 0 && (
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  {activeFilterCount} Active {activeFilterCount === 1 ? 'Filter' : 'Filters'}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-blue-700 hover:text-blue-900"
                onClick={() => setFilterGroups([])}
              >
                Clear All
              </Button>
            </div>
          )}

          {/* Filter Groups */}
          {filterGroups.map((group, groupIndex) => (
            <div key={group.id} className="border border-slate-200 rounded-lg p-4 bg-white space-y-3">
              {/* Group Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Select
                    value={group.logic}
                    onValueChange={(val: 'AND' | 'OR') => updateGroupLogic(group.id, val)}
                  >
                    <SelectTrigger className="h-7 w-[80px] text-xs font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AND">AND</SelectItem>
                      <SelectItem value="OR">OR</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-xs text-slate-500">Group {groupIndex + 1}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFilterGroup(group.id)}
                >
                  <Trash2 size={14} className="text-red-600" />
                </Button>
              </div>

              {/* Conditions */}
              <div className="space-y-2 pl-4 border-l-2 border-slate-200">
                {group.conditions.map((condition, condIndex) => (
                  <div key={condition.id} className="flex items-center gap-2">
                    {condIndex > 0 && (
                      <span className="text-xs font-medium text-slate-500 w-10">{group.logic}</span>
                    )}
                    <Select
                      value={condition.field}
                      onValueChange={(val) => updateCondition(group.id, condition.id, 'field', val)}
                    >
                      <SelectTrigger className="h-8 text-xs flex-1">
                        <SelectValue placeholder="Field" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="status">Status</SelectItem>
                        <SelectItem value="amount">Amount</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={condition.operator}
                      onValueChange={(val) => updateCondition(group.id, condition.id, 'operator', val)}
                    >
                      <SelectTrigger className="h-8 text-xs w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equals">Equals</SelectItem>
                        <SelectItem value="not-equals">Not equals</SelectItem>
                        <SelectItem value="contains">Contains</SelectItem>
                        <SelectItem value="greater-than">Greater than</SelectItem>
                        <SelectItem value="less-than">Less than</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Value"
                      className="h-8 text-xs flex-1"
                      value={condition.value}
                      onChange={(e) => updateCondition(group.id, condition.id, 'value', e.target.value)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCondition(group.id, condition.id)}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => addConditionToGroup(group.id)}
                >
                  <Plus size={12} className="mr-1" />
                  Add Condition
                </Button>
              </div>
            </div>
          ))}

          {/* Add Filter Group */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={addFilterGroup}
              className="gap-2"
            >
              <Plus size={14} />
              Add Condition Group
            </Button>
            {savedFilterPresets.length > 0 && (
              <Select>
                <SelectTrigger className="h-9 w-[200px] text-sm">
                  <SelectValue placeholder="Load Preset" />
                </SelectTrigger>
                <SelectContent>
                  {savedFilterPresets.map((preset, idx) => (
                    <SelectItem key={idx} value={preset}>{preset}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button variant="outline" size="sm" className="gap-2">
              <Save size={14} />
              Save as Preset
            </Button>
          </div>
        </div>
      </FormCard>

      {/* Section 4: Data Preview */}
      <FormCard 
        title="Data Preview"
        collapsible
        defaultExpanded={expandedSections.preview}
        onToggle={() => toggleSection('preview')}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Preview the first 20 rows of your report to validate data and structure
            </p>
            <Button onClick={runPreview} className="gap-2">
              <Play size={14} />
              Run Preview
            </Button>
          </div>

          {showPreview && (
            <>
              {/* Warnings */}
              <div className="space-y-2">
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertTriangle size={16} className="text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">High Row Count</p>
                    <p className="text-xs text-amber-700">This query may return over 10,000 rows. Consider adding filters.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Info size={16} className="text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Visualization Note</p>
                    <p className="text-xs text-blue-700">Pie charts work best with fewer than 10 segments.</p>
                  </div>
                </div>
              </div>

              {/* Preview Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left px-4 py-2 font-medium text-slate-700">Event</th>
                        <th className="text-left px-4 py-2 font-medium text-slate-700">Registrations</th>
                        <th className="text-left px-4 py-2 font-medium text-slate-700">Revenue</th>
                        <th className="text-left px-4 py-2 font-medium text-slate-700">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {previewData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="px-4 py-2 text-slate-900">{row.event}</td>
                          <td className="px-4 py-2 text-slate-900">{row.registrations}</td>
                          <td className="px-4 py-2 text-slate-900">{row.revenue}</td>
                          <td className="px-4 py-2 text-slate-500">{row.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-600">
                  Showing 3 of ~2,400 rows
                </div>
              </div>
            </>
          )}
        </div>
      </FormCard>

      {/* Section 5: Visualization Output */}
      <FormCard 
        title="Visualization Output"
        collapsible
        defaultExpanded={expandedSections.visualization}
        onToggle={() => toggleSection('visualization')}
      >
        <div className="space-y-6">
          {/* Visualization Type Selection */}
          <div className="space-y-3">
            <Label>Chart Type</Label>
            <div className="flex items-center gap-3">
              <div 
                className={`flex flex-col items-center justify-center w-24 h-20 rounded-lg border cursor-pointer transition-all ${
                  reportData.visualization === 'table' 
                    ? 'border-blue-600 bg-blue-50 text-blue-700' 
                    : 'border-slate-200 hover:border-slate-300'
                } ${!isVisualizationCompatible('table') ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => isVisualizationCompatible('table') && setReportData({...reportData, visualization: 'table'})}
              >
                <TableIcon size={24} className="mb-2" />
                <span className="text-xs font-bold">Table</span>
              </div>
              <div 
                className={`flex flex-col items-center justify-center w-24 h-20 rounded-lg border cursor-pointer transition-all ${
                  reportData.visualization === 'bar' 
                    ? 'border-blue-600 bg-blue-50 text-blue-700' 
                    : 'border-slate-200 hover:border-slate-300'
                } ${!isVisualizationCompatible('bar') ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => isVisualizationCompatible('bar') && setReportData({...reportData, visualization: 'bar'})}
              >
                <BarChart size={24} className="mb-2" />
                <span className="text-xs font-bold">Bar</span>
              </div>
              <div 
                className={`flex flex-col items-center justify-center w-24 h-20 rounded-lg border cursor-pointer transition-all ${
                  reportData.visualization === 'line' 
                    ? 'border-blue-600 bg-blue-50 text-blue-700' 
                    : 'border-slate-200 hover:border-slate-300'
                } ${!isVisualizationCompatible('line') ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => isVisualizationCompatible('line') && setReportData({...reportData, visualization: 'line'})}
              >
                <LineChart size={24} className="mb-2" />
                <span className="text-xs font-bold">Line</span>
              </div>
              <div 
                className={`flex flex-col items-center justify-center w-24 h-20 rounded-lg border cursor-pointer transition-all ${
                  reportData.visualization === 'pie' 
                    ? 'border-blue-600 bg-blue-50 text-blue-700' 
                    : 'border-slate-200 hover:border-slate-300'
                } ${!isVisualizationCompatible('pie') ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => isVisualizationCompatible('pie') && setReportData({...reportData, visualization: 'pie'})}
              >
                <PieChart size={24} className="mb-2" />
                <span className="text-xs font-bold">Pie</span>
              </div>
            </div>
            {!isVisualizationCompatible('pie') && reportData.visualization === 'pie' && (
              <div className="flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                <AlertCircle size={14} className="mt-0.5" />
                Pie charts require exactly one metric. Please adjust your selection.
              </div>
            )}
          </div>

          {/* Chart Configuration - Only for non-table */}
          {reportData.visualization !== 'table' && (
            <div className="space-y-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <Label className="text-sm font-medium">Chart Configuration</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-600">X-Axis</Label>
                  <Select
                    value={reportData.xAxis}
                    onValueChange={(val) => setReportData({...reportData, xAxis: val})}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Select dimension" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="event">Event Name</SelectItem>
                      <SelectItem value="ticket">Ticket Type</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-600">Y-Axis</Label>
                  <Select
                    value={reportData.yAxis}
                    onValueChange={(val) => setReportData({...reportData, yAxis: val})}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Select metric" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="revenue">Revenue</SelectItem>
                      <SelectItem value="registrations">Registrations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-600">Color By</Label>
                  <Select
                    value={reportData.colorBy}
                    onValueChange={(val) => setReportData({...reportData, colorBy: val})}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Select dimension" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="ticket">Ticket Type</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Chart Toggles */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <Label className="text-sm font-normal">Stacked Mode</Label>
                <Switch
                  checked={reportData.stackedMode}
                  onCheckedChange={(c) => setReportData({...reportData, stackedMode: c})}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm font-normal">Show as Percentage</Label>
                <Switch
                  checked={reportData.percentageMode}
                  onCheckedChange={(c) => setReportData({...reportData, percentageMode: c})}
                />
              </div>
            </div>
          )}
        </div>
      </FormCard>

      {/* Section 6: Export & Delivery */}
      <FormCard 
        title="Export & Delivery"
        collapsible
        defaultExpanded={expandedSections.export}
        onToggle={() => toggleSection('export')}
      >
        <div className="space-y-6">
          {/* Export Configuration */}
          <div className="space-y-4">
            <Label>Export Configuration</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-slate-600">File Format</Label>
                <Select
                  value={reportData.exportFormat}
                  onValueChange={(val) => setReportData({...reportData, exportFormat: val})}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                    <SelectItem value="csv">CSV (.csv)</SelectItem>
                    <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                    <SelectItem value="json">JSON (.json)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-600">File Name Template</Label>
                <Input
                  placeholder="e.g. Report_{date}"
                  className="h-9 text-sm"
                  value={reportData.fileNameTemplate}
                  onChange={(e) => setReportData({...reportData, fileNameTemplate: e.target.value})}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-normal">Include Timestamp</Label>
              <Switch
                checked={reportData.includeTimestamp}
                onCheckedChange={(c) => setReportData({...reportData, includeTimestamp: c})}
              />
            </div>
          </div>

          <Separator />

          {/* Scheduling */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Automated Scheduling</Label>
              <Switch 
                checked={reportData.isScheduled}
                onCheckedChange={(c) => setReportData({...reportData, isScheduled: c})}
              />
            </div>
            
            {reportData.isScheduled && (
              <div className="space-y-4 pl-4 border-l-2 border-blue-100">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-600">Frequency</Label>
                    <Select 
                      value={reportData.frequency}
                      onValueChange={(val) => setReportData({...reportData, frequency: val})}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-600">Timezone</Label>
                    <Select
                      value={reportData.timezone}
                      onValueChange={(val) => setReportData({...reportData, timezone: val})}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="Europe/London">London</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-slate-600">Recipients</Label>
                  <div className="space-y-2">
                    <Select>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Add role or user" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin Role</SelectItem>
                        <SelectItem value="manager">Manager Role</SelectItem>
                        <SelectItem value="user1">user@example.com</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-green-50 text-green-700 pr-1">
                        Admin Role
                        <Button variant="ghost" size="icon" className="h-4 w-4 ml-1">
                          <X size={10} />
                        </Button>
                      </Badge>
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 pr-1">
                        user@example.com
                        <Button variant="ghost" size="icon" className="h-4 w-4 ml-1">
                          <X size={10} />
                        </Button>
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-normal">Notify on Failure</Label>
                    <p className="text-xs text-slate-500">Send email if report generation fails</p>
                  </div>
                  <Switch
                    checked={reportData.notifyOnFailure}
                    onCheckedChange={(c) => setReportData({...reportData, notifyOnFailure: c})}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </FormCard>

      {/* Section 7: Advanced Features */}
      <FormCard 
        title="Advanced Features"
        collapsible
        defaultExpanded={expandedSections.advanced}
        onToggle={() => toggleSection('advanced')}
      >
        <div className="space-y-6">
          {/* Period Comparison */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Period Comparison</Label>
                <p className="text-xs text-slate-500 mt-1">Compare metrics to previous period</p>
              </div>
              <Switch />
            </div>
            <div className="pl-4 border-l-2 border-slate-200 space-y-3">
              <Select defaultValue="previous-period">
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="previous-period">Previous Period</SelectItem>
                  <SelectItem value="previous-year">Same Period Last Year</SelectItem>
                  <SelectItem value="custom">Custom Date Range</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Checkbox id="show-trend" defaultChecked />
                <Label htmlFor="show-trend" className="text-sm font-normal">Show trend indicators (% change, arrows)</Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Alerts & Thresholds */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Alerts & Thresholds</Label>
                <p className="text-xs text-slate-500 mt-1">Get notified when metrics hit specific values</p>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Plus size={14} />
                Add Alert
              </Button>
            </div>
            <div className="border border-slate-200 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell size={14} className="text-orange-600" />
                  <span className="text-sm font-medium">Revenue drops below $10,000</span>
                </div>
                <Button variant="ghost" size="sm">
                  <X size={14} />
                </Button>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Badge variant="outline" className="text-xs">Email</Badge>
                <span>→ admin@example.com</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Data Refresh */}
          <div className="space-y-3">
            <Label>Data Refresh Settings</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-slate-600">Refresh Mode</Label>
                <Select defaultValue="realtime">
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Real-time (Live)</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="manual">Manual Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-600">Cache Duration</Label>
                <Select defaultValue="5min">
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Cache</SelectItem>
                    <SelectItem value="5min">5 minutes</SelectItem>
                    <SelectItem value="15min">15 minutes</SelectItem>
                    <SelectItem value="1h">1 hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </FormCard>
    </CreatePageLayout>
  );
}