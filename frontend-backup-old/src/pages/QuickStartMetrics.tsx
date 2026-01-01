/**
 * QUICK START GUIDE - Metrics Component
 * 
 * Copy this example to any page to add responsive metrics cards!
 * Simply customize the metrics array with your data.
 */

import React from 'react';
import { MetricsGrid, type MetricData } from '../components/ui';
import { ShoppingBag, Clock, Package, RotateCcw, Wallet } from 'lucide-react';

export const QuickStartMetrics = () => {
  // ✅ STEP 1: Define your metrics data
  const metrics: MetricData[] = [
    { 
      title: "Total Orders", 
      value: "7,893", 
      icon: ShoppingBag, 
      bgClass: "bg-[#7151ff]",  // Purple
      colorClass: "text-white",
      tooltipText: "Total orders across all channels"  // Optional
    },
    { 
      title: "Pending Orders", 
      value: "123", 
      icon: Clock, 
      bgClass: "bg-[#da41c5]",  // Pink
      colorClass: "text-white" 
    },
    { 
      title: "Items Ordered", 
      value: "456", 
      icon: Package, 
      bgClass: "bg-[#00af35]",  // Green
      colorClass: "text-white" 
    },
    { 
      title: "Returns", 
      value: "98", 
      icon: RotateCcw, 
      bgClass: "bg-[#fab446]",  // Orange
      colorClass: "text-white" 
    },
    { 
      title: "Total Revenue", 
      value: "₹931K", 
      icon: Wallet, 
      bgClass: "bg-[#089cff]",  // Blue
      colorClass: "text-white" 
    },
  ];

  // ✅ STEP 2: Use the MetricsGrid component
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#253154] mb-6">
        Dashboard Metrics
      </h1>
      
      {/* This single component handles both desktop grid AND mobile carousel! */}
      <MetricsGrid metrics={metrics} />
      
      {/* Your other page content goes here */}
      <div className="mt-8">
        {/* Tables, charts, etc. */}
      </div>
    </div>
  );
};

/**
 * 🎨 COLOR PALETTE QUICK REFERENCE
 * 
 * Purple (Primary):   bg-[#7151ff]
 * Pink (Warning):     bg-[#da41c5]
 * Green (Success):    bg-[#00af35]
 * Orange (Alert):     bg-[#fab446]
 * Blue (Info):        bg-[#089cff]
 * Red (Error):        bg-[#ff6b6b]
 * 
 * 📦 AVAILABLE ICONS (from lucide-react)
 * 
 * Commerce: ShoppingBag, ShoppingCart, Wallet, DollarSign, CreditCard
 * Status: Clock, CheckCircle, XCircle, AlertTriangle, AlertCircle
 * Actions: Package, Truck, RotateCcw, RefreshCw, Send
 * Users: Users, UserPlus, UserMinus, User, Activity
 * Analytics: Eye, Target, TrendingUp, TrendingDown, BarChart
 * 
 * Browse more at: https://lucide.dev/icons/
 */
