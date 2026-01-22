"""
Test suite for Attendees & Check-in Tab APIs
Tests: GET attendees list, GET metrics, GET devices, GET locations, 
       POST create attendee, POST sync, POST QR check-in, POST manual check-in, POST undo check-in
"""
import pytest
import requests
import os
import time
import uuid

BASE_URL = os.environ.get('VITE_API_URL', 'https://eventsphere-20.preview.emergentagent.com')
EVENT_ID = 1  # Tech Conference 2026


class TestAttendeesListAPI:
    """Test GET /api/events/:eventId/attendees - List attendees with filters"""
    
    def test_get_attendees_list_success(self):
        """Test getting attendees list returns 200 with correct structure"""
        response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/attendees")
        assert response.status_code == 200
        
        data = response.json()
        assert "attendees" in data
        assert "total" in data
        assert "page" in data
        assert "limit" in data
        assert isinstance(data["attendees"], list)
    
    def test_get_attendees_list_pagination(self):
        """Test pagination parameters work correctly"""
        response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/attendees", params={"page": 1, "limit": 5})
        assert response.status_code == 200
        
        data = response.json()
        assert data["page"] == 1
        assert data["limit"] == 5
    
    def test_get_attendees_list_filter_checked_in(self):
        """Test filtering by checked_in status"""
        response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/attendees", params={"checkin_status": "checked_in"})
        assert response.status_code == 200
        
        data = response.json()
        # All returned attendees should be checked_in
        for attendee in data["attendees"]:
            assert attendee["checkin_status"] == "checked_in"
    
    def test_get_attendees_list_filter_not_checked_in(self):
        """Test filtering by not_checked_in status"""
        response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/attendees", params={"checkin_status": "not_checked_in"})
        assert response.status_code == 200
        
        data = response.json()
        # All returned attendees should be not_checked_in
        for attendee in data["attendees"]:
            assert attendee["checkin_status"] == "not_checked_in"
    
    def test_get_attendees_list_search_by_name(self):
        """Test search by attendee name"""
        response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/attendees", params={"search": "Alice"})
        assert response.status_code == 200
        
        data = response.json()
        # Should find Alice Smith
        if data["total"] > 0:
            assert any("Alice" in a["attendee_name"] for a in data["attendees"])
    
    def test_get_attendees_list_search_by_qr_code(self):
        """Test search by QR code value"""
        response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/attendees", params={"search": "QR-f42146ae"})
        assert response.status_code == 200
        
        data = response.json()
        # Should find attendee with matching QR code
        if data["total"] > 0:
            assert any("QR-f42146ae" in a["qr_code_value"] for a in data["attendees"])
    
    def test_get_attendees_invalid_event_id(self):
        """Test with invalid event ID returns 400"""
        response = requests.get(f"{BASE_URL}/api/events/invalid/attendees")
        assert response.status_code == 400


class TestCheckinMetricsAPI:
    """Test GET /api/events/:eventId/attendees/metrics - Live check-in metrics"""
    
    def test_get_metrics_success(self):
        """Test getting check-in metrics returns 200 with correct structure"""
        response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/attendees/metrics")
        assert response.status_code == 200
        
        data = response.json()
        assert "total_registrations" in data
        assert "total_checked_in" in data
        assert "total_not_checked_in" in data
        assert "no_show_count" in data
        assert "no_show_rate" in data
        assert "checkin_percentage" in data
    
    def test_get_metrics_values_are_numbers(self):
        """Test that metric values are numeric"""
        response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/attendees/metrics")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data["total_registrations"], (int, float))
        assert isinstance(data["total_checked_in"], (int, float))
        assert isinstance(data["no_show_rate"], (int, float))
        assert isinstance(data["checkin_percentage"], (int, float))
    
    def test_get_metrics_invalid_event_id(self):
        """Test with invalid event ID returns 400"""
        response = requests.get(f"{BASE_URL}/api/events/invalid/attendees/metrics")
        assert response.status_code == 400


class TestActiveDevicesAPI:
    """Test GET /api/events/:eventId/attendees/devices - Active devices"""
    
    def test_get_devices_success(self):
        """Test getting active devices returns 200 with list"""
        response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/attendees/devices")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_devices_structure(self):
        """Test device object has correct structure"""
        response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/attendees/devices")
        assert response.status_code == 200
        
        data = response.json()
        if len(data) > 0:
            device = data[0]
            assert "id" in device
            assert "device_name" in device
            assert "total_scans" in device
            assert "status" in device
    
    def test_get_devices_invalid_event_id(self):
        """Test with invalid event ID returns 400"""
        response = requests.get(f"{BASE_URL}/api/events/invalid/attendees/devices")
        assert response.status_code == 400


