import { useEffect, useMemo, useState } from 'react'
import api from '../services/api'
import { Link, useSearchParams } from 'react-router-dom'
import ProgressBar from '../components/ProgressBar'

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

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search] = useSearchParams()
  const currentUser = useMemo(parseUser, [])
  const currentUserId = currentUser?._id || currentUser?.id

  useEffect(() => {
    // optional: confirm session fallback if coming from Stripe
    const sessionId = search.get('session_id')
    if (sessionId) {
      api.get(`/orders/confirm-session?session_id=${sessionId}`).catch(() => {})
    }

    const load = async () => {
      try {
        setLoading(true)
        const res = await api.get('/orders')
        setOrders(res.data || [])
        setError('')
      } catch (err) {
        console.error('Failed to fetch orders:', err)
        setError('Failed to fetch orders')
      } finally {
        setLoading(false)
      }
    }

    load()
    const t = setInterval(load, 5000) // 👀 poll for live progress
    return () => clearInterval(t)
  }, [search])

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white relative overflow-hidden">
      <BGDecor />

      {/* header */}
      <header className="relative z-10 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 py-5 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight">My Orders</h1>
          <div className="flex items-center gap-3 text-sm">
            <Link to="/marketplace" className="px-3 py-1.5 rounded bg-white/10 border border-white/10 hover:bg-white/20">
              ← Back to marketplace
            </Link>
          </div>
        </div>
      </header>

      {/* content */}
      <main className="relative z-10 mx-auto max-w-7xl px-5 lg:px-8 py-8">
        {/* states */}
        {loading && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white/80">
            Loading orders…
          </div>
        )}

        {error && !loading && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-200">
            {error}
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <div className="text-lg font-semibold">No orders yet</div>
            <p className="text-white/70 mt-1">Buy a gig to see it appear here.</p>
            <div className="mt-4">
              <Link
                to="/marketplace"
                className="inline-block px-4 py-2 rounded-lg bg-emerald-400 text-black hover:bg-emerald-300 text-sm"
              >
                Browse gigs
              </Link>
            </div>
          </div>
        )}

        {/* table */}
        {!loading && !error && orders.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-white/70 border-b border-white/10">
                  <th className="px-4 py-3">Gig</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Progress</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const isClient = order?.buyerId?._id === currentUserId
                  const otherUser = isClient ? order?.sellerId : order?.buyerId
                  const otherUserId = otherUser?._id
                  const status = String(order?.status || 'unknown').toLowerCase()
                  const progress = Number(order?.progress ?? 0)

                  return (
                    <tr key={order._id} className="border-t border-white/10 align-top">
                      <td className="px-4 py-3">
                        <div className="font-medium">{order?.gigId?.title || '—'}</div>
                        <div className="text-white/60 text-xs">{order?.gigId?.category || ''}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded bg-white/10 border border-white/10">
                          {isClient ? 'Client' : 'Freelancer'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="min-w-[160px] max-w-[220px]">
                            <ProgressBar value={progress} />
                          </div>
                          <div className="text-white/70 w-10 text-right">{progress}%</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {order?.gigId?._id && (
                            <Link
                              to={`/gigs/${order.gigId._id}`}
                              className="px-3 py-1.5 rounded bg-white/10 border border-white/10 hover:bg-white/20"
                            >
                              View gig
                            </Link>
                          )}
                          {otherUserId ? (
                            <Link
                              to={`/chat/${otherUserId}`}
                              className="px-3 py-1.5 rounded bg-emerald-400 text-black hover:bg-emerald-300"
                            >
                              Message
                            </Link>
                          ) : (
                            <span className="text-white/50">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
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
            'linear-gradient(transparent 0, rgba(255,255,255,.05) 2px, transparent 2px), linear-gradient(90deg, transparent 0, rgba(255,255,255,.04) 2px, transparent 2px)',
          backgroundSize: '24px 24px'
        }}
      />
    </>
  )
}
