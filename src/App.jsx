import { useState, useCallback, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import ChatWindow from './components/ChatWindow'
import SettingsModal from './components/SettingsModal'
import { streamChatCompletion } from './api/llm'
import './App.css'

const DEFAULT_SETTINGS = {
  provider: 'gemini',
  apiBaseUrl: 'https://generativelanguage.googleapis.com/v1beta',
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
  model: 'gemini-2.5-flash',
  temperature: 0.7,
  maxTokens: 2048,
  systemPrompt: 'You are a helpful AI assistant.',
}

function normalizeSettings(rawSettings) {
  const merged = { ...DEFAULT_SETTINGS, ...rawSettings }
  // Keep legacy localStorage values but normalize provider/model back to Gemini.
  merged.provider = 'gemini'
  merged.apiBaseUrl = 'https://generativelanguage.googleapis.com/v1beta'
  merged.apiKey = import.meta.env.VITE_GEMINI_API_KEY || merged.apiKey || ''
  merged.model = /^gemini-/i.test(merged.model || '') ? merged.model : 'gemini-2.5-flash'
  return merged
}

function createConversation(title = 'New Chat') {
  return { id: crypto.randomUUID(), title, messages: [], createdAt: Date.now() }
}

function App() {
  const [conversations, setConversations] = useState(() => {
    try { return JSON.parse(localStorage.getItem('genai_conversations')) || [createConversation()] }
    catch { return [createConversation()] }
  })

  const [activeConvId, setActiveConvId] = useState(
    () => localStorage.getItem('genai_active_conv') || conversations[0]?.id
  )

  const [isStreaming, setIsStreaming] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [abortController, setAbortController] = useState(null)
  const [settings, setSettings] = useState(() => {
    try { return normalizeSettings(JSON.parse(localStorage.getItem('genai_settings'))) }
    catch { return DEFAULT_SETTINGS }
  })

  useEffect(() => { localStorage.setItem('genai_conversations', JSON.stringify(conversations)) }, [conversations])
  useEffect(() => { localStorage.setItem('genai_active_conv', activeConvId) }, [activeConvId])
  useEffect(() => { localStorage.setItem('genai_settings', JSON.stringify(settings)) }, [settings])

  const activeConversation = conversations.find(c => c.id === activeConvId) || conversations[0]

  const createNewChat = useCallback(() => {
    const conv = createConversation()
    setConversations(prev => [conv, ...prev])
    setActiveConvId(conv.id)
  }, [])

  const deleteConversation = useCallback((id) => {
    setConversations(prev => {
      const next = prev.filter(c => c.id !== id)
      if (next.length === 0) {
        const fresh = createConversation()
        setActiveConvId(fresh.id)
        return [fresh]
      }
      if (id === activeConvId) setActiveConvId(next[0].id)
      return next
    })
  }, [activeConvId])

  const sendMessage = useCallback(async (content) => {
    if (!content.trim() || isStreaming) return

    const userMsg  = { id: crypto.randomUUID(), role: 'user',      content: content.trim(), timestamp: Date.now() }
    const asstMsg  = { id: crypto.randomUUID(), role: 'assistant', content: '',             timestamp: Date.now() }

    setConversations(prev => prev.map(c => {
      if (c.id !== activeConvId) return c
      const title = c.messages.length === 0
        ? content.slice(0, 45) + (content.length > 45 ? '…' : '')
        : c.title
      return { ...c, title, messages: [...c.messages, userMsg, asstMsg] }
    }))

    setIsStreaming(true)
    const ctrl = new AbortController()
    setAbortController(ctrl)

    try {
      const history = [
        { role: 'system', content: settings.systemPrompt },
        ...activeConversation.messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: content.trim() },
      ]

      for await (const chunk of streamChatCompletion(history, settings, ctrl.signal)) {
        setConversations(prev => prev.map(c => {
          if (c.id !== activeConvId) return c
          return {
            ...c,
            messages: c.messages.map(m =>
              m.id === asstMsg.id ? { ...m, content: m.content + chunk } : m
            ),
          }
        }))
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setConversations(prev => prev.map(c => {
          if (c.id !== activeConvId) return c
          return {
            ...c,
            messages: c.messages.map(m =>
              m.id === asstMsg.id ? { ...m, content: `⚠️ Error: ${err.message}`, isError: true } : m
            ),
          }
        }))
      }
    } finally {
      setIsStreaming(false)
      setAbortController(null)
    }
  }, [isStreaming, activeConvId, activeConversation, settings])

  const stopStreaming = useCallback(() => abortController?.abort(), [abortController])

  const clearConversation = useCallback(() => {
    setConversations(prev => prev.map(c =>
      c.id === activeConvId ? { ...c, messages: [], title: 'New Chat' } : c
    ))
  }, [activeConvId])

  return (
    <div className="app">
      <Sidebar
        conversations={conversations}
        activeConvId={activeConvId}
        onSelect={setActiveConvId}
        onNew={createNewChat}
        onDelete={deleteConversation}
        onSettings={() => setShowSettings(true)}
      />
      <ChatWindow
        conversation={activeConversation}
        isStreaming={isStreaming}
        onSend={sendMessage}
        onStop={stopStreaming}
        onClear={clearConversation}
        model={settings.model}
      />
      {showSettings && (
        <SettingsModal
          settings={settings}
          onSave={s => { setSettings(s); setShowSettings(false) }}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}

export default App
