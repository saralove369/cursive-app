"""
Cursive Backend API Test Suite
Tests all endpoints defined in /app/backend/server.py
"""
import os
import uuid
import pytest
import requests

BASE_URL = (
    os.environ.get("EXPO_BACKEND_URL")
    or os.environ.get("EXPO_PUBLIC_BACKEND_URL")
    or "https://analog-restore.preview.emergentagent.com"
).rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def test_user():
    return f"TEST_{uuid.uuid4()}"


# ---------- Root ----------
class TestRoot:
    def test_root_welcome(self, client):
        r = client.get(f"{API}/")
        assert r.status_code == 200
        data = r.json()
        assert "message" in data and "Cursive" in data["message"]
        assert data.get("version") == "1.0.0"


# ---------- Content Library ----------
class TestContent:
    def test_list_all_content_returns_27(self, client):
        r = client.get(f"{API}/content")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 27, f"Expected 27 pieces, got {len(data)}"
        # validate shape
        for piece in data[:3]:
            assert "id" in piece and "category" in piece and "title" in piece and "body" in piece

    def test_filter_by_poetry(self, client):
        r = client.get(f"{API}/content", params={"category": "poetry"})
        assert r.status_code == 200
        data = r.json()
        assert len(data) > 0
        assert all(p["category"] == "poetry" for p in data)

    def test_categories_endpoint_has_8(self, client):
        r = client.get(f"{API}/content/categories")
        assert r.status_code == 200
        data = r.json()
        cats = data.get("categories", [])
        names = sorted([c["category"] for c in cats])
        expected = sorted([
            "philosophy", "poetry", "letters", "affirmations",
            "mindfulness", "recipes", "creativity", "gratitude",
        ])
        assert names == expected, f"Got categories: {names}"
        for c in cats:
            assert c["count"] > 0

    def test_get_single_content_by_id(self, client):
        r = client.get(f"{API}/content")
        first = r.json()[0]
        cid = first["id"]
        r2 = client.get(f"{API}/content/{cid}")
        assert r2.status_code == 200
        assert r2.json()["id"] == cid

    def test_get_content_404(self, client):
        r = client.get(f"{API}/content/nonexistent-id-xyz")
        assert r.status_code == 404


# ---------- Archive ----------
class TestArchive:
    def test_list_archive_returns_5(self, client):
        r = client.get(f"{API}/archive")
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 5, f"Expected 5 archive docs, got {len(data)}"
        for d in data[:2]:
            assert "id" in d and "title" in d and "transcription" in d

    def test_get_single_archive(self, client):
        r = client.get(f"{API}/archive")
        first = r.json()[0]
        r2 = client.get(f"{API}/archive/{first['id']}")
        assert r2.status_code == 200
        assert r2.json()["id"] == first["id"]

    def test_archive_404(self, client):
        r = client.get(f"{API}/archive/nope-xyz")
        assert r.status_code == 404


# ---------- Sessions ----------
class TestSessions:
    def test_create_and_list_sessions(self, client, test_user):
        payload = {
            "user_id": test_user,
            "content_type": "freewrite",
            "duration_seconds": 120,
            "word_count": 45,
            "title": "TEST_session_one",
        }
        r = client.post(f"{API}/sessions", json=payload)
        assert r.status_code == 200
        s = r.json()
        assert s["user_id"] == test_user
        assert s["duration_seconds"] == 120
        assert s["word_count"] == 45
        assert s["title"] == "TEST_session_one"
        assert "id" in s and "completed_at" in s

        # second session
        r2 = client.post(f"{API}/sessions", json={
            "user_id": test_user,
            "content_type": "letter",
            "duration_seconds": 60,
            "word_count": 10,
        })
        assert r2.status_code == 200

        # GET to verify persistence + sorting desc
        r3 = client.get(f"{API}/sessions/{test_user}")
        assert r3.status_code == 200
        sessions = r3.json()
        assert len(sessions) >= 2
        # sorted desc
        ts = [x["completed_at"] for x in sessions]
        assert ts == sorted(ts, reverse=True), "Sessions not sorted desc"


