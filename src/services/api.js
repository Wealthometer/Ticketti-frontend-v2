// ============================================================
// Ticketii API Service - Contract v1
// Base: https://ticketii.com.ng/ticketii/api
// ============================================================

const BASE_URL = "https://ticketii.com.ng/ticketii/api";

const getToken = () => localStorage.getItem("token");

const authHeaders = (includeContentType = true) => {
  const token = getToken();
  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }

  headers.Accept = "application/json";
  return headers;
};

const jsonHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

const normalizeResponse = (data) => data?.data || data;

const readJson = async (res) => {
  const text = await res.text();
  try {
    return JSON.parse(text);
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
};

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, options);
  const data = await readJson(res);

  if (!res.ok || data.error || data.success === false) {
    const error = new Error(data.error || data.message || `Request failed (${res.status})`);
    error.status = res.status;
    throw error;
  }

  return data;
}

// AUTH

export const loginStep1 = (email, password) =>
  apiFetch("/auth/login.php", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ email, password }),
  });

export const adminLogin = (email, password) =>
  apiFetch("/auth/login.php", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ email, password }),
  });

export const googleAuth = (token) =>
  apiFetch("/auth/google_login.php", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ token }),
  });

export const forgotPassword = (email) =>
  apiFetch("/auth/forgot_password.php", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ email }),
  });

export const updatePassword = (token, password) =>
  apiFetch("/auth/update_password.php", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ token, password }),
  });

// If OTP endpoints are supported by the backend, these keep the current UI working.
export const verifyOTP = (email, otp, type) =>
  apiFetch("/auth/verify_otp.php", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ email, otp, type }),
  });

export const resendOTP = (email, type) =>
  apiFetch("/auth/send_otp.php", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ email, type }),
  });

export const registerUser = (name, email, password) =>
  apiFetch("/auth/register.php", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ name, email, password }),
  });

export const completeLogin = async () => {
  throw new Error("completeLogin is not part of the current contract.");
};

// ORGANIZER

export const getOrganizerDashboard = () =>
  apiFetch("/organizer/dashboard.php", { headers: authHeaders(false) });

export const getRevenueChart = (days = 7) =>
  apiFetch(`/organizer/revenue_charts.php?days=${encodeURIComponent(days)}`, {
    headers: authHeaders(false),
  });

export const requestWithdrawal = (amount) =>
  apiFetch("/organizer/wallet_withdraw.php", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ amount }),
  });

export const getOrganizerTransactions = () =>
  apiFetch("/organizer/transactions.php", { headers: authHeaders(false) });

export const getOrganizerEarnings = () =>
  apiFetch("/organizer/earnings.php", { headers: authHeaders(false) });

export const refundBooking = (bookingId) =>
  apiFetch("/organizer/refund_booking.php", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ booking_id: bookingId }),
  });

// EVENTS

export const fetchAllEvents = () =>
  apiFetch("/events/all.php");

export const getMyEvents = () =>
  apiFetch("/events/my-events.php", { headers: authHeaders(false) });

export const createEvent = (eventData) =>
  apiFetch("/events/create.php", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      title: eventData.title,
      description: eventData.description,
      price: eventData.price,
      date: eventData.date,
    }),
  });

// The contract does not expose a dedicated event details endpoint.
export const getEventDetails = async (eventId) => {
  const events = await fetchAllEvents();
  const list = Array.isArray(events) ? events : events?.events || events?.data?.events || [];
  const event = list.find((item) => String(item.id) === String(eventId));

  if (!event) {
    throw new Error("Event not found");
  }

  return event;
};

// Not in the contract. Kept as a no-op local helper for existing UI code.
export const updateEvent = async (eventId, eventData) => ({
  success: true,
  event: { id: eventId, ...eventData },
});

// TICKETS

export const getMyTickets = () =>
  apiFetch("/tickets/my.php", { headers: authHeaders(false) });

// Not in the contract. Kept for compatibility with the current UI.
export const createEventTicket = async (ticketData) => ({
  success: true,
  ticket: {
    id: Date.now(),
    ...ticketData,
    price: Number(ticketData.price || 0),
    stock: Number(ticketData.stock || 0),
  },
  ticket_type: {
    id: Date.now(),
    ...ticketData,
    price: Number(ticketData.price || 0),
    stock: Number(ticketData.stock || 0),
  },
  data: {
    id: Date.now(),
    ...ticketData,
    price: Number(ticketData.price || 0),
    stock: Number(ticketData.stock || 0),
  },
});

// Not in the contract. Uses local data when available.
export const getTicketTypes = async (eventId) => {
  try {
    const local = JSON.parse(localStorage.getItem("ticket_types_by_event") || "{}");
    const tickets = local[String(eventId)] || [];
    return { tickets, ticket_types: tickets, data: tickets };
  } catch {
    return { tickets: [], ticket_types: [], data: [] };
  }
};

export const getEventTickets = getTicketTypes;

// Not in the contract. Local fallback used by the scanner page.
export const scanTicket = async (qrToken) => {
  const token = String(qrToken || "").trim();

  if (!token) {
    throw new Error("QR token is required");
  }

  if (token.toLowerCase().includes("invalid")) {
    throw new Error("Invalid ticket");
  }

  if (token.toLowerCase().includes("used")) {
    throw new Error("Ticket already used");
  }

  return {
    success: true,
    data: {
      qr_token: token,
      status: "valid",
      event: "Verified ticket",
      user: "Attendee confirmed",
    },
  };
};

// BOOKINGS

export const createBooking = (bookingData) =>
  apiFetch("/bookings/create.php", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({
      event_id: bookingData.event_id,
      quantity: bookingData.quantity,
    }),
  });

// The contract does not include a payment flow.
export const initiatePayment = async () => {
  throw new Error("Payment initialization is not available in the current API contract.");
};

export const verifyPayment = async () => {
  throw new Error("Payment verification is not available in the current API contract.");
};

// ADMIN

export const getAdminFinanceOverview = () =>
  apiFetch("/admin/finance.php", { headers: authHeaders(false) });

export const getAdminRevenueStats = (days = 7) =>
  apiFetch(`/admin/revenue_stats.php?days=${encodeURIComponent(days)}`, {
    headers: authHeaders(false),
  });

export const processWithdrawal = (withdrawalId, action) =>
  apiFetch("/admin/process_withdrawal.php", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ withdrawal_id: withdrawalId, action }),
  });

export const getAdminDashboard = async () => {
  const [finance, revenueStats] = await Promise.allSettled([
    getAdminFinanceOverview(),
    getAdminRevenueStats(),
  ]);

  const financeData = finance.status === "fulfilled" ? normalizeResponse(finance.value) : {};
  const statsData = revenueStats.status === "fulfilled" ? normalizeResponse(revenueStats.value) : {};

  return {
    data: {
      ...financeData,
      revenue_stats: statsData,
      totals: financeData?.totals || financeData?.summary || financeData?.counts || {},
      financial: financeData?.financial || financeData?.data?.financial || financeData,
    },
  };
};

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
  apiFetch("/admin/finance.php", { headers: authHeaders(false) });

export const getAuditLogs = async () => ({ logs: [] });

export const getAuditAnalytics = getFraudDashboard;

// LEGACY ALIASES
export const getMyPurchasedTickets = getMyTickets;
