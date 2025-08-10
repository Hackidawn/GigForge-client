// client/src/services/socket.js
import { io } from 'socket.io-client';

// Try VITE_WS_BASE first; if not set, derive from VITE_API_URL by stripping /api
const fromApi = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '');
const wsBase = import.meta.env.VITE_WS_BASE || fromApi || 'http://localhost:5000';

const socket = io(wsBase, { withCredentials: true });
export default socket;
