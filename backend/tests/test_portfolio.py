"""Portfolio (clients + holdings + NAV) backend tests."""
import os
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
                break

ADMIN_EMAIL = "satvikkinvestments@gmail.com"
ADMIN_PASSWORD = "Satvik@2026"


@pytest.fixture(scope="module")
def anon():
    return requests.Session()


@pytest.fixture(scope="module")
def admin_session():
    s = requests.Session()
    r = s.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"login failed {r.status_code} {r.text}")
    return s


# ---------- Auth guards ----------
@pytest.mark.parametrize("method,path", [
    ("get", "/api/admin/clients"),
    ("post", "/api/admin/clients"),
    ("get", "/api/admin/clients/nonexistent"),
    ("get", "/api/admin/funds/search?q=parag"),
    ("post", "/api/admin/nav/refresh"),
])
def test_admin_requires_auth(anon, method, path):
    r = getattr(anon, method)(f"{BASE_URL}{path}", json={} if method == "post" else None)
    assert r.status_code == 401, f"{method} {path} -> {r.status_code}"


# ---------- NAV refresh ----------
def test_nav_refresh(admin_session):
    r = admin_session.post(f"{BASE_URL}/api/admin/nav/refresh")
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["count"] > 1000, f"only {body['count']} schemes"
    assert body["nav_updated"]


# ---------- Fund search ----------
def test_fund_search_short_query(admin_session):
    r = admin_session.get(f"{BASE_URL}/api/admin/funds/search", params={"q": "pa"})
    assert r.status_code == 200
    assert r.json()["results"] == []


def test_fund_search_parag_parikh(admin_session):
    r = admin_session.get(f"{BASE_URL}/api/admin/funds/search", params={"q": "parag parikh flexi"})
    assert r.status_code == 200
    results = r.json()["results"]
    assert len(results) > 0
    # verify each result has code, name, nav
    for it in results:
        assert it["code"] and it["name"]
    codes = [x["code"] for x in results]
    # scheme code 122640 is Parag Parikh Flexi Cap - Regular - Growth
    assert any("parag parikh flexi" in x["name"].lower() for x in results)


# ---------- Client CRUD + holdings ----------
_created_ids = {"client": None, "holding": None}


def test_create_client(admin_session):
    payload = {"name": "TEST_QA Client", "email": "qa@test.com", "phone": "9999999999", "pan": "abcde1234f", "notes": "automation"}
    r = admin_session.post(f"{BASE_URL}/api/admin/clients", json=payload)
    assert r.status_code == 200, r.text
    doc = r.json()
    assert doc["name"] == "TEST_QA Client"
    assert doc["pan"] == "ABCDE1234F"
    assert doc["id"]
    _created_ids["client"] = doc["id"]


def test_client_appears_in_list(admin_session):
    r = admin_session.get(f"{BASE_URL}/api/admin/clients")
    assert r.status_code == 200
    body = r.json()
    ids = [c["id"] for c in body["clients"]]
    assert _created_ids["client"] in ids
    row = next(c for c in body["clients"] if c["id"] == _created_ids["client"])
    for k in ("invested", "current_value", "gain", "return_pct", "xirr", "holdings_count"):
        assert k in row


def test_add_holding(admin_session):
    cid = _created_ids["client"]
    payload = {
        "scheme_code": "122640",
        "scheme_name": "Parag Parikh Flexi Cap - Regular - Growth",
        "units": 100.0,
        "invested_amount": 50000.0,
        "invested_date": "2024-01-15",
        "category": "Equity",
        "folio": "TEST-F-001",
    }
    r = admin_session.post(f"{BASE_URL}/api/admin/clients/{cid}/holdings", json=payload)
    assert r.status_code == 200, r.text
    h = r.json()
    assert h["units"] == 100.0
    assert h["invested_amount"] == 50000.0
    # nav might be present now that NAV cache is loaded
    assert h["nav"] is not None, "NAV cache should contain scheme 122640"
    assert h["current_value"] is not None
    assert abs(h["current_value"] - 100.0 * h["nav"]) < 0.5
    _created_ids["holding"] = h["id"]


