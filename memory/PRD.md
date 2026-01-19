# Event Management Admin System - PRD

## Project Overview
A full-stack Event Management Admin System built with:
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Shadcn/UI components
- **Backend**: Node.js, TypeScript, Express.js, PostgreSQL with Knex
- **File Storage**: AWS S3 (with local storage fallback)

## Core Modules

### 1. Authentication Module ✅ COMPLETE
- JWT-based login/logout
- Protected admin routes
- Default user: admin@example.com / admin123

### 2. Events Overview Module ✅ COMPLETE
- Dashboard with metric cards (Total Events, Active, Draft, Registrations, Growth Rate)
- Tab filtering (All, Active, Draft, Archived, Live)
- Search, Sort, Filter functionality
- Pagination
- Saved Views feature
- Bulk actions (Archive, Delete)

### 3. Create Event Module ✅ COMPLETE
- Full event creation form with all required fields
- **File Upload Functionality** ✅ COMPLETE
  - Event Banner Image (single file)
  - Promo Video (single file)
  - Gallery Images (multiple files)
  - Partner Logos (multiple, via Add Partner)
  - Sponsor Logos (multiple, via Add Sponsor)
- SEO auto-generation (Meta Title, URL Slug, Meta Description)
- Virtual event integration (Zoom/Google Meet API ready)
- Date/Time with timezone support
- Registration window settings
- Location & Mode selection
- Agenda builder
- Email configuration overrides

### 4. Event Detail Module - Overview Tab ✅ COMPLETE (Jan 2, 2026)
- **Row Click Navigation**: Click event row in Events table navigates to Event Detail page
- **Page Header**: Event name, date range, status badge, breadcrumb navigation
- **Tab Navigation**: Overview (active), Tickets, Registrations, Attendees & Check-in, Communications, Reports, Settings
- **Top KPI Cards**: Total Registrations, Gross Revenue, Page Views, Conversion Rate (with comparison to previous period)
- **Registration Funnel**: Page Views → Add to Cart → Checkout Started → Completed Registration (with period selector)
- **Ticket Inventory Health**: Shows all tickets with sold/capacity and status badges (Selling Fast, Available, Sold Out)
- **Attention Needed Alerts**: Pending refunds, low inventory warnings, failed payments
- **Event Timeline**: Chronological list of system and admin actions
- **Recent Internal Activity**: Activity log feed with actor types and timestamps

### 5. Event Detail Module - Tickets Tab ✅ COMPLETE (Jan 3, 2026)
- **Stats Cards**: Total Sales, Tickets Sold / Total Capacity, Add-on Revenue, Avg Order Value
- **Sub-tabs**: Ticket Inventory, Add-ons, Promo Codes, Settings
- **Ticket CRUD**:
  - **Create Ticket**: Name, description, price, capacity, category, min/max per order, sales dates, visibility, on-sale toggle
  - **Edit Ticket**: Update all ticket fields via dialog
  - **Delete Ticket**: Soft delete (blocked if ticket has sales)
- **Ticket Actions**:
  - **Pause/Resume Sales**: Toggle is_on_sale status
  - **End Sales**: Permanently end ticket sales (confirmation required)
  - **Duplicate**: Create copy with "(Copy)" suffix
- **Ticket Table**: Name, Type (paid/free), Price, Sold/Capacity with progress bar, Status badge, Sales Period, Actions dropdown
- **Search**: Filter tickets by name or category
- **Inventory Management**: Status auto-updates based on capacity, sales dates, and is_on_sale flag

### 6. Event Detail Module - Tickets Tab Sub-tabs ✅ COMPLETE (Jan 3, 2026)

#### 6.1 Add-ons Sub-tab
- **Add-on CRUD**:
  - **Create**: Name, description, type (general/merchandise/food/access/parking), price, quantity limit, per order limit, active toggle
  - **Edit**: Update all add-on fields via dialog
  - **Delete**: Soft delete (disabled if quantity_sold > 0)
- **Toggle Status**: Activate/Deactivate add-ons
- **Add-on Table**: Name, Type, Price, Sold/Limit with progress bar, Status badge, Actions dropdown

#### 6.2 Promo Codes Sub-tab
- **Promo Code CRUD**:
  - **Create**: Code (with Generate button), discount type (percentage/fixed), discount value, max discount amount, min order value, usage limit, applicable to (all/tickets/addons), valid from/until dates, active toggle
  - **Edit**: Update all promo code fields via dialog
  - **Delete**: Soft delete
