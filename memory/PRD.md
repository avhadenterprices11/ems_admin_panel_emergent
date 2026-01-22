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

### 12. Reusable Category and Tags Components ✅ COMPLETE (Jan 19, 2026)
- **CategorySelect Component** (`/app/frontend/src/app/components/shared/CategorySelect.tsx`):
  - Single-select dropdown for categories
  - Fetches categories from `/api/master/categories` API
  - Uses `category_id` (number) as value - proper FK relationship
  - Inline "Create New Category" dialog
  - Loading state, error handling
  - `data-testid="category-select-trigger"` for testing
- **TagsSelect Component** (`/app/frontend/src/app/components/shared/TagsSelect.tsx`):
  - Multi-select popover for tags
  - Fetches tags from `/api/master/tags` API with search support
  - Uses `tag_ids` (number[]) as value - proper many-to-many relationship
  - Color badges for selected tags
  - Inline "Create new tag" dialog with color picker
  - Search/filter functionality
  - `data-testid="tags-select-trigger"` for testing
- **EventSetupPage Integration**:
  - CategorySelect integrated for category selection
  - TagsSelect integrated in "Internal Info" section
  - Form sends `category_id` and `tag_ids` to backend
- **Backend Support**:
  - `create-event.dto.ts` - Added `category_id` and `tag_ids` validation
  - `events.service.ts` - Saves `category_id` to events table and `tag_ids` to `event_tags` junction table
- **Database Model**:
  - `events.category_id` - FK to `categories.id`
  - `event_tags` - Junction table with `event_id` and `tag_id`

### 13. Virtual Meeting Integration ✅ COMPLETE (Jan 20, 2026)
- **Frontend (EventSetupPage.tsx)**:
  - Meeting Platform dropdown appears when Event Mode = "Virtual / Online" or "Hybrid"
  - Platform options: Zoom, Google Meet, Other (Enter URL manually)
  - "Not configured" badges shown when credentials aren't set
  - "Generate Link" button appears when credentials are configured
  - Manual URL entry fallback for "Other" option
  - `data-testid="meeting-platform-select"` and `data-testid="meeting-url-input"` for testing
- **Backend APIs**:
  - GET `/api/meetings/status` - Returns {zoom: boolean, googleMeet: boolean} indicating credential configuration
  - POST `/api/meetings/generate` - Generates meeting link for specified platform
    - Required fields: platform, topic, start_time, end_time, timezone
    - Returns: meeting_url, meeting_id, meeting_password, platform, provider_payload
  - DELETE `/api/meetings/:platform/:meetingId` - Deletes a meeting
- **Services**:
  - `meeting.service.ts` - Central orchestrator for meeting generation
  - `zoom.service.ts` - Server-to-Server OAuth flow, meeting creation/deletion
    - Requires: ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET env vars
  - `google-meet.service.ts` - Google Calendar API with Meet link
    - Requires: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN env vars
- **Database Migration (20260119000001_add_meeting_platform_fields.ts)**:
  - `meeting_platform` (string) - 'zoom', 'google-meet', 'other', null
  - `meeting_id` (string) - Platform's meeting identifier
  - `meeting_password` (string) - Meeting password (Zoom only)
  - `meeting_provider_payload` (jsonb) - Full API response for reference
- **Events Service Integration**:
  - Auto-generates meeting when mode=virtual/online/hybrid AND virtual_platform is set
  - Stores meeting_url, meeting_platform, meeting_id, meeting_password, meeting_provider_payload
  - Graceful fallback if meeting generation fails (logs error, allows manual entry)
- **Timezone Handling**:
  - Timezone passed consistently from frontend (event.timezone)
  - Used in Zoom API (timezone field) and Google Calendar API (start/end timeZone)
- **✅ CREDENTIALS CONFIGURED (Jan 20, 2026)**:
  - Zoom: Server-to-Server OAuth credentials active
  - Google Meet: OAuth 2.0 with Calendar API credentials active
  - Both platforms tested and generating real meeting links

### 14. Event Setup Form Audit & Fixes ✅ COMPLETE (Jan 21, 2026)
- **Primary Owner Dropdown**:
  - Now fetches users from `/api/master/users` instead of hardcoded MOCK_USERS
  - "Add New" button added to create new owners inline
  - Maps selected user's email to `owner` field in database
- **Category & Tags**:
  - CategorySelect component fetches from `/api/master/categories` (8 categories)
  - TagsSelect component fetches from `/api/master/tags` (7 tags with colors)
  - Backend saves `category_id` (FK) and `tag_ids` via `event_tags` junction table
- **Timezone Support**:
  - Expanded to 35+ IANA timezones including Asia/Kolkata (India Standard Time)
  - Timezone passed consistently to Zoom/Google Meet APIs
