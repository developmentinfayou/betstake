import requests
import uuid

BASE_URL = "http://localhost:3001"
TIMEOUT = 30


def test_tc007_wallet_operations_and_balance_management():
    # Register a unique test user
    register_url = f"{BASE_URL}/api/auth/register"
    unique_suffix = str(uuid.uuid4())[:8]
    username = f"testuser_{unique_suffix}"
    email = f"testuser_{unique_suffix}@example.com"
    password = "StrongPassw0rd!"
    register_payload = {
        "username": username,
        "email": email,
        "password": password
    }
    register_resp = requests.post(register_url, json=register_payload, timeout=TIMEOUT)
    assert register_resp.status_code == 200, f"Registration failed: {register_resp.text}"
    token = register_resp.json().get("token")
    assert token, "No token received on registration"

    headers = {"Authorization": f"Bearer {token}"}

    # 1) GET /api/wallet returns array of wallets
    get_wallet_url = f"{BASE_URL}/api/wallet"
    get_wallet_resp = requests.get(get_wallet_url, headers=headers, timeout=TIMEOUT)
    assert get_wallet_resp.status_code == 200, f"GET /api/wallet failed: {get_wallet_resp.text}"
    wallets = get_wallet_resp.json()
    assert isinstance(wallets, list), "GET /api/wallet did not return a list"

    # 2) POST /api/wallet/add with currency USD and amount 100 returns updated wallet with increased balance
    add_wallet_url = f"{BASE_URL}/api/wallet/add"
    add_payload = {"currency": "USD", "amount": 100}
    add_resp = requests.post(add_wallet_url, headers=headers, json=add_payload, timeout=TIMEOUT)
    assert add_resp.status_code == 200, f"POST /api/wallet/add failed: {add_resp.text}"
    updated_wallet = add_resp.json()
    assert isinstance(updated_wallet, dict), "POST /api/wallet/add did not return wallet object"
    assert "currency" in updated_wallet and updated_wallet["currency"] == "USD"
    assert "balance" in updated_wallet, "Updated wallet missing 'balance' field"
    added_balance = updated_wallet["balance"]

    # 3) GET /api/wallet/USD returns specific wallet object
    get_usd_wallet_url = f"{BASE_URL}/api/wallet/USD"
    get_usd_resp = requests.get(get_usd_wallet_url, headers=headers, timeout=TIMEOUT)
    assert get_usd_resp.status_code == 200, f"GET /api/wallet/USD failed: {get_usd_resp.text}"
    usd_wallet = get_usd_resp.json()
    assert isinstance(usd_wallet, dict), "GET /api/wallet/USD did not return wallet object"
    assert usd_wallet.get("currency") == "USD", "GET /api/wallet/USD returned wallet with wrong currency"
    assert usd_wallet.get("balance") == added_balance, "GET /api/wallet/USD balance mismatch with added wallet"

    # 4) POST /api/wallet/add with amount 0 returns 400 error
    zero_amount_payload = {"currency": "USD", "amount": 0}
    zero_resp = requests.post(add_wallet_url, headers=headers, json=zero_amount_payload, timeout=TIMEOUT)
    assert zero_resp.status_code == 400, f"POST /api/wallet/add with amount 0 did not return 400: {zero_resp.text}"

    # 5) POST /api/wallet/add with negative amount returns 400 error
    negative_amount_payload = {"currency": "USD", "amount": -50}
    negative_resp = requests.post(add_wallet_url, headers=headers, json=negative_amount_payload, timeout=TIMEOUT)
    assert negative_resp.status_code == 400, f"POST /api/wallet/add with negative amount did not return 400: {negative_resp.text}"


test_tc007_wallet_operations_and_balance_management()