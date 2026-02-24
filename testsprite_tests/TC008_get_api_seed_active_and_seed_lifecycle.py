import requests
import uuid

BASE_URL = "http://localhost:3001"
TIMEOUT = 30

def test_tc008_get_api_seed_active_and_seed_lifecycle():
    # Register a unique user to get authenticated token and initial seed created
    unique_suffix = str(uuid.uuid4())[:8]
    register_payload = {
        "username": f"testuser_{unique_suffix}",
        "email": f"testuser_{unique_suffix}@example.com",
        "password": "StrongPass123"
    }
    try:
        register_resp = requests.post(f"{BASE_URL}/api/auth/register", json=register_payload, timeout=TIMEOUT)
        assert register_resp.status_code == 200, f"Registration failed: {register_resp.text}"
        register_data = register_resp.json()
        token = register_data.get("token")
        assert token, "Token not found in registration response"
        headers = {"Authorization": f"Bearer {token}"}

        # GET /api/seed/active - check required fields and their types
        active_resp = requests.get(f"{BASE_URL}/api/seed/active", headers=headers, timeout=TIMEOUT)
        assert active_resp.status_code == 200, f"/api/seed/active failed: {active_resp.text}"
        active_data = active_resp.json()
        # Validate presence and types
        assert isinstance(active_data.get("serverSeedHash"), str), "serverSeedHash not string"
        assert isinstance(active_data.get("clientSeed"), str), "clientSeed not string"
        assert isinstance(active_data.get("nonce"), (int, float)), "nonce not number"
        assert isinstance(active_data.get("revealed"), bool), "revealed not boolean"
        assert isinstance(active_data.get("hasActiveGame"), bool), "hasActiveGame not boolean"

        original_client_seed = active_data.get("clientSeed")

        # POST /api/seed/client-seed - update clientSeed with 'mycustomseed123'
        update_payload = {"clientSeed": "mycustomseed123"}
        update_resp = requests.post(f"{BASE_URL}/api/seed/client-seed", headers=headers, json=update_payload, timeout=TIMEOUT)
        assert update_resp.status_code == 200, f"/api/seed/client-seed failed: {update_resp.text}"
        update_data = update_resp.json()
        # Check updated clientSeed is reflected
        updated_client_seed = update_data.get("clientSeed")
        assert updated_client_seed == "mycustomseed123", f"clientSeed not updated, expected 'mycustomseed123' but got '{updated_client_seed}'"

        # Confirm updated clientSeed via GET /api/seed/active
        active_resp_after_update = requests.get(f"{BASE_URL}/api/seed/active", headers=headers, timeout=TIMEOUT)
        assert active_resp_after_update.status_code == 200, f"/api/seed/active after update failed: {active_resp_after_update.text}"
        active_data_after_update = active_resp_after_update.json()
        assert active_data_after_update.get("clientSeed") == "mycustomseed123", "clientSeed update not persisted"

        # POST /api/seed/rotate - rotate seed pair, check oldSeed and newSeed properly formed
        rotate_resp = requests.post(f"{BASE_URL}/api/seed/rotate", headers=headers, timeout=TIMEOUT)
        assert rotate_resp.status_code == 200, f"/api/seed/rotate failed: {rotate_resp.text}"
        rotate_data = rotate_resp.json()

        old_seed = rotate_data.get("oldSeed")
        new_seed = rotate_data.get("newSeed")
        assert isinstance(old_seed, dict), "oldSeed not an object"
        assert isinstance(new_seed, dict), "newSeed not an object"

        # oldSeed should have serverSeed (string, revealed), clientSeed (string), nonce (number), revealed should be True
        assert isinstance(old_seed.get("serverSeed"), str), "oldSeed.serverSeed not string"
        assert old_seed.get("revealed") is True, "oldSeed.revealed not True"
        assert isinstance(old_seed.get("clientSeed"), str), "oldSeed.clientSeed not string"
        assert isinstance(old_seed.get("nonce"), (int, float)), "oldSeed.nonce not number"

        # newSeed should have serverSeedHash (string), clientSeed (string), nonce (number), revealed (boolean)
        assert isinstance(new_seed.get("serverSeedHash"), str), "newSeed.serverSeedHash not string"
        assert isinstance(new_seed.get("clientSeed"), str), "newSeed.clientSeed not string"
        assert isinstance(new_seed.get("nonce"), (int, float)), "newSeed.nonce not number"
        assert isinstance(new_seed.get("revealed"), bool), "newSeed.revealed not boolean"

    finally:
        # Cleanup: usually no endpoint is given to delete user.
        # So no cleanup step available here.
        pass

test_tc008_get_api_seed_active_and_seed_lifecycle()