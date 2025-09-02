from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from contextlib import asynccontextmanager
import asyncio
from app.config import settings

# For development, use SQLite
DATABASE_URL = "sqlite+aiosqlite:///./checkmate_spec_preview.db"

# Create async engine
engine = create_async_engine(
    DATABASE_URL,
    echo=True if settings.DEBUG else False,
    future=True
)

# Create async session factory
AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

# Dependency to get database session
async def get_database_session() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

@asynccontextmanager
async def get_db_context():
    """Context manager for database operations"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def create_tables():
    """Create all database tables"""
    from app.chat.models import Base
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Database tables created successfully")

async def init_database():
    """Initialize database with default data"""
    from app.chat.models import SystemSettings, User
    from app.auth.router import get_password_hash
    
    async with get_db_context() as session:
        # Create default system settings
        default_settings = [
            {
                "setting_key": "max_tokens_per_request", 
                "setting_value": {"value": 2000},
                "description": "Maximum tokens allowed per AI request"
            },
            {
                "setting_key": "rate_limit_per_minute",
                "setting_value": {"value": 60},
                "description": "API requests per minute per user"
            },
            {
                "setting_key": "external_apis_enabled",
                "setting_value": {
                    "brave_search": True,
                    "binance": True,
                    "groq": True
                },
                "description": "Enabled external APIs"
            },
            {
                "setting_key": "default_ai_model",
                "setting_value": {"value": "groq-llama-3.1-70b"},
                "description": "Default AI model for new users"
            }
        ]
        
        for setting in default_settings:
            db_setting = SystemSettings(**setting)
            session.add(db_setting)
        
        # Create demo user
        demo_user = User(
            email="demo@checkmate-spec-preview.com",
            username="demo",
            hashed_password=get_password_hash("demo123"),
            preferred_model="groq-llama-3.1-70b",
            is_active=True
        )
        session.add(demo_user)
        
        await session.commit()
        print("✅ Database initialized with default data")

async def setup_database():
    """Complete database setup"""
    print("🔧 Setting up database...")
    await create_tables()
    await init_database()
    print("✅ Database setup complete!")

if __name__ == "__main__":
    asyncio.run(setup_database())