- **Toggle Status**: Activate/Deactivate promo codes
- **Copy to Clipboard**: Copy promo code with toast notification
- **Promo Table**: Code, Discount, Usage count/limit, Validity period, Status badge, Actions dropdown

#### 6.3 Settings Sub-tab
- **Tax & Fees**: Pass fees to attendees toggle, charge tax toggle with type/rate inputs
- **Refund Policy**: Policy type dropdown (No Refunds, Full Refund, Partial Refund, Custom) with deadline days and percentage inputs
- **Ticket Sales Rules**: Allow transfers, allow cancellations, lock changes after event start toggles
- **Visibility Rules**: Hide sold out tickets, auto-hide past tickets toggles
- **Capacity Rules**: Stop sales when full, allow admin overselling, auto-enable waitlist toggles
- **Confirmation & Invoices**: Auto-send confirmation, attach invoice, show tax breakdown toggles

### 7. Event Detail Module - Registrations Tab ✅ COMPLETE (Jan 3, 2026)
- **Filter Badges**: All Registrations, Pending Approval, Incomplete, Cancelled (with counts from stats API)
- **Search**: Filter by name, email, or registration code
- **Pagination**: 20 items per page with Previous/Next navigation
- **Registrations Table**: Registrant (name + email), Ticket Type, Date, Payment Status, Registration Status, Actions
- **Status Display**:
  - **Registration Status**: Approved (green), Pending (amber), Cancelled (gray)
  - **Payment Status**: Paid/Free (green), Pending (amber), Failed (red)
- **Actions Dropdown**:
  - Approve Registration / Mark as Pending / Cancel Registration
  - Mark as Paid / Mark Payment Pending / Mark Payment Failed
- **Add Registration Modal**:
  - **Registrant Details**: Full name (required), Email (required, validated), Phone (optional)
  - **Ticket Details**: Ticket type dropdown, Quantity input
  - **Payment & Status**: Payment status (Paid/Free/Pending), Payment method (Manual/Cash/Bank Transfer/Other), Registration status (Approved/Pending/Cancelled)
- **Activity Logging**: All registration actions logged to event_activity_logs

### 8. Event Detail Module - Attendees & Check-in Tab ✅ COMPLETE (Jan 3, 2026)
- **Live Check-in Metrics** (4 cards):
  - **Checked In**: X / Y total, percentage checked in
  - **Peak Check-in Time**: Hour range with most check-ins
  - **Last Check-in**: Time ago + exact time
  - **No-Show Rate**: Percentage + count
- **Attendees Table**:
  - Columns: Attendee (name + email/QR), Ticket Type, Check-in Time + Location, Status, Actions
  - **Status Badges**: Checked In (green), Not Here (gray), No Show (red)
  - **Search**: Filter by name or QR code
  - **Filter**: Checked-in only checkbox
  - **Pagination**: 20 per page with Previous/Next
- **Actions Dropdown**:
  - Manual Check-in (for not checked-in)
  - Undo Check-in (for checked-in)
  - Print Badge (placeholder)
  - View QR Code
- **Quick Actions Bar**:
  - Sync from Registrations button (creates attendees from completed registrations)
  - Launch Scanner button (opens QR Scanner dialog)
  - Add Attendee button (opens Add Attendee modal)
- **QR Scanner Dialog**:
  - QR Code Value input
  - Location dropdown (Main Gate, VIP Entrance, Side Entrance, Registration Desk)
  - Check In button
- **Add Attendee Modal**:
  - Full Name (required)
  - Email (optional)
  - Ticket Type dropdown (optional)
- **Sidebar - Active Devices**:
  - Device name, scan count, online/offline status, battery level
- **Sidebar - Check-in Locations**:
  - Location name, check-in count, last check-in time ago
- **QR Check-in Flow**:
  - Unique QR code generated at attendee creation (QR-{UUID})
  - QR validation: Invalid QR → error, Wrong event → error, Already checked in → error
  - Device tracking: Creates/updates device record with scan count
  - Location tracking: Logs check-in location for stats
  - Activity logging: All check-in actions logged
- **Actions Dropdown**:
  - Approve Registration / Mark as Pending / Cancel Registration
  - Mark as Paid / Mark Payment Pending / Mark Payment Failed
- **Add Registration Modal**:
  - **Registrant Details**: Full name (required), Email (required, validated), Phone (optional)
  - **Ticket Details**: Ticket type dropdown, Quantity input
  - **Payment & Status**: Payment status (Paid/Free/Pending), Payment method (Manual/Cash/Bank Transfer/Other), Registration status (Approved/Pending/Cancelled)
