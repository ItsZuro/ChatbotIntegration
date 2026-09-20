from functools import lru_cache

from pydantic_settings import (
    BaseSettings,
    SettingsConfigDict,
)


class Settings(BaseSettings):
    app_name: str = "UTP Assistant API"
    app_version: str = "0.1.0"
    environment: str = "development"

    openai_model: str = "gpt-5.6-luna"
    openai_reasoning_effort: str = "low"

    aws_region: str = "us-east-1"

    openai_secret_id: str = "utp-assistant/openai"

    hubspot_function_name: str = "utp-assistant-hubspot"
    jira_function_name: str = "utp-assistant-jira"
    google_function_name: str = "utp-assistant-google"
    documents_function_name: str = "utp-assistant-documents"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()