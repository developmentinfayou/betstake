import requests
import uuid

BASE_URL = "http://localhost:3001"
TIMEOUT = 30

def test_TC009_strategy_defaults_and_crud_operations():
    # 1) GET /api/strategy/defaults (no auth required)
    resp = requests.get(f"{BASE_URL}/api/strategy/defaults", timeout=TIMEOUT)
    assert resp.status_code == 200
    data = resp.json()
    assert "strategies" in data
    assert isinstance(data["strategies"], list)
    # Check at least one preset strategy has name Martingale
    assert any(s.get("name", "").lower() == "martingale" for s in data["strategies"])

    # 2) Register test user to get auth token
    unique_suffix = str(uuid.uuid4()).replace("-", "")[:8]
    username = f"testuser_{unique_suffix}"
    email = f"testuser_{unique_suffix}@example.com"
    password = "TestPass123!"
    register_payload = {
        "username": username,
        "email": email,
        "password": password
    }
    r = requests.post(f"{BASE_URL}/api/auth/register", json=register_payload, timeout=TIMEOUT)
    assert r.status_code == 200
    reg_data = r.json()
    assert "token" in reg_data
    token = reg_data["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3) GET /api/strategy/all (auth required)
    r = requests.get(f"{BASE_URL}/api/strategy/all", headers=headers, timeout=TIMEOUT)
    assert r.status_code == 200
    data_all = r.json()
    assert "strategies" in data_all
    assert isinstance(data_all["strategies"], list)

    # 4) POST /api/strategy with valid strategy
    strategy_payload = {
        "name": "Test Strategy",
        "conditions": [
            {
                "type": "bet",
                "condition": {
                    "outcome": "win",
                    "count": 1
                },
                "action": {
                    "reset": True
                }
            }
        ]
    }
    created_strategy_id = None
    try:
        r = requests.post(f"{BASE_URL}/api/strategy", headers=headers, json=strategy_payload, timeout=TIMEOUT)
        assert r.status_code == 201
        created_data = r.json()
        assert "strategy" in created_data
        strategy = created_data["strategy"]
        assert strategy["name"] == "Test Strategy"
        assert "conditions" in strategy
        created_strategy_id = strategy.get("_id") or strategy.get("id")
        assert created_strategy_id is not None

        # 5) DELETE created strategy by id
        r = requests.delete(f"{BASE_URL}/api/strategy/{created_strategy_id}", headers=headers, timeout=TIMEOUT)
        assert r.status_code == 200
        del_data = r.json()
        assert del_data.get("success") is True

        # 6) Confirm deletion by GET strategy/:id returns 404
        r = requests.get(f"{BASE_URL}/api/strategy/{created_strategy_id}", headers=headers, timeout=TIMEOUT)
        assert r.status_code == 404

        created_strategy_id = None  # Already deleted

    finally:
        # Cleanup if strategy still exists (for test robustness)
        if created_strategy_id is not None:
            try:
                requests.delete(f"{BASE_URL}/api/strategy/{created_strategy_id}", headers=headers, timeout=TIMEOUT)
            except Exception:
                pass

    # 7) POST /api/strategy without name returns 400
    invalid_payload = {
        "conditions": [
            {
                "type": "bet",
                "condition": {
                    "outcome": "win",
                    "count": 1
                },
                "action": {
                    "reset": True
                }
            }
        ]
    }
    r = requests.post(f"{BASE_URL}/api/strategy", headers=headers, json=invalid_payload, timeout=TIMEOUT)
    assert r.status_code == 400

test_TC009_strategy_defaults_and_crud_operations()
