"""
Test suite for Event Registrations API endpoints
Tests: GET list, GET stats, POST create, GET by ID, PUT update, POST status, POST payment-status, DELETE
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('VITE_API_URL', 'https://eventflow-151.preview.emergentagent.com')
EVENT_ID = 1  # Tech Conference 2026

class TestRegistrationsAPI:
    """Test suite for Registrations Tab API endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        self.created_registration_ids = []
        yield
        # Cleanup: Delete test registrations
        for reg_id in self.created_registration_ids:
            try:
                self.session.delete(f"{BASE_URL}/api/events/{EVENT_ID}/registrations/{reg_id}")
            except:
                pass
    
    # ==================== GET /api/events/:eventId/registrations ====================
    
    def test_get_registrations_list(self):
        """Test GET /api/events/:eventId/registrations returns list"""
        response = self.session.get(f"{BASE_URL}/api/events/{EVENT_ID}/registrations")
        assert response.status_code == 200
        
        data = response.json()
        assert "registrations" in data
        assert "total" in data
        assert "page" in data
        assert "limit" in data
        assert isinstance(data["registrations"], list)
        print(f"✓ GET registrations list: {data['total']} registrations found")
    
    def test_get_registrations_with_pagination(self):
        """Test pagination parameters work correctly"""
        response = self.session.get(f"{BASE_URL}/api/events/{EVENT_ID}/registrations?page=1&limit=5")
        assert response.status_code == 200
        
        data = response.json()
        assert data["page"] == 1
        assert data["limit"] == 5
        print(f"✓ GET registrations with pagination: page={data['page']}, limit={data['limit']}")
    
    def test_get_registrations_with_search(self):
        """Test search by name, email, or registration code"""
        response = self.session.get(f"{BASE_URL}/api/events/{EVENT_ID}/registrations?search=John")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data["registrations"], list)
        print(f"✓ GET registrations with search: {len(data['registrations'])} results for 'John'")
    
    def test_get_registrations_with_status_filter(self):
        """Test filtering by status"""
        response = self.session.get(f"{BASE_URL}/api/events/{EVENT_ID}/registrations?status=pending")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data["registrations"], list)
        print(f"✓ GET registrations with status filter: {len(data['registrations'])} pending registrations")
    
    def test_get_registrations_with_cancelled_filter(self):
        """Test filtering by cancelled status"""
        response = self.session.get(f"{BASE_URL}/api/events/{EVENT_ID}/registrations?status=cancelled")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data["registrations"], list)
        print(f"✓ GET registrations with cancelled filter: {len(data['registrations'])} cancelled registrations")
    
    def test_get_registrations_with_incomplete_filter(self):
        """Test filtering by incomplete status (started)"""
        response = self.session.get(f"{BASE_URL}/api/events/{EVENT_ID}/registrations?status=incomplete")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data["registrations"], list)
        print(f"✓ GET registrations with incomplete filter: {len(data['registrations'])} incomplete registrations")
    
    # ==================== GET /api/events/:eventId/registrations/stats ====================
    
    def test_get_registration_stats(self):
        """Test GET /api/events/:eventId/registrations/stats returns stats"""
        response = self.session.get(f"{BASE_URL}/api/events/{EVENT_ID}/registrations/stats")
        assert response.status_code == 200
        
        data = response.json()
        assert "total" in data
        assert "pending" in data
        assert "incomplete" in data
        assert "cancelled" in data
        assert "approved" in data
        print(f"✓ GET registration stats: total={data['total']}, pending={data['pending']}, approved={data['approved']}")
    
    # ==================== POST /api/events/:eventId/registrations ====================
    
    def test_create_registration_success(self):
        """Test POST /api/events/:eventId/registrations creates registration"""
        payload = {
            "registrant_name": "TEST_Jane Smith",
            "registrant_email": "test_jane@example.com",
            "registrant_phone": "+1555123456",
            "quantity": 2,
            "status": "completed",
            "payment_status": "paid",
            "payment_method": "manual"
        }
        
        response = self.session.post(f"{BASE_URL}/api/events/{EVENT_ID}/registrations", json=payload)
        assert response.status_code == 201
        
        data = response.json()
        assert data["registrant_name"] == "TEST_Jane Smith"
        assert data["registrant_email"] == "test_jane@example.com"
        assert data["quantity"] == 2
        assert "registration_code" in data
        assert data["registration_code"].startswith("REG-")
        
        self.created_registration_ids.append(data["id"])
        print(f"✓ POST create registration: ID={data['id']}, code={data['registration_code']}")
    
    def test_create_registration_minimal(self):
        """Test creating registration with only required fields"""
        payload = {
            "registrant_name": "TEST_Minimal User",
            "registrant_email": "test_minimal@example.com"
        }
        
        response = self.session.post(f"{BASE_URL}/api/events/{EVENT_ID}/registrations", json=payload)
        assert response.status_code == 201
        
        data = response.json()
        assert data["registrant_name"] == "TEST_Minimal User"
        assert data["quantity"] == 1  # Default
        assert data["status"] == "completed"  # Default
        
        self.created_registration_ids.append(data["id"])
        print(f"✓ POST create registration (minimal): ID={data['id']}")
    
    def test_create_registration_missing_name(self):
        """Test validation: name is required"""
        payload = {
            "registrant_email": "test@example.com"
        }
        
        response = self.session.post(f"{BASE_URL}/api/events/{EVENT_ID}/registrations", json=payload)
        assert response.status_code == 400
        
        data = response.json()
        assert "message" in data
        print(f"✓ POST create registration (missing name): validation error returned")
    
    def test_create_registration_missing_email(self):
        """Test validation: email is required"""
        payload = {
            "registrant_name": "Test User"
        }
        
        response = self.session.post(f"{BASE_URL}/api/events/{EVENT_ID}/registrations", json=payload)
        assert response.status_code == 400
        
        data = response.json()
        assert "message" in data
        print(f"✓ POST create registration (missing email): validation error returned")
    
    def test_create_registration_invalid_email(self):
        """Test validation: email format"""
        payload = {
            "registrant_name": "Test User",
            "registrant_email": "invalid-email"
        }
        
        response = self.session.post(f"{BASE_URL}/api/events/{EVENT_ID}/registrations", json=payload)
        assert response.status_code == 400
        
        data = response.json()
        assert "message" in data
        print(f"✓ POST create registration (invalid email): validation error returned")
    
    def test_create_registration_with_pending_status(self):
        """Test creating registration with pending status"""
        payload = {
            "registrant_name": "TEST_Pending User",
            "registrant_email": "test_pending@example.com",
            "status": "pending",
            "payment_status": "pending"
        }
        
        response = self.session.post(f"{BASE_URL}/api/events/{EVENT_ID}/registrations", json=payload)
        assert response.status_code == 201
        
        data = response.json()
        assert data["status"] == "pending"
        assert data["payment_status"] == "pending"
        
        self.created_registration_ids.append(data["id"])
        print(f"✓ POST create registration (pending): ID={data['id']}")
    
    # ==================== GET /api/events/:eventId/registrations/:id ====================
    
    def test_get_registration_by_id(self):
        """Test GET /api/events/:eventId/registrations/:id returns single registration"""
        # First create a registration
        payload = {
            "registrant_name": "TEST_Get By ID",
            "registrant_email": "test_getbyid@example.com"
        }
        create_response = self.session.post(f"{BASE_URL}/api/events/{EVENT_ID}/registrations", json=payload)
        assert create_response.status_code == 201
        reg_id = create_response.json()["id"]
        self.created_registration_ids.append(reg_id)
        
        # Get by ID
        response = self.session.get(f"{BASE_URL}/api/events/{EVENT_ID}/registrations/{reg_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == reg_id or str(data["id"]) == str(reg_id)
        assert data["registrant_name"] == "TEST_Get By ID"
        print(f"✓ GET registration by ID: {reg_id}")
    
    def test_get_registration_not_found(self):
        """Test GET returns 404 for non-existent registration"""
        response = self.session.get(f"{BASE_URL}/api/events/{EVENT_ID}/registrations/999999")
        assert response.status_code == 404
        print(f"✓ GET registration not found: 404 returned")
    
    # ==================== PUT /api/events/:eventId/registrations/:id ====================
    
    def test_update_registration(self):
        """Test PUT /api/events/:eventId/registrations/:id updates registration"""
        # First create a registration
        payload = {
            "registrant_name": "TEST_Update User",
            "registrant_email": "test_update@example.com"
        }
        create_response = self.session.post(f"{BASE_URL}/api/events/{EVENT_ID}/registrations", json=payload)
        assert create_response.status_code == 201
        reg_id = create_response.json()["id"]
        self.created_registration_ids.append(reg_id)
        
        # Update
        update_payload = {
            "registrant_name": "TEST_Updated Name",
            "registrant_phone": "+1999888777"
        }
        response = self.session.put(f"{BASE_URL}/api/events/{EVENT_ID}/registrations/{reg_id}", json=update_payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["registrant_name"] == "TEST_Updated Name"
        assert data["registrant_phone"] == "+1999888777"
        
        # Verify persistence
        get_response = self.session.get(f"{BASE_URL}/api/events/{EVENT_ID}/registrations/{reg_id}")
        assert get_response.status_code == 200
        assert get_response.json()["registrant_name"] == "TEST_Updated Name"
        print(f"✓ PUT update registration: ID={reg_id}")
    
    def test_update_registration_not_found(self):
        """Test PUT returns 404 for non-existent registration"""
        update_payload = {"registrant_name": "Test"}
        response = self.session.put(f"{BASE_URL}/api/events/{EVENT_ID}/registrations/999999", json=update_payload)
        assert response.status_code == 404
        print(f"✓ PUT update registration not found: 404 returned")
    
    # ==================== POST /api/events/:eventId/registrations/:id/status ====================
    
    def test_update_registration_status_to_approved(self):
        """Test POST /api/events/:eventId/registrations/:id/status updates status to approved"""
        # First create a pending registration
        payload = {
            "registrant_name": "TEST_Status User",
            "registrant_email": "test_status@example.com",
            "status": "pending"
        }
        create_response = self.session.post(f"{BASE_URL}/api/events/{EVENT_ID}/registrations", json=payload)
        assert create_response.status_code == 201
        reg_id = create_response.json()["id"]
        self.created_registration_ids.append(reg_id)
        
        # Update status to approved
        response = self.session.post(f"{BASE_URL}/api/events/{EVENT_ID}/registrations/{reg_id}/status", json={"status": "approved"})
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "approved"
        print(f"✓ POST update status to approved: ID={reg_id}")
    
    def test_update_registration_status_to_pending(self):
        """Test updating status to pending"""
        # First create a registration
        payload = {
            "registrant_name": "TEST_Status Pending",
            "registrant_email": "test_status_pending@example.com",
            "status": "completed"
        }
        create_response = self.session.post(f"{BASE_URL}/api/events/{EVENT_ID}/registrations", json=payload)
        assert create_response.status_code == 201
        reg_id = create_response.json()["id"]
        self.created_registration_ids.append(reg_id)
        
        # Update status to pending
        response = self.session.post(f"{BASE_URL}/api/events/{EVENT_ID}/registrations/{reg_id}/status", json={"status": "pending"})
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "pending"
        print(f"✓ POST update status to pending: ID={reg_id}")
    
    def test_update_registration_status_to_cancelled(self):
        """Test updating status to cancelled"""
        # First create a registration
        payload = {
            "registrant_name": "TEST_Status Cancel",
            "registrant_email": "test_status_cancel@example.com"
        }
        create_response = self.session.post(f"{BASE_URL}/api/events/{EVENT_ID}/registrations", json=payload)
        assert create_response.status_code == 201
        reg_id = create_response.json()["id"]
        self.created_registration_ids.append(reg_id)
        
        # Update status to cancelled
        response = self.session.post(f"{BASE_URL}/api/events/{EVENT_ID}/registrations/{reg_id}/status", json={"status": "cancelled"})
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "cancelled"
        print(f"✓ POST update status to cancelled: ID={reg_id}")
    
    def test_update_registration_status_invalid(self):
        """Test validation: invalid status value"""
        # First create a registration
        payload = {
            "registrant_name": "TEST_Invalid Status",
            "registrant_email": "test_invalid_status@example.com"
        }
        create_response = self.session.post(f"{BASE_URL}/api/events/{EVENT_ID}/registrations", json=payload)
        assert create_response.status_code == 201
        reg_id = create_response.json()["id"]
        self.created_registration_ids.append(reg_id)
        
        # Try invalid status
        response = self.session.post(f"{BASE_URL}/api/events/{EVENT_ID}/registrations/{reg_id}/status", json={"status": "invalid_status"})
        assert response.status_code == 400
        print(f"✓ POST update status (invalid): validation error returned")
    
    def test_update_registration_status_missing(self):
        """Test validation: status is required"""
        # First create a registration
        payload = {
            "registrant_name": "TEST_Missing Status",
            "registrant_email": "test_missing_status@example.com"
        }
        create_response = self.session.post(f"{BASE_URL}/api/events/{EVENT_ID}/registrations", json=payload)
        assert create_response.status_code == 201
        reg_id = create_response.json()["id"]
        self.created_registration_ids.append(reg_id)
        
        # Try without status
        response = self.session.post(f"{BASE_URL}/api/events/{EVENT_ID}/registrations/{reg_id}/status", json={})
        assert response.status_code == 400
        print(f"✓ POST update status (missing): validation error returned")
    
    # ==================== POST /api/events/:eventId/registrations/:id/payment-status ====================
    
    def test_update_payment_status_to_paid(self):
        """Test POST /api/events/:eventId/registrations/:id/payment-status updates to paid"""
        # First create a registration with pending payment
        payload = {
            "registrant_name": "TEST_Payment User",
            "registrant_email": "test_payment@example.com",
            "payment_status": "pending"
        }
        create_response = self.session.post(f"{BASE_URL}/api/events/{EVENT_ID}/registrations", json=payload)
        assert create_response.status_code == 201
        reg_id = create_response.json()["id"]
        self.created_registration_ids.append(reg_id)
        
        # Update payment status to paid
        response = self.session.post(f"{BASE_URL}/api/events/{EVENT_ID}/registrations/{reg_id}/payment-status", json={"payment_status": "paid"})
        assert response.status_code == 200
        
        data = response.json()
        assert data["payment_status"] == "paid"
        print(f"✓ POST update payment status to paid: ID={reg_id}")
    
    def test_update_payment_status_to_pending(self):
        """Test updating payment status to pending"""
        # First create a registration
        payload = {
            "registrant_name": "TEST_Payment Pending",
            "registrant_email": "test_payment_pending@example.com",
            "payment_status": "paid"
        }
        create_response = self.session.post(f"{BASE_URL}/api/events/{EVENT_ID}/registrations", json=payload)
        assert create_response.status_code == 201
        reg_id = create_response.json()["id"]
        self.created_registration_ids.append(reg_id)
        
        # Update payment status to pending
        response = self.session.post(f"{BASE_URL}/api/events/{EVENT_ID}/registrations/{reg_id}/payment-status", json={"payment_status": "pending"})
        assert response.status_code == 200
        
        data = response.json()
        assert data["payment_status"] == "pending"
        print(f"✓ POST update payment status to pending: ID={reg_id}")
    
    def test_update_payment_status_to_failed(self):
        """Test updating payment status to failed"""
        # First create a registration
        payload = {
            "registrant_name": "TEST_Payment Failed",
            "registrant_email": "test_payment_failed@example.com"
        }
        create_response = self.session.post(f"{BASE_URL}/api/events/{EVENT_ID}/registrations", json=payload)
        assert create_response.status_code == 201
        reg_id = create_response.json()["id"]
        self.created_registration_ids.append(reg_id)
        
        # Update payment status to failed
        response = self.session.post(f"{BASE_URL}/api/events/{EVENT_ID}/registrations/{reg_id}/payment-status", json={"payment_status": "failed"})
        assert response.status_code == 200
        
        data = response.json()
        assert data["payment_status"] == "failed"
        print(f"✓ POST update payment status to failed: ID={reg_id}")
    
    def test_update_payment_status_invalid(self):
        """Test validation: invalid payment status value"""
        # First create a registration
        payload = {
            "registrant_name": "TEST_Invalid Payment",
            "registrant_email": "test_invalid_payment@example.com"
        }
        create_response = self.session.post(f"{BASE_URL}/api/events/{EVENT_ID}/registrations", json=payload)
        assert create_response.status_code == 201
        reg_id = create_response.json()["id"]
        self.created_registration_ids.append(reg_id)
        
        # Try invalid payment status
        response = self.session.post(f"{BASE_URL}/api/events/{EVENT_ID}/registrations/{reg_id}/payment-status", json={"payment_status": "invalid"})
        assert response.status_code == 400
        print(f"✓ POST update payment status (invalid): validation error returned")
    
    def test_update_payment_status_missing(self):
        """Test validation: payment_status is required"""
        # First create a registration
        payload = {
            "registrant_name": "TEST_Missing Payment",
            "registrant_email": "test_missing_payment@example.com"
        }
        create_response = self.session.post(f"{BASE_URL}/api/events/{EVENT_ID}/registrations", json=payload)
        assert create_response.status_code == 201
        reg_id = create_response.json()["id"]
        self.created_registration_ids.append(reg_id)
        
        # Try without payment_status
        response = self.session.post(f"{BASE_URL}/api/events/{EVENT_ID}/registrations/{reg_id}/payment-status", json={})
        assert response.status_code == 400
        print(f"✓ POST update payment status (missing): validation error returned")
    
    # ==================== DELETE /api/events/:eventId/registrations/:id ====================
    
    def test_delete_registration(self):
        """Test DELETE /api/events/:eventId/registrations/:id soft deletes registration"""
        # First create a registration
        payload = {
            "registrant_name": "TEST_Delete User",
            "registrant_email": "test_delete@example.com"
        }
        create_response = self.session.post(f"{BASE_URL}/api/events/{EVENT_ID}/registrations", json=payload)
        assert create_response.status_code == 201
        reg_id = create_response.json()["id"]
        
        # Delete
        response = self.session.delete(f"{BASE_URL}/api/events/{EVENT_ID}/registrations/{reg_id}")
        assert response.status_code == 200
        
        # Verify deleted (should return 404)
        get_response = self.session.get(f"{BASE_URL}/api/events/{EVENT_ID}/registrations/{reg_id}")
        assert get_response.status_code == 404
        print(f"✓ DELETE registration: ID={reg_id}")
    
    def test_delete_registration_not_found(self):
        """Test DELETE returns 404 for non-existent registration"""
        response = self.session.delete(f"{BASE_URL}/api/events/{EVENT_ID}/registrations/999999")
        assert response.status_code == 404
        print(f"✓ DELETE registration not found: 404 returned")
    
    # ==================== Integration Tests ====================
    
    def test_full_registration_workflow(self):
        """Test complete workflow: Create -> Update -> Status Change -> Payment Change -> Delete"""
        # 1. Create
        payload = {
            "registrant_name": "TEST_Workflow User",
            "registrant_email": "test_workflow@example.com",
            "status": "pending",
            "payment_status": "pending"
        }
        create_response = self.session.post(f"{BASE_URL}/api/events/{EVENT_ID}/registrations", json=payload)
        assert create_response.status_code == 201
        reg_id = create_response.json()["id"]
        
        # 2. Update details
        update_response = self.session.put(f"{BASE_URL}/api/events/{EVENT_ID}/registrations/{reg_id}", json={
            "registrant_phone": "+1111222333"
        })
        assert update_response.status_code == 200
        
        # 3. Approve registration
        status_response = self.session.post(f"{BASE_URL}/api/events/{EVENT_ID}/registrations/{reg_id}/status", json={"status": "approved"})
        assert status_response.status_code == 200
        assert status_response.json()["status"] == "approved"
        
        # 4. Mark as paid
        payment_response = self.session.post(f"{BASE_URL}/api/events/{EVENT_ID}/registrations/{reg_id}/payment-status", json={"payment_status": "paid"})
        assert payment_response.status_code == 200
        assert payment_response.json()["payment_status"] == "paid"
        
        # 5. Verify final state
        get_response = self.session.get(f"{BASE_URL}/api/events/{EVENT_ID}/registrations/{reg_id}")
        assert get_response.status_code == 200
        final_data = get_response.json()
        assert final_data["status"] == "approved"
        assert final_data["payment_status"] == "paid"
        assert final_data["registrant_phone"] == "+1111222333"
        
        # 6. Delete
        delete_response = self.session.delete(f"{BASE_URL}/api/events/{EVENT_ID}/registrations/{reg_id}")
        assert delete_response.status_code == 200
        
        print(f"✓ Full workflow test completed: ID={reg_id}")
    
    def test_stats_update_after_create(self):
        """Test that stats update after creating a registration"""
        # Get initial stats
        initial_stats = self.session.get(f"{BASE_URL}/api/events/{EVENT_ID}/registrations/stats").json()
        initial_total = initial_stats["total"]
        
        # Create a registration
        payload = {
            "registrant_name": "TEST_Stats User",
            "registrant_email": "test_stats@example.com"
        }
        create_response = self.session.post(f"{BASE_URL}/api/events/{EVENT_ID}/registrations", json=payload)
        assert create_response.status_code == 201
        reg_id = create_response.json()["id"]
        self.created_registration_ids.append(reg_id)
        
        # Get updated stats
        updated_stats = self.session.get(f"{BASE_URL}/api/events/{EVENT_ID}/registrations/stats").json()
        assert updated_stats["total"] == initial_total + 1
        print(f"✓ Stats updated after create: {initial_total} -> {updated_stats['total']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
