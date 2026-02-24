import requests
import uuid

BASE_URL = "http://localhost:3001"
TIMEOUT = 30

def test_tc010_rakeback_status_and_opt_operations():
    # Register a unique test user to get auth token
    register_url = f"{BASE_URL}/api/auth/register"
    unique_str = str(uuid.uuid4()).replace("-", "")[:12]
    username = f"testuser_{unique_str}"[:20]  # Trim username to max 20 chars
    email = f"{unique_str}@example.com"
    password = "TestPass1234"

    register_payload = {
        "username": username,
        "email": email,
        "password": password
    }

    try:
        reg_resp = requests.post(register_url, json=register_payload, timeout=TIMEOUT)
        assert reg_resp.status_code == 200, f"Registration failed: {reg_resp.text}"
        reg_json = reg_resp.json()
        token = reg_json.get("token")
        assert token, "Token missing in registration response"

        headers = {"Authorization": f"Bearer {token}"}

        # 1. Test GET /api/rakeback/status returns object with optedIn (bool) and unclaimed fields
        status_url = f"{BASE_URL}/api/rakeback/status"
        status_resp = requests.get(status_url, headers=headers, timeout=TIMEOUT)
        assert status_resp.status_code == 200, f"Status GET failed: {status_resp.text}"
        status_json = status_resp.json()
        assert isinstance(status_json, dict), "Status response is not a dict"
        assert "optedIn" in status_json, "'optedIn' field missing in status response"
        assert isinstance(status_json["optedIn"], bool), "'optedIn' is not a boolean"
        assert "unclaimed" in status_json, "'unclaimed' field missing in status response"
        # unclaimed can be an object/dict, but check type
        assert isinstance(status_json["unclaimed"], dict), "'unclaimed' is not an object"

        # 2. Test POST /api/rakeback/opt with {optIn: true} opts the user in
        opt_url = f"{BASE_URL}/api/rakeback/opt"
        opt_in_payload = {"optIn": True}
        opt_in_resp = requests.post(opt_url, headers=headers, json=opt_in_payload, timeout=TIMEOUT)
        assert opt_in_resp.status_code == 200, f"Opt-in POST failed: {opt_in_resp.text}"
        opt_in_json = opt_in_resp.json()
        assert isinstance(opt_in_json, dict), "Opt-in response is not a dict"

        # Verify GET /api/rakeback/status shows optedIn true
        status_resp_after_optin = requests.get(status_url, headers=headers, timeout=TIMEOUT)
        assert status_resp_after_optin.status_code == 200, f"Status GET after opt-in failed: {status_resp_after_optin.text}"
        status_after_optin_json = status_resp_after_optin.json()
        assert status_after_optin_json.get("optedIn") is True, "User was not opted in after opt-in request"

        # 3. Test POST /api/rakeback/opt with {optIn: false} opts the user out
        opt_out_payload = {"optIn": False}
        opt_out_resp = requests.post(opt_url, headers=headers, json=opt_out_payload, timeout=TIMEOUT)
        assert opt_out_resp.status_code == 200, f"Opt-out POST failed: {opt_out_resp.text}"
        opt_out_json = opt_out_resp.json()
        assert isinstance(opt_out_json, dict), "Opt-out response is not a dict"

        # Verify GET /api/rakeback/status shows optedIn false
        status_resp_after_optout = requests.get(status_url, headers=headers, timeout=TIMEOUT)
        assert status_resp_after_optout.status_code == 200, f"Status GET after opt-out failed: {status_resp_after_optout.text}"
        status_after_optout_json = status_resp_after_optout.json()
        assert status_after_optout_json.get("optedIn") is False, "User was not opted out after opt-out request"

        # 4. Test GET /api/rakeback/history returns array
        history_url = f"{BASE_URL}/api/rakeback/history"
        history_resp = requests.get(history_url, headers=headers, timeout=TIMEOUT)
        assert history_resp.status_code == 200, f"History GET failed: {history_resp.text}"
        history_json = history_resp.json()
        assert isinstance(history_json, list), "Rakeback history response is not an array/list"
    finally:
        # Cleanup test user if API supports deletion (not specified, skip cleanup)
        pass

test_tc010_rakeback_status_and_opt_operations()
