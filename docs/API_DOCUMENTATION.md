# Event Management System - Backend API Documentation

**Version:** 1.0  
**Base URL:** `https://your-domain.com/api`  
**Last Updated:** January 2026

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Events](#2-events)
3. [Event Overview](#3-event-overview)
4. [Tickets](#4-tickets)
5. [Add-ons](#5-add-ons)
6. [Promo Codes](#6-promo-codes)
7. [Event Settings](#7-event-settings)
8. [Registrations](#8-registrations)
9. [Attendees & Check-in](#9-attendees--check-in)
10. [Campaigns](#10-campaigns)
11. [Templates](#11-templates)
12. [Audience Segments](#12-audience-segments)
13. [Communication Settings](#13-communication-settings)
14. [Reports](#14-reports)
15. [Saved Views](#15-saved-views)
16. [File Upload](#16-file-upload)

---

## Authentication Headers

All protected endpoints require the following header:

```
Authorization: Bearer <jwt_token>
```

---

## Standard Response Formats

### Success Response
```json
{
  "data": { ... },
  "message": "Success message (optional)"
}
```

### Error Response
```json
{
  "message": "Error description",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

### Paginated Response
```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "totalRecords": 100,
    "totalPages": 10
  }
}
```

---

## 1. Authentication

### 1.1 Login

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/auth/login` |
| **Auth Required** | No |

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password_hash": "your_password"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer"
}
```

**Error Response (401):**
```json
{
  "message": "Invalid credentials"
}
```

---

### 1.2 Logout

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/auth/logout` |
| **Auth Required** | Yes |

**Success Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

### 1.3 Validate Token

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/auth/validate` |
| **Auth Required** | Yes |

**Success Response (200):**
```json
{
  "valid": true,
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "admin"
  }
}
```

**Error Response (401):**
```json
{
  "valid": false,
  "message": "Invalid or expired token"
}
```

---

## 2. Events

### 2.1 List Events

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/events` |
| **Auth Required** | Yes |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | No | Page number (default: 1) |
| `pageSize` | number | No | Items per page (default: 10) |
| `search` | string | No | Search by event name |
| `status` | string | No | Filter by status (draft, published, cancelled, completed) |
| `type` | string | No | Filter by event type |
| `startDate` | string | No | Filter by start date (ISO format) |
| `endDate` | string | No | Filter by end date (ISO format) |
| `sortBy` | string | No | Sort field (name, start_date, created_at) |
| `sortOrder` | string | No | Sort direction (asc, desc) |

**Success Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "event_code": "EVT-2025-001",
      "name": "Tech Conference 2025",
      "type": "conference",
      "status": "published",
      "start_date": "2025-03-15T09:00:00Z",
      "end_date": "2025-03-17T18:00:00Z",
      "location": "New York, NY",
      "description": "Annual technology conference",
      "category": "Technology",
      "owner": "Admin User",
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "totalRecords": 50,
    "totalPages": 5
  }
}
```

---

### 2.2 Create Event

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/events` |
| **Auth Required** | Yes |

**Request Body:**
```json
{
  "name": "Tech Conference 2025",
  "type": "conference",
  "description": "Annual technology conference",
  "start_date": "2025-03-15T09:00:00Z",
  "end_date": "2025-03-17T18:00:00Z",
  "location": "New York, NY",
  "category": "Technology",
  "status": "draft"
}
```

**Success Response (201):**
```json
{
  "id": 1,
  "event_code": "EVT-2025-001",
  "name": "Tech Conference 2025",
  "type": "conference",
  "status": "draft",
  "start_date": "2025-03-15T09:00:00Z",
  "end_date": "2025-03-17T18:00:00Z",
  "location": "New York, NY",
  "created_at": "2025-01-01T00:00:00Z"
}
```

---

### 2.3 Get Event Metrics

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/events/metrics` |
| **Auth Required** | Yes |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `dateRange` | string | No | Time period (7d, 30d, 90d, all) |

**Success Response (200):**
```json
{
  "totalEvents": 50,
  "activeEvents": 12,
  "upcomingEvents": 8,
  "completedEvents": 30,
  "totalRevenue": 125000.00,
  "totalRegistrations": 5000
}
```

---

### 2.4 Bulk Archive Events

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/events/bulk-archive` |
| **Auth Required** | Yes |

**Request Body:**
```json
{
  "eventIds": [1, 2, 3]
}
```

**Success Response (200):**
```json
{
  "message": "3 events archived successfully",
  "archivedCount": 3
}
```

---

### 2.5 Bulk Delete Events

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/events/bulk-delete` |
| **Auth Required** | Yes |

**Request Body:**
```json
{
  "eventIds": [1, 2, 3]
}
```

**Success Response (200):**
```json
{
  "message": "3 events deleted successfully",
  "deletedCount": 3
}
```

---

## 3. Event Overview

### 3.1 Get Event by ID

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/events/{eventId}` |
| **Auth Required** | Yes |

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `eventId` | number | Event ID |

**Success Response (200):**
```json
{
  "id": 1,
  "event_code": "EVT-2025-001",
  "name": "Tech Conference 2025",
  "type": "conference",
  "status": "published",
  "start_date": "2025-03-15T09:00:00Z",
  "end_date": "2025-03-17T18:00:00Z",
  "location": "New York, NY",
  "description": "Annual technology conference",
  "category": "Technology",
  "owner": "Admin User",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

---

### 3.2 Get Event Metrics

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/events/{eventId}/overview/metrics` |
| **Auth Required** | Yes |

**Success Response (200):**
```json
{
  "totalRevenue": 25000.00,
  "ticketsSold": 250,
  "totalRegistrations": 250,
  "checkInRate": 85.5,
  "revenueChange": 15.2,
  "ticketsChange": 10.5,
  "registrationsChange": 12.0,
  "checkInChange": 5.0
}
```

---

### 3.3 Get Registration Funnel

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/events/{eventId}/overview/funnel` |
| **Auth Required** | Yes |

**Success Response (200):**
```json
{
  "pageViews": 5000,
  "registrationStarts": 800,
  "registrationCompletes": 500,
  "payments": 450,
  "conversionRate": 9.0
}
```

---

### 3.4 Get Ticket Inventory

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/events/{eventId}/overview/tickets` |
| **Auth Required** | Yes |

**Success Response (200):**
```json
{
  "tickets": [
    {
      "id": 1,
      "name": "General Admission",
      "sold": 250,
      "capacity": 500,
      "remaining": 250,
      "percentSold": 50.0
    }
  ],
  "totalSold": 250,
  "totalCapacity": 500
}
```

---

### 3.5 Get Alerts

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/events/{eventId}/overview/alerts` |
| **Auth Required** | Yes |

**Success Response (200):**
```json
{
  "alerts": [
    {
      "id": "alert_1",
      "type": "warning",
      "title": "Low Ticket Inventory",
      "message": "VIP tickets are 90% sold out",
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

---

### 3.6 Get Activity Timeline

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/events/{eventId}/overview/activity` |
| **Auth Required** | Yes |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | number | No | Number of activities (default: 10) |

**Success Response (200):**
```json
{
  "activities": [
    {
      "id": 1,
      "type": "registration",
      "description": "New registration from john@example.com",
      "timestamp": "2025-01-15T10:30:00Z",
      "user": "John Doe"
    }
  ]
}
```

---

## 4. Tickets

### 4.1 Get All Tickets

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/events/{eventId}/tickets` |
| **Auth Required** | Yes |

**Success Response (200):**
```json
[
  {
    "id": 1,
    "event_id": 1,
    "name": "General Admission",
    "description": "Standard entry ticket",
    "price": 100.00,
    "currency": "USD",
    "capacity": 500,
    "sold_count": 250,
    "status": "on_sale",
    "sale_start_date": "2025-01-01T00:00:00Z",
    "sale_end_date": "2025-03-14T23:59:59Z",
    "min_per_order": 1,
    "max_per_order": 10,
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

---

### 4.2 Get Ticket Stats

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/events/{eventId}/tickets/stats` |
| **Auth Required** | Yes |

**Success Response (200):**
```json
{
  "totalTicketTypes": 3,
  "totalCapacity": 1000,
  "totalSold": 450,
  "totalRevenue": 45000.00,
  "averagePrice": 100.00
}
```

---

### 4.3 Create Ticket

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/events/{eventId}/tickets` |
| **Auth Required** | Yes |

**Request Body:**
```json
{
  "name": "VIP Access",
  "description": "VIP entry with premium benefits",
  "price": 250.00,
  "currency": "USD",
  "capacity": 100,
  "status": "on_sale",
  "sale_start_date": "2025-01-01T00:00:00Z",
  "sale_end_date": "2025-03-14T23:59:59Z",
  "min_per_order": 1,
  "max_per_order": 5,
  "ticket_type": "paid",
  "visibility": "public"
}
```

**Success Response (201):**
```json
{
  "id": 2,
  "event_id": 1,
  "name": "VIP Access",
  "price": 250.00,
  "capacity": 100,
  "sold_count": 0,
  "status": "on_sale",
  "created_at": "2025-01-15T10:00:00Z"
}
```

---

### 4.4 Get Ticket by ID

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/events/{eventId}/tickets/{ticketId}` |
| **Auth Required** | Yes |

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `eventId` | number | Event ID |
| `ticketId` | number | Ticket ID |

---

### 4.5 Update Ticket

| Property | Value |
|----------|-------|
| **Method** | `PUT` |
| **Endpoint** | `/events/{eventId}/tickets/{ticketId}` |
| **Auth Required** | Yes |

**Request Body:**
```json
{
  "name": "VIP Access (Updated)",
  "price": 275.00,
  "capacity": 150
}
```

---

### 4.6 Delete Ticket

| Property | Value |
|----------|-------|
| **Method** | `DELETE` |
| **Endpoint** | `/events/{eventId}/tickets/{ticketId}` |
| **Auth Required** | Yes |

**Success Response (200):**
```json
{
  "message": "Ticket deleted successfully"
}
```

---

### 4.7 Toggle Ticket Sales

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/events/{eventId}/tickets/{ticketId}/toggle-sales` |
| **Auth Required** | Yes |

**Success Response (200):**
```json
{
  "id": 1,
  "status": "paused",
  "message": "Ticket sales paused"
}
```

---

### 4.8 End Ticket Sales

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/events/{eventId}/tickets/{ticketId}/end-sales` |
| **Auth Required** | Yes |

---

### 4.9 Duplicate Ticket

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/events/{eventId}/tickets/{ticketId}/duplicate` |
| **Auth Required** | Yes |

**Success Response (201):**
```json
{
  "id": 3,
  "name": "VIP Access (Copy)",
  "message": "Ticket duplicated successfully"
}
```

---

## 5. Add-ons

### 5.1 Get All Add-ons

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/events/{eventId}/addons` |
| **Auth Required** | Yes |

**Success Response (200):**
```json
[
  {
    "id": 1,
    "event_id": 1,
    "name": "Workshop Access",
    "description": "Access to all workshops",
    "price": 50.00,
    "capacity": 200,
    "sold_count": 50,
    "status": "active",
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

---

### 5.2 Create Add-on

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/events/{eventId}/addons` |
| **Auth Required** | Yes |

**Request Body:**
```json
{
  "name": "Parking Pass",
  "description": "Reserved parking spot",
  "price": 25.00,
  "capacity": 100,
  "status": "active"
}
```

---

### 5.3 Get Add-on by ID

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/events/{eventId}/addons/{addonId}` |
| **Auth Required** | Yes |

---

### 5.4 Update Add-on

| Property | Value |
|----------|-------|
| **Method** | `PUT` |
| **Endpoint** | `/events/{eventId}/addons/{addonId}` |
| **Auth Required** | Yes |

---

### 5.5 Delete Add-on

| Property | Value |
|----------|-------|
| **Method** | `DELETE` |
| **Endpoint** | `/events/{eventId}/addons/{addonId}` |
| **Auth Required** | Yes |

---

### 5.6 Toggle Add-on Status

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/events/{eventId}/addons/{addonId}/toggle` |
| **Auth Required** | Yes |

---

## 6. Promo Codes

### 6.1 Get All Promo Codes

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/events/{eventId}/promo-codes` |
| **Auth Required** | Yes |

**Success Response (200):**
```json
[
  {
    "id": 1,
    "event_id": 1,
    "code": "EARLYBIRD20",
    "discount_type": "percentage",
    "discount_value": 20.00,
    "max_uses": 100,
    "current_uses": 25,
    "valid_from": "2025-01-01T00:00:00Z",
    "valid_until": "2025-02-28T23:59:59Z",
    "status": "active",
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

---

### 6.2 Create Promo Code

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/events/{eventId}/promo-codes` |
| **Auth Required** | Yes |

**Request Body:**
```json
{
  "code": "SUMMER25",
  "discount_type": "percentage",
  "discount_value": 25.00,
  "max_uses": 50,
  "valid_from": "2025-06-01T00:00:00Z",
  "valid_until": "2025-08-31T23:59:59Z",
  "applies_to": "all_tickets",
  "status": "active"
}
```

---

### 6.3 Get Promo Code by ID

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/events/{eventId}/promo-codes/{promoId}` |
| **Auth Required** | Yes |

---

### 6.4 Update Promo Code

| Property | Value |
|----------|-------|
| **Method** | `PUT` |
| **Endpoint** | `/events/{eventId}/promo-codes/{promoId}` |
| **Auth Required** | Yes |

---

### 6.5 Delete Promo Code

| Property | Value |
|----------|-------|
| **Method** | `DELETE` |
| **Endpoint** | `/events/{eventId}/promo-codes/{promoId}` |
| **Auth Required** | Yes |

---

### 6.6 Toggle Promo Code Status

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/events/{eventId}/promo-codes/{promoId}/toggle` |
| **Auth Required** | Yes |

---

## 7. Event Settings

### 7.1 Get Event Settings

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/events/{eventId}/settings` |
| **Auth Required** | Yes |

**Success Response (200):**
```json
{
  "event_id": 1,
  "registration_enabled": true,
  "waitlist_enabled": false,
  "max_tickets_per_order": 10,
  "require_approval": false,
  "allow_refunds": true,
  "refund_policy": "Full refund up to 7 days before event",
  "terms_and_conditions": "...",
  "privacy_policy_url": "https://example.com/privacy"
}
```

---

### 7.2 Update Event Settings

| Property | Value |
|----------|-------|
| **Method** | `PUT` |
| **Endpoint** | `/events/{eventId}/settings` |
| **Auth Required** | Yes |

**Request Body:**
```json
{
  "registration_enabled": true,
  "waitlist_enabled": true,
  "max_tickets_per_order": 5,
  "require_approval": true
}
```

---

## 8. Registrations

### 8.1 Get All Registrations

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/events/{eventId}/registrations` |
| **Auth Required** | Yes |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | No | Page number |
| `pageSize` | number | No | Items per page |
| `status` | string | No | Filter by status (confirmed, pending, cancelled) |
| `payment_status` | string | No | Filter by payment status |
| `search` | string | No | Search by name or email |

**Success Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "event_id": 1,
      "registration_code": "REG-001",
      "registrant_name": "John Doe",
      "registrant_email": "john@example.com",
      "ticket_id": 1,
      "status": "confirmed",
      "payment_status": "paid",
      "total_amount": 100.00,
      "created_at": "2025-01-10T14:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "totalRecords": 250,
    "totalPages": 25
  }
}
```

---

### 8.2 Get Registration Stats

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/events/{eventId}/registrations/stats` |
| **Auth Required** | Yes |

**Success Response (200):**
```json
{
  "totalRegistrations": 250,
  "confirmedRegistrations": 200,
  "pendingRegistrations": 30,
  "cancelledRegistrations": 20,
  "totalRevenue": 25000.00,
  "averageOrderValue": 100.00
}
```

---

### 8.3 Create Registration

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/events/{eventId}/registrations` |
| **Auth Required** | Yes |

**Request Body:**
```json
{
  "registrant_name": "Jane Smith",
  "registrant_email": "jane@example.com",
  "ticket_id": 1,
  "quantity": 2,
  "total_amount": 200.00,
  "payment_status": "paid"
}
```

---

### 8.4 Get Registration by ID

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/events/{eventId}/registrations/{registrationId}` |
| **Auth Required** | Yes |

---

### 8.5 Update Registration

| Property | Value |
|----------|-------|
| **Method** | `PUT` |
| **Endpoint** | `/events/{eventId}/registrations/{registrationId}` |
| **Auth Required** | Yes |

---

### 8.6 Delete Registration

| Property | Value |
|----------|-------|
| **Method** | `DELETE` |
| **Endpoint** | `/events/{eventId}/registrations/{registrationId}` |
| **Auth Required** | Yes |

---

### 8.7 Update Registration Status

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/events/{eventId}/registrations/{registrationId}/status` |
| **Auth Required** | Yes |

**Request Body:**
```json
{
  "status": "confirmed"
}
```

---

### 8.8 Update Payment Status

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/events/{eventId}/registrations/{registrationId}/payment-status` |
| **Auth Required** | Yes |

**Request Body:**
```json
{
  "payment_status": "paid"
}
```

---

## 9. Attendees & Check-in

### 9.1 Get All Attendees

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/events/{eventId}/attendees` |
| **Auth Required** | Yes |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | No | Page number |
| `pageSize` | number | No | Items per page |
| `checkin_status` | string | No | Filter (checked_in, not_checked_in) |
| `search` | string | No | Search by name or email |

**Success Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "event_id": 1,
      "ticket_id": 1,
      "attendee_name": "John Doe",
      "attendee_email": "john@example.com",
      "qr_code_value": "QR-12345",
      "checkin_status": "checked_in",
      "checkin_time": "2025-03-15T09:15:00Z",
      "checkin_location": "Main Entrance"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "totalRecords": 200,
    "totalPages": 20
  }
}
```

---

### 9.2 Get Check-in Metrics

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/events/{eventId}/attendees/metrics` |
| **Auth Required** | Yes |

**Success Response (200):**
```json
{
  "totalAttendees": 250,
  "checkedIn": 150,
  "notCheckedIn": 100,
  "checkInRate": 60.0,
  "peakCheckInTime": "09:00",
  "averageCheckInTime": "09:30"
}
```

---

### 9.3 Get Active Devices

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/events/{eventId}/attendees/devices` |
| **Auth Required** | Yes |

**Success Response (200):**
```json
{
  "devices": [
    {
      "id": "device_1",
      "name": "Main Entrance Scanner",
      "status": "online",
      "lastActivity": "2025-03-15T10:30:00Z",
      "checkInsToday": 75
    }
  ]
}
```

---

### 9.4 Get Location Stats

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/events/{eventId}/attendees/locations` |
| **Auth Required** | Yes |

**Success Response (200):**
```json
{
  "locations": [
    {
      "name": "Main Entrance",
      "checkIns": 120,
      "percentage": 80.0
    },
    {
      "name": "VIP Entrance",
      "checkIns": 30,
      "percentage": 20.0
    }
  ]
}
```

---

### 9.5 Create Attendee

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/events/{eventId}/attendees` |
| **Auth Required** | Yes |

**Request Body:**
```json
{
  "attendee_name": "New Attendee",
  "attendee_email": "attendee@example.com",
  "ticket_id": 1
}
```

---

### 9.6 Sync Attendees from Registrations

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/events/{eventId}/attendees/sync` |
| **Auth Required** | Yes |

**Success Response (200):**
```json
{
  "message": "Attendees synced successfully",
  "synced": 50,
  "skipped": 5
}
```

---

### 9.7 QR Code Check-in

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/events/{eventId}/attendees/qr-checkin` |
| **Auth Required** | Yes |

**Request Body:**
```json
{
  "qr_code": "QR-12345",
  "device_id": "device_1",
  "location": "Main Entrance"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "attendee": {
    "id": 1,
    "name": "John Doe",
    "checkin_time": "2025-03-15T09:15:00Z"
  },
  "message": "Check-in successful"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Attendee already checked in"
}
```

---

### 9.8 Get Attendee by ID

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/events/{eventId}/attendees/{attendeeId}` |
| **Auth Required** | Yes |

---

### 9.9 Manual Check-in

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/events/{eventId}/attendees/{attendeeId}/checkin` |
| **Auth Required** | Yes |

**Request Body:**
```json
{
  "location": "Main Entrance",
  "notes": "Manual check-in by staff"
}
```

---

### 9.10 Undo Check-in

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/events/{eventId}/attendees/{attendeeId}/undo-checkin` |
| **Auth Required** | Yes |

---

### 9.11 Update Device Status

| Property | Value |
|----------|-------|
| **Method** | `PUT` |
| **Endpoint** | `/devices/{deviceId}/status` |
| **Auth Required** | Yes |

**Request Body:**
```json
{
  "status": "offline"
}
```

---

## 10. Campaigns

### 10.1 Get All Campaigns

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/events/{eventId}/campaigns` |
| **Auth Required** | Yes |

**Success Response (200):**
```json
[
  {
    "id": 1,
    "event_id": 1,
    "name": "Early Bird Reminder",
    "channel": "email",
    "campaign_type": "promotional",
    "status": "sent",
    "subject": "Don't miss our early bird pricing!",
    "scheduled_at": "2025-01-15T09:00:00Z",
    "sent_at": "2025-01-15T09:00:00Z",
    "recipient_count": 500,
    "open_rate": 45.5,
    "click_rate": 12.3,
    "created_at": "2025-01-10T00:00:00Z"
  }
]
```

---

### 10.2 Get Campaign Stats

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/events/{eventId}/campaigns/stats` |
| **Auth Required** | Yes |

**Success Response (200):**
```json
{
  "totalCampaigns": 10,
  "sentCampaigns": 5,
  "scheduledCampaigns": 3,
  "draftCampaigns": 2,
  "totalRecipients": 2500,
  "averageOpenRate": 42.5,
  "averageClickRate": 10.2
}
```

---

### 10.3 Get Audience Segments

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/events/{eventId}/campaigns/audience-segments` |
| **Auth Required** | Yes |

---

### 10.4 Preview Audience

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/events/{eventId}/campaigns/preview-audience` |
| **Auth Required** | Yes |

**Request Body:**
```json
{
  "segment_id": 1,
  "filters": {
    "ticket_type": "VIP"
  }
}
```

**Success Response (200):**
```json
{
  "count": 150,
  "sample": [
    {
      "name": "John Doe",
      "email": "john@example.com"
    }
  ]
}
```

---

### 10.5 Create Campaign

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/events/{eventId}/campaigns` |
| **Auth Required** | Yes |

**Request Body:**
```json
{
  "name": "Event Reminder",
  "channel": "email",
  "campaign_type": "reminder",
  "subject": "Your event is tomorrow!",
  "content": "<html>...</html>",
  "segment_id": 1,
  "template_id": 1,
  "status": "draft"
}
```

---

### 10.6 Get Campaign by ID

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/events/{eventId}/campaigns/{campaignId}` |
| **Auth Required** | Yes |

---

### 10.7 Update Campaign

| Property | Value |
|----------|-------|
| **Method** | `PUT` |
| **Endpoint** | `/events/{eventId}/campaigns/{campaignId}` |
| **Auth Required** | Yes |

---

### 10.8 Delete Campaign

| Property | Value |
|----------|-------|
| **Method** | `DELETE` |
| **Endpoint** | `/events/{eventId}/campaigns/{campaignId}` |
| **Auth Required** | Yes |

---

### 10.9 Duplicate Campaign

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/events/{eventId}/campaigns/{campaignId}/duplicate` |
| **Auth Required** | Yes |

---

### 10.10 Send Campaign

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/events/{eventId}/campaigns/{campaignId}/send` |
| **Auth Required** | Yes |

**Success Response (200):**
```json
{
  "message": "Campaign sent successfully",
  "recipientCount": 500,
  "sentAt": "2025-01-15T10:00:00Z"
}
```

---

### 10.11 Schedule Campaign

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/events/{eventId}/campaigns/{campaignId}/schedule` |
| **Auth Required** | Yes |

**Request Body:**
```json
{
  "scheduled_at": "2025-01-20T09:00:00Z"
}
```

---

### 10.12 Pause Campaign

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/events/{eventId}/campaigns/{campaignId}/pause` |
| **Auth Required** | Yes |

---

### 10.13 Resume Campaign

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/events/{eventId}/campaigns/{campaignId}/resume` |
| **Auth Required** | Yes |

---

### 10.14 Get Campaign Recipients

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/events/{eventId}/campaigns/{campaignId}/recipients` |
| **Auth Required** | Yes |

**Success Response (200):**
```json
{
  "recipients": [
    {
      "id": 1,
      "email": "john@example.com",
      "name": "John Doe",
      "status": "delivered",
      "opened_at": "2025-01-15T10:30:00Z",
      "clicked_at": "2025-01-15T10:35:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 50,
    "totalRecords": 500,
    "totalPages": 10
  }
}
```

---

## 11. Templates

### 11.1 Get All Templates

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/events/{eventId}/templates` |
| **Auth Required** | Yes |

**Success Response (200):**
```json
[
  {
    "id": 1,
    "event_id": 1,
    "name": "Welcome Email",
    "channel": "email",
    "subject": "Welcome to {{event_name}}!",
    "content": "<html>...</html>",
    "category": "confirmation",
    "is_default": true,
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

---

### 11.2 Get Template Variables

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/events/{eventId}/templates/variables` |
| **Auth Required** | Yes |

**Success Response (200):**
```json
{
  "variables": [
    {
      "name": "attendee_name",
      "description": "Attendee's full name",
      "example": "John Doe"
    },
    {
      "name": "event_name",
      "description": "Name of the event",
      "example": "Tech Conference 2025"
    },
    {
      "name": "event_date",
      "description": "Event start date",
      "example": "March 15, 2025"
    },
    {
      "name": "ticket_type",
      "description": "Type of ticket purchased",
      "example": "VIP Access"
    }
  ]
}
```

---

### 11.3 Create Template

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/events/{eventId}/templates` |
| **Auth Required** | Yes |

**Request Body:**
```json
{
  "name": "Reminder Template",
  "channel": "email",
  "subject": "Reminder: {{event_name}} is tomorrow!",
  "content": "<html>Hi {{attendee_name}}...</html>",
  "category": "reminder"
}
```

---

### 11.4 Get Template by ID

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/events/{eventId}/templates/{templateId}` |
| **Auth Required** | Yes |

---

### 11.5 Update Template

| Property | Value |
|----------|-------|
| **Method** | `PUT` |
| **Endpoint** | `/events/{eventId}/templates/{templateId}` |
| **Auth Required** | Yes |

---

### 11.6 Delete Template

| Property | Value |
|----------|-------|
| **Method** | `DELETE` |
| **Endpoint** | `/events/{eventId}/templates/{templateId}` |
| **Auth Required** | Yes |

---

### 11.7 Duplicate Template

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/events/{eventId}/templates/{templateId}/duplicate` |
| **Auth Required** | Yes |

---

## 12. Audience Segments

### 12.1 Get All Segments

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/events/{eventId}/segments` |
| **Auth Required** | Yes |

**Success Response (200):**
```json
[
  {
    "id": 1,
    "event_id": 1,
    "name": "VIP Attendees",
    "description": "All VIP ticket holders",
    "match_type": "all",
    "rules_json": [
      {
        "field": "ticket_type",
        "operator": "equals",
        "value": "VIP"
      }
    ],
    "member_count": 150,
    "is_dynamic": true,
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

---

### 12.2 Get Filter Fields

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/events/{eventId}/segments/filter-fields` |
| **Auth Required** | Yes |

**Success Response (200):**
```json
{
  "fields": [
    {
      "id": "ticket_type",
      "name": "Ticket Type",
      "type": "select",
      "options": ["General", "VIP", "Student"]
    },
    {
      "id": "registration_status",
      "name": "Registration Status",
      "type": "select",
      "options": ["confirmed", "pending", "cancelled"]
    },
    {
      "id": "checkin_status",
      "name": "Check-in Status",
      "type": "select",
      "options": ["checked_in", "not_checked_in"]
    }
  ]
}
```

---

### 12.3 Preview Segment

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/events/{eventId}/segments/preview` |
| **Auth Required** | Yes |

**Request Body:**
```json
{
  "match_type": "all",
  "rules": [
    {
      "field": "ticket_type",
      "operator": "equals",
      "value": "VIP"
    }
  ]
}
```

**Success Response (200):**
```json
{
  "count": 150,
  "sample": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "ticket_type": "VIP"
    }
  ]
}
```

---

### 12.4 Create Segment

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/events/{eventId}/segments` |
| **Auth Required** | Yes |

**Request Body:**
```json
{
  "name": "Early Registrants",
  "description": "People who registered in the first week",
  "match_type": "all",
  "rules": [
    {
      "field": "registration_date",
      "operator": "before",
      "value": "2025-01-08"
    }
  ],
  "is_dynamic": true
}
```

---

### 12.5 Get Segment by ID

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/events/{eventId}/segments/{segmentId}` |
| **Auth Required** | Yes |

---

### 12.6 Update Segment

| Property | Value |
|----------|-------|
| **Method** | `PUT` |
| **Endpoint** | `/events/{eventId}/segments/{segmentId}` |
| **Auth Required** | Yes |

---

### 12.7 Delete Segment

| Property | Value |
|----------|-------|
| **Method** | `DELETE` |
| **Endpoint** | `/events/{eventId}/segments/{segmentId}` |
| **Auth Required** | Yes |

---

### 12.8 Get Segment Members

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/events/{eventId}/segments/{segmentId}/members` |
| **Auth Required** | Yes |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | No | Page number |
| `pageSize` | number | No | Items per page |

---

### 12.9 Refresh Segment

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/events/{eventId}/segments/{segmentId}/refresh` |
| **Auth Required** | Yes |

**Success Response (200):**
```json
{
  "message": "Segment refreshed successfully",
  "memberCount": 175,
  "refreshedAt": "2025-01-15T10:00:00Z"
}
```

---

## 13. Communication Settings

### 13.1 Get Communication Settings

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/events/{eventId}/communication-settings` |
| **Auth Required** | Yes |

**Success Response (200):**
```json
{
  "event_id": 1,
  "default_sender_name": "Tech Conference Team",
  "default_sender_email": "noreply@techconf.com",
  "reply_to_email": "support@techconf.com",
  "email_enabled": true,
  "sms_enabled": false,
  "quiet_hours_enabled": true,
  "quiet_hours_start": "22:00",
  "quiet_hours_end": "08:00",
  "quiet_hours_timezone": "America/New_York",
  "track_opens": true,
  "track_clicks": true,
  "opt_out_enabled": true,
  "unsubscribe_page_url": "https://techconf.com/unsubscribe"
}
```

---

### 13.2 Update Communication Settings

| Property | Value |
|----------|-------|
| **Method** | `PUT` |
| **Endpoint** | `/events/{eventId}/communication-settings` |
| **Auth Required** | Yes |

**Request Body:**
```json
{
  "default_sender_name": "Updated Sender",
  "reply_to_email": "new-support@techconf.com",
  "quiet_hours_enabled": true,
  "quiet_hours_start": "21:00",
  "quiet_hours_end": "09:00"
}
```

---

### 13.3 Validate Settings

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/events/{eventId}/communication-settings/validate` |
| **Auth Required** | Yes |

**Success Response (200):**
```json
{
  "valid": true,
  "warnings": []
}
```

**Error Response (400):**
```json
{
  "valid": false,
  "errors": [
    "Invalid email format for reply_to_email"
  ]
}
```

---

### 13.4 Get Quiet Hours Status

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/events/{eventId}/communication-settings/quiet-hours` |
| **Auth Required** | Yes |

**Success Response (200):**
```json
{
  "isQuietHours": false,
  "currentTime": "14:30",
  "timezone": "America/New_York",
  "quietHoursStart": "22:00",
  "quietHoursEnd": "08:00"
}
```

---

### 13.5 Reset Communication Settings

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/events/{eventId}/communication-settings/reset` |
| **Auth Required** | Yes |

**Success Response (200):**
```json
{
  "message": "Settings reset to defaults",
  "settings": { ... }
}
```

---

## 14. Reports

### 14.1 Get All Reports

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/events/{eventId}/reports` |
| **Auth Required** | Yes |

**Success Response (200):**
```json
[
  {
    "id": 1,
    "event_id": 1,
    "name": "Registration Overview",
    "description": "Shows all event registrations",
    "category": "Registrations",
    "visualization_type": "table",
    "visibility": "private",
    "schedule_enabled": false,
    "created_at": "2025-01-10T00:00:00Z",
    "updated_at": "2025-01-10T00:00:00Z"
  }
]
```

---

### 14.2 Get Data Sources

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/events/{eventId}/reports/data-sources` |
| **Auth Required** | Yes |

**Success Response (200):**
```json
[
  {
    "id": "events",
    "name": "Event Data",
    "table": "events",
    "alias": "e",
    "fields": [
      { "id": "evt_name", "name": "Event Name", "column": "name", "type": "text" },
      { "id": "evt_date", "name": "Event Date", "column": "start_date", "type": "date" },
      { "id": "evt_location", "name": "Location", "column": "location", "type": "text" }
    ]
  },
  {
    "id": "tickets",
    "name": "Ticket Data",
    "table": "tickets",
    "alias": "t",
    "fields": [
      { "id": "tkt_name", "name": "Ticket Type", "column": "name", "type": "text" },
      { "id": "tkt_price", "name": "Price", "column": "price", "type": "number" },
      { "id": "tkt_sold", "name": "Quantity Sold", "column": "sold_count", "type": "number" }
    ]
  },
  {
    "id": "registrations",
    "name": "Registration Data",
    "table": "event_registrations",
    "alias": "r",
    "fields": [
      { "id": "reg_name", "name": "Registrant Name", "column": "registrant_name", "type": "text" },
      { "id": "reg_email", "name": "Email", "column": "registrant_email", "type": "text" },
      { "id": "reg_status", "name": "Status", "column": "status", "type": "text" },
      { "id": "reg_amount", "name": "Amount Paid", "column": "total_amount", "type": "number" }
    ]
  },
  {
    "id": "checkins",
    "name": "Check-in Logs",
    "table": "event_attendees",
    "alias": "a",
    "fields": [
      { "id": "att_name", "name": "Attendee Name", "column": "attendee_name", "type": "text" },
      { "id": "att_status", "name": "Check-in Status", "column": "checkin_status", "type": "text" },
      { "id": "att_time", "name": "Check-in Time", "column": "checkin_time", "type": "datetime" }
    ]
  }
]
```

---

### 14.3 Get Standard Reports

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/events/{eventId}/reports/standard` |
| **Auth Required** | Yes |

**Success Response (200):**
```json
[
  {
    "id": "registration_funnel",
    "name": "Registration Funnel",
    "description": "Conversion rates from page view to payment",
    "category": "Registrations",
    "visualization": "line"
  },
  {
    "id": "ticket_sales_breakdown",
    "name": "Ticket Sales Breakdown",
    "description": "Sales volume by ticket type",
    "category": "Ticket Sales",
    "visualization": "pie"
  },
  {
    "id": "revenue_over_time",
    "name": "Revenue Over Time",
    "description": "Daily gross revenue trend",
    "category": "Revenue & Finance",
    "visualization": "line"
  },
  {
    "id": "attendance_checkin",
    "name": "Attendance & Check-in",
    "description": "Real-time check-in statistics",
    "category": "Attendance",
    "visualization": "bar"
  },
  {
    "id": "geographic_distribution",
    "name": "Geographic Distribution",
    "description": "Attendee breakdown by location",
    "category": "Registrations",
    "visualization": "map"
  }
]
```

---

### 14.4 Create Report

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/events/{eventId}/reports` |
| **Auth Required** | Yes |

**Request Body:**
```json
{
  "name": "VIP Ticket Sales",
  "description": "Sales report for VIP tickets only",
  "category": "Ticket Sales",
  "visualization_type": "bar",
  "visibility": "team",
  "data_scope": "this_event",
  "selected_fields": ["tkt_name", "tkt_price", "tkt_sold"],
  "filters": [
    {
      "field": "ticket_type",
      "operator": "equals",
      "value": "VIP"
    }
  ]
}
```

**Success Response (201):**
```json
{
  "id": 2,
  "event_id": 1,
  "name": "VIP Ticket Sales",
  "category": "Ticket Sales",
  "visualization_type": "bar",
  "visibility": "team",
  "created_at": "2025-01-15T10:00:00Z"
}
```

---

### 14.5 Get Report by ID

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/events/{eventId}/reports/{reportId}` |
| **Auth Required** | Yes |

---

### 14.6 Update Report

| Property | Value |
|----------|-------|
| **Method** | `PUT` |
| **Endpoint** | `/events/{eventId}/reports/{reportId}` |
| **Auth Required** | Yes |

**Request Body:**
```json
{
  "name": "Updated Report Name",
  "description": "Updated description",
  "visibility": "org"
}
```

---

### 14.7 Delete Report

| Property | Value |
|----------|-------|
| **Method** | `DELETE` |
| **Endpoint** | `/events/{eventId}/reports/{reportId}` |
| **Auth Required** | Yes |

**Success Response (200):**
```json
{
  "message": "Report deleted successfully"
}
```

---

### 14.8 Run Report

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/events/{eventId}/reports/{reportId}/run` |
| **Auth Required** | Yes |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date_from` | string | No | Start date filter (ISO format) |
| `date_to` | string | No | End date filter (ISO format) |
| `limit` | number | No | Max rows to return |
| `offset` | number | No | Pagination offset |

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "event_name": "Tech Conference 2025",
      "ticket_type": "General Admission",
      "registrant_name": "John Doe",
      "registrant_email": "john@example.com",
      "status": "confirmed",
      "payment_status": "paid",
      "amount": 100.00,
      "date": "2025-01-10T14:30:00Z"
    }
  ],
  "total": 250,
  "execution_time_ms": 45,
  "run_id": 1
}
```

---

### 14.9 Export Report as CSV

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/events/{eventId}/reports/{reportId}/export` |
| **Auth Required** | Yes |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date_from` | string | No | Start date filter |
| `date_to` | string | No | End date filter |

**Success Response (200):**
- Content-Type: `text/csv`
- Returns CSV file download

---

### 14.10 Get Report Run History

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/events/{eventId}/reports/{reportId}/runs` |
| **Auth Required** | Yes |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | number | No | Number of runs to return |

**Success Response (200):**
```json
[
  {
    "id": 1,
    "report_id": 1,
    "executed_at": "2025-01-15T10:00:00Z",
    "status": "completed",
    "row_count": 250,
    "execution_time_ms": 45,
    "executed_by": 1
  }
]
```

---

### 14.11 Run Standard Report

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/events/{eventId}/reports/standard/{standardReportId}/run` |
| **Auth Required** | Yes |

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `eventId` | number | Event ID |
| `standardReportId` | string | Standard report ID (e.g., `ticket_sales_breakdown`) |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date_from` | string | No | Start date filter |
| `date_to` | string | No | End date filter |

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "ticket_type": "General Admission",
      "quantity": 250,
      "revenue": 25000.00
    },
    {
      "ticket_type": "VIP Access",
      "quantity": 50,
      "revenue": 12500.00
    }
  ]
}
```

---

## 15. Saved Views

### 15.1 List Saved Views

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/saved-views` |
| **Auth Required** | Yes |

**Success Response (200):**
```json
[
  {
    "id": 1,
    "name": "Active Events",
    "filters": {
      "status": "published",
      "dateRange": "upcoming"
    },
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

---

### 15.2 Create Saved View

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/saved-views` |
| **Auth Required** | Yes |

**Request Body:**
```json
{
  "name": "High Revenue Events",
  "filters": {
    "status": "published",
    "minRevenue": 10000
  }
}
```

---

### 15.3 Rename Saved View

| Property | Value |
|----------|-------|
| **Method** | `PUT` |
| **Endpoint** | `/saved-views/{id}` |
| **Auth Required** | Yes |

**Request Body:**
```json
{
  "name": "Updated View Name"
}
```

---

### 15.4 Delete Saved View

| Property | Value |
|----------|-------|
| **Method** | `DELETE` |
| **Endpoint** | `/saved-views/{id}` |
| **Auth Required** | Yes |

---

## 16. File Upload

### 16.1 Upload Single File

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/upload/single` |
| **Auth Required** | Yes |
| **Content-Type** | `multipart/form-data` |

**Request Body:**
- `file`: File to upload (form field)

**Success Response (200):**
```json
{
  "success": true,
  "file": {
    "url": "/api/uploads/1705312000000-filename.jpg",
    "filename": "1705312000000-filename.jpg",
    "originalname": "filename.jpg",
    "mimetype": "image/jpeg",
    "size": 102400
  }
}
```

---

### 16.2 Upload Multiple Files

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/upload/multiple` |
| **Auth Required** | Yes |
| **Content-Type** | `multipart/form-data` |

**Request Body:**
- `files`: Array of files to upload (max 10 files)

**Success Response (200):**
```json
{
  "success": true,
  "files": [
    {
      "url": "/api/uploads/1705312000000-file1.jpg",
      "filename": "1705312000000-file1.jpg",
      "originalname": "file1.jpg",
      "mimetype": "image/jpeg",
      "size": 102400
    },
    {
      "url": "/api/uploads/1705312000001-file2.png",
      "filename": "1705312000001-file2.png",
      "originalname": "file2.png",
      "mimetype": "image/png",
      "size": 204800
    }
  ]
}
```

---

## HTTP Status Codes Reference

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request - Invalid input |
| `401` | Unauthorized - Invalid or missing token |
| `403` | Forbidden - Insufficient permissions |
| `404` | Not Found - Resource doesn't exist |
| `409` | Conflict - Duplicate resource |
| `422` | Unprocessable Entity - Validation failed |
| `500` | Internal Server Error |

---

## Notes for Frontend Developers

1. **Authentication**: Store the JWT token securely and include it in all protected API calls.

2. **Pagination**: Most list endpoints support pagination. Always handle the `pagination` object in responses.

3. **Error Handling**: Always check for error responses and display appropriate messages to users.

4. **Date Formats**: All dates are in ISO 8601 format (e.g., `2025-01-15T10:00:00Z`).

5. **File Uploads**: Use `multipart/form-data` content type for file upload endpoints.

6. **Rate Limiting**: Implement appropriate retry logic for rate-limited requests.

---

**Document Version**: 1.0  
**Generated**: January 2026
