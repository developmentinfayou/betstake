import requests
import uuid

BASE_URL = "http://localhost:3001"
REGISTER_ENDPOINT = "/api/auth/register"
TIMEOUT = 30


def test_post_apiauthregister_user_registration_validation():
    headers = {"Content-Type": "application/json"}

    # Generate unique values for username and email for successful registration
    unique_id = str(uuid.uuid4()).replace("-", "")[:8]
    valid_username = f"user{unique_id}"
    valid_email = f"user{unique_id}@example.com"
    valid_password = "validpass123"

    # Helper function to register user with given payload
    def register_user(payload):
        try:
            r = requests.post(
                BASE_URL + REGISTER_ENDPOINT, json=payload, headers=headers, timeout=TIMEOUT
            )
            return r
        except requests.RequestException as e:
            assert False, f"Request failed: {e}"

    # 1. Success: valid registration
    payload = {
        "username": valid_username,
        "email": valid_email,
        "password": valid_password,
    }
    r = register_user(payload)
    assert r.status_code == 200, f"Expected 200, got {r.status_code}, response: {r.text}"
    json_data = r.json()
    assert "token" in json_data and isinstance(json_data["token"], str) and len(json_data["token"]) > 0
    user = json_data.get("user")
    assert user, "Response missing user object"
    assert all(
        field in user for field in ("id", "username", "email", "role")
    ), "User object missing required fields"
    assert user["username"] == valid_username
    assert user["email"] == valid_email

    # 2. Failure: username too short (<3 chars)
    payload = {
        "username": "ab",  # too short
        "email": f"shortuser{unique_id}@example.com",
        "password": valid_password,
    }
    r = register_user(payload)
    assert r.status_code == 400, f"Expected 400 for short username, got {r.status_code}"

    # 3. Failure: username too long (>20 chars)
    long_username = "u" * 21
    payload = {
        "username": long_username,
        "email": f"longuser{unique_id}@example.com",
        "password": valid_password,
    }
    r = register_user(payload)
    assert r.status_code == 400, f"Expected 400 for long username, got {r.status_code}"

    # 4. Failure: invalid email format (missing '@')
    payload = {
        "username": f"useremail{unique_id}",
        "email": "invalidemail.com",
        "password": valid_password,
    }
    r = register_user(payload)
    assert r.status_code == 400, f"Expected 400 for invalid email format, got {r.status_code}"

    # 5. Failure: invalid email format (missing domain)
    payload = {
        "username": f"useremail2{unique_id}",
        "email": "no-domain@",
        "password": valid_password,
    }
    r = register_user(payload)
    assert r.status_code == 400, f"Expected 400 for email missing domain, got {r.status_code}"

    # 6. Failure: password too short (<8 chars)
    payload = {
        "username": f"userpass{unique_id}",
        "email": f"userpass{unique_id}@example.com",
        "password": "short",
    }
    r = register_user(payload)
    assert r.status_code == 400, f"Expected 400 for short password, got {r.status_code}"

    # 7. Failure: missing username field
    payload = {
        # "username": "missing",
        "email": f"missinguser{unique_id}@example.com",
        "password": valid_password,
    }
    r = register_user(payload)
    assert r.status_code == 400, f"Expected 400 for missing username, got {r.status_code}"

    # 8. Failure: missing email field
    payload = {
        "username": f"missingemail{unique_id}",
        # "email": f"missingemail{unique_id}@example.com",
        "password": valid_password,
    }
    r = register_user(payload)
    assert r.status_code == 400, f"Expected 400 for missing email, got {r.status_code}"

    # 9. Failure: missing password field
    payload = {
        "username": f"missingpass{unique_id}",
        "email": f"missingpass{unique_id}@example.com",
        # "password": valid_password,
    }
    r = register_user(payload)
    assert r.status_code == 400, f"Expected 400 for missing password, got {r.status_code}"

    # 10. Failure: duplicate email registration (try to register with the initial email again)
    payload = {
        "username": f"dupuser{unique_id}",
        "email": valid_email,
        "password": valid_password,
    }
    r = register_user(payload)
    assert r.status_code == 400, f"Expected 400 for duplicate email, got {r.status_code}"


test_post_apiauthregister_user_registration_validation()