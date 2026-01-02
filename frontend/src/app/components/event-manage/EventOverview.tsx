import React, { useState, useEffect } from 'react';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Activity, 
  AlertTriangle, 
  MousePointerClick,
  Loader2
} from 'lucide-react';
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { eventsAPI, OverviewMetrics, FunnelData, TicketInventory, AttentionAlert, ActivityLog } from '../../api/events.api';

interface EventOverviewProps {
  eventId: number;
}

// KPI Card Component
const KPICard = ({ title, value, change, icon, trend, loading }: any) => (
  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
    <div className="flex justify-between items-start mb-2">
      <div className="text-slate-500 text-sm font-medium">{title}</div>
      <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
    </div>
    {loading ? (
      <div className="flex items-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
      </div>
    ) : (
      <>
        <div className="text-2xl font-bold text-[#1d293d] mb-1">{value}</div>
        <div className={`text-xs flex items-center gap-1 ${trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-rose-600' : 'text-slate-500'}`}>
          {trend === 'up' ? <TrendingUp size={12} /> : trend === 'down' ? <TrendingDown size={12} /> : null}
          {change}
        </div>
      </>
    )}
  </div>
);

// Select Period Component
const SelectPeriod = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
  <select 
    className="text-sm border-slate-200 rounded-md py-1 px-2 bg-slate-50"
    value={value}
    onChange={(e) => onChange(e.target.value)}
  >
    <option value="7">Last 7 Days</option>
    <option value="30">Last 30 Days</option>
    <option value="all">All Time</option>
  </select>
);

// Funnel Step Component
const FunnelStep = ({ label, value, percentage, color }: any) => (
  <div className="space-y-1">
    <div className="flex justify-between text-sm">
      <span className="text-slate-600 font-medium">{label}</span>
      <span className="text-slate-900 font-bold">
        {value.toLocaleString()} <span className="text-slate-400 font-normal">({percentage.toFixed(1)}%)</span>
      </span>
    </div>
    <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }} />
    </div>
  </div>
);

// Inventory Item Component
const InventoryItem = ({ name, sold, total, status }: any) => (
  <div className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-slate-50/50">
    <div>
      <div className="font-medium text-[#1d293d]">{name}</div>
      <div className="text-xs text-slate-500">{sold} / {total || '∞'} sold</div>
    </div>
    <Badge 
      variant={status === 'Sold Out' ? 'destructive' : 'secondary'} 
      className={
        status === 'Selling Fast' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100' :
        status === 'Sold Out' ? '' :
        status === 'Draft' ? 'bg-slate-100 text-slate-600' :
        'bg-emerald-50 text-emerald-700 hover:bg-emerald-50'
      }
    >
      {status}
    </Badge>
  </div>
);

// Timeline Item Component
const TimelineItem = ({ date, title, desc, active }: any) => (
  <div className="relative pb-2">
    <div className={`absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 border-white ${active ? 'bg-[#0f172b]' : 'bg-slate-300'}`} />
    <div className="text-xs font-bold text-slate-500 mb-0.5">{date}</div>
    <div className="font-medium text-[#1d293d]">{title}</div>
    {desc && <div className="text-sm text-slate-500">{desc}</div>}
  </div>
);

// Alert Item Component
const AlertItem = ({ type, text }: any) => {
  const colors = {
    warning: "bg-amber-50 text-amber-700 border-amber-100",
    error: "bg-rose-50 text-rose-700 border-rose-100",
    info: "bg-blue-50 text-blue-700 border-blue-100"
  };
  return (
    <div className={`text-sm p-3 rounded-lg border ${colors[type as keyof typeof colors]}`}>
      {text}
    </div>
  );
};

// Log Item Component
const LogItem = ({ actorType, description, time }: any) => (
  <div className="flex items-start gap-3">
    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
      {actorType === 'system' ? 'S' : 'A'}
    </div>
    <div className="flex-1">
      <div className="text-sm font-medium text-[#1d293d]">{description}</div>
      <div className="text-xs text-slate-500">{actorType === 'system' ? 'System' : 'Admin'} • {time}</div>
    </div>
  </div>
);

// Empty State Component
const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-8 text-slate-400">
    <p className="text-sm">{message}</p>
  </div>
);

