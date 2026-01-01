# 📊 Reusable Metrics Card Component - Complete Guide

## 🎯 Overview
A fully responsive metrics card system that displays as a **5-column grid on desktop** and transforms into a **swipeable carousel on mobile**. Each card features interactive tooltips, decorative animations, and follows a consistent design system.

---

## 🚀 Quick Start

### Basic Usage

```tsx
import { MetricsGrid, type MetricData } from './components/ui';
import { ShoppingBag, Clock, Package, RotateCcw, Wallet } from 'lucide-react';

const metrics: MetricData[] = [
  { 
    title: "Total Orders", 
    value: "7,893", 
    icon: ShoppingBag, 
    bgClass: "bg-[#7151ff]", 
    colorClass: "text-white" 
  },
  { 
    title: "Pending Orders", 
    value: "123", 
    icon: Clock, 
    bgClass: "bg-[#da41c5]", 
    colorClass: "text-white" 
  },
  // ... more metrics
];

function MyPage() {
  return (
    <div className="p-8">
      <MetricsGrid metrics={metrics} />
    </div>
  );
}
```

That's it! The component handles everything else automatically.

---

## 📦 Components Included

### 1. **MetricsGrid** (Main Component)
The parent component that handles responsive layout switching.

**Location:** `/src/app/components/ui/MetricsGrid.tsx`

**Props:**
- `metrics`: `MetricData[]` - Array of metric data objects

**Features:**
- Desktop: 5-column grid layout
- Tablet: 2-column grid layout
- Mobile: Swipeable carousel with dots
- Auto-switches at 1024px breakpoint

---

### 2. **MetricCard** (Individual Card)
A single metric display card with tooltip and animations.

**Location:** `/src/app/components/ui/MetricCard.tsx`

**Props:**
```typescript
interface MetricCardProps {
  title: string;           // Metric name (e.g., "Total Orders")
  value: string;           // Metric value (e.g., "7,893" or "₹931K")
  icon: LucideIcon;        // Icon component from lucide-react
  colorClass: string;      // Icon color (e.g., "text-white")
  bgClass: string;         // Background color (e.g., "bg-[#7151ff]")
  tooltipText?: string;    // Optional custom tooltip (defaults to "View detailed {title} analytics")
}
```

**Features:**
- Fixed height: 130px
- Interactive "i" tooltip on hover
- Decorative background icon that scales on hover
- Shadow elevation on hover
- Rounded corners (16px)

---

### 3. **SlickStyles** (Carousel Styling)
CSS styles for react-slick carousel.

**Location:** `/src/app/components/ui/SlickStyles.tsx`

**Features:**
- Custom dot styling (purple active state)
- Smooth transitions
- Touch-friendly swipe
- No navigation arrows (swipe-only)

---

## 🎨 Design Specifications

### Colors

| Use Case | Color | Class |
|----------|-------|-------|
| **Primary/Purple** | `#7151ff` | `bg-[#7151ff]` |
| **Warning/Pink** | `#da41c5` | `bg-[#da41c5]` |
| **Success/Green** | `#00af35` | `bg-[#00af35]` |
| **Alert/Orange** | `#fab446` | `bg-[#fab446]` |
| **Info/Blue** | `#089cff` | `bg-[#089cff]` |
| **Error/Red** | `#ff6b6b` | `bg-[#ff6b6b]` |
| **Text/Dark Blue** | `#253154` | `text-[#253154]` |
| **Tooltip Background** | `#0e042f` | `bg-[#0e042f]` |

---

### Dimensions

| Element | Size |
|---------|------|
| Card Height | 130px (fixed) |
| Card Min Width | 180px |
| Card Padding | 20px (p-5) |
| Grid Gap | 20px (gap-5) |
| Icon (small) | 20px |
| Icon (decorative) | 80px |
| Value Font Size | 28px |
| Title Font Size | 15px |

---

### Shadows & Effects

```css
Default: shadow-md
Hover: shadow-lg
Border: border border-gray-50/50
Border Radius: rounded-2xl (16px)
```

---

## 📱 Responsive Behavior

| Screen Size | Layout | Columns | Notes |
|-------------|--------|---------|-------|
| **< 640px** (Mobile) | Carousel | 1.1 slides | Shows peek of next card |
| **640px - 1023px** (Tablet) | Grid | 2 columns | Standard grid |
| **≥ 1024px** (Desktop) | Grid | 5 columns | Final layout |

**Breakpoint:** `lg:` at **1024px**

---

## 🎭 Common Use Cases

### Example 1: Order Management