- **Activity Logging**: All registration actions logged to event_activity_logs

### 9. Event Detail Module - Communications Tab ✅ COMPLETE (Jan 3, 2026)

#### 9.1 All Campaigns Sub-tab
- **Campaign Stats**: Total campaigns, Sent campaigns, Scheduled campaigns, Draft campaigns, Total recipients, Avg open rate, Avg click rate
- **Campaigns Table**: Campaign Name (with date), Type (Email/SMS icon), Status badge, Recipients, Performance (Open%/Click%), Actions dropdown
- **Status Badges**: Draft (gray), Scheduled (blue), Sending (violet), Sent (green), Paused (amber)
- **Campaign CRUD**:
  - **Create**: 5-step wizard (Basics → Audience → Content → Schedule → Review)
  - **Edit**: Open wizard for draft/scheduled campaigns
  - **Delete**: Soft delete with confirmation dialog
  - **Duplicate**: Create copy with "(Copy)" suffix and draft status
- **Campaign Actions**:
  - **Send Now**: Send immediately (draft campaigns only)
  - **Schedule**: Set future send date/time
  - **Pause**: Pause scheduled campaign
  - **Resume**: Resume paused campaign
- **Campaign Builder Wizard (5 Steps)**:
  1. **Basics**: Campaign name (required), Channel selection (Email/SMS), Campaign type (One-time/Trigger-based)
  2. **Audience**: Select from predefined segments (All Attendees, VIP Ticket Holders, Not Checked In, Checked In) with recipient counts
  3. **Content**: Template selector, Subject line (email), Content textarea with variable badges for quick insertion
  4. **Schedule**: Send immediately or schedule for later (date/time picker)
  5. **Review**: Summary of all selections before confirmation
- **Supported Variables**: {{FirstName}}, {{LastName}}, {{Email}}, {{TicketType}}, {{OrderId}}, {{EventName}}, {{EventDate}}, {{Location}}, {{QRCode}}, {{CalendarLink}}, {{Unsubscribe}}

#### 9.2 Templates Sub-tab
- **Templates Grid**: Cards with channel icon (Mail/MessageSquare), template name, last edited date, menu (Edit, Duplicate, Delete)
- **Create Template Card**: Dashed border card for creating new templates
- **Template CRUD**:
  - **Create**: Name (required), Channel (Email/SMS), Subject (email only), Content (required)
  - **Edit**: Update all template fields
  - **Delete**: Soft delete with confirmation
  - **Duplicate**: Create copy with "(Copy)" suffix
- **Template Editor**:
  - **Main Area**: Name input, Channel selection cards, Subject input (email), Content textarea
  - **Variables Sidebar**: Click-to-insert variables organized by category:
    - **Attendee**: First Name, Last Name, Email, Ticket Type, Order ID
    - **Event**: Event Name, Event Date, Location, Venue Map
    - **System**: QR Code Image, Add to Calendar, Unsubscribe Link

**MOCKED**: Campaign send functionality is stubbed - marks campaigns as sent and creates recipient records but doesn't actually send emails/SMS

### 9.3 Audience Segments Sub-tab ✅ COMPLETE (Jan 3, 2026)
- **Segments Grid**: Cards showing segment icon, name, description, estimated count, Active/Inactive badge, match type, rules count, menu (Edit, Refresh Count, Delete)
- **Create Segment Card**: Dashed border card for creating new segments
- **Segment CRUD**:
  - **Create**: Name (required), Description, Match type (ALL/ANY), Filter rules, Active toggle
  - **Edit**: Update all segment fields, recalculates count automatically
  - **Delete**: Soft delete with confirmation dialog
  - **Refresh**: Recalculate segment members count
- **Segment Builder** (Rule-based Audience Editor):
  - **Left Panel**: Name input, Description textarea, Match Type buttons (Match ALL/Match ANY), Filter Rules section with field/operator/value selectors, Add Rule button, Active toggle
  - **Right Panel**: Live Preview showing matched attendees in real-time (Name, Ticket, Status, Email columns) with total count badge
  - **Supported Filter Fields**: Ticket Type, Check-in Status, Registration Status, Registration Date, Email, Name
  - **Supported Operators**: equals, not_equals, contains, not_contains, in, not_in, greater_than, less_than, between, is_empty, is_not_empty
  - **Match Logic**: ALL (AND) - all rules must match, ANY (OR) - any rule can match

