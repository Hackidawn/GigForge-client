// client/src/pages/Home.jsx
import { useEffect, useState, useMemo } from 'react'
import api from '../services/api'
import { Link, useNavigate } from 'react-router-dom'

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

export default function Home() {
  const [gigs, setGigs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState('all')
  const navigate = useNavigate()

  const currentUser = useMemo(parseUser, [])
  const role = (currentUser?.role || '').toLowerCase()
  const isFreelancer = role === 'freelancer' || role === 'seller'
  const isBuyer = role === 'buyer' || role === 'client' || role === 'customer'

  useEffect(() => {
    api.get('/gigs')
      .then(res => setGigs(res.data))
      .catch(err => {
        console.error('Failed to fetch gigs:', err)
        setError('Failed to load gigs')
      })
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    navigate('/login')
  }

  const handleDelete = async (gigId) => {
    const confirm = window.confirm('Are you sure you want to delete this gig?')
    if (!confirm) return
    try {
      await api.delete(`/gigs/${gigId}`)
      setGigs(prev => prev.filter(g => g._id !== gigId))
      alert('🗑️ Gig deleted')
    } catch (err) {
      console.error('Failed to delete gig', err)
      alert('❌ Failed to delete gig')
    }
  }

  const filteredGigs = tab === 'mine'
    ? gigs.filter(gig => (gig.userId === currentUser?._id) || (gig.userId === currentUser?.id))
    : gigs

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white relative overflow-hidden">
      <BGDecor />

      {/* Header */}
      <header className="relative z-10 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 py-5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 via-cyan-400 to-indigo-500" />
            <span className="text-xl font-extrabold tracking-tight">GigForge</span>
          </Link>
          <div className="flex items-center gap-3">
            {currentUser ? (
              <>
                <Link
                  to="/profile"
                  className="px-3 py-2 rounded-lg bg-white/10 border border-white/10 hover:bg-white/20 text-sm"
                >
                  🙍 Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-lg bg-red-500/90 hover:bg-red-500 text-white text-sm"
                >
                  🔓 Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-lg bg-white/10 border border-white/10 hover:bg-white/20 text-sm"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-2 rounded-lg bg-emerald-400 text-black hover:bg-emerald-300 text-sm"
                >
                  Join
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Toolbar + Title */}
      <div className="relative z-10">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Marketplace</h1>
              <p className="text-white/70 mt-1">Browse gigs from the GigForge community.</p>
            </div>

            {/* Role toolbars */}
            <div className="flex flex-wrap gap-2">
              {currentUser && isFreelancer && (
                <>
                  <Link
                    to="/freelancer-dashboard"
                    className="px-4 py-2 rounded-lg bg-white/10 border border-white/10 hover:bg-white/20 text-sm"
                  >
                    📊 Freelancer Dashboard
                  </Link>
                  <Link
                    to="/create-gig"
                    className="px-4 py-2 rounded-lg bg-emerald-400 text-black hover:bg-emerald-300 text-sm"
                  >
                    ➕ Add New Gig
                  </Link>
                </>
              )}

              {currentUser && isBuyer && (
                <>
                  <Link
                    to="/client-dashboard"
                    className="px-4 py-2 rounded-lg bg-white/10 border border-white/10 hover:bg-white/20 text-sm"
                  >
                    🧑‍💼 Client Dashboard
                  </Link>
                  <Link
                    to="/orders"
                    className="px-4 py-2 rounded-lg bg-indigo-500/90 hover:bg-indigo-500 text-white text-sm"
                  >
                    📦 My Orders
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Tabs */}
          {currentUser && (
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setTab('all')}
                className={`px-4 py-2 rounded-lg text-sm border ${
                  tab === 'all'
                    ? 'bg-white/20 border-white/20'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                🌍 All Gigs
              </button>
              {isFreelancer && (
                <button
                  onClick={() => setTab('mine')}
                  className={`px-4 py-2 rounded-lg text-sm border ${
                    tab === 'mine'
                      ? 'bg-white/20 border-white/20'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  👤 My Gigs
                </button>
              )}
            </div>
          )}

          {/* States */}
          <div className="mt-6">
            {loading && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white/80">
                Loading gigs…
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-200">
                {error}
              </div>
            )}

            {!loading && !error && filteredGigs.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                <div className="text-lg font-semibold">No gigs found</div>
                <p className="text-white/70 mt-1">
                  {tab === 'mine' ? 'You have not created any gigs yet.' : 'There are no gigs available right now.'}
                </p>
                {isFreelancer && tab === 'mine' && (
                  <div className="mt-4">
                    <Link
                      to="/create-gig"
                      className="inline-block px-4 py-2 rounded-lg bg-emerald-400 text-black hover:bg-emerald-300 text-sm"
                    >
                      Create your first gig
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Grid */}
            {!loading && !error && filteredGigs.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGigs.map((gig) => (
                  <div key={gig._id} className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3 hover:bg-white/10 transition">
                    <h3 className="font-semibold text-lg line-clamp-1">{gig.title}</h3>
                    <p className="text-sm text-white/80 line-clamp-3">
                      {gig.description?.length ? gig.description : 'No description'}
                    </p>
                    <div className="text-sm text-white/80">
                      <span className="text-white/60">Price:</span>{' '}
                      <span className="font-medium">${Number(gig.price || 0)}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <Link
                        to={`/gigs/${gig._id}`}
                        className="text-emerald-300 hover:text-emerald-200 text-sm"
                      >
                        🔍 View
                      </Link>

                      {/* Owner actions */}
                      {currentUser && isFreelancer && (gig.userId === currentUser?.id || gig.userId === currentUser?._id) && tab === 'mine' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/edit-gig/${gig._id}`)}
                            className="px-3 py-1.5 rounded bg-yellow-400/90 hover:bg-yellow-400 text-black text-sm"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(gig._id)}
                            className="px-3 py-1.5 rounded bg-red-500/90 hover:bg-red-500 text-white text-sm"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* simple background like the landing */
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
