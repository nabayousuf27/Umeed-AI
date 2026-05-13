import os
from dotenv import load_dotenv
from supabase import create_client

# Load environment variables from .env file
load_dotenv()

# ==============================================================================
# Security Best Practice: Centralized Configuration
# ==============================================================================

# Supabase Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    # Optional: Fail if database is not configured
    # raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")
    pass

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# JWT Configuration
# CRITICAL SECURITY WARNING: Never use a hardcoded or public fallback secret.
# Using a known fallback key allows attackers to forge valid tokens and bypass authentication.
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRATION_HOURS = 24

if not JWT_SECRET_KEY:
    raise RuntimeError(
        "CRITICAL SECURITY ERROR: JWT_SECRET_KEY is not configured. "
        "The application cannot sign or verify tokens securely without a unique secret."
    )

# Admin Credentials
# CRITICAL SECURITY WARNING: Administrative credentials must NEVER be stored in source code.
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")

if not ADMIN_EMAIL or not ADMIN_PASSWORD:
    raise RuntimeError(
        "CRITICAL CONFIGURATION ERROR: Admin credentials are not configured. "
        "Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables to enable administrative access."
    )
