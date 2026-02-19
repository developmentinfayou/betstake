import requests
import uuid

BASE_URL = "http://localhost:3001"
TIMEOUT = 30

def test_post_api_auth_login_authentication_and_token_issuance():
    # Generate unique user credentials for registration
    unique_suffix = str(uuid.uuid4())
    username = f"testuser_{unique_suffix[:8]}"
    email = f"{unique_suffix[:8]}@example.com"
    password = "TestPass123"

    register_data = {
        "username": username,
        "email": email,
        "password": password
    }
    headers = {
        "Content-Type": "application/json"
    }

    # Register new user
    try:
        register_resp = requests.post(
            f"{BASE_URL}/api/auth/register",
            json=register_data,
            headers=headers,
            timeout=TIMEOUT
        )
        assert register_resp.status_code == 200, f"Registration failed: {register_resp.text}"
        register_json = register_resp.json()
        assert "token" in register_json, "Registration response missing token"
        assert "user" in register_json, "Registration response missing user object"
        user_obj = register_json["user"]
        for field in ["id", "username", "email", "role"]:
            assert field in user_obj, f"User object missing field {field}"
        # Verify returned username and email match
        assert user_obj["username"] == username
        assert user_obj["email"] == email

        # Use registered email and password for login tests
        login_url = f"{BASE_URL}/api/auth/login"
        login_headers = {"Content-Type": "application/json"}

        # Test login with valid credentials
        login_data_valid = {
            "email": email,
            "password": password
        }
        login_resp_valid = requests.post(
            login_url,
            json=login_data_valid,
            headers=login_headers,
            timeout=TIMEOUT
        )
        assert login_resp_valid.status_code == 200, f"Login with valid credentials failed: {login_resp_valid.text}"
        login_json = login_resp_valid.json()
        assert "token" in login_json, "Login response missing token"
        assert "user" in login_json, "Login response missing user object"
        user = login_json["user"]
        # Validate user fields including roles and flags
        for field in ["id", "username", "email", "role", "isVip", "isPremium", "level"]:
            assert field in user, f"User object missing field {field}"

        # Test login with invalid credentials (wrong password)
        login_data_invalid = {
            "email": email,
            "password": "WrongPassword123!"
        }
        login_resp_invalid = requests.post(
            login_url,
            json=login_data_invalid,
            headers=login_headers,
            timeout=TIMEOUT
        )
        assert login_resp_invalid.status_code == 401, f"Login with invalid credentials should return 401, got {login_resp_invalid.status_code}"
        assert "Invalid credentials" in login_resp_invalid.text or "invalid credentials" in login_resp_invalid.text.lower()

    finally:
        # Cleanup not required because it's test user and no deletion endpoint specified
        pass

test_post_api_auth_login_authentication_and_token_issuance()