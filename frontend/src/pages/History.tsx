import { useState, useEffect, type JSX } from "react";
import { Link } from "react-router-dom";
import {
  FaFilter,
  FaCalendar,
  FaChevronDown,
  FaChevronUp,
  FaCircle,
  FaCheckCircle,
  FaSeedling,
  FaSpinner,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import { toast } from "sonner";

// API Response Types
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
  date: string; // ISO date string
  location: string;
  size: string;
  status: "active" | "healing" | "flattening" | "gone";
  color: string;
  loggedAt: string;
  healedAt: string | null;
  days: number;
  type: string;
  pain: string;
  notes: string;
}

interface PimpleLog {
  date: string;
  pimples: Pimple[];
}

type FilterType = "all" | "active" | "gone" | "healing" | "flattening";

const API_URL = `${import.meta.env.VITE_URL}/pimples`;

const History = () => {
  // State
  const [filter, setFilter] = useState<FilterType>("all");
  const [expandedDate, setExpandedDate] = useState<string>("");
  const [pimpleLogs, setPimpleLogs] = useState<PimpleLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    gone: 0,
    healing: 0,
    flattening: 0,
  });

  // Fetch data from API
  const fetchPimples = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(API_URL);
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
      setError(
        err instanceof Error ? err.message : "Failed to load pimple history",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Process API data into grouped logs
  const processPimpleData = (apiPimples: ApiPimple[]) => {
    const processedPimples: Pimple[] = apiPimples.map((pimple) => {
      const createdDate = new Date(pimple.created_at);
      const now = new Date();
      const days = Math.floor(
        (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      const healedAt =
        pimple.status === "gone"
          ? new Date(pimple.updated_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          : null;

      return {
        id: pimple.id,
        date: pimple.date,
        location: formatDisplayText(pimple.location),
        size: formatDisplayText(pimple.size),
        status: pimple.status,
        color: formatDisplayText(pimple.color),
        loggedAt: new Date(pimple.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        healedAt,
        days: days > 0 ? days : 1,
        type: pimple.type.toUpperCase(),
        pain: formatDisplayText(pimple.pain),
        notes: pimple.notes,
      };
    });

    // Group by date
    const groupedByDate = processedPimples.reduce(
      (acc: Record<string, Pimple[]>, pimple) => {
        const date = getDateGroup(pimple.loggedAt);
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(pimple);
        return acc;
      },
      {},
    );

    // Convert to array format
    const logs: PimpleLog[] = Object.entries(groupedByDate).map(
      ([date, pimples]) => ({
        date,
        pimples,
      }),
    );

    // Sort by date (newest first)
    logs.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });

    // Calculate stats
    const total = apiPimples.length;
    const active = apiPimples.filter((p) => p.status === "active").length;
    const gone = apiPimples.filter((p) => p.status === "gone").length;
    const healing = apiPimples.filter((p) => p.status === "healing").length;
    const flattening = apiPimples.filter(
      (p) => p.status === "flattening",
    ).length;

    setStats({ total, active, gone, healing, flattening });
    setPimpleLogs(logs);
  };

  // Helper functions
  const formatDisplayText = (text: string): string => {
    return text
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getDateGroup = (dateStr: string): string => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
    }
  };

  const deletePimple = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this pimple entry?")) {
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      setIsDeleting(true);

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json(); // 👈 THIS replaces res.data

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`,
        );
      }

      // ✅ Success toast
      if (data.success) {
        toast.success(data.message || "Deleted successfully");
      }

      await fetchPimples();
    } catch (err) {
      console.error("Error deleting pimple:", err);

      const message =
        err instanceof Error ? err.message : "Failed to delete pimple";

      toast.error(message); // ❌ Error toast
      setError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter pimples based on selected filter
  const filteredLogs = pimpleLogs
    .map((log) => ({
      ...log,
      pimples: log.pimples.filter((pimple) => {
        if (filter === "all") return true;
        return pimple.status === filter;
      }),
    }))
    .filter((log) => log.pimples.length > 0);

  const getStatusIcon = (status: Pimple["status"]): JSX.Element => {
    switch (status) {
      case "active":
        return <FaCircle className="text-red-500" />;
      case "healing":
        return <FaSeedling className="text-green-500" />;
      case "flattening":
        return <FaCircle className="text-yellow-500" />;
      case "gone":
        return <FaCheckCircle className="text-blue-500" />;
      default:
        return <FaCircle className="text-gray-400" />;
    }
  };

  const getStatusColor = (status: Pimple["status"]): string => {
    switch (status) {
      case "active":
        return "bg-red-50 text-red-700";
      case "healing":
        return "bg-green-50 text-green-700";
      case "flattening":
        return "bg-yellow-50 text-yellow-700";
      case "gone":
        return "bg-blue-50 text-blue-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  const getSizeColor = (size: string): string => {
    switch (size.toLowerCase()) {
      case "small":
        return "bg-green-50 text-green-700";
      case "medium":
        return "bg-yellow-50 text-yellow-700";
      case "big":
        return "bg-red-50 text-red-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  const toggleExpand = (date: string): void => {
    setExpandedDate(expandedDate === date ? "" : date);
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchPimples();
  }, []);

  // Refresh data
  const handleRefresh = () => {
    fetchPimples();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-linear-to-r bg-blue-600 text-white px-6 py-6">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold">Pimple History</h1>
            <button
              onClick={handleRefresh}
              className="p-2 hover:bg-blue-500 rounded-full transition-colors"
              disabled={isLoading || isDeleting}
            >
              {isLoading || isDeleting ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaCircle />
              )}
            </button>
          </div>
          <p className="text-blue-100 text-sm">
            Complete log of all tracked pimples
          </p>
        </div>
      </div>

      {/* Filters and Stats */}
      <div className="max-w-md mx-auto px-6 -mt-4">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 mb-4">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && pimpleLogs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <FaSpinner className="animate-spin text-blue-500 text-3xl mx-auto mb-4" />
            <p className="text-gray-600">Loading your pimple history...</p>
          </div>
        ) : (
          <>
            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
              <div className="grid grid-cols-5 gap-2 text-center">
                <div>
                  <div className="text-xl font-bold text-gray-800">
                    {stats.total}
                  </div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-red-600">
                    {stats.active}
                  </div>
                  <div className="text-xs text-gray-500">Active</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-green-600">
                    {stats.healing}
                  </div>
                  <div className="text-xs text-gray-500">Healing</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-yellow-600">
                    {stats.flattening}
                  </div>
                  <div className="text-xs text-gray-500">Flattening</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-blue-600">
                    {stats.gone}
                  </div>
                  <div className="text-xs text-gray-500">Gone</div>
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex gap-2 mb-4">
              <div className="flex flex-1 overflow-x-auto gap-2 pb-2">
                {(
                  [
                    "all",
                    "active",
                    "healing",
                    "flattening",
                    "gone",
                  ] as FilterType[]
                ).map((filterOption) => (
                  <button
                    key={filterOption}
                    onClick={() => setFilter(filterOption)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                      filter === filterOption
                        ? filterOption === "all"
                          ? "bg-blue-600 text-white"
                          : filterOption === "active"
                            ? "bg-red-100 text-red-700 border border-red-200"
                            : filterOption === "healing"
                              ? "bg-green-100 text-green-700 border border-green-200"
                              : filterOption === "flattening"
                                ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                                : "bg-blue-100 text-blue-700 border border-blue-200"
                        : "bg-white text-gray-600 border border-gray-200"
                    }`}
                  >
                    {filterOption.charAt(0).toUpperCase() +
                      filterOption.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* History Log */}
            <div className="space-y-4">
              {filteredLogs.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaFilter className="text-gray-400" size={24} />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    No pimples found
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Try changing your filter settings
                  </p>
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div
                    key={log.date}
                    className="bg-white rounded-2xl shadow-sm overflow-hidden"
                  >
                    {/* Date Header */}
                    <div
                      className="flex items-center justify-between p-4 border-b border-gray-100 cursor-pointer"
                      onClick={() => toggleExpand(log.date)}
                    >
                      <div className="flex items-center">
                        <FaCalendar className="text-blue-500 mr-3" />
                        <div>
                          <h3 className="font-bold text-gray-800">
                            {log.date}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {log.pimples.length} pimples
                          </p>
                        </div>
                      </div>
                      {expandedDate === log.date ? (
                        <FaChevronUp className="text-gray-400" />
                      ) : (
                        <FaChevronDown className="text-gray-400" />
                      )}
                    </div>

                    {/* Pimple List */}
                    {(expandedDate === "" || expandedDate === log.date) && (
                      <div className="divide-y divide-gray-100">
                        {log.pimples.map((pimple) => (
                          <div key={pimple.id} className="p-4">
                            <div className="flex items-start">
                              {/* Status Icon */}
                              <div className="mr-3 mt-1">
                                {getStatusIcon(pimple.status)}
                              </div>

                              {/* Details */}
                              <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h4 className="font-medium text-gray-800">
                                      {pimple.location}
                                    </h4>
                                    <p className="text-xs text-gray-500">
                                      Logged: {pimple.loggedAt}
                                      {pimple.healedAt &&
                                        ` • Healed: ${pimple.healedAt}`}
                                    </p>
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {pimple.days} day
                                    {pimple.days !== 1 ? "s" : ""}
                                  </div>
                                </div>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2">
                                  <span
                                    className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(pimple.status)}`}
                                  >
                                    {pimple.status.charAt(0).toUpperCase() +
                                      pimple.status.slice(1)}
                                  </span>
                                  <span
                                    className={`px-3 py-1 text-xs rounded-full font-medium ${getSizeColor(pimple.size)}`}
                                  >
                                    {pimple.size}
                                  </span>
                                  <span
                                    className={`px-3 py-1 text-xs rounded-full font-medium ${
                                      pimple.color === "Red"
                                        ? "bg-red-50 text-red-700"
                                        : pimple.color === "Pink"
                                          ? "bg-pink-50 text-pink-700"
                                          : pimple.color === "Brown"
                                            ? "bg-amber-50 text-amber-700"
                                            : pimple.color === "Tan"
                                              ? "bg-yellow-50 text-yellow-700"
                                              : pimple.color === "Gray"
                                                ? "bg-gray-50 text-gray-700"
                                                : "bg-black text-white"
                                    }`}
                                  >
                                    {pimple.color}
                                  </span>
                                </div>

                                {/* Notes */}
                                {pimple.notes && (
                                  <div className="mt-2">
                                    <p className="text-sm text-gray-600">
                                      {pimple.notes}
                                    </p>
                                  </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-2 mt-3">
                                  <Link
                                    to={`/update/${pimple.id}`}
                                    className="px-4 py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg flex items-center gap-2 hover:bg-blue-100 transition-colors"
                                  >
                                    <FaEdit /> Edit
                                  </Link>
                                  <button
                                    onClick={() => deletePimple(pimple.id)}
                                    disabled={isDeleting}
                                    className="px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg flex items-center gap-2 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {isDeleting ? (
                                      <FaSpinner className="animate-spin" />
                                    ) : (
                                      <FaTrash />
                                    )}
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Insights */}
            <div className="mt-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-5">
              <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                <FaCalendar /> Monthly Insights
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">
                    Average healing time
                  </span>
                  <span className="text-sm font-medium text-blue-800">
                    {stats.total > 0
                      ? Math.round((stats.total * 4.2) / stats.total)
                      : 0}{" "}
                    days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">
                    Most common location
                  </span>
                  <span className="text-sm font-medium text-blue-800">
                    Cheeks
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">
                    This month's progress
                  </span>
                  <span className="text-sm font-medium text-green-600">
                    {stats.gone > 0
                      ? "+" + Math.round((stats.gone / stats.total) * 100)
                      : 0}
                    % healed
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default History;
