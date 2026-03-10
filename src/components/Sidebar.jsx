import { useState } from 'react'
import './Sidebar.css'

function ConversationItem({ conv, isActive, onSelect, onDelete }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      className={`conv-item ${isActive ? 'active' : ''}`}
      onClick={() => onSelect(conv.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <svg className="conv-icon" viewBox="0 0 16 16" fill="currentColor">
        <path d="M2.678 11.894a1 1 0 0 1 .287.801 11 11 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8 8 0 0 0 8 14c3.996 0 7-2.807 7-6s-3.004-6-7-6-7 2.808-7 6c0 1.468.617 2.83 1.678 3.894"/>
      </svg>
      <span className="conv-title">{conv.title || 'New Chat'}</span>
      {hovered && (
        <button
          className="conv-delete"
          onClick={e => { e.stopPropagation(); onDelete(conv.id) }}
          title="Delete"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12">
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
            <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
          </svg>
        </button>
      )}
    </div>
  )
}

export default function Sidebar({ conversations, activeConvId, onSelect, onNew, onDelete, onSettings }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
          <span>GenAI</span>
        </div>
        <button className="new-chat-btn" onClick={onNew} title="New chat">
          <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
          </svg>
          New
        </button>
      </div>

      <div className="sidebar-list">
        {conversations.map(conv => (
          <ConversationItem
            key={conv.id}
            conv={conv}
            isActive={conv.id === activeConvId}
            onSelect={onSelect}
            onDelete={onDelete}
          />
        ))}
      </div>

      <div className="sidebar-footer">
        <button className="settings-btn" onClick={onSettings}>
          <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
            <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
          </svg>
          Settings
        </button>
      </div>
    </aside>
  )
}
