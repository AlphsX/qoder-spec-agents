# AI Agent Website Setup - Next.js + TailwindCSS

## Overview

This project aims to build a modern AI Agent website inspired by Grok's interface using Next.js 15 and TailwindCSS. The application will feature a conversational AI interface with real-time chat capabilities, modern UI/UX design, and seamless user experience similar to Grok's platform.

### Core Features
- Real-time AI chat interface
- Multi-model AI integration (GPT, Claude, Grok, Gemini)
- Responsive design with modern aesthetics
- User authentication and session management
- Chat history and conversation management
- Dark/Light theme support
- Real-time typing indicators
- File upload and attachment support

## Technology Stack & Dependencies

### Frontend (JavaScript/TypeScript)
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety and developer experience
- **TailwindCSS** - Utility-first CSS framework

### Backend (Python)
- **FastAPI** - Modern, fast web framework for building APIs
- **Python 3.11+** - Core backend language
- **Pydantic** - Data validation and serialization
- **SQLAlchemy** - Python SQL toolkit and ORM
- **Alembic** - Database migration tool
- **Uvicorn** - ASGI server for FastAPI

### UI Components & Styling
- **TailwindCSS 4.0** - Next-generation CSS framework with new engine
- **Tailwind UI** - Pre-built component library
- **Headless UI** - Unstyled, accessible UI components
- **Lucide React** - Modern icon library
- **Framer Motion** - Animation library

### State Management & Data
- **Zustand** - Lightweight state management
- **React Query/TanStack Query** - Server state management
- **SWR** - Data fetching with caching

### AI Integration (Python Backend)
- **OpenAI Python SDK** - GPT models integration
- **Anthropic SDK** - Claude models integration
- **Groq API** - Ultra-fast AI inference
- **LangChain** - AI application framework
- **Transformers** - Hugging Face model integration
- **Tiktoken** - Token counting and management
- **Asyncio** - Asynchronous AI request handling

### External APIs Integration
- **Brave Search API** - Real-time web search capabilities
- **Binance API** - Cryptocurrency data and trading
- **Alpha Vantage** - Financial market data (backup)
- **CoinGecko API** - Crypto market information

### Database & Storage
- **PostgreSQL** - Primary database
- **Redis** - Caching and real-time data
- **MinIO/S3** - File storage for attachments
- **Vector Database (Pinecone/Weaviate)** - Embeddings storage

### Authentication & Security
- **NextAuth.js** - Frontend authentication
- **JWT** - Token-based authentication
- **FastAPI Security** - Backend authentication middleware
- **Bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API protection

## Backend Architecture (Python)

### FastAPI Project Structure
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry
│   ├── config.py               # Configuration settings
│   ├── dependencies.py         # Dependency injection
│   ├── database.py             # Database configuration
│   ├── auth/
│   │   ├── __init__.py
│   │   ├── router.py           # Authentication routes
│   │   ├── models.py           # User models
│   │   ├── schemas.py          # Pydantic schemas
│   │   └── utils.py            # Auth utilities
│   ├── chat/
│   │   ├── __init__.py
│   │   ├── router.py           # Chat API routes
│   │   ├── models.py           # Chat models
│   │   ├── schemas.py          # Chat schemas
│   │   ├── services.py         # Business logic
│   │   └── ai_integrations.py  # AI model integrations
│   ├── core/
│   │   ├── __init__.py
│   │   ├── security.py         # Security utilities
│   │   ├── middleware.py       # Custom middleware
│   │   └── exceptions.py       # Custom exceptions
│   └── utils/
│       ├── __init__.py
│       ├── logger.py           # Logging configuration
│       └── helpers.py          # Helper functions
├── tests/
│   ├── __init__.py
│   ├── conftest.py             # Test configuration
│   ├── test_auth.py            # Authentication tests
│   └── test_chat.py            # Chat functionality tests
├── alembic/                    # Database migrations
├── requirements.txt            # Python dependencies
├── Dockerfile                  # Container configuration
└── docker-compose.yml          # Development environment
```

### FastAPI Main Application
```python
# app/main.py
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import uvicorn

from app.auth.router import router as auth_router
from app.chat.router import router as chat_router
from app.database import engine, Base
from app.core.middleware import setup_middleware
from app.config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Shutdown
    await engine.dispose()

app = FastAPI(
    title="AI Agent API",
    description="Backend API for AI Agent Website",
    version="1.0.0",
    lifespan=lifespan
)

# Setup middleware
setup_middleware(app)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["authentication"])
app.include_router(chat_router, prefix="/api/chat", tags=["chat"])

@app.get("/")
async def root():
    return {"message": "AI Agent API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True if settings.ENVIRONMENT == "development" else False
    )
```

### Enhanced Chat Service with Multiple APIs
```python
# app/chat/services.py
from typing import List, AsyncGenerator, Dict, Any
import asyncio
import json
import aiohttp
from sqlalchemy.ext.asyncio import AsyncSession
from openai import AsyncOpenAI
from anthropic import AsyncAnthropic
from groq import AsyncGroq
import tiktoken

from app.chat.models import Conversation, Message
from app.chat.schemas import MessageCreate, ChatResponse
from app.config import settings
from app.external_apis.brave_search import BraveSearchService
from app.external_apis.binance import BinanceService

