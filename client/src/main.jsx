import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; // Import AuthProvider

import App from "./App.jsx";
import TeacherDashboard from "./Components/TeacherDashboard.jsx";
import StudentDashboard from "./Components/StudentDashboard.jsx";
import CreateTestPage from "./pages/CreateTestPage.jsx";
import Profile from "./pages/Profile.jsx";
import Subjects from "./pages/Subjects.jsx";
import SubjectDetail from "./pages/SubjectDetail.jsx";
import SavedTestsPage from "./pages/SavedTestsPage.jsx";
import TestAttemptPage from "./pages/TestAttemptPage.jsx";


createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* Wrap the entire app in AuthProvider */}
    <AuthProvider>
      <Router>
        <Routes>
          {/* Home */}
          <Route path="/" element={<App />} />

          {/* Teacher Routes */}
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/teacher/create-test" element={<CreateTestPage />} />
          <Route path="/teacher/saved-tests" element={<SavedTestsPage />} />
          {/* Corrected Profile Route */}
          <Route path="/teacher/profile" element={<Profile />} />
          <Route path="/teacher/subjects" element={<Subjects />} />
          <Route path="/teacher/subjects/:subjectName" element={<SubjectDetail />} />

          {/* Student Routes */}
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/test/:testId" element={<TestAttemptPage />} />

          {/* Optional: 404 Page */}
          {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
      </Router>
    </AuthProvider>
  </StrictMode>
);