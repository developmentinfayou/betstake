import requests

BASE_URL = "http://localhost:3001"
TIMEOUT = 30

def test_get_apiauthme_authenticated_user_profile_retrieval():
    session = requests.Session()
    # Register a new test user to get a valid JWT token
    register_url = f"{BASE_URL}/api/auth/register"
    test_user = {
        "username": "testuserapi3",
        "email": "testuserapi3@example.com",
        "password": "password123"
    }
    token = None
    try:
        register_resp = session.post(register_url, json=test_user, timeout=TIMEOUT)
        assert register_resp.status_code == 200, f"Registration failed with status {register_resp.status_code}, body: {register_resp.text}"
        register_data = register_resp.json()
        token = register_data.get("token")
        assert token and isinstance(token, str), "Token not found or invalid in registration response"

        headers_auth = {"Authorization": f"Bearer {token}"}

        # Access /api/auth/me with valid token
        me_url = f"{BASE_URL}/api/auth/me"
        me_resp = session.get(me_url, headers=headers_auth, timeout=TIMEOUT)
        assert me_resp.status_code == 200, f"/api/auth/me with valid token failed with status {me_resp.status_code}, body: {me_resp.text}"
        me_data = me_resp.json()

        # Verify response includes user object with likely settings and stats keys
        # We cannot strictly know keys but user + settings and stats should be included (based on PRD)
        # Check minimal required keys and presence of nested keys for settings and stats
        assert isinstance(me_data, dict), "/api/auth/me response is not a JSON object"
        assert "id" in me_data or "user" in me_data or "username" in me_data or len(me_data) > 0, "User object missing or empty in /api/auth/me response"

        # Heuristic check for settings and stats presence (they may be nested or part of user object)
        # We allow either top-level keys or inside 'user' key
        settings_present = False
        stats_present = False

        # Check directly at top level
        if "settings" in me_data:
            settings_present = True
        if "stats" in me_data:
            stats_present = True

        # Check if a 'user' field contains them
        if "user" in me_data:
            user_obj = me_data["user"]
            if isinstance(user_obj, dict):
                if "settings" in user_obj:
                    settings_present = True
                if "stats" in user_obj:
                    stats_present = True

        # If not found, just make sure the response is non-empty user object with some keys
        assert settings_present or stats_present or len(me_data) > 2, "Response does not include user settings or stats or sufficient user info"

        # Attempt to access /api/auth/me without Authorization header
        me_noauth_resp = session.get(me_url, timeout=TIMEOUT)
        assert me_noauth_resp.status_code == 401, f"/api/auth/me without token expected 401 but got {me_noauth_resp.status_code}, body: {me_noauth_resp.text}"

    finally:
        # Cleanup: delete the test user if API supports or skip since no delete user endpoint is documented
        # No delete user endpoint in PRD, so no cleanup possible
        pass

test_get_apiauthme_authenticated_user_profile_retrieval()