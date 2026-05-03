import secrets

from passlib.context import CryptContext

print(secrets.token_urlsafe(32))



pwd_context = CryptContext(schemes=["argon2", "pbkdf2_sha256"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """Generate a hash of the password using argon2 or pbkdf2_sha256."""
    return pwd_context.hash(password)


print(get_password_hash("xxxxxxxxxx"))