```tsx
const orderMetrics: MetricData[] = [
  { 
    title: "Total Orders", 
    value: "7,893", 
    icon: ShoppingBag, 
    bgClass: "bg-[#7151ff]", 
    colorClass: "text-white",
    tooltipText: "Total orders across all channels"
  },
  { 
    title: "Pending", 
    value: "123", 
    icon: Clock, 
    bgClass: "bg-[#da41c5]", 
    colorClass: "text-white" 
  },
  { 
    title: "Completed", 
    value: "456", 
    icon: Package, 
    bgClass: "bg-[#00af35]", 
    colorClass: "text-white" 
  },
  { 
    title: "Returns", 
    value: "98", 
    icon: RotateCcw, 
    bgClass: "bg-[#fab446]", 
    colorClass: "text-white" 
  },
  { 
    title: "Revenue", 
    value: "₹931K", 
    icon: Wallet, 
    bgClass: "bg-[#089cff]", 
    colorClass: "text-white" 
  },
];
```

---

### Example 2: Customer Analytics

```tsx
import { Users, UserPlus, Activity, Eye, Target } from 'lucide-react';

const customerMetrics: MetricData[] = [
  { title: "Total Customers", value: "5,289", icon: Users, bgClass: "bg-[#7151ff]", colorClass: "text-white" },
  { title: "New This Month", value: "234", icon: UserPlus, bgClass: "bg-[#00af35]", colorClass: "text-white" },
  { title: "Active Users", value: "3,456", icon: Activity, bgClass: "bg-[#089cff]", colorClass: "text-white" },
  { title: "Page Views", value: "45.2K", icon: Eye, bgClass: "bg-[#da41c5]", colorClass: "text-white" },
  { title: "Conversion", value: "3.2%", icon: Target, bgClass: "bg-[#00af35]", colorClass: "text-white" },
];
```

---

### Example 3: Inventory Management

```tsx
import { Package, AlertTriangle, XCircle, TrendingUp, Wallet } from 'lucide-react';

const inventoryMetrics: MetricData[] = [
  { title: "Total Products", value: "2,450", icon: Package, bgClass: "bg-[#7151ff]", colorClass: "text-white" },
  { title: "Low Stock", value: "43", icon: AlertTriangle, bgClass: "bg-[#fab446]", colorClass: "text-white" },
  { title: "Out of Stock", value: "12", icon: XCircle, bgClass: "bg-[#ff6b6b]", colorClass: "text-white" },
  { title: "In Transit", value: "89", icon: TrendingUp, bgClass: "bg-[#089cff]", colorClass: "text-white" },
  { title: "Total Value", value: "₹2.3M", icon: Wallet, bgClass: "bg-[#00af35]", colorClass: "text-white" },
];
```

---

## 🎨 Icon Library

All icons come from **lucide-react**. Common icons:

```tsx
// Finance & Commerce
import { Wallet, DollarSign, CreditCard, TrendingUp, TrendingDown } from 'lucide-react';

// Shopping & Orders
import { ShoppingBag, ShoppingCart, Package, Truck, RotateCcw } from 'lucide-react';

// Users & People
import { Users, UserPlus, UserMinus, User, Activity } from 'lucide-react';

// Alerts & Status
import { AlertTriangle, AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react';

// Time & Progress
import { Clock, Calendar, Timer, Hourglass } from 'lucide-react';

// Analytics
import { Eye, Target, BarChart, PieChart, LineChart } from 'lucide-react';
```

