from functools import lru_cache

from .agent import AiAgentSettings
from .cors import CorsSettings
from .info import ApiInfoSettings
from .security import SecuritySettings
from .supa import SupaSettings


class Settings:
    def __init__(self):
        self.info = ApiInfoSettings()
        self.agent = AiAgentSettings()
        self.cors = CorsSettings()
        self.security = SecuritySettings()
        self.supa = SupaSettings()


@lru_cache
def get_settings() -> Settings:
    return Settings()
