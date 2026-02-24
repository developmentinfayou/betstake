import requests
import uuid

BASE_URL = "http://localhost:3001"
TIMEOUT = 30

def test_get_apibetautobetstatus_retrieve_current_autobet_session_status():
    # Register a new user to ensure login credentials are valid
    register_url = f"{BASE_URL}/api/auth/register"
    unique_id = str(uuid.uuid4())
    new_username = f"testuser_{unique_id[:8]}"
    new_email = f"{new_username}@example.com"
    password = "TestPass123"

    register_payload = {
        "username": new_username,
        "email": new_email,
        "password": password
    }

    try:
        r_register = requests.post(register_url, json=register_payload, timeout=TIMEOUT)
        assert r_register.status_code == 200, f"User registration failed: {r_register.text}"
    except requests.RequestException as e:
        assert False, f"Request failed during user registration: {e}"

    # Login with newly registered user
    login_url = f"{BASE_URL}/api/auth/login"
    login_payload = {
        "email": new_email,
        "password": password
    }

    try:
        r = requests.post(login_url, json=login_payload, timeout=TIMEOUT)
        assert r.status_code == 200, f"User login failed: {r.text}"
        login_data = r.json()
        assert "token" in login_data and "user" in login_data, "Token or user missing in login response"
        token = login_data["token"]
    except requests.RequestException as e:
        assert False, f"Request failed during user login: {e}"

    headers = {"Authorization": f"Bearer {token}"}
    autobet_start_url = f"{BASE_URL}/api/bet/autobet/start"
    autobet_status_url = f"{BASE_URL}/api/bet/autobet/status"
    autobet_stop_url = f"{BASE_URL}/api/bet/autobet/stop"

    # Start an autobet session first (required to have an active autobet status)
    # Use demo mode to avoid real balance issues
    autobet_start_payload = {
        "gameType": "dice",
        "currency": "USD",
        "amount": 1,
        "gameParams": {},
        "config": {
            "enabled": True,
            "numberOfBets": 5,
            "onWin": {"reset": True, "increaseBy": 0},
            "onLoss": {"reset": True, "increaseBy": 0}
        }
    }

    try:
        # Start autobet session
        r_start = requests.post(autobet_start_url, json=autobet_start_payload, headers=headers, timeout=TIMEOUT)
        assert r_start.status_code == 200, f"Failed to start autobet session: {r_start.text}"
        start_data = r_start.json()
        assert start_data.get("success") is True, "Autobet start success flag missing or false"
        assert "message" in start_data and "Auto-bet started" in start_data["message"], "Unexpected autobet start message"

        # Retrieve autobet status
        r_status = requests.get(autobet_status_url, headers=headers, timeout=TIMEOUT)
        assert r_status.status_code == 200, f"Failed to get autobet status: {r_status.text}"
        status_data = r_status.json()
        # Validate that response contains expected autobet status fields (some typical fields expected)
        assert isinstance(status_data, dict), "Autobet status response is not a JSON object"
        # Check for some meaningful keys common in autobet status object
        expected_keys = {"active", "gameType", "currency", "amount", "betsPlaced", "config", "startedAt"}
        missing_keys = expected_keys - status_data.keys()
        assert not missing_keys, f"Autobet status missing keys: {missing_keys}"

    except requests.RequestException as e:
        assert False, f"Request failed during autobet status retrieval: {e}"

    finally:
        # Stop autobet session to clean up
        try:
            r_stop = requests.post(autobet_stop_url, headers=headers, timeout=TIMEOUT)
            assert r_stop.status_code == 200, f"Failed to stop autobet session: {r_stop.text}"
            stop_data = r_stop.json()
            assert stop_data.get("success") is True, "Autobet stop success flag missing or false"
        except Exception:
            # Do not raise to avoid masking test result, but could be logged
            pass

test_get_apibetautobetstatus_retrieve_current_autobet_session_status()