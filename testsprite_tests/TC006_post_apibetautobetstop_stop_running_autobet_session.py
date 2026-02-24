import requests
import time

BASE_URL = "http://localhost:3001"
AUTH_CREDENTIALS = {
    "email": "samarpit@gmail.com",
    "password": "87654321"
}
TIMEOUT = 30

def test_post_apibetautobetstop_stop_running_autobet_session():
    session = requests.Session()

    # Login to get the JWT token
    login_resp = session.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": AUTH_CREDENTIALS["email"], "password": AUTH_CREDENTIALS["password"]},
        timeout=TIMEOUT
    )
    assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
    login_data = login_resp.json()
    token = login_data.get("token")
    assert token, "JWT token missing in login response"

    headers = {"Authorization": f"Bearer {token}"}

    # First, start an autobet session to ensure it is running before stopping it
    autobet_start_payload = {
        "gameType": "dice",
        "currency": "USD",
        "amount": 1,
        "gameParams": {},
        "config": {
            "enabled": True,
            "numberOfBets": 5,
            "onWin": {"reset": True},
            "onLoss": {"reset": True},
            "stopOnProfit": 10,
            "stopOnLoss": 10
        }
    }
    start_resp = session.post(
        f"{BASE_URL}/api/bet/autobet/start",
        json=autobet_start_payload,
        headers=headers,
        timeout=TIMEOUT
    )
    assert start_resp.status_code == 200, f"Autobet start failed: {start_resp.text}"
    start_data = start_resp.json()
    assert start_data.get("success") is True and "Auto-bet started" in start_data.get("message", ""), f"Unexpected start response: {start_data}"

    # Small wait to ensure autobet session backend processing kicks in
    time.sleep(1)

    # Now stop the running autobet session
    stop_resp = session.post(
        f"{BASE_URL}/api/bet/autobet/stop",
        headers=headers,
        timeout=TIMEOUT
    )
    assert stop_resp.status_code == 200, f"Autobet stop failed: {stop_resp.text}"
    stop_data = stop_resp.json()
    assert stop_data.get("success") is True, f"Unexpected stop response: {stop_data}"

    # Ensure no autobet sessions are running by checking status endpoint (optional edge check)
    status_resp = session.get(
        f"{BASE_URL}/api/bet/autobet/status",
        headers=headers,
        timeout=TIMEOUT
    )
    assert status_resp.status_code == 200, f"Autobet status fetch failed: {status_resp.text}"
    status_data = status_resp.json()
    # Depending on API, after stop success, autobet session may be stopped or null/empty
    # We do not know exact structure, but typically 'running' or 'active' would be false/empty
    # We'll check for typical keys and that no active session is flagged
    if isinstance(status_data, dict):
        # Common keys for autobet status could be e.g. 'running', 'active', or similar
        # We try to assert that no session is active
        running_flags = []
        for key in ['running', 'active', 'isActive', 'enabled']:
            if key in status_data:
                running_flags.append(status_data[key])
        assert not any(running_flags), f"Autobet session still active after stop: {status_data}"

test_post_apibetautobetstop_stop_running_autobet_session()