# Ticket Booking, Issuance & Check-in API Documentation

## Base URL
```
https://eventsphere-20.preview.emergentagent.com/api
```

## Authentication
All endpoints require JWT authentication (except public endpoints).

**Login to get token:**
```bash
curl -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "Bearer"
}
```

**Use token in subsequent requests:**
```
Authorization: Bearer <token>
```

---

## 1. BOOKING APIs

### 1.1 Create Booking
Creates a new booking/order with ticket items.

**Endpoint:** `POST /events/:eventId/bookings`

**Request:**
```json
{
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "+1234567890",
  "payment_method": "stripe",
  "promo_code": null,
  "source": "website",
  "items": [
    {
      "ticket_id": 1,
      "item_type": "ticket",
      "item_name": "VIP Pass",
      "quantity": 2,
      "unit_price": 299.00
    },
    {
      "ticket_id": 2,
      "item_type": "ticket", 
      "item_name": "Regular",
      "quantity": 1,
      "unit_price": 99.00
    }
  ]
}
```

**Response (201):**
```json
{
  "id": "1",
  "booking_code": "BK-ABC12345",
  "event_id": 1,
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "+1234567890",
  "status": "pending",
  "payment_status": "pending",
  "payment_method": "stripe",
  "subtotal": "697.00",
  "tax_amount": "0.00",
  "discount_amount": "0.00",
  "total_amount": "697.00",
  "currency": "USD",
  "source": "website",
  "booked_at": "2026-01-22T09:00:00.000Z",
  "items": [
    {
      "id": "1",
      "booking_id": "1",
      "ticket_id": "1",
      "item_type": "ticket",
      "item_name": "VIP Pass",
      "quantity": 2,
      "unit_price": "299.00",
      "total_price": "598.00"
    },
    {
      "id": "2",
      "booking_id": "1", 
      "ticket_id": "2",
      "item_type": "ticket",
      "item_name": "Regular",
      "quantity": 1,
      "unit_price": "99.00",
      "total_price": "99.00"
    }
  ]
}
```

---

### 1.2 Confirm Booking & Issue Tickets
Confirms booking and automatically issues tickets with QR codes, unique codes, and **QR code images**.

**Endpoint:** `POST /events/:eventId/bookings/:bookingId/confirm`

**Response (200):**
```json
{
  "booking": {
    "id": "1",
    "booking_code": "BK-ABC12345",
    "status": "confirmed",
    "payment_status": "pending",
    "confirmed_at": "2026-01-22T09:05:00.000Z"
  },
  "tickets": [
    {
      "id": "1",
      "ticket_number": "TK-MKP98Z1V-4QYS",
      "unique_code": "F7B12A",
      "qr_payload": "1-1-F7B12A-80BY",
      "qr_image_url": "https://eventsphere-20.preview.emergentagent.com/api/uploads/qr-codes/TK-MKP98Z1V-4QYS.png",
      "holder_name": "John Doe",
      "holder_email": "john@example.com",
      "status": "valid",
      "is_checked_in": false,
      "ticket_type_name": "VIP Pass"
    }
      "id": "1",
      "ticket_number": "TK-M8XYZ1-A2B3",
      "unique_code": "V8KWUS",
      "qr_payload": "1-1-V8KWUS-ABC1",
      "holder_name": "John Doe",
      "holder_email": "john@example.com",
      "status": "valid",
      "is_checked_in": false,
      "ticket_type_name": "VIP Pass"
    },
    {
      "id": "2",
      "ticket_number": "TK-M8XYZ2-C4D5",
      "unique_code": "RPLQKY",
      "qr_payload": "1-2-RPLQKY-DEF2",
      "holder_name": "John Doe",
      "holder_email": "john@example.com",
      "status": "valid",
      "is_checked_in": false,
      "ticket_type_name": "VIP Pass"
    },
    {
      "id": "3",
      "ticket_number": "TK-M8XYZ3-E6F7",
      "unique_code": "L58E0N",
      "qr_payload": "1-3-L58E0N-GHI3",
      "holder_name": "John Doe",
      "holder_email": "john@example.com",
      "status": "valid",
      "is_checked_in": false,
      "ticket_type_name": "Regular"
    }
  ],
  "message": "Booking confirmed and 3 ticket(s) issued"
}
```

**Key Fields Explained:**
- `unique_code`: 6-character alphanumeric code for manual check-in (e.g., "V8KWUS")
- `qr_payload`: Encoded string for QR code generation. Format: `{eventId}-{ticketId}-{uniqueCode}-{checksum}`
- `ticket_number`: Human-readable ticket reference