### 9.4 Settings Sub-tab ✅ COMPLETE (Jan 3, 2026)
- **Header**: "Communication Settings" with Reset to Default and Save Settings buttons
- **Sender Configuration** section:
  - Default Sender Name input
  - Reply-To Email input
  - SMS Sender ID input (max 11 chars)
- **Channel Controls** section:
  - Email Channel toggle (enable/disable)
  - SMS Channel toggle (enable/disable)
- **Quiet Hours** section:
  - Start Time picker
  - End Time picker
  - Warning banner when configured
- **Privacy & Opt-Out** section:
  - Respect Opt-Out Preferences toggle
  - Custom Unsubscribe Page URL input
- **Tracking & Analytics** section:
  - Track Opens toggle
  - Track Clicks toggle
- **Validation**: Email format, time format (HH:MM), validates settings before campaign send

### 10. Event Detail Module - Reports Tab ✅ COMPLETE (Jan 3, 2026)
- **Quick Insights Section**: 5 standard report cards displayed in a responsive grid
  - Registration Funnel (line chart) - Conversion rates from page view to payment
  - Ticket Sales Breakdown (pie chart) - Sales volume by ticket type and category
  - Revenue Over Time (line chart) - Daily gross revenue and transaction count
  - Attendance & Check-in (bar chart) - Real-time check-in stats vs total registrations
  - Geographic Distribution (map) - Attendee breakdown by country and city
- **Saved Reports Section**: Table with custom reports
  - Columns: Report Name, Type (category badge), Visualization (icon + type), Visibility, Created date, Actions
  - **Report CRUD**:
    - **Create**: Open Report Builder form with name, description, category, visualization type, field selection
    - **Run**: Execute report and display results in data table
    - **Duplicate**: Create copy with "(Copy)" suffix
    - **Export**: Download report data as CSV file
    - **Delete**: Soft delete with confirmation dialog
- **Report Builder Form**:
  - Report Name (required)
  - Description (optional)
  - Category dropdown: Registrations, Ticket Sales, Revenue & Finance, Attendance
  - Visualization Type buttons: Table, Bar, Line, Pie
  - Data Source Field Selection: 4 data sources with checkboxes:
    - Event Data: Event Name, Event Date, Location, Category, Status
    - Ticket Data: Ticket Type, Price, Quantity Sold, Capacity
    - Registration Data: Registrant Name, Email, Status, Registration Date, Amount Paid
    - Check-in Logs: Attendee Name, Check-in Status, Check-in Time, Email
  - Data Scope dropdown: This Event Only, Event Series, Multiple Events
  - Visibility dropdown: Private (Only Me), Team, Organization
- **Report Viewer**:
  - Header: Report name, description, Back/Refresh/Export buttons
  - Stats Cards: Total Records, plus contextual stats (Total Revenue for finance, Total Sold for tickets)
  - Data Table: Dynamic columns based on report type, sortable/scrollable
- **APIs Implemented**:
  - GET /events/:eventId/reports - List all reports
  - POST /events/:eventId/reports - Create new report
  - GET /events/:eventId/reports/:id - Get single report
  - PUT /events/:eventId/reports/:id - Update report
  - DELETE /events/:eventId/reports/:id - Soft delete report
  - POST /events/:eventId/reports/:id/run - Execute report and get data
  - GET /events/:eventId/reports/:id/export - Export as CSV
  - GET /events/:eventId/reports/:id/runs - Get execution history
  - GET /events/:eventId/reports/data-sources - Get available data sources
  - GET /events/:eventId/reports/standard - Get standard report templates
  - POST /events/:eventId/reports/standard/:id/run - Run standard report
- **Database Tables**: reports, report_fields, report_filters, report_runs

### 11. Event Detail Module - Settings Tab → General Details ✅ COMPLETE (Jan 19, 2026)
- **Left Navigation**: General Details, Branding & Design, Payment & Tax, Team & Permissions, Badge Design, Integrations, Data & Privacy, Email Configuration, Advanced Configuration, Archive Event, Delete Event
- **General Details Page** (fully wired end-to-end):
  - **Event Banner**: Upload area with recommended size
  - **Basic Information**:
    - Event Name (text input)
    - Category (dropdown from categories master table + add new category dialog)
    - Description (textarea)
    - Event Type (dropdown: conference, workshop, meetup, webinar, seminar, networking)
    - Visibility (dropdown: public, private, unlisted)
    - Check-in Mode (dropdown: qr_code, manual, both)
  - **Organizer & Tags**:
    - Event Owner (text input)
    - Co-hosts (multi-select popover from users table)
    - Tags (multi-select with color badges + create new tag dialog)
  - **Date & Time**:
    - Start Date & Time (datetime-local input)
    - End Date & Time (datetime-local input)
    - Timezone (dropdown: major timezones)
    - All-day event (switch)
  - **Registration Settings**:
    - Registration Opens (datetime-local)
    - Registration Closes (datetime-local)
    - Capacity (number input)
    - Enable Waitlist (switch)
  - **Location**:
    - Event Mode (buttons: In Person, Virtual, Hybrid)
    - Venue Name, Address Line 1/2, City, State, ZIP, Country (for in-person/hybrid)
    - Meeting URL (for virtual/hybrid)
  - **Event Media**:
    - Promo Video URL (text input with URL validation)
    - Event Photos (upload area placeholder)
  - **Accessibility & Safety**:
    - Accessibility Information (textarea)
    - Emergency Contact (phone input)
  - **Save Changes**: Button that calls PUT API and shows success toast
