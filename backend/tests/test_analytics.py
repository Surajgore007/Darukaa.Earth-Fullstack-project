from datetime import date

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def _token(email: str, full_name: str) -> str:
    client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "StrongPass123!", "full_name": full_name},
    )
    response = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "StrongPass123!"},
    )
    return response.json()["access_token"]


def test_analytics_create_and_list_requires_site_owner():
    token = _token("analytics@example.com", "Analytics Owner")
    headers = {"Authorization": f"Bearer {token}"}
    project = client.post("/api/v1/projects", headers=headers, json={"name": "Analytics Project"})
    assert project.status_code == 201, project.text
    site = client.post(
        f"/api/v1/projects/{project.json()['id']}/sites",
        headers=headers,
        json={
            "name": "Analytics Site",
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [[74.85, 13.25], [74.89, 13.25], [74.89, 13.29], [74.85, 13.29], [74.85, 13.25]]
                ],
            },
        },
    )
    assert site.status_code == 201, site.text
    site_id = site.json()["id"]
    record = client.post(
        f"/api/v1/sites/{site_id}/analytics",
        headers=headers,
        json={
            "recorded_date": str(date.today()),
            "carbon_tonnes": 210.4,
            "biodiversity_index": 61.2,
            "canopy_cover_pct": 49.8,
        },
    )
    assert record.status_code == 201, record.text
    records = client.get(f"/api/v1/sites/{site_id}/analytics", headers=headers)
    assert records.status_code == 200
    assert len(records.json()) == 1
