"""
Email Templates API Tests
Tests for Event Detail → Settings → Email Configuration feature
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://datapolicyhub.preview.emergentagent.com')
TEST_EVENT_ID = 1

# Valid email scenarios
VALID_SCENARIOS = [
    'registration_complete',
    'payment_successful',
    'event_reminder',
    'event_cancelled',
    'post_event_followup'
]


class TestEmailTemplatesGet:
    """Test GET /api/events/{eventId}/email-templates"""
    
    def test_get_email_templates_success(self):
        """Should return all 5 email scenarios with global fallback"""
        response = requests.get(f"{BASE_URL}/api/events/{TEST_EVENT_ID}/email-templates")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert 'templates' in data
        assert 'emailProviderStatus' in data
        
        templates = data['templates']
        assert len(templates) == 5, f"Expected 5 scenarios, got {len(templates)}"
        
        # Verify all scenarios are present
        scenarios = [t['scenario'] for t in templates]
        for scenario in VALID_SCENARIOS:
            assert scenario in scenarios, f"Missing scenario: {scenario}"
    
    def test_email_template_structure(self):
        """Each template should have required fields"""
        response = requests.get(f"{BASE_URL}/api/events/{TEST_EVENT_ID}/email-templates")
        assert response.status_code == 200
        
        templates = response.json()['templates']
        
        required_fields = [
            'scenario', 'triggerLabel', 'description', 'is_enabled', 
            'has_override', 'source', 'subject', 'body', 'send_timing',
            'globalSubject', 'globalBody', 'variables'
        ]
        
        for template in templates:
            for field in required_fields:
                assert field in template, f"Missing field '{field}' in template {template.get('scenario')}"
    
    def test_email_provider_status_not_configured(self):
        """Email provider status should show not configured"""
        response = requests.get(f"{BASE_URL}/api/events/{TEST_EVENT_ID}/email-templates")
        assert response.status_code == 200
        
        status = response.json()['emailProviderStatus']
        assert 'available' in status
        # Provider is not configured per the test requirements
        assert status['available'] == False
        assert 'error' in status
    
    def test_get_templates_invalid_event_id(self):
        """Should return 400 for invalid event ID"""
        response = requests.get(f"{BASE_URL}/api/events/invalid/email-templates")
        assert response.status_code == 400
    
    def test_get_templates_nonexistent_event(self):
        """Should return templates with global defaults for non-existent event"""
        response = requests.get(f"{BASE_URL}/api/events/99999/email-templates")
        # Should still return 200 with global defaults
        assert response.status_code == 200
        
        templates = response.json()['templates']
        # All should be from global source
        for template in templates:
            assert template['source'] == 'global'


class TestEmailTemplatesSave:
    """Test PUT /api/events/{eventId}/email-templates"""
    
    def test_save_email_templates_enable_override(self):
        """Should save event-specific email templates with override"""
        payload = {
            "scenarios": [
                {
                    "scenario": "registration_complete",
                    "is_enabled": True,
                    "has_override": True,
                    "subject": "TEST - Custom Registration Subject",
                    "body": "TEST - Custom registration body for {{attendee_name}}",
                    "send_timing": "immediate"
                }
            ]
        }
        
        response = requests.put(
            f"{BASE_URL}/api/events/{TEST_EVENT_ID}/email-templates",
            json=payload
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert 'message' in data
        assert 'templates' in data
        
        # Verify the override was saved
        reg_template = next(
            (t for t in data['templates'] if t['scenario'] == 'registration_complete'),
            None
        )
        assert reg_template is not None
        assert reg_template['has_override'] == True
        assert reg_template['source'] == 'event'
        assert 'TEST - Custom Registration Subject' in reg_template['subject']
    
    def test_save_email_templates_disable_override(self):
        """Should revert to global when override is disabled"""
        payload = {
            "scenarios": [
                {
                    "scenario": "payment_successful",
                    "is_enabled": True,
                    "has_override": False
                }
            ]
        }
        
        response = requests.put(
            f"{BASE_URL}/api/events/{TEST_EVENT_ID}/email-templates",
            json=payload
        )
        
        assert response.status_code == 200
        data = response.json()
        
        payment_template = next(
            (t for t in data['templates'] if t['scenario'] == 'payment_successful'),
            None
        )
        assert payment_template is not None
        assert payment_template['has_override'] == False
        assert payment_template['source'] == 'global'
    
    def test_save_email_templates_toggle_enabled(self):
        """Should toggle is_enabled flag"""
        # First disable
        payload = {
            "scenarios": [
                {
                    "scenario": "event_reminder",
                    "is_enabled": False,
                    "has_override": False
                }
            ]
        }
        
        response = requests.put(
            f"{BASE_URL}/api/events/{TEST_EVENT_ID}/email-templates",
            json=payload
        )
        
        assert response.status_code == 200
        
        reminder_template = next(
            (t for t in response.json()['templates'] if t['scenario'] == 'event_reminder'),
            None
        )
        assert reminder_template['is_enabled'] == False
        
        # Then enable
        payload['scenarios'][0]['is_enabled'] = True
        response = requests.put(
            f"{BASE_URL}/api/events/{TEST_EVENT_ID}/email-templates",
            json=payload
        )
        
        assert response.status_code == 200
        reminder_template = next(
            (t for t in response.json()['templates'] if t['scenario'] == 'event_reminder'),
            None
        )
        assert reminder_template['is_enabled'] == True
    
    def test_save_email_templates_scheduled_timing(self):
        """Should save scheduled timing with offset"""
        payload = {
            "scenarios": [
                {
                    "scenario": "event_reminder",
                    "is_enabled": True,
                    "has_override": True,
                    "subject": "Reminder: {{event_name}} is coming up!",
                    "body": "Hi {{attendee_name}}, don't forget about {{event_name}}!",
                    "send_timing": "scheduled",
                    "schedule_offset": 24,
                    "schedule_unit": "hours"
                }
            ]
        }
        
        response = requests.put(
            f"{BASE_URL}/api/events/{TEST_EVENT_ID}/email-templates",
            json=payload
        )
        
        assert response.status_code == 200
        
        reminder_template = next(
            (t for t in response.json()['templates'] if t['scenario'] == 'event_reminder'),
            None
        )
        assert reminder_template['send_timing'] == 'scheduled'
        assert reminder_template['schedule_offset'] == 24
        assert reminder_template['schedule_unit'] == 'hours'
    
    def test_save_email_templates_invalid_scenario(self):
        """Should reject invalid scenario"""
        payload = {
            "scenarios": [
                {
                    "scenario": "invalid_scenario",
                    "is_enabled": True,
                    "has_override": False
                }
            ]
        }
        
        response = requests.put(
            f"{BASE_URL}/api/events/{TEST_EVENT_ID}/email-templates",
            json=payload
        )
        
        assert response.status_code == 400
    
    def test_save_email_templates_missing_scenarios(self):
        """Should reject request without scenarios array"""
        response = requests.put(
            f"{BASE_URL}/api/events/{TEST_EVENT_ID}/email-templates",
            json={}
        )
        
        assert response.status_code == 400
    
    def test_save_all_scenarios(self):
        """Should save all 5 scenarios at once"""
        payload = {
            "scenarios": [
                {"scenario": "registration_complete", "is_enabled": True, "has_override": False},
                {"scenario": "payment_successful", "is_enabled": True, "has_override": False},
                {"scenario": "event_reminder", "is_enabled": True, "has_override": False},
                {"scenario": "event_cancelled", "is_enabled": True, "has_override": False},
                {"scenario": "post_event_followup", "is_enabled": True, "has_override": False}
            ]
        }
        
        response = requests.put(
            f"{BASE_URL}/api/events/{TEST_EVENT_ID}/email-templates",
            json=payload
        )
        
        assert response.status_code == 200
        assert len(response.json()['templates']) == 5


class TestEmailTemplatesReset:
    """Test POST /api/events/{eventId}/email-templates/reset"""
    
    def test_reset_to_global(self):
        """Should reset all event templates to global defaults"""
        # First create an override
        payload = {
            "scenarios": [
                {
                    "scenario": "event_cancelled",
                    "is_enabled": True,
                    "has_override": True,
                    "subject": "OVERRIDE - Event Cancelled",
                    "body": "Override body"
                }
            ]
        }
        requests.put(f"{BASE_URL}/api/events/{TEST_EVENT_ID}/email-templates", json=payload)
        
        # Now reset
        response = requests.post(f"{BASE_URL}/api/events/{TEST_EVENT_ID}/email-templates/reset")
        
        assert response.status_code == 200
        data = response.json()
        
        assert 'message' in data
        assert 'templates' in data
        
        # All templates should now be from global source
        for template in data['templates']:
            assert template['source'] == 'global', f"Template {template['scenario']} should be global after reset"
            assert template['has_override'] == False
    
    def test_reset_invalid_event_id(self):
        """Should return 400 for invalid event ID"""
        response = requests.post(f"{BASE_URL}/api/events/invalid/email-templates/reset")
        assert response.status_code == 400


class TestEmailTemplatesTestEmail:
    """Test POST /api/events/{eventId}/email-templates/test"""
    
    def test_send_test_email_no_provider(self):
        """Should fail gracefully when email provider not configured"""
        payload = {
            "scenario": "registration_complete",
            "email": "test@example.com"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/events/{TEST_EVENT_ID}/email-templates/test",
            json=payload
        )
        
        # Should return 400 with skipped message since provider not configured
        assert response.status_code == 400
        data = response.json()
        assert 'message' in data
        # Should indicate provider not configured
        assert 'not configured' in data['message'].lower() or 'skipped' in data
    
    def test_send_test_email_missing_scenario(self):
        """Should reject request without scenario"""
        payload = {
            "email": "test@example.com"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/events/{TEST_EVENT_ID}/email-templates/test",
            json=payload
        )
        
        assert response.status_code == 400
    
    def test_send_test_email_missing_email(self):
        """Should reject request without email"""
        payload = {
            "scenario": "registration_complete"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/events/{TEST_EVENT_ID}/email-templates/test",
            json=payload
        )
        
        assert response.status_code == 400
    
    def test_send_test_email_invalid_email_format(self):
        """Should reject invalid email format"""
        payload = {
            "scenario": "registration_complete",
            "email": "invalid-email"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/events/{TEST_EVENT_ID}/email-templates/test",
            json=payload
        )
        
        assert response.status_code == 400
    
    def test_send_test_email_invalid_scenario(self):
        """Should reject invalid scenario"""
        payload = {
            "scenario": "invalid_scenario",
            "email": "test@example.com"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/events/{TEST_EVENT_ID}/email-templates/test",
            json=payload
        )
        
        assert response.status_code == 400


class TestEmailProviderStatus:
    """Test GET /api/events/{eventId}/email-templates/status"""
    
    def test_get_email_provider_status(self):
        """Should return email provider status"""
        response = requests.get(f"{BASE_URL}/api/events/{TEST_EVENT_ID}/email-templates/status")
        
        assert response.status_code == 200
        data = response.json()
        
        assert 'available' in data
        # Since provider is not configured
        assert data['available'] == False
    
    def test_get_email_provider_status_invalid_event(self):
        """Should return 400 for invalid event ID"""
        response = requests.get(f"{BASE_URL}/api/events/invalid/email-templates/status")
        assert response.status_code == 400


class TestEmailTemplatesDataPersistence:
    """Test data persistence - Create → GET verification pattern"""
    
    def test_save_and_verify_persistence(self):
        """Should persist changes and verify via GET"""
        unique_subject = f"TEST_PERSIST_{os.urandom(4).hex()}"
        
        # Save with override
        payload = {
            "scenarios": [
                {
                    "scenario": "post_event_followup",
                    "is_enabled": True,
                    "has_override": True,
                    "subject": unique_subject,
                    "body": "Test body for persistence check",
                    "send_timing": "immediate"
                }
            ]
        }
        
        save_response = requests.put(
            f"{BASE_URL}/api/events/{TEST_EVENT_ID}/email-templates",
            json=payload
        )
        assert save_response.status_code == 200
        
        # Verify via GET
        get_response = requests.get(f"{BASE_URL}/api/events/{TEST_EVENT_ID}/email-templates")
        assert get_response.status_code == 200
        
        templates = get_response.json()['templates']
        followup_template = next(
            (t for t in templates if t['scenario'] == 'post_event_followup'),
            None
        )
        
        assert followup_template is not None
        assert followup_template['subject'] == unique_subject
        assert followup_template['has_override'] == True
        assert followup_template['source'] == 'event'
    
    def test_reset_and_verify_persistence(self):
        """Should reset and verify global defaults restored"""
        # First create override
        payload = {
            "scenarios": [
                {
                    "scenario": "event_cancelled",
                    "is_enabled": True,
                    "has_override": True,
                    "subject": "TEMP_OVERRIDE",
                    "body": "Temp body"
                }
            ]
        }
        requests.put(f"{BASE_URL}/api/events/{TEST_EVENT_ID}/email-templates", json=payload)
        
        # Reset
        reset_response = requests.post(f"{BASE_URL}/api/events/{TEST_EVENT_ID}/email-templates/reset")
        assert reset_response.status_code == 200
        
        # Verify via GET
        get_response = requests.get(f"{BASE_URL}/api/events/{TEST_EVENT_ID}/email-templates")
        assert get_response.status_code == 200
        
        templates = get_response.json()['templates']
        cancelled_template = next(
            (t for t in templates if t['scenario'] == 'event_cancelled'),
            None
        )
        
        assert cancelled_template is not None
        assert cancelled_template['has_override'] == False
        assert cancelled_template['source'] == 'global'
        # Subject should be global default, not our override
        assert 'TEMP_OVERRIDE' not in cancelled_template['subject']


# Cleanup fixture to reset state after tests
@pytest.fixture(scope="class", autouse=True)
def cleanup_after_tests():
    """Reset templates to global defaults after test class"""
    yield
    # Cleanup: Reset to global defaults
    requests.post(f"{BASE_URL}/api/events/{TEST_EVENT_ID}/email-templates/reset")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
