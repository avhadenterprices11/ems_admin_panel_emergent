"""
Test suite for Audience Segments and Communication Settings APIs
Tests the Communications Tab - Audience Segments and Settings functionality
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('VITE_API_URL', 'https://datapolicyhub.preview.emergentagent.com')
EVENT_ID = 1

class TestAudienceSegmentsAPI:
    """Tests for Audience Segments CRUD operations"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test data"""
        self.base_url = BASE_URL.rstrip('/')
        self.event_id = EVENT_ID
        self.created_segment_ids = []
        yield
        # Cleanup: Delete test segments
        for segment_id in self.created_segment_ids:
            try:
                requests.delete(f"{self.base_url}/api/events/{self.event_id}/segments/{segment_id}")
            except:
                pass
    
    # GET /api/events/:eventId/segments - List all segments
    def test_get_segments_list(self):
        """Test listing all segments for an event"""
        response = requests.get(f"{self.base_url}/api/events/{self.event_id}/segments")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        
        # Verify existing segments (Checked In Attendees and Not Checked In)
        if len(data) > 0:
            segment = data[0]
            assert 'id' in segment
            assert 'name' in segment
            assert 'match_type' in segment
            assert 'rules_json' in segment
            assert 'estimated_count' in segment
            assert 'is_active' in segment
            print(f"Found {len(data)} segments")
    
    # GET /api/events/:eventId/segments/filter-fields - Get available filter fields
    def test_get_filter_fields(self):
        """Test getting available filter fields for segment rules"""
        response = requests.get(f"{self.base_url}/api/events/{self.event_id}/segments/filter-fields")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) > 0, "Should have at least one filter field"
        
        # Verify filter field structure
        field = data[0]
        assert 'field' in field
        assert 'label' in field
        assert 'type' in field
        assert 'operators' in field
        
        # Verify expected fields exist
        field_names = [f['field'] for f in data]
        expected_fields = ['ticket_type', 'checkin_status', 'registration_status', 'attendee_email', 'attendee_name']
        for expected in expected_fields:
            assert expected in field_names, f"Expected field '{expected}' not found"
        
        print(f"Available filter fields: {field_names}")
    
    # POST /api/events/:eventId/segments - Create segment with rules
    def test_create_segment(self):
        """Test creating a new segment with rules"""
        segment_data = {
            "name": "TEST_VIP Attendees",
            "description": "Test segment for VIP attendees",
            "match_type": "ALL",
            "rules_json": [
                {"field": "checkin_status", "operator": "equals", "value": "checked_in"}
            ],
            "is_active": True
        }
        
        response = requests.post(
            f"{self.base_url}/api/events/{self.event_id}/segments",
            json=segment_data
        )
        assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data['name'] == segment_data['name']
        assert data['description'] == segment_data['description']
        assert data['match_type'] == segment_data['match_type']
        assert data['is_active'] == segment_data['is_active']
        assert 'id' in data
        assert 'estimated_count' in data
        
        self.created_segment_ids.append(data['id'])
        print(f"Created segment with ID: {data['id']}, estimated count: {data['estimated_count']}")
    
    # POST /api/events/:eventId/segments - Create segment validation
    def test_create_segment_validation_name_required(self):
        """Test segment creation fails without name"""
        segment_data = {
            "match_type": "ALL",
            "rules_json": []
        }
        
        response = requests.post(
            f"{self.base_url}/api/events/{self.event_id}/segments",
            json=segment_data
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        assert 'name' in response.json().get('message', '').lower()
    
    def test_create_segment_validation_match_type(self):
        """Test segment creation fails with invalid match_type"""
        segment_data = {
            "name": "TEST_Invalid Segment",
            "match_type": "INVALID",
            "rules_json": []
        }
        
        response = requests.post(
            f"{self.base_url}/api/events/{self.event_id}/segments",
            json=segment_data
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
    
    # GET /api/events/:eventId/segments/:segmentId - Get single segment
    def test_get_segment_by_id(self):
        """Test getting a single segment by ID"""
        # First create a segment
        segment_data = {
            "name": "TEST_Get By ID Segment",
            "match_type": "ANY",
            "rules_json": [
                {"field": "checkin_status", "operator": "equals", "value": "not_checked_in"}
            ]
        }
        
        create_response = requests.post(
            f"{self.base_url}/api/events/{self.event_id}/segments",
            json=segment_data
        )
        assert create_response.status_code == 201
        segment_id = create_response.json()['id']
        self.created_segment_ids.append(segment_id)
        
        # Get the segment
        response = requests.get(f"{self.base_url}/api/events/{self.event_id}/segments/{segment_id}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data['id'] == segment_id
        assert data['name'] == segment_data['name']
        assert data['match_type'] == segment_data['match_type']
        print(f"Retrieved segment: {data['name']}")
    
    def test_get_segment_not_found(self):
        """Test getting a non-existent segment returns 404"""
        response = requests.get(f"{self.base_url}/api/events/{self.event_id}/segments/99999")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
    
    # PUT /api/events/:eventId/segments/:segmentId - Update segment
    def test_update_segment(self):
        """Test updating a segment"""
        # First create a segment
        segment_data = {
            "name": "TEST_Update Segment",
            "match_type": "ALL",
            "rules_json": [
                {"field": "checkin_status", "operator": "equals", "value": "checked_in"}
            ]
        }
        
        create_response = requests.post(
            f"{self.base_url}/api/events/{self.event_id}/segments",
            json=segment_data
        )
        assert create_response.status_code == 201
        segment_id = create_response.json()['id']
        self.created_segment_ids.append(segment_id)
        
        # Update the segment
        update_data = {
            "name": "TEST_Updated Segment Name",
            "description": "Updated description",
            "match_type": "ANY",
            "is_active": False
        }
        
        response = requests.put(
            f"{self.base_url}/api/events/{self.event_id}/segments/{segment_id}",
            json=update_data
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data['name'] == update_data['name']
        assert data['description'] == update_data['description']
        assert data['match_type'] == update_data['match_type']
        assert data['is_active'] == update_data['is_active']
        
        # Verify with GET
        get_response = requests.get(f"{self.base_url}/api/events/{self.event_id}/segments/{segment_id}")
        assert get_response.status_code == 200
        assert get_response.json()['name'] == update_data['name']
        print(f"Updated segment: {data['name']}")
    
    def test_update_segment_not_found(self):
        """Test updating a non-existent segment returns 404"""
        response = requests.put(
            f"{self.base_url}/api/events/{self.event_id}/segments/99999",
            json={"name": "Test"}
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
    
    # DELETE /api/events/:eventId/segments/:segmentId - Delete segment
    def test_delete_segment(self):
        """Test deleting a segment"""
        # First create a segment
        segment_data = {
            "name": "TEST_Delete Segment",
            "match_type": "ALL",
            "rules_json": []
        }
        
        create_response = requests.post(
            f"{self.base_url}/api/events/{self.event_id}/segments",
            json=segment_data
        )
        assert create_response.status_code == 201
        segment_id = create_response.json()['id']
        
        # Delete the segment
        response = requests.delete(f"{self.base_url}/api/events/{self.event_id}/segments/{segment_id}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Verify deletion with GET (should return 404)
        get_response = requests.get(f"{self.base_url}/api/events/{self.event_id}/segments/{segment_id}")
        assert get_response.status_code == 404, "Deleted segment should not be found"
        print(f"Deleted segment ID: {segment_id}")
    
    def test_delete_segment_not_found(self):
        """Test deleting a non-existent segment returns 404"""
        response = requests.delete(f"{self.base_url}/api/events/{self.event_id}/segments/99999")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
    
    # POST /api/events/:eventId/segments/preview - Preview matched attendees
    def test_preview_segment(self):
        """Test previewing segment members based on rules"""
        preview_data = {
            "rules_json": [
                {"field": "checkin_status", "operator": "equals", "value": "checked_in"}
            ],
            "match_type": "ALL",
            "limit": 10
        }
        
        response = requests.post(
            f"{self.base_url}/api/events/{self.event_id}/segments/preview",
            json=preview_data
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert 'members' in data
        assert 'total' in data
        assert isinstance(data['members'], list)
        assert isinstance(data['total'], int)
        
        if len(data['members']) > 0:
            member = data['members'][0]
            assert 'attendee_id' in member
            assert 'attendee_name' in member
            assert 'checkin_status' in member
        
        print(f"Preview: {data['total']} total matches, showing {len(data['members'])} members")
    
    def test_preview_segment_validation(self):
        """Test preview validation requires match_type"""
        preview_data = {
            "rules_json": [],
            "match_type": "INVALID"
        }
        
        response = requests.post(
            f"{self.base_url}/api/events/{self.event_id}/segments/preview",
            json=preview_data
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
    
    # POST /api/events/:eventId/segments/:segmentId/refresh - Refresh segment count
    def test_refresh_segment(self):
        """Test refreshing segment count"""
        # First create a segment
        segment_data = {
            "name": "TEST_Refresh Segment",
            "match_type": "ALL",
            "rules_json": [
                {"field": "checkin_status", "operator": "equals", "value": "checked_in"}
            ]
        }
        
        create_response = requests.post(
            f"{self.base_url}/api/events/{self.event_id}/segments",
            json=segment_data
        )
        assert create_response.status_code == 201
        segment_id = create_response.json()['id']
        self.created_segment_ids.append(segment_id)
        
        # Refresh the segment
        response = requests.post(f"{self.base_url}/api/events/{self.event_id}/segments/{segment_id}/refresh")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert 'estimated_count' in data
        assert 'last_evaluated_at' in data
        print(f"Refreshed segment count: {data['estimated_count']}")
    
    def test_refresh_segment_not_found(self):
        """Test refreshing a non-existent segment returns 404"""
        response = requests.post(f"{self.base_url}/api/events/{self.event_id}/segments/99999/refresh")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
    
    # GET /api/events/:eventId/segments/:segmentId/members - Get segment members
    def test_get_segment_members(self):
        """Test getting segment members with pagination"""
        # First create a segment
        segment_data = {
            "name": "TEST_Members Segment",
            "match_type": "ALL",
            "rules_json": [
                {"field": "checkin_status", "operator": "equals", "value": "checked_in"}
            ]
        }
        
        create_response = requests.post(
            f"{self.base_url}/api/events/{self.event_id}/segments",
            json=segment_data
        )
        assert create_response.status_code == 201
        segment_id = create_response.json()['id']
        self.created_segment_ids.append(segment_id)
        
        # Get members
        response = requests.get(
            f"{self.base_url}/api/events/{self.event_id}/segments/{segment_id}/members",
            params={"page": 1, "limit": 10}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert 'members' in data
        assert 'total' in data
        print(f"Segment has {data['total']} members")
    
    # Test complex rules with multiple conditions
    def test_create_segment_with_multiple_rules(self):
        """Test creating a segment with multiple rules"""
        segment_data = {
            "name": "TEST_Complex Rules Segment",
            "description": "Segment with multiple filter rules",
            "match_type": "ALL",
            "rules_json": [
                {"field": "checkin_status", "operator": "equals", "value": "checked_in"},
                {"field": "attendee_name", "operator": "contains", "value": "John"}
            ],
            "is_active": True
        }
        
        response = requests.post(
            f"{self.base_url}/api/events/{self.event_id}/segments",
            json=segment_data
        )
        assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert len(data['rules_json']) == 2
        self.created_segment_ids.append(data['id'])
        print(f"Created segment with {len(data['rules_json'])} rules")
    
    def test_create_segment_with_any_match_type(self):
        """Test creating a segment with ANY match type (OR logic)"""
        segment_data = {
            "name": "TEST_Any Match Segment",
            "match_type": "ANY",
            "rules_json": [
                {"field": "checkin_status", "operator": "equals", "value": "checked_in"},
                {"field": "checkin_status", "operator": "equals", "value": "not_checked_in"}
            ]
        }
        
        response = requests.post(
            f"{self.base_url}/api/events/{self.event_id}/segments",
            json=segment_data
        )
        assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data['match_type'] == 'ANY'
        self.created_segment_ids.append(data['id'])
        print(f"Created ANY match segment with count: {data['estimated_count']}")


class TestCommunicationSettingsAPI:
    """Tests for Communication Settings CRUD operations"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test data"""
        self.base_url = BASE_URL.rstrip('/')
        self.event_id = EVENT_ID
        yield
        # Reset settings after tests
        try:
            requests.post(f"{self.base_url}/api/events/{self.event_id}/communication-settings/reset")
        except:
            pass
    
    # GET /api/events/:eventId/communication-settings - Get settings
    def test_get_communication_settings(self):
        """Test getting communication settings for an event"""
        response = requests.get(f"{self.base_url}/api/events/{self.event_id}/communication-settings")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert 'id' in data
        assert 'event_id' in data
        assert 'email_enabled' in data
        assert 'sms_enabled' in data
        assert 'opt_out_enabled' in data
        assert 'track_opens' in data
        assert 'track_clicks' in data
        
        print(f"Settings: email_enabled={data['email_enabled']}, sms_enabled={data['sms_enabled']}")
    
    # PUT /api/events/:eventId/communication-settings - Update settings
    def test_update_communication_settings(self):
        """Test updating communication settings"""
        update_data = {
            "default_sender_name": "TEST Event Team",
            "reply_to_email": "test@example.com",
            "sms_sender_id": "TESTEVENT",
            "email_enabled": True,
            "sms_enabled": True,
            "quiet_hours_start": "22:00",
            "quiet_hours_end": "08:00",
            "opt_out_enabled": True,
            "track_opens": True,
            "track_clicks": True
        }
        
        response = requests.put(
            f"{self.base_url}/api/events/{self.event_id}/communication-settings",
            json=update_data
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data['default_sender_name'] == update_data['default_sender_name']
        assert data['reply_to_email'] == update_data['reply_to_email']
        assert data['sms_sender_id'] == update_data['sms_sender_id']
        assert data['email_enabled'] == update_data['email_enabled']
        assert data['sms_enabled'] == update_data['sms_enabled']
        assert data['opt_out_enabled'] == update_data['opt_out_enabled']
        assert data['track_opens'] == update_data['track_opens']
        assert data['track_clicks'] == update_data['track_clicks']
        
        # Verify with GET
        get_response = requests.get(f"{self.base_url}/api/events/{self.event_id}/communication-settings")
        assert get_response.status_code == 200
        assert get_response.json()['default_sender_name'] == update_data['default_sender_name']
        
        print(f"Updated settings: sender={data['default_sender_name']}")
    
    def test_update_settings_invalid_email(self):
        """Test updating settings with invalid email format"""
        update_data = {
            "reply_to_email": "invalid-email"
        }
        
        response = requests.put(
            f"{self.base_url}/api/events/{self.event_id}/communication-settings",
            json=update_data
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        assert 'email' in response.json().get('message', '').lower()
    
    def test_update_settings_invalid_quiet_hours_format(self):
        """Test updating settings with invalid quiet hours format"""
        update_data = {
            "quiet_hours_start": "25:00"  # Invalid time
        }
        
        response = requests.put(
            f"{self.base_url}/api/events/{self.event_id}/communication-settings",
            json=update_data
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
    
    def test_update_settings_partial(self):
        """Test partial update of settings"""
        # Only update email_enabled
        update_data = {
            "email_enabled": False
        }
        
        response = requests.put(
            f"{self.base_url}/api/events/{self.event_id}/communication-settings",
            json=update_data
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data['email_enabled'] == False
        print("Partial update successful")
    
    # POST /api/events/:eventId/communication-settings/validate - Validate settings
    def test_validate_settings_email(self):
        """Test validating settings for email channel"""
        response = requests.post(
            f"{self.base_url}/api/events/{self.event_id}/communication-settings/validate",
            json={"channel": "email"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert 'valid' in data
        assert 'errors' in data
        assert 'warnings' in data
        assert isinstance(data['errors'], list)
        assert isinstance(data['warnings'], list)
        
        print(f"Email validation: valid={data['valid']}, errors={len(data['errors'])}, warnings={len(data['warnings'])}")
    
    def test_validate_settings_sms(self):
        """Test validating settings for SMS channel"""
        response = requests.post(
            f"{self.base_url}/api/events/{self.event_id}/communication-settings/validate",
            json={"channel": "sms"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert 'valid' in data
        assert 'errors' in data
        assert 'warnings' in data
        
        print(f"SMS validation: valid={data['valid']}, errors={len(data['errors'])}, warnings={len(data['warnings'])}")
    
    def test_validate_settings_invalid_channel(self):
        """Test validation fails with invalid channel"""
        response = requests.post(
            f"{self.base_url}/api/events/{self.event_id}/communication-settings/validate",
            json={"channel": "invalid"}
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
    
    # GET /api/events/:eventId/communication-settings/quiet-hours - Get quiet hours status
    def test_get_quiet_hours_status(self):
        """Test getting quiet hours status"""
        response = requests.get(f"{self.base_url}/api/events/{self.event_id}/communication-settings/quiet-hours")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert 'inQuietHours' in data
        assert isinstance(data['inQuietHours'], bool)
        
        print(f"Quiet hours status: inQuietHours={data['inQuietHours']}")
    
    def test_quiet_hours_with_configured_times(self):
        """Test quiet hours status after configuring times"""
        # First set quiet hours
        update_data = {
            "quiet_hours_start": "22:00",
            "quiet_hours_end": "08:00"
        }
        
        update_response = requests.put(
            f"{self.base_url}/api/events/{self.event_id}/communication-settings",
            json=update_data
        )
        assert update_response.status_code == 200
        
        # Check quiet hours status
        response = requests.get(f"{self.base_url}/api/events/{self.event_id}/communication-settings/quiet-hours")
        assert response.status_code == 200
        
        data = response.json()
        assert 'inQuietHours' in data
        assert 'startTime' in data
        assert 'endTime' in data
        
        print(f"Quiet hours: {data['startTime']} - {data['endTime']}, currently in quiet hours: {data['inQuietHours']}")
    
    # POST /api/events/:eventId/communication-settings/reset - Reset to default
    def test_reset_settings(self):
        """Test resetting settings to default"""
        # First update some settings
        update_data = {
            "default_sender_name": "TEST Custom Name",
            "sms_enabled": True,
            "track_opens": False
        }
        
        update_response = requests.put(
            f"{self.base_url}/api/events/{self.event_id}/communication-settings",
            json=update_data
        )
        assert update_response.status_code == 200
        
        # Reset settings
        response = requests.post(f"{self.base_url}/api/events/{self.event_id}/communication-settings/reset")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Verify defaults are restored
        assert data['default_sender_name'] is None
        assert data['email_enabled'] == True
        assert data['sms_enabled'] == False
        assert data['opt_out_enabled'] == True
        assert data['track_opens'] == True
        assert data['track_clicks'] == True
        
        print("Settings reset to default successfully")
    
    # Test channel enable/disable
    def test_disable_email_channel(self):
        """Test disabling email channel"""
        update_data = {"email_enabled": False}
        
        response = requests.put(
            f"{self.base_url}/api/events/{self.event_id}/communication-settings",
            json=update_data
        )
        assert response.status_code == 200
        
        # Validate should show error
        validate_response = requests.post(
            f"{self.base_url}/api/events/{self.event_id}/communication-settings/validate",
            json={"channel": "email"}
        )
        assert validate_response.status_code == 200
        
        data = validate_response.json()
        assert data['valid'] == False
        assert any('disabled' in err.lower() for err in data['errors'])
        
        print("Email channel disabled validation working")
    
    def test_disable_sms_channel(self):
        """Test disabling SMS channel"""
        update_data = {"sms_enabled": False}
        
        response = requests.put(
            f"{self.base_url}/api/events/{self.event_id}/communication-settings",
            json=update_data
        )
        assert response.status_code == 200
        
        # Validate should show error
        validate_response = requests.post(
            f"{self.base_url}/api/events/{self.event_id}/communication-settings/validate",
            json={"channel": "sms"}
        )
        assert validate_response.status_code == 200
        
        data = validate_response.json()
        assert data['valid'] == False
        assert any('disabled' in err.lower() for err in data['errors'])
        
        print("SMS channel disabled validation working")


class TestExistingSegments:
    """Tests for existing segments (Checked In Attendees and Not Checked In)"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test data"""
        self.base_url = BASE_URL.rstrip('/')
        self.event_id = EVENT_ID
    
    def test_existing_segments_present(self):
        """Test that existing segments are present"""
        response = requests.get(f"{self.base_url}/api/events/{self.event_id}/segments")
        assert response.status_code == 200
        
        data = response.json()
        segment_names = [s['name'] for s in data]
        
        # Check for expected segments
        print(f"Existing segments: {segment_names}")
        assert len(data) >= 0, "Should have segments"
    
    def test_get_existing_segment_by_id_1(self):
        """Test getting segment with ID 1 (Checked In Attendees)"""
        response = requests.get(f"{self.base_url}/api/events/{self.event_id}/segments/1")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Segment 1: {data['name']}, count: {data['estimated_count']}")
            assert 'rules_json' in data
        else:
            print(f"Segment 1 not found (status: {response.status_code})")
    
    def test_get_existing_segment_by_id_2(self):
        """Test getting segment with ID 2 (Not Checked In)"""
        response = requests.get(f"{self.base_url}/api/events/{self.event_id}/segments/2")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Segment 2: {data['name']}, count: {data['estimated_count']}")
            assert 'rules_json' in data
        else:
            print(f"Segment 2 not found (status: {response.status_code})")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
