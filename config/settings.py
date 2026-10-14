import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

ENV_FILE = Path(os.getenv("SAGE_ENV_FILE", str(BASE_DIR / ".env")))
# Keep legacy local installs working without making the old Backend folder a
# hidden dependency of the canonical SAGE ONE repository.
if ENV_FILE.exists():
    load_dotenv(ENV_FILE)
else:
    legacy_env = Path("C:/SageOne/Backend/.env")
    if legacy_env.exists():
        load_dotenv(legacy_env)


class Settings:
    APP_NAME = "SAGE ONE"
    ENVIRONMENT = os.getenv("SAGE_ENV", "development")

    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
    CEREBRAS_API_KEY = os.getenv("CEREBRAS_API_KEY")
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
    PAYMENT_PROVIDER = os.getenv("SAGE_PAYMENT_PROVIDER", "").strip()
    PAYMENT_SECRET_KEY = os.getenv("SAGE_PAYMENT_SECRET_KEY", "").strip()

    # Private mode is the default only for development environments. Production
    # deployments must opt in explicitly and never inherit local owner access.
    PRIVATE_MODE = os.getenv(
        "SAGE_PRIVATE_MODE", "true" if ENVIRONMENT == "development" else "false"
    ).strip().lower() in {
        "1", "true", "yes", "on"
    }
    DEVELOPER_MODE = os.getenv(
        "SAGE_DEV_MODE", "true" if PRIVATE_MODE else "false"
    ).strip().lower() in {
        "1", "true", "yes", "on"
    }
    OWNER_AUTH_SUBJECT = os.getenv("SAGE_OWNER_AUTH_SUBJECT")

    MODEL = os.getenv("SAGE_MODEL", "gemini-3.8-flash")
    GROQ_MODEL = os.getenv("SAGE_GROQ_MODEL", "openai/gpt-oss-20b")
    CEREBRAS_MODEL = os.getenv("CEREBRAS_MODEL", "gpt-oss-120b")
    OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434/v1")
    OLLAMA_MODEL = os.getenv("SAGE_OLLAMA_MODEL", "llama3.2:3b")
    ROUTING_MODE = os.getenv("SAGE_ROUTING_MODE", "auto")
    PREFER_LOCAL = os.getenv("SAGE_PREFER_LOCAL", "false").strip().lower() in {
        "1", "true", "yes", "on"
    }


settings = Settings()
