/**
 * ChatPage Component
 *
 * Main chat interface with messages, input, and settings.
 */

import { useEffect, useRef, useState } from 'react'
import type { ChatRequestPayload, LLMRole } from '@/types'
import { useChat, useConfig, useTheme } from '@/hooks'
import {
  Header,
  ChatMessage,
  MessageInput,
  LoadingIndicator,
  ErrorAlert,
  SettingsPanel,
  ScrollArea,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Card,
  CardContent,
  Button,
} from '@/components'

export function ChatPage() {
  // Hooks
  const { messages, isLoading, error, sendMessage, setError } = useChat()
  const { config, isLoading: configLoading, error: configError } = useConfig()
  const { theme } = useTheme()

  // Settings state
  const [role, setRole] = useState<LLMRole>('assistant')
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(1000)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Message input ref for auto-scroll
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle sending message
  const handleSendMessage = async (messageText: string) => {
    const payload: ChatRequestPayload = {
      message: messageText,
      role,
      temperature,
      max_tokens: maxTokens,
    }

    await sendMessage(payload)
  }

  // Handle error dismiss
  const handleDismissError = () => {
    setError(null)
  }

  return (
    <div className={`flex flex-col h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Header */}
      <Header onSettingsClick={() => setSettingsOpen(true)} />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden gap-4 p-4">
        {/* Messages Area - Left Side */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Config Loading Error */}
          {configError && (
            <Card className="mb-4 border-yellow-500 bg-yellow-500/10">
              <CardContent className="p-4 text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ Failed to load configuration: {configError.detail}
              </CardContent>
            </Card>
          )}

          {/* Messages List */}
          <ScrollArea className="flex-1 mb-4 rounded-lg border border-border bg-muted/30 p-4">
            <div className="space-y-4 pr-4">
              {messages.length === 0 && !isLoading && (
                <div className="flex items-center justify-center h-full text-center">
                  <div className="space-y-2">
                    <div className="text-4xl">👋</div>
                    <h2 className="text-xl font-semibold">Welcome to AI Chat</h2>
                    <p className="text-sm text-muted-foreground max-w-xs">
                      Start a conversation by typing a message below. Adjust settings on the right to customize the LLM behavior.
                    </p>
                  </div>
                </div>
              )}

              {/* Messages */}
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onRetry={() => {
                    if (message.text) {
                      handleSendMessage(message.text)
                    }
                  }}
                />
              ))}

              {/* Loading Indicator */}
              {isLoading && <LoadingIndicator />}

              {/* Scroll target */}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Error Alert */}
          {error && (
            <ErrorAlert
              error={error}
              onDismiss={handleDismissError}
              onRetry={() => {
                if (messages.length > 0) {
                  const lastUserMessage = [...messages]
                    .reverse()
                    .find((m) => m.sender === 'user')
                  if (lastUserMessage) {
                    handleSendMessage(lastUserMessage.text)
                  }
                }
              }}
            />
          )}

          {/* Input Area */}
          <MessageInput
            onSend={handleSendMessage}
            isLoading={isLoading || configLoading}
            placeholder="Type your message... (Shift+Enter for new line)"
            maxLength={5000}
          />
        </div>

        {/* Settings Sidebar - Right Side (Hidden on mobile) */}
        <div className="hidden lg:block w-80 space-y-4">
          {!configLoading && config && (
            <SettingsPanel
              role={role}
              temperature={temperature}
              maxTokens={maxTokens}
              onRoleChange={setRole}
              onTemperatureChange={setTemperature}
              onMaxTokensChange={setMaxTokens}
              disabled={isLoading}
              compact={false}
            />
          )}

          {/* Info Card */}
          <Card>
            <CardContent className="p-4 space-y-2 text-xs">
              <div>
                <h3 className="font-semibold mb-2">📊 Stats</h3>
                <div className="space-y-1 text-muted-foreground">
                  <p>Messages: {messages.length}</p>
                  <p>Status: {isLoading ? '🔄 Processing' : '✅ Ready'}</p>
                  <p>Current role: {role}</p>
                  <p>Temperature: {temperature.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Settings Modal (Mobile) */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chat Settings</DialogTitle>
            <DialogDescription>
              Customize LLM behavior for this conversation
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {config && (
              <SettingsPanel
                role={role}
                temperature={temperature}
                maxTokens={maxTokens}
                onRoleChange={setRole}
                onTemperatureChange={setTemperature}
                onMaxTokensChange={setMaxTokens}
                disabled={isLoading}
                compact={true}
              />
            )}

            <Button
              onClick={() => setSettingsOpen(false)}
              className="w-full"
              variant="outline"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
