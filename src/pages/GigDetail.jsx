import { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'
import ReviewForm from '../components/ReviewForm'
import { toast } from 'react-toastify'

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

export default function GigDetail() {
  const { id } = useParams()
  const [gig, setGig] = useState(null)
  const [reviews, setReviews] = useState([])
  const currentUser = useMemo(parseUser, [])

  const fetchData = async () => {
    try {
      const gigRes = await api.get(`/gigs/${id}`)
      setGig(gigRes.data)

      const reviewsRes = await api.get(`/reviews/${id}`)
      setReviews(reviewsRes.data)
    } catch (err) {
      console.error('Failed to load gig or reviews:', err)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleDeleteReview = async (reviewId) => {
    const confirmed = confirm('Are you sure you want to delete this review?')
    if (!confirmed) return
    try {
      await api.delete(`/reviews/${reviewId}`)
      toast.success('Review deleted!')
      fetchData()
    } catch (err) {
      console.error('Failed to delete review:', err)
      toast.error('Could not delete review')
    }
  }

  // Purchase via Stripe / checkout
  const handlePurchase = async () => {
    try {
      const token = localStorage.getItem('token') // ✅ use stored token
      const res = await api.post(
        `/orders/checkout/${gig._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.data?.url) {
        window.location.href = res.data.url
      } else {
        toast.error('Failed to start payment process.')
      }
    } catch (err) {
      console.error('Payment error:', err)
      toast.error('Could not purchase gig')
    }
  }

  if (!gig) {
    return (
      <div className="min-h-screen bg-[#0b0c10] text-white relative overflow-hidden">
        <BGDecor />
        <div className="relative z-10 mx-auto max-w-4xl px-6 py-10">Loading…</div>
      </div>
    )
  }

  const role = (currentUser?.role || '').toLowerCase()
  const isClient = role === 'client' || role === 'buyer'
  const currentUserId = currentUser?.id || currentUser?._id

  const imageSrc = gig.imageUrl || gig.image || gig.photo || null

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white relative overflow-hidden">
      <BGDecor />

      <header className="relative z-10 border-b border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
          <Link to="/marketplace" className="text-white/80 hover:text-white text-sm">← Back to marketplace</Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="px-3 py-1 rounded bg-white/10 border border-white/10">{gig.category || 'General'}</span>
            {gig.deliveryTime && (
              <span className="px-3 py-1 rounded bg-white/10 border border-white/10">
                ⏱ {gig.deliveryTime}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 py-8 grid lg:grid-cols-3 gap-6">
        {/* Left: gig content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero card */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl font-extrabold tracking-tight">{gig.title}</h1>
              <div className="text-right">
                <div className="text-white/60 text-xs">Starting at</div>
                <div className="text-2xl font-bold">${Number(gig.price || 0)}</div>
              </div>
            </div>

            {imageSrc && (
              <div className="mt-5">
                <img
                  src={imageSrc}
                  alt={gig.title}
                  className="w-full rounded-xl border border-white/10"
                />
              </div>
            )}

            <p className="mt-5 text-white/80 leading-relaxed">
              {gig.description || 'No description provided.'}
            </p>
          </div>

          {/* Reviews */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Reviews</h2>
              <span className="text-white/70 text-sm">{reviews.length} total</span>
            </div>

            {reviews.length === 0 ? (
              <p className="mt-3 text-white/70">No reviews yet.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {reviews.map((r) => (
                  <div key={r._id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{r.userId?.username || 'User'}</div>
                      <div className="text-sm">⭐ {r.rating}/5</div>
                    </div>
                    <p className="text-white/80 mt-2">{r.comment}</p>

                    {currentUserId && currentUserId === r.userId?._id && (
                      <button
                        onClick={() => handleDeleteReview(r._id)}
                        className="mt-2 text-red-300 hover:text-red-200 text-sm"
                      >
                        🗑 Delete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Review form */}
            <div className="mt-5">
              <ReviewForm gigId={id} onNewReview={fetchData} />
            </div>
          </div>
        </div>

        {/* Right: purchase / meta */}
        <aside className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-white/70">Price</div>
            <div className="text-3xl font-bold mt-1">${Number(gig.price || 0)}</div>
            {isClient && (
              <button
                onClick={handlePurchase}
                className="mt-4 w-full rounded-lg bg-emerald-400 text-black font-semibold py-2.5 hover:bg-emerald-300"
              >
                Purchase Gig
              </button>
            )}
            {!isClient && (
              <p className="mt-4 text-xs text-white/60">
                Log in as a client to purchase.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-white/70">Category</div>
            <div className="font-medium mt-1">{gig.category || 'General'}</div>

            {gig.deliveryTime && (
              <>
                <div className="text-sm text-white/70 mt-4">Delivery time</div>
                <div className="font-medium mt-1">{gig.deliveryTime}</div>
              </>
            )}
          </div>
        </aside>
      </main>
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
