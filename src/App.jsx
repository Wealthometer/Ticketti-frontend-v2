import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Auth pages
import SignIn from "./pages/SignIn.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import SignUp from "./pages/SignUp.jsx";
import OTPVerify from "./pages/OTPVerify.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";

// Main pages
import LandingPage from "./pages/LandingPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Event from "./pages/Event.jsx";
import EventDetails from "./pages/EventDetails.jsx";
import CreateEvent from "./pages/CreateEvent.jsx";
import MyTickets from "./pages/MyTickets.jsx";
import Wallet from "./pages/Wallet.jsx";
import Settings from "./pages/Settings.jsx";
import Contact from "./pages/Contact.jsx";
import PaymentSuccess from "./pages/PaymentSuccess.jsx";
import TicketScanner from "./pages/TicketScanner.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminUsers from "./pages/AdminUsers.jsx";
import AdminEvents from "./pages/AdminEvents.jsx";

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify-otp" element={<OTPVerify />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/event" element={<Event />} />
        <Route path="/event/:eventId" element={<EventDetails />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />

        {/* Protected (auth enforced inside each page) */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/events" element={<AdminEvents />} />
        <Route path="/create-event" element={<CreateEvent />} />
        <Route path="/my-tickets" element={<MyTickets />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/scanner" element={<TicketScanner />} />
      </Routes>
    </Router>
  );
}

export default App;
  