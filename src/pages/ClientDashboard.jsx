// client/src/pages/ClientDashboard.jsx
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import ProgressBar from '../components/ProgressBar'
import ChatDrawer from '../components/ChatDrawer'

function parseUser() {
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return null
    const obj = JSON.parse(raw)
    return obj?.user ? obj.user : obj
  } catch {
    return null
  }
}

export default function ClientDashboard() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // chat drawer state
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [chatPeerId, setChatPeerId] = useState(null)
  const [chatPeerName, setChatPeerName] = useState('')

  const navigate = useNavigate()
  const currentUser = useMemo(parseUser, [])
  const currentUserId = currentUser?._id || currentUser?.id

  // helper to match either string id or populated object
  const isMine = (val) => {
    if (!val || !currentUserId) return false
    if (typeof val === 'string') return String(val) === String(currentUserId)
    if (typeof val === 'object') return String(val._id || val.id) === String(currentUserId)
    return false
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        const res = await api.get('/orders')
        if (!mounted) return
        const list = Array.isArray(res.data) ? res.data : []
        const mine = list.filter(o => isMine(o.buyerId))
        setOrders(mine)
      } catch (err) {
        console.error(err)
        setError('Failed to load your orders')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [currentUserId])

  const openChatDrawer = (sellerId, sellerName) => {
    if (!sellerId) return
    setChatPeerId(sellerId)
    setChatPeerName(sellerName || 'Seller')
    setDrawerOpen(true)
  }

  const openFullChat = () => {
    if (chatPeerId) navigate(`/chat/${chatPeerId}`)
  }

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white relative overflow-hidden">
      <BGDecor />

      {/* Header */}
      <header className="relative z-10 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 py-5 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight">Your Purchases</h1>
          <Link to="/marketplace" className="px-3 py-1.5 rounded bg-white/10 border border-white/10 hover:bg-white/20 text-sm">
            ← Back to marketplace
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 mx-auto max-w-7xl px-5 lg:px-8 py-8">
        {loading && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white/80">
            Loading…
          </div>
        )}

        {error && !loading && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-200">
            {error}
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <div className="text-lg font-semibold">You haven’t purchased any gigs yet.</div>
            <p className="text-white/70 mt-1">Browse the marketplace to get started.</p>
            <div className="mt-4">
              <Link
                to="/marketplace"
                className="inline-block px-4 py-2 rounded-lg bg-emerald-400 text-black hover:bg-emerald-300 text-sm"
              >
                Explore gigs
              </Link>
            </div>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-white/70 border-b border-white/10">
                  <th className="px-4 py-3">Gig</th>
                  <th className="px-4 py-3">Seller</th>
                  <th className="px-4 py-3">Progress</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const gigObj = typeof o.gigId === 'object' ? o.gigId : null
                  const gigId = gigObj?._id || o.gigId
                  const gigTitle =
                    gigObj?.title || o.gig?.title || o.gigTitle || 'Gig'

                  const sellerObj = typeof o.sellerId === 'object' ? o.sellerId : null
                  const sellerId = sellerObj?._id || o.sellerId
                  const sellerName =
                    o.seller?.name ||
                    sellerObj?.username ||
                    sellerObj?.name ||
                    o.sellerName ||
                    'Seller'

                  const progress = Number(o.progress ?? 0)
                  const status = String(o.status || 'unknown').toLowerCase()

                  return (
                    <tr key={o._id} className="border-t border-white/10 align-top">
                      <td className="px-4 py-3">
                        {gigId ? (
                          <Link to={`/gigs/${gigId}`} className="text-emerald-300 hover:text-emerald-200">
                            {gigTitle}
                          </Link>
                        ) : (
                          <span className="text-white/80">{gigTitle}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">{sellerName}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="min-w-[160px] max-w-[220px]">
                            <ProgressBar value={progress} />
                          </div>
                          <div className="text-white/70 w-10 text-right">{progress}%</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={status} />
                      </td>
                      <td className="px-4 py-3">
                        {sellerId ? (
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => openChatDrawer(sellerId, sellerName)}
                              className="px-3 py-1.5 rounded bg-white/10 border border-white/10 hover:bg-white/20"
                              title="Open chat drawer with the seller"
                            >
                              💬 Chat
                            </button>
                            <Link
                              to={`/chat/${sellerId}`}
                              className="px-3 py-1.5 rounded bg-emerald-400 text-black hover:bg-emerald-300"
                              title="Open full chat page"
                            >
                              ↗ Full chat
                            </Link>
                          </div>
                        ) : (
                          <span className="text-white/50">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Drawer */}
        <ChatDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          peerId={chatPeerId}
          peerName={chatPeerName}
          onOpenFull={openFullChat}
        />
      </main>
    </div>
  )
}

/* ---- helpers ---- */

function StatusBadge({ status }) {
  const map = {
    completed: 'bg-green-500/20 text-green-300 border-green-400/30',
    active: 'bg-yellow-500/20 text-yellow-200 border-yellow-400/30',
    cancelled: 'bg-red-500/20 text-red-200 border-red-400/30',
    pending: 'bg-white/10 text-white/80 border-white/10',
    unknown: 'bg-white/10 text-white/80 border-white/10',
  }
  const cls = map[status] || map.unknown
  return <span className={`px-2 py-1 rounded border ${cls} capitalize`}>{status}</span>
}

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
            'linear-gradient(transparent 0, rgba(255,255,255,.05) 2px, transparent 2px), linear-gradient(90deg, transparent 0, rgba(255,255,255,.04) 2px, transparent 60%)',
          backgroundSize: '24px 24px'
        }}
      />
    </>
  )
}
