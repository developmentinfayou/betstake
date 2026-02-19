import requests
import uuid

BASE_URL = "http://localhost:3001"
TIMEOUT = 30

AUTH_CREDENTIALS = {
    "email": "samarpit@gmail.com",
    "password": "87654321"
}

def test_post_apibetplace_instant_bet_and_validation():
    # Step 1: Authenticate and get JWT token
    login_resp = requests.post(
        f"{BASE_URL}/api/auth/login",
        json=AUTH_CREDENTIALS,
        timeout=TIMEOUT
    )
    assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
    token = login_resp.json().get("token")
    assert token, "No token received from login"

    headers = {"Authorization": f"Bearer {token}"}

    # Step 2: Get wallet balances to determine currency and balance info
    wallet_resp = requests.get(f"{BASE_URL}/api/wallet", headers=headers, timeout=TIMEOUT)
    assert wallet_resp.status_code == 200, f"Wallet retrieval failed: {wallet_resp.text}"
    wallets = wallet_resp.json()
    assert isinstance(wallets, list), "Wallet response is not a list"
    assert len(wallets) > 0, "No wallets found for user"
    # Pick first wallet with sufficient balance or default USD if demo mode is used
    wallet = wallets[0]
    currency = wallet.get("currency") or "USD"
    balance = float(wallet.get("balance", 1000))  # fallback to 1000 if no balance field

    # Since demo mode, real balance does not matter, but test both low and sufficient balance conditions

    # --- Test placing instant bet with valid parameters and sufficient balance ---

    bet_body_valid = {
        "gameType": "dice",
        "currency": currency,
        "amount": 10,
        "gameParams": {"target": 50, "rollUnder": True},
        "isDemo": True
    }

    place_bet_resp = requests.post(
        f"{BASE_URL}/api/bet/place",
        headers={**headers, "Content-Type": "application/json"},
        json=bet_body_valid,
        timeout=TIMEOUT
    )
    assert place_bet_resp.status_code == 200, f"Valid bet place failed: {place_bet_resp.text}"
    place_bet_json = place_bet_resp.json()
    assert "bet" in place_bet_json, "Response missing 'bet'"
    assert "result" in place_bet_json, "Response missing 'result'"
    assert "wallet" in place_bet_json, "Response missing 'wallet'"

    bet_info = place_bet_json["bet"]
    wallet_info = place_bet_json["wallet"]

    # Validate bet info
    assert bet_info.get("amount") == bet_body_valid["amount"], "Bet amount mismatch"
    assert bet_info.get("gameType") == bet_body_valid["gameType"], "Game type mismatch"
    assert wallet_info.get("currency") == currency, "Wallet currency mismatch"
    # wallet balance may change or be mocked, just assert it's a number
    assert isinstance(wallet_info.get("balance"), (int, float)), "Wallet balance missing or invalid type"

    # --- Test placing bet with amount exceeding balance returns 400 error ---
    # Use large amount > balance. Since here real balance might be irrelevant because of isDemo=True,
    # test with isDemo=False to enforce balance check scenario.

    # First confirm actual balance for non-demo mode
    # If balance is very low, prepare to add credit if possible (optional)

    # We will try with isDemo=False and amount exceeding typical balance (like a huge number)
    bet_body_exceed = {
        "gameType": "dice",
        "currency": currency,
        "amount": balance + 1000000,  # intentionally exceed balance
        "gameParams": {"target": 50, "rollUnder": True},
        "isDemo": False
    }

    exceed_resp = requests.post(
        f"{BASE_URL}/api/bet/place",
        headers={**headers, "Content-Type": "application/json"},
        json=bet_body_exceed,
        timeout=TIMEOUT
    )
    assert exceed_resp.status_code == 400, f"Exceeding balance bet did not fail as expected: {exceed_resp.text}"
    json_resp = exceed_resp.json()
    assert ("error" in json_resp) or ("message" in json_resp), "Expected error message on exceeding balance"

test_post_apibetplace_instant_bet_and_validation()