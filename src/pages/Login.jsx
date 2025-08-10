import { useState } from 'react'
import { useForm } from 'react-hook-form'
import api from '../services/api'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
  const { register, handleSubmit } = useForm()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const [errMsg, setErrMsg] = useState('')

  const onSubmit = async (data) => {
    try {
      setErrMsg('')
      setLoading(true)
      const res = await api.post('/auth/login', data)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      navigate('/marketplace') // ✅ same redirect as before
    } catch (err) {
      setErrMsg(err.response?.data || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white relative overflow-hidden">
      {/* subtle background */}
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

      {/* header */}
      <header className="relative z-10">
        <nav className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 via-cyan-400 to-indigo-500" />
            <span className="text-xl font-extrabold tracking-tight">GigForge</span>
          </Link>
          <div className="text-sm">
            New here?{' '}
            <Link to="/register" className="text-emerald-300 hover:text-emerald-200">
              Create an account
            </Link>
          </div>
        </nav>
      </header>

      {/* content */}
      <main className="relative z-10">
        <div className="mx-auto max-w-6xl px-6 py-10 grid lg:grid-cols-2 gap-10 items-center">
          {/* left: hero copy */}
          <div className="hidden lg:block">
            <span className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/80">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" /> Welcome back
            </span>
            <h1 className="mt-5 text-5xl font-extrabold leading-[1.08] tracking-tight">
              Sign in to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-cyan-200 to-white">GigForge</span>
            </h1>
            <p className="mt-4 text-white/80 text-lg max-w-xl">
              Manage orders, track progress, and chat with your collaborators — all in one place.
            </p>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 max-w-md">
              <div className="text-sm text-white/80">Why teams choose us</div>
              <ul className="mt-3 space-y-2 text-sm text-white/75">
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Secure escrow payments</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Real-time chat & progress</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Verified freelancers</li>
              </ul>
            </div>
          </div>

          {/* right: form card */}
          <div className="mx-auto w-full max-w-md">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
              <h2 className="text-2xl font-bold">Welcome back</h2>
              <p className="text-white/70 mt-1 text-sm">Use your email and password to sign in.</p>

              {errMsg && (
                <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {String(errMsg)}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
                <div>
                  <label className="block text-sm mb-1 text-white/80">Email</label>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1 text-white/80">Password</label>
                  <div className="relative">
                    <input
                      {...register('password')}
                      type={showPwd ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 pr-24 outline-none focus:border-emerald-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(s => !s)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded bg-white/10 border border-white/10 hover:bg-white/20"
                    >
                      {showPwd ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="text-white/70">
                    <Link to="/forgot-password" className="text-emerald-300 hover:text-emerald-200">
                      Forgot password?
                    </Link>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-emerald-400 text-black font-semibold py-2.5 hover:bg-emerald-300 disabled:opacity-60"
                >
                  {loading ? 'Signing in…' : 'Sign in'}
                </button>
              </form>

              <div className="mt-4 text-sm text-center text-white/70">
                Don’t have an account?{' '}
                <Link to="/register" className="text-emerald-300 hover:text-emerald-200">Join GigForge</Link>
              </div>
            </div>

            <div className="mt-4 text-center">
              <Link to="/" className="text-white/60 hover:text-white text-sm">← Back to landing</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
