import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:8080/api/auth";

function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const resetForm = () => {
    setUserName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setRole("");
    setError("");
    setSuccess("");
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (isLoginMode) {
      // ---- LOGIN ----
      try {
        const response = await axios.post(`${API_URL}/login`, {
          email,
          password,
        });

        // Destructure user data from the response
        const { role, token, username, email: userEmail, profilePictureUrl } = response.data;
        
        // --- THIS IS THE KEY CHANGE ---
        // Save the JWT to local storage and user data to context
        if (token) {
            localStorage.setItem("bearerToken", token);
            
            // Store user data in auth context
            login({
              username,
              email: userEmail,
              role,
              profilePictureUrl
            });
            
            setSuccess("Login successful!");
            console.log("Login successful with role:", role);
            console.log("Token stored in local storage.");
            console.log("User data stored in context:", { username, email: userEmail, role, profilePictureUrl });

            // Redirect user based on their role
            navigate(`/${role.toLowerCase()}`); 
        } else {
            throw new Error("Token not found in login response.");
        }

      } catch (err) {
        setError(err.response?.data?.error || "An error occurred during login.");
        console.error("Login Error:", err);
      }
    } else {
      // ---- REGISTER ----
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (!role) {
        setError("Please select a role.");
        return;
      }

      try {
        // send role in UPPERCASE to match backend
        const response = await axios.post(`${API_URL}/register`, {
          username,
          email,
          password,
          role: role.toUpperCase(),
        });

        setSuccess("Registration successful! Please login.");
        console.log("Registration Response:", response.data);
        setIsLoginMode(true);
        resetForm();
      } catch (err) {
        setError(err.response?.data?.error || "An error occurred during registration.");
        console.error("Registration Error:", err);
      }
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
      <div className="flex justify-center mb-4">
        <h2 className="text-3xl font-semibold text-center text-gray-800">
          {isLoginMode ? "Login" : "Sign Up"}
        </h2>
      </div>

      {/* Toggle Login / Signup */}
      <div className="relative flex h-12 mb-6 border border-gray-200 rounded-full overflow-hidden">
        <button
          type="button"
          className={`w-1/2 text-lg font-medium transition-colors duration-300 z-10 ${
            isLoginMode ? "text-white" : "text-gray-700"
          }`}
          onClick={() => {
            if (!isLoginMode) toggleMode();
          }}
        >
          Login
        </button>
        <button
          type="button"
          className={`w-1/2 text-lg font-medium transition-colors duration-300 z-10 ${
            !isLoginMode ? "text-white" : "text-gray-700"
          }`}
          onClick={() => {
            if (isLoginMode) toggleMode();
          }}
        >
          Signup
        </button>
        <div
          className={`absolute top-0 h-full w-1/2 rounded-full bg-gradient-to-r from-purple-400 to-pink-300 transition-all duration-300 ${
            isLoginMode ? "left-0" : "left-1/2"
          }`}
        ></div>
      </div>

      {/* FORM */}
      <form className="space-y-5" onSubmit={handleSubmit}>
        {!isLoginMode && (
          <input
            type="text"
            placeholder="UserName"
            value={username}
            onChange={(e) => setUserName(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400"
          />
        )}

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400"
        />

        {!isLoginMode && (
          <>
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400"
            />

            <select
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-500 bg-white"
            >
              <option value="" disabled>
                Select Role
              </option>
              <option value="TEACHER">Teacher</option>
              <option value="STUDENT">Student</option>
            </select>
          </>
        )}

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        {success && <p className="text-green-500 text-sm text-center">{success}</p>}

        {isLoginMode && (
          <div className="text-right">
            <a href="#" className="text-sm text-purple-600 hover:underline">
              Forgot password?
            </a>
          </div>
        )}

        <button
          type="submit"
          className="w-full p-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-full text-lg font-semibold hover:opacity-90 transition-opacity"
        >
          {isLoginMode ? "Login" : "Signup"}
        </button>

        <p className="text-center text-gray-600">
          {isLoginMode ? "Don't have an account?" : "Already have an account?"}{" "}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              toggleMode();
            }}
            className="font-medium text-purple-600 hover:underline"
          >
            {isLoginMode ? "Signup now" : "Login"}
          </a>
        </p>
      </form>
    </div>
  );
}

export default LoginForm;