export function EventOverview({ eventId }: EventOverviewProps) {
  const [period, setPeriod] = useState('7');
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [funnel, setFunnel] = useState<FunnelData | null>(null);
  const [tickets, setTickets] = useState<TicketInventory[]>([]);
  const [alerts, setAlerts] = useState<AttentionAlert[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState({
    metrics: true,
    funnel: true,
    tickets: true,
    alerts: true,
    activity: true,
  });

  const getDateRange = () => {
    if (period === 'all') return {};
    const endDate = new Date().toISOString();
    const startDate = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000).toISOString();
    return { startDate, endDate };
  };

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(prev => ({ ...prev, metrics: true }));
        const data = await eventsAPI.getOverviewMetrics(eventId, getDateRange());
        setMetrics(data);
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setLoading(prev => ({ ...prev, metrics: false }));
      }
    };

    const fetchFunnel = async () => {
      try {
        setLoading(prev => ({ ...prev, funnel: true }));
        const data = await eventsAPI.getRegistrationFunnel(eventId, getDateRange());
        setFunnel(data);
      } catch (error) {
        console.error('Error fetching funnel:', error);
      } finally {
        setLoading(prev => ({ ...prev, funnel: false }));
      }
    };

    fetchMetrics();
    fetchFunnel();
  }, [eventId, period]);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(prev => ({ ...prev, tickets: true }));
        const data = await eventsAPI.getTicketInventory(eventId);
        setTickets(data);
      } catch (error) {
        console.error('Error fetching tickets:', error);
      } finally {
        setLoading(prev => ({ ...prev, tickets: false }));
      }
    };

    const fetchAlerts = async () => {
      try {
        setLoading(prev => ({ ...prev, alerts: true }));
        const data = await eventsAPI.getAttentionAlerts(eventId);
        setAlerts(data);
      } catch (error) {
        console.error('Error fetching alerts:', error);
      } finally {
        setLoading(prev => ({ ...prev, alerts: false }));
      }
    };

    const fetchActivity = async () => {
      try {
        setLoading(prev => ({ ...prev, activity: true }));
        const data = await eventsAPI.getActivityTimeline(eventId, 10);
        setActivity(data);
      } catch (error) {
        console.error('Error fetching activity:', error);
      } finally {
        setLoading(prev => ({ ...prev, activity: false }));
      }
    };

    fetchTickets();
    fetchAlerts();
    fetchActivity();
  }, [eventId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getChangeText = (change: number, suffix: string = 'from last period') => {
    if (change === 0) return 'No change';
    return `${change > 0 ? '+' : ''}${change}% ${suffix}`;
  };

  // Calculate funnel percentages
  const funnelBase = funnel?.pageViews || 1;
  const funnelData = [
    { label: 'Page Views', value: funnel?.pageViews || 0, percentage: 100, color: 'bg-slate-200' },
    { label: 'Add to Cart', value: funnel?.addToCart || 0, percentage: ((funnel?.addToCart || 0) / funnelBase) * 100, color: 'bg-blue-200' },
    { label: 'Checkout Started', value: funnel?.checkoutStarted || 0, percentage: ((funnel?.checkoutStarted || 0) / funnelBase) * 100, color: 'bg-purple-200' },
    { label: 'Completed Registration', value: funnel?.completedRegistration || 0, percentage: ((funnel?.completedRegistration || 0) / funnelBase) * 100, color: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Top KPIs - 4 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Total Registrations" 
          value={metrics?.totalRegistrations?.toLocaleString() || '0'} 
          change={getChangeText(metrics?.registrationsChange || 0)} 
          icon={<Users className="text-blue-600" size={20} />}
          trend={metrics?.registrationsChange && metrics.registrationsChange > 0 ? 'up' : metrics?.registrationsChange && metrics.registrationsChange < 0 ? 'down' : 'neutral'}
          loading={loading.metrics}
        />
        <KPICard 
          title="Gross Revenue" 
          value={formatCurrency(metrics?.grossRevenue || 0)} 
          change={getChangeText(metrics?.revenueChange || 0)} 
          icon={<DollarSign className="text-emerald-600" size={20} />}
          trend={metrics?.revenueChange && metrics.revenueChange > 0 ? 'up' : metrics?.revenueChange && metrics.revenueChange < 0 ? 'down' : 'neutral'}
          loading={loading.metrics}
        />
        <KPICard 
          title="Page Views" 
          value={formatNumber(metrics?.pageViews || 0)} 
          change={getChangeText(metrics?.pageViewsChange || 0)} 
          icon={<MousePointerClick className="text-purple-600" size={20} />}
          trend={metrics?.pageViewsChange && metrics.pageViewsChange > 0 ? 'up' : metrics?.pageViewsChange && metrics.pageViewsChange < 0 ? 'down' : 'neutral'}
          loading={loading.metrics}
        />
        <KPICard 
          title="Conversion Rate" 
          value={`${metrics?.conversionRate?.toFixed(2) || '0.00'}%`} 
          change={metrics?.conversionRateChange ? `${metrics.conversionRateChange > 0 ? '+' : ''}${metrics.conversionRateChange.toFixed(2)}% from last period` : 'No change'} 
          icon={<TrendingUp className="text-amber-600" size={20} />}
          trend={metrics?.conversionRateChange && metrics.conversionRateChange > 0 ? 'up' : metrics?.conversionRateChange && metrics.conversionRateChange < 0 ? 'down' : 'neutral'}
          loading={loading.metrics}
        />
      </div>

      {/* 2. Main Content Grid - 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Registration Funnel */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-[#1d293d]">Registration Funnel</h3>
              <SelectPeriod value={period} onChange={setPeriod} />
            </div>
            {loading.funnel ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
              </div>
            ) : (
              <div className="space-y-6">
                {funnelData.map((step, index) => (
                  <FunnelStep 
                    key={index}
                    label={step.label} 
                    value={step.value} 
                    percentage={step.percentage} 
                    color={step.color} 
                  />
                ))}
              </div>
            )}
          </div>

          {/* Ticket Inventory Health */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-[#1d293d]">Ticket Inventory Health</h3>
              <Button variant="link" className="text-blue-600">View All Tickets</Button>
            </div>
            {loading.tickets ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
              </div>
            ) : tickets.length === 0 ? (
              <EmptyState message="No tickets created yet" />
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <InventoryItem 
                    key={ticket.id}
                    name={ticket.name} 
                    sold={ticket.sold} 
                    total={ticket.total} 
                    status={ticket.status} 
                  />
                ))}
              </div>
            )}
          </div>

          {/* Event Timeline */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-lg text-[#1d293d] mb-4">Event Timeline</h3>
            {loading.activity ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
              </div>
            ) : activity.length === 0 ? (
              <EmptyState message="No activity recorded yet" />
            ) : (
              <div className="relative pl-4 border-l-2 border-slate-100 space-y-6">
                {activity.slice(0, 5).map((log, index) => (
                  <TimelineItem 
                    key={log.id}
                    date={new Date(log.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    title={log.actionType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    desc={log.description}
                    active={index === 0}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar (1/3 width) */}
        <div className="space-y-6">
          {/* Alerts & Warnings */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-lg text-[#1d293d] mb-4 flex items-center gap-2">
              <AlertTriangle className="text-amber-500" size={20} />
              Attention Needed
            </h3>
            {loading.alerts ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
              </div>
            ) : alerts.length === 0 ? (
              <div className="text-sm text-emerald-600 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                All good! No issues require attention.
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert, index) => (
                  <AlertItem key={index} type={alert.type} text={alert.text} />
                ))}
              </div>
            )}
          </div>

          {/* Activity Log */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-lg text-[#1d293d] mb-4 flex items-center gap-2">
              <Activity size={20} /> Recent Internal Activity
            </h3>
            {loading.activity ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
              </div>
            ) : activity.length === 0 ? (
              <EmptyState message="No recent activity" />
            ) : (
              <div className="space-y-4">
                {activity.slice(0, 5).map((log) => (
                  <LogItem 
                    key={log.id}
                    actorType={log.actorType} 
                    description={log.description} 
                    time={formatTimeAgo(log.createdAt)} 
                  />
                ))}
              </div>
            )}
            <Button variant="ghost" className="w-full mt-2 text-slate-500">View Full Log</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
