import React from 'react';
import { MetricsGrid, type MetricData } from '../components/ui';
import { 
  ShoppingBag, 
  Clock, 
  Package, 
  RotateCcw, 
  Wallet,
  Users,
  UserPlus,
  Activity,
  Eye,
  TrendingDown,
  Target,
  AlertTriangle,
  XCircle
} from 'lucide-react';

/**
 * METRICS EXAMPLE PAGE
 * 
 * This page demonstrates how to use the MetricsGrid component.
 * The MetricsGrid automatically handles:
 * - Desktop: 5-column grid layout
 * - Mobile: Swipeable carousel with dots
 * 
 * Simply define your metrics array and pass it to MetricsGrid!
 */

export const MetricsExample = () => {
  // Example 1: Order Management Metrics
  const orderMetrics: MetricData[] = [
    { 
      title: "Total Orders", 
      value: "7,893", 
      icon: ShoppingBag, 
      bgClass: "bg-[#7151ff]", 
      colorClass: "text-white",
      tooltipText: "Total number of orders across all channels"
    },
    { 
      title: "Pending Orders", 
      value: "123", 
      icon: Clock, 
      bgClass: "bg-[#da41c5]", 
      colorClass: "text-white",
      tooltipText: "Orders awaiting processing"
    },
    { 
      title: "Items Ordered", 
      value: "456", 
      icon: Package, 
      bgClass: "bg-[#00af35]", 
      colorClass: "text-white",
      tooltipText: "Total items in completed orders"
    },
    { 
      title: "Returns", 
      value: "98", 
      icon: RotateCcw, 
      bgClass: "bg-[#fab446]", 
      colorClass: "text-white",
      tooltipText: "Items returned by customers"
    },
    { 
      title: "Total Revenue", 
      value: "₹931K", 
      icon: Wallet, 
      bgClass: "bg-[#089cff]", 
      colorClass: "text-white",
      tooltipText: "Total revenue from all orders"
    },
  ];

  // Example 2: Customer Management Metrics
  const customerMetrics: MetricData[] = [
    { 
      title: "Total Customers", 
      value: "5,289", 
      icon: Users, 
      bgClass: "bg-[#7151ff]", 
      colorClass: "text-white" 
    },
    { 
      title: "New This Month", 
      value: "234", 
      icon: UserPlus, 
      bgClass: "bg-[#00af35]", 
      colorClass: "text-white" 
    },
    { 
      title: "Active Users", 
      value: "3,456", 
      icon: Activity, 
      bgClass: "bg-[#089cff]", 
      colorClass: "text-white" 
    },
    { 
      title: "Page Views", 
      value: "45.2K", 
      icon: Eye, 
      bgClass: "bg-[#da41c5]", 
      colorClass: "text-white" 
    },
    { 
      title: "Bounce Rate", 
      value: "42%", 
      icon: TrendingDown, 
      bgClass: "bg-[#fab446]", 
      colorClass: "text-white" 
    },
  ];

  // Example 3: Inventory Metrics
  const inventoryMetrics: MetricData[] = [
    { 
      title: "Total Products", 
      value: "2,450", 
      icon: Package, 
      bgClass: "bg-[#7151ff]", 
      colorClass: "text-white" 
    },
    { 
      title: "Low Stock", 
      value: "43", 
      icon: AlertTriangle, 
      bgClass: "bg-[#fab446]", 
      colorClass: "text-white" 
    },
    { 
      title: "Out of Stock", 
      value: "12", 
      icon: XCircle, 
      bgClass: "bg-[#ff6b6b]", 
      colorClass: "text-white" 
    },
    { 
      title: "In Transit", 
      value: "89", 
      icon: Package, 
      bgClass: "bg-[#089cff]", 
      colorClass: "text-white" 
    },
    { 
      title: "Inventory Value", 
      value: "₹2.3M", 
      icon: Wallet, 
      bgClass: "bg-[#00af35]", 
      colorClass: "text-white" 
    },
  ];

  return (
    <div className="bg-[#f9f9f9] min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section 1: Order Management */}
        <div>
          <h2 className="text-2xl font-bold text-[#253154] mb-6">Order Management Dashboard</h2>
          <MetricsGrid metrics={orderMetrics} />
        </div>

        {/* Section 2: Customer Management */}
        <div>
          <h2 className="text-2xl font-bold text-[#253154] mb-6">Customer Analytics</h2>
          <MetricsGrid metrics={customerMetrics} />
        </div>

        {/* Section 3: Inventory */}
        <div>
          <h2 className="text-2xl font-bold text-[#253154] mb-6">Inventory Overview</h2>
          <MetricsGrid metrics={inventoryMetrics} />
        </div>

        {/* Usage Instructions */}
        <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-50/50">
          <h3 className="text-xl font-bold text-[#253154] mb-4">🚀 How to Use MetricsGrid</h3>
          
          <div className="space-y-4 text-[#253154]">
            <div>
              <h4 className="font-semibold mb-2">1. Import the components:</h4>
              <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto">
{`import { MetricsGrid, type MetricData } from '../components/ui';
import { ShoppingBag, Clock, Package } from 'lucide-react';`}
              </pre>
            </div>

            <div>
              <h4 className="font-semibold mb-2">2. Define your metrics data:</h4>
              <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto">
{`const metrics: MetricData[] = [
  { 
    title: "Total Orders", 
    value: "7,893", 
    icon: ShoppingBag, 
    bgClass: "bg-[#7151ff]", 
    colorClass: "text-white",
    tooltipText: "Custom tooltip text (optional)"
  },
  // ... more metrics
];`}
              </pre>
            </div>

            <div>
              <h4 className="font-semibold mb-2">3. Use the MetricsGrid component:</h4>
              <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto">
{`<MetricsGrid metrics={metrics} />`}
              </pre>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-semibold mb-3">✨ Features:</h4>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li><strong>Desktop:</strong> 5-column grid layout (auto-adjusts to 2 columns on tablets)</li>
                <li><strong>Mobile:</strong> Swipeable carousel with navigation dots</li>
                <li><strong>Tooltips:</strong> Hover over the "i" icon to see details</li>
                <li><strong>Animations:</strong> Cards have hover effects and decorative background elements</li>
                <li><strong>Responsive:</strong> Automatically switches between grid and carousel at 1024px</li>
              </ul>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-semibold mb-3">🎨 Recommended Colors:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-[#7151ff]"></div>
                  <span>bg-[#7151ff] - Purple (Primary)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-[#da41c5]"></div>
                  <span>bg-[#da41c5] - Pink (Warning)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-[#00af35]"></div>
                  <span>bg-[#00af35] - Green (Success)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-[#fab446]"></div>
                  <span>bg-[#fab446] - Orange (Alert)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-[#089cff]"></div>
                  <span>bg-[#089cff] - Blue (Info)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-[#ff6b6b]"></div>
                  <span>bg-[#ff6b6b] - Red (Error)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
