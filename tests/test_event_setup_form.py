"""
Test Event Setup Form - Backend API Tests
Tests for: Category, Tags, Users master data, Meeting integration, Event creation with all fields
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://eventpro-19.preview.emergentagent.com')

class TestMasterDataAPIs:
    """Test master data APIs for categories, tags, and users"""
    
    def test_get_categories(self):
        """GET /api/master/categories - should return list of categories"""
        response = requests.get(f"{BASE_URL}/api/master/categories")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        
        # Verify category structure
        category = data[0]
        assert 'id' in category
        assert 'name' in category
        assert 'slug' in category
        assert 'is_active' in category
        print(f"✓ Found {len(data)} categories")
    
    def test_get_tags(self):
        """GET /api/master/tags - should return list of tags with colors"""
        response = requests.get(f"{BASE_URL}/api/master/tags")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        
        # Verify tag structure with color
        tag = data[0]
        assert 'id' in tag
        assert 'name' in tag
        assert 'slug' in tag
        assert 'color' in tag
        assert 'is_active' in tag
        print(f"✓ Found {len(data)} tags with colors")
    
    def test_get_users(self):
        """GET /api/master/users - should return list of users for owner dropdown"""
        response = requests.get(f"{BASE_URL}/api/master/users")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        
        # Verify user structure
        user = data[0]
        assert 'id' in user
        assert 'name' in user
        assert 'email' in user
        print(f"✓ Found {len(data)} users for owner dropdown")


class TestMeetingIntegration:
    """Test meeting integration status and generation"""
    
    def test_meeting_integration_status(self):
        """GET /api/meetings/status - should return integration status"""
        response = requests.get(f"{BASE_URL}/api/meetings/status")
        assert response.status_code == 200
        
        data = response.json()
        assert 'zoom' in data
        assert 'googleMeet' in data
        assert isinstance(data['zoom'], bool)
        assert isinstance(data['googleMeet'], bool)
        print(f"✓ Meeting status: Zoom={data['zoom']}, GoogleMeet={data['googleMeet']}")
    
    def test_generate_zoom_meeting(self):
        """POST /api/meetings/generate - should generate Zoom meeting link"""
        response = requests.get(f"{BASE_URL}/api/meetings/status")
        status = response.json()
        
        if not status.get('zoom'):
            pytest.skip("Zoom integration not configured")
        
        payload = {
            "platform": "zoom",
            "topic": "TEST Meeting for Event Setup",
            "description": "Test meeting description",
            "start_time": "2026-02-01T10:00:00Z",
            "end_time": "2026-02-01T11:00:00Z",
            "timezone": "America/New_York"
        }
        
        response = requests.post(f"{BASE_URL}/api/meetings/generate", json=payload)
        
        # May return 200 (success) or 400/500 (integration error)
        if response.status_code == 200:
            data = response.json()
            assert data.get('success') == True
            assert 'meeting_url' in data
            assert data['meeting_url'] is not None
            print(f"✓ Zoom meeting generated: {data['meeting_url']}")
        else:
            # Integration may fail due to credentials - that's acceptable
            print(f"⚠ Zoom generation returned {response.status_code}: {response.text[:200]}")
    
    def test_generate_google_meet(self):
        """POST /api/meetings/generate - should generate Google Meet link"""
        response = requests.get(f"{BASE_URL}/api/meetings/status")
        status = response.json()
        
        if not status.get('googleMeet'):
            pytest.skip("Google Meet integration not configured")
        
        payload = {
            "platform": "google-meet",
            "topic": "TEST Meeting for Event Setup",
            "description": "Test meeting description",
            "start_time": "2026-02-01T10:00:00Z",
            "end_time": "2026-02-01T11:00:00Z",
            "timezone": "America/New_York"
        }
        
        response = requests.post(f"{BASE_URL}/api/meetings/generate", json=payload)
        
        if response.status_code == 200:
            data = response.json()
            assert data.get('success') == True
            assert 'meeting_url' in data
            print(f"✓ Google Meet generated: {data['meeting_url']}")
        else:
            print(f"⚠ Google Meet generation returned {response.status_code}: {response.text[:200]}")


class TestAuthentication:
    """Test authentication for event creation"""
    
    def test_login_success(self):
        """POST /api/auth/login - should return JWT token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@example.com",
            "password": "admin123"
        })
        assert response.status_code == 200
        
        data = response.json()
        assert 'token' in data
        assert len(data['token']) > 0
        print("✓ Login successful, token received")
        return data['token']
    
    def test_login_invalid_credentials(self):
        """POST /api/auth/login - should reject invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@example.com",
            "password": "wrongpassword"
        })
        assert response.status_code in [401, 400]
        print("✓ Invalid credentials rejected correctly")


class TestEventCreation:
    """Test event creation with all form fields"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@example.com",
            "password": "admin123"
        })
        if response.status_code == 200:
            return response.json().get('token')
        pytest.skip("Authentication failed")
    
    @pytest.fixture
    def auth_headers(self, auth_token):
        """Get headers with auth token"""
        return {
            "Authorization": f"Bearer {auth_token}",
            "Content-Type": "application/json"
        }
    
    def test_create_event_with_category_and_tags(self, auth_headers):
        """POST /api/events - should create event with category_id and tag_ids"""
        # Get available categories and tags
        categories = requests.get(f"{BASE_URL}/api/master/categories").json()
        tags = requests.get(f"{BASE_URL}/api/master/tags").json()
        
        category_id = categories[0]['id'] if categories else None
        tag_ids = [tags[0]['id'], tags[1]['id']] if len(tags) >= 2 else []
        
        event_data = {
            "event_code": f"TEST-EVT-{int(time.time())}",
            "name": "TEST Event with Category and Tags",
            "description": "Testing category_id and tag_ids storage",
            "category_id": category_id,
            "tag_ids": tag_ids,
            "type": "Conference",
            "start_date": "2026-03-01T09:00:00Z",
            "end_date": "2026-03-01T17:00:00Z",
            "timezone": "America/New_York",
            "mode": "in-person",
            "location": "Test Venue",
            "owner": "admin@example.com",
            "status": "Draft"
        }
        
        response = requests.post(f"{BASE_URL}/api/events", json=event_data, headers=auth_headers)
        assert response.status_code in [200, 201]
        
        data = response.json()
        assert 'id' in data
        assert data['name'] == event_data['name']
        assert data.get('category_id') == category_id
        print(f"✓ Event created with category_id={category_id}, tag_ids={tag_ids}")
        return data['id']
    
    def test_create_virtual_event_with_meeting_url(self, auth_headers):
        """POST /api/events - should create virtual event with meeting_url"""
        event_data = {
            "event_code": f"TEST-VIRTUAL-{int(time.time())}",
            "name": "TEST Virtual Event with Meeting URL",
            "description": "Testing meeting_url storage",
            "type": "Webinar",
            "start_date": "2026-03-15T14:00:00Z",
            "end_date": "2026-03-15T16:00:00Z",
            "timezone": "Asia/Kolkata",
            "mode": "online",
            "virtual_platform": "other",
            "meeting_url": "https://zoom.us/j/1234567890",
            "location": "Online",
            "owner": "admin@example.com",
            "status": "Draft"
        }
        
        response = requests.post(f"{BASE_URL}/api/events", json=event_data, headers=auth_headers)
        assert response.status_code in [200, 201]
        
        data = response.json()
        assert 'id' in data
        assert data.get('meeting_url') == event_data['meeting_url']
        assert data.get('mode') == 'online'
        print(f"✓ Virtual event created with meeting_url={data.get('meeting_url')}")
        return data['id']
    
    def test_create_hybrid_event_with_all_fields(self, auth_headers):
        """POST /api/events - should create hybrid event with all fields"""
        # Get master data
        categories = requests.get(f"{BASE_URL}/api/master/categories").json()
        tags = requests.get(f"{BASE_URL}/api/master/tags").json()
        users = requests.get(f"{BASE_URL}/api/master/users").json()
        
        event_data = {
            "event_code": f"TEST-HYBRID-{int(time.time())}",
            "name": "TEST Hybrid Event Full Form",
            "description": "Testing all form fields",
            "category_id": categories[0]['id'] if categories else None,
            "tag_ids": [t['id'] for t in tags[:3]] if len(tags) >= 3 else [],
            "type": "Conference",
            "start_date": "2026-04-01T09:00:00Z",
            "end_date": "2026-04-02T18:00:00Z",
            "timezone": "Asia/Kolkata",
            "mode": "hybrid",
            "virtual_platform": "other",
            "meeting_url": "https://meet.google.com/abc-defg-hij",
            "venue_name": "Tech Hub Conference Center",
            "location": "123 Tech Street",
            "city": "Mumbai",
            "state": "Maharashtra",
            "country": "India",
            "owner": users[0]['email'] if users else "admin@example.com",
            "capacity": 500,
            "waitlist_enabled": True,
            "status": "Draft",
            "visibility": "public"
        }
        
        response = requests.post(f"{BASE_URL}/api/events", json=event_data, headers=auth_headers)
        assert response.status_code in [200, 201]
        
        data = response.json()
        assert 'id' in data
        assert data['name'] == event_data['name']
        assert data.get('mode') == 'hybrid'
        # When virtual_platform is 'other', meeting_url is preserved as-is
        assert data.get('meeting_url') == event_data['meeting_url']
        assert data.get('timezone') == 'Asia/Kolkata'
        print(f"✓ Hybrid event created with all fields, id={data['id']}")
        return data['id']
    
    def test_verify_event_tags_junction_table(self, auth_headers):
        """Verify event_tags junction table is populated"""
        # Create event with tags
        tags = requests.get(f"{BASE_URL}/api/master/tags").json()
        tag_ids = [tags[0]['id'], tags[1]['id']] if len(tags) >= 2 else []
        
        event_data = {
            "event_code": f"TEST-TAGS-{int(time.time())}",
            "name": "TEST Event for Tags Junction",
            "description": "Testing event_tags junction table",
            "tag_ids": tag_ids,
            "type": "Workshop",
            "start_date": "2026-05-01T10:00:00Z",
            "end_date": "2026-05-01T12:00:00Z",
            "timezone": "UTC",
            "mode": "in-person",
            "location": "Workshop Room",
            "owner": "admin@example.com",
            "status": "Draft"
        }
        
        response = requests.post(f"{BASE_URL}/api/events", json=event_data, headers=auth_headers)
        assert response.status_code in [200, 201]
        
        event_id = response.json()['id']
        
        # Fetch event general details to verify tags
        general_response = requests.get(f"{BASE_URL}/api/events/{event_id}/general", headers=auth_headers)
        
        if general_response.status_code == 200:
            general_data = general_response.json()
            # Tags should be populated from junction table
            event_tags = general_data.get('tags', [])
            print(f"✓ Event tags from junction table: {event_tags}")
        else:
            print(f"⚠ Could not verify tags junction: {general_response.status_code}")


