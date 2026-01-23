"""
Test Event General Details API - Advanced Configuration
Tests all fields including partners, sponsors, internal_notes, lifecycle_status
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://datapolicyhub.preview.emergentagent.com')
EVENT_ID = 1


class TestEventGeneralDetailsAPI:
    """Test GET /api/events/{eventId}/general returns all fields"""
    
    def test_get_event_general_returns_basic_info(self):
        """Test basic info fields: name, description, category"""
        response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/general")
        assert response.status_code == 200
        
        data = response.json()
        assert "id" in data
        assert "name" in data
        assert "description" in data
        assert "category_id" in data
        assert "category" in data
        
    def test_get_event_general_returns_date_time(self):
        """Test date/time fields: start_date, end_date, timezone"""
        response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/general")
        assert response.status_code == 200
        
        data = response.json()
        assert "start_date" in data
        assert "end_date" in data
        assert "timezone" in data
        assert "all_day" in data
        
    def test_get_event_general_returns_location(self):
        """Test location fields: venue_name, address, city, state, etc."""
        response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/general")
        assert response.status_code == 200
        
        data = response.json()
        assert "venue_name" in data
        assert "location" in data
        assert "address_line1" in data
        assert "address_line2" in data
        assert "city" in data
        assert "state" in data
        assert "zip_code" in data
        assert "country" in data
        
    def test_get_event_general_returns_capacity(self):
        """Test capacity field"""
        response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/general")
        assert response.status_code == 200
        
        data = response.json()
        assert "capacity" in data
        assert "waitlist_enabled" in data
        
    def test_get_event_general_returns_media(self):
        """Test media fields: banner_image_url, gallery_images"""
        response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/general")
        assert response.status_code == 200
        
        data = response.json()
        assert "banner_image_url" in data
        assert "gallery_images" in data
        assert "promo_video_url" in data
        
    def test_get_event_general_returns_agenda(self):
        """Test agenda JSON field"""
        response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/general")
        assert response.status_code == 200
        
        data = response.json()
        assert "agenda" in data
        # Agenda should be an array or null
        assert data["agenda"] is None or isinstance(data["agenda"], list)
        
    def test_get_event_general_returns_partners(self):
        """Test partners JSON field"""
        response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/general")
        assert response.status_code == 200
        
        data = response.json()
        assert "partners" in data
        # Partners should be an array or null
        assert data["partners"] is None or isinstance(data["partners"], list)
        
    def test_get_event_general_returns_sponsors(self):
        """Test sponsors JSON field"""
        response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/general")
        assert response.status_code == 200
        
        data = response.json()
        assert "sponsors" in data
        # Sponsors should be an array or null
        assert data["sponsors"] is None or isinstance(data["sponsors"], list)
        
    def test_get_event_general_returns_internal_notes(self):
        """Test internal_notes field"""
        response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/general")
        assert response.status_code == 200
        
        data = response.json()
        assert "internal_notes" in data
        
    def test_get_event_general_returns_lifecycle_status(self):
        """Test lifecycle_status field"""
        response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/general")
        assert response.status_code == 200
        
        data = response.json()
        assert "lifecycle_status" in data


class TestEventGeneralDetailsUpdate:
    """Test PUT /api/events/{eventId}/general updates all fields"""
    
    def test_update_basic_info(self):
        """Test updating name and description"""
        update_data = {
            "name": "TEST_Updated Event Name",
            "description": "TEST_Updated description"
        }
        response = requests.put(f"{BASE_URL}/api/events/{EVENT_ID}/general", json=update_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["name"] == "TEST_Updated Event Name"
        assert data["description"] == "TEST_Updated description"
        
        # Verify persistence with GET
        get_response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/general")
        assert get_response.status_code == 200
        get_data = get_response.json()
        assert get_data["name"] == "TEST_Updated Event Name"
        
    def test_update_partners(self):
        """Test updating partners JSON array"""
        update_data = {
            "partners": [
                {"name": "TEST_Partner A", "logo": "https://example.com/a.png", "link": "https://partnera.com"},
                {"name": "TEST_Partner B", "logo": "https://example.com/b.png", "link": "https://partnerb.com"}
            ]
        }
        response = requests.put(f"{BASE_URL}/api/events/{EVENT_ID}/general", json=update_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "partners" in data
        assert isinstance(data["partners"], list)
        assert len(data["partners"]) == 2
        assert data["partners"][0]["name"] == "TEST_Partner A"
        assert data["partners"][1]["name"] == "TEST_Partner B"
        
        # Verify persistence with GET
        get_response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/general")
        get_data = get_response.json()
        assert len(get_data["partners"]) == 2
        
    def test_update_sponsors(self):
        """Test updating sponsors JSON array"""
        update_data = {
            "sponsors": [
                {"name": "TEST_Gold Sponsor", "tier": "gold", "logo_url": "https://example.com/gold.png", "link": "https://goldsponsor.com"},
                {"name": "TEST_Silver Sponsor", "tier": "silver", "logo_url": "https://example.com/silver.png", "link": "https://silversponsor.com"}
            ]
        }
        response = requests.put(f"{BASE_URL}/api/events/{EVENT_ID}/general", json=update_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "sponsors" in data
        assert isinstance(data["sponsors"], list)
        assert len(data["sponsors"]) == 2
        assert data["sponsors"][0]["name"] == "TEST_Gold Sponsor"
        assert data["sponsors"][0]["tier"] == "gold"
        
        # Verify persistence with GET
        get_response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/general")
        get_data = get_response.json()
        assert len(get_data["sponsors"]) == 2
        
    def test_update_internal_notes(self):
        """Test updating internal_notes field"""
        update_data = {
            "internal_notes": "TEST_These are updated internal notes for staff"
        }
        response = requests.put(f"{BASE_URL}/api/events/{EVENT_ID}/general", json=update_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["internal_notes"] == "TEST_These are updated internal notes for staff"
        
        # Verify persistence with GET
        get_response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/general")
        get_data = get_response.json()
        assert get_data["internal_notes"] == "TEST_These are updated internal notes for staff"
        
    def test_update_lifecycle_status(self):
        """Test updating lifecycle_status field"""
        update_data = {
            "lifecycle_status": "published"
        }
        response = requests.put(f"{BASE_URL}/api/events/{EVENT_ID}/general", json=update_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["lifecycle_status"] == "published"
        
        # Verify persistence with GET
        get_response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/general")
        get_data = get_response.json()
        assert get_data["lifecycle_status"] == "published"
        
    def test_update_agenda(self):
        """Test updating agenda JSON array"""
        update_data = {
            "agenda": [
                {"title": "TEST_Opening Keynote", "start_time": "09:00", "end_time": "10:00", "description": "Welcome speech"},
                {"title": "TEST_Workshop", "start_time": "10:30", "end_time": "12:00", "description": "Hands-on session"}
            ]
        }
        response = requests.put(f"{BASE_URL}/api/events/{EVENT_ID}/general", json=update_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "agenda" in data
        assert isinstance(data["agenda"], list)
        assert len(data["agenda"]) == 2
        assert data["agenda"][0]["title"] == "TEST_Opening Keynote"
        
        # Verify persistence with GET
        get_response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/general")
        get_data = get_response.json()
        assert len(get_data["agenda"]) == 2
        
    def test_update_all_fields_together(self):
        """Test updating all advanced fields in one request"""
        update_data = {
            "name": "TEST_Complete Update Event",
            "description": "TEST_Complete description",
            "partners": [{"name": "TEST_Complete Partner", "link": "https://complete.com"}],
            "sponsors": [{"name": "TEST_Complete Sponsor", "tier": "platinum"}],
            "internal_notes": "TEST_Complete internal notes",
            "lifecycle_status": "draft",
            "agenda": [{"title": "TEST_Complete Agenda", "start_time": "08:00", "end_time": "09:00"}]
        }
        response = requests.put(f"{BASE_URL}/api/events/{EVENT_ID}/general", json=update_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["name"] == "TEST_Complete Update Event"
        assert data["description"] == "TEST_Complete description"
        assert len(data["partners"]) == 1
        assert len(data["sponsors"]) == 1
        assert data["internal_notes"] == "TEST_Complete internal notes"
        assert data["lifecycle_status"] == "draft"
        assert len(data["agenda"]) == 1


class TestEventGeneralDetailsEdgeCases:
    """Test edge cases for event general details API"""
    
    def test_update_with_empty_partners(self):
        """Test updating partners to empty array"""
        update_data = {"partners": []}
        response = requests.put(f"{BASE_URL}/api/events/{EVENT_ID}/general", json=update_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["partners"] == []
        
    def test_update_with_empty_sponsors(self):
        """Test updating sponsors to empty array"""
        update_data = {"sponsors": []}
        response = requests.put(f"{BASE_URL}/api/events/{EVENT_ID}/general", json=update_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["sponsors"] == []
        
    def test_update_with_empty_agenda(self):
        """Test updating agenda to empty array"""
        update_data = {"agenda": []}
        response = requests.put(f"{BASE_URL}/api/events/{EVENT_ID}/general", json=update_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["agenda"] == []
        
    def test_update_with_empty_internal_notes(self):
        """Test updating internal_notes to empty string"""
        update_data = {"internal_notes": ""}
        response = requests.put(f"{BASE_URL}/api/events/{EVENT_ID}/general", json=update_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["internal_notes"] == ""
        
    def test_get_nonexistent_event(self):
        """Test GET for non-existent event returns 404"""
        response = requests.get(f"{BASE_URL}/api/events/99999/general")
        assert response.status_code == 404


# Cleanup fixture to restore original data
@pytest.fixture(scope="module", autouse=True)
def cleanup_test_data():
    """Restore original event data after tests"""
    yield
    # Restore original data
    restore_data = {
        "name": "Test Event - Advanced Config",
        "description": "Testing all fields load and save correctly",
        "partners": [{"name": "Test Partner", "logo": "https://example.com/logo.png", "link": "https://testpartner.com"}],
        "sponsors": [{"name": "Test Sponsor", "tier": "gold", "logo_url": "https://example.com/sponsor.png", "link": "https://testsponsor.com"}],
        "internal_notes": "Internal notes for testing",
        "lifecycle_status": "draft",
        "agenda": [{"title": "Opening", "start_time": "09:00", "end_time": "10:00", "description": "Opening ceremony"}]
    }
    requests.put(f"{BASE_URL}/api/events/{EVENT_ID}/general", json=restore_data)
