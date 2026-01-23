# Unified Ticket Booking API Documentation

## Overview

This document describes the **UNIFIED TICKET BOOKING API** for the Event Management System.

### Single Source of Truth

All ticket booking and issuance data is stored in the **`issued_tickets`** table. This is the single source of truth for:
- Issued tickets
- Check-in status
- Payment status
- Holder information

### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    TICKET BOOKING FLOW                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  [Ticket Types]          [Issued Tickets]           [Check-in]       │
│       │                        │                        │            │
│  tickets table            issued_tickets            issued_tickets   │
│  (definitions)         (SINGLE SOURCE OF TRUTH)   (status updates)   │
│       │                        │                        │            │
│  - name                   - ticket_number          - is_checked_in   │
│  - price                  - unique_code            - checked_in_at   │
│  - quantity               - qr_payload             - checked_in_by   │
│  - sold_count             - holder_name            - status          │
│                           - holder_email                             │
│                           - payment_status                           │
│                           - unit_price                               │
│                                                                      │
│  Ticket booking rules remain in: event_settings table                │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Storage

| Table | Purpose | Status |
|-------|---------|--------|
| `tickets` | Ticket type definitions (name, price, capacity) | ACTIVE - definitions only |
| `issued_tickets` | **ALL** issued ticket records | **SINGLE SOURCE OF TRUTH** |
| `ticket_sales` | DEPRECATED - historical data only | DEPRECATED |
| `event_settings` | Ticket booking rules and configuration | ACTIVE - rules only |

---

## API Endpoints

### Base URL
```
/api/events/:eventId
```

---

## 1. Ticket Issuance

### Issue a Single Ticket
```http
POST /api/events/:eventId/issued-tickets/issue
Content-Type: application/json

{
  "holder_name": "John Doe",           // Required
  "holder_email": "john@example.com",  // Optional
  "holder_phone": "+1-555-123-4567",   // Optional
  "ticket_type_id": 1,                 // Optional - link to ticket type
  "unit_price": 99.99,                 // Optional - captured price
  "payment_status": "completed",       // "pending" | "completed" | "refunded" | "failed"
  "payment_method": "credit_card",     // Optional
  "payment_reference": "TXN-123456",   // Optional
  "order_reference": "ORD-001",        // Optional - external order ID
  "notes": "VIP Guest"                 // Optional
}
```

**Response (201 Created):**
```json
{
  "message": "Ticket issued successfully",
  "ticket": {
    "id": 1,
    "ticket_number": "TK-ABC123-XYZ",
    "unique_code": "A1B2C3",
    "event_id": 1,
    "holder_name": "John Doe",
    "holder_email": "john@example.com",
    "qr_payload": "1-0-A1B2C3-1234567890",
    "qr_image_url": "/uploads/qr-codes/qr_TK_ABC123_XYZ.png",
    "status": "valid",
    "is_checked_in": false,
    "payment_status": "completed",
    "unit_price": 99.99,
    "total_price": 99.99,
    "currency": "USD",
    "created_at": "2026-01-23T10:00:00.000Z"
  }
}
```

### Issue Tickets for a Booking (Batch)
```http
POST /api/events/:eventId/bookings/:bookingId/issue-tickets
Content-Type: application/json

{
  "items": [
    {
      "ticket_type_id": 1,
      "quantity": 2,
      "unit_price": 99.99,
      "holder_name": "John Doe",
      "holder_email": "john@example.com"
    },
    {
      "ticket_type_id": 2,
      "quantity": 1,
      "unit_price": 149.99,
      "holder_name": "Jane Smith",
      "holder_email": "jane@example.com"
    }
  ],
  "payment_status": "completed"
}
```

**Response (201 Created):**
```json
{
  "message": "3 tickets issued successfully",
  "tickets": [
    { "id": 1, "ticket_number": "TK-...", "holder_name": "John Doe", ... },
    { "id": 2, "ticket_number": "TK-...", "holder_name": "John Doe", ... },
    { "id": 3, "ticket_number": "TK-...", "holder_name": "Jane Smith", ... }
  ]
}
```

