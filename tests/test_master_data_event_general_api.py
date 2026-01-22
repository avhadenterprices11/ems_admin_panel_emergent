"""
Test suite for Master Data APIs (Categories, Tags, Users) and Event General Details APIs
Tests: GET /api/master/categories, POST /api/master/categories, GET /api/master/tags, POST /api/master/tags,
       GET /api/master/users, GET /api/events/:eventId/general, PUT /api/events/:eventId/general
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://eventsphere-20.preview.emergentagent.com').rstrip('/')

@pytest.fixture(scope="module")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


class TestMasterDataCategories:
    """Test Master Data - Categories APIs"""
    
    def test_get_categories_returns_list(self, api_client):
        """GET /api/master/categories returns list of categories"""
        response = api_client.get(f"{BASE_URL}/api/master/categories")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        
        # Verify category structure
        category = data[0]
        assert "id" in category
        assert "name" in category
        assert "slug" in category
        assert "is_active" in category
        
    def test_get_categories_contains_expected_categories(self, api_client):
        """GET /api/master/categories contains seeded categories"""
        response = api_client.get(f"{BASE_URL}/api/master/categories")
        assert response.status_code == 200
        
        data = response.json()
        category_names = [c["name"] for c in data]
        
        # Check for expected seeded categories
        expected_categories = ["Conference", "Workshop", "Meetup", "Awards", "Webinar", "Networking", "Training", "Seminar"]
        for expected in expected_categories:
            assert expected in category_names, f"Expected category '{expected}' not found"
    
    def test_create_category_success(self, api_client):
        """POST /api/master/categories creates new category"""
        payload = {
            "name": "TEST_NewCategory_001",
            "description": "Test category description"
        }
        response = api_client.post(f"{BASE_URL}/api/master/categories", json=payload)
        assert response.status_code == 201
        
        data = response.json()
        assert data["name"] == payload["name"]
        assert data["description"] == payload["description"]
        assert data["slug"] == "test-newcategory-001"
        assert data["is_active"] == True
        assert "id" in data
        
        # Cleanup
        api_client.delete(f"{BASE_URL}/api/master/categories/{data['id']}")
    
    def test_create_category_without_name_fails(self, api_client):
        """POST /api/master/categories without name returns 400"""
        payload = {"description": "No name provided"}
        response = api_client.post(f"{BASE_URL}/api/master/categories", json=payload)
        assert response.status_code == 400
        
        data = response.json()
        assert "message" in data
    
    def test_create_duplicate_category_fails(self, api_client):
        """POST /api/master/categories with duplicate name returns 409"""
        # Create first category
        payload = {"name": "TEST_DuplicateCategory"}
        response1 = api_client.post(f"{BASE_URL}/api/master/categories", json=payload)
        assert response1.status_code == 201
        category_id = response1.json()["id"]
        
        # Try to create duplicate
        response2 = api_client.post(f"{BASE_URL}/api/master/categories", json=payload)
        assert response2.status_code == 409
        
        # Cleanup
        api_client.delete(f"{BASE_URL}/api/master/categories/{category_id}")


class TestMasterDataTags:
    """Test Master Data - Tags APIs"""
    
    def test_get_tags_returns_list(self, api_client):
        """GET /api/master/tags returns list of tags"""
        response = api_client.get(f"{BASE_URL}/api/master/tags")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        
        # Verify tag structure
        tag = data[0]
        assert "id" in tag
        assert "name" in tag
        assert "slug" in tag
        assert "color" in tag
        assert "is_active" in tag
    
    def test_get_tags_contains_expected_tags(self, api_client):
        """GET /api/master/tags contains seeded tags"""
        response = api_client.get(f"{BASE_URL}/api/master/tags")
        assert response.status_code == 200
        
        data = response.json()
        tag_names = [t["name"] for t in data]
        
        # Check for expected seeded tags
        expected_tags = ["Technology", "Business", "Innovation", "Networking", "Startup", "AI", "Design"]
        for expected in expected_tags:
            assert expected in tag_names, f"Expected tag '{expected}' not found"
    
    def test_get_tags_with_search_filter(self, api_client):
        """GET /api/master/tags?search=Tech filters results"""
        response = api_client.get(f"{BASE_URL}/api/master/tags", params={"search": "Tech"})
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        # Should find Technology tag
        assert len(data) >= 1
        assert any("Tech" in t["name"] for t in data)
    
    def test_create_tag_success(self, api_client):
        """POST /api/master/tags creates new tag"""
        payload = {
            "name": "TEST_NewTag_001",
            "color": "#FF5733"
        }
        response = api_client.post(f"{BASE_URL}/api/master/tags", json=payload)
        assert response.status_code == 201
        
        data = response.json()
        assert data["name"] == payload["name"]
        assert data["color"] == payload["color"]
        assert data["slug"] == "test-newtag-001"
        assert data["is_active"] == True
        assert "id" in data
        
        # Cleanup
        api_client.delete(f"{BASE_URL}/api/master/tags/{data['id']}")
    
    def test_create_tag_without_name_fails(self, api_client):
        """POST /api/master/tags without name returns 400"""
        payload = {"color": "#FF5733"}
        response = api_client.post(f"{BASE_URL}/api/master/tags", json=payload)
        assert response.status_code == 400
        
        data = response.json()
        assert "message" in data
    
    def test_create_tag_generates_random_color_if_not_provided(self, api_client):
        """POST /api/master/tags generates random color if not provided"""
        payload = {"name": "TEST_TagNoColor"}
        response = api_client.post(f"{BASE_URL}/api/master/tags", json=payload)
        assert response.status_code == 201
        
        data = response.json()
        assert "color" in data
        assert data["color"].startswith("#")
        
        # Cleanup
        api_client.delete(f"{BASE_URL}/api/master/tags/{data['id']}")


class TestMasterDataUsers:
    """Test Master Data - Users API"""
    
    def test_get_users_returns_list(self, api_client):
        """GET /api/master/users returns list of users"""
        response = api_client.get(f"{BASE_URL}/api/master/users")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        
        # Verify user structure
        user = data[0]
        assert "id" in user
        assert "name" in user
        assert "email" in user
    
    def test_get_users_contains_admin_user(self, api_client):
        """GET /api/master/users contains admin user"""
        response = api_client.get(f"{BASE_URL}/api/master/users")
        assert response.status_code == 200
        
        data = response.json()
        admin_users = [u for u in data if u["email"] == "admin@example.com"]
        assert len(admin_users) == 1
        assert admin_users[0]["name"] == "Admin User"


class TestEventGeneralDetails:
    """Test Event General Details APIs (Settings Tab)"""
    
    def test_get_event_general_details_success(self, api_client):
        """GET /api/events/:eventId/general returns full event details"""
        response = api_client.get(f"{BASE_URL}/api/events/1/general")
        assert response.status_code == 200
        
        data = response.json()
        
        # Basic Info
        assert "id" in data
        assert "event_code" in data
        assert "name" in data
        assert "description" in data
        assert "category_id" in data
        assert "category" in data
        assert "type" in data
        assert "visibility" in data
        assert "owner" in data
        
        # Tags and Co-hosts
        assert "tags" in data
        assert isinstance(data["tags"], list)
        assert "co_hosts" in data
        assert isinstance(data["co_hosts"], list)
        
        # Date & Time
        assert "start_date" in data
        assert "end_date" in data
        assert "all_day" in data
        assert "timezone" in data
        
        # Registration
        assert "capacity" in data
        assert "waitlist_enabled" in data
        
        # Location
        assert "mode" in data
        assert "venue_name" in data
        assert "city" in data
        assert "country" in data
        assert "meeting_url" in data
        
        # Media
        assert "promo_video_url" in data
        assert "event_media" in data
        
        # Accessibility & Safety
        assert "accessibility_notes" in data
        assert "emergency_contact" in data
    
    def test_get_event_general_details_includes_category_object(self, api_client):
        """GET /api/events/:eventId/general includes category object with id, name, slug"""
        response = api_client.get(f"{BASE_URL}/api/events/1/general")
        assert response.status_code == 200
        
        data = response.json()
        if data["category"]:
            assert "id" in data["category"]
            assert "name" in data["category"]
            assert "slug" in data["category"]
    
    def test_get_event_general_details_includes_tags_array(self, api_client):
        """GET /api/events/:eventId/general includes tags array with full tag objects"""
        response = api_client.get(f"{BASE_URL}/api/events/1/general")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data["tags"], list)
        if len(data["tags"]) > 0:
            tag = data["tags"][0]
            assert "id" in tag
            assert "name" in tag
            assert "slug" in tag
            assert "color" in tag
    
    def test_get_event_general_details_invalid_id_returns_400(self, api_client):
        """GET /api/events/invalid/general returns 400"""
        response = api_client.get(f"{BASE_URL}/api/events/invalid/general")
        assert response.status_code == 400
    
    def test_get_event_general_details_not_found_returns_404(self, api_client):
        """GET /api/events/99999/general returns 404"""
        response = api_client.get(f"{BASE_URL}/api/events/99999/general")
        assert response.status_code == 404
    
    def test_update_event_general_details_basic_info(self, api_client):
        """PUT /api/events/:eventId/general updates basic info fields"""
        # Get current data
        get_response = api_client.get(f"{BASE_URL}/api/events/1/general")
        original_data = get_response.json()
        
        # Update basic info
        update_payload = {
            "name": "TEST_Updated Event Name",
            "description": "TEST_Updated description",
            "visibility": "private"
        }
        response = api_client.put(f"{BASE_URL}/api/events/1/general", json=update_payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["name"] == update_payload["name"]
        assert data["description"] == update_payload["description"]
        assert data["visibility"] == update_payload["visibility"]
        
        # Restore original data
        restore_payload = {
            "name": original_data["name"],
            "description": original_data["description"],
            "visibility": original_data["visibility"]
        }
        api_client.put(f"{BASE_URL}/api/events/1/general", json=restore_payload)
    
    def test_update_event_general_details_tag_assignment(self, api_client):
        """PUT /api/events/:eventId/general with tag_ids updates event tags"""
        # Get current tags
        get_response = api_client.get(f"{BASE_URL}/api/events/1/general")
        original_tags = [t["id"] for t in get_response.json()["tags"]]
        
        # Update with new tags
        update_payload = {"tag_ids": [1, 3, 5]}  # Technology, Innovation, Startup
        response = api_client.put(f"{BASE_URL}/api/events/1/general", json=update_payload)
        assert response.status_code == 200
        
        data = response.json()
        updated_tag_ids = [t["id"] for t in data["tags"]]
        assert set(updated_tag_ids) == set([1, 3, 5])
        
        # Restore original tags
        api_client.put(f"{BASE_URL}/api/events/1/general", json={"tag_ids": original_tags})
    
    def test_update_event_general_details_cohost_assignment(self, api_client):
        """PUT /api/events/:eventId/general with cohost_ids updates co-hosts"""
        # Get current co-hosts
        get_response = api_client.get(f"{BASE_URL}/api/events/1/general")
        original_cohosts = [c["user_id"] for c in get_response.json()["co_hosts"]]
        
        # Update with co-host
        update_payload = {"cohost_ids": [1]}  # Admin User
        response = api_client.put(f"{BASE_URL}/api/events/1/general", json=update_payload)
        assert response.status_code == 200
        
        data = response.json()
        assert len(data["co_hosts"]) == 1
        assert data["co_hosts"][0]["user_id"] == 1
        assert data["co_hosts"][0]["name"] == "Admin User"
        assert data["co_hosts"][0]["role"] == "cohost"
        
        # Restore original co-hosts
        api_client.put(f"{BASE_URL}/api/events/1/general", json={"cohost_ids": original_cohosts})
    
    def test_update_event_general_details_location_fields(self, api_client):
        """PUT /api/events/:eventId/general updates location fields"""
        # Get current data
        get_response = api_client.get(f"{BASE_URL}/api/events/1/general")
        original_data = get_response.json()
        
        # Update location
        update_payload = {
            "mode": "virtual",
            "venue_name": "TEST_Virtual Venue",
            "meeting_url": "https://zoom.us/test123"
        }
        response = api_client.put(f"{BASE_URL}/api/events/1/general", json=update_payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["mode"] == "virtual"
        assert data["venue_name"] == "TEST_Virtual Venue"
        assert data["meeting_url"] == "https://zoom.us/test123"
        
        # Restore original data
        restore_payload = {
            "mode": original_data["mode"],
            "venue_name": original_data["venue_name"],
            "meeting_url": original_data["meeting_url"]
        }
        api_client.put(f"{BASE_URL}/api/events/1/general", json=restore_payload)
    
    def test_update_event_general_details_accessibility_safety(self, api_client):
        """PUT /api/events/:eventId/general updates accessibility and safety fields"""
        # Get current data
        get_response = api_client.get(f"{BASE_URL}/api/events/1/general")
        original_data = get_response.json()
        
        # Update accessibility & safety
        update_payload = {
            "accessibility_notes": "TEST_Wheelchair accessible, sign language interpreter available",
            "emergency_contact": "+1-555-TEST-123"
        }
        response = api_client.put(f"{BASE_URL}/api/events/1/general", json=update_payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["accessibility_notes"] == update_payload["accessibility_notes"]
        assert data["emergency_contact"] == update_payload["emergency_contact"]
        
        # Restore original data
        restore_payload = {
            "accessibility_notes": original_data["accessibility_notes"],
            "emergency_contact": original_data["emergency_contact"]
        }
        api_client.put(f"{BASE_URL}/api/events/1/general", json=restore_payload)
    
    def test_update_event_general_details_promo_video_url(self, api_client):
        """PUT /api/events/:eventId/general updates promo video URL"""
        # Get current data
        get_response = api_client.get(f"{BASE_URL}/api/events/1/general")
        original_url = get_response.json()["promo_video_url"]
        
        # Update promo video URL
        update_payload = {"promo_video_url": "https://youtube.com/watch?v=TEST123"}
        response = api_client.put(f"{BASE_URL}/api/events/1/general", json=update_payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["promo_video_url"] == update_payload["promo_video_url"]
        
        # Restore original URL
        api_client.put(f"{BASE_URL}/api/events/1/general", json={"promo_video_url": original_url})
    
    def test_update_event_general_details_invalid_event_returns_404(self, api_client):
        """PUT /api/events/99999/general returns 404"""
        update_payload = {"name": "Test"}
        response = api_client.put(f"{BASE_URL}/api/events/99999/general", json=update_payload)
        assert response.status_code == 404


class TestEventMedia:
    """Test Event Media APIs"""
    
    def test_get_event_media_returns_list(self, api_client):
        """GET /api/events/:eventId/media returns list of media"""
        response = api_client.get(f"{BASE_URL}/api/events/1/media")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
    
    def test_add_and_delete_event_media(self, api_client):
        """POST /api/events/:eventId/media adds media, DELETE removes it"""
        # Add media
        media_payload = {
            "file_key": "test/test-image.jpg",
            "url": "https://example.com/test-image.jpg",
            "file_type": "image/jpeg",
            "media_type": "gallery",
            "size": 1024,
            "original_name": "test-image.jpg"
        }
        add_response = api_client.post(f"{BASE_URL}/api/events/1/media", json=media_payload)
        assert add_response.status_code == 201
        
        media_data = add_response.json()
        assert media_data["file_key"] == media_payload["file_key"]
        assert media_data["url"] == media_payload["url"]
        assert media_data["media_type"] == media_payload["media_type"]
        assert "id" in media_data
        
        media_id = media_data["id"]
        
        # Delete media
        delete_response = api_client.delete(f"{BASE_URL}/api/events/1/media/{media_id}")
        assert delete_response.status_code == 200
        
        # Verify deleted
        get_response = api_client.get(f"{BASE_URL}/api/events/1/media")
        media_list = get_response.json()
        media_ids = [m["id"] for m in media_list]
        assert media_id not in media_ids
    
    def test_add_media_missing_required_fields_returns_400(self, api_client):
        """POST /api/events/:eventId/media without required fields returns 400"""
        media_payload = {"url": "https://example.com/test.jpg"}  # Missing file_key, file_type, media_type
        response = api_client.post(f"{BASE_URL}/api/events/1/media", json=media_payload)
        assert response.status_code == 400


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
