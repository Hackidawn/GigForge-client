// client/src/pages/Checkout.jsx
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import api from '../services/api'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY)

export default function Checkout() {
  const { gigId } = useParams()
  const [gig, setGig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        setError('')
        const res = await api.get(`/gigs/${gigId}`)
        if (!mounted) return
        setGig(res.data)
      } catch (e) {
        console.error('Failed to load gig:', e)
        setError('Failed to load gig details')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [gigId])

  const handleCheckout = async () => {
    try {
      setProcessing(true)
      setError('')

      // Create Stripe session (server may return { sessionId } OR { url })
      const res = await api.post(`/orders/checkout/${gigId}`)
      const data = res?.data || {}

      if (data.sessionId) {
        const stripe = await stripePromise
        const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId })
        if (error) throw error
      } else if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('Checkout session not created')
      }
    } catch (e) {
      console.error('Checkout failed:', e)
      setError('Payment error — please try again.')
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0c10] text-white relative overflow-hidden">
        <BGDecor />
        <div className="relative z-10 mx-auto max-w-4xl px-6 py-10">Loading…</div>
      </div>
    )
  }

  if (!gig) {
    return (
      <div className="min-h-screen bg-[#0b0c10] text-white relative overflow-hidden">
        <BGDecor />
        <div className="relative z-10 mx-auto max-w-4xl px-6 py-10">Gig not found.</div>
      </div>
    )
  }

  const imageSrc = gig.imageUrl || gig.image || gig.photo || null
  const price = Number(gig.price || 0)

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white relative overflow-hidden">
      <BGDecor />

      {/* Header */}
      <header className="relative z-10 border-b border-white/10">
        <div className="mx-auto max-w-4xl px-6 py-5 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight">Checkout</h1>
          <Link to={`/gigs/${gigId}`} className="text-sm px-3 py-1.5 rounded bg-white/10 border border-white/10 hover:bg-white/20">
            ← Back to gig
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 mx-auto max-w-4xl px-6 py-8 grid lg:grid-cols-3 gap-6">
        {/* Left: summary */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex gap-4">
              {imageSrc && (
                <img
                  src={imageSrc}
                  alt={gig.title}
                  className="w-28 h-20 rounded-lg object-cover border border-white/10"
                />
              )}
              <div className="flex-1">
                <div className="text-sm text-white/70">{gig.category || 'General'}</div>
                <h2 className="text-xl font-semibold">{gig.title}</h2>
                {gig.deliveryTime && (
                  <div className="text-sm text-white/70 mt-1">⏱ {gig.deliveryTime}</div>
                )}
              </div>
              <div className="text-right">
                <div className="text-white/60 text-xs">Price</div>
                <div className="text-2xl font-bold">${price}</div>
              </div>
            </div>

            {gig.description && (
              <p className="text-white/80 mt-4">{gig.description}</p>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="font-semibold">Payment method</h3>
            <p className="text-white/70 text-sm mt-1">
              You’ll be securely redirected to Stripe Checkout to complete your purchase.
            </p>
            <ul className="mt-3 text-white/80 text-sm space-y-1">
              <li>• Cards (Visa, Mastercard, Amex)</li>
              <li>• Wallets (Apple Pay, Google Pay)</li>
            </ul>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-red-200">
              {error}
            </div>
          )}
        </div>

        {/* Right: totals + CTA */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex justify-between text-sm text-white/80">
              <span>Subtotal</span>
              <span>${price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-white/80 mt-2">
              <span>Fees</span>
              <span>$0.00</span>
            </div>
            <hr className="my-3 border-white/10" />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>${price.toFixed(2)}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={processing}
              className="mt-4 w-full rounded-lg bg-emerald-400 text-black font-semibold py-2.5 hover:bg-emerald-300 disabled:opacity-60"
            >
              {processing ? 'Redirecting…' : '💳 Pay Now'}
            </button>
            <p className="text-xs text-white/60 mt-2">
              By paying, you agree to our Terms & Refund Policy.
            </p>
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
