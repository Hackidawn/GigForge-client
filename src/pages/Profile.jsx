import { useEffect, useMemo, useState } from 'react'
import api from '../services/api'
import { useNavigate, Link } from 'react-router-dom'

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

export default function Profile() {
  const navigate = useNavigate()
  const [orderCount, setOrderCount] = useState(0)
  const [editingField, setEditingField] = useState(null)
  const [formData, setFormData] = useState({})
  const [saving, setSaving] = useState(false)

  // use local state so we can mutate after save
  const [currentUser, setCurrentUser] = useState(() => parseUser())
  const currentUserId = currentUser?._id || currentUser?.id
  const role = (currentUser?.role || '').toLowerCase()
  const isFreelancer = role === 'freelancer' || role === 'seller'
  const isClient = role === 'client' || role === 'buyer'

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders')
        const orders = res.data || []

        // Normalize ids: allow string or populated object
        const matchId = (val) => {
          if (!val) return false
          if (typeof val === 'string') return val === currentUserId
          if (typeof val === 'object') return (val._id || val.id) === currentUserId
          return false
        }

        const filtered = isFreelancer
          ? orders.filter(o => matchId(o.sellerId) && String(o.status).toLowerCase() === 'completed')
          : orders.filter(o => matchId(o.buyerId))

        setOrderCount(filtered.length)
      } catch (err) {
        console.error('Failed to load orders', err)
      }
    }

    if (currentUserId) fetchOrders()
  }, [currentUserId, isFreelancer])

  const startEdit = (field) => {
    setEditingField(field)
    setFormData((prev) => ({
      ...prev,
      [field]: currentUser?.[field] ?? ''
    }))
  }

  const cancelEdit = () => {
    setEditingField(null)
    setFormData((prev) => {
      const clone = { ...prev }
      if (editingField in clone) delete clone[editingField]
      delete clone.currentPassword
      delete clone.newPassword
      return clone
    })
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      if (editingField === 'password') {
        if (!formData.currentPassword || !formData.newPassword) {
          alert('Please provide current and new password')
          return
        }
        await api.patch('/auth/change-password', {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
        alert('✅ Password changed')
        setFormData((p) => ({ ...p, currentPassword: '', newPassword: '' }))
      } else {
        const res = await api.patch('/auth/update-profile', {
          [editingField]: formData[editingField]
        })
        const updated = res.data?.user || res.data
        if (updated) {
          localStorage.setItem('user', JSON.stringify(updated))
          setCurrentUser(updated)
        }
        alert('✅ Profile updated')
      }
    } catch (err) {
      console.error(err)
      alert(err.response?.data || 'Failed to update')
    } finally {
      setSaving(false)
      setEditingField(null)
    }
  }

  const joined = currentUser?.createdAt ? new Date(currentUser.createdAt) : null
  const joinedText = joined ? joined.toLocaleDateString() : '—'

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white relative overflow-hidden">
      <BGDecor />

      {/* header */}
      <header className="relative z-10 border-b border-white/10">
        <div className="mx-auto max-w-4xl px-6 py-5 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight">Profile</h1>
          <Link to="/marketplace" className="text-sm px-3 py-1.5 rounded bg-white/10 border border-white/10 hover:bg-white/20">
            ← Back to marketplace
          </Link>
        </div>
      </header>

      {/* content */}
      <main className="relative z-10 mx-auto max-w-4xl px-6 py-8">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
          {/* top row */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-fuchsia-500 to-rose-400" />
            <div>
              <div className="text-lg font-semibold">{currentUser?.username || 'User'}</div>
              <div className="text-white/70 text-sm capitalize">{role || 'member'}</div>
            </div>
          </div>

          {/* stats strip */}
          <div className="grid sm:grid-cols-3 gap-4 mt-6">
            <Stat label="Date Joined" value={joinedText} />
            <Stat
              label={isFreelancer ? 'Gigs Completed' : 'Gigs Bought'}
              value={String(orderCount)}
            />
            <Stat label="Email" value={currentUser?.email || '—'} muted />
          </div>

          <hr className="my-6 border-white/10" />

          {/* fields */}
          <div className="grid gap-5">
            {/* Username */}
            <EditableRow
              label="Username"
              value={editingField === 'username' ? formData.username : currentUser?.username}
              editing={editingField === 'username'}
              onChange={(v) => setFormData((p) => ({ ...p, username: v }))}
              onEdit={() => startEdit('username')}
              onCancel={cancelEdit}
              onSave={handleSave}
              saving={saving}
            />

            {/* Email */}
            <EditableRow
              label="Email"
              value={editingField === 'email' ? formData.email : currentUser?.email}
              editing={editingField === 'email'}
              onChange={(v) => setFormData((p) => ({ ...p, email: v }))}
              onEdit={() => startEdit('email')}
              onCancel={cancelEdit}
              onSave={handleSave}
              saving={saving}
            />

            {/* Password */}
            <div className="grid sm:grid-cols-3 gap-3 items-start">
              <div className="text-sm text-white/80 pt-2">Password</div>
              {editingField === 'password' ? (
                <div className="sm:col-span-2 grid gap-3">
                  <input
                    type="password"
                    placeholder="Current password"
                    value={formData.currentPassword || ''}
                    onChange={(e) => setFormData((p) => ({ ...p, currentPassword: e.target.value }))}
                    className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 outline-none focus:border-emerald-400"
                  />
                  <input
                    type="password"
                    placeholder="New password"
                    value={formData.newPassword || ''}
                    onChange={(e) => setFormData((p) => ({ ...p, newPassword: e.target.value }))}
                    className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 outline-none focus:border-emerald-400"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-4 py-2 rounded bg-emerald-400 text-black font-semibold hover:bg-emerald-300 disabled:opacity-60"
                    >
                      {saving ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-4 py-2 rounded bg-white/10 border border-white/10 hover:bg-white/20"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="sm:col-span-2 flex items-center justify-between">
                  <span className="text-white/70">********</span>
                  <button
                    onClick={() => startEdit('password')}
                    className="px-3 py-1.5 rounded bg-white/10 border border-white/10 hover:bg-white/20 text-sm"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>

            {/* Role (read-only) */}
            <KeyValueRow label="Role" value={role || '—'} />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/marketplace')}
            className="px-4 py-2 rounded bg-white/10 border border-white/10 hover:bg-white/20"
          >
            ← Back to marketplace
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('user')
              localStorage.removeItem('token')
              navigate('/login')
            }}
            className="px-4 py-2 rounded bg-red-500/90 hover:bg-red-500 text-white"
          >
            Logout
          </button>
        </div>
      </main>
    </div>
  )
}

/* ---------- tiny components ---------- */

function Stat({ label, value, muted = false }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs text-white/60">{label}</div>
      <div className={`mt-1 ${muted ? 'text-white/80' : 'text-white'} font-medium`}>
        {value}
      </div>
    </div>
  )
}

function EditableRow({ label, value, editing, onChange, onEdit, onCancel, onSave, saving }) {
  return (
    <div className="grid sm:grid-cols-3 gap-3 items-start">
      <div className="text-sm text-white/80 pt-2">{label}</div>
      {editing ? (
        <div className="sm:col-span-2 grid gap-3">
          <input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 outline-none focus:border-emerald-400"
          />
          <div className="flex gap-2">
            <button
              onClick={onSave}
              disabled={saving}
              className="px-4 py-2 rounded bg-emerald-400 text-black font-semibold hover:bg-emerald-300 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded bg-white/10 border border-white/10 hover:bg-white/20"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="sm:col-span-2 flex items-center justify-between">
          <span className="text-white">{value || '—'}</span>
          <button
            onClick={onEdit}
            className="px-3 py-1.5 rounded bg-white/10 border border-white/10 hover:bg-white/20 text-sm"
          >
            Edit
          </button>
        </div>
      )}
    </div>
  )
}

function KeyValueRow({ label, value }) {
  return (
    <div className="grid sm:grid-cols-3 gap-3 items-start">
      <div className="text-sm text-white/80 pt-2">{label}</div>
      <div className="sm:col-span-2">
        <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5">{value}</div>
      </div>
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
