# AI Chat Application - Development Guide

## Project Overview
Building a simple, educational AI chat application with React frontend and Python FastAPI backend that integrates with Google Gemini API.

## Core Principles
- **Absolute Simplicity**: No fancy features, no memory/history, no tools, no RAG
- **Complete Understanding**: Every line of code is heavily commented and explained
- **Educational Focus**: Learning how to interact with LLM APIs directly
- **Staged Development**: Each feature is committed with clean git history

## Tech Stack
- **Frontend**: React 18 + TypeScript with Vite, shadcn/ui components
- **Backend**: FastAPI with professional architecture (routers, services, models)
- **LLM**: Google Gemini API with system prompts and temperature control
- **Styling**: Tailwind CSS (via shadcn/ui) on frontend, CSS modules on backend

## Feature Requirements

### Frontend (React)
1. Professional, attractive UI with dark/light mode toggle
2. Message display area (scrollable, shows user and AI messages)
3. Text input field with send button
4. Loading state while waiting for API response
5. Display any errors gracefully
6. No message history persistence (each refresh starts fresh)

### Backend (FastAPI)
1. Simple API endpoint to receive user messages
2. Call Google Gemini API with the message
3. Return the raw response to frontend
4. Handle CORS properly for React frontend
5. Environment variable for API key management
6. Health check endpoint for testing

### Code Quality
- Heavy comments on EVERY line explaining what it does
- No external styling libraries (vanilla CSS only)
- Minimal dependencies (keep it simple)
- Each stage results in a working feature
- Git commits after each completed stage

## Project Structure

### Backend (Professional Architecture)
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                  # FastAPI app setup, middleware, routes
│   ├── config/
│   │   ├── __init__.py
│   │   └── settings.py          # Configuration, roles, temperature presets
│   ├── models/
│   │   ├── __init__.py
│   │   └── llm_config.py        # LLM configuration data models
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── request.py           # Pydantic request models (validation)
│   │   └── response.py          # Pydantic response models
│   ├── routers/
│   │   ├── __init__.py
│   │   └── chat.py              # Chat API endpoints
│   ├── services/
│   │   ├── __init__.py
│   │   └── llm_service.py       # LLM business logic (core AI functionality)
│   ├── middleware/
│   │   ├── __init__.py
│   │   └── logging_middleware.py # Request/response logging
│   └── utils/
│       ├── __init__.py
│       ├── logging.py           # Logging setup
│       └── validators.py        # Input validation functions
├── main.py                      # Entry point (runs with: python main.py)
├── requirements.txt             # Python dependencies
├── .env                         # Google API key (git ignored)
└── .env.example                 # Template for .env
```

### Frontend (TypeScript + shadcn/ui)
```
frontend/
├── src/
│   ├── pages/                   # Page components
│   ├── components/              # Reusable shadcn/ui components
│   ├── hooks/                   # Custom React hooks
│   ├── services/                # API service layer
│   ├── lib/                     # Utility functions
│   ├── config/                  # Configuration
│   ├── types/                   # TypeScript type definitions
│   ├── styles/                  # Global styles
│   ├── App.tsx                  # Main app component
│   └── main.tsx                 # Entry point
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

### Root Files
```
├── CLAUDE.md                    # This guide
├── PLAN.md                      # Implementation plan (tracked progress)
├── README.md
├── .gitignore
└── .git/
```

## Development Workflow
1. Complete one stage
2. Test that stage works
3. Provide commit message for user to use
4. Move to next stage

## Implementation Stages (See PLAN.md for detailed progress)

### Phase 1: Backend Architecture ✅ STEP 1 COMPLETE
1. ✅ **Step 1**: Backend folder structure, config, models, schemas, routers, services
2. ⏳ **Step 2**: Pydantic models & enhanced schemas
3. ⏳ **Step 3**: LLM configuration system with roles & temperature
4. ⏳ **Step 4**: LLM service layer with advanced features
5. ⏳ **Step 5**: Chat router with enhanced endpoints

### Phase 2: Response Formatting
6. ⏳ **Step 6**: Markdown formatting engine

### Phase 3: Frontend Architecture
7. ⏳ **Step 7**: TypeScript setup & shadcn/ui
8. ⏳ **Step 8**: TypeScript types & models
9. ⏳ **Step 9**: API service layer
10. ⏳ **Step 10**: shadcn/ui component integration
11. ⏳ **Step 11**: Chat page component
12. ⏳ **Step 12**: Markdown renderer component

### Phase 4: Polish & Testing
13. ⏳ **Step 13**: Error handling & user feedback
14. ⏳ **Step 14**: Testing & verification
15. ⏳ **Step 15**: Documentation & cleanup

