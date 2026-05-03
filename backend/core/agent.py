from pydantic import SecretStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class AiAgentSettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", extra="ignore", case_sensitive=False
    )

    openai_api_key: str
    openai_model: str
    openai_temperature: float

    @field_validator("openai_api_key")
    def validate_api_key(cls, v):
        """Validate basic OpenAI API key format"""
        api_key = v.get_secret_value() if isinstance(v, SecretStr) else v

        if not api_key:
            raise ValueError("OpenAI API key cannot be empty")

        if not api_key.startswith("sk-"):
            raise ValueError('OpenAI API key should start with "sk-"')

        if len(api_key) < 20:  # Typical minimum length
            raise ValueError("OpenAI API key seems too short")

        return v
