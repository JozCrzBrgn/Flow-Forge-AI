from pydantic_settings import BaseSettings, SettingsConfigDict


class SupaSettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_prefix="SB_", extra="ignore"
    )

    url: str
    key: str
    users_table: str