// client/src/pages/Landing.jsx
import { Link } from 'react-router-dom'
import { useMemo } from 'react'

export default function Landing() {
  const currentUser = useMemo(() => {
    try {
      const raw = localStorage.getItem('user')
      const u = raw ? JSON.parse(raw) : null
      return u?.user ?? u
    } catch { return null }
  }, [])

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white relative overflow-hidden">
      <BGDecor />

      {/* NAV */}
      <header className="relative z-20">
        <nav className="mx-auto max-w-7xl px-5 lg:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 via-cyan-400 to-indigo-500 shadow-[0_0_40px_rgba(16,185,129,0.35)]" />
            <span className="text-2xl font-extrabold tracking-tight">GigForge</span>
          </div>

          <div className="hidden md:flex items-center gap-7 text-sm text-white/80">
            <a href="#services" className="hover:text-white">Services</a>
            <a href="#how" className="hover:text-white">How it works</a>
            <a href="#why" className="hover:text-white">Why us</a>
            <a href="#faq" className="hover:text-white">FAQ</a>
          </div>

          <div className="hidden md:flex items-center gap-2">
            {!currentUser ? (
              <>
                <Link to="/login" className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10">
                  Log in
                </Link>
                <Link to="/register" className="px-4 py-2 rounded-lg bg-emerald-400 text-black hover:bg-emerald-300">
                  Join
                </Link>
              </>
            ) : (
              <>
                <Link to="/marketplace" className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10">
                  Enter marketplace
                </Link>
                <Link to="/profile" className="px-4 py-2 rounded-lg bg-emerald-400 text-black hover:bg-emerald-300">
                  Profile
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden">
            {!currentUser ? (
              <Link to="/register" className="px-3 py-2 rounded-lg bg-emerald-400 text-black">Join</Link>
            ) : (
              <Link to="/marketplace" className="px-3 py-2 rounded-lg bg-white/10 border border-white/10">Enter</Link>
            )}
          </div>
        </nav>
      </header>

      {/* HERO */}
      <main className="relative z-20">
        <section className="mx-auto max-w-7xl px-5 lg:px-8 pt-8 lg:pt-14 pb-10">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* copy */}
            <div>
              <span className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/80">
                <Dot /> Trusted by teams globally
              </span>

              <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight">
                Find elite <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-cyan-200 to-white">freelancers</span> for your next big release.
              </h1>

              <p className="mt-5 text-white/80 text-lg max-w-xl">
                Design, code, content, marketing — everything you need to ship faster. Hire in minutes,
                track progress, and chat in real-time — all in GigForge.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/marketplace" className="px-5 py-3 rounded-xl bg-emerald-400 text-black font-semibold hover:bg-emerald-300 transition">
                  Explore marketplace
                </Link>
                <Link to="/register" className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10">
                  Become a freelancer
                </Link>
              </div>

              <div className="mt-9 grid grid-cols-3 gap-4 max-w-md">
                <Stat k="50+" v="Clients" />
                <Stat k="100" v="Freelancers" />
                <Stat k="4.9/5" v="Avg rating" />
              </div>

              <div className="mt-7 flex flex-wrap gap-2">
                {['UI/UX','Frontend','Backend','3D & Motion','Branding','Docs & Content','Marketing'].map(c => (
                  <span key={c} className="px-3 py-1.5 text-sm rounded-full bg-white/5 border border-white/10 text-white/80 hover:bg-white/10">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* glass cards */}
            <div className="relative">
              <div className="absolute -inset-6 rounded-[28px] bg-gradient-to-br from-emerald-400/25 via-cyan-400/20 to-indigo-500/20 blur-2xl" />
              <div className="relative grid gap-5">
                <GlassCard>
                  <CardHeader title="Landing page revamp" tag="In progress" />
                  <Progress percent={76} />
                  <TagRow tags={['Figma','React','Motion']} />
                </GlassCard>

                <div className="grid sm:grid-cols-2 gap-5">
                  <GlassCard>
                    <CardHeader title="Crypto wallet UI" tag="Design" />
                    <TinyList items={['Onboarding','Vault','TX history']} />
                  </GlassCard>
                  <GlassCard>
                    <CardHeader title="Blog content plan" tag="Content" />
                    <TinyList items={['cluster','10 posts','Styleguide']} />
                  </GlassCard>
                </div>

                <GlassCard>
                  <div className="flex items-center justify-between">
                    <Profile name="Shreya" role="Graphic Designer" />
                    <button className="px-3 py-1.5 rounded-lg bg-emerald-400 text-black text-sm font-medium hover:bg-emerald-300">
                      Hire
                    </button>
                  </div>
                </GlassCard>
              </div>
            </div>
          </div>
        </section>

        {/* LOGO STRIP */}
        <section className="mx-auto max-w-7xl px-5 lg:px-8 pt-2 pb-10">
          <div className="opacity-70 text-xs mb-4">Trusted by teams at</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 text-white/50">
            {['Nova','Arcade','Pulse','Vertex','Quanta','Strata'].map(b => (
              <div key={b} className="rounded-xl border border-white/10 bg-white/5 py-3 text-center">{b}</div>
            ))}
          </div>
        </section>

        {/* SERVICES */}
        <section id="services" className="mx-auto max-w-7xl px-5 lg:px-8 py-14">
          <SectionTitle title="What you can hire for" subtitle="Popular services on GigForge" />
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => <ServiceCard key={s.title} {...s} />)}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="mx-auto max-w-7xl px-5 lg:px-8 py-14">
          <SectionTitle title="How it works" subtitle="From brief to delivery in days, not weeks" />
          <ol className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <li key={s.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="text-emerald-300 text-sm">Step {i+1}</div>
                <div className="mt-1 font-semibold">{s.title}</div>
                <p className="text-sm text-white/75 mt-2">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* WHY US */}
        <section id="why" className="mx-auto max-w-7xl px-5 lg:px-8 py-14">
          <SectionTitle title="Why choose GigForge?" subtitle="Quality, speed, and peace of mind" />
          <div className="mt-8 grid lg:grid-cols-3 gap-6">
            {reasons.map((r) => (
              <div key={r.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="w-10 h-10 rounded bg-white/10 grid place-content-center mb-4">{r.icon}</div>
                <h3 className="font-semibold">{r.title}</h3>
                <p className="text-sm text-white/75 mt-2">{r.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-7xl px-5 lg:px-8 pb-16">
          <div className="rounded-[28px] border border-white/10 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-indigo-500/20 p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h3 className="text-2xl font-semibold">Ready to ship your next release?</h3>
              <p className="text-white/80 mt-1">Post a brief and start receiving proposals in minutes.</p>
            </div>
            <div className="flex gap-3">
              <Link to="/marketplace" className="px-5 py-3 rounded-xl bg-emerald-400 text-black font-semibold hover:bg-emerald-300">Post a gig</Link>
              <Link to="/register" className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10">Become a freelancer</Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="relative z-20 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 py-8 text-sm text-white/70 flex flex-col md:flex-row gap-3 justify-between">
          <span>© {new Date().getFullYear()} GigForge</span>
          <div className="flex gap-6">
            <a href="#privacy" className="hover:text-white">Privacy</a>
            <a href="#terms" className="hover:text-white">Terms</a>
            <a href="#contact" className="hover:text-white">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ---------- helpers (in-file, so no undefined refs) ---------- */

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

function Dot() {
  return <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
}

function Stat({ k, v }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="text-2xl font-bold">{k}</div>
      <div className="text-xs text-white/70 mt-1">{v}</div>
    </div>
  )
}

function GlassCard({ children }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-5 lg:p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
      {children}
    </div>
  )
}

function CardHeader({ title, tag }) {
  return (
    <div className="flex items-center justify-between">
      <div className="font-semibold">{title}</div>
      <span className="text-xs px-2 py-1 rounded bg-white/10 border border-white/10">{tag}</span>
    </div>
  )
}

function Progress({ percent = 0 }) {
  return (
    <div className="mt-3 h-2 rounded bg-white/10 overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-500"
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  )
}

function TagRow({ tags = [] }) {
  return (
    <div className="mt-3 flex gap-2 flex-wrap">
      {tags.map(t => (
        <span key={t} className="px-2 py-0.5 rounded bg-white/10 text-xs">{t}</span>
      ))}
    </div>
  )
}

function TinyList({ items = [] }) {
  return (
    <ul className="mt-3 space-y-1 text-sm text-white/75">
      {items.map(i => (
        <li key={i} className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          {i}
        </li>
      ))}
    </ul>
  )
}

function Profile({ name, role }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-rose-400" />
      <div>
        <div className="font-medium leading-tight">{name}</div>
        <div className="text-xs text-white/70">{role}</div>
      </div>
    </div>
  )
}

function SectionTitle({ title, subtitle }) {
  return (
    <div className="flex items-end justify-between gap-6">
      <div>
        <h2 className="text-3xl font-bold">{title}</h2>
        <p className="text-white/80 mt-1">{subtitle}</p>
      </div>
      <Link
        to="/marketplace"
        className="hidden sm:inline-block px-4 py-2 rounded-lg bg-white/10 border border-white/10 hover:bg-white/20"
      >
        Explore →
      </Link>
    </div>
  )
}

function ServiceCard({ title, text }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-white/75 mt-2">{text}</p>
      <div className="mt-4 text-right">
        <Link to="/marketplace" className="text-emerald-300 hover:text-emerald-200 text-sm">Explore →</Link>
      </div>
    </div>
  )
}

/* ---------- data ---------- */

const services = [
  { title: '3D / Motion', text: 'AR assets, hero loops, product renders with lighting that pops.' },
  { title: 'Product Design', text: 'UI/UX for dashboards, wallets, mobile & web apps.' },
  { title: 'Frontend Dev', text: 'React, animations, performance tuning, pixel-perfect builds.' },
  { title: 'Backend / API', text: 'Node, REST, WebSockets, auth, payments & infra.' },
  { title: 'Content & Docs', text: 'Whitepapers, blogs, technical docs, editing & style.' },
  { title: 'Brand & Visual', text: 'Logos, brand kits, campaigns, social templates.' },
]

const steps = [
  { title: 'Post your brief', text: 'Describe goals, scope, timeline, and budget.' },
  { title: 'Get proposals', text: 'Receive tailored proposals from vetted freelancers.' },
  { title: 'Kick off & chat', text: 'Track progress, exchange files, chat in real time.' },
  { title: 'Deliver & pay', text: 'Review deliverables, release payment securely.' },
]

const reasons = [
  { icon: '🛡️', title: 'Escrow protection', text: 'Funds held securely until you approve delivery.' },
  { icon: '⚡', title: 'Fast matching', text: 'Most briefs receive quality proposals within hours.' },
  { icon: '⭐', title: 'Verified talent', text: 'Ratings, reviews, portfolios — vetted for quality.' },
]
