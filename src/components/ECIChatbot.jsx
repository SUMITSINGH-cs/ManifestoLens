import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './ECIChatbot.css'

function ECICharacter() {
  return (
    <div className="eci-character">
      <div className="eci-character-head">
        <div className="eci-eyes">
          <span></span>
          <span></span>
        </div>
        <div className="eci-smile"></div>
      </div>
      <div className="eci-character-body">
        <span className="eci-body-badge">ECI</span>
      </div>
      <div className="eci-character-arm"></div>
    </div>
  )
}

function ECIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [currentChatId, setCurrentChatId] = useState(null)

  const [chatHistory, setChatHistory] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem('eciChatHistory') || '[]'
      )
    } catch {
      return []
    }
  })

  // Save the current conversation to browser history
  const saveCurrentChat = () => {
    if (!messages.some(item => item.role === 'user')) return

    const id = currentChatId || Date.now()

    const conversation = {
      id,
      title:
        messages.find(item => item.role === 'user')?.content.slice(0, 45)
        || 'New conversation',
      date: new Date().toISOString(),
      messages
    }

    setChatHistory(previous => {
      const updated = [
        conversation,
        ...previous.filter(chat => chat.id !== id)
      ].slice(0, 5)

      localStorage.setItem(
        'eciChatHistory',
        JSON.stringify(updated)
      )

      return updated
    })
  }

  // Start a fresh conversation
  const startNewChat = () => {
    saveCurrentChat()
    setMessages([])
    setMessage('')
    setCurrentChatId(null)
    setShowHistory(false)
  }

  // Open a previous conversation
  const openPreviousChat = (chat) => {
    saveCurrentChat()
    setMessages(chat.messages)
    setCurrentChatId(chat.id)
    setShowHistory(false)
  }

  // Send a message to the backend
  const handleSend = async () => {
    const userMessage = message.trim()

    if (!userMessage || isLoading) return

    const chatId = currentChatId || Date.now()
    setCurrentChatId(chatId)

    setMessages(previous => [
      ...previous,
      { role: 'user', content: userMessage }
    ])

    setMessage('')
    setIsLoading(true)

    try {
      const response = await fetch(
        'http://localhost:5001/api/chat',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: userMessage,
            history: messages.map(item => ({
              role: item.role === 'assistant' ? 'model' : 'user',
              content: item.content
            }))
          })
        }
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || 'Unable to get a response from ECI.'
        )
      }

      setMessages(previous => [
        ...previous,
       {
  role: 'assistant',
  content: data.reply,
  sources: data.sources || [],
  searchUsed: data.searchUsed
}
      ])
    } catch (error) {
      setMessages(previous => [
        ...previous,
        {
          role: 'assistant',
          content: `Sorry, I couldn't respond. ${error.message}`
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const selectSuggestion = (question) => {
    setMessage(question)
  }

  const closeChat = () => {
    if (!isLoading) {
      saveCurrentChat()
      setMessages([])
      setCurrentChatId(null)
      setShowHistory(false)
      setIsOpen(false)
    }
  }

  return (
    <div className="eci-container">

      {isOpen && (
        <div className="eci-chat-window">

          <div className="eci-chat-header">
            <ECICharacter />

            <div className="eci-header-info">
              <h3>ECI Assistant</h3>
              <span>Election Companion Intelligence</span>
              <small>Unofficial ManifestoLens AI assistant</small>
            </div>

            <button
              className="eci-close-btn"
              onClick={closeChat}
              aria-label="Close chat"
            >
              ×
            </button>
          </div>

          <div className="eci-chat-actions">
            <button onClick={startNewChat}>
              ＋ New Chat
            </button>

            <button onClick={() => setShowHistory(!showHistory)}>
              ◷ History
            </button>
          </div>

          <div className="eci-chat-body" aria-live="polite">

            {showHistory ? (
              <div className="eci-history">

                <h3>Chat History</h3>

                {chatHistory.length === 0 ? (
                  <p>No previous conversations yet.</p>
                ) : (
                  chatHistory.map(chat => (
                    <button
                      className="eci-history-item"
                      key={chat.id}
                      onClick={() => openPreviousChat(chat)}
                    >
                      <strong>{chat.title}</strong>
                      <small>
                        {new Date(chat.date).toLocaleString()}
                      </small>
                    </button>
                  ))
                )}

              </div>
            ) : messages.length === 0 ? (
              <div className="eci-welcome-message">
                <span className="eci-greeting-tag">
                  YOUR ELECTION COMPANION
                </span>

                <strong>Hello! I'm ECI 👋</strong>

                <p>
                  Welcome to ManifestoLens. I can help you explore
                  political manifestos, understand Indian politics
                  and navigate this website.
                </p>

                <div className="eci-suggestions">
                  <span className="eci-section-label">
                    WHAT CAN I HELP YOU WITH?
                  </span>

                  <button onClick={() => selectSuggestion(
                    'Tell me about ManifestoLens and its features'
                  )}>
                    <span>📚</span>
                    <span>
                      <strong>Explore ManifestoLens</strong>
                      <small>Discover features and available data</small>
                    </span>
                    <span className="eci-arrow">›</span>
                  </button>

                  <button onClick={() => selectSuggestion(
                    'Compare BJP and Congress'
                  )}>
                    <span>⚖️</span>
                    <span>
                      <strong>Compare political parties</strong>
                      <small>Understand their policies and promises</small>
                    </span>
                    <span className="eci-arrow">›</span>
                  </button>

                  <button onClick={() => selectSuggestion(
                    'Explain the Indian election system'
                  )}>
                    <span>🗳️</span>
                    <span>
                      <strong>Understand Indian elections</strong>
                      <small>Learn about elections and democracy</small>
                    </span>
                    <span className="eci-arrow">›</span>
                  </button>

                  <button onClick={() => selectSuggestion(
                    'Help me with a ManifestoLens website issue'
                  )}>
                    <span>💡</span>
                    <span>
                      <strong>Website help</strong>
                      <small>Get help using ManifestoLens</small>
                    </span>
                    <span className="eci-arrow">›</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="eci-messages">
                {messages.map((item, index) => (
                  <div
                    key={index}
                    className={`eci-message eci-${item.role}`}
                  >
                    <div className="eci-message-label">
                      {item.role === 'user' ? 'You' : 'ECI'}
                    </div>

                   {item.role === 'assistant' && (
  <div className={`eci-search-status ${
    item.searchUsed ? 'eci-search-success' : 'eci-search-warning'
  }`}>
    {item.searchUsed
      ? '✓ Live web sources included'
      : 'ⓘ No live sources attached — verify current information'}
  </div>
)}

<div className="eci-message-bubble">
  <ReactMarkdown remarkPlugins={[remarkGfm]}>
    {item.content}
  </ReactMarkdown>
</div>

                    {item.sources?.length > 0 && (
                      <div className="eci-sources">
                        <strong>Sources</strong>

                        {item.sources.map((source, sourceIndex) => (
                          <a
                            key={sourceIndex}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {source.title || source.url}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {isLoading && (
              <div className="eci-typing">
                <span></span>
                <span></span>
                <span></span>
                <small>ECI is thinking...</small>
              </div>
            )}

          </div>

          {!showHistory && (
            <div className="eci-chat-input">
              <input
                type="text"
                placeholder="Ask ECI anything..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                disabled={isLoading}
              />

              <button
                onClick={handleSend}
                disabled={!message.trim() || isLoading}
                aria-label="Send message"
              >
                ↑
              </button>
            </div>
          )}

          <div className="eci-chat-footer">
            ECI can make mistakes. Verify important information.
          </div>

        </div>
      )}

      <button
        className="eci-launcher"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open ECI assistant"
      >
        <ECICharacter />
        {!isOpen && <span className="eci-online-dot"></span>}
      </button>

    </div>
  )
}

export default ECIChatbot
