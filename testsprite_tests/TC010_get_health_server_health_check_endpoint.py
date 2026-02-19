import requests

BASE_URL = "http://localhost:3001"
TIMEOUT = 30

def test_health_check_endpoint():
    # Test GET /health returns 200 with expected JSON keys
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=TIMEOUT)
        assert response.status_code == 200, f"Expected status 200, got {response.status_code}"
        json_data = response.json()
        assert isinstance(json_data, dict), "Response is not a JSON object"
        assert "status" in json_data, "'status' key missing in response"
        assert json_data["status"] == "ok", f"Expected status 'ok', got {json_data['status']}"
        assert "timestamp" in json_data, "'timestamp' key missing in response"
        assert isinstance(json_data["timestamp"], str), "'timestamp' is not a string"
    except requests.RequestException as e:
        assert False, f"GET /health request failed: {e}"

    # Test POST /health returns 404 Not Found
    try:
        post_response = requests.post(f"{BASE_URL}/health", timeout=TIMEOUT)
        assert post_response.status_code == 404, f"Expected status 404 for POST /health, got {post_response.status_code}"
    except requests.RequestException as e:
        assert False, f"POST /health request failed: {e}"

test_health_check_endpoint()