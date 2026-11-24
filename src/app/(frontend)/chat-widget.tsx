'use client'

import React, { useEffect, useRef, useState } from 'react'

import { ChatBubble } from '@/components/organisms/chat-bubble'

const SESSION_KEY = 'arr.chat.session'

type Message = {
  author: string
  own?: boolean
  text: string
}

function getSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY)
  if (!id) {
    id =
      typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    localStorage.setItem(SESSION_KEY, id)
  }
  return id
}

// Visitor chat widget — fixed bubble bottom-right, opens a panel that
// relays to POST /api/chat (which proxies the configured chat backend).
// The AI disclosure renders as the first message before input is enabled
// (EU AI Act Art. 50(1)); the session id persists in localStorage.
export function ChatWidget({
  disclosure,
  endpoint = '/api/chat',
  greeting,
  title,
}: {
  disclosure: string
  endpoint?: string
  greeting?: string
  title: string
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<null | string>(null)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [open, setOpen] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages, open])

  const openPanel = () => {
    setOpen(true)
    setMessages((prev) => {
      if (prev.length > 0) {
        return prev
      }
      const intro: Message[] = [{ author: title, text: disclosure }]
      if (greeting) {
        intro.push({ author: title, text: greeting })
      }
      return intro
    })
  }

  const send = async (event: React.FormEvent) => {
    event.preventDefault()
    const text = input.trim()
    if (!text || busy) {
      return
    }
    setInput('')
    setError(null)
    setMessages((prev) => [...prev, { author: 'Du', own: true, text }])
    setBusy(true)
    try {
      const res = await fetch(endpoint, {
        body: JSON.stringify({
          chatInput: text,
          metadata: { page: window.location.pathname },
          sessionId: getSessionId(),
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      const data = (await res.json()) as { error?: string; reply?: string }
      if (res.ok && data.reply) {
        setMessages((prev) => [...prev, { author: title, text: data.reply! }])
      } else {
        setError(
          'Die Nachricht konnte nicht zugestellt werden. Bitte später erneut versuchen.',
        )
      }
    } catch {
      setError('Keine Verbindung. Bitte später erneut versuchen.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="chat-widget" data-open={open || undefined}>
      {open ? (
        <section
          aria-label={`Chat mit ${title}`}
          className="chat-widget-panel"
        >
          <header className="chat-widget-header">
            <p className="chat-widget-title">{title}</p>
            <button
              aria-label="Chat schließen"
              className="chat-widget-close"
              onClick={() => setOpen(false)}
              type="button"
            >
              ×
            </button>
          </header>
          <div className="chat-widget-messages" ref={listRef}>
            {messages.map((message, index) => (
              <ChatBubble
                author={message.author}
                key={index}
                own={message.own}
                text={message.text}
              />
            ))}
            {busy ? (
              <p className="chat-widget-typing">{title} schreibt …</p>
            ) : null}
          </div>
          {error ? <p className="chat-widget-error">{error}</p> : null}
          <form className="chat-widget-form" onSubmit={send}>
            <input
              aria-label="Nachricht"
              autoFocus
              className="chat-widget-input"
              maxLength={2000}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Nachricht schreiben …"
              type="text"
              value={input}
            />
            <button
              aria-label="Senden"
              className="chat-widget-send"
              disabled={busy || !input.trim()}
              type="submit"
            >
              <svg
                aria-hidden="true"
                fill="none"
                height="20"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="20"
              >
                <path d="M22 2 11 13" />
                <path d="M22 2 15 22l-4-9-9-4Z" />
              </svg>
            </button>
          </form>
        </section>
      ) : (
        <button
          aria-label={`Chat mit ${title} öffnen`}
          className="chat-widget-fab"
          onClick={openPanel}
          type="button"
        >
          <svg
            aria-hidden="true"
            fill="none"
            height="24"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="24"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8Z" />
          </svg>
        </button>
      )}
    </div>
  )
}