[Browse all icons →](https://lucide.dev/icons/)

---

## ⚙️ Customization

### Adding Custom Tooltips

```tsx
const metrics: MetricData[] = [
  { 
    title: "Total Revenue", 
    value: "₹931K",
    icon: Wallet,
    bgClass: "bg-[#089cff]",
    colorClass: "text-white",
    tooltipText: "Revenue from last 30 days excluding refunds" // Custom tooltip
  },
];
```

---

### Using Different Number Formats

```tsx
// Currency
value: "₹931K"    // Indian Rupee with K suffix
value: "$45.2M"   // US Dollar with M suffix
value: "€123"     // Euro

// Percentages
value: "42%"      // Simple percentage
value: "+12.5%"   // With direction indicator

// Numbers
value: "7,893"    // Thousands separator
value: "45.2K"    // Abbreviated thousands
value: "2.3M"     // Abbreviated millions
```

---

### Changing Grid Columns

To show **4 columns** instead of 5:

```tsx
// Edit MetricsGrid.tsx
<div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
  {/*                                                    ↑ Change to 4     */}
```

To show **3 columns**:

```tsx
<div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
```

---

## 🔧 Advanced Usage

### Dynamic Data from API

```tsx
import { useState, useEffect } from 'react';
import { MetricsGrid, type MetricData } from './components/ui';
import { ShoppingBag, Clock, Package } from 'lucide-react';

function DashboardPage() {
  const [metricsData, setMetricsData] = useState<MetricData[]>([]);

  useEffect(() => {
    // Fetch from API
    fetch('/api/metrics')
      .then(res => res.json())
      .then(data => {
        const metrics: MetricData[] = [
          { 
            title: "Total Orders", 
            value: data.totalOrders.toString(), 
            icon: ShoppingBag, 
            bgClass: "bg-[#7151ff]", 
            colorClass: "text-white" 
          },
          { 
            title: "Pending", 
            value: data.pendingOrders.toString(), 
            icon: Clock, 
            bgClass: "bg-[#da41c5]", 
            colorClass: "text-white" 
          },
          // ... map other metrics
        ];
        setMetricsData(metrics);
      });
  }, []);

  return (
    <div className="p-8">
      {metricsData.length > 0 && <MetricsGrid metrics={metricsData} />}
    </div>
  );
}
```

---

### Conditional Colors Based on Values

```tsx
const getColorForValue = (value: number): string => {
  if (value < 50) return "bg-[#ff6b6b]";  // Red for low
  if (value < 75) return "bg-[#fab446]";  // Orange for medium
  return "bg-[#00af35]";                  // Green for high
};

const metrics: MetricData[] = [
  { 
    title: "Success Rate", 
    value: "87%",
    icon: Target,
    bgClass: getColorForValue(87),  // Will be green
    colorClass: "text-white"
  },
];
```

---

## 🐛 Troubleshooting

### Carousel not working on mobile?

**Issue:** Carousel not swiping or showing dots.

**Solution:** Make sure `react-slick` is installed:
```bash
npm install react-slick
```

Also ensure `SlickStyles` is imported in your component.

---

### Tooltip not appearing?

**Issue:** Tooltip doesn't show on hover.

**Solution:** Check that `@radix-ui/react-tooltip` is installed and `TooltipProvider` is properly set up in your component tree.

---

### Cards too wide on mobile?

**Issue:** Cards extend beyond screen width.

**Solution:** Ensure the carousel wrapper has `-mx-4` class:
```tsx
<div className="block lg:hidden mb-14 -mx-4">
```

This compensates for page padding.

---

## 📊 Performance Tips

1. **Limit Metrics Count:** Works best with 3-6 metrics
2. **Memoize Data:** Use `useMemo` for static metric arrays
3. **Lazy Load Icons:** Import only the icons you need
4. **Optimize Images:** If using custom icons, use SVG format

---

## ✅ Implementation Checklist

- [ ] Install `react-slick` package
- [ ] Create `SlickStyles.tsx` component
- [ ] Create `MetricCard.tsx` component
- [ ] Create `MetricsGrid.tsx` component
- [ ] Export all components from `index.ts`
- [ ] Import icons from `lucide-react`
- [ ] Define metrics data array
- [ ] Add `MetricsGrid` to your page
- [ ] Test on desktop (verify 5-column grid)
- [ ] Test on mobile (verify carousel swipe)
- [ ] Verify tooltips work on hover
- [ ] Check responsive breakpoint at 1024px

---

## 🎯 Best Practices

1. **Consistent Colors:** Use the same color for similar metric types across pages
2. **Clear Titles:** Keep metric titles concise (1-3 words)
3. **Formatted Values:** Use K/M suffixes for large numbers (e.g., "45.2K" not "45200")
4. **Meaningful Icons:** Choose icons that visually represent the metric
5. **Helpful Tooltips:** Provide context, not just repetition of the title
6. **Accessibility:** Icons are decorative; titles provide the context
7. **Mobile Testing:** Always test swipe on actual mobile devices

---

## 📚 File Structure

```
src/
├── app/
│   ├── components/
│   │   └── ui/
│   │       ├── MetricCard.tsx       ← Individual card component
│   │       ├── MetricsGrid.tsx      ← Main grid/carousel wrapper
│   │       ├── SlickStyles.tsx      ← Carousel CSS styles
│   │       ├── tooltip.tsx          ← Radix UI tooltip (existing)
│   │       └── index.ts             ← Exports all components
│   └── pages/
│       └── MetricsExample.tsx       ← Example usage page
└── METRICS_COMPONENT_GUIDE.md       ← This file
```

---

## 🚀 Next Steps

1. **See it in action:** Check `/src/app/pages/MetricsExample.tsx` for working examples
2. **Customize:** Modify colors, icons, and values to match your needs
3. **Integrate:** Add `MetricsGrid` to your dashboard pages
4. **Extend:** Build more variations for different admin sections

---

## 📞 Support

For questions or issues:
- Review the example page: `/src/app/pages/MetricsExample.tsx`
- Check component source: `/src/app/components/ui/MetricsGrid.tsx`
- Verify props match the `MetricData` interface

---

**Built with:**
- React
- TypeScript
- Tailwind CSS
- react-slick (carousel)
- Radix UI (tooltips)
- lucide-react (icons)

**Version:** 1.0.0  
**Last Updated:** December 31, 2025