class ChatService:
    def __init__(self):
        self.openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.anthropic_client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
        self.groq_client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        self.brave_search = BraveSearchService(api_key=settings.BRAVE_SEARCH_API_KEY)
        self.binance_service = BinanceService(api_key=settings.BINANCE_API_KEY, secret_key=settings.BINANCE_SECRET_KEY)
        self.encoding = tiktoken.encoding_for_model("gpt-4")
    
    async def create_conversation(self, db: AsyncSession, user_id: str, title: str) -> Conversation:
        conversation = Conversation(
            user_id=user_id,
            title=title
        )
        db.add(conversation)
        await db.commit()
        await db.refresh(conversation)
        return conversation
    
    async def add_message(self, db: AsyncSession, conversation_id: str, message_data: MessageCreate) -> Message:
        message = Message(
            conversation_id=conversation_id,
            content=message_data.content,
            role=message_data.role,
            model_id=message_data.model_id
        )
        db.add(message)
        await db.commit()
        await db.refresh(message)
        return message
    
    async def generate_ai_response(self, 
                                 conversation_id: str,
                                 user_message: str,
                                 model_id: str,
                                 db: AsyncSession) -> AsyncGenerator[str, None]:
        
        # Get conversation history
        conversation = await self.get_conversation_with_messages(db, conversation_id)
        
        # Check if message requires external data
        enhanced_context = await self._get_enhanced_context(user_message)
        
        # Prepare messages for AI with enhanced context
        messages = self._prepare_messages(conversation.messages, user_message, enhanced_context)
        
        # Generate response based on model
        if model_id.startswith("gpt"):
            async for chunk in self._generate_openai_response(messages, model_id):
                yield chunk
        elif model_id.startswith("claude"):
            async for chunk in self._generate_anthropic_response(messages, model_id):
                yield chunk
        elif model_id.startswith("groq") or "llama" in model_id.lower():
            async for chunk in self._generate_groq_response(messages, model_id):
                yield chunk
    
    async def _get_enhanced_context(self, user_message: str) -> Dict[str, Any]:
        """Get additional context from external APIs based on message content"""
        context = {}
        
        # Check if message is about current events or requires web search
        if any(keyword in user_message.lower() for keyword in [
            "latest", "current", "news", "today", "recent", "what's happening", "update"
        ]):
            try:
                search_results = await self.brave_search.search(user_message, count=3)
                context["web_search"] = search_results
            except Exception as e:
                print(f"Web search failed: {e}")
        
        # Check if message is about cryptocurrency or trading
        if any(keyword in user_message.lower() for keyword in [
            "bitcoin", "btc", "ethereum", "eth", "crypto", "cryptocurrency", 
            "binance", "trading", "price", "market", "coin"
        ]):
            try:
                # Get crypto prices and market data
                crypto_data = await self.binance_service.get_market_data()
                context["crypto_data"] = crypto_data
            except Exception as e:
                print(f"Crypto data fetch failed: {e}")
        
        return context
    
    async def _generate_groq_response(self, messages: List[dict], model_id: str) -> AsyncGenerator[str, None]:
        """Generate response using Groq API for ultra-fast inference"""
        try:
            # Map model names to Groq model IDs
            groq_model_map = {
                "groq-llama-3.1-70b": "llama-3.1-70b-versatile",
                "groq-llama-3.1-8b": "llama-3.1-8b-instant",
                "groq-mixtral": "mixtral-8x7b-32768",
                "groq-gemma": "gemma-7b-it"
            }
            
            actual_model = groq_model_map.get(model_id, "llama-3.1-70b-versatile")
            
            stream = await self.groq_client.chat.completions.create(
                model=actual_model,
                messages=messages,
                stream=True,
                temperature=0.7,
                max_tokens=2000,
                top_p=0.9
            )
            
            async for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
                    
        except Exception as e:
            yield f"Error with Groq API: {str(e)}"
    
    async def _generate_openai_response(self, messages: List[dict], model_id: str) -> AsyncGenerator[str, None]:
        try:
            stream = await self.openai_client.chat.completions.create(
                model=model_id,
                messages=messages,
                stream=True,
                temperature=0.7,
                max_tokens=2000
            )
            
            async for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
                    
        except Exception as e:
            yield f"Error: {str(e)}"
    
    async def _generate_anthropic_response(self, messages: List[dict], model_id: str) -> AsyncGenerator[str, None]:
        try:
            # Convert OpenAI format to Anthropic format
            system_message = ""
            anthropic_messages = []
            
            for msg in messages:
                if msg["role"] == "system":
                    system_message = msg["content"]
                else:
                    anthropic_messages.append({
                        "role": msg["role"],
                        "content": msg["content"]
                    })
            
            stream = await self.anthropic_client.messages.create(
                model=model_id,
                system=system_message,
                messages=anthropic_messages,
                stream=True,
                max_tokens=2000
            )
            
            async for chunk in stream:
                if chunk.type == "content_block_delta":
                    yield chunk.delta.text
                    
        except Exception as e:
            yield f"Error: {str(e)}"
    
    def _prepare_messages(self, conversation_messages: List[Message], new_message: str, context: Dict[str, Any]) -> List[dict]:
        """Prepare messages with enhanced context from external APIs"""
        
        # Build system message with context
        system_content = "You are a helpful AI assistant with access to real-time information."
        
        if context.get("web_search"):
            search_info = "\n\nCurrent web search results:\n"
            for result in context["web_search"]:
                search_info += f"- {result.get('title', '')}: {result.get('description', '')}\n"
            system_content += search_info
        
        if context.get("crypto_data"):
            crypto_info = "\n\nCurrent cryptocurrency market data:\n"
            for symbol, data in context["crypto_data"].items():
                crypto_info += f"- {symbol}: ${data.get('price', 'N/A')} (24h change: {data.get('change', 'N/A')}%)\n"
            system_content += crypto_info
        
        messages = [
            {"role": "system", "content": system_content}
        ]
        
        # Add conversation history (limited by token count)
        for msg in conversation_messages[-10:]:  # Last 10 messages
            messages.append({
                "role": msg.role,
                "content": msg.content
            })
        
        # Add new user message
        messages.append({
            "role": "user",
            "content": new_message
        })
        
        return messages
    
    def count_tokens(self, text: str) -> int:
        return len(self.encoding.encode(text))
```

### External API Services

#### Brave Search API Service
```python
# app/external_apis/brave_search.py
import aiohttp
from typing import List, Dict, Any, Optional
from app.config import settings

