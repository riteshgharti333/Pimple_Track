import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaCalendar,
  FaMapMarkerAlt,
  FaTag,
  FaPalette,
  FaRuler,
  FaHeartbeat,
  FaStickyNote,
  FaTimes,
  FaArrowLeft,
  FaSpinner,
  FaLock,
} from "react-icons/fa";
import { toast } from "sonner";

// Use const objects instead of enums for React Native compatibility
const PimpleLocation = {
  CHIN: "chin",
  NOSE: "nose",
  LEFT_CHEEK: "left cheek",
  RIGHT_CHEEK: "right cheek",
  FOREHEAD: "forehead",
} as const;

const PimpleType = {
  PIH: "pih",
  PIE: "pie",
} as const;

const PimpleColor = {
  RED: "red",
  PINK: "pink",
  BROWN: "brown",
  TAN: "tan",
  GRAY: "gray",
  BLACK: "black",
} as const;

const PimpleSize = {
  SMALL: "small",
  MEDIUM: "medium",
  BIG: "big",
} as const;

const PimpleStatus = {
  ACTIVE: "active",
  HEALING: "healing",
  FLATTENING: "flattening",
  GONE: "gone",
} as const;

const PimplePain = {
  HIGH: "high",
  LITTLE: "little",
  NONE: "none",
} as const;

// Type definitions
type PimpleLocationType = (typeof PimpleLocation)[keyof typeof PimpleLocation];
type PimpleTypeType = (typeof PimpleType)[keyof typeof PimpleType];
type PimpleColorType = (typeof PimpleColor)[keyof typeof PimpleColor];
type PimpleSizeType = (typeof PimpleSize)[keyof typeof PimpleSize];
type PimpleStatusType = (typeof PimpleStatus)[keyof typeof PimpleStatus];
type PimplePainType = (typeof PimplePain)[keyof typeof PimplePain];

interface PimpleFormData {
  date: string;
  location: PimpleLocationType | "";
  type: PimpleTypeType | "";
  color: PimpleColorType | "";
  size: PimpleSizeType | "";
  status: PimpleStatusType | "";
  pain: PimplePainType | "";
  notes: string;
}

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

const API_URL = `${import.meta.env.VITE_URL}/pimples`;


