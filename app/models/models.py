# ==============================================================================
# Database Models (SQLAlchemy)
# ==============================================================================
# This project uses Supabase as the primary database and backend service.
# Data is accessed directly via the Supabase Client SDK in the service layer.
# SQLAlchemy ORM models are intentionally not used to maintain simplicity and
# leverage Supabase's real-time and postgrest features.
# ==============================================================================

# Example structure if migration to SQLAlchemy were needed:
# class Borrower(Base):
#     __tablename__ = "borrowers"
#     ...