# ---------- Progress ----------
class TestProgress:
    def test_progress_for_user(self, client, test_user):
        r = client.get(f"{API}/progress/{test_user}")
        assert r.status_code == 200
        d = r.json()
        # We added 120 + 60 = 180s = 3 minutes; 45 + 10 = 55 words; 2 sessions
        assert d["total_sessions"] >= 2
        assert d["total_minutes"] >= 3
        assert d["total_words"] >= 55
        assert "current_streak" in d and d["current_streak"] >= 1
        assert "longest_streak" in d and d["longest_streak"] >= 1
        assert isinstance(d["sessions_by_category"], dict)
        assert d["last_session_at"] is not None

    def test_progress_for_unknown_user_returns_zeros(self, client):
        unknown = f"TEST_unknown_{uuid.uuid4()}"
        r = client.get(f"{API}/progress/{unknown}")
        assert r.status_code == 200
        d = r.json()
        assert d["total_sessions"] == 0
        assert d["total_minutes"] == 0
        assert d["total_words"] == 0
        assert d["current_streak"] == 0
        assert d["longest_streak"] == 0
        assert d["last_session_at"] is None


# ---------- Profiles ----------
class TestProfiles:
    def test_create_and_update_profile(self, client, test_user):
        # create
        r = client.post(f"{API}/profiles", json={
            "user_id": test_user,
            "display_name": "TEST_Initial",
        })
        assert r.status_code == 200
        p = r.json()
        assert p["user_id"] == test_user
        assert p["display_name"] == "TEST_Initial"

        # update (upsert)
        r2 = client.post(f"{API}/profiles", json={
            "user_id": test_user,
            "display_name": "TEST_Updated",
        })
        assert r2.status_code == 200
        assert r2.json()["display_name"] == "TEST_Updated"

        # GET to verify
        r3 = client.get(f"{API}/profiles/{test_user}")
        assert r3.status_code == 200
        assert r3.json()["display_name"] == "TEST_Updated"

    def test_profile_404(self, client):
        r = client.get(f"{API}/profiles/no_such_user_{uuid.uuid4()}")
        assert r.status_code == 404


# ---------- Favorites ----------
class TestFavorites:
    def test_add_list_remove_favorite(self, client, test_user):
        # Pick a real content id
        content = client.get(f"{API}/content").json()
        cid = content[0]["id"]

        r = client.post(f"{API}/favorites", json={
            "user_id": test_user,
            "content_id": cid,
            "content_type": "collection",
        })
        assert r.status_code == 200
        fav = r.json()
        assert fav["content_id"] == cid

        # idempotent add
        r2 = client.post(f"{API}/favorites", json={
            "user_id": test_user,
            "content_id": cid,
            "content_type": "collection",
        })
        assert r2.status_code == 200

        # list
        r3 = client.get(f"{API}/favorites/{test_user}")
        assert r3.status_code == 200
        favs = r3.json()
        assert any(f["content_id"] == cid for f in favs)
        added_count = len([f for f in favs if f["content_id"] == cid])
        assert added_count == 1, "Favorites must be idempotent"

        # delete
        r4 = client.delete(f"{API}/favorites", params={
            "user_id": test_user,
            "content_id": cid,
        })
        assert r4.status_code == 200
        assert r4.json().get("removed") is True

        # verify gone
        r5 = client.get(f"{API}/favorites/{test_user}")
        assert not any(f["content_id"] == cid for f in r5.json())


# ---------- Penpal ----------
class TestPenpal:
    def test_penpal_signup(self, client):
        email = f"TEST_{uuid.uuid4().hex[:8]}@example.com"
        r = client.post(f"{API}/penpal/signup", json={
            "email": email,
            "display_name": "TEST_Penpal",
            "interests": ["poetry", "letters"],
            "note": "TEST note",
        })
        assert r.status_code == 200
        d = r.json()
        assert d["email"] == email
        assert d["display_name"] == "TEST_Penpal"
        assert d["interests"] == ["poetry", "letters"]
        assert "id" in d and "joined_at" in d

        # idempotent signup
        r2 = client.post(f"{API}/penpal/signup", json={"email": email})
        assert r2.status_code == 200
        assert r2.json()["email"] == email

    def test_penpal_invalid_email(self, client):
        r = client.post(f"{API}/penpal/signup", json={"email": "not-an-email"})
        assert r.status_code == 422
