// client/src/pages/Chat.jsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'
import io from 'socket.io-client'

const WS_ORIGIN = (import.meta.env.VITE_WS_BASE || 'http://localhost:5000')

export default function Chat() {
  const { userId: peerId } = useParams()
  const [peerName, setPeerName] = useState('User')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const scrollerRef = useRef(null)

  const currentUser = useMemo(() => {
    try {
      const raw = localStorage.getItem('user')
      const obj = raw ? JSON.parse(raw) : {}
      return obj?.user ? obj.user : obj
    } catch {
      return {}
    }
  }, [])
  const currentUserId = currentUser?.id || currentUser?._id

  // Normalize any shape coming from API into {from, to, body, createdAt, _id}
  const normalize = (m) => ({
    from: m.from ?? m.senderId ?? m.sender ?? m.userId,
    to: m.to ?? m.receiverId ?? m.recipientId,
    body: m.body ?? m.content ?? m.message ?? '',
    createdAt: m.createdAt ?? m.created_at ?? m.timestamp ?? new Date().toISOString(),
    _id: m._id ?? m.id ?? `${(m.senderId || m.from || 'msg')}_${m.timestamp || Date.now()}`,
  })

  // Initial load
  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      try {
        const [msgsRes, userRes] = await Promise.all([
          api.get(`/messages/${peerId}`).catch(() => ({ data: [] })),
          api.get(`/users/${peerId}`).catch(() => ({ data: null })),
        ])
        if (!mounted) return
        const list = Array.isArray(msgsRes.data) ? msgsRes.data.map(normalize) : []
        setMessages(list)
        setPeerName(userRes?.data?.username || userRes?.data?.name || 'User')
      } finally {
        if (mounted) setLoading(false)
        scrollToBottomSoon()
      }
    })()
    return () => { mounted = false }
  }, [peerId])

  // Live updates via socket
  useEffect(() => {
    if (!currentUserId) return
    const socket = io(WS_ORIGIN, { withCredentials: true })
    const evt = `message_${currentUserId}`
    const onInbound = (raw) => {
      const msg = normalize(raw)
      const other = msg.from === currentUserId ? msg.to : msg.from
      if (String(other) === String(peerId)) {
        setMessages(prev => [...prev, msg])
        scrollToBottomSoon()
      }
    }
    socket.on(evt, onInbound)
    return () => socket.disconnect()
  }, [peerId, currentUserId])

  const sendMessage = async () => {
    const trimmed = text.trim()
    if (!trimmed || sending || !currentUserId) return
    const draft = {
      _id: `tmp_${Date.now()}`,
      from: currentUserId,
      to: peerId,
      body: trimmed,
      createdAt: new Date().toISOString(),
      pending: true,
    }
    setMessages(prev => [...prev, draft])
    setText('')
    setSending(true)
    scrollToBottomSoon()

    try {
      // Prefer REST if available
      const res = await api.post('/messages', { to: peerId, body: trimmed })
      if (res?.data) {
        const saved = normalize(res.data)
        setMessages(prev => {
          const next = prev.slice()
          const idx = next.findIndex(m => m._id === draft._id)
          if (idx !== -1) next[idx] = { ...saved, pending: false }
          else next.push({ ...saved, pending: false })
          return next
        })
      } else {
        // Fallback to socket emit
        const socket = io(WS_ORIGIN, { withCredentials: true })
        socket.emit('send_message', {
          senderId: currentUserId,
          receiverId: peerId,
          content: trimmed,
        })
        socket.disconnect()
      }
    } catch {
      // Fallback to socket on error
      const socket = io(WS_ORIGIN, { withCredentials: true })
      socket.emit('send_message', {
        senderId: currentUserId,
        receiverId: peerId,
        content: trimmed,
      })
      socket.disconnect()
    } finally {
      setSending(false)
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const scrollToBottomSoon = () => {
    requestAnimationFrame(() => {
      if (scrollerRef.current) {
        scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight
      }
    })
  }

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white relative overflow-hidden">
      <BGDecor />

      {/* Header */}
      <header className="relative z-10 border-b border-white/10">
        <div className="mx-auto max-w-5xl px-5 lg:px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">Chat with {peerName}</h1>
            <div className="text-xs text-white/60">ID: {peerId}</div>
          </div>
          <Link to={-1} className="px-3 py-1.5 rounded bg-white/10 border border-white/10 hover:bg-white/20 text-sm">
            ← Back
          </Link>
        </div>
      </header>

      {/* Chat panel */}
      <main className="relative z-10 mx-auto max-w-5xl px-5 lg:px-8 py-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
          {/* Messages scroller */}
          <div ref={scrollerRef} className="h-[65vh] overflow-y-auto p-4">
            {loading ? (
              <div className="text-sm text-white/70">Loading messages…</div>
            ) : messages.length === 0 ? (
              <div className="text-sm text-white/70">No messages yet — say hi 👋</div>
            ) : (
              <ul className="space-y-3">
                {messages.map((m) => {
                  const mine = String(m.from) === String(currentUserId)
                  const text = m.body || ''
                  return (
                    <li
                      key={m._id || `${m.from}-${m.createdAt}`}
                      className={`max-w-[85%] ${mine ? 'ml-auto text-right' : 'mr-auto text-left'}`}
                    >
                      <div
                        className={`inline-block rounded-2xl px-3 py-2 text-sm border
                          ${mine
                            ? 'bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-500 text-black border-transparent'
                            : 'bg-white/10 text-white border-white/10'}`}
                      >
                        <div className="whitespace-pre-wrap break-words">{text}</div>
                        <div className={`mt-1 text-[10px] ${mine ? 'text-black/70' : 'text-white/70'}`}>
                          {new Date(m.createdAt || Date.now()).toLocaleString()}
                          {m.pending && ' · sending…'}
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {/* Composer */}
          <div className="border-t border-white/10 p-3">
            <div className="flex gap-2">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={onKeyDown}
                className="flex-1 resize-none rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm h-12 outline-none focus:border-emerald-400"
                placeholder="Write a message…"
              />
              <button
                onClick={sendMessage}
                disabled={!text.trim() || sending}
                className="px-4 py-2.5 rounded-lg bg-emerald-400 text-black font-semibold hover:bg-emerald-300 disabled:opacity-60"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

/* background */
function BGDecor() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-40 bg-[radial-gradient(90rem_70rem_at_120%_-10%,rgba(16,185,129,0.18),transparent_60%),radial-gradient(70rem_50rem_at_-10%_0%,rgba(99,102,241,0.16),transparent_60%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage:
            'linear-gradient(transparent 0, rgba(255,255,255,.05) 2px, transparent 2px), linear-gradient(90deg, transparent 0, rgba(255,255,255,.04) 2px, transparent 2px)',
          backgroundSize: '24px 24px'
        }}
      />
    </>
  )
}