## Key Architectural Concepts

### Backend Architecture Pattern
The backend uses a **layered architecture pattern** that separates concerns:

1. **Routers** (`routers/chat.py`): Handle HTTP requests/responses
2. **Services** (`services/llm_service.py`): Contain business logic
3. **Models** (`models/`, `schemas/`): Define data structures
4. **Config** (`config/settings.py`): Centralized configuration
5. **Utils** (`utils/`): Shared utilities (logging, validation)
6. **Middleware**: Cross-cutting concerns (logging, CORS)

**Benefits**:
- Easy to test each layer independently
- Clear separation of concerns
- Easy to modify behavior (e.g., add caching, change LLM provider)
- Scalable to larger applications

---

## LLM Concepts Explained

### 1. System Prompts (Role Shaping)
**What**: Instructions that tell the LLM how to behave

**Why**: LLMs follow instructions. By providing a system prompt, we shape:
- Tone and personality
- Expertise level
- Response format
- Ethical guidelines

**Example**:
```python
SYSTEM_PROMPTS[CODER] = "You are an expert programming assistant. 
Help with code, debugging, and technical explanations."
```

When you send: "What's a loop?"
- With CODER prompt: Gets programming explanation with code examples
- With TUTOR prompt: Gets educational explanation with learning steps
- With CREATIVE prompt: Gets creative interpretation of the concept

**In Code**: `config/settings.py` contains all system prompts. `llm_service.py` prepends the prompt to user messages before sending to API.

---

### 2. Temperature (Creativity vs Consistency)
**What**: Controls randomness in token selection (0.0 to 2.0)

**How it Works**:
```
Temperature 0.2 (PRECISE):
- Model picks words with HIGHEST probability only
- Result: Consistent, predictable, factual
- Use for: Code, facts, technical explanations

Temperature 0.7 (BALANCED - default):
- Model has moderate randomness
- Result: Good mix of consistency and creativity
- Use for: General conversations

Temperature 1.0+ (CREATIVE):
- Model picks from wider range of words
- Result: Random, creative, unpredictable
- Use for: Brainstorming, creative writing
```

**Technical Detail**: LLMs generate text token-by-token. At each step:
1. Model calculates probability for all possible next words
2. Temperature adjusts these probabilities:
   - Low temp: Peaks the highest probability (makes it very likely)
   - High temp: Flattens probabilities (more choices equally likely)
3. Select the next token based on adjusted probabilities

**In Code**: `config/settings.py` has `TemperaturePreset` enum. User can choose:
- `precise` = 0.2 (focused)
- `balanced` = 0.7 (default)
- `creative` = 1.0 (random)

Or pass custom float value (0.0-2.0).

---

### 3. Max Tokens (Response Length Control)
**What**: Maximum number of tokens the model can generate

**Why**:
- Control costs (longer responses = more tokens = more expensive)
- Control response length (prevent rambling)
- API limits (some models have max token limits)

**Token Estimation**:
- Roughly 4 characters ≈ 1 token
- "Hello world" = ~3 tokens
- Short paragraph = 50-100 tokens
- Standard response = 500-2000 tokens

**Trade-off**:
```
Low max_tokens (100):
- ✅ Cheaper, faster
- ❌ Response might be cut off mid-sentence

High max_tokens (4000):
- ✅ Complete responses
- ❌ More expensive, slower
```

**In Code**: Default is 1000 tokens. User can specify 100-4000. LLMService sends this to API.

---

### 4. Service Layer Pattern (Why It Matters)
**Problem Without Services**:
```python
# ❌ Everything in router - hard to test, reuse, modify
@app.post("/api/chat")
async def chat(request: ChatRequest):
    genai.configure(api_key=GOOGLE_API_KEY)
    response = genai.GenerativeModel("gemini-pro").generate_content(...)
    return response.text
```

**Solution With Services**:
```python
# ✅ Service handles all LLM logic
class LLMService:
    def generate_response(message, role, temperature, max_tokens):
        # Validation, system prompts, error handling, logging
        
# Router just calls service
@app.post("/api/chat")
async def chat(request: ChatRequest):
    response, metadata = await llm_service.generate_response(...)
    return ChatResponse(response=response, ...)
```

**Benefits**:
- Can test `LLMService` without HTTP
- Can change LLM provider (Google → OpenAI) by modifying only service
- Multiple endpoints can use same service
- Logging and error handling in one place

---

### 5. Pydantic Models (Data Validation)
**What**: Define exact structure of request/response data

**Why**:
- **Security**: Prevents injection attacks, validates all input
- **Type Safety**: Errors caught before they cause bugs
- **Documentation**: Auto-generates API docs
- **Consistency**: All endpoints return same format

