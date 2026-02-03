import React, { useState } from "react";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const API_URL = `${import.meta.env.VITE_URL}/auth/login`;

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      console.log(data);

      if (data.success) {
        // ✅ STORE TOKEN HERE
        localStorage.setItem("pimptoken", data.data.token);

        toast.success(data.message || "Login successful");
        navigate("/");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center pb-20">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 to-blue-700 text-white px-6 py-8">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center mb-5">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-lg">P</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-400 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  Pimp Track
                </h1>
                <p className="text-xs text-yellow-400 -mt-1">Skin Tracker</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Form */}
      <div className="max-w-md mx-auto px-6 -mt-4">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
          <form onSubmit={handleSubmit}>
            <h1 className="text-2xl font-bold text-center mb-5 text-blue-600">
              Sign In
            </h1>

            {/* Email Input */}
            <div className="mb-6">
              <label className="flex items-center text-gray-700 font-medium mb-3">
                <FaEnvelope className="mr-2 text-blue-600" />
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter your email"
                  className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 pr-12"
                  required
                />
                <FaEnvelope className="absolute right-4 top-4 text-gray-400" />
              </div>
            </div>

            {/* Password Input */}
            <div className="mb-8">
              <label className="flex items-center text-gray-700 font-medium mb-3">
                <FaLock className="mr-2 text-blue-600" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  placeholder="Enter your password"
                  className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-linear-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all hover:from-blue-700 hover:to-blue-800 mb-4 disabled:opacity-60"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>

      {/* App Info */}
      <div className="max-w-md mx-auto px-6 mt-8 text-center">
        <p className="text-xs text-gray-500">
          Pimp Track • Private Skin Tracking • v1.0.0
        </p>
      </div>
    </div>
  );
};

export default Login;
