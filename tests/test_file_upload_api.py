"""
Backend API Tests for Event Management File Upload System
Tests: File upload endpoints, event creation with files, events list
"""
import pytest
import requests
import os
import base64
import tempfile

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://eventpro-19.preview.emergentagent.com').rstrip('/')


class TestHealthCheck:
    """Health check endpoint tests"""
    
    def test_api_health(self):
        """Test API health endpoint"""
        response = requests.get(f"{BASE_URL}/api")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "ok"
        print("✓ API health check passed")


class TestSingleFileUpload:
    """Single file upload endpoint tests"""
    
    @pytest.fixture
    def test_image_file(self):
        """Create a test PNG image file"""
        # Minimal valid PNG (1x1 pixel)
        png_data = base64.b64decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        )
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as f:
            f.write(png_data)
            f.flush()
            yield f.name
        os.unlink(f.name)
    
    def test_single_file_upload_success(self, test_image_file):
        """Test single file upload returns URL"""
        with open(test_image_file, 'rb') as f:
            response = requests.post(
                f"{BASE_URL}/api/upload/single",
                files={'file': ('test.png', f, 'image/png')},
                data={'folder': 'events/banners'}
            )
        
        assert response.status_code == 200
        data = response.json()
        assert 'url' in data
        assert data['url'].startswith(BASE_URL)
        assert '/api/uploads/' in data['url']
        print(f"✓ Single file upload returned URL: {data['url']}")
        
        # Verify file is accessible
        file_response = requests.get(data['url'])
        assert file_response.status_code == 200
        print("✓ Uploaded file is accessible")
    
    def test_single_file_upload_no_file(self):
        """Test single file upload without file returns 400"""
        response = requests.post(
            f"{BASE_URL}/api/upload/single",
            data={'folder': 'events/banners'}
        )
        assert response.status_code == 400
        data = response.json()
        assert 'message' in data
        print("✓ Single file upload without file returns 400")


class TestMultipleFileUpload:
    """Multiple file upload endpoint tests"""
    
    @pytest.fixture
    def test_image_files(self):
        """Create multiple test PNG image files"""
        png_data = base64.b64decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        )
        files = []
        for i in range(3):
            f = tempfile.NamedTemporaryFile(suffix='.png', delete=False)
            f.write(png_data)
            f.flush()
            files.append(f.name)
        yield files
        for f in files:
            os.unlink(f)
    
    def test_multiple_file_upload_success(self, test_image_files):
        """Test multiple file upload returns array of URLs"""
        files_to_upload = []
        for i, filepath in enumerate(test_image_files):
            files_to_upload.append(
                ('files', (f'test{i}.png', open(filepath, 'rb'), 'image/png'))
            )
        
        response = requests.post(
            f"{BASE_URL}/api/upload/multiple",
            files=files_to_upload,
            data={'folder': 'events/gallery'}
        )
        
        # Close file handles
        for _, (_, f, _) in files_to_upload:
            f.close()
        
        assert response.status_code == 200
        data = response.json()
        assert 'urls' in data
        assert isinstance(data['urls'], list)
        assert len(data['urls']) == 3
        
        for url in data['urls']:
            assert url.startswith(BASE_URL)
            assert '/api/uploads/' in url
        
        print(f"✓ Multiple file upload returned {len(data['urls'])} URLs")
        
        # Verify files are accessible
        for url in data['urls']:
            file_response = requests.get(url)
            assert file_response.status_code == 200
        print("✓ All uploaded files are accessible")
    
    def test_multiple_file_upload_no_files(self):
        """Test multiple file upload without files returns 400"""
        response = requests.post(
            f"{BASE_URL}/api/upload/multiple",
            data={'folder': 'events/gallery'}
        )
        assert response.status_code == 400
        data = response.json()
        assert 'message' in data
        print("✓ Multiple file upload without files returns 400")


