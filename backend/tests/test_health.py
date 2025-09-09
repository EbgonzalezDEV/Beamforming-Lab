def test_health_ok(client):
	resp = client.get("/health")
	assert resp.status_code == 200
	data = resp.json()
	assert data["status"] == "ok"
	assert data["service"] == "beamforming-backend"


def test_openapi_available(client):
	resp = client.get("/openapi.json")
	assert resp.status_code == 200
	assert "paths" in resp.json()


