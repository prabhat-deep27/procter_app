import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom"; 
import { useAuth } from "../context/AuthContext"; 
import Sidebar from "./Sidebar";
import TestCard from "./TestCard";
import SavedTestsPage from "../pages/SavedTestsPage";
import { useEffect } from "react";
import { createStompClient, subscribeToTestEvents } from "../lib/stompClient";

function ProctoringPanel() {
  const [events, setEvents] = useState([]);
  const [testId, setTestId] = useState("");
  useEffect(() => {
    if (!testId) return;
    const client = createStompClient();
    client.onConnect = () => {
      subscribeToTestEvents(client, testId, (evt) => {
        setEvents((prev) => [evt, ...prev].slice(0, 200));
      });
    };
    client.activate();
    return () => client.deactivate();
  }, [testId]);
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="flex items-center gap-2 mb-3">
        <input
          placeholder="Enter Test ID to monitor"
          value={testId}
          onChange={(e) => setTestId(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        />
      </div>
      <div className="h-80 overflow-auto space-y-2">
        {events.map((e, idx) => (
          <div key={idx} className="text-sm text-gray-800 border-b pb-2">
            <span className="font-semibold">{e.type}</span>: {JSON.stringify(e)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TeacherDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout } = useAuth(); // 2. Get user and logout from context
  const navigate = useNavigate();

  // 3. The useEffect hook is no longer needed
  // useEffect(() => {
  //   const storedUsername = localStorage.getItem("username");
  //   if (storedUsername) {
  //     setUsername(storedUsername);
  //   }
  // }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex flex-col lg:flex-row bg-gradient-to-br from-purple-100 via-pink-50 to-white min-h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <div className="flex items-center justify-between bg-white shadow p-4">
          <div className="flex flex-1 justify-center">
            <input
              type="text"
              placeholder="Search saved tests..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          <div className="flex items-center gap-3 ml-4">
            {/* 4. Use the username from the context */}
            <span className="text-gray-700 font-medium">
              Welcome, {user?.username || "User"}
            </span>
            <img
              // Use profile picture from context with a fallback
              src={user?.profilePictureUrl || "https://via.placeholder.com/40"}
              alt="Profile"
              className="w-10 h-10 rounded-full border border-gray-300"
            />
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row flex-1 p-4 lg:p-8 gap-8">
          <div className="lg:flex-shrink-0">
            <TestCard />
          </div>
          <div className="flex-1">
            <SavedTestsPage />
            <div className="mt-6">
              <ProctoringPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}