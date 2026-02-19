import requests
import uuid

BASE_URL = "http://localhost:3001"
REGISTER_PATH = "/api/auth/register"
TIMEOUT = 30


def test_post_api_auth_register_user_registration_validation():
    # Generate unique values for username and email
    unique_id = str(uuid.uuid4()).replace("-", "")[:8]
    valid_username = f"user{unique_id}"
    valid_email = f"user{unique_id}@example.com"
    valid_password = "ValidPass123"

    headers = {"Content-Type": "application/json"}

    # Helper function to register user
    def register_user(username, email, password):
        payload = {
            "username": username,
            "email": email,
            "password": password
        }
        return requests.post(
            BASE_URL + REGISTER_PATH,
            json=payload,
            headers=headers,
            timeout=TIMEOUT
        )

    # 1. Test successful registration with valid inputs
    response = register_user(valid_username, valid_email, valid_password)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    json_resp = response.json()
    assert "token" in json_resp and isinstance(json_resp["token"], str), "Token missing or invalid"
    assert "user" in json_resp and isinstance(json_resp["user"], dict), "User info missing or invalid"
    user = json_resp["user"]
    assert all(k in user for k in ["id", "username", "email", "role"]), "User keys missing"
    assert user["username"] == valid_username, "Username mismatch"
    assert user["email"] == valid_email, "Email mismatch"

    # 2. Test invalid username length (too short)
    response = register_user("ab", f"shortname{unique_id}@example.com", valid_password)
    assert response.status_code == 400, f"Expected 400 for short username, got {response.status_code}"

    # 3. Test invalid username length (too long)
    long_username = "u" * 21
    response = register_user(long_username, f"longname{unique_id}@example.com", valid_password)
    assert response.status_code == 400, f"Expected 400 for long username, got {response.status_code}"

    # 4. Test invalid email formats
    invalid_emails = ["plainaddress", "missingatsign.com", "missingdomain@.com", "missingdot@domaincom"]
    for invalid_email in invalid_emails:
        response = register_user(valid_username + "X", invalid_email, valid_password)
        assert response.status_code == 400, f"Expected 400 for invalid email '{invalid_email}', got {response.status_code}"

    # 5. Test invalid password length (too short)
    short_password = "short1"
    response = register_user(valid_username + "Y", f"validemail{unique_id}@example.com", short_password)
    assert response.status_code == 400, f"Expected 400 for short password, got {response.status_code}"

    # 6. Test duplicate email registration returns 400
    # Reuse valid_email which was already registered above
    response = register_user(valid_username + "Z", valid_email, valid_password)
    assert response.status_code == 400, f"Expected 400 for duplicate email, got {response.status_code}"

test_post_api_auth_register_user_registration_validation()