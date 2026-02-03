import React, { useState } from "react";
import {
  FaCalendar,
  FaMapMarkerAlt,
  FaTag,
  FaPalette,
  FaRuler,
  FaHeartbeat,
  FaStickyNote,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
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

interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

const API_URL = `${import.meta.env.VITE_URL}/pimples`;

const Add: React.FC = () => {
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
  const navigate = useNavigate();

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

  // Handle form field changes
  const handleInputChange = (
    field: keyof PimpleFormData,
    value: string,
  ): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.date ||
      !formData.location ||
      !formData.type ||
      !formData.color ||
      !formData.size ||
      !formData.status
    ) {
      toast.error("Please fill all required fields (marked with *)");
      return;
    }

    setIsLoading(true);

    try {
      // Prepare data for API
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

      console.log("Sending data to API:", apiData);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`,
        );
      }

      const result = await response.json();
      console.log("API Response:", result);

      toast.success("Pimple logged successfully!", {
        duration: 3000,
      });

      navigate("/history")

      // Reset form
      setFormData({
        date: new Date().toISOString().split("T")[0],
        location: "",
        type: "",
        color: "",
        size: "",
        status: "",
        pain: "",
        notes: "",
      });
    } catch (err) {
      console.error("Error submitting form:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to save pimple. Please try again.",
        {
          duration: 5000,
        },
      );
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

  // Check if form is valid
  const isFormValid =
    formData.date &&
    formData.location &&
    formData.type &&
    formData.color &&
    formData.size &&
    formData.status;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 to-blue-700 text-white px-6 py-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-2">Log New Pimple</h1>
          <p className="text-blue-100 text-sm">
            Track your skin progress accurately
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-md mx-auto px-6 -mt-4">
        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          {/* 1. Date - Now marked as required */}
          <div className="mb-6">
            <label className="flex items-center text-gray-700 font-medium mb-3">
              <FaCalendar className="mr-2 text-blue-600" />
              When did it appear?
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleInputChange("date", e.target.value)
              }
              max={new Date().toISOString().split("T")[0]}
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formatDate(formData.date)}
            </p>
          </div>

          {/* 2. Location - Already marked as required */}
          <div className="mb-6">
            <label className="flex items-center text-gray-700 font-medium mb-3">
              <FaMapMarkerAlt className="mr-2 text-blue-600" />
              Where is it located?
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {locations.map((loc) => (
                <button
                  key={loc.value}
                  type="button"
                  onClick={() => handleInputChange("location", loc.value)}
                  className={`p-3 rounded-xl text-center text-sm font-medium transition-all ${
                    formData.location === loc.value
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300"
                  }`}
                >
                  {loc.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Type - Already marked as required */}
          <div className="mb-6">
            <label className="flex items-center text-gray-700 font-medium mb-3">
              <FaTag className="mr-2 text-blue-600" />
              Type
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="flex gap-2">
              {types.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleInputChange("type", type.value)}
                  className={`flex-1 p-3 rounded-xl text-sm font-medium transition-all ${
                    formData.type === type.value
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Color - Already marked as required */}
          <div className="mb-6">
            <label className="flex items-center text-gray-700 font-medium mb-3">
              <FaPalette className="mr-2 text-blue-600" />
              Color
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {colors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => handleInputChange("color", color.value)}
                  className={`p-3 rounded-xl flex flex-col items-center justify-center transition-all ${
                    formData.color === color.value
                      ? "border-2 border-blue-500 bg-white"
                      : "bg-white border border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full mb-2 ${
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
                  <span className="text-xs font-medium">{color.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 5. Size - Already marked as required */}
          <div className="mb-6">
            <label className="flex items-center text-gray-700 font-medium mb-3">
              <FaRuler className="mr-2 text-blue-600" />
              Size
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="flex gap-2">
              {sizes.map((size) => (
                <button
                  key={size.value}
                  type="button"
                  onClick={() => handleInputChange("size", size.value)}
                  className={`flex-1 p-3 rounded-xl text-sm font-medium transition-all ${
                    formData.size === size.value
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300"
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          {/* 6. Status - Already marked as required */}
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
          </div>

          {/* 7. Pain Level - Now marked as required */}
          <div className="mb-6">
            <label className="flex items-center text-gray-700 font-medium mb-3">
              <FaHeartbeat className="mr-2 text-blue-600" />
              Pain Level
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="flex gap-2">
              {painLevels.map((pain) => (
                <button
                  key={pain.value}
                  type="button"
                  onClick={() => handleInputChange("pain", pain.value)}
                  className={`flex-1 p-3 rounded-xl text-sm font-medium transition-all ${
                    formData.pain === pain.value
                      ? pain.value === PimplePain.HIGH
                        ? "bg-red-100 text-red-700 border border-red-200"
                        : pain.value === PimplePain.LITTLE
                          ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                          : "bg-green-100 text-green-700 border border-green-200"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300"
                  }`}
                >
                  {pain.label}
                </button>
              ))}
            </div>
          </div>

          {/* 8. Notes - Now marked as required */}
          <div className="mb-6">
            <label className="flex items-center text-gray-700 font-medium mb-3">
              <FaStickyNote className="mr-2 text-blue-600" />
              Additional Notes
              <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              value={formData.notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                handleInputChange("notes", e.target.value)
              }
              placeholder="Any other observations, treatments used, or comments..."
              className="w-full p-3 border border-gray-300 rounded-xl h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              rows={4}
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isFormValid || isLoading}
          className={`w-full py-4 font-medium rounded-xl shadow-md transition-all mb-4 ${
            !isFormValid || isLoading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-linear-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg hover:from-blue-700 hover:to-blue-800"
          }`}
        >
          {isLoading ? "Saving..." : "Save Entry"}
        </button>

        {/* Tips */}
        <div className="bg-linear-to-r from-blue-50 to-blue-100 rounded-2xl p-5">
          <h3 className="font-bold text-blue-800 mb-2">💡 Note</h3>
          <p className="text-sm text-blue-700">
            <strong>All fields are now required.</strong> Fields marked with{" "}
            <span className="text-red-500">*</span> must be filled. The data
            will be saved to your local tracking database.
          </p>
        </div>
      </form>
    </div>
  );
};

export default Add;