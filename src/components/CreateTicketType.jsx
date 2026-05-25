import React, { useState } from "react";
import { createEventTicket } from "../services/api";

const CreateTicketType = ({ eventId, onComplete }) => {
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        stock: "",
        description: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        if (!eventId) {
            setError("Event ID is missing. Please try creating the event again.");
            setLoading(false);
            return;
        }

        try {
            const ticketData = {
                event_id: Number(eventId),
                name: formData.name,
                price: Number(formData.price),
                stock: Number(formData.stock),
            };
            if (formData.description.trim()) {
                ticketData.description = formData.description;
            }
            const data = await createEventTicket(ticketData);

            setSuccess("Ticket type created successfully!");
            setFormData({ name: "", price: "", stock: "", description: "" });
            if (onComplete) onComplete(data.ticket || data.ticket_type || data.data);
        } catch (err) {
            setError(err.message || "Failed to create ticket type");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded shadow mt-6">
            <h3 className="text-xl font-bold mb-4">Add Ticket Type</h3>
            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
            {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Ticket Name *</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full border rounded px-3 py-2"
                        placeholder="e.g. VIP, Regular"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
