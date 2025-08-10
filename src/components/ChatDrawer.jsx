// client/src/components/ChatDrawer.jsx
import { useEffect, useMemo, useRef, useState } from 'react'
import io from 'socket.io-client'
import api from '../services/api'

// Infer WS origin from API base (same pattern you use in FreelancerDashboard)
const WS_ORIGIN = (import.meta.env.VITE_WS_BASE || 'http://localhost:5000')

export default function ChatDrawer({
  isOpen,
  onClose,
  peerId,       // userId of the other participant
  peerName,     // optional label for header
  onOpenFull,   // () => void (navigate to /chat/:peerId)
}) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [text, setText] = useState('')
  const scrollerRef = useRef(null)

  const currentUser = useMemo(
    () => JSON.parse(localStorage.getItem('user') || '{}'),
    []
  )

  // local socket for the drawer (connects only when open)
  useEffect(() => {
    if (!isOpen) return
    const socket = io(WS_ORIGIN, { withCredentials: true })

    const inboundEvent = `message_${currentUser.id}`
    const onInbound = (msg) => {
      // accept only messages for this peer
      const other = msg.from === currentUser.id ? msg.to : msg.from
      if (other === peerId) {
        setMessages(prev => [...prev, msg])
        scrollToBottomSoon()
      }
    }

    socket.on(inboundEvent, onInbound)

    // optional: if your server supports asking history via sockets
    // socket.emit('get_messages', { a: currentUser.id, b: peerId })
    // socket.on('messages_history', (list) => setMessages(Array.isArray(list) ? list : []))

    return () => socket.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, peerId, currentUser?.id])

  // Try to load history via REST when the drawer opens (fallback-friendly)
  useEffect(() => {
    let mounted = true
    const load = async () => {
      if (!isOpen || !peerId) return
      setLoading(true)
      try {
        const res = await api.get(`/messages/${peerId}`)
        if (mounted) setMessages(res.data || [])
      } catch {
        // ignore if REST not available; you can rely solely on live socket flow
      } finally {
        if (mounted) setLoading(false)
        scrollToBottomSoon()
      }
    }
    load()
    return () => { mounted = false }
  }, [isOpen, peerId])

  const sendMessage = async () => {
    const trimmed = text.trim()
    if (!trimmed || sending || !peerId) return

    // optimistic append
    const draft = {
      _id: `tmp_${Date.now()}`,
      tempId: `tmp_${Date.now()}`,
      from: currentUser.id,
      to: peerId,
      body: trimmed,
      createdAt: new Date().toISOString(),
      pending: true,
    }
    setMessages(prev => [...prev, draft])
    setText('')
    setSending(true)
    scrollToBottomSoon()

    // try REST first (if available), then socket emit as a fallback
    try {
      const res = await api.post('/messages', { to: peerId, body: trimmed, tempId: draft.tempId })
      if (res?.data?._id) {
        setMessages(prev => {
          const idx = prev.findIndex(m => m.tempId === draft.tempId)
          if (idx !== -1) {
            const next = prev.slice()
            next[idx] = { ...res.data, pending: false }
            return next
          }
          return prev
        })
      } else {
        // No REST response? fire socket event anyway
        const socket = io(WS_ORIGIN, { withCredentials: true })
        socket.emit('send_message', {
          senderId: currentUser.id,
          receiverId: peerId,
          content: trimmed,
          tempId: draft.tempId,
        })
        socket.disconnect()
      }
    } catch {
      // Fallback to socket if REST fails
      const socket = io(WS_ORIGIN, { withCredentials: true })
      socket.emit('send_message', {
        senderId: currentUser.id,
        receiverId: peerId,
        content: trimmed,
        tempId: draft.tempId,
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
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 transition-opacity ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />
      {/* Drawer */}
      <aside
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transition-transform duration-300
        ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <div className="min-w-0">
            <h3 className="font-semibold truncate">Chat with {peerName || 'User'}</h3>
            <p className="text-xs text-gray-500 truncate">ID: {peerId}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenFull}
              className="text-sm px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
              title="Open full chat page"
            >
              ↗ Full chat
            </button>
            <button
              onClick={onClose}
              className="text-xl leading-none px-2 py-1 rounded hover:bg-gray-100"
              aria-label="Close chat"
            >
              ×
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollerRef} className="flex-1 overflow-y-auto p-3">
          {loading ? (
            <div className="text-sm text-gray-500">Loading messages…</div>
          ) : messages.length === 0 ? (
            <div className="text-sm text-gray-500">Say hi 👋</div>
          ) : (
            <ul className="space-y-2">
              {messages.map(m => {
                const mine = m.from === currentUser.id || m.senderId === currentUser.id
                return (
                  <li key={m._id || m.tempId} className={`max-w-[85%] ${mine ? 'ml-auto text-right' : 'mr-auto text-left'}`}>
                    <div className={`inline-block rounded px-3 py-2 text-sm
                      ${mine ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                      <div className="whitespace-pre-wrap break-words">{m.body || m.content}</div>
                      <div className="mt-1 text-[10px] opacity-75">
                        {new Date(m.createdAt || m.created_at || Date.now()).toLocaleString()}
                        {m.pending && ' · sending…'}
                        {m.failed && ' · failed'}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Composer */}
        <div className="border-t p-2">
          <div className="flex gap-2">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={onKeyDown}
              className="flex-1 resize-none rounded border px-3 py-2 text-sm h-10"
              placeholder="Write a message…"
            />
            <button
              onClick={sendMessage}
              disabled={!text.trim() || sending}
              className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50 hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
