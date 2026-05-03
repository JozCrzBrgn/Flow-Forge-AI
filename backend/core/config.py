from functools import lru_cache

from .agent import AiAgentSettings
from .info import ApiInfoSettings
from .cors import CorsSettings
from .security import SecuritySettings


class Settings:
    def __init__(self):
        self.info = ApiInfoSettings()
        self.agent = AiAgentSettings()
        self.cors = CorsSettings()
        self.security = SecuritySettings()


@lru_cache
def get_settings() -> Settings:
    return Settings()
