from functools import lru_cache

from .agent import AiAgentSettings
from .info import ApiInfoSettings
from .cors import CorsSettings
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
