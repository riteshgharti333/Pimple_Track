import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaChevronRight,
  FaFire,
  FaSeedling,
  FaCheckCircle,
  FaSpinner,
} from "react-icons/fa";
import { toast } from "sonner";

interface ApiPimple {
  id: string;
  date: string;
  location: string;
  type: string;
  color: string;
  size: string;
  status: "active" | "healing" | "flattening" | "gone";
  pain: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: ApiPimple[];
}

interface Pimple {
  id: string;
  location: string;
  size: string;
  color: string;
  days: number;
  status: "active" | "healing" | "flattening" | "gone";
}

const API_URL = `${import.meta.env.VITE_URL}/pimples`;

const Homepage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [stats, setStats] = useState({
    active: 0,
    healing: 0,
    gone: 0,
    flattening: 0,
    total: 0,
  });
  const [activePimples, setActivePimples] = useState<Pimple[]>([]);
  const [monthTotal, setMonthTotal] = useState<number>(0);

  // Fetch data from API
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("pimptoken");
      if (!token) {
        toast.error("Please login first");
        navigate("/login");
        return;
      }

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse = await response.json();

      if (result.success && result.data) {
        processPimpleData(result.data);
      } else {
        throw new Error(result.message || "Failed to fetch pimples");
      }
    } catch (err) {
      console.error("Error fetching pimples:", err);
      toast.error(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  // Process API data
  const processPimpleData = (apiPimples: ApiPimple[]) => {
    const total = apiPimples.length;

    // Calculate stats
    const active = apiPimples.filter((p) => p.status === "active").length;
    const healing = apiPimples.filter((p) => p.status === "healing").length;
    const gone = apiPimples.filter((p) => p.status === "gone").length;
    const flattening = apiPimples.filter(
      (p) => p.status === "flattening",
    ).length;

    setStats({ total, active, healing, gone, flattening });

    // Get active and healing pimples (not gone)
    const activeAndHealingPimples = apiPimples
      .filter((p) => p.status !== "gone")
      .map((pimple) => {
        const createdDate = new Date(pimple.created_at);
        const now = new Date();
        const days = Math.floor(
          (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24),
        );

        return {
          id: pimple.id,
          location: formatDisplayText(pimple.location),
          size: formatDisplayText(pimple.size),
          color: formatDisplayText(pimple.color),
          days: days > 0 ? days : 1,
          status: pimple.status,
        };
      })
      .sort((a, b) => {
        // Sort by status priority: active > healing > flattening > gone
        const statusOrder = { active: 1, healing: 2, flattening: 3, gone: 4 };
        return statusOrder[a.status] - statusOrder[b.status];
      });

    setActivePimples(activeAndHealingPimples);

    // Calculate this month's total
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const thisMonthPimples = apiPimples.filter((pimple) => {
      const pimpleDate = new Date(pimple.created_at);
      return (
        pimpleDate.getMonth() === currentMonth &&
        pimpleDate.getFullYear() === currentYear
      );
    });

    setMonthTotal(thisMonthPimples.length);
  };

  // Format text for display
  const formatDisplayText = (text: string): string => {
    return text
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getDateString = (): string => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      month: "long",
      day: "numeric",
    };
    return today.toLocaleDateString("en-US", options);
  };

  // Get encouragement message based on stats
  const getEncouragement = (): string => {
    if (stats.gone > 0 && stats.active === 0) {
      return "Great progress!";
    } else if (stats.active > 3) {
      return "Stay consistent!";
    } else if (stats.healing > 0) {
      return "Healing in progress!";
    } else {
      return "Keep tracking!";
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Refresh data
  const handleRefresh = () => {
    fetchData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-blue-500 text-4xl mx-auto mb-4" />
          <p className="text-gray-600">Loading your skin data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-white pb-20">
      {/* Header Section */}
      <div className="bg-linear-to-r bg-blue-600 text-white px-6 py-8">
        <div className="">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-2xl font-bold mb-1">Today's Status</h1>
            <button
              onClick={handleRefresh}
              className="p-2 hover:bg-blue-500 rounded-full transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaChevronRight className="rotate-90" />
              )}
            </button>
          </div>
          <p className="text-blue-100 text-sm mb-6">{getDateString()}</p>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {/* Active */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <FaFire className="text-red-300 mr-2" />
                <span className="text-sm font-medium">Active</span>
              </div>
              <div className="text-3xl font-bold">{stats.active}</div>
            </div>

            {/* Healing */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <FaSeedling className="text-green-300 mr-2" />
                <span className="text-sm font-medium">Healing</span>
              </div>
              <div className="text-3xl font-bold">{stats.healing}</div>
            </div>

            {/* Flattening */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <FaSeedling className="text-yellow-300 mr-2" />
                <span className="text-sm font-medium">Flattening</span>
              </div>
              <div className="text-3xl font-bold">{stats.flattening}</div>
            </div>
          </div>

          {/* Total Summary */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-blue-100">
                  Total tracked this month
                </p>
                <p className="text-xl font-bold">{monthTotal} pimples</p>
              </div>
              <div className="text-xs bg-blue-500 text-white px-3 py-1 rounded-full">
                {getEncouragement()}
              </div>
            </div>
            <div className="mt-2 text-xs text-blue-200">
              Overall total: {stats.total} pimples • {stats.gone} fully healed
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-6 -mt-6">
        {/* Quick Action Button */}
        <div className="mb-6 ">
          <Link
            to="/add"
            className="block w-full bg-linear-to-r  bg-white rounded-2xl p-5 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow active:scale-95 text-blue-600"
          >
            <FaPlus className="mr-3" size={22} />
            <span className="text-xl font-bold">Add New Pimple</span>
          </Link>
          <p className="text-gray-500 text-sm text-center mt-2">
            Tap to log a new pimple or skin concern
          </p>
        </div>

        {/* Active Pimples Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">
                Active & Healing Pimples
              </h2>
              <Link
                to="/history"
                className="flex items-center text-blue-600 text-sm hover:text-blue-700"
              >
                <span>View All</span>
                <FaChevronRight size={12} className="ml-1" />
              </Link>
            </div>
            <p className="text-gray-500 text-sm mt-1">
              Currently tracking {activePimples.length} active/healing pimples
            </p>
          </div>

          {/* Pimples List */}
          <div className="divide-y divide-gray-100">
            {activePimples.map((pimple) => (
              <Link
                key={pimple.id}
                to={`/edit/${pimple.id}`}
                className="block p-4 flex items-center hover:bg-gray-50 transition-colors"
              >
                {/* Status Indicator */}
                <div
                  className={`w-3 h-3 rounded-full mr-4 ${
                    pimple.status === "active"
                      ? "bg-red-500"
                      : pimple.status === "healing"
                        ? "bg-green-500"
                        : "bg-yellow-500"
                  }`}
                ></div>

                {/* Pimple Details */}
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-medium text-gray-800">
                      {pimple.location}
                    </h3>
                    <span className="text-sm text-gray-500">
                      Day {pimple.days}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs rounded-full font-medium">
                      {pimple.size}
                    </span>
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-medium ${
                        pimple.color === "Red"
                          ? "bg-red-50 text-red-600"
                          : pimple.color === "Pink"
                            ? "bg-pink-50 text-pink-600"
                            : pimple.color === "Brown"
                              ? "bg-amber-50 text-amber-600"
                              : pimple.color === "Tan"
                                ? "bg-yellow-50 text-yellow-600"
                                : pimple.color === "Gray"
                                  ? "bg-gray-50 text-gray-600"
                                  : "bg-black text-white"
                      }`}
                    >
                      {pimple.color}
                    </span>
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-medium ${
                        pimple.status === "active"
                          ? "bg-red-50 text-red-600"
                          : pimple.status === "healing"
                            ? "bg-green-50 text-green-600"
                            : "bg-yellow-50 text-yellow-600"
                      }`}
                    >
                      {formatDisplayText(pimple.status)}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="ml-3 text-blue-600">
                  <FaChevronRight />
                </div>
              </Link>
            ))}
          </div>

          {/* Empty State */}
          {activePimples.length === 0 && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheckCircle className="text-blue-500" size={24} />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Clear skin!
              </h3>
              <p className="text-gray-500 text-sm">
                No active pimples being tracked. Great job!
              </p>
              <Link
                to="/history"
                className="mt-4 inline-block text-blue-600 text-sm font-medium hover:text-blue-700"
              >
                View healing history →
              </Link>
            </div>
          )}
        </div>

        {/* Healing Progress */}
        {stats.gone > 0 && (
          <div className="mt-6 bg-linear-to-r from-green-50 to-green-100 rounded-2xl p-5">
            <div className="flex items-center mb-2">
              <FaCheckCircle className="text-green-600 mr-2" />
              <h3 className="font-bold text-green-800">🎉 Healing Progress</h3>
            </div>
            <p className="text-green-700 text-sm">
              You've successfully healed {stats.gone} pimple
              {stats.gone !== 1 ? "s" : ""} so far!
              {stats.gone > 0 && " That's amazing progress!"}
            </p>
            <div className="mt-3 flex items-center text-sm text-green-600">
              <span className="font-medium">Healing rate: </span>
              <span className="ml-2">
                {stats.total > 0
                  ? Math.round((stats.gone / stats.total) * 100)
                  : 0}
                %
              </span>
            </div>
          </div>
        )}

        {/* Quick Tips Section */}
        <div className="mt-6 bg-linear-to-r from-blue-50 to-blue-100 rounded-2xl p-5">
          <h3 className="font-bold text-blue-800 mb-2">💡 Quick Tip</h3>
          <p className="text-blue-700 text-sm">
            {activePimples.length > 0
              ? "Update pimple status regularly to track healing progress accurately."
              : "Log every new pimple immediately for the most accurate tracking."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
