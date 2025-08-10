// client/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Register from './pages/Register'
import Login from './pages/Login'
import CreateGig from './pages/CreateGig'
import EditGig from './pages/EditGig'
import Chat from './pages/Chat'
import GigDetail from './pages/GigDetail'
import AdminPanel from './pages/AdminPanel'
import Orders from './pages/Orders'
import Checkout from './pages/Checkout'
import FreelancerDashboard from './pages/FreelancerDashboard'
import ForgotPassword from './pages/ForgotPassword'
import Profile from './pages/Profile'
import ClientDashboard from './pages/ClientDashboard'
import Landing from './pages/Landing' // <-- make sure this file exists at client/src/pages/Landing.jsx
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Landing is now the homepage */}
        <Route path="/" element={<Landing />} />

        {/* Your original home moved here */}
        <Route path="/marketplace" element={<Home />} />

        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-gig" element={<CreateGig />} />
        <Route path="/edit-gig/:gigId" element={<EditGig />} />
        <Route path="/chat/:userId" element={<Chat />} />
        <Route path="/gigs/:id" element={<GigDetail />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/checkout/:gigId" element={<Checkout />} />
        <Route path="/freelancer-dashboard" element={<FreelancerDashboard />} />
        <Route path="/client-dashboard" element={<ClientDashboard />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>

      <ToastContainer position="top-center" autoClose={2000} />
    </Router>
  )
}
