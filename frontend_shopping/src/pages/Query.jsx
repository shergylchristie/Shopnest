import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Query = () => {
  const [userQuery, setUserQuery] = useState({
    name: "",
    email: "",
    phone: "",
    query: "",
  });
  const navigate = useNavigate();

  async function handleForm(e) {
    e.preventDefault();
    const formdata = userQuery;
    try {
      const response = await fetch("/api/userQuery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formdata),
      });
      const result = await response.json();

      if (response.ok) {
        toast.success(result.message);
        navigate("/");
      } else toast.error(result.message);
    } catch (error) {
      toast.error(error?.message || "Something went wrong");
    }
  }

  function handleQuery(e) {
    setUserQuery({ ...userQuery, [e.target.name]: e.target.value });
  }

  return (
    <section className="w-full bg-gray-50  pb-24 md:pb-40 border border-gray-200 shadow-sm">
      <div className="container mx-auto max-w-3xl px-4 pt-12 md:pt-20">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
          Submit Your Query
        </h1>
        <p className="text-sm sm:text-base text-gray-700 mb-5 sm:mb-6">
          Please enter your contact details and your question or feedback below.
        </p>

        <form className="flex flex-col gap-3 sm:gap-4" onSubmit={handleForm}>
          <input
            type="text"
            name="name"
            value={userQuery.name}
            onChange={handleQuery}
            placeholder="Full Name"
            className="w-full rounded-md border border-gray-300 p-2.5 sm:p-3 text-sm sm:text-base text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />

          <input
            type="email"
            name="email"
            value={userQuery.email}
            onChange={handleQuery}
            placeholder="Email Address"
            className="w-full rounded-md border border-gray-300 p-2.5 sm:p-3 text-sm sm:text-base text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />

          <input
            type="tel"
            name="phone"
            value={userQuery.phone}
            onChange={handleQuery}
            placeholder="Phone Number (optional)"
            className="w-full rounded-md border border-gray-300 p-2.5 sm:p-3 text-sm sm:text-base text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />

          <textarea
            name="query"
            value={userQuery.query}
            onChange={handleQuery}
            rows={5}
            placeholder="Type your query here..."
            className="w-full rounded-md border border-gray-300 p-3 sm:p-4 text-sm sm:text-base text-gray-700 resize-y focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />

          <button
            type="submit"
            className="w-full bg-purple-600 text-white px-6 py-2.5 sm:py-3 rounded font-semibold text-sm sm:text-base hover:bg-purple-700 transition-colors"
          >
            Submit
          </button>
        </form>
      </div>
    </section>
  );
};

export default Query;
