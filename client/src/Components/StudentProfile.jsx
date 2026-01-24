import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { User, Mail, Phone, Building, Upload, CheckCircle, AlertCircle, BookOpen, Trophy, Calendar, Target, ArrowLeft } from 'lucide-react';

// Course options for students
const courseOptions = [
  "Computer Science",
  "Information Technology",
  "Software Engineering",
  "Data Science",
  "Cybersecurity",
  "Artificial Intelligence",
  "Web Development",
  "Mobile App Development",
  "Game Development",
  "Cloud Computing",
  "Machine Learning",
  "Database Management",
  "Network Engineering",
  "Digital Marketing",
  "UI/UX Design"
];

export default function StudentProfile({ onBack }) {
  const { user, token, setUser } = useAuth();
  const fileInputRef = useRef(null);

  // State for each form field
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [course, setCourse] = useState("");
  
  // Profile picture
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState("");
  
  // Loading and status states
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Student-specific stats
  const [studentStats, setStudentStats] = useState({
    totalTests: 0,
    averageScore: 0,
    bestScore: 0,
    testsThisMonth: 0
  });

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setCourse(user.department || "");
      setProfilePicPreview(user.profilePictureUrl || "");
    }
  }, [user]);

  // Fetch student statistics
  useEffect(() => {
    const fetchStudentStats = async () => {
      if (!token) return;
      
      try {
        const response = await fetch('/api/tests/completed', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const tests = await response.json();
          const totalTests = tests.length;
          const scores = tests.map(test => test.score);
          const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
          const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
          
          // Count tests this month
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();
          const testsThisMonth = tests.filter(test => {
            const testDate = new Date(test.completedAt);
            return testDate.getMonth() === currentMonth && testDate.getFullYear() === currentYear;
          }).length;

          setStudentStats({
            totalTests,
            averageScore,
            bestScore,
            testsThisMonth
          });
        }
      } catch (err) {
        console.error('Error fetching student stats:', err);
      }
    };

    fetchStudentStats();
  }, [token]);

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
      console.log("Student Profile: Starting profile update...");
      
      const formData = new FormData();

      // Create profileData JSON
      const profileData = {
        username: username,
        email: email,
        department: course
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
      }

      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update profile. Status: ${response.status} - ${errorText}`);
      }

      setSuccess(true);
      setError("");
      
      // Update user context with new data
      setUser((prev) => ({
        ...prev,
        username,
        email,
        phone,
        department: course,
        profilePictureUrl: profilePicPreview,
      }));

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (error) {
      console.error("Student Profile: Profile update error:", error);
      setError(error.message || "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-4 mb-2">
              {onBack && (
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 transition-colors"
                >
                  <ArrowLeft size={20} />
                  <span className="text-sm font-medium">Back to Dashboard</span>
                </button>
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Student Profile</h2>
            <p className="text-gray-500">Manage your personal information and academic details.</p>
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
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Picture</h3>
            <div className="flex flex-col items-center space-y-4">
              <img
                src={
                  profilePicPreview ||
                  `https://placehold.co/128x128/E9D5FF/4C1D95?text=${username.charAt(0) || 'S'}`
                }
                alt="Profile Preview"
                className="w-32 h-32 rounded-full object-cover border-4 border-cyan-200 shadow-md"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://placehold.co/128x128/E9D5FF/4C1D95?text=${username.charAt(0) || 'S'}`;
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
                className="flex items-center gap-2 bg-cyan-100 text-cyan-700 px-4 py-2 rounded-lg font-semibold hover:bg-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-300 transition"
              >
                <Upload size={18} />
                Change Photo
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username */}
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  className="w-full border border-gray-300 px-3 py-3 pl-10 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                  placeholder="student"
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
                  placeholder="yourname@gmail.com"
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

              {/* Course */}
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <select
                  className="w-full border border-gray-300 px-3 py-3 pl-10 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition appearance-none bg-white"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                >
                  <option value="" disabled>Select Course</option>
                  {courseOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-6">
              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full bg-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-cyan-700 focus:outline-none focus:ring-4 focus:ring-cyan-300 transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Student Statistics */}
        <div className="space-y-6">
          {/* Academic Stats */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Trophy className="text-cyan-600" size={20} />
              Academic Performance
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-cyan-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <BookOpen className="text-cyan-600" size={18} />
                  <span className="text-sm font-medium text-gray-700">Total Tests</span>
                </div>
                <span className="text-lg font-bold text-cyan-700">{studentStats.totalTests}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Target className="text-green-600" size={18} />
                  <span className="text-sm font-medium text-gray-700">Average Score</span>
                </div>
                <span className="text-lg font-bold text-green-700">{studentStats.averageScore}%</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Trophy className="text-yellow-600" size={18} />
                  <span className="text-sm font-medium text-gray-700">Best Score</span>
                </div>
                <span className="text-lg font-bold text-yellow-700">{studentStats.bestScore}%</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="text-blue-600" size={18} />
                  <span className="text-sm font-medium text-gray-700">This Month</span>
                </div>
                <span className="text-lg font-bold text-blue-700">{studentStats.testsThisMonth}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 bg-cyan-50 rounded-lg hover:bg-cyan-100 transition-colors">
                <div className="font-medium text-cyan-800">View Test History</div>
                <div className="text-sm text-cyan-600">Review all your completed tests</div>
              </button>
              
              <button className="w-full text-left p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <div className="font-medium text-green-800">Download Certificate</div>
                <div className="text-sm text-green-600">Get your achievement certificate</div>
              </button>
              
              <button className="w-full text-left p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <div className="font-medium text-blue-800">Study Resources</div>
                <div className="text-sm text-blue-600">Access learning materials</div>
              </button>
            </div>
          </div>

          {/* Student Badge */}
          <div className="bg-gradient-to-r from-cyan-600 to-pink-500 rounded-xl shadow-sm p-6 text-white">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <User size={32} />
              </div>
              <h3 className="text-lg font-semibold mb-1">Student Badge</h3>
              <p className="text-sm opacity-90">Active Student</p>
              <div className="mt-3 text-xs opacity-75">
                Member since {new Date().getFullYear()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