class TestEventsAPI:
    """Events API tests"""
    
    def test_get_events_list(self):
        """Test events list endpoint"""
        response = requests.get(f"{BASE_URL}/api/events")
        assert response.status_code == 200
        data = response.json()
        assert 'data' in data
        assert 'pagination' in data
        assert isinstance(data['data'], list)
        print(f"✓ Events list returned {len(data['data'])} events")
    
    def test_create_event_with_file_urls(self):
        """Test creating event with file URLs"""
        # First upload a file
        png_data = base64.b64decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        )
        
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as f:
            f.write(png_data)
            f.flush()
            temp_file = f.name
        
        try:
            # Upload banner image
            with open(temp_file, 'rb') as f:
                upload_response = requests.post(
                    f"{BASE_URL}/api/upload/single",
                    files={'file': ('banner.png', f, 'image/png')},
                    data={'folder': 'events/banners'}
                )
            assert upload_response.status_code == 200
            banner_url = upload_response.json()['url']
            
            # Upload gallery images
            with open(temp_file, 'rb') as f1, open(temp_file, 'rb') as f2:
                gallery_response = requests.post(
                    f"{BASE_URL}/api/upload/multiple",
                    files=[
                        ('files', ('gallery1.png', f1, 'image/png')),
                        ('files', ('gallery2.png', f2, 'image/png'))
                    ],
                    data={'folder': 'events/gallery'}
                )
            assert gallery_response.status_code == 200
            gallery_urls = gallery_response.json()['urls']
            
            # Create event with file URLs
            import time
            event_code = f"EVT-TEST-{int(time.time())}"
            event_data = {
                "event_code": event_code,
                "name": "Test Event with Uploaded Files",
                "description": "Testing file upload integration",
                "category": "conference",
                "type": "Conference",
                "event_type": "public",
                "start_date": "2025-03-01T10:00:00.000Z",
                "end_date": "2025-03-01T18:00:00.000Z",
                "timezone": "America/New_York",
                "mode": "in-person",
                "venue_name": "Test Venue",
                "location": "123 Test St",
                "city": "New York",
                "state": "NY",
                "country": "USA",
                "banner_image_url": banner_url,
                "gallery_images": gallery_urls,
                "partners": [
                    {"name": "Test Partner", "logo": banner_url, "link": "https://partner.com"}
                ],
                "sponsors": [
                    {"name": "Test Sponsor", "logo": banner_url, "link": "https://sponsor.com"}
                ],
                "status": "Draft",
                "visibility": "public",
                "owner": "Admin"
            }
            
            create_response = requests.post(
                f"{BASE_URL}/api/events",
                json=event_data
            )
            
            assert create_response.status_code == 201
            created_event = create_response.json()
            
            # Verify file URLs are saved
            assert created_event['banner_image_url'] == banner_url
            assert created_event['gallery_images'] == gallery_urls
            assert len(created_event['partners']) == 1
            assert created_event['partners'][0]['logo'] == banner_url
            assert len(created_event['sponsors']) == 1
            assert created_event['sponsors'][0]['logo'] == banner_url
            
            print(f"✓ Event created with ID: {created_event['id']}")
            print(f"✓ Banner URL saved: {created_event['banner_image_url']}")
            print(f"✓ Gallery images saved: {len(created_event['gallery_images'])} images")
            print(f"✓ Partners saved: {len(created_event['partners'])} partners")
            print(f"✓ Sponsors saved: {len(created_event['sponsors'])} sponsors")
            
            # Verify event can be fetched
            get_response = requests.get(f"{BASE_URL}/api/events")
            assert get_response.status_code == 200
            events = get_response.json()['data']
            
            # Find our created event
            found_event = next((e for e in events if e['event_code'] == event_code), None)
            assert found_event is not None
            assert found_event['banner_image_url'] == banner_url
            print("✓ Event persisted and retrievable with file URLs")
            
        finally:
            os.unlink(temp_file)
    
    def test_get_events_metrics(self):
        """Test events metrics endpoint"""
        response = requests.get(f"{BASE_URL}/api/events/metrics")
        assert response.status_code == 200
        data = response.json()
        print(f"✓ Events metrics returned: {data}")


class TestSavedViews:
    """Saved views API tests"""
    
    def test_get_saved_views(self):
        """Test saved views endpoint"""
        response = requests.get(f"{BASE_URL}/api/saved-views", params={'module': 'events'})
        assert response.status_code == 200
        data = response.json()
        # API returns either a list or an object with data array
        if isinstance(data, dict):
            assert 'data' in data
            views = data['data']
        else:
            views = data
        assert isinstance(views, list)
        print(f"✓ Saved views returned {len(views)} views")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
