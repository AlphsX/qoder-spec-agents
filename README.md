# 🎯 Checkmate Spec Preview

**An AI-Powered Specification Analysis Tool with Real-Time External Data Integration**

Checkmate Spec Preview is a modern full-stack application that combines Next.js 15 frontend with a Python FastAPI backend, featuring multiple AI model integrations, real-time web search capabilities, cryptocurrency market data, and enhanced chat functionality inspired by Grok.

## 🏗️ Project Architecture

```
/Users/linkalphx/Claude/
├── checkmate-spec-preview/     # Next.js 15 Frontend
│   ├── src/
│   │   ├── app/                # App Router pages
│   │   ├── hooks/              # Custom React hooks
│   │   └── lib/                # API client utilities
│   ├── package.json
│   └── tailwind.config.ts      # TailwindCSS 4.0 config
├── backend/                    # Python FastAPI Backend
│   ├── app/
│   │   ├── auth/               # Authentication system
│   │   ├── chat/               # Enhanced chat service
│   │   ├── external_apis/      # API integrations
│   │   ├── main.py             # FastAPI application
│   │   └── config.py           # Configuration
│   └── requirements.txt
└── SETUP_COMPLETE.md           # Setup documentation
```

## ✨ Key Features

### 🤖 AI Model Integration
- **Multi-Model Support**: OpenAI GPT, Anthropic Claude, and Groq models
- **Streaming Responses**: Real-time AI response generation
- **Enhanced Context**: AI responses enriched with external data
- **Conversation History**: Persistent chat sessions

### 🌐 External API Integrations
- **Brave Search API**: Real-time web search and news
- **Binance API**: Cryptocurrency market data and trends
- **Real-Time Data**: Live market prices and trending information
- **Contextual Responses**: AI answers enhanced with current data

### 🎨 Modern Frontend
- **Next.js 15**: Latest features with App Router
- **TypeScript**: Full type safety
- **TailwindCSS 4.0**: Modern utility-first styling
- **Dark Mode**: HSL gray-1000 based theme system
- **Responsive Design**: Mobile-friendly interface
- **Real-Time UI**: WebSocket integration for live updates

### 🔐 Security & Authentication
- **JWT Authentication**: Secure token-based auth
- **User Management**: Registration and profile management
- **API Key Management**: Secure external API integration
- **CORS Configuration**: Proper cross-origin setup

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.8+ and pip
- API Keys (optional for demo mode):
  - Groq API Key
  - Brave Search API Key
  - Binance API Key
  - OpenAI API Key
  - Anthropic API Key

### 1. Backend Setup (FastAPI)

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env  # Add your API keys

# Start the backend server
python -m app.main
```

**Backend runs at:** `http://localhost:8000`  
**API Docs:** `http://localhost:8000/docs`

### 2. Frontend Setup (Next.js)

```bash
# Navigate to frontend directory
cd checkmate-spec-preview

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local  # Add your API keys

# Start development server
npm run dev
```

**Frontend runs at:** `http://localhost:3000`

## 📋 Environment Configuration

### Backend (.env)
```bash
# AI Model APIs
GROQ_API_KEY=your_groq_api_key
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# External Data APIs
BRAVE_SEARCH_API_KEY=your_brave_search_key
BINANCE_API_KEY=your_binance_key
BINANCE_SECRET_KEY=your_binance_secret

# Application Settings
ENVIRONMENT=development
SECRET_KEY=your_jwt_secret_key
DATABASE_URL=sqlite:///./checkmate.db
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/token` - Login and token generation
- `GET /api/auth/me` - Current user information

### Chat & AI
- `GET /api/chat/models` - Available AI models
- `POST /api/chat/conversations` - Create conversation
- `GET /api/chat/conversations` - User conversations
- `POST /api/chat/conversations/{id}/chat` - Stream AI response
- `WS /api/chat/ws/{id}` - WebSocket chat

### External Data
- `GET /api/external/search` - Web search
- `GET /api/external/search/news` - News search
- `GET /api/external/crypto/market` - Crypto market data
- `GET /api/external/crypto/price/{symbol}` - Crypto price
- `GET /api/external/health` - API health status

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React features
- **TypeScript** - Type safety
- **TailwindCSS 4.0** - Utility-first styling
- **Framer Motion** - Animations
- **Tanstack Query** - Data fetching
- **Zustand** - State management
- **Socket.io Client** - Real-time communication

### Backend
- **FastAPI** - Modern Python web framework
- **Pydantic** - Data validation
- **SQLAlchemy** - Database ORM
- **Uvicorn** - ASGI server
- **aiohttp** - Async HTTP client
- **WebSockets** - Real-time communication
- **JWT** - Authentication

### External APIs
- **Groq** - Ultra-fast AI inference
- **OpenAI** - GPT models
- **Anthropic** - Claude models
- **Brave Search** - Web search and news
- **Binance** - Cryptocurrency data

## 🎨 Design System

### Dark Mode Theme
- **Primary Background**: HSL gray-1000 (hsl(210 11% 6%))
- **Secondary Backgrounds**: gray-950, gray-900
- **Interactive Elements**: gray-850, gray-800
- **Smooth Transitions**: 300ms color transitions
- **System Preference**: Auto-detection with localStorage persistence

### Components
- Modern chat interface inspired by Grok
- Real-time streaming responses
- Loading states and typing indicators
- Responsive design for all screen sizes
- Accessible color contrast ratios

## 🧪 Testing & Validation

### Frontend Tests
```bash
npm run lint          # ESLint validation
npm run build         # TypeScript compilation
npm run type-check    # Type checking
```

### Backend Tests
```bash
pytest                # Run test suite
pytest --cov         # Coverage report
mypy app/            # Type checking
```

### Integration Testing
```bash
# Run validation script
./test_validation.sh
```

## 🚀 Deployment

### Frontend (Vercel)
```bash
npm run build
npm start
```

### Backend (Docker)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 📚 Usage Examples

### Chat with AI Models
```typescript
// Frontend API call
const response = await api.post('/chat/conversations/123/chat', {
  message: "What's the current Bitcoin price?",
  model_id: "groq-llama-3.1-70b"
});
```

### Search Integration
```python
# Backend service
search_results = await brave_search.search("latest AI developments")
crypto_data = await binance_service.get_market_data()
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the API docs at `/docs`
- **Issues**: Report bugs via GitHub Issues
- **Health Check**: Monitor API status at `/health`

---

**Built with ❤️ using Next.js 15, FastAPI, and modern AI technologies**