- **APIs Implemented**:
  - GET /master/categories - List all categories
  - POST /master/categories - Create new category
  - PUT /master/categories/:id - Update category
  - DELETE /master/categories/:id - Soft delete category
  - GET /master/tags - List all tags (with search query param)
  - POST /master/tags - Create new tag
  - PUT /master/tags/:id - Update tag
  - DELETE /master/tags/:id - Soft delete tag
  - GET /master/users - List users for co-host dropdown
  - GET /events/:eventId/general - Get full event details with category, tags, co_hosts, media
  - PUT /events/:eventId/general - Update event with tag_ids, cohost_ids arrays
  - GET /events/:eventId/media - Get event media
  - POST /events/:eventId/media - Add event media
  - DELETE /events/:eventId/media/:mediaId - Delete event media
- **Database Tables Created**:
  - categories (id, name, slug, description, is_active, audit + soft delete)
  - tags (id, name, slug, color, is_active, audit + soft delete)
  - event_tags (event_id, tag_id - junction table)
  - event_cohosts (event_id, user_id, role - junction table)
  - event_media (event_id, file_key, url, file_type, media_type, size, original_name, sort_order)
  - events.category_id (foreign key to categories)
- **Seeded Data**: 8 categories (Conference, Workshop, Meetup, Awards, Webinar, Networking, Training, Seminar), 7 tags with colors

## Upcoming Tasks

### P1 - Settings Tab (Other Subsections)
- Branding & Design, Payment & Tax, Team & Permissions, Badge Design
- Integrations, Data & Privacy, Email Configuration, Advanced Configuration
- Archive Event, Delete Event

### P2 - Master Data Management UI
- Admin UI for CRUD operations on categories
- Admin UI for CRUD operations on tags

## Technical Architecture

### Frontend Structure
```
/app/frontend/src/
├── app/
│   ├── api/
│   │   ├── config.ts          # Axios client configuration
│   │   └── events.api.ts      # Events & upload API methods
│   ├── components/
│   │   ├── FileUpload.tsx     # Reusable file upload component
│   │   └── ui/                # Shadcn UI components
│   ├── pages/
│   │   ├── EventsPage.tsx     # Events overview
│   │   └── EventSetupPage.tsx # Create/Edit event form
│   └── App.tsx
```

### Backend Structure (Clean Node.js/TypeScript with PostgreSQL)
```
/app/backend/
├── src/
│   ├── controllers/           # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── events.controller.ts
│   │   ├── file-upload.controller.ts
│   │   └── saved-views.controller.ts
│   ├── services/              # Business logic
│   │   ├── auth.service.ts
│   │   ├── events.service.ts
│   │   ├── s3.service.ts      # File upload (S3/local fallback)
│   │   ├── saved-views.service.ts
│   │   ├── zoom.service.ts
│   │   └── google-meet.service.ts
│   ├── database/
│   │   ├── db.ts              # Knex database connection
│   │   ├── knexfile.ts        # Knex configuration
│   │   └── migrations/        # Database migrations
│   ├── routes/                # API route definitions
│   ├── dtos/                  # Data transfer objects
│   ├── interfaces/            # TypeScript interfaces
│   ├── middlewares/           # Express middlewares
│   ├── utils/                 # Utility functions
│   └── server.ts              # Express app entry point
├── package.json
├── tsconfig.json
└── .env
```

**Note:** The backend is 100% Node.js/TypeScript with PostgreSQL/Knex - no Python or MongoDB code.

## API Endpoints

### Auth
- `POST /api/auth/login` - User login

