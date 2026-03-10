import { useState, useRef, useCallback } from 'react'
import './ChatInput.css'

export default function ChatInput({ onSend, onStop, isStreaming }) {
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)

  const submit = useCallback(() => {
    if (!value.trim() || isStreaming) return
    onSend(value)
    setValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }, [value, isStreaming, onSend])

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() }
  }

  const handleChange = e => {
    setValue(e.target.value)
    const el = textareaRef.current
    if (el) { el.style.height = 'auto'; el.style.height = `${Math.min(el.scrollHeight, 200)}px` }
  }

  return (
    <div className="input-area">
      <div className="input-wrapper">
        <textarea
          ref={textareaRef}
          className="input-textarea"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Message… (Shift+Enter for new line)"
          rows={1}
        />
        <div className="input-actions">
          {isStreaming ? (
            <button className="stop-btn" onClick={onStop} title="Stop">
              <svg viewBox="0 0 16 16" fill="currentColor" width="13" height="13">
                <path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5"/>
              </svg>
              Stop
            </button>
          ) : (
            <button className="send-btn" onClick={submit} disabled={!value.trim()} title="Send">
              <svg viewBox="0 0 16 16" fill="currentColor" width="15" height="15">
                <path d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5"/>
              </svg>
            </button>
          )}
        </div>
      </div>
      <p className="input-hint">LLM responses may be inaccurate. Always verify critical information.</p>
    </div>
  )
}