- **Meeting Integration**:
  - Backend auto-generates meeting link when mode=online/hybrid and virtual_platform is zoom/google-meet
  - Stores: meeting_url, meeting_platform, meeting_id, meeting_password, meeting_provider_payload
- **Test Results**: 14/14 backend API tests pass (100%)

### 15. Branding & Design Settings ✅ COMPLETE (Jan 21, 2026)
- **Database**: `event_branding` table with unique `event_id` FK
  - `light_logo_url`, `dark_logo_url`, `cover_image_url`
  - `primary_color` (hex), `secondary_color` (hex)
  - `font_family` (inter, roboto, poppins, open-sans, lato, montserrat)
  - `updated_at`, `updated_by`
- **Backend APIs**:
  - `GET /api/events/:eventId/branding` - Returns branding (auto-creates default if not exists)
  - `PUT /api/events/:eventId/branding` - Updates branding with hex color and font validation
  - `POST /api/events/:eventId/branding/reset` - Resets to defaults
- **Frontend UI** (`SettingsBranding.tsx`):
  - Light Logo & Dark Logo upload with preview (reuses FileUpload component)
  - Cover Image upload with preview
  - Primary & Secondary color pickers with hex input
  - Font Family dropdown (6 fonts)
  - Live Preview section showing current branding
  - Save Changes button (disables while saving, toast on success/error)
  - Reset Defaults button (reverts and persists)
- **Default Values**: primary=#0f172b, secondary=#3b82f6, font=inter
- **Test Results**: 19/19 backend API tests pass (100%), Frontend verified

### 16. Badge Design, Booking & Ticket Issuance System ✅ COMPLETE (Jan 22, 2026)

#### 16.1 Badge Design Page (Settings → Badge Design)
- **Database**: `badge_designs` table with fields:
  - `event_id` (nullable FK) - null for global default
  - `ticket_type_id` (nullable FK) - specific ticket type design
  - `name`, `is_global_default`, `is_event_default`
  - `badge_size` (a6, credit, a7, custom), `custom_width`, `custom_height`, `orientation`
  - `design_config` (jsonb): visible_fields[], primary_color, secondary_color, background_color, font_size_scale, qr_code_size, show_punch_hole, logo_url
- **Frontend UI** (`SettingsBadge.tsx`):
  - Design selector showing all designs for event (tabs with Global/Default/Ticket-type badges)
  - Design editor form: Name, Ticket Type dropdown, Event Default toggle
  - Badge Size dropdown with custom dimensions option
  - Portrait/Landscape orientation toggle
  - Visible Fields checkboxes (drag-reorderable): Full Name, Ticket Type, Company, Job Title, QR Code, Unique Code, Event Name, Event Date
  - Style Options: Font Size Scale slider, QR Code Size slider, Primary/Secondary color pickers, Show Punch Hole toggle
  - Live Badge Preview: Real-time rendering showing all selected fields
  - Actions: New Design, Duplicate, Delete, Print Test, Save Design
- **Backend APIs**:
  - `GET /api/events/:eventId/badge-designs` - List all designs
  - `GET /api/events/:eventId/badge-designs/:id` - Get single design
  - `GET /api/events/:eventId/badge-designs/for-ticket?ticket_type_id=X` - Get appropriate design by priority
  - `POST /api/events/:eventId/badge-designs` - Create design
  - `PUT /api/events/:eventId/badge-designs/:id` - Update design
  - `DELETE /api/events/:eventId/badge-designs/:id` - Soft delete (prevents deleting global default)
  - `POST /api/events/:eventId/badge-designs/:id/duplicate` - Clone design
- **Design Selection Priority**: Ticket-type specific → Event default → Global default

#### 16.2 Booking System (Public-ready APIs)
- **Database**: `bookings` and `booking_items` tables
  - `bookings`: booking_code (unique), customer_name/email/phone, status (pending/confirmed/cancelled/refunded), payment_status, subtotal/tax/discount/total, currency, source (admin/website/api)
  - `booking_items`: booking_id, ticket_id, addon_id, item_type, quantity, unit_price, total_price
- **Backend APIs**:
  - `GET /api/events/:eventId/bookings` - List bookings with search/filter
  - `POST /api/events/:eventId/bookings` - Create booking with items
  - `GET /api/events/:eventId/bookings/:id` - Get booking with items
  - `POST /api/events/:eventId/bookings/:id/confirm` - Confirm and issue tickets
  - `POST /api/events/:eventId/bookings/:id/payment-status` - Update payment status
  - `POST /api/events/:eventId/bookings/:id/cancel` - Cancel booking
  - `GET /api/events/public/bookings/:bookingCode` - Public lookup by code (returns booking + tickets)

