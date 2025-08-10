// client/src/pages/AdminPanel.jsx
import { useEffect, useState } from 'react'
import api from '../services/api'
import { Link } from 'react-router-dom'

export default function AdminPanel() {
  const [users, setUsers] = useState([])
  const [gigs, setGigs] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchAll = async () => {
    try {
      setLoading(true)
      setError('')
      const [u, g, r] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/gigs'),
        api.get('/admin/reviews'),
      ])
      setUsers(u.data || [])
      setGigs(g.data || [])
      setReviews(r.data || [])
    } catch (e) {
      console.error(e)
      setError('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const del = async (type, id) => {
    const ok = window.confirm('Are you sure you want to delete this item?')
    if (!ok) return
    try {
      await api.delete(`/admin/${type}/${id}`)
      fetchAll()
    } catch (e) {
      console.error(e)
      alert('Failed to delete')
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white relative overflow-hidden">
      <BGDecor />

      {/* Header */}
      <header className="relative z-10 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 py-5 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight">Admin Panel</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchAll}
              className="px-3 py-1.5 rounded bg-white/10 border border-white/10 hover:bg-white/20 text-sm"
            >
              Refresh
            </button>
            <Link
              to="/marketplace"
              className="px-3 py-1.5 rounded bg-emerald-400 text-black hover:bg-emerald-300 text-sm"
            >
              ← Back to marketplace
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 mx-auto max-w-7xl px-5 lg:px-8 py-8 space-y-8">
        {/* State banners */}
        {loading && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white/80">
            Loading admin data…
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-200">
            {error}
          </div>
        )}

        {/* Stats */}
        <section className="grid sm:grid-cols-3 gap-4">
          <StatCard label="Total Users" value={users.length} />
          <StatCard label="Total Gigs" value={gigs.length} />
          <StatCard label="Total Reviews" value={reviews.length} />
        </section>

        {/* Users */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Users</h2>
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-white/70 border-b border-white/10">
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3 w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-t border-white/10">
                    <td className="px-4 py-3 font-medium">{u.username}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3 capitalize">
                      <span className="px-2 py-1 rounded bg-white/10 border border-white/10">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => del('users', u._id)}
                        className="px-3 py-1.5 rounded bg-red-500/90 hover:bg-red-500 text-white"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && !loading && (
                  <tr>
                    <td colSpan="4" className="px-4 py-4 text-white/70">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Gigs */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Gigs</h2>
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-white/70 border-b border-white/10">
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3 w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                {gigs.map((g) => (
                  <tr key={g._id} className="border-t border-white/10">
                    <td className="px-4 py-3 font-medium">{g.title}</td>
                    <td className="px-4 py-3">${Number(g.price || 0)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => del('gigs', g._id)}
                        className="px-3 py-1.5 rounded bg-red-500/90 hover:bg-red-500 text-white"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {gigs.length === 0 && !loading && (
                  <tr>
                    <td colSpan="3" className="px-4 py-4 text-white/70">No gigs found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Reviews */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Reviews</h2>
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-white/70 border-b border-white/10">
                  <th className="px-4 py-3">Gig</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Comment</th>
                  <th className="px-4 py-3 w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r) => (
                  <tr key={r._id} className="border-t border-white/10 align-top">
                    <td className="px-4 py-3">{r.gigId?.title || '—'}</td>
                    <td className="px-4 py-3">⭐ {r.rating}/5</td>
                    <td className="px-4 py-3 text-white/80">{r.comment}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => del('reviews', r._id)}
                        className="px-3 py-1.5 rounded bg-red-500/90 hover:bg-red-500 text-white"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {reviews.length === 0 && !loading && (
                  <tr>
                    <td colSpan="4" className="px-4 py-4 text-white/70">No reviews found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}

/* --- tiny UI helpers --- */

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs text-white/60">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  )
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
