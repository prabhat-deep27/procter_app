import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { User, Mail, Phone, Building, Upload, CheckCircle, AlertCircle } from 'lucide-react';

// Department options for the dropdown menu
const departmentOptions = [
  "Software Development",
  "Data Structures & Algorithms",
  "Database Management Systems",
  "Networking",
  "Operating Systems",
  "AI & ML",
  "Web Development",
  "App Development",
  "Cloud Computing & DevOps",
  "Blockchain & Cryptocurrency",
  "Data Science & Big Data Analytics",
  "Internet of Things (IoT)",
  "Ethical Hacking",
];

export default function ProfilePage() {
  const { user, token, setUser } = useAuth();
  const fileInputRef = useRef(null);

  // State for each form field
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  
  // Profile picture
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState("");
  
  // Loading and status states
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setDepartment(user.department || "");
      setProfilePicPreview(user.profilePictureUrl || "");
    }
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      setProfilePicPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!username || !email) {
      setError("Username and Email are required!");
      return;
    }

    if (!token) {
      setError("No authentication token found. Please login again.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      console.log("Profile: Starting profile update...");
      console.log("Profile: Token available:", !!token);
      
      const formData = new FormData();

      // Create profileData JSON - only include fields that backend accepts
      const profileData = {
        username: username,
        email: email,
        department: department
        // Note: phone is commented out in backend UpdateProfileRequest
      };

      // Attach profileData as JSON string
      formData.append(
        "profileData",
        new Blob(
          [JSON.stringify(profileData)],
          { type: "application/json" }
        )
      );

      // Attach profile picture if selected
      if (profileImageFile) {
        formData.append("profilePicture", profileImageFile);
        console.log("Profile: Profile picture file attached");
      }

      console.log("Profile: Making API request to /api/users/profile");
      
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          // Don't set Content-Type for FormData - let browser set it with boundary
        },
        body: formData,
      });

      console.log("Profile: Response status:", response.status);
      console.log("Profile: Response ok:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.log("Profile: Error response:", errorText);
        throw new Error(`Failed to update profile. Status: ${response.status} - ${errorText}`);
      }

      const responseData = await response.text();
      console.log("Profile: Success response:", responseData);
      
      setSuccess(true);
      setError("");
      
      // Update user context with new data
      setUser((prev) => ({
        ...prev,
        username,
        email,
        phone, // Keep phone in frontend even if not sent to backend
        department,
        profilePictureUrl: profilePicPreview,
      }));

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (error) {
      console.error("Profile: Profile update error:", error);
      setError(error.message || "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="w-full max-w-4xl p-8 space-y-8 bg-white rounded-2xl shadow-lg">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800">Edit Your Profile</h2>
          <p className="mt-2 text-gray-500">Keep your personal information up to date.</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="text-green-600" size={20} />
            <p className="text-green-700 font-medium">Profile updated successfully!</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="text-red-600" size={20} />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Profile Picture */}
        <div className="flex flex-col items-center space-y-4">
          <img
            src={
              profilePicPreview ||
              `https://placehold.co/128x128/E9D5FF/4C1D95?text=${username.charAt(0) || 'U'}`
            }
            alt="Profile Preview"
            className="w-32 h-32 rounded-full object-cover border-4 border-cyan-200 shadow-md"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://placehold.co/128x128/E9D5FF/4C1D95?text=${username.charAt(0) || 'U'}`;
            }}
          />
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current.click()}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
          >
            <Upload size={18} />
            Change Photo
          </button>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Username */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              className="w-full border border-gray-300 px-3 py-3 pl-10 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="email"
              className="w-full border border-gray-300 px-3 py-3 pl-10 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Phone */}
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="tel"
              className="w-full border border-gray-300 px-3 py-3 pl-10 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">Note: Phone number is stored locally only</p>
          </div>

          {/* Department */}
          <div className="relative">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <select
              className="w-full border border-gray-300 px-3 py-3 pl-10 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition appearance-none bg-white"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="" disabled>Select Department</option>
              {departmentOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Save Button */}
        <div className="text-center">
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full max-w-xs bg-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-cyan-700 focus:outline-none focus:ring-4 focus:ring-cyan-300 transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
