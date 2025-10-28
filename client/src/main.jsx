import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

import App from "./App.jsx";
import TeacherDashboard from "./Components/TeacherDashboard.jsx";
import StudentDashboard from "./Components/StudentDashboard.jsx";
import CreateTestPage from "./pages/CreateTestPage.jsx";
import Profile from "./pages/Profile.jsx";
import Subjects from "./pages/Subjects.jsx";
import SubjectDetail from "./pages/SubjectDetail.jsx";
import SavedTestsPage from "./pages/SavedTestsPage.jsx";
import TestAttemptPage from "./pages/TestAttemptPage.jsx";
import TestReviewPage from "./pages/TestReviewPage.jsx";
import TeacherTestReviewPage from "./pages/TeacherTestReviewPage.jsx";
import TeacherHomePage from "./pages/TeacherHomePage.jsx";
import StudentAnalyticsPage from "./pages/StudentAnalyticsPage.jsx";
import StudentTestReviewPage from "./pages/StudentTestReviewPage.jsx";


createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* Wrap the entire app in AuthProvider and ThemeProvider */}
    <ThemeProvider>
      <AuthProvider>
        <Router>
        <Routes>
          {/* Home */}
          <Route path="/" element={<App />} />

          {/* Teacher Routes */}
          <Route path="/teacher" element={<TeacherDashboard />}>
            <Route index element={<TeacherHomePage />} />
            <Route path="create-test" element={<CreateTestPage />} />
            <Route path="saved-tests" element={<SavedTestsPage />} />
            <Route path="review" element={<TeacherTestReviewPage />} />
            <Route path="test-review/:testId" element={<TestReviewPage />} />
            <Route path="profile" element={<Profile />} />
            <Route path="subjects" element={<Subjects />} />
            <Route path="subjects/:subjectName" element={<SubjectDetail />} />
          </Route>

          {/* Student Routes */}
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/test/:testId" element={<TestAttemptPage />} />
          <Route path="/student/test/:testId/review" element={<StudentTestReviewPage />} />
          <Route path="/student/analytics" element={<StudentAnalyticsPage />} />

          {/* Optional: 404 Page */}
          {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);