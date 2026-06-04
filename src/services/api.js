// ============================================================
// Ticketii API Service — Final Contract v2
// Base: https://ticketii.com.ng/ticketii/api
// ============================================================

const BASE_URL = "/api";

const getToken = () => localStorage.getItem("token");

const authHeaders = (includeContentType = true) => {
  const token = getToken();
  const headers = {
    Authorization: token ? `Bearer ${token}` : undefined,
  };

  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
};

const publicHeaders = () => ({ "Content-Type": "application/json" });

// ── core fetch wrapper ──────────────────────────────────────
async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, options);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    const normalizedText = text
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const error = new Error(`Non-JSON response (${res.status}): ${normalizedText.slice(0, 200)}`);
    error.status = res.status;
    throw error;
  }
  if (!res.ok || data.error) {
    const error = new Error(data.error || data.message || `Request failed (${res.status})`);
    error.status = res.status;
    throw error;
  }
  return data;
}

// ─────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────

/** Step 1: POST email+password → OTP sent */
export const loginStep1 = (email, password) =>
  apiFetch("/auth/login", {
    method: "POST",
    headers: publicHeaders(),
    body: JSON.stringify({ email, password }),
  });

export const adminLogin = (email, password) =>
  apiFetch("/auth/admin-login", {
    method: "POST",
    headers: publicHeaders(),
    body: JSON.stringify({ email, password }),
  });

/** Step 2: Verify OTP (type = "login" | "register" | "forgot_password") */
export const verifyOTP = (email, otp, type) =>
  apiFetch("/auth/verify_otp", {
    method: "POST",
    headers: publicHeaders(),
    body: JSON.stringify({ email, otp, type }),
  });

/** Step 3: Get JWT after OTP verified */
export const completeLogin = (email) =>
  apiFetch("/auth/complete_login", {
    method: "POST",
    headers: publicHeaders(),
    body: JSON.stringify({ email }),
  });

/** Resend OTP */
export const resendOTP = (email, type) =>
  apiFetch("/auth/resend_otp", {
    method: "POST",
    headers: publicHeaders(),
    body: JSON.stringify({ email, type }),
  });

/** Register new user */
export const registerUser = (name, email, password) =>
  apiFetch("/auth/register", {
    method: "POST",
    headers: publicHeaders(),
    body: JSON.stringify({ name, email, password }),
  });

/** Google auth — returns { token, user } */
export const googleAuth = (googleToken) =>
  apiFetch("/auth/google_auth", {
    method: "POST",
    headers: publicHeaders(),
    body: JSON.stringify({ token: googleToken }),
  });

/** Forgot password — sends OTP */
export const forgotPassword = (email) =>
  apiFetch("/auth/forgot_password", {
    method: "POST",
    headers: publicHeaders(),
    body: JSON.stringify({ email }),
  });

/** Reset password with token from OTP flow */
export const updatePassword = (token, password) =>
  apiFetch("/auth/update_password", {
    method: "POST",
    headers: publicHeaders(),
    body: JSON.stringify({ token, password }),
  });

// ─────────────────────────────────────────────────────────────
// ORGANIZER
// ─────────────────────────────────────────────────────────────

/** Organizer dashboard stats */
export const getOrganizerDashboard = () =>
  apiFetch("/organizer/dashboard", { headers: authHeaders() });

/** Revenue chart data */
export const getRevenueChart = () =>
  apiFetch("/organizer/revenue_chart", { headers: authHeaders() });

/** Request withdrawal — triggers OTP internally */
export const requestWithdrawal = (amount, notes = "") =>
  apiFetch("/organizer/wallet_withdraw", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ amount, notes }),
  });

/** Refund a booking */
export const refundBooking = (bookingId) =>
  apiFetch("/organizer/refund_booking", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ booking_id: bookingId }),
  });

// ─────────────────────────────────────────────────────────────
// EVENTS
// ─────────────────────────────────────────────────────────────

