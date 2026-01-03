"""
Test suite for Tickets Tab API endpoints
Tests CRUD operations for tickets scoped to a single event:
- GET /api/events/:eventId/tickets - List all tickets
- GET /api/events/:eventId/tickets/stats - Get ticket statistics
- POST /api/events/:eventId/tickets - Create new ticket
- PUT /api/events/:eventId/tickets/:ticketId - Update ticket
- DELETE /api/events/:eventId/tickets/:ticketId - Delete ticket (soft delete)
- POST /api/events/:eventId/tickets/:ticketId/toggle-sales - Toggle sales
- POST /api/events/:eventId/tickets/:ticketId/end-sales - End sales
- POST /api/events/:eventId/tickets/:ticketId/duplicate - Duplicate ticket
"""

import pytest
import requests
import os
import time

BASE_URL = os.environ.get('VITE_API_URL', 'https://eventmanager-18.preview.emergentagent.com')
EVENT_ID = 1  # Test event ID


@pytest.fixture(scope="module")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


class TestTicketsListAndStats:
    """Test GET endpoints for tickets list and stats"""
    
    def test_get_tickets_list(self, api_client):
        """GET /api/events/:eventId/tickets - List all tickets for an event"""
        response = api_client.get(f"{BASE_URL}/api/events/{EVENT_ID}/tickets")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        
        # Verify ticket structure if tickets exist
        if len(data) > 0:
            ticket = data[0]
            assert "id" in ticket
            assert "event_id" in ticket
            assert "name" in ticket
            assert "price" in ticket
            assert "capacity" in ticket
            assert "sold_count" in ticket
            assert "status" in ticket
            assert "ticket_type" in ticket
            assert "category" in ticket
            assert "min_per_order" in ticket
            assert "max_per_order" in ticket
            assert "is_visible" in ticket
            assert "is_on_sale" in ticket
            assert "is_deleted" in ticket
            assert ticket["is_deleted"] == False, "Deleted tickets should not be returned"
    
    def test_get_tickets_invalid_event(self, api_client):
        """GET /api/events/:eventId/tickets - Invalid event ID"""
        response = api_client.get(f"{BASE_URL}/api/events/invalid/tickets")
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
    
    def test_get_ticket_stats(self, api_client):
        """GET /api/events/:eventId/tickets/stats - Get ticket statistics"""
        response = api_client.get(f"{BASE_URL}/api/events/{EVENT_ID}/tickets/stats")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "totalSales" in data
        assert "ticketsSold" in data
        assert "totalCapacity" in data
        assert "addonRevenue" in data
        assert "avgOrderValue" in data
        
        # Verify data types
        assert isinstance(data["totalSales"], (int, float))
        assert isinstance(data["ticketsSold"], int)
        assert isinstance(data["totalCapacity"], int)
        assert isinstance(data["addonRevenue"], (int, float))
        assert isinstance(data["avgOrderValue"], (int, float))


