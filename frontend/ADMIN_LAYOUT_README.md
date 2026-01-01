# Admin Backend Layout - Complete Implementation

This is a complete, production-ready admin backend layout with sidebar, header, and global search functionality. The layout is fully responsive, accessible, and follows modern design patterns.

## 🎨 Features

### Layout Components
- **Fixed Sidebar** with floating card design (287px width, 40px border radius)
- **Responsive Header** with search, notifications, and profile
- **Global Search** with keyboard shortcuts (Cmd+K / Ctrl+K)
- **Mobile-First Design** with slide-in sidebar and overlay
- **Custom Scrollbars** for both light and dark themes

### Design Specifications
- **Purple Gradient Shadow** on sidebar for premium feel
- **Smooth Transitions** and animations throughout
- **Dark Purple Background** (#0e042f) for sidebar and header
- **Light Gray Background** (#f9f9f9) for main content area
- **Gradient Profile Ring** (purple to pink)

### Navigation
- 13 pre-built admin menu items
- Settings pinned to bottom
- Active state with gradient background
- Hover effects with scale animations
- Multiple pages can map to same nav item

### Accessibility
- ✅ Full keyboard navigation support
- ✅ ARIA labels on all interactive elements
- ✅ Screen reader friendly
- ✅ Focus indicators (2px white ring)
- ✅ Semantic HTML structure

### Global Search Features
- ⌨️ Keyboard shortcut: `Cmd+K` (Mac) / `Ctrl+K` (Windows/Linux)
- 🔍 Real-time filtering
- ⌨️ Arrow key navigation
- 📊 Grouped results by module
- 🏷️ Status badges
- 📍 Breadcrumb paths
- 🔄 Recent searches section
- ⚡ Quick navigation to modules

## 🏗️ Component Structure

```
/src/app/components/
├── AdminLayout.tsx          # Main layout component
├── GlobalSearch.tsx         # Search component with popover
├── CustomScrollbarStyles.tsx # Scrollbar styling
└── DashboardPage.tsx        # Sample dashboard page
```

## 📝 Usage

### Basic Implementation

```tsx
import { AdminLayout } from './components/AdminLayout';
import { CustomScrollbarStyles } from './components/CustomScrollbarStyles';

function App() {
  const [activePage, setActivePage] = useState('dashboard');

  return (
    <>
      <CustomScrollbarStyles />
      <AdminLayout 
        activePage={activePage}
        onNavigate={(page) => setActivePage(page)}
        userName="Admin User"
        userAvatar="https://example.com/avatar.jpg"
      >
        {/* Your page content here */}
      </AdminLayout>
    </>
  );
}
```

### Props

#### AdminLayout Props
```typescript
interface AdminLayoutProps {
  children: React.ReactNode;    // Page content
  activePage?: string;          // Current active page (default: 'dashboard')
  onNavigate?: (page: string) => void;  // Navigation callback
  userName?: string;            // User display name (default: 'Admin User')
  userAvatar?: string;          // User avatar URL
}
```

### Navigation Items

The layout includes these pre-built navigation items:

| Page ID | Label | Icon |
|---------|-------|------|
| `dashboard` | Dashboard | Home |
| `users` | User Management | Users |
| `security` | Roles & Permissions | Shield |
| `analytics` | Analytics | BarChart2 |
| `content` | Content Management | FileText |
| `data` | Data Management | Database |
| `api` | API Keys | Key |
| `logs` | System Logs | Activity |
| `integrations` | Integrations | Layers |
| `email` | Email Templates | Mail |
| `billing` | Billing & Plans | CreditCard |
| `localization` | Localization | Globe |
| `updates` | Updates | Package |
| `settings` | Settings | Settings |

### Customizing Navigation

To modify navigation items, edit `AdminLayout.tsx` in the scrollable middle section:

```tsx
<NavItem 
  icon={<YourIcon size={20} />} 
  label="Your Label" 
  active={activePage === 'your-page'} 
  onClick={() => handleNav('your-page')}
/>
```

### Multiple Pages to One Nav Item

```tsx
<NavItem 
  icon={<Shield size={20} />} 
  label="Roles & Permissions" 
  active={activePage === 'security' || activePage === 'roles'} 
  onClick={() => handleNav('security')}
/>
```

## 🎨 Design Tokens

The layout uses CSS custom properties for consistent theming:

```css
--app-bg: #f9f9f9;                    /* Page background */
--app-sidebar-bg: #0e042f;            /* Sidebar/header background */
--app-primary-action: #0f172b;        /* Primary buttons */
--app-primary-action-hover: #1d293d;  /* Button hover state */
--app-heading: #1d293d;               /* Heading text */
--app-text-muted: #717182;            /* Muted text */
```

Available Tailwind classes:
- `bg-app-bg`
- `bg-app-sidebar-bg`
- `bg-app-primary-action`
- `hover:bg-app-primary-action-hover`
- `text-app-heading`
- `text-app-text-muted`

## 🔍 Global Search

### Search Data Structure

Customize search results by editing `GLOBAL_INDEX` in `GlobalSearch.tsx`:

```typescript
interface SearchRecord {
  id: string;
  module: string;        // 'Users' | 'Analytics' | etc.
  title: string;
  subtitle?: string;     // Additional info (e.g., "1,234 users")
  status?: string;       // Badge text (e.g., "Active")
  path: string[];        // Breadcrumb ['Users', 'Active']
  tags?: string[];       // Keywords for search
}
```

### Adding Module Icons

Edit `MODULE_ICONS` in `GlobalSearch.tsx`:

```typescript
const MODULE_ICONS: Record<string, React.ReactNode> = {
  YourModule: <YourIcon size={20} className="text-blue-500" />,
};
```

## 📱 Responsive Behavior

### Mobile (< 1024px)
- Sidebar hidden by default
- Hamburger menu button visible
- Sidebar slides in from left
- Semi-transparent overlay with blur
- Touch-friendly tap targets (min 44px)
- Header height: 56px
- Tighter spacing (px-4, gap-2)

### Desktop (≥ 1024px)
- Sidebar always visible
- No hamburger menu
- No overlay
- Header height: 72px
- More spacing (px-8, gap-6)
- Profile name visible
- Chevron icon visible

## ♿ Accessibility

### Keyboard Navigation
- `Tab` - Navigate through items
- `Enter` / `Space` - Activate buttons
- `Escape` - Close mobile menu / search
- `Cmd+K` / `Ctrl+K` - Open search
- `Arrow Up/Down` - Navigate search results
- `Enter` - Select search result

### ARIA Labels
All interactive elements have proper ARIA labels:
- Navigation: `aria-label="Main navigation"`
- Menu button: `aria-label="Open navigation menu"`
- Active page: `aria-current="page"`
- Notifications: `aria-label="View notifications"`
- All icons: `aria-hidden="true"`

### Focus Indicators
- Visible 2px white ring on focus
- Ring offset from dark backgrounds
- No keyboard traps
- Logical tab order

## 🎯 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📦 Dependencies

All required packages are already installed:
- `lucide-react` - Icons
- `@radix-ui/react-popover` - Search popover
- `tailwindcss` - Styling
- `clsx` & `tailwind-merge` - Utility functions

## 🚀 Performance

- Smooth 60fps animations
- Optimized re-renders with React state
- CSS transforms for sidebar animation
- Custom scrollbars with GPU acceleration
- Lazy rendering of search results

## 🎨 Color Palette

| Element | Color | Usage |
|---------|-------|-------|
| Sidebar/Header BG | `#0e042f` | Dark purple background |
| Page BG | `#f9f9f9` | Light gray |
| Active Nav | `from-white/10 to-white/5` | Gradient |
| Text (Sidebar) | `#99a1af` | Light gray-blue |
| Text (Active) | `white` | Active state |
| Profile Ring | `#c27aff → #fb64b6` | Purple to pink gradient |
| Notification Badge | `#fb2c36` | Red |
| Border | `white/5` | Subtle white at 5% opacity |

## 💡 Tips

1. **Logo Replacement**: Update the logo section in `AdminLayout.tsx` (line ~65)
2. **User Data**: Pass dynamic user data via props
3. **Navigation State**: Store in React state or URL params
4. **Search Data**: Replace mock data with API calls
5. **Notifications**: Add badge count prop for dynamic counts
6. **Mobile**: Test on actual devices for touch interactions

## 🔧 Customization Guide

### Change Sidebar Width
Edit `w-[287px]` in `AdminLayout.tsx` sidebar class

### Change Border Radius
- Sidebar: `rounded-[40px]`
- Header: `rounded-[22px]`
- Nav items: `rounded-[16px]`

### Change Colors
Edit CSS variables in `/src/styles/theme.css`:
```css
--app-sidebar-bg: #your-color;
```

### Add Logo Image
Replace the logo section:
```tsx
<img 
  src={logoImage} 
  alt="Your Company Logo" 
  className="h-12 w-auto object-contain" 
/>
```

## 📄 License

This implementation follows the specifications exactly as provided in the prompt. Feel free to customize for your needs.

## 🙏 Credits

- Icons: Lucide React
- UI Components: Radix UI
- Styling: Tailwind CSS v4
- Design: Custom admin backend specification
