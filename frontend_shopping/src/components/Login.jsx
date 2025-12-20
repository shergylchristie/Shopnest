import React, { useState } from "react";
import toast from "react-hot-toast";
import { FaTimes, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../apiClient";

const Login = ({ setToken }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [login, setLogin] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const togglePassword = () => {
    setShowPassword((password) => !password);
  };

  function onClose() {
    navigate("/");
  }

  function handleLogin(e) {
    setLogin({ ...login, [e.target.name]: e.target.value });
  }

  async function handleForm(e) {
    e.preventDefault();
    const formdata = login;
    setIsLoading(true);

    try {
      const response = await apiFetch("/api/userLogin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formdata),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message);
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", result.id);
        localStorage.setItem("role", result.role);
        setToken(result.token);
        navigate("/");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 w-96 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
        >
          <FaTimes size={20} />
        </button>

        <h2 className="text-2xl font-semibold mb-6 text-center">Login</h2>

        <form onSubmit={handleForm}>
          <div className="mb-4">
            <label htmlFor="email" className="block mb-2 font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={login.email}
              onChange={handleLogin}
              placeholder="Enter your email"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
              disabled={isLoading}
            />
          </div>

          <div className="mb-4 relative">
            <label htmlFor="password" className="block mb-2 font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              value={login.password}
              onChange={handleLogin}
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="w-full border border-gray-300 rounded px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={togglePassword}
              className="absolute top-11 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
              disabled={isLoading}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            className="text-purple-600 hover:underline disabled:text-gray-400"
            onClick={() => navigate("/register")}
            disabled={isLoading}
          >
            Don't have an account? Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