const Update: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<PimpleFormData>({
    date: new Date().toISOString().split("T")[0],
    location: "",
    type: "",
    color: "",
    size: "",
    status: "",
    pain: "",
    notes: "",
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Arrays of options using the const objects
  const locations = [
    { label: "Chin", value: PimpleLocation.CHIN },
    { label: "Nose", value: PimpleLocation.NOSE },
    { label: "Left Cheek", value: PimpleLocation.LEFT_CHEEK },
    { label: "Right Cheek", value: PimpleLocation.RIGHT_CHEEK },
    { label: "Forehead", value: PimpleLocation.FOREHEAD },
  ];

  const types = [
    { label: "PIH", value: PimpleType.PIH },
    { label: "PIE", value: PimpleType.PIE },
  ];

  const colors = [
    { label: "Red", value: PimpleColor.RED },
    { label: "Pink", value: PimpleColor.PINK },
    { label: "Brown", value: PimpleColor.BROWN },
    { label: "Tan", value: PimpleColor.TAN },
    { label: "Gray", value: PimpleColor.GRAY },
    { label: "Black", value: PimpleColor.BLACK },
  ];

  const sizes = [
    { label: "Small", value: PimpleSize.SMALL },
    { label: "Medium", value: PimpleSize.MEDIUM },
    { label: "Big", value: PimpleSize.BIG },
  ];

  const statuses = [
    { label: "Active", value: PimpleStatus.ACTIVE },
    { label: "Healing", value: PimpleStatus.HEALING },
    { label: "Flattening", value: PimpleStatus.FLATTENING },
    { label: "Fully Gone", value: PimpleStatus.GONE },
  ];

  const painLevels = [
    { label: "High", value: PimplePain.HIGH },
    { label: "Little", value: PimplePain.LITTLE },
    { label: "Nothing", value: PimplePain.NONE },
  ];

  // Fetch pimple data by ID on component mount
  useEffect(() => {
    const fetchPimpleData = async () => {
      if (!id) {
        setError("No pimple ID provided");
        setIsFetching(false);
        return;
      }

      setIsFetching(true);
      setError("");

      try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Pimple not found");
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.data) {
          const pimpleData: ApiPimple = result.data;

          const apiDate = new Date(pimpleData.date);
          const formattedDate = apiDate.toISOString().split("T")[0];

          // Map API data to form data
          setFormData({
            date: formattedDate,
            location: pimpleData.location as PimpleLocationType,
            type: pimpleData.type as PimpleTypeType,
            color: pimpleData.color as PimpleColorType,
            size: pimpleData.size as PimpleSizeType,
            status: pimpleData.status as PimpleStatusType,
            pain: pimpleData.pain as PimplePainType,
            notes: pimpleData.notes || "",
          });
        } else {
          throw new Error(result.message || "Failed to fetch pimple data");
        }
      } catch (err) {
        console.error("Error fetching pimple data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load pimple data",
        );
        toast.error("Failed to load pimple data");
      } finally {
        setIsFetching(false);
      }
    };

    fetchPimpleData();
  }, [id]);

  // Handle form field changes
  const handleInputChange = (
    field: keyof PimpleFormData,
    value: string,
  ): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  // Handle form submission for UPDATE
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    // Validate required field (only status)
    if (!formData.status) {
      setError("Please select a current status");
      toast.error("Please select a current status");
      return;
    }

    if (!id) {
      setError("No pimple ID found");
      toast.error("No pimple ID found");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Prepare data for API UPDATE (PATCH)
      const apiData = {
        date: formData.date,
        location: formData.location,
        type: formData.type,
        color: formData.color,
        size: formData.size,
        status: formData.status,
        pain: formData.pain || PimplePain.NONE,
        notes: formData.notes || "",
      };

      console.log("Updating pimple with ID:", id);
      console.log("Sending data to API:", apiData);

      const response = await fetch(`${API_URL}/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`,
        );
      }

      const result = await response.json();
      console.log("API Response:", result);

      toast.success("Pimple updated successfully!", {
        duration: 3000,
      });

      // Navigate back to history page after successful update
      setTimeout(() => {
        navigate("/history");
      }, 1000);
    } catch (err) {
      console.error("Error updating pimple:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to update pimple. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage, {
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Check if form is valid (only status is required)
  const isFormValid = formData.status;

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-blue-500 text-4xl mx-auto mb-4" />
          <p className="text-gray-600">Loading pimple data...</p>
        </div>
      </div>
    );
  }

  if (error && !isFetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-6 text-center">
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6 mb-4">
            <FaTimes className="text-red-500 text-3xl mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2">Error Loading Pimple</h3>
            <p className="text-sm mb-4">{error}</p>
            <button
              onClick={() => navigate("/history")}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Back to History
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 to-blue-700 text-white px-6 py-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center mb-2">
            <button
              onClick={() => navigate("/history")}
              className="mr-4 p-2 hover:bg-blue-500 rounded-full transition-colors"
              disabled={isLoading}
            >
              <FaArrowLeft />
            </button>
            <h1 className="text-2xl font-bold">Update Pimple Progress</h1>
          </div>
          <p className="text-blue-100 text-sm ml-12">
            Update status and notes only - other fields are locked
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-md mx-auto px-6 -mt-4">
        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          {/* Lock Notice */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-center text-blue-700 mb-2">
              <FaLock className="mr-2" />
              <span className="font-medium">Editing Restricted</span>
            </div>
            <p className="text-sm text-blue-600">
              Only <strong>Current Status</strong> and <strong>Notes</strong>{" "}
              can be updated. Other fields are locked to maintain data
              consistency.
            </p>
          </div>

          {/* 1. Date - DISABLED */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center text-gray-700 font-medium">
                <FaCalendar className="mr-2 text-blue-600" />
                When did it appear?
                <span className="text-red-500 ml-1">*</span>
              </label>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                Locked
              </span>
            </div>
            <input
              type="date"
              value={formData.date}
              readOnly
              disabled
              className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 cursor-not-allowed text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formatDate(formData.date)}
            </p>
          </div>

          {/* 2. Location - DISABLED */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center text-gray-700 font-medium">
                <FaMapMarkerAlt className="mr-2 text-blue-600" />
                Where is it located?
                <span className="text-red-500 ml-1">*</span>
              </label>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                Locked
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {locations.map((loc) => (
                <button
                  key={loc.value}
                  type="button"
                  disabled
                  className={`p-3 rounded-xl text-center text-sm font-medium ${
                    formData.location === loc.value
                      ? "bg-blue-400 text-white cursor-not-allowed"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {loc.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Type - DISABLED */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center text-gray-700 font-medium">
                <FaTag className="mr-2 text-blue-600" />
                Type
                <span className="text-red-500 ml-1">*</span>
              </label>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                Locked
              </span>
            </div>
            <div className="flex gap-2">
              {types.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  disabled
                  className={`flex-1 p-3 rounded-xl text-sm font-medium ${
                    formData.type === type.value
                      ? "bg-blue-400 text-white cursor-not-allowed"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Color - DISABLED */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center text-gray-700 font-medium">
                <FaPalette className="mr-2 text-blue-600" />
                Color
                <span className="text-red-500 ml-1">*</span>
              </label>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                Locked
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {colors.map((color) => (
                <div
                  key={color.value}
                  className={`p-3 rounded-xl flex flex-col items-center justify-center ${
                    formData.color === color.value
                      ? "border-2 border-blue-400 bg-white"
                      : "bg-gray-100 border border-gray-200"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full mb-2 opacity-50 ${
                      color.value === PimpleColor.RED
                        ? "bg-red-500"
                        : color.value === PimpleColor.PINK
                          ? "bg-pink-400"
                          : color.value === PimpleColor.BROWN
                            ? "bg-amber-900"
                            : color.value === PimpleColor.TAN
                              ? "bg-amber-200"
                              : color.value === PimpleColor.GRAY
                                ? "bg-gray-400"
                                : "bg-black"
                    }`}
                  />
                  <span className="text-xs font-medium text-gray-400">
                    {color.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Size - DISABLED */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center text-gray-700 font-medium">
                <FaRuler className="mr-2 text-blue-600" />
                Size
                <span className="text-red-500 ml-1">*</span>
              </label>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                Locked
              </span>
            </div>
            <div className="flex gap-2">
              {sizes.map((size) => (
                <button
                  key={size.value}
                  type="button"
                  disabled
                  className={`flex-1 p-3 rounded-xl text-sm font-medium ${
                    formData.size === size.value
                      ? "bg-blue-400 text-white cursor-not-allowed"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          {/* 6. Status - EDITABLE */}
          <div className="mb-6">
            <label className="flex items-center text-gray-700 font-medium mb-3">
              <FaHeartbeat className="mr-2 text-blue-600" />
              Current Status
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {statuses.map((status) => (
                <button
                  key={status.value}
                  type="button"
                  onClick={() => handleInputChange("status", status.value)}
                  className={`p-3 rounded-xl text-sm font-medium transition-all ${
                    formData.status === status.value
                      ? status.value === PimpleStatus.ACTIVE
                        ? "bg-red-100 text-red-700 border border-red-200"
                        : status.value === PimpleStatus.HEALING
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : status.value === PimpleStatus.FLATTENING
                            ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                            : "bg-blue-100 text-blue-700 border border-blue-200"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300"
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Select the current healing status
            </p>
          </div>

          {/* 7. Pain Level - DISABLED */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center text-gray-700 font-medium">
                <FaHeartbeat className="mr-2 text-blue-600" />
                Pain Level
              </label>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                Locked
              </span>
            </div>
            <div className="flex gap-2">
              {painLevels.map((pain) => (
                <button
                  key={pain.value}
                  type="button"
                  disabled
                  className={`flex-1 p-3 rounded-xl text-sm font-medium ${
                    formData.pain === pain.value
                      ? pain.value === PimplePain.HIGH
                        ? "bg-red-100 text-red-400 cursor-not-allowed"
                        : pain.value === PimplePain.LITTLE
                          ? "bg-yellow-100 text-yellow-400 cursor-not-allowed"
                          : "bg-green-100 text-green-400 cursor-not-allowed"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {pain.label}
                </button>
              ))}
            </div>
          </div>

          {/* 8. Notes - EDITABLE */}
          <div className="mb-6">
            <label className="flex items-center text-gray-700 font-medium mb-3">
              <FaStickyNote className="mr-2 text-blue-600" />
              Additional Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                handleInputChange("notes", e.target.value)
              }
              placeholder="Update your observations, treatments used, or comments..."
              className="w-full p-3 border border-gray-300 rounded-xl h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-2">
              Update your observations or treatment progress
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-4">
          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className={`flex-1 py-4 font-medium rounded-xl shadow-md transition-all ${
              !isFormValid || isLoading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-linear-to-r from-green-600 to-green-700 text-white hover:shadow-lg hover:from-green-700 hover:to-green-800"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <FaSpinner className="animate-spin" />
                Updating...
              </span>
            ) : (
              "Update Progress"
            )}
          </button>
        </div>

        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate("/history")}
          disabled={isLoading}
          className="w-full py-3 bg-gray-200 text-gray-700 font-medium rounded-xl mb-4 hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>

        {/* Tips */}
        <div className="bg-linear-to-r from-blue-50 to-blue-100 rounded-2xl p-5">
          <h3 className="font-bold text-blue-800 mb-2">
            💡 Restricted Editing
          </h3>
          <p className="text-sm text-blue-700">
            Only <strong>Current Status</strong> and <strong>Notes</strong> can
            be updated to track healing progress. Original data (date, location,
            type, color, size, pain) remains locked for accurate historical
            tracking.
          </p>
        </div>
      </form>
    </div>
  );
};

export default Update;
