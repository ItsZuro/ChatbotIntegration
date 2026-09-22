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
    openai_max_output_tokens: int = 1200
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

    assistant_requests_per_minute: int = 4
    assistant_requests_per_day: int = 20
    assistant_global_requests_per_day: int = 60

    audio_requests_per_minute: int = 2
    audio_requests_per_day: int = 5
    audio_global_requests_per_day: int = 15

    realtime_sessions_per_minute: int = 1
    realtime_sessions_per_day: int = 2
    realtime_global_sessions_per_day: int = 6
    

    audit_table_name: str = "utp-assistant-audit"
    
    conversations_table_name: str = (
        "utp-assistant-conversations"
    )

    integrations_table_name: str = (
        "utp-assistant-integrations"
    )
    google_oauth_redirect_uri: str = (
        "http://localhost:8000/"
        "api/integrations/google/callback"
    )

    frontend_base_url: str = (
        "http://localhost:5173"
    )

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

