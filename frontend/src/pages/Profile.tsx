import React, { useEffect, useState } from "react";
import { FaEnvelope, FaSignOutAlt } from "react-icons/fa";
import { toast } from "sonner";

const API_URL = `${import.meta.env.VITE_URL}/auth/profile`;

type User = {
  name: string;
  email: string;
};

const Profile: React.FC = () => {
  const [userData, setUserData] = useState<User>({
    name: "",
    email: "",
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("pimptoken");

        if (!token) {
          throw new Error("Unauthorized");
        }

        const response = await fetch(API_URL, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch profile");
        }

        if (data?.success && data?.data) {
          setUserData({
            name: data.data.name,
            email: data.data.email,
          });
        } else {
          throw new Error("Invalid profile response");
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong";
        toast.error(message);
        console.error("Profile fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("pimptoken");
    toast.success("Logged out successfully");
    window.location.href = "/login";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading profile...
      </div>
    );
  }

  console.log(userData);
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-linear-to-r bg-blue-600 text-white px-6 py-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-2">Profile</h1>
          <p className="text-blue-100 text-sm">Your account information</p>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-md mx-auto px-6 -mt-4">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
          {/* Profile Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 bg-linear-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <span className="text-white text-4xl font-bold">
                {userData.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              {userData.name}
            </h2>
          </div>

          {/* User Info */}
          <div className="space-y-6">
            {/* Name */}
            <div className="border-b border-gray-100 pb-4">
              <span className="text-sm font-medium text-gray-500">
                Full Name
              </span>
              <div className="flex items-center mt-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-medium">
                    {userData.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-gray-800 font-medium">
                  {userData.name}
                </span>
              </div>
            </div>

            {/* Email */}
            <div className="border-b border-gray-100 pb-4">
              <div className="flex items-center text-gray-500 mb-2">
                <FaEnvelope className="mr-2 text-blue-500" />
                <span className="text-sm font-medium">Email Address</span>
              </div>
              <p className="text-gray-800 font-medium">{userData.email}</p>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full bg-white border border-red-200 text-red-600 font-medium rounded-xl p-4 flex items-center justify-center hover:bg-red-50 transition-colors"
        >
          <FaSignOutAlt className="mr-3" />
          Logout
        </button>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Pimp Track • Your private skin tracking tool
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