#### 16.3 Ticket Issuance with QR + Unique Code
- **Database**: `issued_tickets` table
  - `ticket_number` (unique) - TK-{timestamp}-{random}
  - `unique_code` (6-char alphanumeric, unique) - Fallback check-in code
  - `qr_payload` - Format: `{eventId}-{ticketId}-{uniqueCode}-{checksum}`
  - `holder_name/email/phone/company/job_title` - Ticket holder info
  - `badge_design_id` - FK to badge_designs (set at issuance)
  - `status` (valid/used/cancelled/expired)
  - `is_checked_in`, `checked_in_at`, `checkin_method` (qr/code/manual), `checkin_location`
- **Ticket Issuance**: On booking confirmation, issues 1 ticket per quantity per item
- **Backend APIs**:
  - `GET /api/events/:eventId/issued-tickets` - List with filters
  - `GET /api/events/:eventId/issued-tickets/:id` - Get single ticket
  - `POST /api/events/:eventId/issued-tickets` - Manual issuance
  - `POST /api/events/:eventId/issued-tickets/:id/cancel` - Cancel ticket
  - `GET /api/events/public/tickets/:code` - Public lookup by unique code

#### 16.4 Check-in Scanner Flow
- **Enhanced Scanner Dialog** (EventAttendees.tsx):
  - **QR Scanner Area**: Tap-to-open camera (mobile devices)
  - **Manual Code Entry**: Input field for 6-digit unique code or full QR payload
  - **Location Dropdown**: Main Gate, VIP Entrance, Side Entrance, Registration Desk
  - **Check In Button**: Validates and marks attendee checked in
- **Backend Check-in API**:
  - `POST /api/events/:eventId/checkin` - Accepts code (unique_code OR qr_payload)
    - Validates ticket exists and belongs to event
    - Rejects already checked-in tickets
    - Rejects cancelled/expired tickets
    - Records: is_checked_in, checked_in_at, checkin_method, checkin_location
    - Logs activity in event_activity_logs
  - `POST /api/events/:eventId/issued-tickets/:id/undo-checkin` - Revert check-in
  - `GET /api/events/:eventId/issued-tickets/stats` - Check-in statistics
    - Returns: total_issued, total_checked_in, total_not_checked_in, checkin_percentage, by_ticket_type[]
- **Test Results**: 33/33 backend API tests pass (100%), Frontend verified

### 17. Integrations Settings ✅ COMPLETE (Jan 22, 2026)
- **Database**: `integration_configs` table with event_id (nullable), integration_type, provider, config (jsonb)
- **Supported Integrations**:
  - Email: SendGrid, SMTP
  - SMS: Twilio, MessageBird
  - Maps: Google Maps
- **Provider Pattern**: Centralized IntegrationsService with getConfig(), upsertConfig(), testConnection()
- **Resolution Logic**: Event-specific settings → Global defaults fallback
- **Frontend** (`SettingsIntegrations.tsx`): Provider selection, API key inputs, enable/disable toggles, test connection buttons
- **APIs**:
  - `GET /api/events/:eventId/integrations` - Get all integrations (resolved)
  - `PUT /api/events/:eventId/integrations` - Save all integrations
  - `POST /api/events/:eventId/integrations/:configId/test` - Test connection

### 18. Data & Privacy Settings ✅ COMPLETE (Jan 22, 2026)
- **Database**: `privacy_settings` table with columns:
  - `event_id` (nullable FK) - null for global defaults
  - `gdpr_consent_enabled` (boolean) - require consent during registration
  - `privacy_policy_url` (varchar 500) - link to privacy policy
  - `custom_consent_text` (text) - optional custom GDPR consent text
  - `data_retention_days` (varchar) - '90', '180', '365', 'forever'
  - `cookie_consent_enabled` (boolean) - show cookie consent banner
  - `dpa_signed`, `dpa_signed_at` - data processing agreement fields
- **Backend Services**:
  - `PrivacySettingsService`: getSettings(), upsertEventSettings(), resetToGlobal(), getGlobalSettings()
  - `DataExportService`: exportEventDataCSV() - exports registrations, attendees, tickets, bookings
- **Resolution Logic**: Event-specific settings → Global defaults fallback (same pattern as Integrations)
- **Backend APIs**:
  - `GET /api/events/:eventId/privacy-settings` - Fetch settings (with global fallback)
  - `PUT /api/events/:eventId/privacy-settings` - Update event-specific settings
  - `POST /api/events/:eventId/privacy-settings/reset` - Reset to global defaults
  - `GET /api/events/:eventId/privacy-settings/export` - Export full event data as CSV
