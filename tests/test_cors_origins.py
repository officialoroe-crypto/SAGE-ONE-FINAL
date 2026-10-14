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
