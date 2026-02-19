import requests

BASE_URL = "http://localhost:3001"
AUTH_CREDENTIALS = {"email": "samarpit@gmail.com", "password": "87654321"}
TIMEOUT = 30


def test_post_apibetautobetstart_start_autobet_session_with_config_validation():
    # Step 1: Login to get JWT token
    login_resp = requests.post(
        f"{BASE_URL}/api/auth/login",
        json=AUTH_CREDENTIALS,
        timeout=TIMEOUT
    )
    assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
    login_json = login_resp.json()
    token = login_json.get("token")
    assert token, "JWT token missing in login response"
    headers = {"Authorization": f"Bearer {token}"}

    # Prepare valid autobet start payload
    valid_payload = {
        "gameType": "dice",
        "currency": "USD",
        "amount": 1,
        "gameParams": {},
        "config": {
            "enabled": True,
            "numberOfBets": 10,
            # Optional strategyId left out intentionally (no strategy)
            "onWin": {"reset": True, "increaseBy": 0},
            "onLoss": {"reset": False, "increaseBy": 1},
            "stopOnProfit": 5,
            "stopOnLoss": 3,
        },
        "isDemo": True  # demo mode to avoid real balance dependency
    }

    # Step 2: Start autobet with valid config - expect success
    start_resp = requests.post(
        f"{BASE_URL}/api/bet/autobet/start",
        headers=headers,
        json=valid_payload,
        timeout=TIMEOUT
    )
    assert start_resp.status_code == 200, f"Valid autobet start failed: {start_resp.text}"
    start_json = start_resp.json()
    assert start_json.get("success") is True, f"Expected success true, got: {start_json}"
    assert start_json.get("message") == "Auto-bet started", f"Unexpected message: {start_json.get('message')}"

    # Step 3: Start autobet with invalid config - negative numberOfBets - expect 400 error
    invalid_payload = dict(valid_payload)
    invalid_payload["config"] = dict(invalid_payload["config"])
    invalid_payload["config"]["numberOfBets"] = -5

    invalid_resp = requests.post(
        f"{BASE_URL}/api/bet/autobet/start",
        headers=headers,
        json=invalid_payload,
        timeout=TIMEOUT
    )
    assert invalid_resp.status_code == 400, f"Expected 400 for invalid config, got {invalid_resp.status_code}"
    error_json = invalid_resp.json()
    assert (
        "numberOfBets" in str(error_json).lower()
        or "validation" in str(error_json).lower()
        or "error" in str(error_json).lower()
    ), f"Expected validation error message for numberOfBets, got: {error_json}"


test_post_apibetautobetstart_start_autobet_session_with_config_validation()