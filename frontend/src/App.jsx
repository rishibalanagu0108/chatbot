// Import useState hook for managing component state (messages, theme, etc.)
import { useState, useEffect, useRef } from 'react'

// ============================================================================
// APP COMPONENT - Main application component
// ============================================================================

export default function App() {
  // ========================================================================
  // STATE VARIABLES - Track the state of the application
  // ========================================================================

  // messages: array of all messages in the conversation
  // Each message has: { id, text, sender ('user' or 'ai'), timestamp, isError }
  // Keep max 100 messages to prevent memory issues
  const [messages, setMessages] = useState([])
  const MAX_MESSAGES = 100

  // inputValue: current text being typed in the input field
  const [inputValue, setInputValue] = useState('')

  // isLoading: whether we're waiting for the API response
  const [isLoading, setIsLoading] = useState(false)

  // theme: current theme mode ('light' or 'dark')
  const [theme, setTheme] = useState(() => {
    // Check if user has a saved theme preference in localStorage
    const savedTheme = localStorage.getItem('theme')
    // If saved, use it; otherwise default to 'light'
    return savedTheme || 'light'
  })

  // Reference to the messages container to auto-scroll to bottom
  const messagesEndRef = useRef(null)

  // ========================================================================
  // EFFECTS - Side effects that run when component mounts or updates
  // ========================================================================

  // Apply theme to document and save preference when theme changes
  useEffect(() => {
    // Set the data-theme attribute on the document root
    // This triggers CSS variable changes for dark/light mode
    document.documentElement.setAttribute('data-theme', theme)
    // Save the theme preference to localStorage for persistence
    localStorage.setItem('theme', theme)
  }, [theme])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    // Scroll the messages container to the bottom smoothly
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ========================================================================
  // HELPER FUNCTIONS
  // ========================================================================

  // Toggle between light and dark theme
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
  }

  // Get formatted timestamp for messages
  const getTimestamp = () => {
    const now = new Date()
    // Format: HH:MM (e.g., 14:30)
    return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  // Generate unique ID for each message
  const generateId = () => {
    return Date.now() + Math.random()
  }

  // Format message text to display newlines properly
  // Converts \n characters in the text into actual line breaks
  const formatMessageText = (text) => {
    return text.split('\n').map((line, index) => (
      // Each line of text followed by a line break
      <div key={index}>{line}</div>
    ))
  }

  // ========================================================================
  // MESSAGE HANDLING - Functions for sending and receiving messages
  // ========================================================================

  // Handle sending a message
  const handleSendMessage = async (e) => {
    // Prevent form submission default behavior
    e.preventDefault()

    // Trim whitespace from input
    const trimmedInput = inputValue.trim()

    // Validation: don't send empty messages
    if (!trimmedInput || isLoading) {
      return
    }

    // Validation: check message length
    if (trimmedInput.length > 5000) {
      alert('Message is too long! Maximum 5000 characters.')
      return
    }

    // Validation: check if we've hit message limit
    if (messages.length >= MAX_MESSAGES) {
      alert(`Maximum ${MAX_MESSAGES} messages reached. Refresh to start a new conversation.`)
      return
    }

    // Add user message to the message list
    const userMessage = {
      id: generateId(),
      text: trimmedInput,
      sender: 'user',
      timestamp: getTimestamp()
    }

    // Update messages state with the new user message
    setMessages(prev => [...prev, userMessage])

    // Clear the input field
    setInputValue('')

    // Set loading state while waiting for API response
    setIsLoading(true)

    try {
      // Make API call to the backend
      // Send the user's message to the /api/chat endpoint
      const response = await fetch(
        import.meta.env.VITE_API_URL + '/api/chat',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: trimmedInput })
        }
      )

      // Parse the JSON response from the backend
      const data = await response.json()

      // Check if the response was successful
      if (response.ok && data.success) {
        // Validate that the AI response is not empty
        if (!data.response || data.response.trim().length === 0) {
          const emptyMessage = {
            id: generateId(),
            text: '⚠️ AI returned an empty response. Please try again with a different question.',
            sender: 'ai',
            timestamp: getTimestamp(),
            isError: true
          }
          setMessages(prev => [...prev, emptyMessage])
        } else {
          // Create an AI message from the response
          const aiMessage = {
            id: generateId(),
            text: data.response,
            sender: 'ai',
            timestamp: getTimestamp()
          }
          // Add AI message to the messages list
          setMessages(prev => [...prev, aiMessage])
        }
      } else {
        // Handle error response from backend
        let errorText = data.response || 'Failed to get response from AI.'
        // Add helpful context based on the HTTP status
        if (response.status === 429) {
          errorText = '⚠️ Rate limit reached. Please wait a moment and try again.'
        } else if (response.status === 500) {
          errorText = '⚠️ Server error. Please make sure the backend is running and try again.'
        } else if (response.status === 400) {
          errorText = '⚠️ Invalid request. Please check your message and try again.'
        }

        const errorMessage = {
          id: generateId(),
          text: errorText,
          sender: 'ai',
          timestamp: getTimestamp(),
          isError: true
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (error) {
      // Handle network or parsing errors
      let errorText = ''

      // Provide specific error messages based on error type
      if (error.message.includes('Failed to fetch')) {
        errorText = `❌ Cannot connect to backend. Make sure the server is running on ${import.meta.env.VITE_API_URL}`
      } else if (error.message.includes('JSON')) {
        errorText = '❌ Invalid response from server. Backend may be down.'
      } else {
        errorText = `❌ Error: ${error.message}`
      }

      const errorMessage = {
        id: generateId(),
        text: errorText,
        sender: 'ai',
        timestamp: getTimestamp(),
        isError: true
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      // Stop loading state regardless of success or failure
      setIsLoading(false)
    }
  }

  // Handle input field changes
  const handleInputChange = (e) => {
    setInputValue(e.target.value)
  }

  // Handle keyboard events in the input field
  const handleKeyDown = (e) => {
    // Send message on Enter, but allow Shift+Enter for new lines
    if (e.key === 'Enter' && !e.shiftKey) {
      // Prevent default behavior (adding newline)
      e.preventDefault()
      // Send the message
      handleSendMessage(e)
    }
    // If Shift+Enter is pressed, allow default behavior (add newline)
  }

  // ========================================================================
  // RENDER - Return the JSX for the component
  // ========================================================================

  return (
    <div className="app">
      {/* ================================================================ */}
      {/* HEADER - Title and theme toggle button */}
      {/* ================================================================ */}
      <header className="header">
        <div>
          <h1 className="header-title">AI Chat</h1>
          <p className="header-subtitle">Powered by Google Gemini</p>
        </div>
        {/* Theme toggle button - shows sun or moon icon */}
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </header>

      {/* ================================================================ */}
      {/* CHAT CONTAINER - Messages and input area */}
      {/* ================================================================ */}
      <div className="chat-container">
        {/* Messages display area */}
        <div className="messages-area">
          {/* Show empty state if no messages yet */}
          {messages.length === 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              flexDirection: 'column',
              color: 'var(--text-tertiary)',
              textAlign: 'center',
              padding: '20px'
            }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>🤖</div>
              <p style={{ fontSize: '18px', marginBottom: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>
                Welcome to AI Chat
              </p>
              <p style={{ fontSize: '14px', marginBottom: '20px', maxWidth: '300px', lineHeight: '1.6' }}>
                Powered by Google Gemini. Start a conversation by typing a message below. Type anything you'd like to know!
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                💡 Tip: Press Enter to send, or Shift+Enter for new line
              </p>
            </div>
          )}

          {/* Display each message */}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.sender} ${message.isError ? 'error-message' : ''}`}
            >
              <div className="message-content">
                {/* Message text with proper formatting for newlines */}
                <div style={{ margin: 0, whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                  {formatMessageText(message.text)}
                </div>
                {/* Message timestamp */}
                <div className="message-timestamp">{message.timestamp}</div>
              </div>
            </div>
          ))}

          {/* Loading indicator while waiting for response */}
          {isLoading && (
            <div className="message ai">
              <div className="message-content loading-message">
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
              </div>
            </div>
          )}

          {/* Reference element for auto-scrolling to bottom */}
          <div ref={messagesEndRef} />
        </div>

        {/* ============================================================ */}
        {/* INPUT AREA - Text input and send button */}
        {/* ============================================================ */}
        <form className="input-area" onSubmit={handleSendMessage}>
          <div className="input-wrapper">
            {/* Text input field */}
            <textarea
              className="input-field"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
              disabled={isLoading}
              rows="1"
              style={{
                // Auto-grow based on content
                minHeight: '44px',
                overflow: 'hidden'
              }}
              // Auto-expand textarea as user types
              onInput={(e) => {
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
              }}
              aria-label="Message input field"
            />
            {/* Character count indicator */}
            <div className="char-count">
              {inputValue.length} / 5000
            </div>
          </div>

          {/* Send button */}
          <button
            className="send-button"
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            title="Send message"
          >
            {/* Show loading state or send text */}
            {isLoading ? '...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  )
}
