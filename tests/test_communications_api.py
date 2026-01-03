"""
Test suite for Communications Tab APIs (Campaigns and Templates)
Tests CRUD operations for campaigns and templates, plus campaign actions like send, duplicate, schedule
"""
import pytest
import requests
import os
from datetime import datetime, timedelta

BASE_URL = os.environ.get('VITE_API_URL', 'https://eventflow-152.preview.emergentagent.com')
EVENT_ID = 1

@pytest.fixture(scope="module")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


class TestCampaignsAPI:
    """Test Campaign CRUD and actions"""
    
    created_campaign_ids = []
    
    # ==================== GET Campaigns ====================
    def test_get_campaigns_list(self, api_client):
        """GET /api/events/:eventId/campaigns - List all campaigns"""
        response = api_client.get(f"{BASE_URL}/api/events/{EVENT_ID}/campaigns")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        
        # Verify campaign structure if any exist
        if len(data) > 0:
            campaign = data[0]
            assert "id" in campaign
            assert "name" in campaign
            assert "channel" in campaign
            assert "status" in campaign
            assert "open_rate" in campaign
            assert "click_rate" in campaign
            print(f"✓ Found {len(data)} campaigns")
    
    def test_get_campaign_stats(self, api_client):
        """GET /api/events/:eventId/campaigns/stats - Get campaign statistics"""
        response = api_client.get(f"{BASE_URL}/api/events/{EVENT_ID}/campaigns/stats")
        assert response.status_code == 200
        
        data = response.json()
        assert "totalCampaigns" in data
        assert "sentCampaigns" in data
        assert "scheduledCampaigns" in data
        assert "draftCampaigns" in data
        assert "totalRecipients" in data
        assert "avgOpenRate" in data
        assert "avgClickRate" in data
        print(f"✓ Campaign stats: {data['totalCampaigns']} total, {data['sentCampaigns']} sent")
    
    def test_get_audience_segments(self, api_client):
        """GET /api/events/:eventId/campaigns/audience-segments - Get audience segments"""
        response = api_client.get(f"{BASE_URL}/api/events/{EVENT_ID}/campaigns/audience-segments")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 4  # all, vip, not_checked_in, checked_in
        
        # Verify segment structure
        for segment in data:
            assert "name" in segment
            assert "type" in segment
            assert "count" in segment
            assert isinstance(segment["count"], int)
        
        segment_types = [s["type"] for s in data]
        assert "all" in segment_types
        assert "vip" in segment_types
        assert "not_checked_in" in segment_types
        assert "checked_in" in segment_types
        print(f"✓ Found {len(data)} audience segments")
    
    # ==================== CREATE Campaign ====================
    def test_create_campaign_email(self, api_client):
        """POST /api/events/:eventId/campaigns - Create email campaign"""
        payload = {
            "name": "TEST_Email Campaign",
            "channel": "email",
            "campaign_type": "one-time",
            "subject": "Test Subject Line",
            "content": "Hello {{FirstName}}, welcome to {{EventName}}!",
            "audience_rule": {"type": "all"}
        }
        
        response = api_client.post(f"{BASE_URL}/api/events/{EVENT_ID}/campaigns", json=payload)
        assert response.status_code == 201
        
        data = response.json()
        assert data["name"] == payload["name"]
        assert data["channel"] == "email"
        assert data["campaign_type"] == "one-time"
        assert data["status"] == "draft"
        assert data["subject"] == payload["subject"]
        assert "id" in data
        
        self.created_campaign_ids.append(data["id"])
        print(f"✓ Created email campaign ID: {data['id']}")
    
    def test_create_campaign_sms(self, api_client):
        """POST /api/events/:eventId/campaigns - Create SMS campaign"""
        payload = {
            "name": "TEST_SMS Campaign",
            "channel": "sms",
            "campaign_type": "one-time",
            "content": "Hi {{FirstName}}, see you at {{EventName}}!",
            "audience_rule": {"type": "all"}
        }
        
        response = api_client.post(f"{BASE_URL}/api/events/{EVENT_ID}/campaigns", json=payload)
        assert response.status_code == 201
        
        data = response.json()
        assert data["name"] == payload["name"]
        assert data["channel"] == "sms"
        assert data["status"] == "draft"
        
        self.created_campaign_ids.append(data["id"])
        print(f"✓ Created SMS campaign ID: {data['id']}")
    
    def test_create_campaign_scheduled(self, api_client):
        """POST /api/events/:eventId/campaigns - Create scheduled campaign"""
        future_date = (datetime.utcnow() + timedelta(days=7)).strftime("%Y-%m-%dT%H:%M:%SZ")
        payload = {
            "name": "TEST_Scheduled Campaign",
            "channel": "email",
            "subject": "Scheduled Test",
            "content": "This is a scheduled campaign",
            "audience_rule": {"type": "all"},
            "scheduled_at": future_date
        }
        
        response = api_client.post(f"{BASE_URL}/api/events/{EVENT_ID}/campaigns", json=payload)
        assert response.status_code == 201
        
        data = response.json()
        assert data["status"] == "scheduled"
        assert data["scheduled_at"] is not None
        
        self.created_campaign_ids.append(data["id"])
        print(f"✓ Created scheduled campaign ID: {data['id']}")
    
    def test_create_campaign_validation_no_name(self, api_client):
        """POST /api/events/:eventId/campaigns - Validation: name required"""
        payload = {
            "channel": "email",
            "content": "Test content"
        }
        
        response = api_client.post(f"{BASE_URL}/api/events/{EVENT_ID}/campaigns", json=payload)
        assert response.status_code == 400
        assert "name" in response.json().get("message", "").lower()
        print("✓ Validation: name required")
    
    def test_create_campaign_validation_invalid_channel(self, api_client):
        """POST /api/events/:eventId/campaigns - Validation: invalid channel"""
        payload = {
            "name": "Test Campaign",
            "channel": "invalid_channel"
        }
        
        response = api_client.post(f"{BASE_URL}/api/events/{EVENT_ID}/campaigns", json=payload)
        assert response.status_code == 400
        assert "channel" in response.json().get("message", "").lower()
        print("✓ Validation: invalid channel rejected")
    
    # ==================== GET Single Campaign ====================
    def test_get_campaign_by_id(self, api_client):
        """GET /api/events/:eventId/campaigns/:campaignId - Get single campaign"""
        if not self.created_campaign_ids:
            pytest.skip("No campaigns created")
        
        campaign_id = self.created_campaign_ids[0]
        response = api_client.get(f"{BASE_URL}/api/events/{EVENT_ID}/campaigns/{campaign_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == campaign_id
        assert "name" in data
        assert "channel" in data
        assert "status" in data
        assert "open_rate" in data
        assert "click_rate" in data
        print(f"✓ Retrieved campaign ID: {campaign_id}")
    
    def test_get_campaign_not_found(self, api_client):
        """GET /api/events/:eventId/campaigns/:campaignId - 404 for non-existent"""
        response = api_client.get(f"{BASE_URL}/api/events/{EVENT_ID}/campaigns/99999")
        assert response.status_code == 404
        print("✓ 404 for non-existent campaign")
    
    # ==================== UPDATE Campaign ====================
    def test_update_campaign(self, api_client):
        """PUT /api/events/:eventId/campaigns/:campaignId - Update campaign"""
        if not self.created_campaign_ids:
            pytest.skip("No campaigns created")
        
        campaign_id = self.created_campaign_ids[0]
        payload = {
            "name": "TEST_Updated Campaign Name",
            "subject": "Updated Subject"
        }
        
        response = api_client.put(f"{BASE_URL}/api/events/{EVENT_ID}/campaigns/{campaign_id}", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["name"] == payload["name"]
        assert data["subject"] == payload["subject"]
        
        # Verify persistence
        get_response = api_client.get(f"{BASE_URL}/api/events/{EVENT_ID}/campaigns/{campaign_id}")
        assert get_response.status_code == 200
        assert get_response.json()["name"] == payload["name"]
        print(f"✓ Updated campaign ID: {campaign_id}")
    
    def test_update_campaign_not_found(self, api_client):
        """PUT /api/events/:eventId/campaigns/:campaignId - 404 for non-existent"""
        payload = {"name": "Test"}
        response = api_client.put(f"{BASE_URL}/api/events/{EVENT_ID}/campaigns/99999", json=payload)
        assert response.status_code == 404
        print("✓ 404 for updating non-existent campaign")
    
    # ==================== DUPLICATE Campaign ====================
    def test_duplicate_campaign(self, api_client):
        """POST /api/events/:eventId/campaigns/:campaignId/duplicate - Duplicate campaign"""
        if not self.created_campaign_ids:
            pytest.skip("No campaigns created")
        
        campaign_id = self.created_campaign_ids[0]
        response = api_client.post(f"{BASE_URL}/api/events/{EVENT_ID}/campaigns/{campaign_id}/duplicate")
        assert response.status_code == 201
        
        data = response.json()
        assert "(Copy)" in data["name"]
        assert data["status"] == "draft"
        assert data["id"] != campaign_id
        
        self.created_campaign_ids.append(data["id"])
        print(f"✓ Duplicated campaign, new ID: {data['id']}")
    
    def test_duplicate_campaign_not_found(self, api_client):
        """POST /api/events/:eventId/campaigns/:campaignId/duplicate - 404 for non-existent"""
        response = api_client.post(f"{BASE_URL}/api/events/{EVENT_ID}/campaigns/99999/duplicate")
        assert response.status_code == 404
        print("✓ 404 for duplicating non-existent campaign")
    
    # ==================== SEND Campaign ====================
    def test_send_campaign(self, api_client):
        """POST /api/events/:eventId/campaigns/:campaignId/send - Send campaign (MOCKED)"""
        # Create a fresh campaign to send
        payload = {
            "name": "TEST_Campaign to Send",
            "channel": "email",
            "subject": "Test Send",
            "content": "Hello {{FirstName}}!",
            "audience_rule": {"type": "all"}
        }
        
        create_response = api_client.post(f"{BASE_URL}/api/events/{EVENT_ID}/campaigns", json=payload)
        assert create_response.status_code == 201
        campaign_id = create_response.json()["id"]
        self.created_campaign_ids.append(campaign_id)
        
        # Send the campaign
        response = api_client.post(f"{BASE_URL}/api/events/{EVENT_ID}/campaigns/{campaign_id}/send")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "recipientCount" in data
        assert data["recipientCount"] >= 0
        
        # Verify campaign status changed to sent
        get_response = api_client.get(f"{BASE_URL}/api/events/{EVENT_ID}/campaigns/{campaign_id}")
        assert get_response.json()["status"] == "sent"
        print(f"✓ Sent campaign to {data['recipientCount']} recipients (MOCKED)")
    
    def test_send_campaign_already_sent(self, api_client):
        """POST /api/events/:eventId/campaigns/:campaignId/send - Cannot send already sent"""
        # Use the campaign we just sent
        if len(self.created_campaign_ids) < 5:
            pytest.skip("Need sent campaign")
        
        campaign_id = self.created_campaign_ids[-1]  # Last one was sent
        response = api_client.post(f"{BASE_URL}/api/events/{EVENT_ID}/campaigns/{campaign_id}/send")
        assert response.status_code == 400
        assert "already" in response.json().get("message", "").lower()
        print("✓ Cannot send already sent campaign")
    
    # ==================== SCHEDULE Campaign ====================
    def test_schedule_campaign(self, api_client):
        """POST /api/events/:eventId/campaigns/:campaignId/schedule - Schedule campaign"""
        # Create a draft campaign
        payload = {
            "name": "TEST_Campaign to Schedule",
            "channel": "email",
            "subject": "Scheduled Test",
            "content": "Scheduled content"
        }
        
        create_response = api_client.post(f"{BASE_URL}/api/events/{EVENT_ID}/campaigns", json=payload)
        assert create_response.status_code == 201
        campaign_id = create_response.json()["id"]
        self.created_campaign_ids.append(campaign_id)
        
        # Schedule it
        future_date = (datetime.utcnow() + timedelta(days=3)).strftime("%Y-%m-%dT%H:%M:%SZ")
        response = api_client.post(
            f"{BASE_URL}/api/events/{EVENT_ID}/campaigns/{campaign_id}/schedule",
            json={"scheduled_at": future_date}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "scheduled"
        assert data["scheduled_at"] is not None
        print(f"✓ Scheduled campaign ID: {campaign_id}")
    
    # ==================== PAUSE/RESUME Campaign ====================
    def test_pause_scheduled_campaign(self, api_client):
        """POST /api/events/:eventId/campaigns/:campaignId/pause - Pause scheduled campaign"""
        # Find a scheduled campaign
        scheduled_campaign_id = None
        for cid in self.created_campaign_ids:
            get_resp = api_client.get(f"{BASE_URL}/api/events/{EVENT_ID}/campaigns/{cid}")
            if get_resp.status_code == 200 and get_resp.json()["status"] == "scheduled":
                scheduled_campaign_id = cid
                break
        
        if not scheduled_campaign_id:
            pytest.skip("No scheduled campaign available")
        
        response = api_client.post(f"{BASE_URL}/api/events/{EVENT_ID}/campaigns/{scheduled_campaign_id}/pause")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "paused"
        print(f"✓ Paused campaign ID: {scheduled_campaign_id}")
    
    def test_resume_paused_campaign(self, api_client):
        """POST /api/events/:eventId/campaigns/:campaignId/resume - Resume paused campaign"""
        # Find a paused campaign
        paused_campaign_id = None
        for cid in self.created_campaign_ids:
            get_resp = api_client.get(f"{BASE_URL}/api/events/{EVENT_ID}/campaigns/{cid}")
            if get_resp.status_code == 200 and get_resp.json()["status"] == "paused":
                paused_campaign_id = cid
                break
        
        if not paused_campaign_id:
            pytest.skip("No paused campaign available")
        
        response = api_client.post(f"{BASE_URL}/api/events/{EVENT_ID}/campaigns/{paused_campaign_id}/resume")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] in ["scheduled", "draft"]
        print(f"✓ Resumed campaign ID: {paused_campaign_id}")
    
    # ==================== PREVIEW Audience ====================
    def test_preview_audience(self, api_client):
        """POST /api/events/:eventId/campaigns/preview-audience - Preview audience count"""
        payload = {"audience_rule": {"type": "all"}}
        
        response = api_client.post(f"{BASE_URL}/api/events/{EVENT_ID}/campaigns/preview-audience", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert "count" in data
        assert isinstance(data["count"], int)
        print(f"✓ Audience preview: {data['count']} recipients")
    
    # ==================== DELETE Campaign ====================
    def test_delete_campaign(self, api_client):
        """DELETE /api/events/:eventId/campaigns/:campaignId - Delete campaign"""
        # Create a campaign to delete
        payload = {
            "name": "TEST_Campaign to Delete",
            "channel": "email",
            "subject": "Delete Test",
            "content": "Will be deleted"
        }
        
        create_response = api_client.post(f"{BASE_URL}/api/events/{EVENT_ID}/campaigns", json=payload)
        assert create_response.status_code == 201
        campaign_id = create_response.json()["id"]
        
        # Delete it
        response = api_client.delete(f"{BASE_URL}/api/events/{EVENT_ID}/campaigns/{campaign_id}")
        assert response.status_code == 200
        
        # Verify it's gone
        get_response = api_client.get(f"{BASE_URL}/api/events/{EVENT_ID}/campaigns/{campaign_id}")
        assert get_response.status_code == 404
        print(f"✓ Deleted campaign ID: {campaign_id}")
    
    def test_delete_campaign_not_found(self, api_client):
        """DELETE /api/events/:eventId/campaigns/:campaignId - 404 for non-existent"""
        response = api_client.delete(f"{BASE_URL}/api/events/{EVENT_ID}/campaigns/99999")
        assert response.status_code == 404
        print("✓ 404 for deleting non-existent campaign")


class TestTemplatesAPI:
    """Test Template CRUD operations"""
    
    created_template_ids = []
    
    # ==================== GET Templates ====================
    def test_get_templates_list(self, api_client):
        """GET /api/events/:eventId/templates - List all templates"""
        response = api_client.get(f"{BASE_URL}/api/events/{EVENT_ID}/templates")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        
        # Verify template structure if any exist
        if len(data) > 0:
            template = data[0]
            assert "id" in template
            assert "name" in template
            assert "channel" in template
            assert "content" in template
            print(f"✓ Found {len(data)} templates")
    
    def test_get_template_variables(self, api_client):
        """GET /api/events/:eventId/templates/variables - Get available variables"""
        response = api_client.get(f"{BASE_URL}/api/events/{EVENT_ID}/templates/variables")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 3  # Attendee, Event, System categories
        
        # Verify structure
        for category in data:
            assert "category" in category
            assert "variables" in category
            assert isinstance(category["variables"], list)
            for var in category["variables"]:
                assert "name" in var
                assert "code" in var
        
        print(f"✓ Found {len(data)} variable categories")
    
    # ==================== CREATE Template ====================
    def test_create_template_email(self, api_client):
        """POST /api/events/:eventId/templates - Create email template"""
        payload = {
            "name": "TEST_Email Template",
            "channel": "email",
            "subject": "Welcome to {{EventName}}",
            "content": "Hi {{FirstName}},\n\nThank you for registering!\n\nEvent: {{EventName}}\nDate: {{EventDate}}\nLocation: {{Location}}"
        }
        
        response = api_client.post(f"{BASE_URL}/api/events/{EVENT_ID}/templates", json=payload)
        assert response.status_code == 201
        
        data = response.json()
        assert data["name"] == payload["name"]
        assert data["channel"] == "email"
        assert data["subject"] == payload["subject"]
        assert data["content"] == payload["content"]
        assert "id" in data
        
        self.created_template_ids.append(data["id"])
        print(f"✓ Created email template ID: {data['id']}")
    
    def test_create_template_sms(self, api_client):
        """POST /api/events/:eventId/templates - Create SMS template"""
        payload = {
            "name": "TEST_SMS Template",
            "channel": "sms",
            "content": "Hi {{FirstName}}, reminder: {{EventName}} is tomorrow at {{Location}}!"
        }
        
        response = api_client.post(f"{BASE_URL}/api/events/{EVENT_ID}/templates", json=payload)
        assert response.status_code == 201
        
        data = response.json()
        assert data["name"] == payload["name"]
        assert data["channel"] == "sms"
        assert data["subject"] is None  # SMS has no subject
        
        self.created_template_ids.append(data["id"])
        print(f"✓ Created SMS template ID: {data['id']}")
    
    def test_create_template_validation_no_name(self, api_client):
        """POST /api/events/:eventId/templates - Validation: name required"""
        payload = {
            "channel": "email",
            "content": "Test content"
        }
        
        response = api_client.post(f"{BASE_URL}/api/events/{EVENT_ID}/templates", json=payload)
        assert response.status_code == 400
        assert "name" in response.json().get("message", "").lower()
        print("✓ Validation: name required")
    
    def test_create_template_validation_no_content(self, api_client):
        """POST /api/events/:eventId/templates - Validation: content required"""
        payload = {
            "name": "Test Template",
            "channel": "email"
        }
        
        response = api_client.post(f"{BASE_URL}/api/events/{EVENT_ID}/templates", json=payload)
        assert response.status_code == 400
        assert "content" in response.json().get("message", "").lower()
        print("✓ Validation: content required")
    
    def test_create_template_validation_invalid_channel(self, api_client):
        """POST /api/events/:eventId/templates - Validation: invalid channel"""
        payload = {
            "name": "Test Template",
            "channel": "invalid",
            "content": "Test"
        }
        
        response = api_client.post(f"{BASE_URL}/api/events/{EVENT_ID}/templates", json=payload)
        assert response.status_code == 400
        assert "channel" in response.json().get("message", "").lower()
        print("✓ Validation: invalid channel rejected")
    
    # ==================== GET Single Template ====================
    def test_get_template_by_id(self, api_client):
        """GET /api/events/:eventId/templates/:templateId - Get single template"""
        if not self.created_template_ids:
            pytest.skip("No templates created")
        
        template_id = self.created_template_ids[0]
        response = api_client.get(f"{BASE_URL}/api/events/{EVENT_ID}/templates/{template_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == template_id
        assert "name" in data
        assert "channel" in data
        assert "content" in data
        print(f"✓ Retrieved template ID: {template_id}")
    
    def test_get_template_not_found(self, api_client):
        """GET /api/events/:eventId/templates/:templateId - 404 for non-existent"""
        response = api_client.get(f"{BASE_URL}/api/events/{EVENT_ID}/templates/99999")
        assert response.status_code == 404
        print("✓ 404 for non-existent template")
    
    # ==================== UPDATE Template ====================
    def test_update_template(self, api_client):
        """PUT /api/events/:eventId/templates/:templateId - Update template"""
        if not self.created_template_ids:
            pytest.skip("No templates created")
        
        template_id = self.created_template_ids[0]
        payload = {
            "name": "TEST_Updated Template Name",
            "subject": "Updated Subject Line",
            "content": "Updated content with {{FirstName}}"
        }
        
        response = api_client.put(f"{BASE_URL}/api/events/{EVENT_ID}/templates/{template_id}", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["name"] == payload["name"]
        assert data["subject"] == payload["subject"]
        assert data["content"] == payload["content"]
        
        # Verify persistence
        get_response = api_client.get(f"{BASE_URL}/api/events/{EVENT_ID}/templates/{template_id}")
        assert get_response.status_code == 200
        assert get_response.json()["name"] == payload["name"]
        print(f"✓ Updated template ID: {template_id}")
    
    def test_update_template_not_found(self, api_client):
        """PUT /api/events/:eventId/templates/:templateId - 404 for non-existent"""
        payload = {"name": "Test"}
        response = api_client.put(f"{BASE_URL}/api/events/{EVENT_ID}/templates/99999", json=payload)
        assert response.status_code == 404
        print("✓ 404 for updating non-existent template")
    
    # ==================== DUPLICATE Template ====================
    def test_duplicate_template(self, api_client):
        """POST /api/events/:eventId/templates/:templateId/duplicate - Duplicate template"""
        if not self.created_template_ids:
            pytest.skip("No templates created")
        
        template_id = self.created_template_ids[0]
        response = api_client.post(f"{BASE_URL}/api/events/{EVENT_ID}/templates/{template_id}/duplicate")
        assert response.status_code == 201
        
        data = response.json()
        assert "(Copy)" in data["name"]
        assert data["id"] != template_id
        
        self.created_template_ids.append(data["id"])
        print(f"✓ Duplicated template, new ID: {data['id']}")
    
    def test_duplicate_template_not_found(self, api_client):
        """POST /api/events/:eventId/templates/:templateId/duplicate - 404 for non-existent"""
        response = api_client.post(f"{BASE_URL}/api/events/{EVENT_ID}/templates/99999/duplicate")
        assert response.status_code == 404
        print("✓ 404 for duplicating non-existent template")
    
    # ==================== DELETE Template ====================
    def test_delete_template(self, api_client):
        """DELETE /api/events/:eventId/templates/:templateId - Delete template"""
        # Create a template to delete
        payload = {
            "name": "TEST_Template to Delete",
            "channel": "email",
            "content": "Will be deleted"
        }
        
        create_response = api_client.post(f"{BASE_URL}/api/events/{EVENT_ID}/templates", json=payload)
        assert create_response.status_code == 201
        template_id = create_response.json()["id"]
        
        # Delete it
        response = api_client.delete(f"{BASE_URL}/api/events/{EVENT_ID}/templates/{template_id}")
        assert response.status_code == 200
        
        # Verify it's gone
        get_response = api_client.get(f"{BASE_URL}/api/events/{EVENT_ID}/templates/{template_id}")
        assert get_response.status_code == 404
        print(f"✓ Deleted template ID: {template_id}")
    
    def test_delete_template_not_found(self, api_client):
        """DELETE /api/events/:eventId/templates/:templateId - 404 for non-existent"""
        response = api_client.delete(f"{BASE_URL}/api/events/{EVENT_ID}/templates/99999")
        assert response.status_code == 404
        print("✓ 404 for deleting non-existent template")


class TestCampaignTemplateIntegration:
    """Test integration between campaigns and templates"""
    
    def test_create_campaign_with_template(self, api_client):
        """Create campaign using existing template"""
        # First get templates
        templates_response = api_client.get(f"{BASE_URL}/api/events/{EVENT_ID}/templates")
        templates = templates_response.json()
        
        if not templates:
            pytest.skip("No templates available")
        
        template_id = templates[0]["id"]
        
        # Create campaign with template
        payload = {
            "name": "TEST_Campaign with Template",
            "channel": templates[0]["channel"],
            "template_id": template_id,
            "audience_rule": {"type": "all"}
        }
        
        response = api_client.post(f"{BASE_URL}/api/events/{EVENT_ID}/campaigns", json=payload)
        assert response.status_code == 201
        
        data = response.json()
        assert data["template_id"] == template_id
        print(f"✓ Created campaign with template ID: {template_id}")


class TestCleanup:
    """Cleanup test data"""
    
    def test_cleanup_test_campaigns(self, api_client):
        """Clean up TEST_ prefixed campaigns"""
        response = api_client.get(f"{BASE_URL}/api/events/{EVENT_ID}/campaigns")
        campaigns = response.json()
        
        deleted_count = 0
        for campaign in campaigns:
            if campaign["name"].startswith("TEST_"):
                del_response = api_client.delete(f"{BASE_URL}/api/events/{EVENT_ID}/campaigns/{campaign['id']}")
                if del_response.status_code == 200:
                    deleted_count += 1
        
        print(f"✓ Cleaned up {deleted_count} test campaigns")
    
    def test_cleanup_test_templates(self, api_client):
        """Clean up TEST_ prefixed templates"""
        response = api_client.get(f"{BASE_URL}/api/events/{EVENT_ID}/templates")
        templates = response.json()
        
        deleted_count = 0
        for template in templates:
            if template["name"].startswith("TEST_"):
                del_response = api_client.delete(f"{BASE_URL}/api/events/{EVENT_ID}/templates/{template['id']}")
                if del_response.status_code == 200:
                    deleted_count += 1
        
        print(f"✓ Cleaned up {deleted_count} test templates")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