---

## 2. Ticket Lookup

### Get All Tickets for an Event
```http
GET /api/events/:eventId/issued-tickets?page=1&limit=50&status=valid&search=john&checked_in=false
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 50) |
| status | string | Filter by status: pending, valid, used, cancelled, expired |
| search | string | Search in holder_name, holder_email, ticket_number, unique_code |
| checked_in | boolean | Filter by check-in status |

**Response (200 OK):**
```json
{
  "tickets": [
    {
      "id": 1,
      "ticket_number": "TK-ABC123-XYZ",
      "unique_code": "A1B2C3",
      "holder_name": "John Doe",
      "holder_email": "john@example.com",
      "status": "valid",
      "is_checked_in": false,
      "event_name": "Tech Conference 2026",
      "ticket_type_name": "VIP Pass",
      "booking_code": "BK-123"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 50
}
```

### Get Ticket by ID
```http
GET /api/events/:eventId/issued-tickets/:ticketId
```

### Get Ticket by Unique Code
```http
GET /api/events/:eventId/issued-tickets/code/:code
```

### Get Tickets for a Booking
```http
GET /api/events/:eventId/bookings/:bookingId/issued-tickets
```

---

## 3. Check-in

### Check In a Ticket
```http
POST /api/events/:eventId/checkin
Content-Type: application/json

{
  "unique_code": "A1B2C3",           // Use unique_code OR qr_payload
  "qr_payload": "1-0-A1B2C3-123...", // Full QR payload
  "checked_in_by": "staff@event.com" // Optional - who checked in
}
```

**Response (200 OK - Success):**
```json
{
  "success": true,
  "ticket": {
    "id": 1,
    "ticket_number": "TK-ABC123-XYZ",
    "holder_name": "John Doe",
    "status": "used",
    "is_checked_in": true,
    "checked_in_at": "2026-01-23T10:30:00.000Z",
    "checked_in_by": "staff@event.com"
  },
  "message": "Successfully checked in: John Doe"
}
```

**Response (409 Conflict - Already Checked In):**
```json
{
  "success": false,
  "ticket": { ... },
  "message": "Ticket already checked in at 2026-01-23T10:30:00.000Z",
  "already_checked_in": true
}
```

**Response (400 Bad Request - Invalid Status):**
```json
{
  "success": false,
  "ticket": { ... },
  "message": "Ticket status is 'cancelled'. Only valid tickets can be checked in."
}
```

### Undo Check-in
```http
POST /api/events/:eventId/issued-tickets/:ticketId/undo-checkin
```

**Response (200 OK):**
```json
{
  "message": "Check-in undone successfully",
  "ticket": {
    "id": 1,
    "is_checked_in": false,
    "checked_in_at": null,
    "status": "valid"
  }
}
```

---

## 4. Ticket Management

### Update Ticket
```http
PUT /api/events/:eventId/issued-tickets/:ticketId
Content-Type: application/json

{
  "holder_name": "John Smith",
  "holder_email": "john.smith@example.com",
  "holder_phone": "+1-555-999-8888",
  "status": "valid",
  "payment_status": "completed",
  "notes": "Updated notes"
}
```

### Cancel Ticket
```http
POST /api/events/:eventId/issued-tickets/:ticketId/cancel
Content-Type: application/json

{
  "reason": "Customer requested refund"  // Optional
}
```

### Confirm Payment
```http
POST /api/events/:eventId/issued-tickets/:ticketId/confirm-payment
Content-Type: application/json

{
  "payment_reference": "TXN-123456"  // Optional
}
```

### Delete Ticket (Soft Delete)
```http
DELETE /api/events/:eventId/issued-tickets/:ticketId
```

---

## 5. Statistics

### Get Ticket Statistics
```http
GET /api/events/:eventId/issued-tickets/stats
```

**Response (200 OK):**
```json
{
  "total_issued": 150,
  "total_checked_in": 75,
  "total_pending": 10,
  "total_valid": 60,
  "total_cancelled": 5,
  "total_expired": 0,
  "total_revenue": 14925.50
}
```

---

## Data Models

### IssuedTicket
```typescript
interface IssuedTicket {
  id: number;
  ticket_number: string;      // Format: "TK-{timestamp}-{random}"
  unique_code: string;        // 6-character alphanumeric code
  event_id: number;
  booking_id: number | null;
  registration_id: number | null;
  ticket_type_id: number | null;
  
  // Holder Information
  holder_name: string;
  holder_email: string | null;
  holder_phone: string | null;
  
  // QR Code
  qr_payload: string;         // "{eventId}-{bookingId}-{uniqueCode}-{timestamp}"
  qr_image_url: string | null;
  
  // Status
  status: 'pending' | 'valid' | 'used' | 'cancelled' | 'expired' | 'revoked';
  is_checked_in: boolean;
  checked_in_at: string | null;
  checked_in_by: string | null;
  
  // Pricing
  unit_price: number | null;
  total_price: number | null;
  currency: string;           // Default: "USD"
  quantity: number;           // Default: 1
  
  // Payment
  payment_status: 'pending' | 'completed' | 'refunded' | 'failed';
  payment_method: string | null;
  payment_reference: string | null;
  order_reference: string | null;
  
  // Metadata
  notes: string | null;
  expires_at: string | null;
  is_transferable: boolean;
  metadata: object;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}
```

### Ticket Status Flow
```
  ┌──────────┐    Payment     ┌───────┐    Check-in    ┌──────┐
  │ pending  │ ─────────────> │ valid │ ─────────────> │ used │
  └──────────┘                └───────┘                └──────┘
       │                           │
       │ Cancel                    │ Cancel/Expire
       v                           v
  ┌───────────┐               ┌───────────┐
  │ cancelled │               │ cancelled │
  └───────────┘               │ expired   │
                              └───────────┘
```

---

## Complete Booking Flow

### Step 1: Customer Selects Tickets
Frontend displays ticket types from `GET /api/events/:eventId/tickets`

### Step 2: Create Booking
```http
POST /api/events/:eventId/bookings
{
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "items": [
    { "ticket_type_id": 1, "quantity": 2 }
  ]
}
```

### Step 3: Process Payment
Payment is handled externally or via payment gateway

### Step 4: Issue Tickets
After payment confirmation:
```http
POST /api/events/:eventId/bookings/:bookingId/issue-tickets
{
  "items": [...],
  "payment_status": "completed"
}
```

### Step 5: Event Day - Check-in
Staff scans QR code or enters unique code:
```http
POST /api/events/:eventId/checkin
{
  "unique_code": "A1B2C3"
}
```

---

## Migration Notes

### Deprecated Tables
- `ticket_sales` - No longer written to. Historical data retained.

### Column Changes
The `issued_tickets` table now includes:
- `registration_id` - Links to event_registrations
- `unit_price`, `total_price`, `currency` - Pricing captured at issuance
- `payment_status`, `payment_method`, `payment_reference` - Payment info
- `order_reference` - External order tracking
- `checked_in_by` - Who performed check-in
- `expires_at`, `is_transferable` - Ticket lifecycle

### Indexes Added
- `idx_issued_tickets_registration_id`
- `idx_issued_tickets_payment_status`
- `idx_issued_tickets_order_reference`
- `idx_issued_tickets_expires_at`
- `idx_issued_tickets_unique_code_unique` (unique index)

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Invalid request (missing required fields) |
| 404 | Ticket not found |
| 409 | Conflict (e.g., already checked in) |
| 500 | Internal server error |

---

## Testing

### Test Credentials
- Email: `admin@example.com`
- Password: `admin123`

### Test Flow
1. Create event: `POST /api/events`
2. Issue ticket: `POST /api/events/:id/issued-tickets/issue`
3. Get tickets: `GET /api/events/:id/issued-tickets`
4. Check in: `POST /api/events/:id/checkin`
5. Get stats: `GET /api/events/:id/issued-tickets/stats`
