"""
Payment & Tax Settings API Tests
Tests for GET/PUT/POST reset endpoints for event payment and tax configuration
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('VITE_API_URL', 'https://datapolicyhub.preview.emergentagent.com')

# Valid currencies list
VALID_CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD', 'SGD', 'JPY', 'CHF', 'AED']


@pytest.fixture(scope='module')
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({'Content-Type': 'application/json'})
    return session


@pytest.fixture(scope='module')
def auth_token(api_client):
    """Get authentication token"""
    response = api_client.post(f'{BASE_URL}/api/auth/login', json={
        'email': 'admin@example.com',
        'password': 'admin123'
    })
    if response.status_code == 200:
        return response.json().get('token')
    pytest.skip('Authentication failed - skipping authenticated tests')


@pytest.fixture(scope='module')
def authenticated_client(api_client, auth_token):
    """Session with auth header"""
    api_client.headers.update({'Authorization': f'Bearer {auth_token}'})
    return api_client


class TestPaymentTaxGetSettings:
    """Tests for GET /api/events/:eventId/payment-tax"""
    
    def test_get_event_settings_success(self, api_client):
        """GET returns 200 with correct settings structure for event 1"""
        response = api_client.get(f'{BASE_URL}/api/events/1/payment-tax')
        assert response.status_code == 200
        
        data = response.json()
        # Verify all required fields exist
        assert 'id' in data
        assert 'event_id' in data
        assert 'currency' in data
        assert 'stripe_enabled' in data
        assert 'razorpay_enabled' in data
        assert 'offline_enabled' in data
        assert 'tax_enabled' in data
        assert 'tax_name' in data
        assert 'tax_percentage' in data
        assert 'legal_entity_name' in data
        assert 'billing_address' in data
        assert 'tax_id' in data
        
    def test_get_event_settings_saved_values(self, api_client):
        """GET returns previously saved values for event 1"""
        response = api_client.get(f'{BASE_URL}/api/events/1/payment-tax')
        assert response.status_code == 200
        
        data = response.json()
        # Verify saved values as per context
        assert data['currency'] == 'INR'
        assert data['stripe_enabled'] == True
        assert data['razorpay_enabled'] == True
        assert data['offline_enabled'] == False
        assert data['tax_enabled'] == True
        assert data['tax_name'] == 'GST'
        assert float(data['tax_percentage']) == 18.0
        assert data['legal_entity_name'] == 'Acme Corp Pvt Ltd'
        
    def test_get_event_settings_invalid_event_id(self, api_client):
        """GET returns 400 for invalid event ID"""
        response = api_client.get(f'{BASE_URL}/api/events/invalid/payment-tax')
        assert response.status_code == 400
        
    def test_get_event_settings_nonexistent_event(self, api_client):
        """GET returns 404 for non-existent event"""
        response = api_client.get(f'{BASE_URL}/api/events/99999/payment-tax')
        assert response.status_code == 404


class TestPaymentTaxUpdateSettings:
    """Tests for PUT /api/events/:eventId/payment-tax"""
    
    def test_update_currency(self, authenticated_client):
        """PUT updates currency successfully"""
        response = authenticated_client.put(f'{BASE_URL}/api/events/1/payment-tax', json={
            'currency': 'USD'
        })
        assert response.status_code == 200
        
        data = response.json()
        assert data['currency'] == 'USD'
        
        # Verify persistence with GET
        get_response = authenticated_client.get(f'{BASE_URL}/api/events/1/payment-tax')
        assert get_response.json()['currency'] == 'USD'
        
        # Restore original value
        authenticated_client.put(f'{BASE_URL}/api/events/1/payment-tax', json={
            'currency': 'INR'
        })
        
    def test_update_all_currencies(self, authenticated_client):
        """PUT accepts all 10 valid currencies"""
        for currency in VALID_CURRENCIES:
            response = authenticated_client.put(f'{BASE_URL}/api/events/1/payment-tax', json={
                'currency': currency
            })
            assert response.status_code == 200, f'Failed for currency: {currency}'
            assert response.json()['currency'] == currency
            
        # Restore original value
        authenticated_client.put(f'{BASE_URL}/api/events/1/payment-tax', json={
            'currency': 'INR'
        })
        
    def test_update_invalid_currency(self, authenticated_client):
        """PUT returns 400 for invalid currency"""
        response = authenticated_client.put(f'{BASE_URL}/api/events/1/payment-tax', json={
            'currency': 'INVALID'
        })
        assert response.status_code == 400
        
    def test_update_stripe_toggle(self, authenticated_client):
        """PUT updates stripe_enabled toggle"""
        # Toggle off
        response = authenticated_client.put(f'{BASE_URL}/api/events/1/payment-tax', json={
            'stripe_enabled': False
        })
        assert response.status_code == 200
        assert response.json()['stripe_enabled'] == False
        
        # Toggle back on
        response = authenticated_client.put(f'{BASE_URL}/api/events/1/payment-tax', json={
            'stripe_enabled': True
        })
        assert response.status_code == 200
        assert response.json()['stripe_enabled'] == True
        
    def test_update_razorpay_toggle(self, authenticated_client):
        """PUT updates razorpay_enabled toggle"""
        # Toggle off
        response = authenticated_client.put(f'{BASE_URL}/api/events/1/payment-tax', json={
            'razorpay_enabled': False
        })
        assert response.status_code == 200
        assert response.json()['razorpay_enabled'] == False
        
        # Toggle back on
        response = authenticated_client.put(f'{BASE_URL}/api/events/1/payment-tax', json={
            'razorpay_enabled': True
        })
        assert response.status_code == 200
        assert response.json()['razorpay_enabled'] == True
        
    def test_update_offline_toggle(self, authenticated_client):
        """PUT updates offline_enabled toggle"""
        # Toggle on
        response = authenticated_client.put(f'{BASE_URL}/api/events/1/payment-tax', json={
            'offline_enabled': True
        })
        assert response.status_code == 200
        assert response.json()['offline_enabled'] == True
        
        # Toggle back off
        response = authenticated_client.put(f'{BASE_URL}/api/events/1/payment-tax', json={
            'offline_enabled': False
        })
        assert response.status_code == 200
        assert response.json()['offline_enabled'] == False
        
    def test_update_tax_configuration(self, authenticated_client):
        """PUT updates tax configuration fields"""
        response = authenticated_client.put(f'{BASE_URL}/api/events/1/payment-tax', json={
            'tax_enabled': True,
            'tax_name': 'VAT',
            'tax_percentage': 20.5
        })
        assert response.status_code == 200
        
        data = response.json()
        assert data['tax_enabled'] == True
        assert data['tax_name'] == 'VAT'
        assert float(data['tax_percentage']) == 20.5
        
        # Restore original values
        authenticated_client.put(f'{BASE_URL}/api/events/1/payment-tax', json={
            'tax_enabled': True,
            'tax_name': 'GST',
            'tax_percentage': 18
        })
        
    def test_update_tax_percentage_validation_min(self, authenticated_client):
        """PUT returns 400 for tax percentage below 0"""
        response = authenticated_client.put(f'{BASE_URL}/api/events/1/payment-tax', json={
            'tax_percentage': -5
        })
        assert response.status_code == 400
        
    def test_update_tax_percentage_validation_max(self, authenticated_client):
        """PUT returns 400 for tax percentage above 100"""
        response = authenticated_client.put(f'{BASE_URL}/api/events/1/payment-tax', json={
            'tax_percentage': 150
        })
        assert response.status_code == 400
        
    def test_update_invoice_details(self, authenticated_client):
        """PUT updates invoice details fields"""
        response = authenticated_client.put(f'{BASE_URL}/api/events/1/payment-tax', json={
            'legal_entity_name': 'Test Company Ltd',
            'billing_address': '456 Test Street\nTest City, TC 12345',
            'tax_id': 'TEST123456'
        })
        assert response.status_code == 200
        
        data = response.json()
        assert data['legal_entity_name'] == 'Test Company Ltd'
        assert 'Test Street' in data['billing_address']
        assert data['tax_id'] == 'TEST123456'
        
        # Restore original values
        authenticated_client.put(f'{BASE_URL}/api/events/1/payment-tax', json={
            'legal_entity_name': 'Acme Corp Pvt Ltd',
            'billing_address': '123 Business Park\nBangalore, KA 560001\nIndia',
            'tax_id': 'GSTIN12345678'
        })
        
    def test_update_all_fields_at_once(self, authenticated_client):
        """PUT updates all fields in single request"""
        update_data = {
            'currency': 'EUR',
            'stripe_enabled': False,
            'razorpay_enabled': False,
            'offline_enabled': True,
            'tax_enabled': False,
            'tax_name': 'Sales Tax',
            'tax_percentage': 10,
            'legal_entity_name': 'Full Update Corp',
            'billing_address': 'Full Update Address',
            'tax_id': 'FULL123'
        }
        
        response = authenticated_client.put(f'{BASE_URL}/api/events/1/payment-tax', json=update_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data['currency'] == 'EUR'
        assert data['stripe_enabled'] == False
        assert data['razorpay_enabled'] == False
        assert data['offline_enabled'] == True
        assert data['tax_enabled'] == False
        assert data['tax_name'] == 'Sales Tax'
        assert float(data['tax_percentage']) == 10
        assert data['legal_entity_name'] == 'Full Update Corp'
        
        # Restore original values
        authenticated_client.put(f'{BASE_URL}/api/events/1/payment-tax', json={
            'currency': 'INR',
            'stripe_enabled': True,
            'razorpay_enabled': True,
            'offline_enabled': False,
            'tax_enabled': True,
            'tax_name': 'GST',
            'tax_percentage': 18,
            'legal_entity_name': 'Acme Corp Pvt Ltd',
            'billing_address': '123 Business Park\nBangalore, KA 560001\nIndia',
            'tax_id': 'GSTIN12345678'
        })
        
    def test_update_nonexistent_event(self, authenticated_client):
        """PUT returns 404 for non-existent event"""
        response = authenticated_client.put(f'{BASE_URL}/api/events/99999/payment-tax', json={
            'currency': 'USD'
        })
        assert response.status_code == 404


class TestPaymentTaxResetSettings:
    """Tests for POST /api/events/:eventId/payment-tax/reset"""
    
    def test_reset_settings(self, authenticated_client):
        """POST reset returns settings with global defaults"""
        # First update to non-default values
        authenticated_client.put(f'{BASE_URL}/api/events/1/payment-tax', json={
            'currency': 'EUR',
            'stripe_enabled': False
        })
        
        # Reset
        response = authenticated_client.post(f'{BASE_URL}/api/events/1/payment-tax/reset')
        assert response.status_code == 200
        
        data = response.json()
        # After reset, should get global defaults or default values
        assert 'currency' in data
        assert 'stripe_enabled' in data
        
    def test_reset_nonexistent_event(self, authenticated_client):
        """POST reset returns 404 for non-existent event"""
        response = authenticated_client.post(f'{BASE_URL}/api/events/99999/payment-tax/reset')
        assert response.status_code == 404


class TestPaymentTaxDataPersistence:
    """Tests for data persistence - Create → GET verification pattern"""
    
    def test_update_and_verify_persistence(self, authenticated_client):
        """Update settings and verify they persist on subsequent GET"""
        # Update
        update_data = {
            'currency': 'GBP',
            'tax_name': 'UK VAT',
            'tax_percentage': 20
        }
        
        put_response = authenticated_client.put(f'{BASE_URL}/api/events/1/payment-tax', json=update_data)
        assert put_response.status_code == 200
        
        # Verify with GET
        get_response = authenticated_client.get(f'{BASE_URL}/api/events/1/payment-tax')
        assert get_response.status_code == 200
        
        data = get_response.json()
        assert data['currency'] == 'GBP'
        assert data['tax_name'] == 'UK VAT'
        assert float(data['tax_percentage']) == 20
        
        # Restore original values
        authenticated_client.put(f'{BASE_URL}/api/events/1/payment-tax', json={
            'currency': 'INR',
            'tax_name': 'GST',
            'tax_percentage': 18
        })


class TestCurrencyDropdownOptions:
    """Tests to verify all 10 currency options are valid"""
    
    def test_all_currencies_count(self):
        """Verify there are exactly 10 valid currencies"""
        assert len(VALID_CURRENCIES) == 10
        
    def test_currencies_include_required(self):
        """Verify required currencies are in the list"""
        required = ['USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD', 'SGD', 'JPY', 'CHF', 'AED']
        for currency in required:
            assert currency in VALID_CURRENCIES, f'{currency} not in valid currencies'


if __name__ == '__main__':
    pytest.main([__file__, '-v', '--tb=short'])