class TestLocationStatsAPI:
    """Test GET /api/events/:eventId/attendees/locations - Location stats"""
    
    def test_get_locations_success(self):
        """Test getting location stats returns 200 with list"""
        response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/attendees/locations")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_locations_structure(self):
        """Test location object has correct structure"""
        response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/attendees/locations")
        assert response.status_code == 200
        
        data = response.json()
        if len(data) > 0:
            loc = data[0]
            assert "location" in loc
            assert "checkin_count" in loc
    
    def test_get_locations_invalid_event_id(self):
        """Test with invalid event ID returns 400"""
        response = requests.get(f"{BASE_URL}/api/events/invalid/attendees/locations")
        assert response.status_code == 400


class TestCreateAttendeeAPI:
    """Test POST /api/events/:eventId/attendees - Create attendee manually"""
    
    def test_create_attendee_success(self):
        """Test creating attendee with valid data returns 201"""
        unique_name = f"TEST_Attendee_{uuid.uuid4().hex[:8]}"
        payload = {
            "attendee_name": unique_name,
            "attendee_email": f"test_{uuid.uuid4().hex[:8]}@example.com"
        }
        
        response = requests.post(f"{BASE_URL}/api/events/{EVENT_ID}/attendees", json=payload)
        assert response.status_code == 201
        
        data = response.json()
        assert data["attendee_name"] == unique_name
        assert "qr_code_value" in data
        assert data["qr_code_value"].startswith("QR-")
        assert data["checkin_status"] == "not_checked_in"
        
        # Store for cleanup
        self.__class__.created_attendee_id = data["id"]
    
    def test_create_attendee_name_required(self):
        """Test creating attendee without name returns 400"""
        payload = {
            "attendee_email": "test@example.com"
        }
        
        response = requests.post(f"{BASE_URL}/api/events/{EVENT_ID}/attendees", json=payload)
        assert response.status_code == 400
        assert "name" in response.json().get("message", "").lower()
    
    def test_create_attendee_empty_name(self):
        """Test creating attendee with empty name returns 400"""
        payload = {
            "attendee_name": "   ",
            "attendee_email": "test@example.com"
        }
        
        response = requests.post(f"{BASE_URL}/api/events/{EVENT_ID}/attendees", json=payload)
        assert response.status_code == 400
    
    def test_create_attendee_generates_unique_qr(self):
        """Test each attendee gets a unique QR code"""
        payload1 = {"attendee_name": f"TEST_QR1_{uuid.uuid4().hex[:8]}"}
        payload2 = {"attendee_name": f"TEST_QR2_{uuid.uuid4().hex[:8]}"}
        
        response1 = requests.post(f"{BASE_URL}/api/events/{EVENT_ID}/attendees", json=payload1)
        response2 = requests.post(f"{BASE_URL}/api/events/{EVENT_ID}/attendees", json=payload2)
        
        assert response1.status_code == 201
        assert response2.status_code == 201
        
        qr1 = response1.json()["qr_code_value"]
        qr2 = response2.json()["qr_code_value"]
        
        assert qr1 != qr2
    
    def test_create_attendee_invalid_event_id(self):
        """Test with invalid event ID returns 400"""
        payload = {"attendee_name": "Test"}
        response = requests.post(f"{BASE_URL}/api/events/invalid/attendees", json=payload)
        assert response.status_code == 400


class TestSyncAttendeesAPI:
    """Test POST /api/events/:eventId/attendees/sync - Sync from registrations"""
    
    def test_sync_attendees_success(self):
        """Test syncing attendees returns 200 with count"""
        response = requests.post(f"{BASE_URL}/api/events/{EVENT_ID}/attendees/sync")
        assert response.status_code == 200
        
        data = response.json()
        assert "message" in data
        assert "count" in data
        assert isinstance(data["count"], int)
    
    def test_sync_attendees_invalid_event_id(self):
        """Test with invalid event ID returns 400"""
        response = requests.post(f"{BASE_URL}/api/events/invalid/attendees/sync")
        assert response.status_code == 400