- **Frontend** (`SettingsDataPrivacy.tsx`):
  - **Compliance Section**: GDPR Consent toggle, Cookie Consent toggle, Privacy Policy URL input, Custom Consent Text textarea
  - **Data Retention Section**: Automatic Deletion dropdown (90/180/365/forever days), Important notice about PII scrubbing
  - **Data Export Section**: Download CSV button for full event data export
  - **Header Actions**: "Using Global Defaults" badge when applicable, Reset to Global button, Save Changes button
  - All UI elements have data-testid attributes for testing
- **Bug Fixed**: Unique constraint violation when updating settings after reset (soft-deleted records handling)
- **Test Results**: 23/23 backend API tests pass (100%), Frontend verified

### 19. Email Configuration Settings ✅ COMPLETE (Jan 22, 2026)
- **Database**: `email_templates` table with columns:
  - `event_id` (nullable FK) - null for global defaults
  - `scenario` (varchar 50) - registration_complete, payment_successful, event_reminder, event_cancelled, post_event_followup
  - `is_enabled` (boolean) - whether email is enabled for this scenario
  - `has_override` (boolean) - whether using custom template
  - `subject`, `body` (text) - template content with variable placeholders
  - `send_timing` ('immediate' | 'scheduled'), `schedule_offset`, `schedule_unit`
- **Backend Services**:
  - `EmailTemplatesService`: getEventTemplates(), saveEventTemplates(), resetToGlobal(), getResolvedTemplate()
  - `EmailSendingService`: sendEmail(), sendScenarioEmail(), sendTestEmail() - uses Integrations DB for provider config (NOT .env)
- **Resolution Logic**: Event-specific templates → Global defaults fallback (same pattern as Integrations/Privacy)
- **Email Provider Config Source**: Reads from `integration_configs` table via IntegrationsService (SendGrid or SMTP)
- **Backend APIs**:
  - `GET /api/events/:eventId/email-templates` - Fetch all scenarios with global fallback + provider status
  - `PUT /api/events/:eventId/email-templates` - Save event-specific templates
  - `POST /api/events/:eventId/email-templates/reset` - Reset to global defaults
  - `POST /api/events/:eventId/email-templates/test` - Send test email (requires provider in Integrations)
  - `GET /api/events/:eventId/email-templates/status` - Get email provider availability
- **Frontend** (`SettingsEmail.tsx`):
  - **Email Provider Status**: Shows amber warning if not configured, green status if connected
  - **5 Email Scenarios**: Registration Completed, Payment Successful, Event Reminder, Event Cancelled, Post-Event Follow-up
  - **Per-Scenario Controls**: Enabled toggle, Override toggle
  - **Override OFF**: Read-only preview of global template (subject + body)
  - **Override ON**: Editable fields - Send Timing (immediate/scheduled), Subject with variable chips, Body with variable chips
  - **Actions**: Preview (shows resolved template with sample data), Send Test (disabled if no provider)
  - **Header Actions**: Reset to Global button, Save Changes button
- **Email Variables**: {{attendee_name}}, {{event_name}}, {{event_date}}, {{event_time}}, {{venue_name}}, {{confirmation_number}}, {{organizer_name}}, {{payment_amount}}, {{transaction_id}}
- **Test Results**: 23/23 backend API tests pass (100%), Frontend verified

## Upcoming Tasks

### P1 - Data Migration (Legacy category field)
- Create migration script to populate `events.category_id` from old `events.category` text field
- Drop legacy `events.category` text column after migration

### P2 - Settings Tab (Remaining Subsections)
- Team & Permissions
- Advanced Configuration
- Archive Event, Delete Event

### P3 - Master Data Management UI
- Admin UI for CRUD operations on categories
- Admin UI for CRUD operations on tags

### P4 - Global Settings UI
- Build UI for managing global settings (Payment, Tax, Integrations, Privacy, Email Templates)
- These serve as fallback defaults for events without custom settings


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
- **URL**: https://datapolicyhub.preview.emergentagent.com
- **Email**: admin@example.com
- **Password**: admin123
- **Test Event ID**: 1 (Tech Conference 2026)

## Mocked APIs
- **File Uploads**: Uses local `/app/uploads` directory instead of AWS S3

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=https://datapolicyhub.preview.emergentagent.com
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
PREVIEW_URL=https://datapolicyhub.preview.emergentagent.com
```

## Testing

### Test Reports
- `/app/test_reports/iteration_1.json` - Latest test results
- `/app/tests/test_file_upload_api.py` - Backend API tests

### Test Credentials
- Email: admin@example.com
- Password: admin123
- API URL: https://datapolicyhub.preview.emergentagent.com

## Known Limitations
1. AWS S3 uploads are **MOCKED** - using local file storage at `/app/uploads`
2. Zoom and Google Meet integrations require API credentials for full testing
3. Email sending (SendGrid) not yet implemented