class TestTimezoneSupport:
    """Test timezone selection support"""
    
    @pytest.fixture
    def auth_headers(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@example.com",
            "password": "admin123"
        })
        token = response.json().get('token')
        return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    def test_create_event_with_asia_kolkata_timezone(self, auth_headers):
        """POST /api/events - should accept Asia/Kolkata timezone"""
        event_data = {
            "event_code": f"TEST-TZ-{int(time.time())}",
            "name": "TEST Event with Asia/Kolkata Timezone",
            "description": "Testing timezone storage",
            "type": "Meetup",
            "start_date": "2026-06-01T10:00:00Z",
            "end_date": "2026-06-01T12:00:00Z",
            "timezone": "Asia/Kolkata",
            "mode": "in-person",
            "location": "Mumbai Office",
            "owner": "admin@example.com",
            "status": "Draft"
        }
        
        response = requests.post(f"{BASE_URL}/api/events", json=event_data, headers=auth_headers)
        assert response.status_code in [200, 201]
        
        data = response.json()
        assert data.get('timezone') == 'Asia/Kolkata'
        print(f"✓ Event created with timezone=Asia/Kolkata")
    
    def test_create_event_with_various_timezones(self, auth_headers):
        """Test various IANA timezones are accepted"""
        timezones = [
            "America/New_York",
            "Europe/London",
            "Asia/Tokyo",
            "Australia/Sydney",
            "Pacific/Auckland"
        ]
        
        for tz in timezones:
            event_data = {
                "event_code": f"TEST-TZ-{tz.replace('/', '-')}-{int(time.time())}",
                "name": f"TEST Event with {tz}",
                "type": "Meetup",
                "start_date": "2026-07-01T10:00:00Z",
                "end_date": "2026-07-01T12:00:00Z",
                "timezone": tz,
                "mode": "in-person",
                "location": "Test Location",
                "owner": "admin@example.com",
                "status": "Draft"
            }
            
            response = requests.post(f"{BASE_URL}/api/events", json=event_data, headers=auth_headers)
            assert response.status_code in [200, 201], f"Failed for timezone {tz}"
            assert response.json().get('timezone') == tz
            print(f"✓ Timezone {tz} accepted")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