### Events
- `GET /api/events` - List events (with pagination, filters, sorting)
- `GET /api/events/metrics` - Dashboard metrics
- `POST /api/events` - Create new event
- `POST /api/events/bulk-archive` - Archive multiple events
- `POST /api/events/bulk-delete` - Soft delete multiple events

### Event Detail - Overview Tab
- `GET /api/events/:eventId` - Get event details by ID
- `GET /api/events/:eventId/overview/metrics` - Get overview summary metrics
- `GET /api/events/:eventId/overview/funnel` - Get registration funnel data
- `GET /api/events/:eventId/overview/tickets` - Get ticket inventory health
- `GET /api/events/:eventId/overview/alerts` - Get attention needed alerts
- `GET /api/events/:eventId/overview/activity` - Get event activity timeline

### Event Detail - Tickets Tab (NEW - Jan 3, 2026)
- `GET /api/events/:eventId/tickets` - List all tickets for an event
- `GET /api/events/:eventId/tickets/stats` - Get ticket statistics
- `POST /api/events/:eventId/tickets` - Create new ticket
- `GET /api/events/:eventId/tickets/:ticketId` - Get single ticket by ID
- `PUT /api/events/:eventId/tickets/:ticketId` - Update ticket
- `DELETE /api/events/:eventId/tickets/:ticketId` - Delete ticket (soft delete)
- `POST /api/events/:eventId/tickets/:ticketId/toggle-sales` - Toggle ticket sales (pause/resume)
- `POST /api/events/:eventId/tickets/:ticketId/end-sales` - End ticket sales permanently
- `POST /api/events/:eventId/tickets/:ticketId/duplicate` - Duplicate ticket

### Event Detail - Add-ons API (NEW - Jan 3, 2026)
- `GET /api/events/:eventId/addons` - List all add-ons for an event
- `POST /api/events/:eventId/addons` - Create new add-on
- `GET /api/events/:eventId/addons/:addonId` - Get single add-on by ID
- `PUT /api/events/:eventId/addons/:addonId` - Update add-on
- `DELETE /api/events/:eventId/addons/:addonId` - Delete add-on (soft delete)
- `POST /api/events/:eventId/addons/:addonId/toggle` - Toggle add-on status (active/inactive)

### Event Detail - Promo Codes API (NEW - Jan 3, 2026)
- `GET /api/events/:eventId/promo-codes` - List all promo codes for an event
- `POST /api/events/:eventId/promo-codes` - Create new promo code
- `GET /api/events/:eventId/promo-codes/:promoId` - Get single promo code by ID
- `PUT /api/events/:eventId/promo-codes/:promoId` - Update promo code
- `DELETE /api/events/:eventId/promo-codes/:promoId` - Delete promo code (soft delete)
- `POST /api/events/:eventId/promo-codes/:promoId/toggle` - Toggle promo code status (active/inactive)

### Event Detail - Settings API (NEW - Jan 3, 2026)
- `GET /api/events/:eventId/settings` - Get all event settings
- `PUT /api/events/:eventId/settings` - Update event settings

### Event Detail - Registrations API (NEW - Jan 3, 2026)
- `GET /api/events/:eventId/registrations` - List registrations with filters (status, payment_status, search), pagination
- `GET /api/events/:eventId/registrations/stats` - Get registration stats (total, pending, incomplete, cancelled, approved)
- `POST /api/events/:eventId/registrations` - Create new registration (admin entry)
- `GET /api/events/:eventId/registrations/:registrationId` - Get single registration by ID
- `PUT /api/events/:eventId/registrations/:registrationId` - Update registration
- `DELETE /api/events/:eventId/registrations/:registrationId` - Delete registration (soft delete)
- `POST /api/events/:eventId/registrations/:registrationId/status` - Update registration status (started, pending, completed, approved, cancelled, refunded, expired)
- `POST /api/events/:eventId/registrations/:registrationId/payment-status` - Update payment status (pending, paid, free, failed, refunded)

### Event Detail - Attendees & Check-in API (NEW - Jan 3, 2026)
- `GET /api/events/:eventId/attendees` - List attendees with filters (checkin_status, search), pagination
- `GET /api/events/:eventId/attendees/metrics` - Get live check-in metrics (total_registrations, total_checked_in, no_show_rate, checkin_percentage, peak_checkin_time, last_checkin_ago)
- `GET /api/events/:eventId/attendees/devices` - Get active devices list (device_name, total_scans, status, battery_level)
- `GET /api/events/:eventId/attendees/locations` - Get location stats (location, checkin_count, last_checkin_ago)
- `POST /api/events/:eventId/attendees` - Create attendee manually (auto-generates QR code)
- `POST /api/events/:eventId/attendees/sync` - Sync attendees from completed registrations
- `POST /api/events/:eventId/attendees/qr-checkin` - QR check-in with validation (qr_code, device_name, location)
- `GET /api/events/:eventId/attendees/:attendeeId` - Get single attendee by ID
- `POST /api/events/:eventId/attendees/:attendeeId/checkin` - Manual check-in by admin
- `POST /api/events/:eventId/attendees/:attendeeId/undo-checkin` - Undo check-in (revert to not_checked_in)
- `PUT /api/events/devices/:deviceId/status` - Update device status and battery level

