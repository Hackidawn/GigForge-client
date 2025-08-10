// client/src/pages/FreelancerDashboard.jsx
import { useEffect, useMemo, useState } from 'react';
import io from 'socket.io-client';
import api from '../services/api';
import ProgressBar from '../components/ProgressBar';
import { useNavigate, Link } from 'react-router-dom';

// Infer WS origin from API base
const WS_ORIGIN = (import.meta.env.VITE_WS_BASE || 'http://localhost:5000');

export default function FreelancerDashboard() {
  const [orders, setOrders] = useState([]);
  const [earnings, setEarnings] = useState(0);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Keep your local user, but derive a safe userId for comparisons
  const currentUser = useMemo(
    () => JSON.parse(localStorage.getItem('user') || '{}'),
    []
  );
  const currentUserId =
    currentUser?.id ||
    currentUser?._id ||
    currentUser?.user?.id ||
    currentUser?.user?._id ||
    null;

  // progress updates via socket (unchanged)
  useEffect(() => {
    const socket = io(WS_ORIGIN, { withCredentials: true });
    socket.on('orders:progressUpdated', (p) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === p.orderId ? { ...o, progress: p.progress } : o))
      );
    });
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');

      // Robust seller filter: supports string/ObjectId & different local user shapes
      const freelancerOrders = (res.data || []).filter((o) => {
        const sellerId = o?.sellerId?._id || o?.sellerId || null;
        return sellerId && currentUserId && String(sellerId) === String(currentUserId);
      });

      setOrders(freelancerOrders);

      const total = freelancerOrders
        .filter((o) => o.status === 'completed')
        .reduce((sum, o) => sum + Number(o.price || 0), 0);
      setEarnings(total);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    }
  };

  const handleStartWork = async (orderId) => {
    try {
      setLoading(true);
      await api.patch(`/orders/start-work/${orderId}`);
      await fetchOrders();
    } catch (err) {
      console.error(err);
      alert('❌ Failed to start work');
    } finally {
      setLoading(false);
    }
  };

  const handleProgressChange = async (orderId, progress) => {
    try {
      await api.patch(`/orders/update-progress/${orderId}`, { progress });
      await fetchOrders(); // also covered by socket, but safe
    } catch (err) {
      console.error('Failed to update progress', err);
    }
  };

  const handleComplete = async (orderId) => {
    try {
      setLoading(true);
      await api.patch(`/orders/complete-by-id/${orderId}`);
      await fetchOrders();
    } catch (err) {
      console.error(err);
      alert('❌ Failed to complete order');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId) => {
    try {
      setLoading(true);
      await api.patch(`/orders/cancel-by-id/${orderId}`);
      await fetchOrders();
    } catch (err) {
      console.error(err);
      alert('❌ Failed to cancel order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white relative overflow-hidden">
      <BGDecor />

      {/* Header */}
      <header className="relative z-10 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 py-5 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight">Freelancer Dashboard</h1>
          <div className="flex items-center gap-2 text-sm">
            <Link
              to="/marketplace"
              className="px-3 py-1.5 rounded bg-white/10 border border-white/10 hover:bg-white/20"
            >
              ← Back to marketplace
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 mx-auto max-w-7xl px-5 lg:px-8 py-8 space-y-6">
        {/* Earnings */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm text-white/70">Total Earnings</div>
          <div className="text-3xl font-bold mt-1">${Number(earnings || 0)}</div>
        </div>

        {/* Orders */}
        <section>
          <h2 className="text-xl font-semibold mb-3">Your Orders</h2>

          {orders.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
              <div className="text-lg font-semibold">No gigs yet.</div>
              <p className="text-white/70 mt-1">New orders will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-white/70 border-b border-white/10">
                    <th className="px-4 py-3">Gig</th>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Progress</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const buyer = order.buyerId || {};
                    const receiverId = buyer?._id;
                    const progress = Number(order.progress || 0);
                    const status = String(order.status || 'unknown').toLowerCase();

                    return (
                      <tr key={order._id} className="border-t border-white/10 align-top">
                        <td className="px-4 py-3">
                          <div className="font-medium">{order.gigId?.title || '—'}</div>
                          <div className="text-white/60 text-xs">{order.gigId?.category || ''}</div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {buyer?.avatar && (
                              <img
                                src={buyer.avatar || '/default-avatar.png'}
                                alt="client"
                                className="w-6 h-6 rounded-full border border-white/10"
                              />
                            )}
                            <div>
                              <div className="font-medium">{buyer?.username || 'Unknown'}</div>
                              <div className="text-xs text-white/60">{buyer?.email || ''}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <StatusBadge status={status} />
                        </td>

                        <td className="px-4 py-3">
                          {order.started ? (
                            <div className="flex items-center gap-3">
                              <div className="min-w-[160px] max-w-[220px]">
                                <ProgressBar value={progress} />
                              </div>
                              <div className="text-white/70 w-10 text-right">{progress}%</div>
                              <select
                                value={order.progress || 0}
                                onChange={(e) =>
                                  handleProgressChange(order._id, parseInt(e.target.value, 10))
                                }
                                className="border border-white/15 bg-white/5 rounded px-2 py-1 text-xs outline-none focus:border-emerald-400"
                              >
                                {[0, 25, 50, 75, 100].map((p) => (
                                  <option key={p} value={p}>
                                    {p}%
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleStartWork(order._id)}
                              disabled={loading}
                              className="px-3 py-1.5 rounded bg-yellow-400/90 hover:bg-yellow-400 text-black"
                            >
                              Start Work
                            </button>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          {order.status === 'active' && order.started ? (
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => handleComplete(order._id)}
                                disabled={loading}
                                className="px-3 py-1.5 rounded bg-blue-500/90 hover:bg-blue-500 text-white"
                              >
                                Complete
                              </button>
                              <button
                                onClick={() => handleCancel(order._id)}
                                disabled={loading}
                                className="px-3 py-1.5 rounded bg-red-500/90 hover:bg-red-500 text-white"
                              >
                                Cancel
                              </button>
                              {receiverId && (
                                <button
                                  onClick={() => navigate(`/chat/${receiverId}`)}
                                  className="px-3 py-1.5 rounded bg-white/10 border border-white/10 hover:bg-white/20"
                                  title="Open chat"
                                >
                                  Chat
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-white/60">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

/* ---- helpers ---- */

function StatusBadge({ status }) {
  const map = {
    completed: 'bg-green-500/20 text-green-300 border-green-400/30',
    active: 'bg-yellow-500/20 text-yellow-200 border-yellow-400/30',
    cancelled: 'bg-red-500/20 text-red-200 border-red-400/30',
    pending: 'bg-white/10 text-white/80 border-white/10',
    unknown: 'bg-white/10 text-white/80 border-white/10',
  };
  const cls = map[status] || map.unknown;
  return <span className={`px-2 py-1 rounded border ${cls} capitalize`}>{status}</span>;
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
  );
}
