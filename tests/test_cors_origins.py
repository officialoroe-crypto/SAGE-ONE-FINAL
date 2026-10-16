"""Regression tests for the public web frontend CORS allowlist."""

from app.main import _cors_origins


def test_github_pages_origin_remains_allowed_when_render_env_is_custom(monkeypatch):
    monkeypatch.setenv("SAGE_CORS_ORIGINS", "https://preview.example.com/")
    origins = _cors_origins()

    assert "https://officialoroe-crypto.github.io" in origins
    assert "https://preview.example.com" in origins


def test_cors_origins_normalize_and_deduplicate(monkeypatch):
    monkeypatch.setenv(
        "SAGE_CORS_ORIGINS",
        "https://officialoroe-crypto.github.io/, https://preview.example.com, https://preview.example.com/",
    )
    origins = _cors_origins()

    assert origins.count("https://officialoroe-crypto.github.io") == 1
    assert origins.count("https://preview.example.com") == 1


def test_production_allows_only_the_canonical_frontend(monkeypatch):
    """In production, a user's localhost must never be a trusted browser origin."""
    monkeypatch.setattr("app.main.settings.ENVIRONMENT", "production")
    monkeypatch.delenv("SAGE_CORS_ORIGINS", raising=False)
    origins = _cors_origins()

    assert origins == ["https://officialoroe-crypto.github.io"]
    assert not any(origin.startswith("http://localhost") for origin in origins)
    assert not any(origin.startswith("http://127.0.0.1") for origin in origins)


def test_development_keeps_local_origins(monkeypatch):
    """Local browser development stays possible outside production."""
    monkeypatch.setattr("app.main.settings.ENVIRONMENT", "development")
    monkeypatch.delenv("SAGE_CORS_ORIGINS", raising=False)
    origins = _cors_origins()

    assert "https://officialoroe-crypto.github.io" in origins
    assert "http://127.0.0.1:8080" in origins
    assert "http://localhost:8080" in origins


def test_production_can_add_a_staging_origin_deliberately(monkeypatch):
    """A production operator opts a staging domain in via env config only."""
    monkeypatch.setattr("app.main.settings.ENVIRONMENT", "production")
    monkeypatch.setenv("SAGE_CORS_ORIGINS", "https://staging.sageone.example")
    origins = _cors_origins()

    assert "https://officialoroe-crypto.github.io" in origins
    assert "https://staging.sageone.example" in origins
    assert not any(origin.startswith("http://localhost") for origin in origins)
