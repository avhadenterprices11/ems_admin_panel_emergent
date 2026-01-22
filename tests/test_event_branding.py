"""
Test Event Branding APIs
Tests for GET, PUT, POST (reset) branding endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('VITE_API_URL', 'https://eventsphere-20.preview.emergentagent.com')

class TestEventBrandingAPI:
    """Event Branding API Tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test fixtures"""
        self.event_id = 1  # Event 1 exists per test context
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
    
    # ==================== GET Branding Tests ====================
    
    def test_get_branding_returns_200(self):
        """GET /api/events/1/branding returns 200"""
        response = self.session.get(f"{BASE_URL}/api/events/{self.event_id}/branding")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print(f"✓ GET branding returns 200")
    
    def test_get_branding_returns_correct_structure(self):
        """GET /api/events/1/branding returns correct data structure"""
        response = self.session.get(f"{BASE_URL}/api/events/{self.event_id}/branding")
        assert response.status_code == 200
        
        data = response.json()
        
        # Check required fields exist
        required_fields = ['id', 'event_id', 'light_logo_url', 'dark_logo_url', 
                          'cover_image_url', 'primary_color', 'secondary_color', 
                          'font_family', 'updated_at', 'created_at']
        
        for field in required_fields:
            assert field in data, f"Missing field: {field}"
        
        print(f"✓ GET branding returns correct structure with all required fields")
    
    def test_get_branding_returns_default_values(self):
        """GET /api/events/1/branding returns default values"""
        response = self.session.get(f"{BASE_URL}/api/events/{self.event_id}/branding")
        assert response.status_code == 200
        
        data = response.json()
        
        # Verify event_id matches
        assert data['event_id'] == self.event_id, f"Expected event_id {self.event_id}, got {data['event_id']}"
        
        # Verify default colors (after reset or initial state)
        # Note: These may have been modified, so we just check format
        assert data['primary_color'].startswith('#'), "Primary color should be hex format"
        assert data['secondary_color'].startswith('#'), "Secondary color should be hex format"
        
        # Verify font_family is valid
        valid_fonts = ['inter', 'roboto', 'poppins', 'open-sans', 'lato', 'montserrat']
        assert data['font_family'] in valid_fonts, f"Invalid font_family: {data['font_family']}"
        
        print(f"✓ GET branding returns valid values - primary: {data['primary_color']}, secondary: {data['secondary_color']}, font: {data['font_family']}")
    
    def test_get_branding_invalid_event_returns_404(self):
        """GET /api/events/99999/branding returns 404 for non-existent event"""
        response = self.session.get(f"{BASE_URL}/api/events/99999/branding")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print(f"✓ GET branding for non-existent event returns 404")
    
    def test_get_branding_invalid_event_id_returns_400(self):
        """GET /api/events/invalid/branding returns 400 for invalid event ID"""
        response = self.session.get(f"{BASE_URL}/api/events/invalid/branding")
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print(f"✓ GET branding for invalid event ID returns 400")
    
    # ==================== PUT Branding Tests ====================
    
    def test_update_branding_primary_color(self):
        """PUT /api/events/1/branding updates primary color"""
        update_data = {"primary_color": "#ff5733"}
        
        response = self.session.put(
            f"{BASE_URL}/api/events/{self.event_id}/branding",
            json=update_data
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data['primary_color'] == "#ff5733", f"Expected #ff5733, got {data['primary_color']}"
        
        # Verify persistence with GET
        get_response = self.session.get(f"{BASE_URL}/api/events/{self.event_id}/branding")
        get_data = get_response.json()
        assert get_data['primary_color'] == "#ff5733", "Primary color not persisted"
        
        print(f"✓ PUT branding updates primary color successfully")
    
    def test_update_branding_secondary_color(self):
        """PUT /api/events/1/branding updates secondary color"""
        update_data = {"secondary_color": "#33ff57"}
        
        response = self.session.put(
            f"{BASE_URL}/api/events/{self.event_id}/branding",
            json=update_data
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data['secondary_color'] == "#33ff57", f"Expected #33ff57, got {data['secondary_color']}"
        
        print(f"✓ PUT branding updates secondary color successfully")
    
    def test_update_branding_font_family(self):
        """PUT /api/events/1/branding updates font family"""
        update_data = {"font_family": "roboto"}
        
        response = self.session.put(
            f"{BASE_URL}/api/events/{self.event_id}/branding",
            json=update_data
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data['font_family'] == "roboto", f"Expected roboto, got {data['font_family']}"
        
        print(f"✓ PUT branding updates font family successfully")
    
    def test_update_branding_all_fonts(self):
        """PUT /api/events/1/branding accepts all 6 valid font families"""
        valid_fonts = ['inter', 'roboto', 'poppins', 'open-sans', 'lato', 'montserrat']
        
        for font in valid_fonts:
            response = self.session.put(
                f"{BASE_URL}/api/events/{self.event_id}/branding",
                json={"font_family": font}
            )
            assert response.status_code == 200, f"Failed for font: {font}"
            data = response.json()
            assert data['font_family'] == font, f"Expected {font}, got {data['font_family']}"
        
        print(f"✓ PUT branding accepts all 6 font families: {', '.join(valid_fonts)}")
    
    def test_update_branding_invalid_font_returns_400(self):
        """PUT /api/events/1/branding returns 400 for invalid font family"""
        update_data = {"font_family": "invalid-font"}
        
        response = self.session.put(
            f"{BASE_URL}/api/events/{self.event_id}/branding",
            json=update_data
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        
        print(f"✓ PUT branding rejects invalid font family with 400")
    
    def test_update_branding_invalid_primary_color_returns_400(self):
        """PUT /api/events/1/branding returns 400 for invalid primary color format"""
        update_data = {"primary_color": "not-a-color"}
        
        response = self.session.put(
            f"{BASE_URL}/api/events/{self.event_id}/branding",
            json=update_data
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        
        print(f"✓ PUT branding rejects invalid primary color with 400")
    
    def test_update_branding_invalid_secondary_color_returns_400(self):
        """PUT /api/events/1/branding returns 400 for invalid secondary color format"""
        update_data = {"secondary_color": "rgb(255,0,0)"}
        
        response = self.session.put(
            f"{BASE_URL}/api/events/{self.event_id}/branding",
            json=update_data
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        
        print(f"✓ PUT branding rejects invalid secondary color with 400")
    
    def test_update_branding_logo_urls(self):
        """PUT /api/events/1/branding updates logo URLs"""
        update_data = {
            "light_logo_url": "https://example.com/light-logo.png",
            "dark_logo_url": "https://example.com/dark-logo.png"
        }
        
        response = self.session.put(
            f"{BASE_URL}/api/events/{self.event_id}/branding",
            json=update_data
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data['light_logo_url'] == "https://example.com/light-logo.png"
        assert data['dark_logo_url'] == "https://example.com/dark-logo.png"
        
        print(f"✓ PUT branding updates logo URLs successfully")
    
    def test_update_branding_cover_image_url(self):
        """PUT /api/events/1/branding updates cover image URL"""
        update_data = {"cover_image_url": "https://example.com/cover.jpg"}
        
        response = self.session.put(
            f"{BASE_URL}/api/events/{self.event_id}/branding",
            json=update_data
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data['cover_image_url'] == "https://example.com/cover.jpg"
        
        print(f"✓ PUT branding updates cover image URL successfully")
    
    def test_update_branding_multiple_fields(self):
        """PUT /api/events/1/branding updates multiple fields at once"""
        update_data = {
            "primary_color": "#123456",
            "secondary_color": "#654321",
            "font_family": "poppins"
        }
        
        response = self.session.put(
            f"{BASE_URL}/api/events/{self.event_id}/branding",
            json=update_data
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data['primary_color'] == "#123456"
        assert data['secondary_color'] == "#654321"
        assert data['font_family'] == "poppins"
        
        print(f"✓ PUT branding updates multiple fields successfully")
    
    # ==================== POST Reset Branding Tests ====================
    
    def test_reset_branding_returns_200(self):
        """POST /api/events/1/branding/reset returns 200"""
        response = self.session.post(f"{BASE_URL}/api/events/{self.event_id}/branding/reset")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print(f"✓ POST reset branding returns 200")
    
    def test_reset_branding_restores_defaults(self):
        """POST /api/events/1/branding/reset restores default values"""
        # First, update to non-default values
        self.session.put(
            f"{BASE_URL}/api/events/{self.event_id}/branding",
            json={
                "primary_color": "#aabbcc",
                "secondary_color": "#ccbbaa",
                "font_family": "montserrat"
            }
        )
        
        # Reset to defaults
        response = self.session.post(f"{BASE_URL}/api/events/{self.event_id}/branding/reset")
        assert response.status_code == 200
        
        data = response.json()
        
        # Verify default values
        assert data['primary_color'] == "#0f172b", f"Expected #0f172b, got {data['primary_color']}"
        assert data['secondary_color'] == "#3b82f6", f"Expected #3b82f6, got {data['secondary_color']}"
        assert data['font_family'] == "inter", f"Expected inter, got {data['font_family']}"
        assert data['light_logo_url'] is None, "light_logo_url should be null after reset"
        assert data['dark_logo_url'] is None, "dark_logo_url should be null after reset"
        assert data['cover_image_url'] is None, "cover_image_url should be null after reset"
        
        print(f"✓ POST reset branding restores all default values")
    
    def test_reset_branding_persists(self):
        """POST /api/events/1/branding/reset persists reset values"""
        # Reset
        self.session.post(f"{BASE_URL}/api/events/{self.event_id}/branding/reset")
        
        # Verify with GET
        response = self.session.get(f"{BASE_URL}/api/events/{self.event_id}/branding")
        data = response.json()
        
        assert data['primary_color'] == "#0f172b"
        assert data['secondary_color'] == "#3b82f6"
        assert data['font_family'] == "inter"
        
        print(f"✓ POST reset branding persists correctly")
    
    def test_reset_branding_invalid_event_returns_404(self):
        """POST /api/events/99999/branding/reset returns 404 for non-existent event"""
        response = self.session.post(f"{BASE_URL}/api/events/99999/branding/reset")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print(f"✓ POST reset branding for non-existent event returns 404")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
