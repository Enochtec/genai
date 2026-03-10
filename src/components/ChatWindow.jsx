import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import ChatInput from './ChatInput'
import './ChatWindow.css'

export default function ChatWindow({ conversation, isStreaming, onSend, onStop, onClear, model }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation.messages])

  return (
    <main className="chat-window">
      <header className="chat-header">
        <div className="chat-header-left">
          <span className="model-badge">{model}</span>
          <span className="conv-name">{conversation.title || 'New Chat'}</span>
        </div>
        <button className="clear-btn" onClick={onClear}>
          <svg viewBox="0 0 16 16" fill="currentColor" width="13" height="13">
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
            <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
          </svg>
          Clear
        </button>
      </header>

      <div className="messages-area">
        {conversation.messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="60" height="60">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"/>
              </svg>
            </div>
            <h2>How can I help you today?</h2>
            <p>Ask a question, write code, or explore ideas.</p>
            <p className="hint-small">Configure your API key in Settings to get started.</p>
          </div>
        ) : (
          <>
            {conversation.messages.map(msg => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      <ChatInput onSend={onSend} onStop={onStop} isStreaming={isStreaming} />
    </main>
  )
}
