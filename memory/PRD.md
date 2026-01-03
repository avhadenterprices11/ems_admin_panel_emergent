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

### event_registrations (NEW - Jan 2, 2026)
- id (bigint), event_id, user_id, status, registration_source, payment_status, total_amount, currency, metadata, created_at, updated_at, is_deleted

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
1. Event Detail Page - Remaining tabs (Registrations, Attendees & Check-in, Communications, Reports, Settings)
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

### Test Credentials
- **URL**: https://eventpanel-3.preview.emergentagent.com
- **Email**: admin@example.com
- **Password**: admin123
- **Test Event ID**: 1 (Tech Conference 2026)

## Mocked APIs
- **File Uploads**: Uses local `/app/uploads` directory instead of AWS S3
9. Analytics Dashboard - Event performance metrics

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=https://eventpanel-3.preview.emergentagent.com
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
PREVIEW_URL=https://eventpanel-3.preview.emergentagent.com
```

## Testing

### Test Reports
- `/app/test_reports/iteration_1.json` - Latest test results
- `/app/tests/test_file_upload_api.py` - Backend API tests

### Test Credentials
- Email: admin@example.com
- Password: admin123
- API URL: https://eventpanel-3.preview.emergentagent.com

## Known Limitations
1. AWS S3 uploads are **MOCKED** - using local file storage at `/app/uploads`
2. Zoom and Google Meet integrations require API credentials for full testing
3. Email sending (SendGrid) not yet implemented