### File Upload
- `POST /api/upload/single` - Upload single file
- `POST /api/upload/multiple` - Upload multiple files

### Saved Views
- `GET /api/saved-views` - Get user's saved views
- `POST /api/saved-views` - Create new saved view
- `PUT /api/saved-views/:id` - Rename saved view
- `DELETE /api/saved-views/:id` - Delete saved view

## Database Schema (PostgreSQL with Knex)

### users
- id (primary key), email (unique), password_hash, created_at, updated_at, deleted_at

### events
- id (primary key), event_code (unique), name, description, category, type, event_type
- start_date, end_date, all_day, timezone
- registration fields: reg_start_at, reg_end_at, capacity, waitlist_enabled
- venue fields: mode, venue_id, venue_name, location, city, state, country
- media fields: banner_image_url, promo_video_url, gallery_images (jsonb)
- seo fields: meta_title, meta_description, url_slug
- settings: status, visibility, check_in_mode, data_collection_form_id
- relationships: co_hosts (jsonb), tags (jsonb), partners (jsonb), sponsors (jsonb), agenda (jsonb)
- timestamps: created_at, updated_at, deleted_at

### saved_views
- id (primary key), name, module, configuration (jsonb), user_id (foreign key), created_at, updated_at, deleted_at

### event_registrations (EXTENDED - Jan 3, 2026)
- id (bigint), event_id, user_id, registrant_name, registrant_email, registrant_phone, ticket_id, quantity, status, registration_source, payment_status, payment_method, total_amount, currency, registration_code, metadata, created_at, updated_at, is_deleted

### tickets (NEW - Jan 2, 2026)
- id (bigint), event_id, name, description, price, currency, capacity, sold_count, status, sales_start_at, sales_end_at, created_at, updated_at, is_deleted

### ticket_sales (NEW - Jan 2, 2026)
- id (bigint), event_id, ticket_id, registration_id, quantity, unit_price, total_amount, currency, payment_provider, payment_reference, status, created_at, updated_at, is_deleted

### event_analytics_events (NEW - Jan 2, 2026)
- id (bigint), event_id, event_type (page_view, add_to_cart, checkout_started, purchase_completed), session_id, user_id, source, metadata, created_at

### refunds (NEW - Jan 2, 2026)
- id (bigint), event_id, registration_id, amount, currency, status, reason, created_at, updated_at

### event_activity_logs (NEW - Jan 2, 2026)
- id (bigint), event_id, actor_type, actor_id, action_type, description, metadata, created_at

### event_addons (NEW - Jan 3, 2026)
- id (bigint), event_id, name, description, addon_type, price, currency, unlimited_quantity, quantity_limit, quantity_sold, per_order_limit, is_active, is_visible, created_at, updated_at, is_deleted

### promo_codes (NEW - Jan 3, 2026)
- id (bigint), event_id, code (unique per event), discount_type (percentage/fixed), discount_value, max_discount_amount, min_order_value, applicable_to (all/tickets/addons), applicable_items (jsonb), usage_limit, usage_count, valid_from, valid_until, is_active, created_at, updated_at, is_deleted

### event_settings (NEW - Jan 3, 2026)
- id (bigint), event_id (unique), pass_fees_to_attendees, charge_tax, tax_type, tax_rate, refund_policy, refund_deadline_days, refund_percentage, allow_transfers, allow_cancellations, lock_changes_after_event_start, hide_sold_out_tickets, auto_hide_past_tickets, approval_mode, pending_approval_expiry_hours, auto_send_confirmation, attach_invoice, show_tax_breakdown, stop_sales_when_full, allow_admin_overselling, auto_enable_waitlist, created_at, updated_at

## Completed Work (January 2, 2026)

