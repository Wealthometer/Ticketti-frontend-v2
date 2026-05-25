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