**Example**:
```python
class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=5000)
    temperature: Optional[float] = Field(ge=0.0, le=2.0)
```

Validation automatically:
1. Converts JSON to Python object
2. Checks `message` is string with 1-5000 characters
3. Checks `temperature` is float between 0.0-2.0
4. Returns 400 Bad Request if validation fails
5. Provides clear error messages

---

### 6. Pydantic Validation (Type Safety)
**What**: Validates data before it reaches business logic

**Why**:
- **Security**: Prevents injection attacks, malformed requests
- **Fail Fast**: Catches errors before expensive processing
- **Clear Errors**: Provides detailed validation messages
- **Auto-docs**: Generates OpenAPI documentation automatically

**How it Works**:
```python
class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=5000)
    temperature: Optional[float] = Field(ge=0.0, le=2.0)
```

When user sends:
```json
{
  "message": "",
  "temperature": 3.0
}
```

Pydantic automatically:
1. Checks message is 1-5000 characters → **FAILS** (empty)
2. Returns 422 Unprocessable Entity
3. Includes detailed error: "String should have at least 1 character"
4. Never reaches business logic

When user sends valid data:
1. All checks pass
2. Python object created automatically
3. Reaches business logic with guaranteed valid data

**In Code** (`schemas/request.py`):
```python
class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=5000)
    role: LLMRole = Field(default=LLMRole.ASSISTANT)
    temperature: Optional[float] = Field(ge=0.0, le=2.0)

    @field_validator('message')
    @classmethod
    def validate_message(cls, v: str) -> str:
        # Custom validation for complex logic
        if v.strip() == "":
            raise ValueError("Cannot be whitespace only")
        return v.strip()
```

**Result**: Invalid requests rejected before reaching service layer.

---

### 7. Enums (Type-Safe Choices)
**What**: Define a fixed set of allowed values

**Why**:
- **Prevents typos**: Can only use valid values
- **IDE support**: IDE autocomplete shows all options
- **Documentation**: Swagger shows all valid choices
- **Type checking**: Errors if you use wrong value

**Example**:
```python
class LLMRole(str, Enum):
    ASSISTANT = "assistant"
    CODER = "coder"
    TUTOR = "tutor"
    CREATIVE = "creative"
```

**Benefits**:
```python
# ✅ Good: IDE knows valid values
role = LLMRole.CODER

# ❌ Bad: Typo, caught at definition time
role = LLMRole.CODEE  # AttributeError immediately

# ❌ Bad: Typo in string, caught at request time
{"role": "codee"}  # Returns 422 error with hint
```

---

### 8. Error Handling Strategy
**Pattern**: Catch specific errors, provide meaningful responses

**In Code** (`llm_service.py`):
```python
try:
    response = self._model.generate_content(...)
except ValueError:
    # Validation error (caught early)
except Exception as e:
    # API error - check error message to determine type
    if "429" in str(e):  # Rate limit
        raise ValueError("API rate limit reached")
    elif "auth" in str(e):  # Authentication
        raise ValueError("API authentication failed")
    else:  # Generic
        raise ValueError(f"Failed: {str(e)}")
```

**Result**: Frontend gets clear, actionable error messages.

---

## Response Formatting (Backend)

### FormatterService
The backend now includes a `FormatterService` that transforms plain text LLM responses into beautifully structured data:

**What it does**:
1. Detects markdown syntax (code blocks, headings, lists, quotes)
2. Identifies code blocks and detects programming languages
3. Parses response into structured blocks
4. Provides metadata about the response

**How it works**:
```python
formatter = FormatterService()
result = formatter.format_response("Python is great!\n\n```python\nprint('hello')\n```")

# Returns:
{
    "raw_text": "...",
    "formatted_blocks": [
        {"type": "paragraph", "content": "Python is great!"},
        {"type": "code", "content": "print('hello')", "metadata": {"language": "python"}}
    ],
    "metadata": {
        "has_code": True,
        "code_languages": ["python"],
        "has_markdown": True,
        "block_count": 2,
        "code_block_count": 1
    }
}
```

**Frontend uses this to**:
- Render code blocks with syntax highlighting
- Show different styling for headings, lists, quotes
- Detect code languages for proper highlighting
- Track what content types are in the response

---

## Running the Application

### Backend
```bash
cd backend
python main.py
# Server runs on http://localhost:8000
# Docs at http://localhost:8000/docs
```

### Frontend (once built)
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

### Testing Endpoints
```bash
# Health check
curl http://localhost:8000/health

# Get available config
curl http://localhost:8000/api/chat/config

# Send a message
curl -X POST http://localhost:8000/api/chat/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "role": "assistant"}'
```
