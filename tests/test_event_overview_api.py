"""
Event Overview API Tests
Tests for Event Detail Module - Overview Tab APIs
- GET /api/events/:eventId - Event details
- GET /api/events/:eventId/overview/metrics - Overview metrics
- GET /api/events/:eventId/overview/funnel - Registration funnel
- GET /api/events/:eventId/overview/tickets - Ticket inventory
- GET /api/events/:eventId/overview/alerts - Attention alerts
- GET /api/events/:eventId/overview/activity - Activity timeline
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('VITE_API_URL', 'https://eventflow-151.preview.emergentagent.com')
TEST_EVENT_ID = 1


class TestEventDetailsAPI:
    """Test GET /api/events/:eventId endpoint"""
    
    def test_get_event_by_id_success(self):
        """Test fetching event details by ID"""
        response = requests.get(f"{BASE_URL}/api/events/{TEST_EVENT_ID}")
        assert response.status_code == 200
        
        data = response.json()
        assert 'id' in data
        assert 'name' in data
        assert 'event_code' in data
        assert 'status' in data
        assert 'start_date' in data
        assert 'end_date' in data
        assert data['id'] == TEST_EVENT_ID
        print(f"✓ Event details fetched: {data['name']}")
    
    def test_get_event_invalid_id(self):
        """Test fetching event with invalid ID"""
        response = requests.get(f"{BASE_URL}/api/events/invalid")
        assert response.status_code == 400
        data = response.json()
        assert 'message' in data
        print("✓ Invalid event ID returns 400")
    
    def test_get_event_not_found(self):
        """Test fetching non-existent event"""
        response = requests.get(f"{BASE_URL}/api/events/99999")
        assert response.status_code == 404
        data = response.json()
        assert 'message' in data
        print("✓ Non-existent event returns 404")


class TestOverviewMetricsAPI:
    """Test GET /api/events/:eventId/overview/metrics endpoint"""
    
    def test_get_metrics_success(self):
        """Test fetching overview metrics"""
        response = requests.get(f"{BASE_URL}/api/events/{TEST_EVENT_ID}/overview/metrics")
        assert response.status_code == 200
        
        data = response.json()
        # Verify all required fields
        assert 'totalRegistrations' in data
        assert 'registrationsChange' in data
        assert 'grossRevenue' in data
        assert 'revenueChange' in data
        assert 'pageViews' in data
        assert 'pageViewsChange' in data
        assert 'conversionRate' in data
        assert 'conversionRateChange' in data
        
        # Verify data types
        assert isinstance(data['totalRegistrations'], int)
        assert isinstance(data['grossRevenue'], (int, float))
        assert isinstance(data['pageViews'], int)
        assert isinstance(data['conversionRate'], (int, float))
        
        print(f"✓ Metrics: {data['totalRegistrations']} registrations, ${data['grossRevenue']} revenue")
    
    def test_get_metrics_with_date_range(self):
        """Test fetching metrics with date range filter"""
        params = {
            'startDate': '2024-01-01',
            'endDate': '2024-12-31'
        }
        response = requests.get(f"{BASE_URL}/api/events/{TEST_EVENT_ID}/overview/metrics", params=params)
        assert response.status_code == 200
        
        data = response.json()
        assert 'totalRegistrations' in data
        print("✓ Metrics with date range filter works")
    
    def test_get_metrics_invalid_event(self):
        """Test fetching metrics for invalid event"""
        response = requests.get(f"{BASE_URL}/api/events/invalid/overview/metrics")
        assert response.status_code == 400
        print("✓ Invalid event ID returns 400 for metrics")
    
    def test_get_metrics_not_found(self):
        """Test fetching metrics for non-existent event"""
        response = requests.get(f"{BASE_URL}/api/events/99999/overview/metrics")
        assert response.status_code == 404
        print("✓ Non-existent event returns 404 for metrics")


class TestRegistrationFunnelAPI:
    """Test GET /api/events/:eventId/overview/funnel endpoint"""
    
    def test_get_funnel_success(self):
        """Test fetching registration funnel data"""
        response = requests.get(f"{BASE_URL}/api/events/{TEST_EVENT_ID}/overview/funnel")
        assert response.status_code == 200
        
        data = response.json()
        # Verify all funnel stages
        assert 'pageViews' in data
        assert 'addToCart' in data
        assert 'checkoutStarted' in data
        assert 'completedRegistration' in data
        
        # Verify data types
        assert isinstance(data['pageViews'], int)
        assert isinstance(data['addToCart'], int)
        assert isinstance(data['checkoutStarted'], int)
        assert isinstance(data['completedRegistration'], int)
        
        print(f"✓ Funnel: {data['pageViews']} views → {data['completedRegistration']} registrations")
    
    def test_get_funnel_with_date_range(self):
        """Test fetching funnel with date range filter"""
        params = {
            'startDate': '2024-01-01',
            'endDate': '2024-12-31'
        }
        response = requests.get(f"{BASE_URL}/api/events/{TEST_EVENT_ID}/overview/funnel", params=params)
        assert response.status_code == 200
        
        data = response.json()
        assert 'pageViews' in data
        print("✓ Funnel with date range filter works")
    
    def test_get_funnel_invalid_event(self):
        """Test fetching funnel for invalid event"""
        response = requests.get(f"{BASE_URL}/api/events/invalid/overview/funnel")
        assert response.status_code == 400
        print("✓ Invalid event ID returns 400 for funnel")


class TestTicketInventoryAPI:
    """Test GET /api/events/:eventId/overview/tickets endpoint"""
    
    def test_get_tickets_success(self):
        """Test fetching ticket inventory"""
        response = requests.get(f"{BASE_URL}/api/events/{TEST_EVENT_ID}/overview/tickets")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        
        if len(data) > 0:
            ticket = data[0]
            assert 'id' in ticket
            assert 'name' in ticket
            assert 'sold' in ticket
            assert 'total' in ticket
            assert 'status' in ticket
            
            # Verify status values
            valid_statuses = ['Available', 'Selling Fast', 'Sold Out', 'Draft', 'Ended']
            assert ticket['status'] in valid_statuses
            
            print(f"✓ Tickets: {len(data)} ticket types found")
            for t in data:
                print(f"  - {t['name']}: {t['sold']}/{t['total']} ({t['status']})")
        else:
            print("✓ Tickets: No tickets found (empty list)")
    
    def test_get_tickets_invalid_event(self):
        """Test fetching tickets for invalid event"""
        response = requests.get(f"{BASE_URL}/api/events/invalid/overview/tickets")
        assert response.status_code == 400
        print("✓ Invalid event ID returns 400 for tickets")
    
    def test_get_tickets_not_found(self):
        """Test fetching tickets for non-existent event"""
        response = requests.get(f"{BASE_URL}/api/events/99999/overview/tickets")
        assert response.status_code == 404
        print("✓ Non-existent event returns 404 for tickets")


class TestAttentionAlertsAPI:
    """Test GET /api/events/:eventId/overview/alerts endpoint"""
    
    def test_get_alerts_success(self):
        """Test fetching attention alerts"""
        response = requests.get(f"{BASE_URL}/api/events/{TEST_EVENT_ID}/overview/alerts")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        
        if len(data) > 0:
            alert = data[0]
            assert 'type' in alert
            assert 'text' in alert
            assert 'category' in alert
            
            # Verify alert types
            valid_types = ['warning', 'error', 'info']
            assert alert['type'] in valid_types
            
            print(f"✓ Alerts: {len(data)} alerts found")
            for a in data:
                print(f"  - [{a['type']}] {a['text']}")
        else:
            print("✓ Alerts: No alerts (all good)")
    
    def test_get_alerts_invalid_event(self):
        """Test fetching alerts for invalid event"""
        response = requests.get(f"{BASE_URL}/api/events/invalid/overview/alerts")
        assert response.status_code == 400
        print("✓ Invalid event ID returns 400 for alerts")


class TestActivityTimelineAPI:
    """Test GET /api/events/:eventId/overview/activity endpoint"""
    
    def test_get_activity_success(self):
        """Test fetching activity timeline"""
        response = requests.get(f"{BASE_URL}/api/events/{TEST_EVENT_ID}/overview/activity")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        
        if len(data) > 0:
            log = data[0]
            assert 'id' in log
            assert 'actorType' in log
            assert 'actionType' in log
            assert 'description' in log
            assert 'createdAt' in log
            
            # Verify actor types
            valid_actor_types = ['system', 'admin', 'user']
            assert log['actorType'] in valid_actor_types
            
            print(f"✓ Activity: {len(data)} logs found")
            for l in data[:3]:  # Show first 3
                print(f"  - [{l['actorType']}] {l['description']}")
        else:
            print("✓ Activity: No activity logs")
    
    def test_get_activity_with_limit(self):
        """Test fetching activity with limit parameter"""
        response = requests.get(f"{BASE_URL}/api/events/{TEST_EVENT_ID}/overview/activity", params={'limit': 5})
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) <= 5
        print(f"✓ Activity with limit: {len(data)} logs returned")
    
    def test_get_activity_invalid_event(self):
        """Test fetching activity for invalid event"""
        response = requests.get(f"{BASE_URL}/api/events/invalid/overview/activity")
        assert response.status_code == 400
        print("✓ Invalid event ID returns 400 for activity")


class TestEventsListAPI:
    """Test GET /api/events endpoint for row click navigation"""
    
    def test_get_events_list(self):
        """Test fetching events list"""
        response = requests.get(f"{BASE_URL}/api/events")
        assert response.status_code == 200
        
        data = response.json()
        assert 'data' in data
        assert 'pagination' in data
        assert isinstance(data['data'], list)
        
        if len(data['data']) > 0:
            event = data['data'][0]
            assert 'id' in event
            assert 'name' in event
            assert 'event_code' in event
            print(f"✓ Events list: {len(data['data'])} events found")
        else:
            print("✓ Events list: No events found")


if __name__ == '__main__':
    pytest.main([__file__, '-v', '--tb=short'])
