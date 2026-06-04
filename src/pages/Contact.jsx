import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";

const Contact = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!storedUser || !token) {
      navigate("/signin");
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, send this to your backend
    console.log("Contact form submitted:", formData);
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ subject: "", message: "" });
      setSubmitted(false);
    }, 3000);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar user={user} />

      <main className="flex-1 flex flex-col w-full md:w-auto">
        <header className="bg-white shadow-sm sticky top-0 z-30 mt-16 md:mt-0">
          <div className="px-4 md:px-6 py-4 flex flex-col md:flex-row md:justify-between md:items-center gap-2">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              Contact Us
            </h2>
            <span className="text-gray-600 text-xs md:text-sm">
              Get in touch with our team
            </span>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">
            📞 Contact Support
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="bg-white rounded-lg shadow p-4 md:p-6 hover:shadow-lg transition">
              <h3 className="text-2xl mb-2">📧</h3>
              <h4 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">
                Email
              </h4>
              <p className="text-gray-600 text-xs md:text-sm">
                support@Ticketii.com
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 md:p-6 hover:shadow-lg transition">
              <h3 className="text-2xl mb-2">📱</h3>
              <h4 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">
                Phone
              </h4>
              <p className="text-gray-600 text-xs md:text-sm">
                +234 (0) 800 000 0000
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 md:p-6 hover:shadow-lg transition">
              <h3 className="text-2xl mb-2">🏢</h3>
              <h4 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">
                Office
              </h4>
              <p className="text-gray-600 text-xs md:text-sm">Lagos, Nigeria</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 md:p-6 max-w-2xl">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">
              Send us a Message
            </h2>

            {submitted && (
              <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
                ✓ Thank you! Your message has been sent successfully.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter subject"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="6"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your message"
                  required
                ></textarea>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Send Message
                </button>
                <button
                  type="reset"
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                >
                  Clear
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;