### Session Accomplishments
1. ✅ Cleaned up backend - removed Python and MongoDB code, restored PostgreSQL/Knex
2. ✅ Implemented Event Detail Module - Overview Tab:
   - Created 6 new database tables (event_registrations, tickets, ticket_sales, event_analytics_events, refunds, event_activity_logs)
   - Built 6 backend APIs for Overview tab data
   - Updated EventManagePage.tsx to fetch real event data
   - Updated EventOverview.tsx to display dynamic data from APIs
   - Added row click navigation from Events table to Event Detail page
3. ✅ All 19 backend tests passed (100% success rate)
4. ✅ Frontend displays all Overview tab components correctly:
   - KPI cards with comparison percentages
   - Registration funnel with period selector
   - Ticket inventory with status badges
   - Attention needed alerts
   - Activity timeline
   - File preview functionality
   - Proper URL generation for uploaded files
3. ✅ Fixed Events API pagination (string to number conversion)
4. ✅ Fixed Vite allowedHosts configuration
5. ✅ Added missing zod dependency
6. ✅ All tests passing (100% backend, 100% frontend)

## Upcoming Tasks

### P1 - High Priority
1. Event Detail Page - Remaining tabs (Attendees & Check-in, Communications, Reports)
2. Edit Event Page - UI and backend logic to edit existing events
3. AWS S3 Production Configuration - Add real AWS credentials

### P2 - Medium Priority
4. Master Data Management - CRUD for event_categories, event_tags
5. Virtual Platform Integration Testing - Verify Zoom/Google Meet APIs with real credentials

### P3 - Low Priority / Future
6. Email Sending - Implement SendGrid integration
7. User Roles and Permissions - Extend auth for different roles
8. Event Cloning - Duplicate existing events

## Completed Work (January 3, 2026)

### Session Accomplishments
1. ✅ Fixed PostgreSQL service and ran all migrations
2. ✅ Implemented Tickets Tab Sub-tabs:
   - **Add-ons**: Full CRUD with table display, create/edit dialogs, status toggle, delete functionality
   - **Promo Codes**: Full CRUD with table display, create/edit dialogs, code generator, status toggle, copy to clipboard, delete functionality
   - **Settings**: 6 settings sections (Tax & Fees, Refund Policy, Ticket Sales Rules, Visibility Rules, Capacity Rules, Confirmation & Invoices) with toggle switches
3. ✅ Created 3 new database tables (event_addons, promo_codes, event_settings)
4. ✅ Built 14 new backend APIs for Add-ons, Promo Codes, and Settings
5. ✅ Updated frontend EventTickets.tsx with all sub-tabs, dialogs, and handlers
6. ✅ All 30 backend tests passed (100% success rate)
7. ✅ Frontend fully functional with all CRUD operations working correctly
8. ✅ **Implemented Registrations Tab**:
   - Filter badges (All, Pending Approval, Incomplete, Cancelled) with counts
   - Search by name, email, or registration code
   - Pagination with 20 items per page
   - Table with columns: Registrant, Ticket Type, Date, Payment, Status, Actions
   - Add Registration modal with 3 sections (Registrant Details, Ticket Details, Payment & Status)
   - Actions dropdown: Approve/Pending/Cancel registration, Mark payment status
9. ✅ Extended event_registrations table with registrant_name, registrant_email, registrant_phone, ticket_id, quantity, payment_method, registration_code
10. ✅ Built 8 new backend APIs for Registrations
11. ✅ All 31 backend tests passed (100% success rate) for Registrations

### Test Credentials
- **URL**: https://eventflow-152.preview.emergentagent.com
- **Email**: admin@example.com
- **Password**: admin123
- **Test Event ID**: 1 (Tech Conference 2026)

## Mocked APIs
- **File Uploads**: Uses local `/app/uploads` directory instead of AWS S3

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=https://eventflow-152.preview.emergentagent.com
```

### Backend (.env)
```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=event_management
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres

JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
PORT=8001
CORS_ORIGINS=*
AWS_ACCESS_KEY_ID=           # For production S3
AWS_SECRET_ACCESS_KEY=       # For production S3
AWS_REGION=us-east-1
AWS_S3_BUCKET=event-management-uploads
PREVIEW_URL=https://eventflow-152.preview.emergentagent.com
```

## Testing

### Test Reports
- `/app/test_reports/iteration_1.json` - Latest test results
- `/app/tests/test_file_upload_api.py` - Backend API tests

### Test Credentials
- Email: admin@example.com
- Password: admin123
- API URL: https://eventflow-152.preview.emergentagent.com

## Known Limitations
1. AWS S3 uploads are **MOCKED** - using local file storage at `/app/uploads`
2. Zoom and Google Meet integrations require API credentials for full testing
3. Email sending (SendGrid) not yet implemented