class TestQRCheckinAPI:
    """Test POST /api/events/:eventId/attendees/qr-checkin - QR code check-in"""
    
    @pytest.fixture(autouse=True)
    def setup_test_attendee(self):
        """Create a test attendee for QR check-in tests"""
        unique_name = f"TEST_QRCheckin_{uuid.uuid4().hex[:8]}"
        payload = {"attendee_name": unique_name}
        
        response = requests.post(f"{BASE_URL}/api/events/{EVENT_ID}/attendees", json=payload)
        if response.status_code == 201:
            self.test_attendee = response.json()
            self.test_qr_code = self.test_attendee["qr_code_value"]
        else:
            self.test_attendee = None
            self.test_qr_code = None
        
        yield
        
        # Cleanup - undo check-in if needed
        if self.test_attendee:
            requests.post(f"{BASE_URL}/api/events/{EVENT_ID}/attendees/{self.test_attendee['id']}/undo-checkin")
    
    def test_qr_checkin_success(self):
        """Test QR check-in with valid QR code returns success"""
        if not self.test_qr_code:
            pytest.skip("Test attendee not created")
        
        payload = {
            "qr_code": self.test_qr_code,
            "location": "Main Gate",
            "device_name": "Test Scanner"
        }
        
        response = requests.post(f"{BASE_URL}/api/events/{EVENT_ID}/attendees/qr-checkin", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "Check-in successful" in data["message"]
        assert data["attendee"]["checkin_status"] == "checked_in"
    
    def test_qr_checkin_invalid_qr(self):
        """Test QR check-in with invalid QR code returns error"""
        payload = {
            "qr_code": "INVALID-QR-CODE-12345"
        }
        
        response = requests.post(f"{BASE_URL}/api/events/{EVENT_ID}/attendees/qr-checkin", json=payload)
        assert response.status_code == 400
        assert "Invalid QR code" in response.json().get("message", "")
    
    def test_qr_checkin_missing_qr(self):
        """Test QR check-in without QR code returns 400"""
        payload = {
            "location": "Main Gate"
        }
        
        response = requests.post(f"{BASE_URL}/api/events/{EVENT_ID}/attendees/qr-checkin", json=payload)
        assert response.status_code == 400
        assert "required" in response.json().get("message", "").lower()
    
    def test_qr_checkin_duplicate_prevention(self):
        """Test QR check-in prevents duplicate check-in"""
        if not self.test_qr_code:
            pytest.skip("Test attendee not created")
        
        payload = {"qr_code": self.test_qr_code}
        
        # First check-in
        response1 = requests.post(f"{BASE_URL}/api/events/{EVENT_ID}/attendees/qr-checkin", json=payload)
        assert response1.status_code == 200
        
        # Second check-in should fail
        response2 = requests.post(f"{BASE_URL}/api/events/{EVENT_ID}/attendees/qr-checkin", json=payload)
        assert response2.status_code == 400
        assert "already checked in" in response2.json().get("message", "").lower()
    
    def test_qr_checkin_wrong_event(self):
        """Test QR check-in with QR from different event returns error"""
        # Use Alice's QR code but try to check in at event 999
        payload = {
            "qr_code": "QR-f42146ae-6807-43ad-a163-71fb5c2fc72d"
        }
        
        response = requests.post(f"{BASE_URL}/api/events/999/attendees/qr-checkin", json=payload)
        # Should return 400 with "does not belong to this event" message
        assert response.status_code == 400
        assert "does not belong" in response.json().get("message", "").lower() or "invalid" in response.json().get("message", "").lower()


class TestManualCheckinAPI:
    """Test POST /api/events/:eventId/attendees/:id/checkin - Manual check-in"""
    
    @pytest.fixture(autouse=True)
    def setup_test_attendee(self):
        """Create a test attendee for manual check-in tests"""
        unique_name = f"TEST_ManualCheckin_{uuid.uuid4().hex[:8]}"
        payload = {"attendee_name": unique_name}
        
        response = requests.post(f"{BASE_URL}/api/events/{EVENT_ID}/attendees", json=payload)
        if response.status_code == 201:
            self.test_attendee = response.json()
        else:
            self.test_attendee = None
        
        yield
        
        # Cleanup - undo check-in if needed
        if self.test_attendee:
            requests.post(f"{BASE_URL}/api/events/{EVENT_ID}/attendees/{self.test_attendee['id']}/undo-checkin")
    
    def test_manual_checkin_success(self):
        """Test manual check-in returns success"""
        if not self.test_attendee:
            pytest.skip("Test attendee not created")
        
        attendee_id = self.test_attendee["id"]
        payload = {"location": "VIP Entrance"}
        
        response = requests.post(f"{BASE_URL}/api/events/{EVENT_ID}/attendees/{attendee_id}/checkin", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "successful" in data["message"].lower()
        assert data["attendee"]["checkin_status"] == "checked_in"
    
    def test_manual_checkin_already_checked_in(self):
        """Test manual check-in fails if already checked in"""
        if not self.test_attendee:
            pytest.skip("Test attendee not created")
        
        attendee_id = self.test_attendee["id"]
        
        # First check-in
        requests.post(f"{BASE_URL}/api/events/{EVENT_ID}/attendees/{attendee_id}/checkin")
        
        # Second check-in should fail
        response = requests.post(f"{BASE_URL}/api/events/{EVENT_ID}/attendees/{attendee_id}/checkin")
        assert response.status_code == 400
        assert "already checked in" in response.json().get("message", "").lower()
    
    def test_manual_checkin_not_found(self):
        """Test manual check-in with non-existent attendee returns 400"""
        response = requests.post(f"{BASE_URL}/api/events/{EVENT_ID}/attendees/99999/checkin")
        assert response.status_code == 400
        assert "not found" in response.json().get("message", "").lower()
    
    def test_manual_checkin_invalid_ids(self):
        """Test manual check-in with invalid IDs returns 400"""
        response = requests.post(f"{BASE_URL}/api/events/invalid/attendees/invalid/checkin")
        assert response.status_code == 400


class TestUndoCheckinAPI:
    """Test POST /api/events/:eventId/attendees/:id/undo-checkin - Undo check-in"""
    
    @pytest.fixture(autouse=True)
    def setup_checked_in_attendee(self):
        """Create and check-in a test attendee"""
        unique_name = f"TEST_UndoCheckin_{uuid.uuid4().hex[:8]}"
        payload = {"attendee_name": unique_name}
        
        response = requests.post(f"{BASE_URL}/api/events/{EVENT_ID}/attendees", json=payload)
        if response.status_code == 201:
            self.test_attendee = response.json()
            # Check them in
            requests.post(f"{BASE_URL}/api/events/{EVENT_ID}/attendees/{self.test_attendee['id']}/checkin")
        else:
            self.test_attendee = None
        
        yield
    
    def test_undo_checkin_success(self):
        """Test undo check-in returns success"""
        if not self.test_attendee:
            pytest.skip("Test attendee not created")
        
        attendee_id = self.test_attendee["id"]
        
        response = requests.post(f"{BASE_URL}/api/events/{EVENT_ID}/attendees/{attendee_id}/undo-checkin")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "undone" in data["message"].lower()
        assert data["attendee"]["checkin_status"] == "not_checked_in"
    
    def test_undo_checkin_not_checked_in(self):
        """Test undo check-in fails if not checked in"""
        # Create a new attendee that's not checked in
        unique_name = f"TEST_NotCheckedIn_{uuid.uuid4().hex[:8]}"
        payload = {"attendee_name": unique_name}
        
        response = requests.post(f"{BASE_URL}/api/events/{EVENT_ID}/attendees", json=payload)
        if response.status_code != 201:
            pytest.skip("Could not create test attendee")
        
        attendee_id = response.json()["id"]
        
        # Try to undo check-in
        undo_response = requests.post(f"{BASE_URL}/api/events/{EVENT_ID}/attendees/{attendee_id}/undo-checkin")
        assert undo_response.status_code == 400
        assert "not checked in" in undo_response.json().get("message", "").lower()
    
    def test_undo_checkin_not_found(self):
        """Test undo check-in with non-existent attendee returns 400"""
        response = requests.post(f"{BASE_URL}/api/events/{EVENT_ID}/attendees/99999/undo-checkin")
        assert response.status_code == 400
        assert "not found" in response.json().get("message", "").lower()


class TestGetAttendeeByIdAPI:
    """Test GET /api/events/:eventId/attendees/:attendeeId - Get single attendee"""
    
    def test_get_attendee_by_id_success(self):
        """Test getting attendee by ID returns correct data"""
        # First get list to find an attendee
        list_response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/attendees")
        if list_response.status_code != 200 or len(list_response.json()["attendees"]) == 0:
            pytest.skip("No attendees available")
        
        attendee_id = list_response.json()["attendees"][0]["id"]
        
        response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/attendees/{attendee_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert "id" in data
        assert "attendee_name" in data
        assert "qr_code_value" in data
        assert "checkin_status" in data
    
    def test_get_attendee_by_id_not_found(self):
        """Test getting non-existent attendee returns 404"""
        response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/attendees/99999")
        assert response.status_code == 404
    
    def test_get_attendee_by_id_invalid_id(self):
        """Test getting attendee with invalid ID returns 400"""
        response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/attendees/invalid")
        assert response.status_code == 400


class TestCheckinWorkflow:
    """Integration tests for complete check-in workflow"""
    
    def test_full_checkin_workflow(self):
        """Test complete workflow: create -> check-in -> verify -> undo -> verify"""
        # 1. Create attendee
        unique_name = f"TEST_Workflow_{uuid.uuid4().hex[:8]}"
        create_response = requests.post(
            f"{BASE_URL}/api/events/{EVENT_ID}/attendees",
            json={"attendee_name": unique_name, "attendee_email": "workflow@test.com"}
        )
        assert create_response.status_code == 201
        attendee = create_response.json()
        attendee_id = attendee["id"]
        qr_code = attendee["qr_code_value"]
        
        # 2. Verify initial status
        assert attendee["checkin_status"] == "not_checked_in"
        
        # 3. Check-in via QR
        checkin_response = requests.post(
            f"{BASE_URL}/api/events/{EVENT_ID}/attendees/qr-checkin",
            json={"qr_code": qr_code, "location": "Main Gate", "device_name": "Test Device"}
        )
        assert checkin_response.status_code == 200
        assert checkin_response.json()["success"] == True
        
        # 4. Verify checked-in status
        get_response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/attendees/{attendee_id}")
        assert get_response.status_code == 200
        assert get_response.json()["checkin_status"] == "checked_in"
        
        # 5. Verify metrics updated
        metrics_response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/attendees/metrics")
        assert metrics_response.status_code == 200
        assert metrics_response.json()["total_checked_in"] >= 1
        
        # 6. Undo check-in
        undo_response = requests.post(f"{BASE_URL}/api/events/{EVENT_ID}/attendees/{attendee_id}/undo-checkin")
        assert undo_response.status_code == 200
        assert undo_response.json()["success"] == True
        
        # 7. Verify status reverted
        final_response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/attendees/{attendee_id}")
        assert final_response.status_code == 200
        assert final_response.json()["checkin_status"] == "not_checked_in"
    
    def test_device_tracking_on_checkin(self):
        """Test that device is tracked when checking in"""
        # Create attendee
        unique_name = f"TEST_DeviceTrack_{uuid.uuid4().hex[:8]}"
        create_response = requests.post(
            f"{BASE_URL}/api/events/{EVENT_ID}/attendees",
            json={"attendee_name": unique_name}
        )
        assert create_response.status_code == 201
        qr_code = create_response.json()["qr_code_value"]
        attendee_id = create_response.json()["id"]
        
        # Check-in with device name
        device_name = f"TestDevice_{uuid.uuid4().hex[:4]}"
        checkin_response = requests.post(
            f"{BASE_URL}/api/events/{EVENT_ID}/attendees/qr-checkin",
            json={"qr_code": qr_code, "device_name": device_name, "location": "Side Entrance"}
        )
        assert checkin_response.status_code == 200
        
        # Verify device appears in devices list
        devices_response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/attendees/devices")
        assert devices_response.status_code == 200
        devices = devices_response.json()
        
        device_names = [d["device_name"] for d in devices]
        assert device_name in device_names
        
        # Cleanup
        requests.post(f"{BASE_URL}/api/events/{EVENT_ID}/attendees/{attendee_id}/undo-checkin")
    
    def test_location_tracking_on_checkin(self):
        """Test that location stats are updated on check-in"""
        # Create attendee
        unique_name = f"TEST_LocTrack_{uuid.uuid4().hex[:8]}"
        create_response = requests.post(
            f"{BASE_URL}/api/events/{EVENT_ID}/attendees",
            json={"attendee_name": unique_name}
        )
        assert create_response.status_code == 201
        qr_code = create_response.json()["qr_code_value"]
        attendee_id = create_response.json()["id"]
        
        # Check-in with location
        location = "Registration Desk"
        checkin_response = requests.post(
            f"{BASE_URL}/api/events/{EVENT_ID}/attendees/qr-checkin",
            json={"qr_code": qr_code, "location": location, "device_name": "Web Scanner"}
        )
        assert checkin_response.status_code == 200
        
        # Verify location appears in location stats
        locations_response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/attendees/locations")
        assert locations_response.status_code == 200
        locations = locations_response.json()
        
        location_names = [loc["location"] for loc in locations]
        assert location in location_names
        
        # Cleanup
        requests.post(f"{BASE_URL}/api/events/{EVENT_ID}/attendees/{attendee_id}/undo-checkin")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
