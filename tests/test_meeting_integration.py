"""
Test Meeting Integration APIs
Tests for virtual meeting platform integration (Zoom/Google Meet)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://eventsphere-20.preview.emergentagent.com')


class TestMeetingIntegrationStatus:
    """Test /api/meetings/status endpoint"""
    
    def test_get_meeting_status_returns_200(self):
        """GET /api/meetings/status should return 200"""
        response = requests.get(f"{BASE_URL}/api/meetings/status")
        assert response.status_code == 200
        
    def test_get_meeting_status_returns_zoom_and_google_meet_flags(self):
        """GET /api/meetings/status should return zoom and googleMeet boolean flags"""
        response = requests.get(f"{BASE_URL}/api/meetings/status")
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "zoom" in data
        assert "googleMeet" in data
        
        # Verify types
        assert isinstance(data["zoom"], bool)
        assert isinstance(data["googleMeet"], bool)
        
    def test_meeting_status_shows_not_configured(self):
        """Both Zoom and Google Meet should show as not configured (no credentials set)"""
        response = requests.get(f"{BASE_URL}/api/meetings/status")
        assert response.status_code == 200
        data = response.json()
        
        # Since no credentials are configured, both should be false
        assert data["zoom"] == False
        assert data["googleMeet"] == False


class TestMeetingGenerate:
    """Test /api/meetings/generate endpoint"""
    
    def test_generate_zoom_meeting_returns_error_when_not_configured(self):
        """POST /api/meetings/generate with zoom should return error when not configured"""
        response = requests.post(
            f"{BASE_URL}/api/meetings/generate",
            json={
                "platform": "zoom",
                "topic": "Test Meeting",
                "start_time": "2025-01-25T10:00:00Z",
                "end_time": "2025-01-25T11:00:00Z",
                "timezone": "America/New_York"
            }
        )
        assert response.status_code == 400
        data = response.json()
        
        # Verify error message mentions Zoom configuration
        assert "message" in data
        assert "Zoom" in data["message"]
        assert "not configured" in data["message"].lower()
        assert data.get("configured") == False
        
    def test_generate_google_meet_returns_error_when_not_configured(self):
        """POST /api/meetings/generate with google-meet should return error when not configured"""
        response = requests.post(
            f"{BASE_URL}/api/meetings/generate",
            json={
                "platform": "google-meet",
                "topic": "Test Meeting",
                "start_time": "2025-01-25T10:00:00Z",
                "end_time": "2025-01-25T11:00:00Z",
                "timezone": "America/New_York"
            }
        )
        assert response.status_code == 400
        data = response.json()
        
        # Verify error message mentions Google Meet configuration
        assert "message" in data
        assert "Google Meet" in data["message"]
        assert "not configured" in data["message"].lower()
        assert data.get("configured") == False
        
    def test_generate_meeting_requires_platform(self):
        """POST /api/meetings/generate should require platform field"""
        response = requests.post(
            f"{BASE_URL}/api/meetings/generate",
            json={
                "topic": "Test Meeting",
                "start_time": "2025-01-25T10:00:00Z",
                "end_time": "2025-01-25T11:00:00Z",
                "timezone": "America/New_York"
            }
        )
        assert response.status_code == 400
        data = response.json()
        assert "platform" in data["message"].lower()
        
    def test_generate_meeting_requires_topic(self):
        """POST /api/meetings/generate should require topic field"""
        response = requests.post(
            f"{BASE_URL}/api/meetings/generate",
            json={
                "platform": "zoom",
                "start_time": "2025-01-25T10:00:00Z",
                "end_time": "2025-01-25T11:00:00Z",
                "timezone": "America/New_York"
            }
        )
        assert response.status_code == 400
        data = response.json()
        assert "topic" in data["message"].lower()
        
    def test_generate_meeting_requires_start_time(self):
        """POST /api/meetings/generate should require start_time field"""
        response = requests.post(
            f"{BASE_URL}/api/meetings/generate",
            json={
                "platform": "zoom",
                "topic": "Test Meeting",
                "end_time": "2025-01-25T11:00:00Z",
                "timezone": "America/New_York"
            }
        )
        assert response.status_code == 400
        data = response.json()
        assert "start" in data["message"].lower()
        
    def test_generate_meeting_requires_end_time(self):
        """POST /api/meetings/generate should require end_time field"""
        response = requests.post(
            f"{BASE_URL}/api/meetings/generate",
            json={
                "platform": "zoom",
                "topic": "Test Meeting",
                "start_time": "2025-01-25T10:00:00Z",
                "timezone": "America/New_York"
            }
        )
        assert response.status_code == 400
        data = response.json()
        assert "end" in data["message"].lower()
        
    def test_generate_meeting_requires_timezone(self):
        """POST /api/meetings/generate should require timezone field"""
        response = requests.post(
            f"{BASE_URL}/api/meetings/generate",
            json={
                "platform": "zoom",
                "topic": "Test Meeting",
                "start_time": "2025-01-25T10:00:00Z",
                "end_time": "2025-01-25T11:00:00Z"
            }
        )
        assert response.status_code == 400
        data = response.json()
        assert "timezone" in data["message"].lower()
        
    def test_generate_meeting_rejects_invalid_platform(self):
        """POST /api/meetings/generate should reject invalid platform"""
        response = requests.post(
            f"{BASE_URL}/api/meetings/generate",
            json={
                "platform": "invalid-platform",
                "topic": "Test Meeting",
                "start_time": "2025-01-25T10:00:00Z",
                "end_time": "2025-01-25T11:00:00Z",
                "timezone": "America/New_York"
            }
        )
        assert response.status_code == 400
        data = response.json()
        assert "invalid" in data["message"].lower() or "platform" in data["message"].lower()


class TestEventCreationWithMeetingUrl:
    """Test event creation with meeting_url field"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "admin@example.com", "password": "admin123"}
        )
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed")
        
    def test_create_event_with_manual_meeting_url(self, auth_token):
        """Create event with manually entered meeting URL"""
        import time
        event_code = f"TEST-MEET-{int(time.time())}"
        
        response = requests.post(
            f"{BASE_URL}/api/events",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "event_code": event_code,
                "name": "TEST Virtual Event with Meeting URL",
                "description": "Test event with manual meeting URL",
                "type": "Conference",
                "start_date": "2025-02-01T10:00:00Z",
                "end_date": "2025-02-01T12:00:00Z",
                "mode": "online",
                "meeting_url": "https://meet.google.com/abc-defg-hij",
                "virtual_platform": "other",
                "location": "Virtual",
                "owner": "Admin",
                "status": "Draft"
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        
        # Verify meeting_url is saved
        assert data.get("meeting_url") == "https://meet.google.com/abc-defg-hij"
        
        # Verify mode is online
        assert data.get("mode") == "online"
        
        # Get the event to verify persistence
        event_id = data.get("id")
        get_response = requests.get(
            f"{BASE_URL}/api/events/{event_id}",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert get_response.status_code == 200
        fetched_event = get_response.json()
        assert fetched_event.get("meeting_url") == "https://meet.google.com/abc-defg-hij"
        
    def test_create_hybrid_event_with_meeting_url(self, auth_token):
        """Create hybrid event with meeting URL"""
        import time
        event_code = f"TEST-HYBRID-{int(time.time())}"
        
        response = requests.post(
            f"{BASE_URL}/api/events",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "event_code": event_code,
                "name": "TEST Hybrid Event with Meeting URL",
                "description": "Test hybrid event",
                "type": "Conference",
                "start_date": "2025-02-01T10:00:00Z",
                "end_date": "2025-02-01T12:00:00Z",
                "mode": "hybrid",
                "meeting_url": "https://zoom.us/j/123456789",
                "virtual_platform": "other",
                "venue_name": "Test Venue",
                "city": "New York",
                "location": "Test Venue, New York",
                "owner": "Admin",
                "status": "Draft"
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        
        # Verify meeting_url and mode
        assert data.get("meeting_url") == "https://zoom.us/j/123456789"
        assert data.get("mode") == "hybrid"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
