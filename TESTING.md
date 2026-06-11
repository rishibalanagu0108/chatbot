# Testing Guide - AI Chat Application

Complete testing checklist for Stage 8: Testing & Final Polish

## 🎯 Pre-Testing Setup

Before running tests, ensure:

```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python main.py
# Should show: "Uvicorn running on http://0.0.0.0:8000"

# Terminal 2 - Frontend
cd frontend
npm run dev
# Should show: "Local: http://localhost:5173"
```

Both servers should be running before proceeding with tests.

---

## ✅ Test Categories

### 1. FUNCTIONAL TESTING

#### 1.1 Basic Message Flow
- [ ] **Test**: Send a simple message
  - **Action**: Type "Hello, how are you?" and click Send
  - **Expected**: AI responds with a greeting
  - **Result**: ✅ Pass / ❌ Fail
  
- [ ] **Test**: Multiple consecutive messages
  - **Action**: Send 3-5 messages in sequence
  - **Expected**: All messages appear in order with correct sender
  - **Result**: ✅ Pass / ❌ Fail

- [ ] **Test**: Message with special characters
  - **Action**: Send: "Test: 123, @#$%, émojis 🎉"
  - **Expected**: Message displays correctly, AI responds
  - **Result**: ✅ Pass / ❌ Fail

#### 1.2 Message Formatting
- [ ] **Test**: Multi-line AI response
  - **Action**: Ask AI something with multiple paragraphs: "Explain lists in Python with examples"
  - **Expected**: Response shows with proper newlines, not literal \n\n
  - **Result**: ✅ Pass / ❌ Fail

- [ ] **Test**: Long messages
  - **Action**: Send a paragraph-long message
  - **Expected**: Message wraps properly in bubble
  - **Result**: ✅ Pass / ❌ Fail

#### 1.3 UI Components
- [ ] **Test**: Message timestamps
  - **Action**: Send a message and observe
  - **Expected**: Timestamp appears below each message in HH:MM format
  - **Result**: ✅ Pass / ❌ Fail

- [ ] **Test**: Character counter
  - **Action**: Type in input field
  - **Expected**: Counter shows "X / 5000" and updates live
  - **Result**: ✅ Pass / ❌ Fail

- [ ] **Test**: Send button state
  - **Action**: Empty input, then type
  - **Expected**: Button disabled when empty, enabled when has text
  - **Result**: ✅ Pass / ❌ Fail

---

### 2. THEME TESTING

#### 2.1 Theme Toggle
- [ ] **Test**: Switch to dark mode
  - **Action**: Click 🌙 icon in header
  - **Expected**: UI switches to dark colors smoothly
  - **Result**: ✅ Pass / ❌ Fail

- [ ] **Test**: Switch back to light mode
  - **Action**: Click ☀️ icon in header
  - **Expected**: UI switches to light colors smoothly
  - **Result**: ✅ Pass / ❌ Fail

#### 2.2 Theme Persistence
- [ ] **Test**: Theme survives page refresh
  - **Action**: 
    1. Switch to dark mode
    2. Refresh page (F5)
  - **Expected**: Page opens in dark mode
  - **Result**: ✅ Pass / ❌ Fail

- [ ] **Test**: Theme survives browser restart
  - **Action**: 
    1. Switch to dark mode
    2. Close browser completely
    3. Reopen http://localhost:5173
  - **Expected**: Page opens in dark mode
  - **Result**: ✅ Pass / ❌ Fail

