import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CalendarDays, MapPin, Ticket, Coins } from "lucide-react";
import { createBooking, getEventDetails, getTicketTypes, initiatePayment } from "../services/api";
import { getEventImageUrl, getEventPlaceholderUrl } from "../utils/image.js";

const EventDetails = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [user, setUser] = useState(null);
  const [event, setEvent] = useState(null);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [selectedTicketType, setSelectedTicketType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      setUser(JSON.parse(storedUser));
    }

    const loadData = async () => {
      try {
        const eventData = await getEventDetails(eventId);

        // Handle different possible response structures
        const extractedEvent = eventData.data || eventData.event || eventData;

        // Reset image error state when loading a new event
        setImageError(false);

        const rawImage = extractedEvent.image || extractedEvent.cover || extractedEvent.banner || extractedEvent.image_url;

        // Normalize fields (bridge gap between list view and details view models)
        const normalizedEvent = {
          ...extractedEvent,
          eventName: extractedEvent.eventName || extractedEvent.title || "Untitled Event",
          date: extractedEvent.date || extractedEvent.start_date || "No date set",
          time: extractedEvent.time || extractedEvent.end_date || "", // fallback to end_date if time missing
          location: extractedEvent.location || "Unknown Location",
          ticketPrice: extractedEvent.ticketPrice || extractedEvent.price || 0,
          totalTickets: extractedEvent.totalTickets || extractedEvent.capacity || 0,
          description: extractedEvent.description || "No description available.",
          image: getEventImageUrl(rawImage),
        };

        setEvent(normalizedEvent);

        // Fetch ticket types
        const ticketsData = await getTicketTypes(eventId);
        const rawTypes = ticketsData.tickets || ticketsData.ticket_types || ticketsData.data || (Array.isArray(ticketsData) ? ticketsData : []);
        let types = rawTypes.map((t) => ({
          ...t,
          id: String(t.id),
          name: t.name || t.ticket_name || t.title || "General Admission",
          price: Number(t.price ?? t.ticket_price ?? 0),
          stock: Number(
            t.available_quantity ?? t.stock ??
            (t.total_quantity != null && t.sold_quantity != null ? t.total_quantity - t.sold_quantity : undefined) ??
            t.total_quantity ??
            0
          ),
          sold: Number(t.sold ?? t.sold_quantity ?? 0),
        }));

        // If no types but we have a basic price from the event, create a default type
        if (types.length === 0 && normalizedEvent.ticketPrice > 0) {
          types = [{ id: 'default', name: 'General Admission', price: normalizedEvent.ticketPrice }];
        }

        setTicketTypes(types);
        if (types.length > 0) {
          setSelectedTicketType(types[0]);
        }
      } catch (err) {
        console.error("Error loading event details:", err);
        const errMsg = err.message || "Unknown error";
        if (errMsg.includes("CORS") || errMsg.includes("Failed to fetch")) {
          setError("Unable to load event details. Backend CORS configuration is needed.");
        } else {
          setError(`Failed to load event: ${errMsg}`);
        }

        // Fallback to localStorage... (rest same)
        const storedEvents = JSON.parse(localStorage.getItem("events")) || [];
        const foundEvent = storedEvents.find((e) => e.id === parseInt(eventId));
        if (foundEvent) {
          setEvent(foundEvent);
          setTicketTypes(foundEvent.ticketTypes || []);
          if (foundEvent.ticketTypes && foundEvent.ticketTypes.length > 0) {
            setSelectedTicketType(foundEvent.ticketTypes[0]);
          } else if (foundEvent.ticketPrice) {
            // Mock a ticket type if none found
            setSelectedTicketType({ id: foundEvent.ticketTypeId || 1, price: foundEvent.ticketPrice, name: "General" });
          }
        } else {
          setError("Event not found");
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate, eventId]);

  const handlePurchase = async () => {
    if (!event) return;

    setPurchasing(true);
    setError("");

    try {
      if (!selectedTicketType || !event) {
        throw new Error("Missing event or ticket type information");
      }

      const finalEmail = user?.email || guestEmail;
      const finalName = user?.name || user?.username || guestName || "Guest";
      const authenticatedUserId =
        user?.id || user?.user_id || user?.data?.id || user?.data?.user_id;

      if (!finalEmail) {
        throw new Error("Please provide an email address for the ticket delivery");
      }

      if (!user && !guestName.trim()) {
        throw new Error("Please provide your full name to continue");
      }

      // Payload for Create Booking
      const payload = {
        event_id: Number(eventId),
        guest_name: finalName,
        guest_email: finalEmail,
        ...(authenticatedUserId ? { user_id: Number(authenticatedUserId) } : {}),
        items: [
          {
            ticket_type_id: Number(selectedTicketType.id),
            quantity: Number(quantity)
          }
        ]
      };
      const bookingResponse = await createBooking(payload);

      if (bookingResponse.success) {
        const bookingId =
          bookingResponse.booking_id ||
          bookingResponse.id ||
          bookingResponse.data?.booking_id ||
          bookingResponse.data?.id ||
          bookingResponse.booking?.booking_id ||
          bookingResponse.booking?.id;

        if (!bookingId) {
          throw new Error("Booking was created but no booking ID was returned.");
        }

        const callbackUrl =
          window.location.hostname === "localhost"
            ? "http://localhost:5173/payment-success"
            : `${window.location.origin}${import.meta.env.BASE_URL}payment-success`;
        const paymentResponse = await initiatePayment(bookingId, callbackUrl);

        if (!paymentResponse.success) {
          throw new Error(paymentResponse.message || "Payment initialization failed");
        }

        if (paymentResponse.reference) {
          localStorage.setItem("payment_reference", paymentResponse.reference);
        }

        if (paymentResponse.authorization_url) {
          window.location.href = paymentResponse.authorization_url;
        } else {
          throw new Error("Payment was initialized but no authorization URL was returned.");
        }
      } else {
        setError(bookingResponse.message || "Failed to create booking");
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.message || "Booking creation failed";
      if (errMsg.includes("Ticket not found")) {
        setError("The selected ticket is no longer available. Please refresh and try again.");
      } else if (err.status === 401) {
        setError("The backend rejected this request with Unauthorized. Please confirm whether booking creation or payment initialization still requires auth.");
      } else if (errMsg.includes("CORS") || errMsg.includes("Failed to fetch")) {
        setError("Backend connection issue. Please try again later.");
      } else {
        setError(errMsg);
      }
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100 justify-center items-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-screen bg-gray-100 justify-center items-center">
        <div className="text-xl text-red-600">{error || "Event not found"}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/event")}
          className="mb-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
        >
          ← Back to Events
        </button>

        {/* Event Details */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {event.image && !imageError ? (
            <img
              src={event.image}
              alt={event.eventName}
              className="w-full h-64 md:h-80 object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <img
              src={getEventPlaceholderUrl(eventId)}
              alt="Event Banner"
              className="w-full h-64 md:h-80 object-cover opacity-90"
            />
          )}

          <div className="p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {event.eventName}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Event Details
                </h3>
                <div className="space-y-2 text-gray-600">
                  <div className="flex items-center gap-2 text-gray-600">
                    <CalendarDays className="h-4 w-4 text-indigo-500" />
                    <span>{event.date} at {event.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4 text-indigo-500" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Coins className="h-4 w-4 text-indigo-500" />
                    <span>₦{(event.ticketPrice || selectedTicketType?.price || 0).toLocaleString()} per ticket</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Ticket className="h-4 w-4 text-indigo-500" />
                    <span>{(event.totalTickets || ticketTypes.reduce((sum, type) => sum + (type.stock || 0), 0)).toLocaleString()} tickets available</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Description
                </h3>
                <p className="text-gray-600">{event.description}</p>
              </div>
            </div>

            {/* Purchase Section */}
            <div className="border-t pt-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Purchase Tickets
              </h3>

              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-[1.4fr_0.6fr] items-start">
                {!user && (
                  <div className="md:col-span-2 space-y-4 min-w-0">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address (for ticket delivery)
                    </label>
                    <input
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="your@email.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="w-full min-w-0 px-3 py-2 mb-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      autoComplete="name"
                      required
                      placeholder="John Doe"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                )}

                {ticketTypes.length > 0 && (
                  <div className="min-w-0">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ticket Type
                    </label>
                    <select
                      value={selectedTicketType?.id || ""}
                      onChange={(e) => {
                        const value = String(e.target.value);
                        const type = ticketTypes.find((t) => String(t.id) === value);
                        setSelectedTicketType(type);
                      }}
                      className="w-full min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {ticketTypes.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.name} - ₦{Number(type.price).toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="min-w-0">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity {selectedTicketType && selectedTicketType.stock !== undefined && `(Available: ${selectedTicketType.stock})`}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedTicketType?.stock || 100}
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 1;
                      const max = selectedTicketType?.stock || 100;
                      setQuantity(Math.min(val, max));
                    }}
                    className="w-full min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="min-w-0 rounded-2xl border border-gray-200 bg-slate-50 p-5">
                  {selectedTicketType ? (
                    <>
                      <p className="text-lg font-semibold text-gray-900">
                        Subtotal: ₦{(selectedTicketType.price * quantity).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Total (inc. fees): ₦{(
                          selectedTicketType.price * quantity +
                          0.05 * (selectedTicketType.price * quantity) +
                          100 * quantity
                        ).toLocaleString()}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 mb-4">Select a ticket type to see the total.</p>
                  )}
                  <button
                    onClick={handlePurchase}
                    disabled={purchasing || !selectedTicketType}
                    className="mt-2 w-full px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {purchasing ? "Processing..." : "Purchase Tickets"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
