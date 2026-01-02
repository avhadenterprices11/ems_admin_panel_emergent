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

## Completed Work (January 2, 2026)

### Session Accomplishments
1. ✅ Converted backend from PostgreSQL/Knex to MongoDB
2. ✅ Implemented complete file upload system with:
   - Reusable FileUpload.tsx component
   - Backend S3 service with local storage fallback
   - Single and multiple file upload endpoints
   - File preview functionality
   - Proper URL generation for uploaded files
3. ✅ Fixed Events API pagination (string to number conversion)
4. ✅ Fixed Vite allowedHosts configuration
5. ✅ Added missing zod dependency
6. ✅ All tests passing (100% backend, 100% frontend)

## Upcoming Tasks

### P1 - High Priority
1. Edit Event Page - UI and backend logic to edit existing events
2. Event Detail Page - Read-only view of event details
3. AWS S3 Production Configuration - Add real AWS credentials

### P2 - Medium Priority
4. Master Data Management - CRUD for event_categories, event_tags
5. Virtual Platform Integration Testing - Verify Zoom/Google Meet APIs with real credentials

### P3 - Low Priority / Future
6. Email Sending - Implement SendGrid integration
7. User Roles and Permissions - Extend auth for different roles
8. Event Cloning - Duplicate existing events
9. Analytics Dashboard - Event performance metrics

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=https://eventmanager-18.preview.emergentagent.com
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
PREVIEW_URL=https://eventmanager-18.preview.emergentagent.com
```

## Testing

### Test Reports
- `/app/test_reports/iteration_1.json` - Latest test results
- `/app/tests/test_file_upload_api.py` - Backend API tests

### Test Credentials
- Email: admin@example.com
- Password: admin123
- API URL: https://eventmanager-18.preview.emergentagent.com

## Known Limitations
1. AWS S3 uploads are **MOCKED** - using local file storage at `/app/uploads`
2. Zoom and Google Meet integrations require API credentials for full testing
3. Email sending (SendGrid) not yet implemented
