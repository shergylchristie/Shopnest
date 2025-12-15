import React, { useEffect, useState } from "react";
import Slidebar from "./Slidebar";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

const QueryReply = () => {
  const [emailData, setEmailData] = useState({
    to: "",
    query: "",
    sub: "",
    reply: "",
  });

  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  async function handleTo() {
    try {
      const response = await fetch(`/api/getEmail/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      setEmailData((prev) => ({
        ...prev,
        to: result.email || "",
        query: result.query || "",
      }));
    } catch (error) {
      toast.error(error?.message || "Failed to load email");
    }
  }

  async function handleForm(e) {
    e.preventDefault();
    if(!emailData.reply || !emailReply.sub)
      return toast.error("Please fill all the fields")

    const emaildata = emailData;


    try {
      const response = await fetch("/api/sendReply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(emaildata),
      });
      const result = await response.json();
      if (response.ok) {
        toast.success(result.message || "Reply sent");
        navigate("/admin/manageQuery");
      } else {
        toast.error(result.message || "Something went wrong");
      }
    } catch (error) {
      toast.error(error?.message || "Something went wrong");
    }
  }

  function handleReply(e) {
    setEmailData({ ...emailData, [e.target.name]: e.target.value });
  }

  useEffect(() => {
    handleTo();
  }, []);

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden bg-gray-50">
      <div className="flex flex-col lg:flex-row w-full mt-9 md:mt-1">
        <Slidebar />

        <main className="flex-1 overflow-y-auto scrollbar-hide pt-7 md:pt-6 p-6">
          <div className="max-w-xl mx-auto">
            <h1 className="text-2xl sm:text-3xl md:text-4xl mt-2 mb-3 sm:mb-8 font-bold font-mono text-gray-900">
              Query Reply
            </h1>

            <form
              onSubmit={handleForm}
              className="w-full bg-white rounded shadow p-4 sm:p-6 space-y-5 sm:space-y-6"
            >
              <div>
                <label
                  className="block text-sm sm:text-base text-gray-700 font-semibold mb-1.5 sm:mb-2"
                  htmlFor="to"
                >
                  To:
                </label>
                <input
                  id="to"
                  type="text"
                  name="to"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm sm:text-base text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={emailData.to}
                  readOnly
                />
              </div>

              <div>
                <label
                  className="block text-sm sm:text-base text-gray-700 font-semibold mb-1.5 sm:mb-2"
                  htmlFor="from"
                >
                  From:
                </label>
                <input
                  id="from"
                  type="text"
                  value="shergyljchristie@gmail.com"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm sm:text-base text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  readOnly
                />
              </div>

              <div>
                <label
                  className="block text-sm sm:text-base text-gray-700 font-semibold mb-1.5 sm:mb-2"
                  htmlFor="sub"
                >
                  Subject:
                </label>
                <input
                  id="sub"
                  type="text"
                  name="sub"
                  onChange={handleReply}
                  value={emailData.sub}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm sm:text-base text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label
                  className="block text-sm sm:text-base text-gray-700 font-semibold mb-1.5 sm:mb-2"
                  htmlFor="reply"
                >
                  Reply
                </label>
                <textarea
                  id="reply"
                  name="reply"
                  onChange={handleReply}
                  value={emailData.reply}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm sm:text-base text-gray-700 resize-y focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows="3"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 sm:py-3 rounded text-sm sm:text-base transition-colors"
              >
                Send
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default QueryReply;
