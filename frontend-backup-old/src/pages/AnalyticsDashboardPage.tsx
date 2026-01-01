import React, { useState } from 'react';
import {
  ArrowLeft, Filter, RefreshCw, Share2, Download, Users, DollarSign,
  Calendar, Ticket, TrendingUp, TrendingDown, Clock, MapPin, Mail,
  FileSpreadsheet, FileText
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../components/ui/dropdown-menu';
import { toast } from 'sonner';

interface AnalyticsDashboardPageProps {
  reportType: 'event-performance' | 'registration-funnel' | 'revenue-summary' | 'attendance';
  onBack?: () => void;
}

const MetricCard = ({ label, value, change, trend, icon }: any) => (
  <div className="bg-white border border-slate-200 rounded-lg p-4">
    <div className="flex items-start justify-between mb-2">
      <span className="text-sm text-slate-600">{label}</span>
      {icon}
    </div>
    <div className="text-2xl font-bold text-slate-900 mb-1">{value}</div>
    <div className="flex items-center gap-1">
      {trend === 'up' ? (
        <TrendingUp size={14} className="text-emerald-600" />
      ) : (
        <TrendingDown size={14} className="text-red-600" />
      )}
      <span className={`text-xs font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
        {change}
      </span>
      <span className="text-xs text-slate-500">vs last period</span>
    </div>
  </div>
);

const RevenueBar = ({ label, amount, percentage, color }: any) => (
  <div>
    <div className="flex items-center justify-between mb-1">
      <span className="text-sm text-slate-700">{label}</span>
      <span className="text-sm font-semibold text-slate-900">{amount}</span>
    </div>
    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
      <div
        className={`${color} h-full rounded-full transition-all duration-500`}
        style={{ width: `${percentage}%` }}
      />
    </div>
    <div className="text-xs text-slate-500 mt-1">{percentage}% of total</div>
  </div>
);

const EventRankCard = ({ rank, name, registrations, revenue, trend }: any) => (
  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-sm font-bold text-slate-700">
      {rank}
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-sm font-medium text-slate-900 truncate">{name}</div>
      <div className="text-xs text-slate-500">{registrations} registrations</div>
    </div>
    <div className="text-right">
      <div className="text-sm font-semibold text-slate-900">{revenue}</div>
      {trend === 'up' ? (
        <TrendingUp size={14} className="text-emerald-600 ml-auto" />
      ) : (
        <TrendingDown size={14} className="text-red-600 ml-auto" />
      )}
    </div>
  </div>
);

const GeographicBar = ({ region, count, percentage }: any) => (
  <div>
    <div className="flex items-center justify-between mb-1">
      <div className="flex items-center gap-2">
        <MapPin size={14} className="text-slate-400" />
        <span className="text-sm text-slate-700">{region}</span>
      </div>
      <span className="text-sm font-semibold text-slate-900">{count}</span>
    </div>
    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
      <div
        className="bg-blue-500 h-full rounded-full transition-all duration-500"
        style={{ width: `${percentage}%` }}
      />
    </div>
  </div>
);

const ActivityItem = ({ action, event, time, amount }: any) => (
  <div className="flex items-center justify-between p-2 rounded hover:bg-slate-50 transition-colors">
    <div className="flex-1">
      <div className="text-sm text-slate-900">{action}</div>
      <div className="text-xs text-slate-500">{event} • {time}</div>
    </div>
    <div className="text-sm font-semibold text-emerald-600">{amount}</div>
  </div>
);

const FunnelStep = ({ label, value, percentage, nextPercentage }: any) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="text-right">
        <span className="text-sm font-bold text-slate-900">{value}</span>
        <span className="text-xs text-slate-500 ml-2">({percentage}%)</span>
      </div>
    </div>
    <div className="relative">
      <div className="w-full bg-slate-100 rounded h-8 overflow-hidden">
        <div
          className="bg-blue-500 h-full flex items-center justify-end pr-3 text-xs font-medium text-white transition-all duration-500"
          style={{ width: `${percentage}%` }}
        >
          {percentage >= 10 && `${percentage}%`}
        </div>
      </div>
      {nextPercentage && (
        <div className="text-xs text-slate-500 mt-1 text-right">
          {nextPercentage}% conversion to next step
        </div>
      )}
    </div>
  </div>
);

const EmailMetricCard = ({ label, value, subtext }: any) => (
  <div className="text-center p-4 bg-slate-50 rounded-lg">
    <div className="text-xs text-slate-600 mb-1">{label}</div>
    <div className="text-xl font-bold text-slate-900">{value}</div>
    {subtext && <div className="text-xs text-slate-500 mt-1">{subtext}</div>}
  </div>
);

export function AnalyticsDashboardPage({ reportType, onBack }: AnalyticsDashboardPageProps) {
  const [timeRange, setTimeRange] = useState('30d');

  const getReportTitle = () => {
    switch (reportType) {
      case 'event-performance':
        return 'Event Performance Analytics';
      case 'registration-funnel':
        return 'Registration Funnel Analytics';
      case 'revenue-summary':
        return 'Revenue Summary Analytics';
      case 'attendance':
        return 'Attendance Analytics';
      default:
        return 'Analytics Dashboard';
    }
  };

  const handleDownload = (chartName: string, format: string) => {
    toast.success(`Downloading ${chartName} as ${format.toUpperCase()}`);
    console.log(`Download ${chartName} as ${format}`);
  };

  const registrationTrendData = [65, 78, 82, 95, 88, 92, 105, 98, 110, 115, 108, 122, 118, 125];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col gap-4">
            {/* Back Button + Title */}
            <div className="flex items-center gap-3">
              {onBack && (
                <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
                  <ArrowLeft size={16} />
                  Back
                </Button>
              )}
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
                  {getReportTitle()}
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Real-time insights and performance metrics
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[160px] h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="12m">Last 12 months</SelectItem>
                    <SelectItem value="ytd">Year to date</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter size={14} />
                  Filters
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <RefreshCw size={14} />
                  Refresh
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Share2 size={14} />
                  Share
                </Button>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => handleDownload('report', 'pdf')}>
                  <Download size={14} />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Total Registrations"
            value="1,847"
            change="+12.5%"
            trend="up"
            icon={<Users size={20} className="text-blue-600" />}
          />
          <MetricCard
            label="Gross Revenue"
            value="$184,750"
            change="+8.3%"
            trend="up"
            icon={<DollarSign size={20} className="text-emerald-600" />}
          />
          <MetricCard
            label="Total Events"
            value="28"
            change="+4"
            trend="up"
            icon={<Calendar size={20} className="text-purple-600" />}
          />
          <MetricCard
            label="Avg Ticket Price"
            value="$100"
            change="-2.1%"
            trend="down"
            icon={<Ticket size={20} className="text-amber-600" />}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Registration Trend */}
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Registration Trend</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">Last 30 Days</Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <Download size={14} className="text-slate-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDownload('Registration Trend', 'csv')}>
                      <FileSpreadsheet size={14} className="mr-2" />
                      Download CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownload('Registration Trend', 'xlsx')}>
                      <FileSpreadsheet size={14} className="mr-2" />
                      Download Excel
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleDownload('Registration Trend', 'png')}>
                      <Download size={14} className="mr-2" />
                      Download PNG
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownload('Registration Trend', 'pdf')}>
                      <FileText size={14} className="mr-2" />
                      Download PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="h-[280px] flex items-end justify-between gap-2">
              {registrationTrendData.map((height, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer"
                    style={{ height: `${height}px` }}
                    title={`Day ${idx + 1}: ${height} registrations`}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-3">
              <span>Dec 1</span>
              <span>Dec 15</span>
              <span>Dec 30</span>
            </div>
          </div>

          {/* Revenue by Event Type */}
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Revenue by Event Type</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">This Quarter</Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <Download size={14} className="text-slate-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDownload('Revenue Breakdown', 'csv')}>
                      <FileSpreadsheet size={14} className="mr-2" />
                      Download CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownload('Revenue Breakdown', 'xlsx')}>
                      <FileSpreadsheet size={14} className="mr-2" />
                      Download Excel
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleDownload('Revenue Breakdown', 'png')}>
                      <Download size={14} className="mr-2" />
                      Download PNG
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownload('Revenue Breakdown', 'pdf')}>
                      <FileText size={14} className="mr-2" />
                      Download PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="space-y-4">
              <RevenueBar label="Conferences" amount="$85,400" percentage={46} color="bg-blue-500" />
              <RevenueBar label="Workshops" amount="$52,200" percentage={28} color="bg-purple-500" />
              <RevenueBar label="Networking Events" amount="$28,150" percentage={15} color="bg-emerald-500" />
              <RevenueBar label="Webinars" amount="$19,000" percentage={11} color="bg-amber-500" />
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-700">Total Revenue</span>
                <span className="text-lg font-bold text-slate-900">$184,750</span>
              </div>
            </div>
          </div>

          {/* Top Performing Events */}
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Top Performing Events</h3>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <Download size={14} className="text-slate-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDownload('Top Events', 'csv')}>
                      <FileSpreadsheet size={14} className="mr-2" />
                      Download CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownload('Top Events', 'xlsx')}>
                      <FileSpreadsheet size={14} className="mr-2" />
                      Download Excel
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleDownload('Top Events', 'png')}>
                      <Download size={14} className="mr-2" />
                      Download PNG
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownload('Top Events', 'pdf')}>
                      <FileText size={14} className="mr-2" />
                      Download PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="ghost" size="sm" className="text-blue-600 text-xs">
                  View All
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              <EventRankCard rank={1} name="Tech Innovation Summit 2024" registrations={425} revenue="$42,500" trend="up" />
              <EventRankCard rank={2} name="Digital Marketing Workshop" registrations={312} revenue="$31,200" trend="up" />
              <EventRankCard rank={3} name="Leadership Conference" registrations={289} revenue="$28,900" trend="down" />
              <EventRankCard rank={4} name="Product Launch Event" registrations={245} revenue="$24,500" trend="up" />
            </div>
          </div>

          {/* Geographic Distribution */}
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Geographic Distribution</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">By Registrations</Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <Download size={14} className="text-slate-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDownload('Geographic Distribution', 'csv')}>
                      <FileSpreadsheet size={14} className="mr-2" />
                      Download CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownload('Geographic Distribution', 'xlsx')}>
                      <FileSpreadsheet size={14} className="mr-2" />
                      Download Excel
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleDownload('Geographic Distribution', 'png')}>
                      <Download size={14} className="mr-2" />
                      Download PNG
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownload('Geographic Distribution', 'pdf')}>
                      <FileText size={14} className="mr-2" />
                      Download PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="space-y-3">
              <GeographicBar region="North America" count={847} percentage={46} />
              <GeographicBar region="Europe" count={542} percentage={29} />
              <GeographicBar region="Asia Pacific" count={325} percentage={18} />
              <GeographicBar region="Latin America" count={98} percentage={5} />
              <GeographicBar region="Other" count={35} percentage={2} />
            </div>
          </div>
        </div>

        {/* Detailed Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Recent Activity</h3>
              <Clock size={16} className="text-slate-400" />
            </div>
            <div className="space-y-3">
              <ActivityItem action="New registration" event="Tech Summit 2024" time="2 min ago" amount="$299" />
              <ActivityItem action="Ticket purchased" event="Marketing Workshop" time="8 min ago" amount="$149" />
              <ActivityItem action="New registration" event="Leadership Conf" time="15 min ago" amount="$399" />
              <ActivityItem action="Group registration" event="Product Launch" time="23 min ago" amount="$1,495" />
              <ActivityItem action="New registration" event="Tech Summit 2024" time="31 min ago" amount="$299" />
            </div>
          </div>

          {/* Conversion Funnel */}
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Conversion Funnel</h3>
              <Badge variant="outline" className="text-xs">Last 30 Days</Badge>
            </div>
            <div className="space-y-4">
              <FunnelStep label="Page Views" value="45,200" percentage={100} nextPercentage={18.5} />
              <FunnelStep label="Add to Cart" value="8,400" percentage={18.5} nextPercentage={38} />
              <FunnelStep label="Checkout Started" value="3,200" percentage={7.0} nextPercentage={39} />
              <FunnelStep label="Completed" value="1,250" percentage={2.8} />
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-700">Overall Conversion</span>
                <span className="text-lg font-bold text-emerald-600">2.8%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Email Performance - Conditional */}
        {reportType === 'registration-funnel' && (
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Mail size={20} className="text-slate-600" />
                <h3 className="font-semibold text-slate-900">Email Campaign Performance</h3>
              </div>
              <Button variant="ghost" size="sm" className="text-blue-600 text-xs">
                View Details
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <EmailMetricCard label="Sent" value="12,450" />
              <EmailMetricCard label="Opened" value="5,890" subtext="47.3%" />
              <EmailMetricCard label="Clicked" value="1,824" subtext="14.6%" />
              <EmailMetricCard label="Converted" value="489" subtext="3.9%" />
            </div>
          </div>
        )}

        {/* Last Updated */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 py-4">
          <RefreshCw size={12} />
          <span>Last updated: {new Date().toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
