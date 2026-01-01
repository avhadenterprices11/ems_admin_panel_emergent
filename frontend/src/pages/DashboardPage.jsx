import React from 'react';
import { DollarSign, ShoppingBag, FileText, XCircle, RotateCcw } from 'lucide-react';

const MetricCard = ({ title, value, icon: Icon, bgClass, colorClass }) => {
  return (
    <div className={`${bgClass} ${colorClass} rounded-2xl p-6 shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90 mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className="p-3 bg-white/20 rounded-xl">
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

const AnnouncementItem = ({ title, time, desc, color }) => {
  const getIcon = () => {
    const colors = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-600', letter: 'N' },
      yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600', letter: 'M' },
      emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', letter: 'P' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600', letter: 'U' },
    };
    const c = colors[color] || colors.blue;
    return (
      <div className={`${c.bg} w-10 h-10 rounded-full flex items-center justify-center shrink-0`}>
        <span className={`${c.text} font-bold text-sm`}>{c.letter}</span>
      </div>
    );
  };

  return (
    <div className="flex items-start gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group">
      {getIcon()}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-[#1d293d] truncate">{title}</h4>
          <span className="text-[10px] text-[#90a1b9] whitespace-nowrap">{time}</span>
        </div>
        <p className="text-xs text-[#62748e] mt-0.5 truncate">{desc}</p>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome to your Event Management Admin</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <MetricCard
          title="Total Revenue"
          value="$10,243"
          icon={DollarSign}
          bgClass="bg-[#7151ff]"
          colorClass="text-white"
        />
        <MetricCard
          title="Total Orders"
          value="23,456"
          icon={ShoppingBag}
          bgClass="bg-[#00af35]"
          colorClass="text-white"
        />
        <MetricCard
          title="New Applications"
          value="123"
          icon={FileText}
          bgClass="bg-[#089cff]"
          colorClass="text-white"
        />
        <MetricCard
          title="Cancellation"
          value="45"
          icon={XCircle}
          bgClass="bg-[#fab446]"
          colorClass="text-white"
        />
        <MetricCard
          title="Refund"
          value="$1,204"
          icon={RotateCcw}
          bgClass="bg-[#da41c5]"
          colorClass="text-white"
        />
      </div>

      <div className="bg-white rounded-[20px] p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-[#1d293d]">Announcements</h3>
          <button className="text-sm font-bold text-[#4f39f6] hover:text-[#3d2cdb]">See All</button>
        </div>

        <div className="space-y-1">
          <AnnouncementItem
            color="blue"
            title="New Feature Release"
            time="1 hour ago"
            desc="We've updated the dashboard with new metrics."
          />
          <AnnouncementItem
            color="yellow"
            title="Maintenance Scheduled"
            time="4 hours ago"
            desc="System maintenance at midnight."
          />
          <AnnouncementItem
            color="emerald"
            title="New Partner"
            time="1 day ago"
            desc="Welcome 'Healthy Eats' to the platform."
          />
          <AnnouncementItem
            color="purple"
            title="Policy Update"
            time="2 days ago"
            desc="Updated privacy policy for 2024."
          />
        </div>
      </div>

      <div className="bg-white rounded-[14px] p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-[#1d293d]">New Customers This Month</h3>
            <div className="bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1">
              <span className="text-xs font-bold text-[#00bc7d]">2.75%</span>
            </div>
          </div>
          <p className="text-4xl font-bold text-[#0f172b]">7,893</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex -space-x-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden"
              >
                <div className="w-full h-full bg-slate-100" />
              </div>
            ))}
            <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
              +42
            </div>
          </div>

          <button className="bg-[#0f172b] hover:bg-[#1d293d] text-white px-6 py-2 rounded-full font-medium text-sm transition-colors">
            Join Today
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
