"""
Test suite for Event Add-ons, Promo Codes, and Settings APIs
Tests CRUD operations for:
- Add-ons: GET/POST/PUT/DELETE /api/events/:eventId/addons
- Promo Codes: GET/POST/PUT/DELETE /api/events/:eventId/promo-codes
- Settings: GET/PUT /api/events/:eventId/settings
"""

import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://eventsphere-20.preview.emergentagent.com').rstrip('/')
EVENT_ID = 1  # Test event ID


class TestAddonsAPI:
    """Add-ons CRUD API tests"""
    
    created_addon_id = None
    
    def test_get_addons_list(self):
        """GET /api/events/:eventId/addons - returns list of add-ons"""
        response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/addons")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Should have at least the seed addon "Event T-Shirt"
        assert len(data) >= 1
        # Verify addon structure
        addon = data[0]
        assert "id" in addon
        assert "name" in addon
        assert "price" in addon
        assert "addon_type" in addon
        assert "is_active" in addon
        print(f"✓ GET addons list: {len(data)} addons found")
    
    def test_create_addon_success(self):
        """POST /api/events/:eventId/addons - creates new add-on"""
        payload = {
            "name": "TEST_Parking Pass",
            "description": "VIP parking spot",
            "addon_type": "service",
            "price": 50.00,
            "currency": "USD",
            "unlimited_quantity": False,
            "quantity_limit": 50,
            "per_order_limit": 2,
            "is_active": True,
            "is_visible": True
        }
        response = requests.post(f"{BASE_URL}/api/events/{EVENT_ID}/addons", json=payload)
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == payload["name"]
        assert data["description"] == payload["description"]
        assert data["addon_type"] == payload["addon_type"]
        assert float(data["price"]) == payload["price"]
        assert data["is_active"] == True
        TestAddonsAPI.created_addon_id = data["id"]
        print(f"✓ Created addon: {data['name']} (ID: {data['id']})")
    
    def test_create_addon_validation_name_required(self):
        """POST /api/events/:eventId/addons - validates name is required"""
        payload = {"price": 25.00}
        response = requests.post(f"{BASE_URL}/api/events/{EVENT_ID}/addons", json=payload)
        assert response.status_code == 400
        data = response.json()
        assert "name" in data.get("message", "").lower() or "required" in data.get("message", "").lower()
        print("✓ Validation: name required")
    
    def test_create_addon_validation_negative_price(self):
        """POST /api/events/:eventId/addons - validates price cannot be negative"""
        payload = {"name": "Invalid Addon", "price": -10}
        response = requests.post(f"{BASE_URL}/api/events/{EVENT_ID}/addons", json=payload)
        assert response.status_code == 400
        print("✓ Validation: negative price rejected")
    
    def test_get_addon_by_id(self):
        """GET /api/events/:eventId/addons/:addonId - returns single add-on"""
        if not TestAddonsAPI.created_addon_id:
            pytest.skip("No addon created to fetch")
        
        response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/addons/{TestAddonsAPI.created_addon_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == TestAddonsAPI.created_addon_id
        assert data["name"] == "TEST_Parking Pass"
        print(f"✓ GET addon by ID: {data['name']}")
    
    def test_get_addon_not_found(self):
        """GET /api/events/:eventId/addons/:addonId - returns 404 for non-existent"""
        response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/addons/99999")
        assert response.status_code == 404
        print("✓ GET addon not found: 404")
    
    def test_update_addon(self):
        """PUT /api/events/:eventId/addons/:addonId - updates add-on"""
        if not TestAddonsAPI.created_addon_id:
            pytest.skip("No addon created to update")
        
        payload = {
            "name": "TEST_Parking Pass Updated",
            "price": 75.00,
            "description": "Premium VIP parking spot"
        }
        response = requests.put(f"{BASE_URL}/api/events/{EVENT_ID}/addons/{TestAddonsAPI.created_addon_id}", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == payload["name"]
        assert float(data["price"]) == payload["price"]
        assert data["description"] == payload["description"]
        print(f"✓ Updated addon: {data['name']}")
        
        # Verify persistence with GET
        get_response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/addons/{TestAddonsAPI.created_addon_id}")
        assert get_response.status_code == 200
        fetched = get_response.json()
        assert fetched["name"] == payload["name"]
        print("✓ Update persisted correctly")
    
    def test_toggle_addon_status(self):
        """POST /api/events/:eventId/addons/:addonId/toggle - toggles active status"""
        if not TestAddonsAPI.created_addon_id:
            pytest.skip("No addon created to toggle")
        
        # Get current status
        get_response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/addons/{TestAddonsAPI.created_addon_id}")
        current_status = get_response.json()["is_active"]
        
        # Toggle
        response = requests.post(f"{BASE_URL}/api/events/{EVENT_ID}/addons/{TestAddonsAPI.created_addon_id}/toggle")
        assert response.status_code == 200
        data = response.json()
        assert data["is_active"] == (not current_status)
        print(f"✓ Toggled addon status: {current_status} -> {data['is_active']}")
        
        # Toggle back
        response2 = requests.post(f"{BASE_URL}/api/events/{EVENT_ID}/addons/{TestAddonsAPI.created_addon_id}/toggle")
        assert response2.status_code == 200
        assert response2.json()["is_active"] == current_status
        print("✓ Toggled back to original status")
    
    def test_delete_addon(self):
        """DELETE /api/events/:eventId/addons/:addonId - deletes add-on"""
        if not TestAddonsAPI.created_addon_id:
            pytest.skip("No addon created to delete")
        
        response = requests.delete(f"{BASE_URL}/api/events/{EVENT_ID}/addons/{TestAddonsAPI.created_addon_id}")
        assert response.status_code == 200
        print(f"✓ Deleted addon ID: {TestAddonsAPI.created_addon_id}")
        
        # Verify deletion with GET (should return 404)
        get_response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/addons/{TestAddonsAPI.created_addon_id}")
        assert get_response.status_code == 404
        print("✓ Addon no longer accessible after delete")


class TestPromoCodesAPI:
    """Promo Codes CRUD API tests"""
    
    created_promo_id = None
    
    def test_get_promo_codes_list(self):
        """GET /api/events/:eventId/promo-codes - returns list of promo codes"""
        response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/promo-codes")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Should have at least the seed promo "EARLYBIRD20"
        assert len(data) >= 1
        # Verify promo structure
        promo = data[0]
        assert "id" in promo
        assert "code" in promo
        assert "discount_type" in promo
        assert "discount_value" in promo
        assert "is_active" in promo
        print(f"✓ GET promo codes list: {len(data)} codes found")
    
    def test_create_promo_code_percentage(self):
        """POST /api/events/:eventId/promo-codes - creates percentage discount"""
        payload = {
            "code": "TEST_SAVE25",
            "discount_type": "percentage",
            "discount_value": 25,
            "max_discount_amount": 100,
            "min_order_value": 50,
            "applicable_to": "all",
            "usage_limit": 100,
            "is_active": True
        }
        response = requests.post(f"{BASE_URL}/api/events/{EVENT_ID}/promo-codes", json=payload)
        assert response.status_code == 201
        data = response.json()
        assert data["code"] == payload["code"]
        assert data["discount_type"] == "percentage"
        assert float(data["discount_value"]) == payload["discount_value"]
        assert data["is_active"] == True
        TestPromoCodesAPI.created_promo_id = data["id"]
        print(f"✓ Created promo code: {data['code']} (ID: {data['id']})")
    
    def test_create_promo_code_fixed(self):
        """POST /api/events/:eventId/promo-codes - creates fixed discount"""
        payload = {
            "code": "TEST_FLAT10",
            "discount_type": "fixed",
            "discount_value": 10,
            "applicable_to": "tickets",
            "is_active": True
        }
        response = requests.post(f"{BASE_URL}/api/events/{EVENT_ID}/promo-codes", json=payload)
        assert response.status_code == 201
        data = response.json()
        assert data["code"] == payload["code"]
        assert data["discount_type"] == "fixed"
        print(f"✓ Created fixed discount promo: {data['code']}")
        
        # Clean up
        requests.delete(f"{BASE_URL}/api/events/{EVENT_ID}/promo-codes/{data['id']}")
    
    def test_create_promo_validation_code_required(self):
        """POST /api/events/:eventId/promo-codes - validates code is required"""
        payload = {"discount_type": "percentage", "discount_value": 10}
        response = requests.post(f"{BASE_URL}/api/events/{EVENT_ID}/promo-codes", json=payload)
        assert response.status_code == 400
        print("✓ Validation: code required")
    
    def test_create_promo_validation_discount_type(self):
        """POST /api/events/:eventId/promo-codes - validates discount type"""
        payload = {"code": "INVALID", "discount_type": "invalid", "discount_value": 10}
        response = requests.post(f"{BASE_URL}/api/events/{EVENT_ID}/promo-codes", json=payload)
        assert response.status_code == 400
        print("✓ Validation: invalid discount type rejected")
    
    def test_create_promo_validation_percentage_max(self):
        """POST /api/events/:eventId/promo-codes - validates percentage <= 100"""
        payload = {"code": "INVALID", "discount_type": "percentage", "discount_value": 150}
        response = requests.post(f"{BASE_URL}/api/events/{EVENT_ID}/promo-codes", json=payload)
        assert response.status_code == 400
        print("✓ Validation: percentage > 100 rejected")
    
    def test_create_promo_validation_positive_value(self):
        """POST /api/events/:eventId/promo-codes - validates discount value > 0"""
        payload = {"code": "INVALID", "discount_type": "percentage", "discount_value": 0}
        response = requests.post(f"{BASE_URL}/api/events/{EVENT_ID}/promo-codes", json=payload)
        assert response.status_code == 400
        print("✓ Validation: discount value must be > 0")
    
    def test_get_promo_code_by_id(self):
        """GET /api/events/:eventId/promo-codes/:promoId - returns single promo"""
        if not TestPromoCodesAPI.created_promo_id:
            pytest.skip("No promo created to fetch")
        
        response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/promo-codes/{TestPromoCodesAPI.created_promo_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == TestPromoCodesAPI.created_promo_id
        assert data["code"] == "TEST_SAVE25"
        print(f"✓ GET promo by ID: {data['code']}")
    
    def test_get_promo_code_not_found(self):
        """GET /api/events/:eventId/promo-codes/:promoId - returns 404 for non-existent"""
        response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/promo-codes/99999")
        assert response.status_code == 404
        print("✓ GET promo not found: 404")
    
    def test_update_promo_code(self):
        """PUT /api/events/:eventId/promo-codes/:promoId - updates promo code"""
        if not TestPromoCodesAPI.created_promo_id:
            pytest.skip("No promo created to update")
        
        payload = {
            "code": "TEST_SAVE30",
            "discount_value": 30,
            "usage_limit": 200
        }
        response = requests.put(f"{BASE_URL}/api/events/{EVENT_ID}/promo-codes/{TestPromoCodesAPI.created_promo_id}", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["code"] == payload["code"]
        assert float(data["discount_value"]) == payload["discount_value"]
        print(f"✓ Updated promo code: {data['code']}")
        
        # Verify persistence
        get_response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/promo-codes/{TestPromoCodesAPI.created_promo_id}")
        assert get_response.status_code == 200
        fetched = get_response.json()
        assert fetched["code"] == payload["code"]
        print("✓ Update persisted correctly")
    
    def test_toggle_promo_status(self):
        """POST /api/events/:eventId/promo-codes/:promoId/toggle - toggles active status"""
        if not TestPromoCodesAPI.created_promo_id:
            pytest.skip("No promo created to toggle")
        
        # Get current status
        get_response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/promo-codes/{TestPromoCodesAPI.created_promo_id}")
        current_status = get_response.json()["is_active"]
        
        # Toggle
        response = requests.post(f"{BASE_URL}/api/events/{EVENT_ID}/promo-codes/{TestPromoCodesAPI.created_promo_id}/toggle")
        assert response.status_code == 200
        data = response.json()
        assert data["is_active"] == (not current_status)
        print(f"✓ Toggled promo status: {current_status} -> {data['is_active']}")
        
        # Toggle back
        response2 = requests.post(f"{BASE_URL}/api/events/{EVENT_ID}/promo-codes/{TestPromoCodesAPI.created_promo_id}/toggle")
        assert response2.status_code == 200
        print("✓ Toggled back to original status")
    
    def test_delete_promo_code(self):
        """DELETE /api/events/:eventId/promo-codes/:promoId - deletes promo code"""
        if not TestPromoCodesAPI.created_promo_id:
            pytest.skip("No promo created to delete")
        
        response = requests.delete(f"{BASE_URL}/api/events/{EVENT_ID}/promo-codes/{TestPromoCodesAPI.created_promo_id}")
        assert response.status_code == 200
        print(f"✓ Deleted promo code ID: {TestPromoCodesAPI.created_promo_id}")
        
        # Verify deletion
        get_response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/promo-codes/{TestPromoCodesAPI.created_promo_id}")
        assert get_response.status_code == 404
        print("✓ Promo code no longer accessible after delete")


class TestEventSettingsAPI:
    """Event Settings API tests"""
    
    original_settings = None
    
    def test_get_event_settings(self):
        """GET /api/events/:eventId/settings - returns event settings"""
        response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/settings")
        assert response.status_code == 200
        data = response.json()
        
        # Verify all settings fields exist
        assert "id" in data
        assert "event_id" in data
        # Tax & Fees
        assert "pass_fees_to_attendees" in data
        assert "charge_tax" in data
        # Refund Policy
        assert "refund_policy" in data
        # Ticket Sales Rules
        assert "allow_transfers" in data
        assert "allow_cancellations" in data
        assert "lock_changes_after_event_start" in data
        # Visibility Rules
        assert "hide_sold_out_tickets" in data
        assert "auto_hide_past_tickets" in data
        # Approval
        assert "approval_mode" in data
        # Confirmation & Invoices
        assert "auto_send_confirmation" in data
        assert "attach_invoice" in data
        assert "show_tax_breakdown" in data
        # Capacity Rules
        assert "stop_sales_when_full" in data
        assert "allow_admin_overselling" in data
        assert "auto_enable_waitlist" in data
        
        TestEventSettingsAPI.original_settings = data
        print(f"✓ GET settings: All {len(data)} fields present")
    
    def test_update_tax_fees_settings(self):
        """PUT /api/events/:eventId/settings - updates tax & fees"""
        payload = {
            "pass_fees_to_attendees": True,
            "charge_tax": True,
            "tax_type": "percentage",
            "tax_rate": 8.5
        }
        response = requests.put(f"{BASE_URL}/api/events/{EVENT_ID}/settings", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["pass_fees_to_attendees"] == True
        assert data["charge_tax"] == True
        assert data["tax_type"] == "percentage"
        assert float(data["tax_rate"]) == 8.5
        print("✓ Updated Tax & Fees settings")
        
        # Verify persistence
        get_response = requests.get(f"{BASE_URL}/api/events/{EVENT_ID}/settings")
        fetched = get_response.json()
        assert fetched["pass_fees_to_attendees"] == True
        assert fetched["charge_tax"] == True
        print("✓ Tax & Fees settings persisted")
    
    def test_update_refund_policy_settings(self):
        """PUT /api/events/:eventId/settings - updates refund policy"""
        payload = {
            "refund_policy": "partial",
            "refund_deadline_days": 7,
            "refund_percentage": 75
        }
        response = requests.put(f"{BASE_URL}/api/events/{EVENT_ID}/settings", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["refund_policy"] == "partial"
        assert data["refund_deadline_days"] == 7
        assert float(data["refund_percentage"]) == 75
        print("✓ Updated Refund Policy settings")
    
    def test_update_ticket_sales_rules(self):
        """PUT /api/events/:eventId/settings - updates ticket sales rules"""
        payload = {
            "allow_transfers": True,
            "allow_cancellations": True,
            "lock_changes_after_event_start": False
        }
        response = requests.put(f"{BASE_URL}/api/events/{EVENT_ID}/settings", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["allow_transfers"] == True
        assert data["allow_cancellations"] == True
        assert data["lock_changes_after_event_start"] == False
        print("✓ Updated Ticket Sales Rules")
    
    def test_update_visibility_rules(self):
        """PUT /api/events/:eventId/settings - updates visibility rules"""
        payload = {
            "hide_sold_out_tickets": True,
            "auto_hide_past_tickets": False
        }
        response = requests.put(f"{BASE_URL}/api/events/{EVENT_ID}/settings", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["hide_sold_out_tickets"] == True
        assert data["auto_hide_past_tickets"] == False
        print("✓ Updated Visibility Rules")
    
    def test_update_approval_mode(self):
        """PUT /api/events/:eventId/settings - updates approval mode"""
        payload = {
            "approval_mode": "manual",
            "pending_approval_expiry_hours": 48
        }
        response = requests.put(f"{BASE_URL}/api/events/{EVENT_ID}/settings", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["approval_mode"] == "manual"
        assert data["pending_approval_expiry_hours"] == 48
        print("✓ Updated Approval Mode settings")
    
    def test_update_confirmation_invoices(self):
        """PUT /api/events/:eventId/settings - updates confirmation & invoices"""
        payload = {
            "auto_send_confirmation": True,
            "attach_invoice": True,
            "show_tax_breakdown": True
        }
        response = requests.put(f"{BASE_URL}/api/events/{EVENT_ID}/settings", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["auto_send_confirmation"] == True
        assert data["attach_invoice"] == True
        assert data["show_tax_breakdown"] == True
        print("✓ Updated Confirmation & Invoices settings")
    
    def test_update_capacity_rules(self):
        """PUT /api/events/:eventId/settings - updates capacity rules"""
        payload = {
            "stop_sales_when_full": True,
            "allow_admin_overselling": True,
            "auto_enable_waitlist": True
        }
        response = requests.put(f"{BASE_URL}/api/events/{EVENT_ID}/settings", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["stop_sales_when_full"] == True
        assert data["allow_admin_overselling"] == True
        assert data["auto_enable_waitlist"] == True
        print("✓ Updated Capacity Rules")
    
    def test_restore_original_settings(self):
        """Restore original settings after tests"""
        if TestEventSettingsAPI.original_settings:
            # Restore key settings to original values
            restore_payload = {
                "pass_fees_to_attendees": TestEventSettingsAPI.original_settings.get("pass_fees_to_attendees", False),
                "charge_tax": TestEventSettingsAPI.original_settings.get("charge_tax", False),
                "refund_policy": TestEventSettingsAPI.original_settings.get("refund_policy", "no_refunds"),
                "allow_transfers": TestEventSettingsAPI.original_settings.get("allow_transfers", False),
                "allow_cancellations": TestEventSettingsAPI.original_settings.get("allow_cancellations", False),
                "lock_changes_after_event_start": TestEventSettingsAPI.original_settings.get("lock_changes_after_event_start", True),
                "hide_sold_out_tickets": TestEventSettingsAPI.original_settings.get("hide_sold_out_tickets", False),
                "auto_hide_past_tickets": TestEventSettingsAPI.original_settings.get("auto_hide_past_tickets", True),
                "approval_mode": TestEventSettingsAPI.original_settings.get("approval_mode", "auto"),
                "auto_send_confirmation": TestEventSettingsAPI.original_settings.get("auto_send_confirmation", True),
                "attach_invoice": TestEventSettingsAPI.original_settings.get("attach_invoice", False),
                "show_tax_breakdown": TestEventSettingsAPI.original_settings.get("show_tax_breakdown", False),
                "stop_sales_when_full": TestEventSettingsAPI.original_settings.get("stop_sales_when_full", True),
                "allow_admin_overselling": TestEventSettingsAPI.original_settings.get("allow_admin_overselling", False),
                "auto_enable_waitlist": TestEventSettingsAPI.original_settings.get("auto_enable_waitlist", False),
            }
            response = requests.put(f"{BASE_URL}/api/events/{EVENT_ID}/settings", json=restore_payload)
            assert response.status_code == 200
            print("✓ Restored original settings")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
