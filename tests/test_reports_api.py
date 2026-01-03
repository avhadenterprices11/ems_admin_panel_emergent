"""
Test suite for Reports Tab APIs
Tests: GET reports, GET standard reports, GET data sources, POST create report, 
       POST run report, GET export CSV, DELETE report, POST run standard report
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://eventflow-152.preview.emergentagent.com')
EVENT_ID = 4  # Test event with registrations and attendees


class TestReportsAPI:
    """Reports Tab API Tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        self.created_report_id = None
    
    # ==================== GET Reports List ====================
    def test_get_reports_list(self):
        """GET /api/events/:eventId/reports - Get all reports for event"""
        response = self.session.get(f"{BASE_URL}/api/events/{EVENT_ID}/reports")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        
        # Verify existing report structure
        if len(data) > 0:
            report = data[0]
            assert "id" in report, "Report should have id"
            assert "name" in report, "Report should have name"
            assert "category" in report, "Report should have category"
            assert "visualization_type" in report, "Report should have visualization_type"
            assert "data_scope" in report, "Report should have data_scope"
            assert "visibility" in report, "Report should have visibility"
            assert "created_at" in report, "Report should have created_at"
            print(f"✓ Found {len(data)} reports")
    
    # ==================== GET Standard Reports ====================
    def test_get_standard_reports(self):
        """GET /api/events/:eventId/reports/standard - Get predefined standard reports"""
        response = self.session.get(f"{BASE_URL}/api/events/{EVENT_ID}/reports/standard")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) == 5, f"Expected 5 standard reports, got {len(data)}"
        
        # Verify standard report structure
        expected_ids = ['registration_funnel', 'ticket_sales_breakdown', 'revenue_over_time', 'attendance_checkin', 'geographic_distribution']
        actual_ids = [r['id'] for r in data]
        
        for expected_id in expected_ids:
            assert expected_id in actual_ids, f"Missing standard report: {expected_id}"
        
        # Verify structure
        for report in data:
            assert "id" in report, "Standard report should have id"
            assert "name" in report, "Standard report should have name"
            assert "description" in report, "Standard report should have description"
            assert "category" in report, "Standard report should have category"
            assert "visualization" in report, "Standard report should have visualization"
        
        print(f"✓ Found {len(data)} standard reports: {actual_ids}")
    
    # ==================== GET Data Sources ====================
    def test_get_data_sources(self):
        """GET /api/events/:eventId/reports/data-sources - Get available data sources for report builder"""
        response = self.session.get(f"{BASE_URL}/api/events/{EVENT_ID}/reports/data-sources")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) == 4, f"Expected 4 data sources, got {len(data)}"
        
        # Verify data source structure
        expected_sources = ['events', 'tickets', 'registrations', 'attendees']
        actual_sources = [s['id'] for s in data]
        
        for expected_source in expected_sources:
            assert expected_source in actual_sources, f"Missing data source: {expected_source}"
        
        # Verify each source has fields
        for source in data:
            assert "id" in source, "Data source should have id"
            assert "name" in source, "Data source should have name"
            assert "table" in source, "Data source should have table"
            assert "fields" in source, "Data source should have fields"
            assert isinstance(source['fields'], list), "Fields should be a list"
            assert len(source['fields']) > 0, f"Data source {source['id']} should have fields"
            
            # Verify field structure
            for field in source['fields']:
                assert "id" in field, "Field should have id"
                assert "name" in field, "Field should have name"
                assert "column" in field, "Field should have column"
                assert "type" in field, "Field should have type"
        
        print(f"✓ Found {len(data)} data sources with fields")
    
    # ==================== POST Create Report ====================
    def test_create_report(self):
        """POST /api/events/:eventId/reports - Create a new custom report"""
        report_data = {
            "name": "TEST_Custom_Report",
            "description": "Test report created by pytest",
            "category": "Registrations",
            "data_scope": "this_event",
            "visualization_type": "table",
            "visibility": "private",
            "selected_fields": ["reg_name", "reg_email", "reg_status"],
            "filters": [],
            "group_by": ""
        }
        
        response = self.session.post(f"{BASE_URL}/api/events/{EVENT_ID}/reports", json=report_data)
        
        assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "id" in data, "Created report should have id"
        assert data["name"] == report_data["name"], f"Name mismatch: {data['name']} != {report_data['name']}"
        assert data["category"] == report_data["category"], f"Category mismatch"
        assert data["visualization_type"] == report_data["visualization_type"], f"Visualization type mismatch"
        assert data["visibility"] == report_data["visibility"], f"Visibility mismatch"
        
        self.__class__.created_report_id = data["id"]
        print(f"✓ Created report with ID: {data['id']}")
    
    def test_create_report_validation(self):
        """POST /api/events/:eventId/reports - Validate required fields"""
        # Test missing name
        response = self.session.post(f"{BASE_URL}/api/events/{EVENT_ID}/reports", json={
            "description": "Test without name"
        })
        
        assert response.status_code == 400, f"Expected 400 for missing name, got {response.status_code}"
        print("✓ Validation works for missing name")
    
    # ==================== GET Report by ID ====================
    def test_get_report_by_id(self):
        """GET /api/events/:eventId/reports/:reportId - Get single report"""
        # Use existing report ID 1
        response = self.session.get(f"{BASE_URL}/api/events/{EVENT_ID}/reports/1")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["id"] == 1, "Report ID should be 1"
        assert "name" in data, "Report should have name"
        assert "config_json" in data, "Report should have config_json"
        
        print(f"✓ Got report: {data['name']}")
    
    def test_get_report_not_found(self):
        """GET /api/events/:eventId/reports/:reportId - Report not found"""
        response = self.session.get(f"{BASE_URL}/api/events/{EVENT_ID}/reports/99999")
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Returns 404 for non-existent report")
    
    # ==================== POST Run Report ====================
    def test_run_report(self):
        """POST /api/events/:eventId/reports/:reportId/run - Execute report and get data"""
        response = self.session.post(f"{BASE_URL}/api/events/{EVENT_ID}/reports/1/run")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "success" in data, "Response should have success field"
        assert data["success"] == True, "Report run should be successful"
        assert "data" in data, "Response should have data field"
        assert "total" in data, "Response should have total field"
        assert "execution_time_ms" in data, "Response should have execution_time_ms"
        assert "run_id" in data, "Response should have run_id"
        
        assert isinstance(data["data"], list), "Data should be a list"
        assert data["total"] >= 0, "Total should be non-negative"
        assert data["execution_time_ms"] >= 0, "Execution time should be non-negative"
        
        print(f"✓ Report executed: {data['total']} rows in {data['execution_time_ms']}ms")
    
    def test_run_report_with_data(self):
        """POST /api/events/:eventId/reports/:reportId/run - Verify data structure"""
        response = self.session.post(f"{BASE_URL}/api/events/{EVENT_ID}/reports/1/run")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify data has expected columns for Registrations category
        if len(data["data"]) > 0:
            row = data["data"][0]
            expected_columns = ["event_name", "registrant_name", "registrant_email", "status"]
            for col in expected_columns:
                assert col in row, f"Missing column: {col}"
        
        print(f"✓ Report data has correct structure with {len(data['data'])} rows")
    
    # ==================== POST Run Standard Report ====================
    def test_run_standard_report_registration_funnel(self):
        """POST /api/events/:eventId/reports/standard/registration_funnel/run"""
        response = self.session.post(f"{BASE_URL}/api/events/{EVENT_ID}/reports/standard/registration_funnel/run")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "success" in data, "Response should have success field"
        assert data["success"] == True, "Standard report run should be successful"
        assert "data" in data, "Response should have data field"
        
        print(f"✓ Registration funnel report: {len(data['data'])} status groups")
    
    def test_run_standard_report_ticket_sales(self):
        """POST /api/events/:eventId/reports/standard/ticket_sales_breakdown/run"""
        response = self.session.post(f"{BASE_URL}/api/events/{EVENT_ID}/reports/standard/ticket_sales_breakdown/run")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["success"] == True
        
        if len(data["data"]) > 0:
            row = data["data"][0]
            assert "ticket_type" in row, "Should have ticket_type"
            assert "quantity" in row, "Should have quantity"
            assert "revenue" in row, "Should have revenue"
        
        print(f"✓ Ticket sales report: {len(data['data'])} ticket types")
    
    def test_run_standard_report_revenue(self):
        """POST /api/events/:eventId/reports/standard/revenue_over_time/run"""
        response = self.session.post(f"{BASE_URL}/api/events/{EVENT_ID}/reports/standard/revenue_over_time/run")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["success"] == True
        
        print(f"✓ Revenue over time report: {len(data['data'])} data points")
    
    def test_run_standard_report_attendance(self):
        """POST /api/events/:eventId/reports/standard/attendance_checkin/run"""
        response = self.session.post(f"{BASE_URL}/api/events/{EVENT_ID}/reports/standard/attendance_checkin/run")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["success"] == True
        
        print(f"✓ Attendance check-in report: {len(data['data'])} status groups")
    
    def test_run_standard_report_geographic(self):
        """POST /api/events/:eventId/reports/standard/geographic_distribution/run"""
        response = self.session.post(f"{BASE_URL}/api/events/{EVENT_ID}/reports/standard/geographic_distribution/run")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["success"] == True
        
        print(f"✓ Geographic distribution report: {len(data['data'])} regions")
    
    def test_run_standard_report_not_found(self):
        """POST /api/events/:eventId/reports/standard/invalid_report/run - Invalid standard report"""
        response = self.session.post(f"{BASE_URL}/api/events/{EVENT_ID}/reports/standard/invalid_report/run")
        
        assert response.status_code == 500, f"Expected 500 for invalid standard report, got {response.status_code}"
        print("✓ Returns error for invalid standard report")
    
    # ==================== GET Export Report CSV ====================
    def test_export_report_csv(self):
        """GET /api/events/:eventId/reports/:reportId/export - Export report as CSV"""
        response = self.session.get(f"{BASE_URL}/api/events/{EVENT_ID}/reports/1/export")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Verify CSV content type
        content_type = response.headers.get('Content-Type', '')
        assert 'text/csv' in content_type, f"Expected text/csv, got {content_type}"
        
        # Verify CSV has content
        csv_content = response.text
        assert len(csv_content) > 0, "CSV should have content"
        
        # Verify CSV has headers
        lines = csv_content.strip().split('\n')
        assert len(lines) >= 1, "CSV should have at least header row"
        
        headers = lines[0].split(',')
        assert len(headers) > 0, "CSV should have headers"
        
        print(f"✓ Exported CSV with {len(lines)} rows and {len(headers)} columns")
    
    def test_export_report_not_found(self):
        """GET /api/events/:eventId/reports/:reportId/export - Report not found"""
        response = self.session.get(f"{BASE_URL}/api/events/{EVENT_ID}/reports/99999/export")
        
        assert response.status_code == 500, f"Expected 500 for non-existent report, got {response.status_code}"
        print("✓ Returns error for non-existent report export")
    
    # ==================== GET Report Runs History ====================
    def test_get_report_runs(self):
        """GET /api/events/:eventId/reports/:reportId/runs - Get report execution history"""
        response = self.session.get(f"{BASE_URL}/api/events/{EVENT_ID}/reports/1/runs")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        
        if len(data) > 0:
            run = data[0]
            assert "id" in run, "Run should have id"
            assert "report_id" in run, "Run should have report_id"
            assert "executed_at" in run, "Run should have executed_at"
            assert "status" in run, "Run should have status"
            assert "row_count" in run, "Run should have row_count"
        
        print(f"✓ Found {len(data)} report runs")
    
    # ==================== PUT Update Report ====================
    def test_update_report(self):
        """PUT /api/events/:eventId/reports/:reportId - Update report"""
        # First create a report to update
        create_response = self.session.post(f"{BASE_URL}/api/events/{EVENT_ID}/reports", json={
            "name": "TEST_Update_Report",
            "category": "Registrations",
            "visualization_type": "table"
        })
        
        assert create_response.status_code == 201
        report_id = create_response.json()["id"]
        
        # Update the report
        update_data = {
            "name": "TEST_Updated_Report_Name",
            "description": "Updated description",
            "visualization_type": "bar"
        }
        
        response = self.session.put(f"{BASE_URL}/api/events/{EVENT_ID}/reports/{report_id}", json=update_data)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["name"] == update_data["name"], "Name should be updated"
        assert data["description"] == update_data["description"], "Description should be updated"
        assert data["visualization_type"] == update_data["visualization_type"], "Visualization type should be updated"
        
        # Cleanup
        self.session.delete(f"{BASE_URL}/api/events/{EVENT_ID}/reports/{report_id}")
        
        print(f"✓ Updated report {report_id}")
    
    # ==================== DELETE Report ====================
    def test_delete_report(self):
        """DELETE /api/events/:eventId/reports/:reportId - Delete report"""
        # First create a report to delete
        create_response = self.session.post(f"{BASE_URL}/api/events/{EVENT_ID}/reports", json={
            "name": "TEST_Delete_Report",
            "category": "Registrations",
            "visualization_type": "table"
        })
        
        assert create_response.status_code == 201
        report_id = create_response.json()["id"]
        
        # Delete the report
        response = self.session.delete(f"{BASE_URL}/api/events/{EVENT_ID}/reports/{report_id}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Verify deletion
        get_response = self.session.get(f"{BASE_URL}/api/events/{EVENT_ID}/reports/{report_id}")
        assert get_response.status_code == 404, "Deleted report should return 404"
        
        print(f"✓ Deleted report {report_id}")
    
    def test_delete_report_not_found(self):
        """DELETE /api/events/:eventId/reports/:reportId - Report not found"""
        response = self.session.delete(f"{BASE_URL}/api/events/{EVENT_ID}/reports/99999")
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Returns 404 for non-existent report deletion")
    
    # ==================== Cleanup Test Reports ====================
    def test_cleanup_test_reports(self):
        """Cleanup any TEST_ prefixed reports"""
        response = self.session.get(f"{BASE_URL}/api/events/{EVENT_ID}/reports")
        
        if response.status_code == 200:
            reports = response.json()
            for report in reports:
                if report["name"].startswith("TEST_"):
                    self.session.delete(f"{BASE_URL}/api/events/{EVENT_ID}/reports/{report['id']}")
                    print(f"  Cleaned up: {report['name']}")
        
        print("✓ Cleanup completed")


class TestReportsAPIEdgeCases:
    """Edge case tests for Reports API"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
    
    def test_create_report_with_all_fields(self):
        """Create report with all optional fields"""
        report_data = {
            "name": "TEST_Full_Report",
            "description": "Full report with all fields",
            "category": "Ticket Sales",
            "data_scope": "this_event",
            "visualization_type": "pie",
            "visibility": "team",
            "selected_fields": ["tkt_name", "tkt_price", "tkt_sold"],
            "filters": [
                {"field": "tkt_price", "operator": "greater_than", "value": "0"}
            ],
            "group_by": "tkt_name"
        }
        
        response = self.session.post(f"{BASE_URL}/api/events/{EVENT_ID}/reports", json=report_data)
        
        assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["category"] == "Ticket Sales"
        assert data["visualization_type"] == "pie"
        assert data["visibility"] == "team"
        
        # Cleanup
        self.session.delete(f"{BASE_URL}/api/events/{EVENT_ID}/reports/{data['id']}")
        
        print("✓ Created report with all fields")
    
    def test_run_report_with_options(self):
        """Run report with date filters and pagination"""
        response = self.session.post(
            f"{BASE_URL}/api/events/{EVENT_ID}/reports/1/run",
            params={
                "limit": 10,
                "offset": 0
            }
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["success"] == True
        
        print(f"✓ Report with options: {data['total']} total rows")
    
    def test_different_visualization_types(self):
        """Test creating reports with different visualization types"""
        viz_types = ["table", "bar", "line", "pie"]
        
        for viz_type in viz_types:
            response = self.session.post(f"{BASE_URL}/api/events/{EVENT_ID}/reports", json={
                "name": f"TEST_Viz_{viz_type}",
                "category": "Registrations",
                "visualization_type": viz_type
            })
            
            assert response.status_code == 201, f"Failed to create {viz_type} report: {response.text}"
            
            report_id = response.json()["id"]
            self.session.delete(f"{BASE_URL}/api/events/{EVENT_ID}/reports/{report_id}")
        
        print(f"✓ All visualization types work: {viz_types}")
    
    def test_different_categories(self):
        """Test creating reports with different categories"""
        categories = ["Registrations", "Ticket Sales", "Revenue & Finance", "Attendance"]
        
        for category in categories:
            response = self.session.post(f"{BASE_URL}/api/events/{EVENT_ID}/reports", json={
                "name": f"TEST_Cat_{category.replace(' ', '_')}",
                "category": category,
                "visualization_type": "table"
            })
            
            assert response.status_code == 201, f"Failed to create {category} report: {response.text}"
            
            report_id = response.json()["id"]
            
            # Run the report to verify category-specific query works
            run_response = self.session.post(f"{BASE_URL}/api/events/{EVENT_ID}/reports/{report_id}/run")
            assert run_response.status_code == 200, f"Failed to run {category} report: {run_response.text}"
            
            self.session.delete(f"{BASE_URL}/api/events/{EVENT_ID}/reports/{report_id}")
        
        print(f"✓ All categories work: {categories}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
