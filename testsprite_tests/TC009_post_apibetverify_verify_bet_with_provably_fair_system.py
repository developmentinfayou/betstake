import requests
import uuid

BASE_URL = "http://localhost:3001"
AUTH_CREDENTIALS = {
    "email": "samarpit@gmail.com",
    "password": "87654321"
}
TIMEOUT = 30


def test_post_apibetverify_verify_bet_with_provably_fair_system():
    session = requests.Session()
    token = None
    bet_id = None

    def login():
        nonlocal token
        url = f"{BASE_URL}/api/auth/login"
        payload = {"email": AUTH_CREDENTIALS["email"], "password": AUTH_CREDENTIALS["password"]}
        resp = session.post(url, json=payload, timeout=TIMEOUT)
        assert resp.status_code == 200, f"Login failed: {resp.text}"
        data = resp.json()
        assert "token" in data and "user" in data, "Login response missing token or user"
        token = data["token"]

    def place_demo_bet():
        nonlocal bet_id
        url = f"{BASE_URL}/api/bet/place"
        headers = {"Authorization": f"Bearer {token}"}
        # Use a simple demo bet for dice game with minimal amount to ensure bet placement success
        payload = {
            "gameType": "dice",
            "currency": "USD",
            "amount": 1,
            "gameParams": {"number": 4},
            "isDemo": True
        }
        resp = session.post(url, headers=headers, json=payload, timeout=TIMEOUT)
        assert resp.status_code == 200, f"Bet placement failed: {resp.text}"
        data = resp.json()
        assert "bet" in data and "result" in data and "wallet" in data, "Bet placement response missing expected keys"
        bet = data["bet"]
        assert "id" in bet, "Bet object missing id"
        bet_id = bet["id"]

    def verify_bet(bet_id_to_verify):
        url = f"{BASE_URL}/api/bet/verify"
        headers = {"Authorization": f"Bearer {token}"}
        payload = {"betId": bet_id_to_verify}
        resp = session.post(url, headers=headers, json=payload, timeout=TIMEOUT)
        return resp

    login()

    # First test: valid betId returns verification result with match status
    try:
        place_demo_bet()
        resp = verify_bet(bet_id)
        assert resp.status_code == 200, f"Verification failed for valid betId: {resp.text}"
        verification_result = resp.json()
        # Expect verification result includes a field indicating match status
        assert isinstance(verification_result, dict), "Verification result is not a dict"
        assert "match" in verification_result or "matchStatus" in verification_result, \
            "Verification result missing match status key (e.g., 'match', 'matchStatus')"
    finally:
        # No deletion endpoint available per PRD for bets, so no cleanup on bet resource
        pass

    # Second test: unknown betId returns 400 error
    unknown_bet_id = str(uuid.uuid4())
    resp = verify_bet(unknown_bet_id)
    assert resp.status_code == 400, f"Expected 400 error for unknown betId but got {resp.status_code} with body: {resp.text}"


test_post_apibetverify_verify_bet_with_provably_fair_system()
