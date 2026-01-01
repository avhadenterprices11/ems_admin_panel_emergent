import React from 'react';
import { DatePickerWithRange } from '../components/ui/date-range-picker';
import { RefreshCw, DollarSign, ShoppingBag, FileText, XCircle, RotateCcw } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { MetricsGrid, type MetricData } from '../components/ui';

// Mock SVG paths for metric card graphs (placeholder data)
const svgPaths = {
  pfd1ed20: "M1 14C8.5 14 12 7.5 15.5 7.5C19 7.5 22.5 11 26 11C29.5 11 33 7.5 36.5 7.5C40 7.5 43.5 4 47 4C50.5 4 54 7.5 57.5 7.5C61 7.5 64.5 1 71 1",
  p7801000: "M1 21C8.5 21 12 14.5 15.5 14.5C19 14.5 22.5 18 26 18C29.5 18 33 8.5 36.5 8.5C40 8.5 43.5 4 47 4C50.5 4 54 10.5 57.5 10.5C61 10.5 64.5 1 72 1",
  pabdb280: "M1 1C8.5 1 12 7.5 15.5 7.5C19 7.5 22.5 4 26 4C29.5 4 33 7.5 36.5 7.5C40 7.5 43.5 11 47 11C50.5 11 54 7.5 57.5 7.5C61 7.5 64.5 14 71 14",
  p10d38a00: "M1 22C8.5 22 12 15.5 15.5 15.5C19 15.5 22.5 19 26 19C29.5 19 33 15.5 36.5 15.5C40 15.5 43.5 8 47 8C50.5 8 54 4 57.5 4C61 4 64.5 1 72 1",
  p24d834c0: "M1 1C8.5 1 12 7.5 15.5 7.5C19 7.5 22.5 4 26 4C29.5 4 33 10.5 36.5 10.5C40 10.5 43.5 14 47 14C50.5 14 54 17.5 57.5 17.5C61 17.5 64.5 20 72 20"
};

// Store Optimisation images
const imgOptimize = "https://images.unsplash.com/photo-1740733448722-82e16d3468bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXJlaG91c2UlMjBpbnZlbnRvcnklMjBzdG9ja3xlbnwxfHx8fDE3NjY4NDEzNDJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
const imgShipping = "https://images.unsplash.com/photo-1698012185061-1a6a686cbefe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaGlwcGluZyUyMHRydWNrJTIwZGVsaXZlcnl8ZW58MXx8fHwxNzY2ODE5ODcyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
const imgDemand = "https://images.unsplash.com/photo-1616141215340-34b0e7c661c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwcGl6emElMjBmb29kfGVufDF8fHx8MTc2Njg0MTM0M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
const imgFeedback = "https://images.unsplash.com/photo-1446501356021-84cf6b450d07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXN0b21lciUyMGZlZWRiYWNrJTIwcmV2aWV3fGVufDF8fHx8MTc2Njg0MTM0M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