export const fetchAllEvents = () =>
  apiFetch("/events/all");

export const getEventDetails = (eventId) =>
  apiFetch(`/events/view?id=${eventId}`);

export const getMyEvents = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const created_by = user.id || user.user_id;
  return apiFetch(`/events/my-events?created_by=${created_by}`, { headers: authHeaders() });
};

export const createEvent = (eventData) => {
  const isFormData = eventData instanceof FormData;
  return apiFetch("/events/create", {
    method: "POST",
    headers: authHeaders(!isFormData),
    body: isFormData ? eventData : JSON.stringify(eventData),
  });
};
export const updateEvent = (eventId, eventData) => {
  const isFormData = eventData instanceof FormData;
  return apiFetch(`/events/update?id=${eventId}`, {
    method: "POST",
    headers: authHeaders(!isFormData),
    body: isFormData ? eventData : JSON.stringify(eventData),
  });
};
// ─────────────────────────────────────────────────────────────
// TICKETS
// ─────────────────────────────────────────────────────────────

/** My purchased tickets — requires bookings saved with authenticated user_id */
export const getMyTickets = () =>
  apiFetch("/bookings/my_tickets", { headers: authHeaders() });

/** Create ticket type for an event */
export const createEventTicket = (ticketData) =>
  apiFetch("/tickets/types/create", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(ticketData),
  });

export const getTicketTypes = (eventId) =>
  apiFetch(`/events/view_tickets?event_id=${eventId}`);

export const getEventTickets = (eventId) =>
  apiFetch(`/event_tickets/list?event_id=${eventId}`, { headers: authHeaders() }); 

/** Scan/validate a QR token at venue */
export const scanTicket = (qrToken) =>
  apiFetch("/tickets/scan", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ qr_token: qrToken }),
  });

// ─────────────────────────────────────────────────────────────
// BOOKINGS
// ─────────────────────────────────────────────────────────────

export const createBooking = (bookingData) =>
  apiFetch("/bookings/create", {
    method: "POST",
    headers: publicHeaders(),
    body: JSON.stringify(bookingData),
  });

export const initiatePayment = (bookingId, callbackUrl) =>
  apiFetch("/payments/init", {
    method: "POST",
    headers: publicHeaders(),
    body: JSON.stringify(
      callbackUrl
        ? { booking_id: bookingId, callback_url: callbackUrl }
        : { booking_id: bookingId }
    ),
  });

// ─────────────────────────────────────────────────────────────
// PAYMENTS
// ─────────────────────────────────────────────────────────────

/** Verify Paystack reference — use ONLY as fallback when no webhook */
export const verifyPayment = (reference) =>
  apiFetch("/payments/verify", {
    method: "POST",
    headers: publicHeaders(),
    body: JSON.stringify({ reference }),
  });

// ─────────────────────────────────────────────────────────────
// ADMIN
// ─────────────────────────────────────────────────────────────

export const getAdminDashboard = () =>
  apiFetch("/admin/dashboard", { headers: authHeaders() });

export const getAdminUsers = async () => {
  const response = await getAdminDashboard();
  const data = response?.data || response;

  return {
    users: data?.users || [],
    totals: data?.totals || {},
  };
};

export const getAdminEvents = async () => {
  const response = await getAdminDashboard();
  const data = response?.data || response;

  return {
    events: data?.latest_events || data?.events || [],
    totals: data?.totals || {},
  };
};

export const getFraudDashboard = () =>
  apiFetch("/admin/audit_analytics", { headers: authHeaders() });

export const getAuditLogs = () =>
  apiFetch("/admin/audit_logs", { headers: authHeaders() });

export const getAuditAnalytics = getFraudDashboard;

// ─────────────────────────────────────────────────────────────
// LEGACY ALIASES (backward compat for any existing usages)
// ─────────────────────────────────────────────────────────────
export const getOrganizerEarnings = getOrganizerDashboard;
export const getMyPurchasedTickets = getMyTickets;
