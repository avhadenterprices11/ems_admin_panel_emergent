"""
Unified Ticket Booking API Tests
Tests for the unified ticket booking flow with issued_tickets as single source of truth.

Endpoints tested:
- POST /api/events/{eventId}/issued-tickets/issue - Issue a single ticket
- GET /api/events/{eventId}/issued-tickets - Get all tickets with pagination/filtering
- GET /api/events/{eventId}/issued-tickets/stats - Get ticket statistics
- GET /api/events/{eventId}/issued-tickets/{ticketId} - Get ticket by ID
- GET /api/events/{eventId}/issued-tickets/code/{code} - Get ticket by unique code
- POST /api/events/{eventId}/checkin - Check in with unique_code or qr_payload
- POST /api/events/{eventId}/issued-tickets/{ticketId}/undo-checkin - Undo check-in
- POST /api/events/{eventId}/issued-tickets/{ticketId}/cancel - Cancel ticket
- PUT /api/events/{eventId}/issued-tickets/{ticketId} - Update ticket details
"""

import pytest
import requests
import os
import time

BASE_URL = os.environ.get('VITE_API_URL', 'https://datapolicyhub.preview.emergentagent.com')
EVENT_ID = 1


class TestUnifiedTicketIssue:
    """Tests for ticket issuance endpoint"""
    
    def test_issue_ticket_success(self):
        """Test issuing a new ticket with all fields"""
        response = requests.post(
            f"{BASE_URL}/api/events/{EVENT_ID}/issued-tickets/issue",
            json={
                "holder_name": "TEST_Pytest User",
                "holder_email": "pytest@example.com",
                "holder_phone": "+1-555-111-2222",
                "unit_price": 50.00,
                "payment_status": "completed",
                "payment_method": "credit_card",
                "notes": "Pytest test ticket"
            }
        )
        assert response.status_code == 201
        data = response.json()
        
        # Verify response structure
        assert "message" in data
        assert "ticket" in data
        assert data["message"] == "Ticket issued successfully"
        
        # Verify ticket data
        ticket = data["ticket"]
        assert ticket["holder_name"] == "TEST_Pytest User"
        assert ticket["holder_email"] == "pytest@example.com"
        assert ticket["holder_phone"] == "+1-555-111-2222"
        assert ticket["unit_price"] == 50.00
        assert ticket["payment_status"] == "completed"
        assert ticket["status"] == "valid"
        assert ticket["is_checked_in"] == False
        assert "ticket_number" in ticket
        assert "unique_code" in ticket
        assert "qr_payload" in ticket
        assert len(ticket["unique_code"]) == 6
        
        # Store for cleanup
        self.__class__.created_ticket_id = ticket["id"]
        self.__class__.created_unique_code = ticket["unique_code"]
        self.__class__.created_qr_payload = ticket["qr_payload"]
    
    def test_issue_ticket_minimal_fields(self):
        """Test issuing ticket with only required fields"""
        response = requests.post(
            f"{BASE_URL}/api/events/{EVENT_ID}/issued-tickets/issue",
            json={
                "holder_name": "TEST_Minimal User"
            }
        )
        assert response.status_code == 201
        data = response.json()
        
        ticket = data["ticket"]
        assert ticket["holder_name"] == "TEST_Minimal User"
        assert ticket["status"] == "valid"  # Free ticket should be valid
        assert ticket["payment_status"] == "completed"  # Default for manual issue
        
        # Store for cleanup
        self.__class__.minimal_ticket_id = ticket["id"]
    
    def test_issue_ticket_missing_holder_name(self):
        """Test issuing ticket without holder_name fails"""
        response = requests.post(
            f"{BASE_URL}/api/events/{EVENT_ID}/issued-tickets/issue",
            json={
                "holder_email": "test@example.com"
            }
        )
        assert response.status_code == 400
        data = response.json()
        assert "message" in data
        assert "holder name" in data["message"].lower() or "required" in data["message"].lower()
    
    def test_issue_ticket_invalid_event_id(self):
        """Test issuing ticket with invalid event ID"""
        response = requests.post(
            f"{BASE_URL}/api/events/invalid/issued-tickets/issue",
            json={
                "holder_name": "Test User"
            }
        )
        assert response.status_code == 400