// MetricCard Component
const MetricCard = ({
  title,
  value,
  trend,
  trendColor,
  graphPath,
  graphColor,
  graphViewBox,
}: any) => {
  return (
    <div className="bg-white rounded-[14px] p-5 shadow-sm border border-slate-100 relative overflow-hidden h-[154px] flex flex-col justify-between">
      {/* Top Section: Title + Value */}
      <div className="space-y-2 relative z-10">
        <h3 className="text-xs font-bold text-[#62748e] uppercase tracking-wider">
          {title}
        </h3>
        <p className="text-2xl font-bold text-[#0f172b]">
          {value}
        </p>
      </div>

      {/* Bottom Section: Trend + Graph */}
      <div className="flex items-end justify-between relative z-10">
        {/* Trend Indicator */}
        <div className="flex items-center gap-1.5">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            {trendColor === "green" ? (
              <>
                <path
                  d="M4.66667 11.3333L11.3333 4.66667"
                  stroke="#00BC7D"
                  strokeWidth="1.33"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4.66667 4.66667H11.3333V11.3333"
                  stroke="#00BC7D"
                  strokeWidth="1.33"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            ) : (
              <>
                <path
                  d="M4.66667 4.66667L11.3333 11.3333"
                  stroke="#FF2056"
                  strokeWidth="1.33"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M11.3333 4.66667V11.3333H4.66667"
                  stroke="#FF2056"
                  strokeWidth="1.33"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            )}
          </svg>
          <span
            className={`text-xs font-bold ${trendColor === "green" ? "text-[#00bc7d]" : "text-[#ff2056]"}`}
          >
            {trend}
          </span>
        </div>

        {/* Mini Graph */}
        <div className="w-[80px] h-[40px] relative">
          <svg
            className="w-full h-full"
            viewBox={graphViewBox || "0 0 71 15"}
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d={graphPath}
              stroke={graphColor}
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

// AnnouncementItem Component
const AnnouncementItem = ({
  title,
  time,
  desc,
  color,
}: any) => {
  const getIcon = () => {
    const colors: any = {
      blue: {
        bg: "bg-blue-100",
        text: "text-blue-600",
        letter: "N",
      },
      yellow: {
        bg: "bg-yellow-100",
        text: "text-yellow-600",
        letter: "M",
      },
      emerald: {
        bg: "bg-emerald-100",
        text: "text-emerald-600",
        letter: "P",
      },
      purple: {
        bg: "bg-purple-100",
        text: "text-purple-600",
        letter: "U",
      },
    };
    const c = colors[color] || colors.blue;
    return (
      <div
        className={`${c.bg} w-10 h-10 rounded-full flex items-center justify-center shrink-0`}
      >
        <span className={`${c.text} font-bold text-sm`}>
          {c.letter}
        </span>
      </div>
    );
  };

  return (
    <div className="flex items-start gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group">
      {getIcon()}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-[#1d293d] truncate">
            {title}
          </h4>
          <span className="text-[10px] text-[#90a1b9] whitespace-nowrap">
            {time}
          </span>
        </div>
        <p className="text-xs text-[#62748e] mt-0.5 truncate">
          {desc}
        </p>
      </div>
      <button className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-300 group-hover:text-slate-500">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <circle cx="8" cy="8" r="1" fill="currentColor" />
          <circle cx="12" cy="8" r="1" fill="currentColor" />
          <circle cx="4" cy="8" r="1" fill="currentColor" />
        </svg>
      </button>
    </div>
  );
};

// InsightItem Component
const InsightItem = ({ img, title, time, desc }: any) => {
  return (
    <div className="flex items-start gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group">
      {/* Image Thumbnail */}
      <div className="w-10 h-10 rounded-[10px] bg-slate-100 shrink-0 overflow-hidden">
        <img
          src={img}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-[#1d293d] truncate">
            {title}
          </h4>
          <span className="text-[10px] text-[#90a1b9] whitespace-nowrap">
            {time}
          </span>
        </div>
        <p className="text-xs text-[#62748e] mt-0.5 truncate">
          {desc}
        </p>
      </div>

      {/* More Button */}
      <button className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-300 group-hover:text-slate-500">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <circle cx="8" cy="8" r="1" fill="currentColor" />
          <circle cx="12" cy="8" r="1" fill="currentColor" />
          <circle cx="4" cy="8" r="1" fill="currentColor" />
        </svg>
      </button>
    </div>
  );
};

// Main DashboardPage Component
export const DashboardPage = () => {
  const handleRefresh = () => {
    toast.success("Data refreshed successfully!");
  };

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* 1. TOP BAR - Date Picker with Refresh */}
      <DatePickerWithRange onRefresh={handleRefresh} />

      {/* 2. METRICS GRID (5 KPI Cards) */}
      <MetricsGrid
        metrics={[
          {
            title: "Total Revenue",
            value: "$10,243",
            icon: DollarSign,
            bgClass: "bg-[#7151ff]",
            colorClass: "text-white",
          },
          {
            title: "Total Orders",
            value: "23,456",
            icon: ShoppingBag,
            bgClass: "bg-[#00af35]",
            colorClass: "text-white",
          },
          {
            title: "New Applications",
            value: "123",
            icon: FileText,
            bgClass: "bg-[#089cff]",
            colorClass: "text-white",
          },
          {
            title: "Cancellation",
            value: "45",
            icon: XCircle,
            bgClass: "bg-[#fab446]",
            colorClass: "text-white",
          },
          {
            title: "Refund",
            value: "$1,204",
            icon: RotateCcw,
            bgClass: "bg-[#da41c5]",
            colorClass: "text-white",
          },
        ]}
      />

      {/* 3. MAIN CONTENT CARD (Announcements & Store Optimisation) */}
      <div className="bg-white rounded-[20px] p-6 shadow-sm border border-slate-100 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Announcements */}
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-bold text-[#1d293d]">
              Announcements
            </h3>
            <button className="text-sm font-bold text-[#4f39f6] hover:text-[#3d2cdb]">
              See All
            </button>
          </div>

          {/* Items List */}
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

        {/* Right: Store Optimisation */}
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-bold text-[#1d293d]">
              Store Optimisation
            </h3>
            <button className="text-sm font-bold text-[#4f39f6] hover:text-[#3d2cdb]">
              See All
            </button>
          </div>

          {/* Items List */}
          <div className="space-y-1">
            <InsightItem
              img={imgOptimize}
              title="Optimize Inventory"
              time="2 hours ago"
              desc="Low stock warning for 5 items."
            />
            <InsightItem
              img={imgShipping}
              title="Shipping Delay"
              time="5 hours ago"
              desc="Weather affecting routes in East Zone."
            />
            <InsightItem
              img={imgDemand}
              title="High Demand"
              time="1 day ago"
              desc="Pizza category is trending up 15%."
            />
            <InsightItem
              img={imgFeedback}
              title="Customer Feedback"
              time="2 days ago"
              desc="New positive reviews for 'Burger King'."
            />
          </div>
        </div>
      </div>

      {/* 4. NEW CUSTOMERS BANNER */}
      <div className="bg-white rounded-[14px] p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left Side: Stats */}
        <div className="flex flex-col gap-2">
          {/* Title + Trend Badge */}
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-[#1d293d]">
              New Customers This Month
            </h3>
            <div className="bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1">
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
              >
                <path
                  d="M3.5 3.5H8.5V8.5"
                  stroke="#00BC7D"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3.5 8.5L8.5 3.5"
                  stroke="#00BC7D"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-xs font-bold text-[#00bc7d]">
                2.75%
              </span>
            </div>
          </div>

          {/* Count */}
          <p className="text-4xl font-bold text-[#0f172b]">7,893</p>
        </div>

        {/* Right Side: Avatars + CTA */}
        <div className="flex items-center gap-4">
          {/* Avatar Stack */}
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

          {/* CTA Button */}
          <button className="bg-[#0f172b] hover:bg-[#1d293d] text-white px-6 py-2 rounded-full font-medium text-sm transition-colors">
            Join Today
          </button>
        </div>
      </div>
    </div>
  );
};