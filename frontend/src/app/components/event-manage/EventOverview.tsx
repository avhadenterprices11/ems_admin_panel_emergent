import React from 'react';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Activity, 
  AlertTriangle, 
  CheckCircle2,
  MousePointerClick
} from 'lucide-react';
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";

// KPI Card Component
const KPICard = ({ title, value, change, icon, trend }: any) => (
  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
    <div className="flex justify-between items-start mb-2">
      <div className="text-slate-500 text-sm font-medium">{title}</div>
      <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
    </div>
    <div className="text-2xl font-bold text-[#1d293d] mb-1">{value}</div>
    <div className={`text-xs flex items-center gap-1 ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
      <TrendingUp size={12} className={trend === 'down' ? 'rotate-180' : ''} />
      {change}
    </div>
  </div>
);

// Select Period Component
const SelectPeriod = () => (
  <select className="text-sm border-slate-200 rounded-md py-1 px-2 bg-slate-50">
    <option>Last 7 Days</option>
    <option>Last 30 Days</option>
    <option>All Time</option>
  </select>
);

// Funnel Step Component
const FunnelStep = ({ label, value, percentage, color }: any) => (
  <div className="space-y-1">
    <div className="flex justify-between text-sm">
      <span className="text-slate-600 font-medium">{label}</span>
      <span className="text-slate-900 font-bold">
        {value} <span className="text-slate-400 font-normal">({percentage}%)</span>
      </span>
    </div>
    <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full`} style={{ width: `${percentage}%` }} />
    </div>
  </div>
);

// Inventory Item Component
const InventoryItem = ({ name, sold, total, status }: any) => (
  <div className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-slate-50/50">
    <div>
      <div className="font-medium text-[#1d293d]">{name}</div>
      <div className="text-xs text-slate-500">{sold} / {total} sold</div>
    </div>
    <Badge 
      variant={status === 'Sold Out' ? 'destructive' : 'secondary'} 
      className={status === 'Selling Fast' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100' : ''}
    >
      {status}
    </Badge>
  </div>
);

// Timeline Item Component
const TimelineItem = ({ date, title, desc, active, future }: any) => (
  <div className={`relative pb-2 ${future ? 'opacity-50' : ''}`}>
    <div className={`absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 border-white ${active ? 'bg-[#0f172b]' : 'bg-slate-300'}`} />
    <div className="text-xs font-bold text-slate-500 mb-0.5">{date}</div>
    <div className="font-medium text-[#1d293d]">{title}</div>
    <div className="text-sm text-slate-500">{desc}</div>
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

// Readiness Item Component
const ReadinessItem = ({ label, completed }: any) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-slate-600">{label}</span>
    {completed ? (
      <CheckCircle2 size={16} className="text-emerald-500" />
    ) : (
      <div className="h-4 w-4 rounded-full border border-slate-300" />
    )}
  </div>
);

// Log Item Component
const LogItem = ({ user, action, time }: any) => (
  <div className="flex items-start gap-3">
    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
      {user.charAt(0)}
    </div>
    <div className="flex-1">
      <div className="text-sm font-medium text-[#1d293d]">{action}</div>
      <div className="text-xs text-slate-500">{user} • {time}</div>
    </div>
  </div>
);

export function EventOverview() {
  return (
    <div className="space-y-6">
      {/* 1. Top KPIs - 4 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Total Registrations" 
          value="1,250" 
          change="+12% from last week" 
          icon={<Users className="text-blue-600" size={20} />}
          trend="up"
        />
        <KPICard 
          title="Gross Revenue" 
          value="$125,000" 
          change="+8% from last week" 
          icon={<DollarSign className="text-emerald-600" size={20} />}
          trend="up"
        />
        <KPICard 
          title="Page Views" 
          value="45.2k" 
          change="-2% from last week" 
          icon={<MousePointerClick className="text-purple-600" size={20} />}
          trend="down"
        />
        <KPICard 
          title="Conversion Rate" 
          value="2.8%" 
          change="+0.4% from last week" 
          icon={<TrendingUp className="text-amber-600" size={20} />}
          trend="up"
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
              <SelectPeriod />
            </div>
            <div className="space-y-6">
              <FunnelStep label="Page Views" value="45,200" percentage={100} color="bg-slate-200" />
              <FunnelStep label="Add to Cart" value="8,400" percentage={18.5} color="bg-blue-200" />
              <FunnelStep label="Checkout Started" value="3,200" percentage={7.0} color="bg-purple-200" />
              <FunnelStep label="Completed Registration" value="1,250" percentage={2.8} color="bg-emerald-500" />
            </div>
          </div>

          {/* Ticket Inventory Health */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-[#1d293d]">Ticket Inventory Health</h3>
              <Button variant="link" className="text-blue-600">View All Tickets</Button>
            </div>
            <div className="space-y-4">
              <InventoryItem name="Early Bird" sold={500} total={500} status="Sold Out" />
              <InventoryItem name="General Admission" sold={250} total={1000} status="Selling Fast" />
              <InventoryItem name="VIP Access" sold={100} total={100} status="Sold Out" />
            </div>
          </div>

          {/* Event Timeline */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-lg text-[#1d293d] mb-4">Event Timeline</h3>
            <div className="relative pl-4 border-l-2 border-slate-100 space-y-6">
              <TimelineItem 
                date="Oct 24" 
                title="Early Bird Sales Ended" 
                desc="500 tickets sold out in 48 hours"
                active
              />
              <TimelineItem 
                date="Nov 01" 
                title="Speaker Lineup Announced" 
                desc="12 speakers confirmed"
              />
              <TimelineItem 
                date="Dec 15" 
                title="Venue Deposit Due" 
                desc="Upcoming milestone"
                future
              />
            </div>
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
            <div className="space-y-3">
              <AlertItem type="warning" text="VIP Ticket inventory low (0 remaining)" />
              <AlertItem type="error" text="3 pending refund requests" />
              <AlertItem type="info" text="Review speaker bios before Nov 1" />
            </div>
          </div>

          {/* Check-in Readiness */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-lg text-[#1d293d] mb-4">Check-in Readiness</h3>
            <div className="space-y-4">
              <ReadinessItem label="Badges Designed" completed />
              <ReadinessItem label="Staff Accounts Created" completed />
              <ReadinessItem label="Scanners Configured" completed={false} />
              <ReadinessItem label="Wi-Fi Tested" completed={false} />
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-500">Overall Readiness</span>
                <span className="font-bold text-slate-900">50%</span>
              </div>
              <Progress value={50} className="h-2" />
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-lg text-[#1d293d] mb-4 flex items-center gap-2">
              <Activity size={20} /> Recent Internal Activity
            </h3>
            <div className="space-y-4">
              <LogItem user="Sarah W." action="Updated General Admission price" time="2h ago" />
              <LogItem user="System" action="New registration: John Doe" time="5m ago" />
              <LogItem user="Mike B." action="Exported attendee list" time="1d ago" />
            </div>
            <Button variant="ghost" className="w-full mt-2 text-slate-500">View Full Log</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
