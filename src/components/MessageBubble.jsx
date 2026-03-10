import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './MessageBubble.css'

function CodeBlock({ className, children, ...props }) {
  const isBlock = /language-\w+/.test(className || '')
  if (isBlock) {
    return (
      <div className="code-block-wrapper">
        <pre className="code-block">
          <code className={className} {...props}>{children}</code>
        </pre>
      </div>
    )
  }
  return <code className="inline-code" {...props}>{children}</code>
}

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user'
  const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className={`message-row ${isUser ? 'user' : 'assistant'}`}>
      <div className="message-avatar">
        {isUser ? (
          <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16">
            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        )}
      </div>

      <div className="message-content">
        <div className="message-meta">
          <span className="message-author">{isUser ? 'You' : 'Assistant'}</span>
          <span className="message-time">{time}</span>
        </div>

        <div className={`message-bubble ${isUser ? 'user-bubble' : 'assistant-bubble'} ${message.isError ? 'error-bubble' : ''}`}>
          {isUser ? (
            <p className="user-text">{message.content}</p>
          ) : message.content ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock }}>
              {message.content}
            </ReactMarkdown>
          ) : (
            <span className="typing-dots">
              <span /><span /><span />
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