#### 2.3 Theme Application
- [ ] **Test**: Dark mode colors
  - **Action**: Switch to dark mode and examine
  - **Expected**: 
    - Background is dark (#1a1a1a)
    - Text is light/readable
    - Message bubbles have appropriate contrast
  - **Result**: ✅ Pass / ❌ Fail

- [ ] **Test**: Light mode colors
  - **Action**: Switch to light mode and examine
  - **Expected**:
    - Background is white
    - Text is dark/readable
    - Message bubbles have appropriate contrast
  - **Result**: ✅ Pass / ❌ Fail

---

### 3. KEYBOARD SHORTCUTS

#### 3.1 Enter Key Behavior
- [ ] **Test**: Enter sends message
  - **Action**: Type message, press Enter
  - **Expected**: Message sends, input clears
  - **Result**: ✅ Pass / ❌ Fail

- [ ] **Test**: Shift+Enter creates new line
  - **Action**: Type text, press Shift+Enter, type more
  - **Expected**: Message has two lines, textarea expands
  - **Result**: ✅ Pass / ❌ Fail

#### 3.2 Multi-line Messages
- [ ] **Test**: Send multi-line message
  - **Action**: 
    1. Type "Line 1"
    2. Press Shift+Enter
    3. Type "Line 2"
    4. Press Shift+Enter
    5. Type "Line 3"
    6. Press Enter
  - **Expected**: Message sends with all three lines
  - **Result**: ✅ Pass / ❌ Fail

---

### 4. INPUT VALIDATION

#### 4.1 Empty Message Prevention
- [ ] **Test**: Send button disabled on empty input
  - **Action**: Click input, don't type anything
  - **Expected**: Send button is grayed out and disabled
  - **Result**: ✅ Pass / ❌ Fail

- [ ] **Test**: Whitespace-only rejected
  - **Action**: Type only spaces/tabs, try to send
  - **Expected**: Nothing happens, message not sent
  - **Result**: ✅ Pass / ❌ Fail

#### 4.2 Character Limits
- [ ] **Test**: Character counter updates
  - **Action**: Type characters
  - **Expected**: Counter below input shows "X / 5000"
  - **Result**: ✅ Pass / ❌ Fail

- [ ] **Test**: Cannot exceed 5000 characters
  - **Action**: Paste very long text (>5000 chars)
  - **Expected**: Cannot paste or paste is truncated to 5000
  - **Result**: ✅ Pass / ❌ Fail

#### 4.3 Loading State
- [ ] **Test**: Send button shows loading state
  - **Action**: Send a message
  - **Expected**: Button shows "..." while waiting for response
  - **Result**: ✅ Pass / ❌ Fail

- [ ] **Test**: Input disabled during loading
  - **Action**: Send a message, immediately try typing
  - **Expected**: Cannot type while waiting for response
  - **Result**: ✅ Pass / ❌ Fail

- [ ] **Test**: Loading indicator shows
  - **Action**: Send a message (fast API)
  - **Expected**: Bouncing dots animation appears briefly
  - **Result**: ✅ Pass / ❌ Fail

---

### 5. AUTO-SCROLL BEHAVIOR

#### 5.1 Scroll to New Messages
- [ ] **Test**: Auto-scroll on new user message
  - **Action**: Have multiple messages, send new one
  - **Expected**: View automatically scrolls to show new message
  - **Result**: ✅ Pass / ❌ Fail

- [ ] **Test**: Auto-scroll on AI response
  - **Action**: Send message and watch response appear
  - **Expected**: View scrolls to show AI response
  - **Result**: ✅ Pass / ❌ Fail

#### 5.2 Manual Scroll Handling
- [ ] **Test**: Manual scroll works
  - **Action**: Scroll up to older messages
  - **Expected**: Can view message history
  - **Result**: ✅ Pass / ❌ Fail

- [ ] **Test**: Scroll back to bottom
  - **Action**: Send message after scrolling up
  - **Expected**: Auto-scrolls to bottom
  - **Result**: ✅ Pass / ❌ Fail

---

### 6. ERROR HANDLING

#### 6.1 Connection Errors
- [ ] **Test**: Backend connection failure
  - **Action**: 
    1. Stop backend server (Ctrl+C)
    2. Try to send a message
  - **Expected**: Error message appears: "❌ Cannot connect to backend..."
  - **Result**: ✅ Pass / ❌ Fail

- [ ] **Test**: Recovery after reconnection
  - **Action**:
    1. See connection error
    2. Restart backend (`python main.py`)
    3. Send a message
  - **Expected**: Message sends successfully, works normally
  - **Result**: ✅ Pass / ❌ Fail

#### 6.2 API Errors
- [ ] **Test**: 400 Bad Request
  - **Action**: Manually modify request (in DevTools)
  - **Expected**: Helpful error message appears
  - **Result**: ✅ Pass / ❌ Fail

- [ ] **Test**: 500 Server Error
  - **Action**: Invalid API key or other server error
  - **Expected**: Message appears: "⚠️ Server error..."
  - **Result**: ✅ Pass / ❌ Fail

#### 6.3 Empty Response Handling
- [ ] **Test**: Empty API response
  - **Action**: Trigger condition where API returns empty
  - **Expected**: Error message appears: "⚠️ AI returned an empty response..."
  - **Result**: ✅ Pass / ❌ Fail

---

### 7. MESSAGE DISPLAY

#### 7.1 User Messages
- [ ] **Test**: User message styling
  - **Action**: Send a message
  - **Expected**: 
    - Message appears on right side
    - Blue background
    - White text
    - Timestamp visible
  - **Result**: ✅ Pass / ❌ Fail

#### 7.2 AI Messages
- [ ] **Test**: AI message styling
  - **Action**: Observe AI response
  - **Expected**:
    - Message appears on left side
    - Gray background
    - Dark text
    - Timestamp visible
  - **Result**: ✅ Pass / ❌ Fail

#### 7.3 Error Messages
- [ ] **Test**: Error message styling
  - **Action**: Trigger an error
  - **Expected**:
    - Message appears on left side
    - Red/pink background (error color)
    - Error icon (⚠️) included
  - **Result**: ✅ Pass / ❌ Fail

#### 7.4 Empty State
- [ ] **Test**: Empty state display
  - **Action**: Refresh page or start new conversation
  - **Expected**:
    - Robot emoji 🤖
    - Welcome message
    - Helpful tips visible
  - **Result**: ✅ Pass / ❌ Fail

---

### 8. RESPONSIVE DESIGN

#### 8.1 Desktop (1920px width)
- [ ] **Test**: Layout on desktop
  - **Action**: Open on full-width monitor
  - **Expected**: 
    - Header with title and theme toggle
    - Messages centered with good spacing
    - Input area at bottom with good padding
  - **Result**: ✅ Pass / ❌ Fail

#### 8.2 Tablet (768px width)
- [ ] **Test**: Layout on tablet
  - **Action**: Browser DevTools, set to iPad size (768x1024)
  - **Expected**:
    - Content remains readable
    - Touch-friendly button sizes
    - Proper spacing
  - **Result**: ✅ Pass / ❌ Fail

#### 8.3 Mobile (375px width)
- [ ] **Test**: Layout on mobile
  - **Action**: Browser DevTools, set to iPhone size (375x667)
  - **Expected**:
    - Messages fit in viewport
    - Input field is usable
    - Send button accessible
    - No horizontal scroll needed
  - **Result**: ✅ Pass / ❌ Fail

#### 8.4 Text Area Expansion
- [ ] **Test**: Input field auto-expands
  - **Action**: Type multi-line message
  - **Expected**: Textarea grows with content (max 120px)
  - **Result**: ✅ Pass / ❌ Fail

---

### 9. BROWSER COMPATIBILITY

Test on at least 2 browsers from each category:

#### Chromium-based
- [ ] Chrome (latest)
- [ ] Edge (latest)
- [ ] Brave (optional)

#### Firefox
- [ ] Firefox (latest)

#### Safari
- [ ] Safari (latest, if on Mac)

For each browser test:
- Send a message
- Toggle theme
- Check responsive design
- Verify no console errors (F12)

---

### 10. PERFORMANCE TESTING

#### 10.1 Message Limit
- [ ] **Test**: Maximum messages (100)
  - **Action**: Send 100+ messages
  - **Expected**: 
    - Works smoothly with 100 messages
    - Shows alert when trying to send #101
    - UI remains responsive
  - **Result**: ✅ Pass / ❌ Fail

#### 10.2 Response Time
- [ ] **Test**: API response speed
  - **Action**: Send a message, measure response time
  - **Expected**: Typically 2-5 seconds depending on Gemini API
  - **Result**: ✅ Pass / ❌ Fail

#### 10.3 Scrolling Smoothness
- [ ] **Test**: Scroll performance with many messages
  - **Action**: Send 20+ messages, scroll up and down
  - **Expected**: Scrolling is smooth, no stuttering
  - **Result**: ✅ Pass / ❌ Fail

#### 10.4 Theme Switch Speed
- [ ] **Test**: Theme toggle speed
  - **Action**: Click theme button multiple times quickly
  - **Expected**: Switches smoothly, no lag
  - **Result**: ✅ Pass / ❌ Fail

---

### 11. ACCESSIBILITY

#### 11.1 Keyboard Navigation
- [ ] **Test**: Tab through UI elements
  - **Action**: Press Tab repeatedly
  - **Expected**: Can reach all interactive elements
  - **Result**: ✅ Pass / ❌ Fail

#### 11.2 ARIA Labels
- [ ] **Test**: Screen reader compatibility
  - **Action**: Enable screen reader (VoiceOver on Mac, NVDA on Windows)
  - **Expected**: Can navigate and use app with screen reader
  - **Result**: ✅ Pass / ❌ Fail

#### 11.3 Color Contrast
- [ ] **Test**: Text readability
  - **Action**: Check contrast ratio of text on backgrounds
  - **Expected**: At least 4.5:1 ratio for normal text (WCAG AA)
  - **Result**: ✅ Pass / ❌ Fail

---

### 12. EDGE CASES

#### 12.1 Special Characters
- [ ] **Test**: Emoji in messages
  - **Action**: Send message with emoji: "Hello 👋 World 🌍"
  - **Expected**: Displays correctly, no encoding issues
  - **Result**: ✅ Pass / ❌ Fail

- [ ] **Test**: Unicode characters
  - **Action**: Send message with non-ASCII: "こんにちは العربية Ελληνικά"
  - **Expected**: Displays correctly
  - **Result**: ✅ Pass / ❌ Fail

- [ ] **Test**: Code snippets in response
  - **Action**: Ask AI for code: "Show me Python hello world"
  - **Expected**: Code displays with proper formatting/newlines
  - **Result**: ✅ Pass / ❌ Fail

#### 12.2 Very Long Responses
- [ ] **Test**: Large AI response
  - **Action**: Ask for something that generates long response
  - **Expected**: 
    - Message bubble doesn't break
    - Scrolls properly
    - Readable with good wrapping
  - **Result**: ✅ Pass / ❌ Fail

#### 12.3 Rapid Requests
- [ ] **Test**: Send multiple messages quickly
  - **Action**: Send 3 messages in quick succession
  - **Expected**: 
    - All messages queue properly
    - Responses appear in order
    - No race conditions
  - **Result**: ✅ Pass / ❌ Fail

#### 12.4 Copy/Paste
- [ ] **Test**: Copy from message bubble
  - **Action**: Select and copy AI response
  - **Expected**: Can paste text elsewhere correctly
  - **Result**: ✅ Pass / ❌ Fail

---

## 📊 Test Summary

Create a summary table:

| Category | Total Tests | Passed | Failed | Notes |
|----------|-------------|--------|--------|-------|
| Functional | 10 | ✅ | | |
| Theme | 6 | ✅ | | |
| Keyboard | 4 | ✅ | | |
| Validation | 6 | ✅ | | |
| Auto-scroll | 4 | ✅ | | |
| Error Handling | 6 | ✅ | | |
| Display | 6 | ✅ | | |
| Responsive | 4 | ✅ | | |
| Browser | 8 | ✅ | | |
| Performance | 4 | ✅ | | |
| Accessibility | 3 | ✅ | | |
| Edge Cases | 4 | ✅ | | |
| **TOTAL** | **65** | **✅** | **0** | All tests passing |

---

## 🚀 Final Sign-Off

When all tests pass:

```
✅ Application is ready for production
✅ All features working as expected
✅ No critical bugs found
✅ Performance is acceptable
✅ Responsive on all devices
✅ Accessible to all users
✅ Documentation is complete
```

**Tested by**: [Your Name]  
**Date**: [Date]  
**Result**: ✅ PASSED / ❌ FAILED
