"""
Privacy Settings API Tests
Tests for Data & Privacy settings feature including:
- GET /api/events/{eventId}/privacy-settings - Fetch privacy settings with global fallback
- PUT /api/events/{eventId}/privacy-settings - Update event-specific privacy settings
- POST /api/events/{eventId}/privacy-settings/reset - Reset to global defaults
- GET /api/events/{eventId}/privacy-settings/export - Export full event data as CSV
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://datapolicyhub.preview.emergentagent.com').rstrip('/')
EVENT_ID = 1


class TestPrivacySettingsAPI:
    """Privacy Settings API endpoint tests"""

    # ============================================================================
    # GET /api/events/{eventId}/privacy-settings
    # ============================================================================
    
    def test_get_privacy_settings_success(self):
        """Test fetching privacy settings for an event"""
        response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/privacy-settings")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Verify required fields exist
        assert 'gdpr_consent_enabled' in data
        assert 'privacy_policy_url' in data
        assert 'data_retention_days' in data
        assert 'cookie_consent_enabled' in data
        assert 'is_global_default' in data
        
        # Verify data types
        assert isinstance(data['gdpr_consent_enabled'], bool)
        assert isinstance(data['cookie_consent_enabled'], bool)
        assert data['data_retention_days'] in ['90', '180', '365', 'forever']
        
    def test_get_privacy_settings_invalid_event_id(self):
        """Test fetching privacy settings with invalid event ID"""
        response = requests.get(f"{BASE_URL}/api/events/invalid/privacy-settings")
        
        assert response.status_code == 400
        data = response.json()
        assert 'message' in data
        
    def test_get_privacy_settings_nonexistent_event(self):
        """Test fetching privacy settings for non-existent event returns global defaults"""
        response = requests.get(f"{BASE_URL}/api/events/99999/privacy-settings")
        
        # Should return 200 with global defaults
        assert response.status_code == 200
        data = response.json()
        assert data.get('is_global_default') == True

    # ============================================================================
    # PUT /api/events/{eventId}/privacy-settings
    # ============================================================================
    
    def test_update_privacy_settings_gdpr_enabled(self):
        """Test enabling GDPR consent"""
        payload = {
            "gdpr_consent_enabled": True
        }
        
        response = requests.put(
            f"{BASE_URL}/api/events/{EVENT_ID}/privacy-settings",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert 'message' in data
        assert 'settings' in data
        assert data['settings']['gdpr_consent_enabled'] == True
        assert data['settings']['is_global_default'] == False
        
    def test_update_privacy_settings_privacy_policy_url(self):
        """Test updating privacy policy URL"""
        test_url = "https://example.com/privacy-policy"
        payload = {
            "privacy_policy_url": test_url
        }
        
        response = requests.put(
            f"{BASE_URL}/api/events/{EVENT_ID}/privacy-settings",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200
        
        data = response.json()
        assert data['settings']['privacy_policy_url'] == test_url
        
        # Verify persistence with GET
        get_response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/privacy-settings")
        assert get_response.status_code == 200
        get_data = get_response.json()
        assert get_data['privacy_policy_url'] == test_url
        
    def test_update_privacy_settings_data_retention_90_days(self):
        """Test setting data retention to 90 days"""
        payload = {
            "data_retention_days": "90"
        }
        
        response = requests.put(
            f"{BASE_URL}/api/events/{EVENT_ID}/privacy-settings",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data['settings']['data_retention_days'] == '90'
        
    def test_update_privacy_settings_data_retention_180_days(self):
        """Test setting data retention to 180 days"""
        payload = {
            "data_retention_days": "180"
        }
        
        response = requests.put(
            f"{BASE_URL}/api/events/{EVENT_ID}/privacy-settings",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data['settings']['data_retention_days'] == '180'
        
    def test_update_privacy_settings_data_retention_365_days(self):
        """Test setting data retention to 365 days"""
        payload = {
            "data_retention_days": "365"
        }
        
        response = requests.put(
            f"{BASE_URL}/api/events/{EVENT_ID}/privacy-settings",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data['settings']['data_retention_days'] == '365'
        
    def test_update_privacy_settings_data_retention_forever(self):
        """Test setting data retention to forever"""
        payload = {
            "data_retention_days": "forever"
        }
        
        response = requests.put(
            f"{BASE_URL}/api/events/{EVENT_ID}/privacy-settings",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data['settings']['data_retention_days'] == 'forever'
        
    def test_update_privacy_settings_invalid_data_retention(self):
        """Test setting invalid data retention value"""
        payload = {
            "data_retention_days": "invalid"
        }
        
        response = requests.put(
            f"{BASE_URL}/api/events/{EVENT_ID}/privacy-settings",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 400
        data = response.json()
        assert 'message' in data
        
    def test_update_privacy_settings_cookie_consent(self):
        """Test enabling cookie consent"""
        payload = {
            "cookie_consent_enabled": True
        }
        
        response = requests.put(
            f"{BASE_URL}/api/events/{EVENT_ID}/privacy-settings",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data['settings']['cookie_consent_enabled'] == True
        
    def test_update_privacy_settings_custom_consent_text(self):
        """Test setting custom consent text"""
        custom_text = "I consent to the processing of my personal data for event registration purposes."
        payload = {
            "gdpr_consent_enabled": True,
            "custom_consent_text": custom_text
        }
        
        response = requests.put(
            f"{BASE_URL}/api/events/{EVENT_ID}/privacy-settings",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data['settings']['custom_consent_text'] == custom_text
        
    def test_update_privacy_settings_multiple_fields(self):
        """Test updating multiple fields at once"""
        payload = {
            "gdpr_consent_enabled": True,
            "privacy_policy_url": "https://test.com/privacy",
            "data_retention_days": "180",
            "cookie_consent_enabled": True
        }
        
        response = requests.put(
            f"{BASE_URL}/api/events/{EVENT_ID}/privacy-settings",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200
        data = response.json()
        settings = data['settings']
        
        assert settings['gdpr_consent_enabled'] == True
        assert settings['privacy_policy_url'] == "https://test.com/privacy"
        assert settings['data_retention_days'] == '180'
        assert settings['cookie_consent_enabled'] == True

    # ============================================================================
    # POST /api/events/{eventId}/privacy-settings/reset
    # ============================================================================
    
    def test_reset_to_global_defaults(self):
        """Test resetting event settings to global defaults"""
        # First, set some custom settings
        custom_payload = {
            "gdpr_consent_enabled": True,
            "privacy_policy_url": "https://custom.com/privacy",
            "data_retention_days": "90"
        }
        
        update_response = requests.put(
            f"{BASE_URL}/api/events/{EVENT_ID}/privacy-settings",
            json=custom_payload,
            headers={"Content-Type": "application/json"}
        )
        assert update_response.status_code == 200
        
        # Verify custom settings are applied
        get_response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/privacy-settings")
        assert get_response.json()['is_global_default'] == False
        
        # Reset to global
        reset_response = requests.post(f"{BASE_URL}/api/events/{EVENT_ID}/privacy-settings/reset")
        
        assert reset_response.status_code == 200
        data = reset_response.json()
        assert 'message' in data
        assert 'settings' in data
        assert data['settings']['is_global_default'] == True
        
    def test_reset_returns_global_settings(self):
        """Test that reset returns the global default settings"""
        response = requests.post(f"{BASE_URL}/api/events/{EVENT_ID}/privacy-settings/reset")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify it returns global settings
        assert data['settings']['is_global_default'] == True
        assert data['settings']['event_id'] is None

    # ============================================================================
    # GET /api/events/{eventId}/privacy-settings/export
    # ============================================================================
    
    def test_export_event_data_csv(self):
        """Test exporting event data as CSV"""
        response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/privacy-settings/export")
        
        assert response.status_code == 200
        
        # Verify content type is CSV
        content_type = response.headers.get('Content-Type', '')
        assert 'text/csv' in content_type
        
        # Verify content disposition header for download
        content_disposition = response.headers.get('Content-Disposition', '')
        assert 'attachment' in content_disposition
        assert '.csv' in content_disposition
        
    def test_export_event_data_csv_content(self):
        """Test that exported CSV contains expected sections"""
        response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/privacy-settings/export")
        
        assert response.status_code == 200
        
        csv_content = response.text
        
        # Verify CSV contains expected sections
        assert '=== REGISTRATIONS ===' in csv_content
        assert '=== ATTENDEES ===' in csv_content
        assert '=== ISSUED TICKETS ===' in csv_content
        assert '=== BOOKINGS ===' in csv_content
        
    def test_export_event_data_invalid_event_id(self):
        """Test exporting data with invalid event ID"""
        response = requests.get(f"{BASE_URL}/api/events/invalid/privacy-settings/export")
        
        assert response.status_code == 400


class TestPrivacySettingsGlobalFallback:
    """Tests for global fallback behavior"""
    
    def test_new_event_uses_global_defaults(self):
        """Test that a new event without custom settings uses global defaults"""
        # Use a high event ID that likely doesn't have custom settings
        response = requests.get(f"{BASE_URL}/api/events/99999/privacy-settings")
        
        assert response.status_code == 200
        data = response.json()
        assert data['is_global_default'] == True
        
    def test_event_with_custom_settings_not_global(self):
        """Test that event with custom settings shows is_global_default=false"""
        # First set custom settings
        payload = {"gdpr_consent_enabled": True}
        requests.put(
            f"{BASE_URL}/api/events/{EVENT_ID}/privacy-settings",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        # Verify it's not using global defaults
        response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/privacy-settings")
        assert response.status_code == 200
        data = response.json()
        assert data['is_global_default'] == False


class TestPrivacySettingsValidation:
    """Tests for input validation"""
    
    def test_invalid_event_id_format(self):
        """Test with non-numeric event ID"""
        response = requests.get(f"{BASE_URL}/api/events/abc/privacy-settings")
        assert response.status_code == 400
        
    def test_empty_update_payload(self):
        """Test update with empty payload"""
        response = requests.put(
            f"{BASE_URL}/api/events/{EVENT_ID}/privacy-settings",
            json={},
            headers={"Content-Type": "application/json"}
        )
        # Should succeed but not change anything
        assert response.status_code == 200
        
    def test_null_privacy_policy_url(self):
        """Test setting privacy policy URL to null"""
        payload = {"privacy_policy_url": None}
        
        response = requests.put(
            f"{BASE_URL}/api/events/{EVENT_ID}/privacy-settings",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data['settings']['privacy_policy_url'] is None


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
