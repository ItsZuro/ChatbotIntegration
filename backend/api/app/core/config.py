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
    openai_transcription_model: str = "gpt-transcribe"
    openai_realtime_transcription_model: str = (
        "gpt-live-transcribe"
    )

    aws_region: str = "us-east-1"

    openai_secret_id: str = "utp-assistant/openai"
    jira_secret_id: str = "utp-assistant/jira"
    hubspot_secret_id: str = "utp-assistant/hubspot"
    google_secret_id: str = "utp-assistant/google"
    google_time_zone: str = "America/Lima"


    documents_bucket_name: str = ""
    cognito_user_pool_id: str = ""
    cognito_client_id: str = ""

    usage_table_name: str = "utp-assistant-usage"
    usage_time_zone: str = "America/Lima"

    assistant_requests_per_minute: int = 10
    assistant_requests_per_day: int = 100

    audio_requests_per_minute: int = 5
    audio_requests_per_day: int = 20

    realtime_sessions_per_minute: int = 5
    realtime_sessions_per_day: int = 20
    

    audit_table_name: str = "utp-assistant-audit"
    conversations_table_name: str = "utp-assistant-conversations"

    cors_origins: str = (
        "http://localhost:5173,"
        "http://127.0.0.1:5173"
    )

    @property
    def cors_origins_list(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.cors_origins.split(",")
            if origin.strip()
        ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )




@lru_cache
def get_settings() -> Settings:
    return Settings()