---

### 1.3 Get Booking by Code (Public API)
Retrieves booking details and issued tickets. No authentication required.

**Endpoint:** `GET /events/public/bookings/:bookingCode`

**Example:** `GET /events/public/bookings/BK-ABC12345`

**Response (200):**
```json
{
  "booking": {
    "id": "1",
    "booking_code": "BK-ABC12345",
    "event_id": 1,
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "status": "confirmed",
    "total_amount": "697.00",
    "event_name": "Tech Conference 2026"
  },
  "tickets": [
    {
      "id": "1",
      "ticket_number": "TK-M8XYZ1-A2B3",
      "unique_code": "V8KWUS",
      "qr_payload": "1-1-V8KWUS-ABC1",
      "holder_name": "John Doe",
      "status": "valid",
      "is_checked_in": false,
      "ticket_type_name": "VIP Pass"
    }
  ]
}
```

---

## 2. ISSUED TICKETS APIs

### 2.1 Get Issued Tickets List
Lists all issued tickets for an event with filters.

**Endpoint:** `GET /events/:eventId/issued-tickets`

**Query Parameters:**
- `booking_id` - Filter by booking
- `status` - Filter by status (valid/used/cancelled/expired)
- `is_checked_in` - Filter by check-in status (true/false)
- `search` - Search by ticket number, unique code, or holder name
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Example:** `GET /events/1/issued-tickets?is_checked_in=false&limit=50`

**Response (200):**
```json
{
  "tickets": [
    {
      "id": "1",
      "ticket_number": "TK-M8XYZ1-A2B3",
      "unique_code": "V8KWUS",
      "qr_payload": "1-1-V8KWUS-ABC1",
      "event_id": 1,
      "booking_id": "1",
      "holder_name": "John Doe",
      "holder_email": "john@example.com",
      "status": "valid",
      "is_checked_in": false,
      "checked_in_at": null,
      "ticket_type_name": "VIP Pass",
      "booking_code": "BK-ABC12345"
    }
  ],
  "total": 3,
  "page": 1,
  "limit": 50
}
```

---

### 2.2 Get Issued Ticket by Unique Code (Public API)
Retrieves ticket by 6-character unique code. No authentication required.

**Endpoint:** `GET /events/public/tickets/:code`

**Example:** `GET /events/public/tickets/V8KWUS`

**Response (200):**
```json
{
  "id": "1",
  "ticket_number": "TK-M8XYZ1-A2B3",
  "unique_code": "V8KWUS",
  "qr_payload": "1-1-V8KWUS-ABC1",
  "holder_name": "John Doe",
  "status": "valid",
  "is_checked_in": false,
  "ticket_type_name": "VIP Pass",
  "event_name": "Tech Conference 2026"
}
```

---

## 3. CHECK-IN APIs

### 3.1 Check-in by Code (QR or Unique Code)
Validates and marks attendee as checked in. Supports both QR payload and 6-digit unique code.

**Endpoint:** `POST /events/:eventId/checkin`

**Request (using 6-digit unique code):**
```json
{
  "code": "V8KWUS",
  "location": "Main Gate",
  "device_name": "Scanner 1"
}
```

**Request (using QR payload):**
```json
{
  "code": "1-1-V8KWUS-ABC1",
  "location": "VIP Entrance",
  "device_name": "Scanner 2"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Check-in successful",
  "ticket": {
    "id": "1",
    "ticket_number": "TK-M8XYZ1-A2B3",
    "unique_code": "V8KWUS",
    "holder_name": "John Doe",
    "status": "used",
    "is_checked_in": true,
    "checked_in_at": "2026-01-22T10:30:00.000Z",
    "checkin_method": "code",
    "checkin_location": "Main Gate",
    "ticket_type_name": "VIP Pass"
  }
}
```

**Error Responses:**

**Already checked in (400):**
```json
{
  "success": false,
  "message": "Already checked in at 1/22/2026, 10:30:00 AM",
  "ticket": { ... }
}
```

**Invalid code (400):**
```json
{
  "success": false,
  "message": "Invalid ticket code or QR code"
}
```

**Cancelled ticket (400):**
```json
{
  "success": false,
  "message": "This ticket has been cancelled"
}
```

---

### 3.2 Undo Check-in
Reverts a check-in (admin only).

**Endpoint:** `POST /events/:eventId/issued-tickets/:ticketId/undo-checkin`

