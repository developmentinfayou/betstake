import requests
import uuid

BASE_URL = "http://localhost:3001"
TIMEOUT = 30

def test_post_apiauthlogin_user_authentication():
    session = requests.Session()
    # Generate unique email for registration to avoid conflict
    unique_email = f"testuser_{uuid.uuid4().hex[:8]}@example.com"
    register_url = f"{BASE_URL}/api/auth/register"
    login_url = f"{BASE_URL}/api/auth/login"
    
    register_payload = {
        "username": "testuser",
        "email": unique_email,
        "password": "TestPass123"
    }
    
    try:
        # Register new user (should succeed)
        reg_resp = session.post(register_url, json=register_payload, timeout=TIMEOUT)
        assert reg_resp.status_code == 200, f"Register failed with status {reg_resp.status_code}: {reg_resp.text}"
        reg_json = reg_resp.json()
        assert "token" in reg_json, "Register response missing token"
        assert "user" in reg_json, "Register response missing user info"
        assert reg_json["user"]["email"] == unique_email, "Registered user email mismatch"
        
        # Valid login attempt - should succeed with token and user info
        login_payload_valid = {
            "email": unique_email,
            "password": "TestPass123"
        }
        login_resp_valid = session.post(login_url, json=login_payload_valid, timeout=TIMEOUT)
        assert login_resp_valid.status_code == 200, f"Login with valid creds failed with status {login_resp_valid.status_code}"
        login_json = login_resp_valid.json()
        assert "token" in login_json, "Login response missing token"
        assert "user" in login_json, "Login response missing user info"
        assert login_json["user"]["email"] == unique_email, "Login user email mismatch"
        # Check expected additional user fields presence
        for field in ["id", "username", "email", "role", "isVip", "isPremium", "level"]:
            assert field in login_json["user"], f"Login user missing field: {field}"
        
        # Invalid login attempt - wrong password (should return 401)
        login_payload_invalid = {
            "email": unique_email,
            "password": "WrongPass123"
        }
        login_resp_invalid = session.post(login_url, json=login_payload_invalid, timeout=TIMEOUT)
        assert login_resp_invalid.status_code == 401, f"Login with invalid creds should return 401 but got {login_resp_invalid.status_code}"
        invalid_json = login_resp_invalid.json()
        # Optional: validate error message contains "Invalid credentials" or similar
        assert any(term in login_resp_invalid.text.lower() for term in ["invalid credentials", "unauthorized", "unauthenticated"]), "Invalid login response message unexpected"
        
        # Invalid login attempt - unknown email (should return 401)
        login_payload_unknown = {
            "email": "nonexistentuser@example.com",
            "password": "AnyPassword123"
        }
        login_resp_unknown = session.post(login_url, json=login_payload_unknown, timeout=TIMEOUT)
        assert login_resp_unknown.status_code == 401, f"Login with unknown email should return 401 but got {login_resp_unknown.status_code}"
        assert any(term in login_resp_unknown.text.lower() for term in ["invalid credentials", "unauthorized", "unauthenticated"]), "Unknown email login response message unexpected"
        
        # Invalid login attempts - missing fields check (empty email)
        login_payload_missing_email = {
            "password": "TestPass123"
        }
        login_resp_missing_email = session.post(login_url, json=login_payload_missing_email, timeout=TIMEOUT)
        # Should respond with 400 or validation error, since email is required
        assert login_resp_missing_email.status_code in (400, 422), f"Login missing email should fail with 400/422 but got {login_resp_missing_email.status_code}"
        
        # Missing password
        login_payload_missing_password = {
            "email": unique_email
        }
        login_resp_missing_password = session.post(login_url, json=login_payload_missing_password, timeout=TIMEOUT)
        assert login_resp_missing_password.status_code in (400, 422), f"Login missing password should fail with 400/422 but got {login_resp_missing_password.status_code}"
        
    finally:
        # Clean up: no explicit delete user endpoint given in PRD; user might remain in test DB or test environment
        # If cleanup endpoint existed, invoke here to delete the test user
        pass

test_post_apiauthlogin_user_authentication()