class TestTicketCRUD:
    """Test Create, Read, Update, Delete operations for tickets"""
    
    def test_create_ticket_success(self, api_client):
        """POST /api/events/:eventId/tickets - Create new ticket"""
        ticket_data = {
            "name": "TEST_Premium Pass",
            "description": "Premium access with all benefits",
            "price": 149.99,
            "capacity": 50,
            "category": "VIP",
            "min_per_order": 1,
            "max_per_order": 5,
            "is_visible": True,
            "is_on_sale": True
        }
        
        response = api_client.post(f"{BASE_URL}/api/events/{EVENT_ID}/tickets", json=ticket_data)
        
        assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["name"] == ticket_data["name"]
        assert data["description"] == ticket_data["description"]
        assert float(data["price"]) == ticket_data["price"]
        assert data["capacity"] == ticket_data["capacity"]
        assert data["category"] == ticket_data["category"]
        assert data["min_per_order"] == ticket_data["min_per_order"]
        assert data["max_per_order"] == ticket_data["max_per_order"]
        assert data["is_visible"] == ticket_data["is_visible"]
        assert data["is_on_sale"] == ticket_data["is_on_sale"]
        assert data["event_id"] == EVENT_ID
        assert data["sold_count"] == 0
        assert data["ticket_type"] == "paid"  # Price > 0 means paid
        assert "id" in data
        
        # Store ticket ID for later tests
        TestTicketCRUD.created_ticket_id = data["id"]
    
    def test_create_free_ticket(self, api_client):
        """POST /api/events/:eventId/tickets - Create free ticket"""
        ticket_data = {
            "name": "TEST_Free Entry",
            "description": "Free admission ticket",
            "price": 0,
            "capacity": 100,
            "is_on_sale": True
        }
        
        response = api_client.post(f"{BASE_URL}/api/events/{EVENT_ID}/tickets", json=ticket_data)
        
        assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["ticket_type"] == "free"  # Price = 0 means free
        assert float(data["price"]) == 0
        
        TestTicketCRUD.free_ticket_id = data["id"]
    
    def test_create_ticket_missing_name(self, api_client):
        """POST /api/events/:eventId/tickets - Missing required name"""
        ticket_data = {
            "price": 50,
            "capacity": 100
        }
        
        response = api_client.post(f"{BASE_URL}/api/events/{EVENT_ID}/tickets", json=ticket_data)
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        assert "name" in response.json().get("message", "").lower()
    
    def test_create_ticket_missing_price(self, api_client):
        """POST /api/events/:eventId/tickets - Missing required price"""
        ticket_data = {
            "name": "TEST_No Price Ticket",
            "capacity": 100
        }
        
        response = api_client.post(f"{BASE_URL}/api/events/{EVENT_ID}/tickets", json=ticket_data)
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        assert "price" in response.json().get("message", "").lower()
    
    def test_create_ticket_negative_price(self, api_client):
        """POST /api/events/:eventId/tickets - Negative price validation"""
        ticket_data = {
            "name": "TEST_Negative Price",
            "price": -10,
            "capacity": 100
        }
        
        response = api_client.post(f"{BASE_URL}/api/events/{EVENT_ID}/tickets", json=ticket_data)
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        assert "negative" in response.json().get("message", "").lower()
    
    def test_get_ticket_by_id(self, api_client):
        """GET /api/events/:eventId/tickets/:ticketId - Get single ticket"""
        ticket_id = getattr(TestTicketCRUD, 'created_ticket_id', 1)
        
        response = api_client.get(f"{BASE_URL}/api/events/{EVENT_ID}/tickets/{ticket_id}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["id"] == int(ticket_id) or data["id"] == str(ticket_id)
    
    def test_get_ticket_not_found(self, api_client):
        """GET /api/events/:eventId/tickets/:ticketId - Ticket not found"""
        response = api_client.get(f"{BASE_URL}/api/events/{EVENT_ID}/tickets/99999")
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
    
    def test_update_ticket(self, api_client):
        """PUT /api/events/:eventId/tickets/:ticketId - Update ticket"""
        ticket_id = getattr(TestTicketCRUD, 'created_ticket_id', 1)
        
        update_data = {
            "name": "TEST_Premium Pass Updated",
            "price": 199.99,
            "capacity": 75,
            "description": "Updated premium access"
        }
        
        response = api_client.put(f"{BASE_URL}/api/events/{EVENT_ID}/tickets/{ticket_id}", json=update_data)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["name"] == update_data["name"]
        assert float(data["price"]) == update_data["price"]
        assert data["capacity"] == update_data["capacity"]
        assert data["description"] == update_data["description"]
        
        # Verify persistence with GET
        get_response = api_client.get(f"{BASE_URL}/api/events/{EVENT_ID}/tickets/{ticket_id}")
        assert get_response.status_code == 200
        fetched = get_response.json()
        assert fetched["name"] == update_data["name"]
    
    def test_update_ticket_not_found(self, api_client):
        """PUT /api/events/:eventId/tickets/:ticketId - Ticket not found"""
        update_data = {"name": "Updated Name"}
        
        response = api_client.put(f"{BASE_URL}/api/events/{EVENT_ID}/tickets/99999", json=update_data)
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"


class TestTicketActions:
    """Test ticket action endpoints: toggle-sales, end-sales, duplicate"""
    
    def test_toggle_sales_pause(self, api_client):
        """POST /api/events/:eventId/tickets/:ticketId/toggle-sales - Pause sales"""
        # First create a ticket that's on sale
        ticket_data = {
            "name": "TEST_Toggle Test Ticket",
            "price": 50,
            "capacity": 100,
            "is_on_sale": True
        }
        create_response = api_client.post(f"{BASE_URL}/api/events/{EVENT_ID}/tickets", json=ticket_data)
        assert create_response.status_code == 201
        ticket_id = create_response.json()["id"]
        
        # Toggle to pause
        response = api_client.post(f"{BASE_URL}/api/events/{EVENT_ID}/tickets/{ticket_id}/toggle-sales")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["is_on_sale"] == False
        assert data["status"] == "draft"
        
        TestTicketActions.toggle_ticket_id = ticket_id
    
    def test_toggle_sales_resume(self, api_client):
        """POST /api/events/:eventId/tickets/:ticketId/toggle-sales - Resume sales"""
        ticket_id = getattr(TestTicketActions, 'toggle_ticket_id', None)
        if not ticket_id:
            pytest.skip("No toggle ticket available")
        
        # Toggle to resume
        response = api_client.post(f"{BASE_URL}/api/events/{EVENT_ID}/tickets/{ticket_id}/toggle-sales")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["is_on_sale"] == True
        assert data["status"] == "on_sale"
    
    def test_end_sales(self, api_client):
        """POST /api/events/:eventId/tickets/:ticketId/end-sales - End ticket sales"""
        # Create a ticket to end sales
        ticket_data = {
            "name": "TEST_End Sales Ticket",
            "price": 75,
            "capacity": 50,
            "is_on_sale": True
        }
        create_response = api_client.post(f"{BASE_URL}/api/events/{EVENT_ID}/tickets", json=ticket_data)
        assert create_response.status_code == 201
        ticket_id = create_response.json()["id"]
        
        # End sales
        response = api_client.post(f"{BASE_URL}/api/events/{EVENT_ID}/tickets/{ticket_id}/end-sales")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["status"] == "ended"
        assert data["is_on_sale"] == False
        
        TestTicketActions.ended_ticket_id = ticket_id
    
    def test_toggle_sales_on_ended_ticket(self, api_client):
        """POST /api/events/:eventId/tickets/:ticketId/toggle-sales - Cannot toggle ended ticket"""
        ticket_id = getattr(TestTicketActions, 'ended_ticket_id', None)
        if not ticket_id:
            pytest.skip("No ended ticket available")
        
        response = api_client.post(f"{BASE_URL}/api/events/{EVENT_ID}/tickets/{ticket_id}/toggle-sales")
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        assert "ended" in response.json().get("message", "").lower()
    
    def test_duplicate_ticket(self, api_client):
        """POST /api/events/:eventId/tickets/:ticketId/duplicate - Duplicate ticket"""
        # Get first ticket to duplicate
        list_response = api_client.get(f"{BASE_URL}/api/events/{EVENT_ID}/tickets")
        tickets = list_response.json()
        if not tickets:
            pytest.skip("No tickets to duplicate")
        
        original_ticket = tickets[0]
        ticket_id = original_ticket["id"]
        
        # Duplicate
        response = api_client.post(f"{BASE_URL}/api/events/{EVENT_ID}/tickets/{ticket_id}/duplicate")
        
        assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "(Copy)" in data["name"]
        assert float(data["price"]) == float(original_ticket["price"])
        assert data["capacity"] == original_ticket["capacity"]
        assert data["category"] == original_ticket["category"]
        assert data["is_on_sale"] == False  # Duplicates start as draft
        assert data["sold_count"] == 0  # New ticket has no sales
        assert data["id"] != original_ticket["id"]  # Different ID
        
        TestTicketActions.duplicated_ticket_id = data["id"]
    
    def test_duplicate_ticket_not_found(self, api_client):
        """POST /api/events/:eventId/tickets/:ticketId/duplicate - Ticket not found"""
        response = api_client.post(f"{BASE_URL}/api/events/{EVENT_ID}/tickets/99999/duplicate")
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"


class TestTicketDelete:
    """Test ticket deletion - must be last to clean up test data"""
    
    def test_delete_ticket_success(self, api_client):
        """DELETE /api/events/:eventId/tickets/:ticketId - Delete ticket with no sales"""
        # Create a ticket to delete
        ticket_data = {
            "name": "TEST_Delete Me",
            "price": 25,
            "capacity": 10,
            "is_on_sale": False
        }
        create_response = api_client.post(f"{BASE_URL}/api/events/{EVENT_ID}/tickets", json=ticket_data)
        assert create_response.status_code == 201
        ticket_id = create_response.json()["id"]
        
        # Delete
        response = api_client.delete(f"{BASE_URL}/api/events/{EVENT_ID}/tickets/{ticket_id}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Verify ticket is no longer returned in list
        list_response = api_client.get(f"{BASE_URL}/api/events/{EVENT_ID}/tickets")
        tickets = list_response.json()
        ticket_ids = [t["id"] for t in tickets]
        assert ticket_id not in ticket_ids and str(ticket_id) not in [str(t) for t in ticket_ids]
        
        # Verify GET returns 404
        get_response = api_client.get(f"{BASE_URL}/api/events/{EVENT_ID}/tickets/{ticket_id}")
        assert get_response.status_code == 404
    
    def test_delete_ticket_not_found(self, api_client):
        """DELETE /api/events/:eventId/tickets/:ticketId - Ticket not found"""
        response = api_client.delete(f"{BASE_URL}/api/events/{EVENT_ID}/tickets/99999")
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"


class TestCleanup:
    """Cleanup test data created during tests"""
    
    def test_cleanup_test_tickets(self, api_client):
        """Clean up all TEST_ prefixed tickets"""
        list_response = api_client.get(f"{BASE_URL}/api/events/{EVENT_ID}/tickets")
        tickets = list_response.json()
        
        deleted_count = 0
        for ticket in tickets:
            if ticket["name"].startswith("TEST_") and ticket["sold_count"] == 0:
                delete_response = api_client.delete(f"{BASE_URL}/api/events/{EVENT_ID}/tickets/{ticket['id']}")
                if delete_response.status_code == 200:
                    deleted_count += 1
        
        print(f"Cleaned up {deleted_count} test tickets")
        assert True  # Cleanup is best effort


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