**Response (200):**
```json
{
  "success": true,
  "message": "Check-in undone successfully",
  "ticket": {
    "id": "1",
    "is_checked_in": false,
    "checked_in_at": null,
    "checkin_method": null,
    "status": "valid"
  }
}
```

---

### 3.3 Get Check-in Statistics
Returns check-in metrics for an event.

**Endpoint:** `GET /events/:eventId/issued-tickets/stats`

**Response (200):**
```json
{
  "total_issued": 3,
  "total_checked_in": 1,
  "total_not_checked_in": 2,
  "checkin_percentage": 33.33,
  "by_ticket_type": [
    {
      "ticket_type": "VIP Pass",
      "checked_in": 1,
      "total": 2
    },
    {
      "ticket_type": "Regular",
      "checked_in": 0,
      "total": 1
    }
  ]
}
```

---

## 4. QR CODE GENERATION

### QR Payload Format
The `qr_payload` field contains an encoded string that should be converted to a QR code image:

```
{eventId}-{ticketId}-{uniqueCode}-{checksum}
```

**Example:** `1-1-V8KWUS-ABC1`

### Generating QR Code Image
Use any QR code library to convert the `qr_payload` to an image:

**JavaScript (qrcode.js):**
```javascript
import QRCode from 'qrcode';

const qrPayload = "1-1-V8KWUS-ABC1";
const qrImageDataUrl = await QRCode.toDataURL(qrPayload);
// Use qrImageDataUrl in an <img> tag
```

**React:**
```jsx
import { QRCodeSVG } from 'qrcode.react';

<QRCodeSVG value={ticket.qr_payload} size={200} />
```

---

## 5. TESTING GUIDE

### Step 1: Create a Booking
```bash
API_URL="https://eventsphere-20.preview.emergentagent.com"
TOKEN="your-jwt-token"

curl -X POST "$API_URL/api/events/1/bookings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "customer_name": "Test User",
    "customer_email": "test@example.com",
    "items": [
      {"ticket_id": 1, "item_type": "ticket", "item_name": "VIP Pass", "quantity": 1, "unit_price": 299}
    ]
  }'
```

### Step 2: Confirm Booking & Issue Tickets
```bash
curl -X POST "$API_URL/api/events/1/bookings/1/confirm" \
  -H "Authorization: Bearer $TOKEN"
```

### Step 3: Get Issued Tickets
```bash
curl "$API_URL/api/events/1/issued-tickets" \
  -H "Authorization: Bearer $TOKEN"
```
Save the `unique_code` (e.g., "V8KWUS") and `qr_payload` from the response.

### Step 4: Test Check-in with Unique Code
```bash
curl -X POST "$API_URL/api/events/1/checkin" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"code": "V8KWUS", "location": "Main Gate"}'
```

### Step 5: Verify Check-in Fails for Same Ticket
```bash
curl -X POST "$API_URL/api/events/1/checkin" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"code": "V8KWUS"}'
# Should return: "Already checked in at..."
```

### Step 6: Undo Check-in
```bash
curl -X POST "$API_URL/api/events/1/issued-tickets/1/undo-checkin" \
  -H "Authorization: Bearer $TOKEN"
```

### Step 7: Test Check-in with QR Payload
```bash
curl -X POST "$API_URL/api/events/1/checkin" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"code": "1-1-V8KWUS-ABC1", "location": "VIP Entrance"}'
```

### Step 8: Get Check-in Stats
```bash
curl "$API_URL/api/events/1/issued-tickets/stats" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 6. BADGE DESIGN APIs

### 6.1 Get Badge Designs for Event
```
GET /events/:eventId/badge-designs
```

### 6.2 Create Badge Design
```
POST /events/:eventId/badge-designs
{
  "name": "VIP Badge",
  "ticket_type_id": 1,
  "is_event_default": false,
  "badge_size": "a6",
  "orientation": "portrait",
  "design_config": {
    "visible_fields": ["full_name", "ticket_type", "company", "qr_code"],
    "primary_color": "#1e40af",
    "secondary_color": "#60a5fa",
    "qr_code_size": 80
  }
}
```

### 6.3 Get Design for Ticket (Selection Priority)
```
GET /events/:eventId/badge-designs/for-ticket?ticket_type_id=1
```
Returns the appropriate design based on priority:
1. Ticket-type specific design
2. Event default design
3. Global default design

---

## Error Codes

| Status | Description |
|--------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error, already checked in, invalid code) |
| 401 | Unauthorized (missing/invalid token) |
| 404 | Not Found |
| 500 | Server Error |
