import { useState } from 'react'
import { useForm } from 'react-hook-form'
import api from '../services/api'
import { useNavigate, Link } from 'react-router-dom'

export default function CreateGig() {
  const { register, handleSubmit, reset } = useForm()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [errMsg, setErrMsg] = useState('')

  const onSubmit = async (data) => {
    const formData = new FormData()
    for (const key in data) formData.append(key, data[key])
    if (data.image?.[0]) formData.append('image', data.image[0])

    try {
      setErrMsg('')
      setLoading(true)
      await api.post('/gigs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      alert('Gig created')
      reset()
      navigate('/marketplace') // ✅ go to marketplace
    } catch (err) {
      console.error(err)
      setErrMsg(err?.response?.data || 'Error creating gig')
      alert(err?.response?.data || 'Error creating gig')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white relative overflow-hidden">
      <BGDecor />

      <header className="relative z-10 border-b border-white/10">
        <div className="mx-auto max-w-4xl px-6 py-5 flex items-center justify-between">
          <h1 className="text-xl font-extrabold tracking-tight">Create Gig</h1>
          <Link to="/marketplace" className="text-white/80 hover:text-white text-sm">← Back to marketplace</Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-4xl px-6 py-8">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            {errMsg && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {String(errMsg)}
              </div>
            )}

            <div>
              <label className="block text-sm mb-1 text-white/80">Title</label>
              <input {...register('title')} placeholder="e.g., Modern landing page" className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 outline-none focus:border-emerald-400" />
            </div>

            <div>
              <label className="block text-sm mb-1 text-white/80">Description</label>
              <textarea {...register('description')} rows="5" placeholder="Describe your service…" className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 outline-none focus:border-emerald-400" />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1 text-white/80">Price (USD)</label>
                <input type="number" {...register('price')} placeholder="100" className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 outline-none focus:border-emerald-400" />
              </div>
              <div>
                <label className="block text-sm mb-1 text-white/80">Category</label>
                <input {...register('category')} placeholder="Design / Development / Content…" className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 outline-none focus:border-emerald-400" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1 text-white/80">Delivery Time</label>
                <input {...register('deliveryTime')} placeholder="e.g., 5 days" className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 outline-none focus:border-emerald-400" />
              </div>
              <div>
                <label className="block text-sm mb-1 text-white/80">Cover Image</label>
                <input type="file" {...register('image')} accept="image/*" className="block w-full text-sm file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-emerald-400 file:text-black hover:file:bg-emerald-300" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-lg bg-emerald-400 text-black font-semibold py-2.5 hover:bg-emerald-300 disabled:opacity-60"
            >
              {loading ? 'Creating…' : 'Create Gig'}
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