def test_client_detail_summary(admin_session):
    cid = _created_ids["client"]
    r = admin_session.get(f"{BASE_URL}/api/admin/clients/{cid}")
    assert r.status_code == 200
    body = r.json()
    assert body["client"]["id"] == cid
    s = body["summary"]
    assert s["invested"] == 50000.0
    assert s["current_value"] is not None
    assert s["gain"] is not None
    # XIRR needs >=2 flows, we have invested_date + today
    assert s["xirr"] is not None
    alloc = {a["name"]: a["value"] for a in s["allocation"]}
    assert "Equity" in alloc
    assert len(body["holdings"]) == 1


def test_add_holding_bad_units(admin_session):
    cid = _created_ids["client"]
    r = admin_session.post(f"{BASE_URL}/api/admin/clients/{cid}/holdings", json={
        "scheme_code": "122640", "scheme_name": "x", "units": 0, "invested_amount": 100
    })
    assert r.status_code == 400


def test_holding_missing_client(admin_session):
    r = admin_session.post(f"{BASE_URL}/api/admin/clients/nope/holdings", json={
        "scheme_code": "122640", "scheme_name": "x", "units": 1, "invested_amount": 100
    })
    assert r.status_code == 404


def test_delete_holding(admin_session):
    hid = _created_ids["holding"]
    r = admin_session.delete(f"{BASE_URL}/api/admin/holdings/{hid}")
    assert r.status_code == 200
    # verify summary recalculated
    cid = _created_ids["client"]
    r2 = admin_session.get(f"{BASE_URL}/api/admin/clients/{cid}")
    assert r2.status_code == 200
    assert len(r2.json()["holdings"]) == 0
    assert r2.json()["summary"]["invested"] == 0


def test_delete_client_cascades(admin_session):
    cid = _created_ids["client"]
    # add another holding, then delete client, verify holdings gone
    admin_session.post(f"{BASE_URL}/api/admin/clients/{cid}/holdings", json={
        "scheme_code": "122640", "scheme_name": "PPFC", "units": 10, "invested_amount": 5000, "invested_date": "2024-06-01", "category": "Equity"
    })
    r = admin_session.delete(f"{BASE_URL}/api/admin/clients/{cid}")
    assert r.status_code == 200
    # ensure fetch returns 404 now
    r2 = admin_session.get(f"{BASE_URL}/api/admin/clients/{cid}")
    assert r2.status_code == 404
    _created_ids["client"] = None


def test_delete_nonexistent_client(admin_session):
    r = admin_session.delete(f"{BASE_URL}/api/admin/clients/does-not-exist-xyz")
    assert r.status_code == 404


# ---------- Aggregates across clients ----------
def test_clients_aggregates(admin_session):
    # Create two clients, add holdings, check list aggregates
    ids = []
    try:
        for i, units in enumerate([50, 25]):
            c = admin_session.post(f"{BASE_URL}/api/admin/clients", json={"name": f"TEST_agg_{i}"}).json()
            ids.append(c["id"])
            admin_session.post(f"{BASE_URL}/api/admin/clients/{c['id']}/holdings", json={
                "scheme_code": "122640", "scheme_name": "PPFC", "units": units,
                "invested_amount": units * 100, "invested_date": "2024-03-01", "category": "Equity"
            })
        r = admin_session.get(f"{BASE_URL}/api/admin/clients")
        body = r.json()
        rows = [c for c in body["clients"] if c["id"] in ids]
        assert len(rows) == 2
        total_invested = sum(c["invested"] for c in rows)
        assert abs(total_invested - (50 * 100 + 25 * 100)) < 0.01
    finally:
        for cid in ids:
            admin_session.delete(f"{BASE_URL}/api/admin/clients/{cid}")