class BraveSearchService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.search.brave.com/res/v1"
        self.headers = {
            "Accept": "application/json",
            "Accept-Encoding": "gzip",
            "X-Subscription-Token": api_key
        }
    
    async def search(self, query: str, count: int = 10, country: str = "US", 
                    search_lang: str = "en", ui_lang: str = "en-US") -> List[Dict[str, Any]]:
        """Perform web search using Brave Search API"""
        
        params = {
            "q": query,
            "count": count,
            "country": country,
            "search_lang": search_lang,
            "ui_lang": ui_lang,
            "safesearch": "moderate",
            "freshness": "pw"  # Past week for recent results
        }
        
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(
                    f"{self.base_url}/web/search",
                    headers=self.headers,
                    params=params
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self._parse_search_results(data)
                    else:
                        print(f"Brave Search API error: {response.status}")
                        return []
            except Exception as e:
                print(f"Brave Search request failed: {e}")
                return []
    
    async def search_news(self, query: str, count: int = 5) -> List[Dict[str, Any]]:
        """Search for news articles"""
        
        params = {
            "q": query,
            "count": count,
            "freshness": "pd",  # Past day
            "text_decorations": False
        }
        
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(
                    f"{self.base_url}/news/search",
                    headers=self.headers,
                    params=params
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self._parse_news_results(data)
                    else:
                        return []
            except Exception as e:
                print(f"Brave News search failed: {e}")
                return []
    
    def _parse_search_results(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Parse web search results"""
        results = []
        
        if "web" in data and "results" in data["web"]:
            for result in data["web"]["results"]:
                results.append({
                    "title": result.get("title", ""),
                    "description": result.get("description", ""),
                    "url": result.get("url", ""),
                    "published": result.get("age", ""),
                    "source": result.get("profile", {}).get("name", "")
                })
        
        return results
    
    def _parse_news_results(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Parse news search results"""
        results = []
        
        if "results" in data:
            for result in data["results"]:
                results.append({
                    "title": result.get("title", ""),
                    "description": result.get("description", ""),
                    "url": result.get("url", ""),
                    "published": result.get("age", ""),
                    "source": result.get("source", "")
                })
        
        return results
```

#### Binance API Service
```python
# app/external_apis/binance.py
import aiohttp
import hashlib
import hmac
import time
from typing import Dict, Any, List, Optional
from urllib.parse import urlencode
from app.config import settings

class BinanceService:
    def __init__(self, api_key: str, secret_key: str):
        self.api_key = api_key
        self.secret_key = secret_key
        self.base_url = "https://api.binance.com"
        self.headers = {
            "X-MBX-APIKEY": api_key
        }
    
    def _generate_signature(self, query_string: str) -> str:
        """Generate HMAC SHA256 signature for authenticated requests"""
        return hmac.new(
            self.secret_key.encode('utf-8'),
            query_string.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
    
    async def get_market_data(self, symbols: List[str] = None) -> Dict[str, Dict[str, Any]]:
        """Get current market data for cryptocurrencies"""
        
        if symbols is None:
            symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "ADAUSDT", "SOLUSDT"]
        
        async with aiohttp.ClientSession() as session:
            try:
                # Get 24hr ticker statistics for all symbols
                async with session.get(
                    f"{self.base_url}/api/v3/ticker/24hr"
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self._parse_market_data(data, symbols)
                    else:
                        return {}
            except Exception as e:
                print(f"Binance market data request failed: {e}")
                return {}
    
    async def get_price(self, symbol: str) -> Optional[float]:
        """Get current price for a specific symbol"""
        
        params = {"symbol": symbol.upper()}
        
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(
                    f"{self.base_url}/api/v3/ticker/price",
                    params=params
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return float(data["price"])
                    else:
                        return None
            except Exception as e:
                print(f"Binance price request failed: {e}")
                return None
    
    async def get_account_info(self) -> Optional[Dict[str, Any]]:
        """Get account information (requires authenticated request)"""
        
        timestamp = int(time.time() * 1000)
        query_string = f"timestamp={timestamp}"
        signature = self._generate_signature(query_string)
        
        params = {
            "timestamp": timestamp,
            "signature": signature
        }
        
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(
                    f"{self.base_url}/api/v3/account",
                    headers=self.headers,
                    params=params
                ) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        return None
            except Exception as e:
                print(f"Binance account info request failed: {e}")
                return None
    
    async def get_top_gainers_losers(self, limit: int = 10) -> Dict[str, List[Dict[str, Any]]]:
        """Get top gainers and losers in the market"""
        
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(
                    f"{self.base_url}/api/v3/ticker/24hr"
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self._parse_gainers_losers(data, limit)
                    else:
                        return {"gainers": [], "losers": []}
            except Exception as e:
                print(f"Binance gainers/losers request failed: {e}")
                return {"gainers": [], "losers": []}
    
    def _parse_market_data(self, data: List[Dict[str, Any]], symbols: List[str]) -> Dict[str, Dict[str, Any]]:
        """Parse market data for specified symbols"""
        result = {}
        
        for item in data:
            symbol = item["symbol"]
            if symbol in symbols:
                result[symbol] = {
                    "price": float(item["lastPrice"]),
                    "change": float(item["priceChangePercent"]),
                    "volume": float(item["volume"]),
                    "high": float(item["highPrice"]),
                    "low": float(item["lowPrice"]),
                    "open": float(item["openPrice"])
                }
        
        return result
    
    def _parse_gainers_losers(self, data: List[Dict[str, Any]], limit: int) -> Dict[str, List[Dict[str, Any]]]:
        """Parse and sort gainers and losers"""
        
        # Filter USDT pairs and sort by price change percentage
        usdt_pairs = [item for item in data if item["symbol"].endswith("USDT")]
        
        # Sort by price change percentage
        gainers = sorted(
            usdt_pairs, 
            key=lambda x: float(x["priceChangePercent"]), 
            reverse=True
        )[:limit]
        
        losers = sorted(
            usdt_pairs, 
            key=lambda x: float(x["priceChangePercent"])
        )[:limit]
        
        return {
            "gainers": [{
                "symbol": item["symbol"],
                "price": float(item["lastPrice"]),
                "change": float(item["priceChangePercent"])
            } for item in gainers],
            "losers": [{
                "symbol": item["symbol"],
                "price": float(item["lastPrice"]),
                "change": float(item["priceChangePercent"])
            } for item in losers]
        }
```

#### Groq API Configuration
```python
# app/external_apis/groq_config.py
from groq import AsyncGroq
from app.config import settings

class GroqConfig:
    """Configuration for Groq API models"""
    
    AVAILABLE_MODELS = {
        "llama-3.1-70b-versatile": {
            "name": "Llama 3.1 70B",
            "description": "Most capable model for complex reasoning",
            "max_tokens": 8192,
            "context_window": 128000
        },
        "llama-3.1-8b-instant": {
            "name": "Llama 3.1 8B Instant", 
            "description": "Ultra-fast model for quick responses",
            "max_tokens": 8192,
            "context_window": 128000
        },
        "mixtral-8x7b-32768": {
            "name": "Mixtral 8x7B",
            "description": "High-quality multilingual model",
            "max_tokens": 32768,
            "context_window": 32768
        },
        "gemma-7b-it": {
            "name": "Gemma 7B",
            "description": "Google's instruction-tuned model",
            "max_tokens": 8192,
            "context_window": 8192
        }
    }
    
    @classmethod
    def get_model_info(cls, model_id: str) -> dict:
        """Get information about a specific model"""
        return cls.AVAILABLE_MODELS.get(model_id, {})
    
    @classmethod
    def get_available_models(cls) -> list:
        """Get list of all available models"""
        return list(cls.AVAILABLE_MODELS.keys())
```
```python
# app/chat/models.py
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
import enum

Base = declarative_base()

class MessageRole(enum.Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    conversations = relationship("Conversation", back_populates="user")

class Conversation(Base):
    __tablename__ = "conversations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    model_id = Column(String, nullable=False, default="gpt-4")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation")

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content = Column(Text, nullable=False)
    role = Column(Enum(MessageRole), nullable=False)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id"), nullable=False)
    model_id = Column(String, nullable=True)
    token_count = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    conversation = relationship("Conversation", back_populates="messages")
```

### Pydantic Schemas
```python
# app/chat/schemas.py
from pydantic import BaseModel, UUID4
from datetime import datetime
from typing import List, Optional
from enum import Enum

class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"

class MessageBase(BaseModel):
    content: str
    role: MessageRole
    model_id: Optional[str] = None

class MessageCreate(MessageBase):
    pass

class MessageResponse(MessageBase):
    id: UUID4
    conversation_id: UUID4
    created_at: datetime
    
    class Config:
        from_attributes = True

class ConversationBase(BaseModel):
    title: str
    model_id: str = "gpt-4"

class ConversationCreate(ConversationBase):
    pass

class ConversationResponse(ConversationBase):
    id: UUID4
    user_id: UUID4
    created_at: datetime
    updated_at: datetime
    messages: List[MessageResponse] = []
    
    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    message: str
    conversation_id: UUID4
    model_id: str = "gpt-4"

class ChatResponse(BaseModel):
    message_id: UUID4
    content: str
    role: MessageRole
    created_at: datetime
```

### Component Hierarchy

```mermaid
graph TD
    A[App Layout] --> B[Header]
    A --> C[Main Content]
    A --> D[Footer]
    
    B --> E[Navigation]
    B --> F[User Menu]
    B --> G[Theme Toggle]
    
    C --> H[Chat Interface]
    C --> I[Sidebar]
    
    H --> J[Message List]
    H --> K[Input Area]
    H --> L[Typing Indicator]
    
    I --> M[Chat History]
    I --> N[AI Model Selector]
    I --> O[Settings Panel]
    
    J --> P[Message Bubble]
    J --> Q[System Message]
    J --> R[Loading Message]
    
    K --> S[Text Input]
    K --> T[Send Button]
    K --> U[Attachment Button]
    K --> V[Voice Input]
```

### Core Components

#### 1. ChatInterface Component
```typescript
interface ChatInterfaceProps {
  modelId: string;
  sessionId: string;
  initialMessages?: Message[];
}
```

**Props/State Management:**
- `messages`: Array of conversation messages
- `isLoading`: Boolean for API call state
- `selectedModel`: Current AI model selection
- `userInput`: Current input text
- `attachments`: File attachments array

**Lifecycle Methods/Hooks:**
- `useChat`: Custom hook for chat functionality
- `useMessages`: Message state management
- `useAutoScroll`: Auto-scroll to latest message
- `useTypingIndicator`: Real-time typing status

#### 2. MessageBubble Component
```typescript
interface MessageBubbleProps {
  message: Message;
  isUser: boolean;
  isStreaming?: boolean;
  timestamp: Date;
}
```

#### 3. Enhanced ModelSelector Component with External APIs
```typescript
interface ModelSelectorProps {
  selectedModel: AIModel;
  onModelChange: (model: AIModel) => void;
  availableModels: AIModel[];
  showCapabilities?: boolean;
}

interface AIModel {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'groq' | 'google';
  description: string;
  capabilities: string[];
  maxTokens: number;
  speed: 'fast' | 'medium' | 'slow';
  cost: 'low' | 'medium' | 'high';
}

const ModelSelector = ({ selectedModel, onModelChange, availableModels, showCapabilities = true }: ModelSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProvider, setFilterProvider] = useState<string>('all');
  
  const filteredModels = availableModels.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         model.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProvider = filterProvider === 'all' || model.provider === filterProvider;
    return matchesSearch && matchesProvider;
  });
  
  const getProviderColor = (provider: string) => {
    const colors = {
      openai: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200',
      anthropic: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200',
      groq: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200',
      google: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200'
    };
    return colors[provider] || 'bg-gray-100 text-gray-800';
  };
  
  const getSpeedIcon = (speed: string) => {
    switch (speed) {
      case 'fast': return <Zap className="w-4 h-4 text-green-500" />;
      case 'medium': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'slow': return <Turtle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };
  
  return (
    <div className="@container space-y-4">
      {/* Search and Filter */}
      <div className="flex gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search models..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterProvider}
          onChange={(e) => setFilterProvider(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="all">All Providers</option>
          <option value="openai">OpenAI</option>
          <option value="anthropic">Anthropic</option>
          <option value="groq">Groq</option>
          <option value="google">Google</option>
        </select>
      </div>
      
      {/* Model List */}
      <div className="@container space-y-2 max-h-96 overflow-y-auto">
        {filteredModels.map((model) => (
          <div
            key={model.id}
            onClick={() => onModelChange(model)}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedModel.id === model.id
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {model.name}
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${getProviderColor(model.provider)}`}>
                    {model.provider}
                  </span>
                  {getSpeedIcon(model.speed)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {model.description}
                </p>
                
                {showCapabilities && (
                  <div className="flex flex-wrap gap-1">
                    {model.capabilities.map((capability) => (
                      <span
                        key={capability}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                      >
                        {capability}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="ml-3 text-right">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {model.maxTokens.toLocaleString()} tokens
                </div>
                <div className={`text-xs ${
                  model.cost === 'low' ? 'text-green-600' :
                  model.cost === 'medium' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {model.cost} cost
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredModels.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No models found matching your criteria
        </div>
      )}
    </div>
  );
};

// Example usage with model data
const AVAILABLE_MODELS: AIModel[] = [
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    description: 'Most capable GPT-4 model with latest training data',
    capabilities: ['reasoning', 'code', 'analysis', 'creative'],
    maxTokens: 128000,
    speed: 'medium',
    cost: 'high'
  },
  {
    id: 'llama-3.1-70b-versatile',
    name: 'Llama 3.1 70B',
    provider: 'groq',
    description: 'Ultra-fast inference with Groq LPUs',
    capabilities: ['reasoning', 'code', 'analysis', 'multilingual'],
    maxTokens: 128000,
    speed: 'fast',
    cost: 'low'
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    description: 'Balanced model for most tasks',
    capabilities: ['reasoning', 'analysis', 'creative', 'safe'],
    maxTokens: 200000,
    speed: 'medium',
    cost: 'medium'
  }
];
```

#### 4. ChatSidebar Component
```typescript
interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversationId: string;
  onConversationSelect: (id: string) => void;
  onNewConversation: () => void;
}
```

### Component Usage Examples

```typescript
// Main Chat Page with TailwindCSS 4.0 Container Queries
export default function ChatPage() {
  return (
    <div className="@container flex h-screen bg-gray-50 dark:bg-gray-900">
      <ChatSidebar 
        className="@lg:w-80 @md:w-64 w-full @lg:relative @lg:translate-x-0 absolute inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out"
        conversations={conversations}
        activeConversationId={activeId}
        onConversationSelect={handleSelectConversation}
        onNewConversation={handleNewConversation}
      />
      <div className="@container flex flex-1 flex-col">
        <ChatHeader className="@md:px-6 px-4 py-3 border-b border-gray-200 dark:border-gray-700" />
        <ChatInterface 
          className="@container flex-1 @md:p-6 p-4"
          modelId={selectedModel}
          sessionId={activeConversationId}
        />
      </div>
    </div>
  );
}

// Enhanced MessageBubble with TailwindCSS 4.0 features
const MessageBubble = ({ message, isUser, isStreaming }: MessageBubbleProps) => {
  return (
    <div className={`@container group relative mb-4 animate-message-appear ${
      isUser ? 'ml-auto max-w-[85%]' : 'mr-auto max-w-[85%]'
    }`}>
      <div className={`relative px-4 py-3 ${
        isUser 
          ? 'bg-primary-500 text-white rounded-2xl rounded-br-md'
          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl rounded-bl-md border border-gray-200 dark:border-gray-700'
      } shadow-sm hover:shadow-md transition-shadow duration-200`}>
        <p className="@sm:text-base text-sm leading-relaxed">
          {message.content}
        </p>
        {isStreaming && (
          <div className="flex items-center mt-2 space-x-1">
            <div className="w-2 h-2 bg-current rounded-full animate-typing-dots" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-current rounded-full animate-typing-dots" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-current rounded-full animate-typing-dots" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>
      <time className="@sm:block hidden text-xs text-gray-500 dark:text-gray-400 mt-1 group-hover:opacity-100 opacity-0 transition-opacity duration-200">
        {formatTime(message.timestamp)}
      </time>
    </div>
  );
};
```

## Routing & Navigation

### App Router Structure
```
app/
├── layout.tsx                 # Root layout with providers
├── page.tsx                   # Landing page
├── chat/
│   ├── layout.tsx            # Chat layout with sidebar
│   ├── page.tsx              # Main chat interface
│   └── [sessionId]/
│       └── page.tsx          # Specific conversation
├── auth/
│   ├── signin/
│   │   └── page.tsx          # Sign in page
│   └── signup/
│       └── page.tsx          # Sign up page
├── settings/
│   └── page.tsx              # User settings
└── api/
    ├── auth/
    │   └── [...nextauth]/
    │       └── route.ts      # NextAuth configuration
    ├── chat/
    │   ├── route.ts          # Chat API endpoint
    │   └── stream/
    │       └── route.ts      # Streaming chat endpoint
    └── models/
        └── route.ts          # Available AI models
```

### Navigation Patterns
- **Protected Routes**: Chat interface requires authentication
- **Dynamic Routing**: Individual chat sessions with unique URLs
- **Nested Layouts**: Consistent sidebar in chat area
- **Middleware**: Authentication and route protection

## Styling Strategy

### TailwindCSS 4.0 Configuration
```javascript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
        gray: {
          50: '#f9fafb',
          900: '#111827',
        }
      },
      animation: {
        'typing': 'typing 1.5s infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        typing: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        }
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
      },
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/container-queries'),
  ]
}

export default config
```

### TailwindCSS 4.0 Features Integration

#### New CSS Variables System
```css
/* app/globals.css */
@import 'tailwindcss';

@theme {
  --color-primary-50: #f0f9ff;
  --color-primary-500: #3b82f6;
  --color-primary-900: #1e3a8a;
  
  --color-chat-user: #3b82f6;
  --color-chat-ai: #6b7280;
  --color-chat-system: #10b981;
  
  --spacing-chat-bubble: 1rem;
  --border-radius-chat: 1.5rem;
  
  --animation-typing: typing 1.5s infinite;
  --animation-fade-in: fadeIn 0.5s ease-in-out;
}

/* Dark mode variables */
@media (prefers-color-scheme: dark) {
  @theme {
    --color-chat-ai: #374151;
    --color-background: #111827;
    --color-surface: #1f2937;
  }
}
```

#### Enhanced Container Queries
```typescript
// Modern responsive chat layout with container queries
const ChatInterface = () => {
  return (
    <div className="@container h-full">
      <div className="@lg:grid @lg:grid-cols-[300px_1fr] h-full">
        <aside className="@lg:block hidden bg-gray-50 dark:bg-gray-900">
          {/* Sidebar content */}
        </aside>
        <main className="@container flex flex-col">
          <div className="@md:px-6 @sm:px-4 px-2">
            {/* Chat messages */}
          </div>
        </main>
      </div>
    </div>
  );
};
```

### Grok-Inspired Design System with TailwindCSS 4.0
- **Color Palette**: Deep blacks, electric blues, neon accents inspired by Grok's aesthetic
- **Typography**: Modern sans-serif with sharp, clean lines
- **Spacing**: Generous whitespace with precise geometric layouts
- **Border Radius**: Smooth, rounded corners with subtle variations
- **Shadows**: Dramatic depth with layered shadow systems
- **Animations**: Fluid, purposeful micro-interactions with easing curves
- **Dark Mode**: Primary interface with optional light mode

#### Grok-Style Color System
```css
/* Grok-inspired color palette */
@theme {
  /* Primary Colors */
  --color-grok-black: #0a0a0a;
  --color-grok-dark: #1a1a1a;
  --color-grok-gray: #2a2a2a;
  --color-grok-light-gray: #3a3a3a;
  
  /* Accent Colors */
  --color-grok-blue: #1d9bf0;
  --color-grok-electric: #00d9ff;
  --color-grok-neon: #00ff94;
  --color-grok-purple: #7856ff;
  
  /* Status Colors */
  --color-grok-success: #00d084;
  --color-grok-warning: #ffb800;
  --color-grok-error: #ff4757;
  
  /* Chat Colors */
  --color-grok-user-bg: #1d9bf0;
  --color-grok-ai-bg: #2a2a2a;
  --color-grok-system-bg: #1a1a1a;
  
  /* Animation Variables */
  --animation-grok-fade: fadeInGrok 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --animation-grok-slide: slideInGrok 0.8s cubic-bezier(0.19, 1, 0.22, 1);
  --animation-grok-bounce: bounceInGrok 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --animation-grok-pulse: pulseGrok 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  --animation-grok-typing: typingGrok 1.4s ease-in-out infinite;
  
  /* Gradient Backgrounds */
  --gradient-grok-primary: linear-gradient(135deg, #1d9bf0 0%, #00d9ff 100%);
  --gradient-grok-accent: linear-gradient(135deg, #7856ff 0%, #00ff94 100%);
  --gradient-grok-dark: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
}

/* Dark mode overrides (Grok's primary theme) */
@media (prefers-color-scheme: dark) {
  @theme {
    --color-background: var(--color-grok-black);
    --color-surface: var(--color-grok-dark);
    --color-surface-elevated: var(--color-grok-gray);
    --color-primary: var(--color-grok-blue);
    --color-accent: var(--color-grok-electric);
    --color-text-primary: #ffffff;
    --color-text-secondary: #a0a0a0;
    --color-text-muted: #6a6a6a;
  }
}
```

#### Grok-Style Animations
```css
/* Grok-inspired keyframe animations */
@keyframes fadeInGrok {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes slideInGrok {
  0% {
    opacity: 0;
    transform: translateX(-30px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes bounceInGrok {
  0% {
    opacity: 0;
    transform: scale(0.3) translateY(-50px);
  }
  50% {
    opacity: 1;
    transform: scale(1.05) translateY(-10px);
  }
  70% {
    transform: scale(0.95) translateY(0);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes pulseGrok {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(29, 155, 240, 0.7);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.02);
    box-shadow: 0 0 0 10px rgba(29, 155, 240, 0);
  }
}

@keyframes typingGrok {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

@keyframes shimmerGrok {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

@keyframes glowGrok {
  0%, 100% {
    text-shadow: 0 0 5px rgba(29, 155, 240, 0.5), 0 0 10px rgba(29, 155, 240, 0.3);
  }
  50% {
    text-shadow: 0 0 10px rgba(29, 155, 240, 0.8), 0 0 20px rgba(29, 155, 240, 0.5), 0 0 30px rgba(29, 155, 240, 0.3);
  }
}

/* Utility classes for Grok animations */
.animate-grok-fade-in {
  animation: var(--animation-grok-fade);
}

.animate-grok-slide-in {
  animation: var(--animation-grok-slide);
}

.animate-grok-bounce-in {
  animation: var(--animation-grok-bounce);
}

.animate-grok-pulse {
  animation: var(--animation-grok-pulse);
}

.animate-grok-typing {
  animation: var(--animation-grok-typing);
}

.animate-grok-shimmer {
  background: linear-gradient(
    90deg,
    transparent,
    rgba(29, 155, 240, 0.1),
    transparent
  );
  background-size: 200px 100%;
  animation: shimmerGrok 2s infinite;
}

.animate-grok-glow {
  animation: glowGrok 3s ease-in-out infinite;
}

/* Hover effects */
.grok-hover-lift {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.grok-hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(29, 155, 240, 0.1);
}

.grok-hover-glow {
  transition: all 0.3s ease;
}

.grok-hover-glow:hover {
  box-shadow: 0 0 20px rgba(29, 155, 240, 0.3), 0 0 40px rgba(29, 155, 240, 0.1);
  border-color: var(--color-grok-blue);
}
```

### Component Styling Patterns with TailwindCSS 4.0
```typescript
// Enhanced utility classes with TailwindCSS 4.0 features
const styles = {
  messageBubble: {
    user: "bg-primary-500 text-white rounded-2xl rounded-br-md shadow-sm animate-fade-in",
    ai: "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl rounded-bl-md shadow-sm animate-fade-in",
    system: "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-xl text-sm",
  },
  input: "w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200",
  button: {
    primary: "bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md",
    secondary: "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg font-medium transition-colors duration-200",
    ghost: "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg transition-colors duration-200",
  },
  card: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm",
  container: "@container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
}

// TailwindCSS 4.0 Component Classes
const components = {
  chatMessage: {
    base: "group relative max-w-[85%] mb-4 animate-fade-in",
    user: "ml-auto",
    ai: "mr-auto",
  },
  typingIndicator: "flex items-center space-x-1 text-gray-500 dark:text-gray-400 animate-pulse-slow",
  sidebar: "@container h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700",
  chatInput: "@container flex items-end space-x-2 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700",
}
```

### Advanced Animations with TailwindCSS 4.0
```css
/* Enhanced animations for better UX */
@keyframes message-appear {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes typing-dots {
  0%, 60%, 100% {
    transform: initial;
  }
  30% {
    transform: translateY(-10px);
  }
}

@keyframes gradient-shift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.animate-message-appear {
  animation: message-appear 0.4s ease-out;
}

.animate-typing-dots {
  animation: typing-dots 1.4s infinite ease-in-out;
}

.animate-gradient {
  background: linear-gradient(-45deg, #3b82f6, #8b5cf6, #06b6d4, #10b981);
  background-size: 400% 400%;
  animation: gradient-shift 3s ease infinite;
}
```

## State Management

### Zustand Store Structure
```typescript
interface ChatStore {
  // State
  conversations: Conversation[];
  activeConversationId: string | null;
  selectedModel: AIModel;
  isTyping: boolean;
  
  // Actions
  createConversation: () => void;
  selectConversation: (id: string) => void;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  setSelectedModel: (model: AIModel) => void;
  setTypingStatus: (status: boolean) => void;
}

interface UIStore {
  // State
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  settingsOpen: boolean;
  
  // Actions
  toggleTheme: () => void;
  toggleSidebar: () => void;
  toggleSettings: () => void;
}
```

### React Query for Server State
```typescript
// Chat queries
const useChatHistory = (userId: string) => {
  return useQuery({
    queryKey: ['chatHistory', userId],
    queryFn: () => fetchChatHistory(userId),
  });
};

const useSendMessage = () => {
  return useMutation({
    mutationFn: sendMessage,
    onSuccess: (data) => {
      // Update local state
      queryClient.invalidateQueries(['chatHistory']);
    }
  });
};
```

## API Integration Layer (JavaScript ↔ Python)

### Frontend API Client (JavaScript/TypeScript)
```typescript
// lib/api-client.ts
class APIClient {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  }

  setAuthToken(token: string) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Authentication methods
  async login(email: string, password: string) {
    return this.request<{ access_token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: RegisterData) {
    return this.request<{ access_token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Chat methods
  async getConversations(userId: string) {
    return this.request<Conversation[]>(`/api/chat/conversations?user_id=${userId}`);
  }

  async createConversation(title: string, modelId: string) {
    return this.request<Conversation>('/api/chat/conversations', {
      method: 'POST',
      body: JSON.stringify({ title, model_id: modelId }),
    });
  }

  async sendMessage(conversationId: string, message: string, modelId: string) {
    return this.request<Message>('/api/chat/messages', {
      method: 'POST',
      body: JSON.stringify({
        conversation_id: conversationId,
        content: message,
        role: 'user',
        model_id: modelId,
      }),
    });
  }

  // Streaming chat method
  async *streamChatResponse(conversationId: string, message: string, modelId: string) {
    const response = await fetch(`${this.baseURL}/api/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: JSON.stringify({
        conversation_id: conversationId,
        message,
        model_id: modelId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Stream Error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) return;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;
            
            try {
              const parsed = JSON.parse(data);
              yield parsed.content;
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  // External API methods
  async searchWeb(query: string, count: number = 5) {
    return this.request<{ results: any[]; query: string }>(
      `/api/chat/search?query=${encodeURIComponent(query)}&count=${count}`
    );
  }

  async getCryptoMarket(symbols?: string[]) {
    const params = symbols ? `?symbols=${symbols.join(',')}` : '';
    return this.request<{ market_data: any }>(`/api/chat/crypto/market${params}`);
  }

  async getCryptoGainersLosers(limit: number = 10) {
    return this.request<{ gainers: any[]; losers: any[] }>(
      `/api/chat/crypto/gainers-losers?limit=${limit}`
    );
  }

  async searchNews(query: string, count: number = 5) {
    return this.request<{ articles: any[]; query: string }>(
      `/api/chat/news?query=${encodeURIComponent(query)}&count=${count}`
    );
  }

  async getAvailableModels() {
    return this.request<{ models: any[] }>('/api/chat/models');
  }
}

export const apiClient = new APIClient();
```

### React Hooks for API Integration
```typescript
// hooks/useChat.ts
import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { useChatStore } from '@/store/chat-store';

export const useChat = (conversationId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const { addMessage, updateMessage } = useChatStore();

  const sendMessage = useCallback(async (content: string, modelId: string) => {
    setIsLoading(true);
    
    try {
      // Add user message immediately
      const userMessage = await apiClient.sendMessage(conversationId, content, modelId);
      addMessage(userMessage);

      // Create placeholder for AI response
      const aiMessageId = crypto.randomUUID();
      const aiMessage: Message = {
        id: aiMessageId,
        content: '',
        role: 'assistant',
        conversation_id: conversationId,
        model_id: modelId,
        created_at: new Date(),
      };
      addMessage(aiMessage);

      setIsStreaming(true);
      let fullContent = '';

      // Stream AI response
      for await (const chunk of apiClient.streamChatResponse(conversationId, content, modelId)) {
        fullContent += chunk;
        updateMessage(aiMessageId, { content: fullContent });
      }

    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  }, [conversationId, addMessage, updateMessage]);

  return {
    sendMessage,
    isLoading,
    isStreaming,
  };
};

// hooks/useConversations.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export const useConversations = (userId: string) => {
  return useQuery({
    queryKey: ['conversations', userId],
    queryFn: () => apiClient.getConversations(userId),
    enabled: !!userId,
  });
};

export const useCreateConversation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ title, modelId }: { title: string; modelId: string }) => 
      apiClient.createConversation(title, modelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};
```

### Backend API Routes (Python/FastAPI)
```python
# app/chat/router.py
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import json

from app.dependencies import get_db, get_current_user
from app.auth.models import User
from app.chat.schemas import (
    ConversationCreate, ConversationResponse,
    MessageCreate, MessageResponse,
    ChatRequest
)
from app.chat.services import ChatService

router = APIRouter()
chat_service = ChatService()

@router.get("/conversations", response_model=List[ConversationResponse])
async def get_conversations(
    user_id: str = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all conversations for a user"""
    conversations = await chat_service.get_user_conversations(db, current_user.id)
    return conversations

@router.post("/conversations", response_model=ConversationResponse)
async def create_conversation(
    conversation_data: ConversationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new conversation"""
    conversation = await chat_service.create_conversation(
        db, current_user.id, conversation_data.title
    )
    return conversation

@router.post("/messages", response_model=MessageResponse)
async def send_message(
    message_data: MessageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send a message in a conversation"""
    message = await chat_service.add_message(db, message_data.conversation_id, message_data)
    return message

@router.post("/stream")
async def stream_chat_response(
    chat_request: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Stream AI response for a chat message"""
    
    async def generate_stream():
        try:
            # First, save the user message
            user_message = MessageCreate(
                content=chat_request.message,
                role="user",
                model_id=chat_request.model_id
            )
            await chat_service.add_message(db, chat_request.conversation_id, user_message)
            
            # Generate AI response stream
            full_content = ""
            async for chunk in chat_service.generate_ai_response(
                chat_request.conversation_id,
                chat_request.message,
                chat_request.model_id,
                db
            ):
                full_content += chunk
                
                # Send chunk as Server-Sent Event
                yield f"data: {json.dumps({'content': chunk})}\n\n"
            
            # Save the complete AI response
            ai_message = MessageCreate(
                content=full_content,
                role="assistant",
                model_id=chat_request.model_id
            )
            await chat_service.add_message(db, chat_request.conversation_id, ai_message)
            
            yield "data: [DONE]\n\n"
            
        except Exception as e:
            error_msg = f"Error: {str(e)}"
            yield f"data: {json.dumps({'error': error_msg})}\n\n"
    
    return StreamingResponse(
        generate_stream(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream",
        }
    )

@router.get("/conversations/{conversation_id}/messages", response_model=List[MessageResponse])
async def get_conversation_messages(
    conversation_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all messages in a conversation"""
    messages = await chat_service.get_conversation_messages(db, conversation_id)
    return messages

@router.get("/search")
async def search_web(
    query: str,
    count: int = 5,
    current_user: User = Depends(get_current_user)
):
    """Search the web using Brave Search API"""
    try:
        brave_search = BraveSearchService(api_key=settings.BRAVE_SEARCH_API_KEY)
        results = await brave_search.search(query, count=count)
        return {"results": results, "query": query}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@router.get("/crypto/market")
async def get_crypto_market(
    symbols: List[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Get cryptocurrency market data"""
    try:
        binance_service = BinanceService(
            api_key=settings.BINANCE_API_KEY,
            secret_key=settings.BINANCE_SECRET_KEY
        )
        market_data = await binance_service.get_market_data(symbols)
        return {"market_data": market_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get market data: {str(e)}")

@router.get("/crypto/gainers-losers")
async def get_crypto_gainers_losers(
    limit: int = 10,
    current_user: User = Depends(get_current_user)
):
    """Get top crypto gainers and losers"""
    try:
        binance_service = BinanceService(
            api_key=settings.BINANCE_API_KEY,
            secret_key=settings.BINANCE_SECRET_KEY
        )
        data = await binance_service.get_top_gainers_losers(limit)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get gainers/losers: {str(e)}")

@router.get("/news")
async def search_news(
    query: str,
    count: int = 5,
    current_user: User = Depends(get_current_user)
):
    """Search for news articles"""
    try:
        brave_search = BraveSearchService(api_key=settings.BRAVE_SEARCH_API_KEY)
        results = await brave_search.search_news(query, count=count)
        return {"articles": results, "query": query}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"News search failed: {str(e)}")

@router.get("/models")
async def get_available_models(
    current_user: User = Depends(get_current_user)
):
    """Get list of available AI models"""
    models = [
        {
            "id": "gpt-4-turbo",
            "name": "GPT-4 Turbo",
            "provider": "openai",
            "description": "Most capable GPT-4 model",
            "capabilities": ["reasoning", "code", "analysis", "creative"],
            "maxTokens": 128000,
            "speed": "medium",
            "cost": "high"
        },
        {
            "id": "llama-3.1-70b-versatile",
            "name": "Llama 3.1 70B",
            "provider": "groq",
            "description": "Ultra-fast inference with Groq",
            "capabilities": ["reasoning", "code", "analysis", "multilingual"],
            "maxTokens": 128000,
            "speed": "fast",
            "cost": "low"
        },
        {
            "id": "llama-3.1-8b-instant",
            "name": "Llama 3.1 8B Instant",
            "provider": "groq",
            "description": "Lightning-fast responses",
            "capabilities": ["chat", "quick-answers", "code"],
            "maxTokens": 128000,
            "speed": "fast",
            "cost": "low"
        },
        {
            "id": "claude-3-5-sonnet",
            "name": "Claude 3.5 Sonnet",
            "provider": "anthropic",
            "description": "Balanced and helpful assistant",
            "capabilities": ["reasoning", "analysis", "creative", "safe"],
            "maxTokens": 200000,
            "speed": "medium",
            "cost": "medium"
        }
    ]
    return {"models": models}
```

### Data Models
```typescript
interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  modelId?: string;
  attachments?: Attachment[];
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  modelId: string;
}

interface AIModel {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'xai' | 'google';
  description: string;
  capabilities: string[];
  maxTokens: number;
}
```

## Testing Strategy

### Frontend Testing (JavaScript/TypeScript)

#### Unit Testing Setup
```typescript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/app/$1',
  },
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    '!app/**/*.d.ts',
  ],
};

// Component tests
describe('ChatInterface', () => {
  it('renders messages correctly', () => {
    render(<ChatInterface modelId="gpt-4" sessionId="test" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
  
  it('sends message on form submit', async () => {
    const mockSendMessage = jest.fn();
    render(<ChatInterface onSendMessage={mockSendMessage} />);
    
    await user.type(screen.getByRole('textbox'), 'Hello');
    await user.click(screen.getByRole('button', { name: /send/i }));
    
    expect(mockSendMessage).toHaveBeenCalledWith('Hello');
  });
  
  it('handles streaming responses', async () => {
    const mockStream = jest.fn().mockImplementation(async function* () {
      yield 'Hello';
      yield ' World';
    });
    
    render(<ChatInterface streamResponse={mockStream} />);
    
    await user.type(screen.getByRole('textbox'), 'Test');
    await user.click(screen.getByRole('button', { name: /send/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });
  });
});
```

#### API Client Testing
```typescript
// __tests__/api-client.test.ts
import { apiClient } from '@/lib/api-client';
import { server } from '@/mocks/server';

describe('APIClient', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
  
  it('sends chat message successfully', async () => {
    const response = await apiClient.sendMessage('conv-123', 'Hello', 'gpt-4');
    
    expect(response).toEqual({
      id: expect.any(String),
      content: 'Hello',
      role: 'user',
      conversation_id: 'conv-123'
    });
  });
  
  it('handles streaming responses', async () => {
    const chunks: string[] = [];
    
    for await (const chunk of apiClient.streamChatResponse('conv-123', 'Hello', 'gpt-4')) {
      chunks.push(chunk);
    }
    
    expect(chunks).toEqual(['Hello', ' there!']);
  });
});
```

### Backend Testing (Python)

#### Test Configuration
```python
# tests/conftest.py
import pytest
import asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import get_db, Base
from app.config import settings

# Test database
TEST_DATABASE_URL = "sqlite+aiosqlite:///./test.db"

engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

async def override_get_db():
    async with AsyncSession(engine) as session:
        yield session

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session")
async def setup_database():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.fixture
async def client(setup_database):
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.fixture
async def auth_headers(client: AsyncClient):
    # Create test user and get auth token
    response = await client.post("/api/auth/register", json={
        "email": "test@example.com",
        "password": "testpassword",
        "name": "Test User"
    })
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
```

#### API Testing
```python
# tests/test_chat.py
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_conversation(client: AsyncClient, auth_headers):
    response = await client.post(
        "/api/chat/conversations",
        json={"title": "Test Conversation", "model_id": "gpt-4"},
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Conversation"
    assert data["model_id"] == "gpt-4"
    assert "id" in data

@pytest.mark.asyncio
async def test_send_message(client: AsyncClient, auth_headers):
    # First create a conversation
    conv_response = await client.post(
        "/api/chat/conversations",
        json={"title": "Test", "model_id": "gpt-4"},
        headers=auth_headers
    )
    conversation_id = conv_response.json()["id"]
    
    # Send a message
    response = await client.post(
        "/api/chat/messages",
        json={
            "content": "Hello AI",
            "role": "user",
            "conversation_id": conversation_id,
            "model_id": "gpt-4"
        },
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["content"] == "Hello AI"
    assert data["role"] == "user"

@pytest.mark.asyncio
async def test_stream_chat_response(client: AsyncClient, auth_headers):
    # Create conversation
    conv_response = await client.post(
        "/api/chat/conversations",
        json={"title": "Stream Test", "model_id": "gpt-4"},
        headers=auth_headers
    )
    conversation_id = conv_response.json()["id"]
    
    # Test streaming endpoint
    async with client.stream(
        "POST",
        "/api/chat/stream",
        json={
            "message": "Hello",
            "conversation_id": conversation_id,
            "model_id": "gpt-4"
        },
        headers=auth_headers
    ) as response:
        assert response.status_code == 200
        
        chunks = []
        async for chunk in response.aiter_text():
            if chunk.startswith("data: "):
                chunks.append(chunk)
        
        assert len(chunks) > 0
```

#### Service Testing
```python
# tests/test_chat_service.py
import pytest
from unittest.mock import AsyncMock, patch
from sqlalchemy.ext.asyncio import AsyncSession

from app.chat.services import ChatService
from app.chat.schemas import MessageCreate
from app.chat.models import Conversation, Message, MessageRole

@pytest.mark.asyncio
async def test_chat_service_create_conversation():
    # Mock database session
    mock_db = AsyncMock(spec=AsyncSession)
    mock_db.commit = AsyncMock()
    mock_db.refresh = AsyncMock()
    
    chat_service = ChatService()
    
    conversation = await chat_service.create_conversation(
        mock_db, "user-123", "Test Conversation"
    )
    
    assert conversation.title == "Test Conversation"
    assert conversation.user_id == "user-123"
    mock_db.add.assert_called_once()
    mock_db.commit.assert_called_once()

@pytest.mark.asyncio
@patch('app.chat.services.ChatService._generate_openai_response')
async def test_generate_ai_response(mock_openai):
    # Mock the OpenAI response
    mock_openai.return_value = iter(["Hello", " there!"])
    
    mock_db = AsyncMock(spec=AsyncSession)
    chat_service = ChatService()
    
    # Mock conversation with messages
    mock_conversation = AsyncMock()
    mock_conversation.messages = []
    chat_service.get_conversation_with_messages = AsyncMock(return_value=mock_conversation)
    
    chunks = []
    async for chunk in chat_service.generate_ai_response(
        "conv-123", "Hello", "gpt-4", mock_db
    ):
        chunks.append(chunk)
    
    assert chunks == ["Hello", " there!"]
```

### Integration Testing
```python
# tests/test_integration.py
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_complete_chat_flow(client: AsyncClient, auth_headers):
    """Test the complete chat flow from conversation creation to AI response"""
    
    # 1. Create conversation
    conv_response = await client.post(
        "/api/chat/conversations",
        json={"title": "Integration Test", "model_id": "gpt-4"},
        headers=auth_headers
    )
    assert conv_response.status_code == 200
    conversation_id = conv_response.json()["id"]
    
    # 2. Send user message
    msg_response = await client.post(
        "/api/chat/messages",
        json={
            "content": "What is AI?",
            "role": "user",
            "conversation_id": conversation_id,
            "model_id": "gpt-4"
        },
        headers=auth_headers
    )
    assert msg_response.status_code == 200
    
    # 3. Get conversation messages
    messages_response = await client.get(
        f"/api/chat/conversations/{conversation_id}/messages",
        headers=auth_headers
    )
    assert messages_response.status_code == 200
    messages = messages_response.json()
    assert len(messages) >= 1
    assert messages[0]["content"] == "What is AI?"
    
    # 4. Test streaming response
    async with client.stream(
        "POST",
        "/api/chat/stream",
        json={
            "message": "Explain more",
            "conversation_id": conversation_id,
            "model_id": "gpt-4"
        },
        headers=auth_headers
    ) as stream_response:
        assert stream_response.status_code == 200
        
        received_data = False
        async for chunk in stream_response.aiter_text():
            if chunk.startswith("data: ") and "content" in chunk:
                received_data = True
                break
        
        assert received_data
```

### Performance Testing
```python
# tests/test_performance.py
import pytest
import asyncio
import time
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_concurrent_chat_requests(client: AsyncClient, auth_headers):
    """Test system performance under concurrent chat requests"""
    
    # Create a conversation
    conv_response = await client.post(
        "/api/chat/conversations",
        json={"title": "Load Test", "model_id": "gpt-4"},
        headers=auth_headers
    )
    conversation_id = conv_response.json()["id"]
    
    async def send_message(message_num: int):
        start_time = time.time()
        response = await client.post(
            "/api/chat/messages",
            json={
                "content": f"Message {message_num}",
                "role": "user",
                "conversation_id": conversation_id,
                "model_id": "gpt-4"
            },
            headers=auth_headers
        )
        end_time = time.time()
        return response.status_code, end_time - start_time
    
    # Send 10 concurrent messages
    tasks = [send_message(i) for i in range(10)]
    results = await asyncio.gather(*tasks)
    
    # All requests should succeed
    for status_code, duration in results:
        assert status_code == 200
        assert duration < 5.0  # Should complete within 5 seconds
```

## Authentication & Security

### NextAuth.js Configuration
```typescript
// app/api/auth/[...nextauth]/route.ts
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub,
      },
    }),
  },
};
```

### Route Protection
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  
  if (request.nextUrl.pathname.startsWith('/chat')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
  }
  
  return NextResponse.next();
}
```

### Package.json Dependencies for TailwindCSS 4.0
```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "typescript": "^5.3.0"
  },
  "devDependencies": {
    "tailwindcss": "^4.0.0",
    "@tailwindcss/forms": "^0.5.7",
    "@tailwindcss/typography": "^0.5.10",
    "@tailwindcss/container-queries": "^0.1.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  }
}
```

### PostCSS Configuration for TailwindCSS 4.0
```javascript
// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### Code Splitting & Lazy Loading
```typescript
// Lazy load heavy components
const ChatInterface = lazy(() => import('@/components/ChatInterface'));
const SettingsPanel = lazy(() => import('@/components/SettingsPanel'));

// Route-based code splitting is automatic with App Router
```

### Streaming & Real-time Updates
```typescript
// Server-Sent Events for real-time chat
const useChatStream = (sessionId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  
  useEffect(() => {
    const eventSource = new EventSource(`/api/chat/stream/${sessionId}`);
    
    eventSource.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(prev => [...prev, message]);
    };
    
    return () => eventSource.close();
  }, [sessionId]);
  
  return messages;
};
```

### Caching Strategy
```typescript
// React Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

// SWR for real-time data
const { data: messages } = useSWR(
  `/api/chat/${sessionId}`,
  fetcher,
  { refreshInterval: 1000 }
);
```

## Database Schema

### Prisma Schema
```prisma
model User {
  id            String         @id @default(cuid())
  email         String         @unique
  name          String?
  image         String?
  conversations Conversation[]
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}

model Conversation {
  id        String    @id @default(cuid())
  title     String
  userId    String
  user      User      @relation(fields: [userId], references: [id])
  messages  Message[]
  modelId   String
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Message {
  id             String       @id @default(cuid())
  content        String
  role           Role
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id])
  attachments    Attachment[]
  createdAt      DateTime     @default(now())
}

enum Role {
  USER
  ASSISTANT
  SYSTEM
}
```

## Deployment Configuration

### Frontend Deployment (Vercel)
```json
// vercel.json
{
  "name": "ai-agent-frontend",
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "env": {
    "NEXT_PUBLIC_API_URL": "@api-url",
    "NEXTAUTH_URL": "@nextauth-url",
    "NEXTAUTH_SECRET": "@nextauth-secret",
    "GOOGLE_CLIENT_ID": "@google-client-id",
    "GOOGLE_CLIENT_SECRET": "@google-client-secret"
  },
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 60
    }
  }
}
```

### Backend Deployment (Python/FastAPI)

#### Docker Configuration
```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd --create-home --shell /bin/bash app \
    && chown -R app:app /app
USER app

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Docker Compose for Development
```yaml
# docker-compose.yml
version: '3.8'

services:
  # Frontend (Next.js)
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - backend

  # Backend (FastAPI)
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/aiagent
      - REDIS_URL=redis://redis:6379
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    volumes:
      - ./backend:/app
    depends_on:
      - db
      - redis
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  # Database
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=aiagent
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"

  # Redis for caching and sessions
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # Nginx for production
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    profiles:
      - production

volumes:
  postgres_data:
  redis_data:
```

#### Kubernetes Deployment
```yaml
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ai-agent-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ai-agent-backend
  template:
    metadata:
      labels:
        app: ai-agent-backend
    spec:
      containers:
      - name: backend
        image: ai-agent-backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: ai-agent-secrets
              key: database-url
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: ai-agent-secrets
              key: openai-api-key
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: ai-agent-backend-service
spec:
  selector:
    app: ai-agent-backend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8000
  type: ClusterIP
```

### Environment Variables

#### Frontend (.env.local)
```bash
# Next.js Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_ID=your-github-id
GITHUB_SECRET=your-github-secret

# Analytics (optional)
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

#### Backend (.env)
```bash
# Python/FastAPI Environment Variables
ENVIRONMENT=development
DEBUG=True

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/aiagent
REDIS_URL=redis://localhost:6379

# AI APIs
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GROQ_API_KEY=gsk_...

# External APIs
BRAVE_SEARCH_API_KEY=BSA...
BINANCE_API_KEY=your-binance-api-key
BINANCE_SECRET_KEY=your-binance-secret-key

# Optional External APIs
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-key
COINGECKO_API_KEY=your-coingecko-key

# Security
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com

# Logging
LOG_LEVEL=INFO
LOG_FILE=logs/app.log

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60
RATE_LIMIT_BURST=10

# External API Rate Limits
BRAVE_SEARCH_RATE_LIMIT=100  # requests per hour
BINANCE_RATE_LIMIT=1200  # requests per minute
GROQ_RATE_LIMIT=30  # requests per minute

# File Upload
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_DIR=uploads/

# Features
ENABLE_WEB_SEARCH=true
ENABLE_CRYPTO_DATA=true
ENABLE_NEWS_SEARCH=true
```

### Production Deployment Script
```bash
#!/bin/bash
# deploy.sh

set -e

echo "Starting deployment..."

# Build and push backend Docker image
echo "Building backend..."
cd backend
docker build -t ai-agent-backend:latest .
docker tag ai-agent-backend:latest your-registry/ai-agent-backend:latest
docker push your-registry/ai-agent-backend:latest
cd ..

# Deploy frontend to Vercel
echo "Deploying frontend..."
cd frontend
npm run build
vercel --prod
cd ..

# Update Kubernetes deployment
echo "Updating Kubernetes deployment..."
kubectl set image deployment/ai-agent-backend backend=your-registry/ai-agent-backend:latest
kubectl rollout status deployment/ai-agent-backend

# Run database migrations
echo "Running database migrations..."
kubectl exec -it deployment/ai-agent-backend -- alembic upgrade head

echo "Deployment completed successfully!"
```

### Monitoring and Logging
```python
# app/utils/logger.py
import logging
import sys
from pathlib import Path
from app.config import settings

def setup_logging():
    # Create logs directory if it doesn't exist
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    # Configure logging
    logging.basicConfig(
        level=getattr(logging, settings.LOG_LEVEL),
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[
            logging.FileHandler(settings.LOG_FILE),
            logging.StreamHandler(sys.stdout)
        ]
    )
    
    # Set up specific loggers
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    
    return logging.getLogger(__name__)

# app/core/middleware.py
from fastapi import Request, Response
from fastapi.middleware.base import BaseHTTPMiddleware
import time
import logging

logger = logging.getLogger(__name__)

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Log request
        logger.info(f"Request: {request.method} {request.url}")
        
        response = await call_next(request)
        
        # Log response
        process_time = time.time() - start_time
        logger.info(
            f"Response: {response.status_code} - {process_time:.3f}s"
        )
        
        return response
```