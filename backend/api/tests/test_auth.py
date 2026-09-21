from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_auth_me_requires_authentication():
    response = client.get(
        "/api/auth/me"
    )

    assert response.status_code == 401

    assert response.json() == {
        "detail":
            "Autenticación requerida."
    }

    assert (
        response.headers[
            "www-authenticate"
        ]
        == "Bearer"
    )
