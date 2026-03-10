import { useState } from 'react'
import './SettingsModal.css'

export default function SettingsModal({ settings, onSave, onClose }) {
  const [form, setForm] = useState({ ...settings })
  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Settings</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
              <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
            </svg>
          </button>
        </div>

        <form className="modal-body" onSubmit={e => { e.preventDefault(); onSave(form) }}>
          <div className="field">
            <label>Provider</label>
            <select value="gemini" disabled>
              <option value="gemini">Gemini API</option>
            </select>
            <span className="hint">This app is configured for Gemini API.</span>
          </div>

          <div className="field">
            <label>API Base URL</label>
            <input
              type="url"
              value={form.apiBaseUrl}
              onChange={e => set('apiBaseUrl', e.target.value)}
              placeholder="https://generativelanguage.googleapis.com/v1beta"
            />
            <span className="hint">Use Gemini base URL: https://generativelanguage.googleapis.com/v1beta</span>
          </div>

          <div className="field">
            <label>API Key</label>
            <input
              type="password"
              value={form.apiKey}
              onChange={e => set('apiKey', e.target.value)}
              placeholder="AIza... or sk-..."
              autoComplete="off"
            />
            <span className="hint">Stored only in your browser's localStorage.</span>
          </div>

          <div className="field">
            <label>Model</label>
            <input
              type="text"
              value={form.model}
              onChange={e => set('model', e.target.value)}
              placeholder="gemini-2.5-flash"
            />
            <span className="hint">Recommended default: gemini-2.5-flash</span>
          </div>

          <div className="field-row">
            <div className="field">
              <label>Temperature — {form.temperature}</label>
              <input
                type="range" min="0" max="2" step="0.05"
                value={form.temperature}
                onChange={e => set('temperature', parseFloat(e.target.value))}
              />
            </div>
            <div className="field">
              <label>Max Tokens</label>
              <input
                type="number" min="256" max="32768" step="256"
                value={form.maxTokens}
                onChange={e => set('maxTokens', parseInt(e.target.value, 10))}
              />
            </div>
          </div>

          <div className="field">
            <label>System Prompt</label>
            <textarea
              value={form.systemPrompt}
              onChange={e => set('systemPrompt', e.target.value)}
              rows={4}
              placeholder="You are a helpful AI assistant."
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-save">Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}
