/**
 * Streams a chat completion from either:
 * - OpenAI-compatible endpoints (`/chat/completions`)
 * - Google Gemini API (`:streamGenerateContent`)
 *
 * @param {Array<{role: string, content: string}>} messages
 * @param {{ apiBaseUrl: string, apiKey: string, model: string, temperature: number, maxTokens: number }} config
 * @param {AbortSignal} [signal]
 */
export async function* streamChatCompletion(messages, config, signal) {
  if (isGeminiEndpoint(config.apiBaseUrl)) {
    yield* streamGeminiCompletion(messages, config, signal)
    return
  }

  yield* streamOpenAICompatibleCompletion(messages, config, signal)
}

function isGeminiEndpoint(apiBaseUrl = '') {
  return /generativelanguage\.googleapis\.com/i.test(apiBaseUrl)
}

async function* streamOpenAICompatibleCompletion(messages, config, signal) {
  const { apiBaseUrl, apiKey, model, temperature = 0.7, maxTokens = 2048 } = config
  const url = `${apiBaseUrl.replace(/\/$/, '')}/chat/completions`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    }),
    signal,
  })

  await throwIfNotOk(response)
  yield* parseSSE(response, extractOpenAIChunk)
}

async function* streamGeminiCompletion(messages, config, signal) {
  const {
    apiBaseUrl = 'https://generativelanguage.googleapis.com/v1beta',
    apiKey,
    model = 'gemini-2.0-flash',
    temperature = 0.7,
    maxTokens = 2048,
  } = config

  const cleanBase = apiBaseUrl.replace(/\/$/, '')
  const keyQuery = apiKey ? `&key=${encodeURIComponent(apiKey)}` : ''
  const streamUrl = `${cleanBase}/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse${keyQuery}`
  const nonStreamUrl = `${cleanBase}/models/${encodeURIComponent(model)}:generateContent${keyQuery}`

  const { systemPrompt, contents } = convertToGeminiMessages(messages)
  const body = buildGeminiBody({ systemPrompt, contents, temperature, maxTokens })

  try {
    const response = await fetch(streamUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    })

    await throwIfNotOk(response)

    if (!response.body) {
      const fullText = await fetchGeminiNonStreaming(nonStreamUrl, body, signal)
      if (fullText) yield fullText
      return
    }

    yield* parseSSE(response, extractGeminiChunk)
  } catch (error) {
    if (signal?.aborted) throw error

    // Some browser/network combinations fail on SSE fetch but succeed on normal JSON responses.
    try {
      const fullText = await fetchGeminiNonStreaming(nonStreamUrl, body, signal)
      if (fullText) {
        yield fullText
        return
      }
    } catch {
      // Preserve original error below when fallback also fails.
    }

    if (error?.name === 'TypeError') {
      throw new Error(
        'Network request failed. Check API key, Gemini API URL, browser/network restrictions, and restart dev server after updating .env.'
      )
    }
    throw error
  }
}

function buildGeminiBody({ systemPrompt, contents, temperature, maxTokens }) {
  return {
    contents,
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
    },
    ...(systemPrompt
      ? { systemInstruction: { parts: [{ text: systemPrompt }] } }
      : {}),
  }
}

async function fetchGeminiNonStreaming(url, body, signal) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  })

  await throwIfNotOk(response)
  const data = await response.json()
  return extractGeminiChunk(data)
}

function convertToGeminiMessages(messages) {
  let systemPrompt = ''
  const contents = []

  for (const msg of messages) {
    if (!msg?.content) continue
    if (msg.role === 'system') {
      systemPrompt = systemPrompt
        ? `${systemPrompt}\n\n${msg.content}`
        : msg.content
      continue
    }

    if (msg.role !== 'user' && msg.role !== 'assistant') continue
    contents.push({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    })
  }

  return { systemPrompt, contents }
}

async function* parseSSE(response, getChunkFromData) {
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('data:')) continue

        const data = trimmed.slice(5).trim()
        if (!data || data === '[DONE]') continue

        try {
          const parsed = JSON.parse(data)
          const chunk = getChunkFromData(parsed)
          if (chunk) yield chunk
        } catch {
          // Skip malformed SSE lines and keep stream alive.
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

function extractOpenAIChunk(data) {
  return data?.choices?.[0]?.delta?.content || ''
}

function extractGeminiChunk(data) {
  const parts = data?.candidates?.[0]?.content?.parts
  if (!Array.isArray(parts)) return ''
  return parts
    .map(part => (typeof part?.text === 'string' ? part.text : ''))
    .join('')
}

async function throwIfNotOk(response) {
  if (response.ok) return

  let message = `HTTP ${response.status}: ${response.statusText}`
  try {
    const body = await response.json()
    message = body?.error?.message || body?.message || message
  } catch {
    // Ignore non-JSON error response bodies.
  }
  throw new Error(message)
}
