import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../services/api'

export default function EditGig() {
  const { gigId } = useParams()
  const navigate = useNavigate()
  const [gig, setGig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get(`/gigs/${gigId}`)
      .then(res => setGig(res.data))
      .catch(() => setError('Failed to fetch gig'))
      .finally(() => setLoading(false))
  }, [gigId])

  const handleChange = e => {
    const { name, value } = e.target
    setGig(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await api.put(`/gigs/${gigId}`, gig)
      alert('✅ Gig updated')
      navigate('/marketplace') // ✅ go to marketplace
    } catch (err) {
      alert('❌ Failed to update gig')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0b0c10] text-white relative overflow-hidden">
      <BGDecor />
      <div className="relative z-10 mx-auto max-w-3xl px-6 py-10">Loading…</div>
    </div>
  )
  if (error) return (
    <div className="min-h-screen bg-[#0b0c10] text-white relative overflow-hidden">
      <BGDecor />
      <div className="relative z-10 mx-auto max-w-3xl px-6 py-10 text-red-300">{error}</div>
    </div>
  )
  if (!gig) return null

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white relative overflow-hidden">
      <BGDecor />

      <header className="relative z-10 border-b border-white/10">
        <div className="mx-auto max-w-3xl px-6 py-5 flex items-center justify-between">
          <h1 className="text-xl font-extrabold tracking-tight">Edit Gig</h1>
          <Link to="/marketplace" className="text-white/80 hover:text-white text-sm">← Back to marketplace</Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-3xl px-6 py-8">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1 text-white/80">Title</label>
              <input
                type="text"
                name="title"
                value={gig.title || ''}
                onChange={handleChange}
                placeholder="Title"
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-white/80">Description</label>
              <textarea
                name="description"
                value={gig.description || ''}
                onChange={handleChange}
                placeholder="Description"
                rows="5"
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-white/80">Price (USD)</label>
              <input
                type="number"
                name="price"
                value={gig.price || ''}
                onChange={handleChange}
                placeholder="Price"
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 outline-none focus:border-emerald-400"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-emerald-400 text-black font-semibold py-2.5 hover:bg-emerald-300 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>
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