class TestUnifiedTicketLookup:
    """Tests for ticket lookup endpoints"""
    
    def test_get_event_tickets(self):
        """Test getting all tickets for an event"""
        response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/issued-tickets")
        assert response.status_code == 200
        data = response.json()
        
        # Verify pagination structure
        assert "tickets" in data
        assert "total" in data
        assert "page" in data
        assert "limit" in data
        assert isinstance(data["tickets"], list)
        assert data["page"] == 1
        assert data["limit"] == 50
    
    def test_get_event_tickets_with_pagination(self):
        """Test pagination parameters"""
        response = requests.get(
            f"{BASE_URL}/api/events/{EVENT_ID}/issued-tickets",
            params={"page": 1, "limit": 2}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["page"] == 1
        assert data["limit"] == 2
        assert len(data["tickets"]) <= 2
    
    def test_get_event_tickets_filter_by_status(self):
        """Test filtering tickets by status"""
        response = requests.get(
            f"{BASE_URL}/api/events/{EVENT_ID}/issued-tickets",
            params={"status": "valid"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # All returned tickets should have valid status
        for ticket in data["tickets"]:
            assert ticket["status"] == "valid"
    
    def test_get_event_tickets_filter_by_checked_in(self):
        """Test filtering tickets by check-in status"""
        response = requests.get(
            f"{BASE_URL}/api/events/{EVENT_ID}/issued-tickets",
            params={"checked_in": "true"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # All returned tickets should be checked in
        for ticket in data["tickets"]:
            assert ticket["is_checked_in"] == True
    
    def test_get_event_tickets_search(self):
        """Test searching tickets by holder name/email"""
        response = requests.get(
            f"{BASE_URL}/api/events/{EVENT_ID}/issued-tickets",
            params={"search": "TEST_Pytest"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Should find our test ticket
        assert data["total"] >= 1
    
    def test_get_ticket_by_id(self):
        """Test getting ticket by ID"""
        # First get a ticket ID
        list_response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/issued-tickets")
        tickets = list_response.json()["tickets"]
        if not tickets:
            pytest.skip("No tickets available for testing")
        
        ticket_id = tickets[0]["id"]
        response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/issued-tickets/{ticket_id}")
        assert response.status_code == 200
        data = response.json()
        
        assert data["id"] == ticket_id
        assert "holder_name" in data
        assert "unique_code" in data
    
    def test_get_ticket_by_id_not_found(self):
        """Test getting non-existent ticket"""
        response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/issued-tickets/99999")
        assert response.status_code == 404
        data = response.json()
        assert "message" in data
    
    def test_get_ticket_by_code(self):
        """Test getting ticket by unique code"""
        # First get a ticket with unique code
        list_response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/issued-tickets")
        tickets = list_response.json()["tickets"]
        if not tickets:
            pytest.skip("No tickets available for testing")
        
        unique_code = tickets[0]["unique_code"]
        response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/issued-tickets/code/{unique_code}")
        assert response.status_code == 200
        data = response.json()
        
        assert data["unique_code"] == unique_code


class TestUnifiedTicketStats:
    """Tests for ticket statistics endpoint"""
    
    def test_get_ticket_stats(self):
        """Test getting ticket statistics"""
        response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/issued-tickets/stats")
        assert response.status_code == 200
        data = response.json()
        
        # Verify all stat fields are present
        assert "total_issued" in data
        assert "total_checked_in" in data
        assert "total_pending" in data
        assert "total_valid" in data
        assert "total_cancelled" in data
        assert "total_expired" in data
        assert "total_revenue" in data
        
        # Verify types
        assert isinstance(data["total_issued"], int)
        assert isinstance(data["total_checked_in"], int)
        assert isinstance(data["total_revenue"], (int, float))
        
        # Verify logical consistency
        assert data["total_issued"] >= data["total_checked_in"]
    
    def test_stats_reflect_ticket_operations(self):
        """Test that stats update after ticket operations"""
        # Get initial stats
        initial_response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/issued-tickets/stats")
        initial_stats = initial_response.json()
        
        # Issue a new ticket
        issue_response = requests.post(
            f"{BASE_URL}/api/events/{EVENT_ID}/issued-tickets/issue",
            json={
                "holder_name": "TEST_Stats User",
                "unit_price": 25.00,
                "payment_status": "completed"
            }
        )
        assert issue_response.status_code == 201
        new_ticket_id = issue_response.json()["ticket"]["id"]
        
        # Get updated stats
        updated_response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/issued-tickets/stats")
        updated_stats = updated_response.json()
        
        # Verify total_issued increased
        assert updated_stats["total_issued"] == initial_stats["total_issued"] + 1
        assert updated_stats["total_valid"] == initial_stats["total_valid"] + 1
        
        # Cleanup - cancel the ticket
        requests.post(f"{BASE_URL}/api/events/{EVENT_ID}/issued-tickets/{new_ticket_id}/cancel")


class TestUnifiedTicketCheckIn:
    """Tests for check-in functionality"""
    
    @pytest.fixture(autouse=True)
    def setup_ticket(self):
        """Create a fresh ticket for check-in tests"""
        response = requests.post(
            f"{BASE_URL}/api/events/{EVENT_ID}/issued-tickets/issue",
            json={
                "holder_name": "TEST_CheckIn User",
                "holder_email": "checkin@example.com",
                "unit_price": 30.00,
                "payment_status": "completed"
            }
        )
        assert response.status_code == 201
        ticket = response.json()["ticket"]
        self.ticket_id = ticket["id"]
        self.unique_code = ticket["unique_code"]
        self.qr_payload = ticket["qr_payload"]
        yield
        # Cleanup - delete the ticket
        requests.delete(f"{BASE_URL}/api/events/{EVENT_ID}/issued-tickets/{self.ticket_id}")
    
    def test_checkin_with_unique_code(self):
        """Test check-in using unique code"""
        response = requests.post(
            f"{BASE_URL}/api/events/{EVENT_ID}/checkin",
            json={
                "unique_code": self.unique_code,
                "checked_in_by": "pytest-agent"
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] == True
        assert "ticket" in data
        assert data["ticket"]["is_checked_in"] == True
        assert data["ticket"]["status"] == "used"
        assert data["ticket"]["checked_in_by"] == "pytest-agent"
        assert "Successfully checked in" in data["message"]
    
    def test_checkin_with_qr_payload(self):
        """Test check-in using QR payload"""
        response = requests.post(
            f"{BASE_URL}/api/events/{EVENT_ID}/checkin",
            json={
                "qr_payload": self.qr_payload,
                "checked_in_by": "qr-scanner"
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] == True
        assert data["ticket"]["is_checked_in"] == True
    
    def test_checkin_already_checked_in(self):
        """Test check-in on already checked-in ticket returns 409"""
        # First check-in
        requests.post(
            f"{BASE_URL}/api/events/{EVENT_ID}/checkin",
            json={"unique_code": self.unique_code}
        )
        
        # Second check-in should fail
        response = requests.post(
            f"{BASE_URL}/api/events/{EVENT_ID}/checkin",
            json={"unique_code": self.unique_code}
        )
        assert response.status_code == 409
        data = response.json()
        
        assert data["success"] == False
        assert data["already_checked_in"] == True
        assert "already checked in" in data["message"].lower()
    
    def test_checkin_missing_code(self):
        """Test check-in without code or payload fails"""
        response = requests.post(
            f"{BASE_URL}/api/events/{EVENT_ID}/checkin",
            json={}
        )
        assert response.status_code == 400
        data = response.json()
        assert "required" in data["message"].lower()
    
    def test_checkin_invalid_code(self):
        """Test check-in with invalid code fails"""
        response = requests.post(
            f"{BASE_URL}/api/events/{EVENT_ID}/checkin",
            json={"unique_code": "INVALID"}
        )
        assert response.status_code == 400
        data = response.json()
        
        assert data["success"] == False
        assert "not found" in data["message"].lower()


class TestUnifiedTicketUndoCheckIn:
    """Tests for undo check-in functionality"""
    
    @pytest.fixture(autouse=True)
    def setup_checked_in_ticket(self):
        """Create and check-in a ticket for undo tests"""
        # Create ticket
        response = requests.post(
            f"{BASE_URL}/api/events/{EVENT_ID}/issued-tickets/issue",
            json={
                "holder_name": "TEST_Undo User",
                "payment_status": "completed"
            }
        )
        ticket = response.json()["ticket"]
        self.ticket_id = ticket["id"]
        self.unique_code = ticket["unique_code"]
        
        # Check it in
        requests.post(
            f"{BASE_URL}/api/events/{EVENT_ID}/checkin",
            json={"unique_code": self.unique_code}
        )
        yield
        # Cleanup
        requests.delete(f"{BASE_URL}/api/events/{EVENT_ID}/issued-tickets/{self.ticket_id}")
    
    def test_undo_checkin_success(self):
        """Test undoing a check-in"""
        response = requests.post(
            f"{BASE_URL}/api/events/{EVENT_ID}/issued-tickets/{self.ticket_id}/undo-checkin"
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "message" in data
        assert "ticket" in data
        assert data["ticket"]["is_checked_in"] == False
        assert data["ticket"]["checked_in_at"] == None
        assert data["ticket"]["status"] == "valid"
    
    def test_undo_checkin_allows_recheckin(self):
        """Test that after undo, ticket can be checked in again"""
        # Undo check-in
        requests.post(f"{BASE_URL}/api/events/{EVENT_ID}/issued-tickets/{self.ticket_id}/undo-checkin")
        
        # Check in again
        response = requests.post(
            f"{BASE_URL}/api/events/{EVENT_ID}/checkin",
            json={"unique_code": self.unique_code}
        )
        assert response.status_code == 200
        assert response.json()["success"] == True


class TestUnifiedTicketCancel:
    """Tests for ticket cancellation"""
    
    @pytest.fixture(autouse=True)
    def setup_ticket(self):
        """Create a ticket for cancel tests"""
        response = requests.post(
            f"{BASE_URL}/api/events/{EVENT_ID}/issued-tickets/issue",
            json={
                "holder_name": "TEST_Cancel User",
                "payment_status": "completed"
            }
        )
        ticket = response.json()["ticket"]
        self.ticket_id = ticket["id"]
        self.unique_code = ticket["unique_code"]
        yield
        # Cleanup - delete the ticket
        requests.delete(f"{BASE_URL}/api/events/{EVENT_ID}/issued-tickets/{self.ticket_id}")
    
    def test_cancel_ticket_success(self):
        """Test cancelling a ticket"""
        response = requests.post(
            f"{BASE_URL}/api/events/{EVENT_ID}/issued-tickets/{self.ticket_id}/cancel",
            json={"reason": "Test cancellation"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "message" in data
        assert "ticket" in data
        assert data["ticket"]["status"] == "cancelled"
        assert "Test cancellation" in data["ticket"]["notes"]
    
    def test_cancel_ticket_prevents_checkin(self):
        """Test that cancelled ticket cannot be checked in"""
        # Cancel the ticket
        requests.post(
            f"{BASE_URL}/api/events/{EVENT_ID}/issued-tickets/{self.ticket_id}/cancel"
        )
        
        # Try to check in
        response = requests.post(
            f"{BASE_URL}/api/events/{EVENT_ID}/checkin",
            json={"unique_code": self.unique_code}
        )
        assert response.status_code == 400
        data = response.json()
        
        assert data["success"] == False
        assert "cancelled" in data["message"].lower()


class TestUnifiedTicketUpdate:
    """Tests for ticket update functionality"""
    
    @pytest.fixture(autouse=True)
    def setup_ticket(self):
        """Create a ticket for update tests"""
        response = requests.post(
            f"{BASE_URL}/api/events/{EVENT_ID}/issued-tickets/issue",
            json={
                "holder_name": "TEST_Update User",
                "holder_email": "original@example.com",
                "payment_status": "completed"
            }
        )
        ticket = response.json()["ticket"]
        self.ticket_id = ticket["id"]
        yield
        # Cleanup
        requests.delete(f"{BASE_URL}/api/events/{EVENT_ID}/issued-tickets/{self.ticket_id}")
    
    def test_update_ticket_holder_info(self):
        """Test updating ticket holder information"""
        response = requests.put(
            f"{BASE_URL}/api/events/{EVENT_ID}/issued-tickets/{self.ticket_id}",
            json={
                "holder_name": "TEST_Updated Name",
                "holder_email": "updated@example.com",
                "holder_phone": "+1-555-999-0000"
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["ticket"]["holder_name"] == "TEST_Updated Name"
        assert data["ticket"]["holder_email"] == "updated@example.com"
        assert data["ticket"]["holder_phone"] == "+1-555-999-0000"
    
    def test_update_ticket_notes(self):
        """Test updating ticket notes"""
        response = requests.put(
            f"{BASE_URL}/api/events/{EVENT_ID}/issued-tickets/{self.ticket_id}",
            json={"notes": "Updated notes via pytest"}
        )
        assert response.status_code == 200
        assert response.json()["ticket"]["notes"] == "Updated notes via pytest"
    
    def test_update_ticket_persists(self):
        """Test that updates are persisted"""
        # Update
        requests.put(
            f"{BASE_URL}/api/events/{EVENT_ID}/issued-tickets/{self.ticket_id}",
            json={"holder_name": "TEST_Persisted Name"}
        )
        
        # Verify with GET
        response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/issued-tickets/{self.ticket_id}")
        assert response.status_code == 200
        assert response.json()["holder_name"] == "TEST_Persisted Name"


class TestUnifiedTicketEdgeCases:
    """Edge case and error handling tests"""
    
    def test_invalid_event_id_format(self):
        """Test API with invalid event ID format"""
        response = requests.get(f"{BASE_URL}/api/events/abc/issued-tickets")
        assert response.status_code == 400
    
    def test_checkin_wrong_event(self):
        """Test check-in with code from different event"""
        # Create ticket for event 1
        issue_response = requests.post(
            f"{BASE_URL}/api/events/{EVENT_ID}/issued-tickets/issue",
            json={"holder_name": "TEST_Wrong Event User"}
        )
        unique_code = issue_response.json()["ticket"]["unique_code"]
        ticket_id = issue_response.json()["ticket"]["id"]
        
        # Try to check in on event 999 (non-existent)
        response = requests.post(
            f"{BASE_URL}/api/events/999/checkin",
            json={"unique_code": unique_code}
        )
        # Should fail - ticket not found for that event
        assert response.status_code == 400
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/events/{EVENT_ID}/issued-tickets/{ticket_id}")
    
    def test_case_insensitive_unique_code(self):
        """Test that unique code lookup is case-insensitive"""
        # Create ticket
        issue_response = requests.post(
            f"{BASE_URL}/api/events/{EVENT_ID}/issued-tickets/issue",
            json={"holder_name": "TEST_Case User"}
        )
        unique_code = issue_response.json()["ticket"]["unique_code"]
        ticket_id = issue_response.json()["ticket"]["id"]
        
        # Try check-in with lowercase
        response = requests.post(
            f"{BASE_URL}/api/events/{EVENT_ID}/checkin",
            json={"unique_code": unique_code.lower()}
        )
        assert response.status_code == 200
        assert response.json()["success"] == True
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/events/{EVENT_ID}/issued-tickets/{ticket_id}")


class TestCleanup:
    """Cleanup test data created during tests"""
    
    def test_cleanup_test_tickets(self):
        """Clean up all TEST_ prefixed tickets"""
        # Get all tickets
        response = requests.get(
            f"{BASE_URL}/api/events/{EVENT_ID}/issued-tickets",
            params={"search": "TEST_", "limit": 100}
        )
        tickets = response.json()["tickets"]
        
        # Delete each test ticket
        deleted_count = 0
        for ticket in tickets:
            if "TEST_" in ticket["holder_name"]:
                delete_response = requests.delete(
                    f"{BASE_URL}/api/events/{EVENT_ID}/issued-tickets/{ticket['id']}"
                )
                if delete_response.status_code == 200:
                    deleted_count += 1
        
        print(f"Cleaned up {deleted_count} test tickets")
        assert True  # Always pass cleanup
