import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:3001"
AUTH_CREDENTIALS = ("samarpit@gmail.com", "87654321")
TIMEOUT = 30


def test_tc008_get_apibet_history_pagination_and_retrieval():
    session = requests.Session()
    # Authenticate user (POST /api/auth/login)
    login_url = f"{BASE_URL}/api/auth/login"
    login_payload = {"email": AUTH_CREDENTIALS[0], "password": AUTH_CREDENTIALS[1]}
    login_resp = session.post(login_url, json=login_payload, timeout=TIMEOUT)
    assert login_resp.status_code == 200, "Login failed"
    token = login_resp.json().get("token")
    assert token, "JWT token missing in login response"

    headers = {"Authorization": f"Bearer {token}"}

    # First, place a bet to have a bet record for retrieval and pagination test
    place_bet_url = f"{BASE_URL}/api/bet/place"
    bet_payload = {
        "gameType": "dice",
        "currency": "USD",
        "amount": 1,
        "gameParams": {},
        "isDemo": True
    }
    place_resp = session.post(place_bet_url, json=bet_payload, headers=headers, timeout=TIMEOUT)
    assert place_resp.status_code == 200, f"Bet placement failed: {place_resp.text}"
    place_data = place_resp.json()
    bet = place_data.get("bet")
    assert bet and "id" in bet, "Bet object missing or no id in response"
    bet_id = bet["id"]

    try:
        # Test retrieval of bet history with pagination (limit and offset)
        limit = 5
        offset = 0
        history_url = f"{BASE_URL}/api/bet/history?limit={limit}&offset={offset}"
        history_resp = session.get(history_url, headers=headers, timeout=TIMEOUT)
        assert history_resp.status_code == 200, f"Bet history retrieval failed: {history_resp.text}"
        history_data = history_resp.json()
        bets = history_data.get("bets")
        assert isinstance(bets, list), "Bets is not a list"
        # Check that bets list length is <= limit (pagination)
        assert len(bets) <= limit, "Number of bets returned exceeds limit"
        # Optional: verify each entry has expected bet fields
        for b in bets:
            assert isinstance(b, dict), "Bet in bets list is not a dict"
            assert "id" in b or "_id" in b or "betId" in b or "betID" in b, "Bet missing id field"

        # Test retrieval of single bet by betId (public endpoint, no auth required)
        single_bet_url = f"{BASE_URL}/api/bet/{bet_id}"
        single_resp = session.get(single_bet_url, timeout=TIMEOUT)
        assert single_resp.status_code == 200, f"Single bet retrieval failed: {single_resp.text}"
        single_bet = single_resp.json()
        assert isinstance(single_bet, dict), "Single bet response is not a dict"
        # The returned bet's id should match bet_id (some APIs use _id or id, normalize)
        bet_id_fields = [key for key in single_bet.keys() if key.lower() == "id"]
        assert bet_id_fields, "Returned bet does not contain id field"
        returned_id = single_bet[bet_id_fields[0]]
        assert returned_id == bet_id, f"Returned bet id {returned_id} does not match expected {bet_id}"

        # Edge case: retrieval with offset beyond total bets (expect empty or valid response)
        big_offset = 10000
        history_resp_offset = session.get(f"{BASE_URL}/api/bet/history?limit=5&offset={big_offset}", headers=headers, timeout=TIMEOUT)
        assert history_resp_offset.status_code == 200, f"Bet history retrieval with large offset failed: {history_resp_offset.text}"
        history_data_offset = history_resp_offset.json()
        bets_offset = history_data_offset.get("bets")
        assert isinstance(bets_offset, list), "Bets with large offset is not a list"
        # Likely no bets returned, but response still valid
    finally:
        # Clean up: No direct API to delete bet, skipping delete
        pass


test_tc008_get_apibet_history_pagination_and_retrieval()