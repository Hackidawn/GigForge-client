// client/src/pages/ForgotPassword.jsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import api from '../services/api'
import { useNavigate, Link } from 'react-router-dom'

export default function ForgotPassword() {
  const { register, handleSubmit, reset } = useForm()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const [errMsg, setErrMsg] = useState('')

  const onSubmit = async (data) => {
    try {
      setErrMsg('')
      setLoading(true)
      await api.post('/auth/reset-password', data)
      alert('✅ Password reset successfully!')
      reset()
      navigate('/login')
    } catch (err) {
      const msg = err?.response?.data || '❌ Failed to reset password'
      setErrMsg(String(msg))
      alert(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white relative overflow-hidden">
      <BGDecor />

      {/* header */}
      <header className="relative z-10 border-b border-white/10">
        <div className="mx-auto max-w-4xl px-6 py-5 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight">Reset Password</h1>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-3 py-1.5 rounded bg-white/10 border border-white/10 hover:bg-white/20 text-sm"
            >
              ← Back to login
            </Link>
          </div>
        </div>
      </header>

      {/* content */}
      <main className="relative z-10 mx-auto max-w-md px-6 py-8">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
          <h2 className="text-xl font-semibold">🔐 Reset your password</h2>
          <p className="text-white/70 text-sm mt-1">
            Enter your username and your new password.
          </p>

          {errMsg && (
            <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {errMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
            <div>
              <label className="block text-sm mb-1 text-white/80">Username</label>
              <input
                {...register('username')}
                placeholder="your_username"
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-white/80">New password</label>
              <div className="relative">
                <input
                  {...register('newPassword')}
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 pr-24 outline-none focus:border-emerald-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded bg-white/10 border border-white/10 hover:bg-white/20"
                >
                  {showPwd ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-emerald-400 text-black font-semibold py-2.5 hover:bg-emerald-300 disabled:opacity-60"
            >
              {loading ? 'Resetting…' : 'Reset Password'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm">
            Remembered it?{' '}
            <Link to="/login" className="text-emerald-300 hover:text-emerald-200">
              Sign in
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

/* background */
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
