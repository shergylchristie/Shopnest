import React, { useState } from "react";
import { FiLock } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../apiClient";
import { toast } from "react-hot-toast";

const AccountDeletePage = () => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const userid = localStorage.getItem("user");
  const token = localStorage.getItem("token");

  if (!token) {
    navigate("/", { replace: true });
    return;
  }

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  async function handleDelete(e) {
    e.preventDefault();
    try {
      const res = await apiFetch(`/api/deleteAccount/${userid}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });
      const result = await res.json();
      if (res.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("role");
        dispatch(appLogout());
        navigate("/", { replace: true });
        toast.success(result.message);
      } else toast.error(result.message);
    } catch (error) {
      toast.error(error);
    }
  }

  return (
    <div className="bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="w-full bg-white rounded-2xl shadow-md border border-slate-100 p-8 max-w-md">
        <div className="text-center mb-8">
          <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-rose-100 border-4 border-rose-200 flex items-center justify-center">
            <FiLock className="text-2xl text-rose-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Delete Account
          </h1>
          <p className="text-sm text-slate-600">
            This action cannot be undone. All your data will be permanently
            removed.
          </p>
        </div>

        <form onSubmit={handleDelete} className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-slate-700">
              Enter your password to confirm
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50"
                required
              />
              <button
                type="button"
                onClick={togglePassword}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500 hover:text-slate-700"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!password.trim()}
            className="w-full rounded-xl border border-rose-300 bg-rose-50 px-6 py-3 text-sm font-semibold text-rose-700 hover:bg-rose-100 hover:border-rose-400 disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed transition-colors"
          >
            Delete Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default AccountDeletePage;
