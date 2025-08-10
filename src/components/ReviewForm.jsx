// client/src/components/ReviewForm.jsx
import { useState } from 'react'
import api from '../services/api'

export default function ReviewForm({ gigId, onNewReview }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!rating) return
    try {
      setLoading(true)
      setErr('')
      await api.post('/reviews', { gigId, rating: Number(rating), comment })
      setComment('')
      setRating(5)
      onNewReview?.()
    } catch (e) {
      setErr(String(e?.response?.data || 'Failed to submit review'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm text-white/80">Your rating</label>
        <div className="flex items-center gap-2">
          {[1,2,3,4,5].map((n) => {
            const active = n <= Number(rating)
            return (
              <label
                key={n}
                className={`cursor-pointer select-none rounded-lg px-3 py-1.5 text-sm border transition
                  ${active
                    ? 'bg-yellow-300 text-black border-yellow-200'
                    : 'bg-white/10 text-white/80 border-white/10 hover:bg-white/20'}`}
                aria-label={`${n} star${n>1?'s':''}`}
              >
                <input
                  type="radio"
                  name="rating"
                  value={n}
                  checked={Number(rating) === n}
                  onChange={() => setRating(n)}
                  className="sr-only"
                />
                {n} ★
              </label>
            )
          })}
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm text-white/80 mb-1">Comment</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="What stood out about the work?"
          className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 outline-none focus:border-emerald-400 placeholder:text-white/50"
        />
      </div>

      {err && (
        <div className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {err}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-4 rounded-lg bg-emerald-400 text-black font-semibold px-4 py-2.5 hover:bg-emerald-300 disabled:opacity-60"
      >
        {loading ? 'Submitting…' : 'Submit review'}
      </button>
    </form>
  )
}
