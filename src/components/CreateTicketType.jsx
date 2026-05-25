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
