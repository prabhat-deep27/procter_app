import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import TestLogin from '../pages/TestLogin';
import StudentProfile from './StudentProfile';
import StudentCourses from './StudentCourses';

// --- Icon Components ---
const HomeIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
);
const UserCircleIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" /></svg>
);
const BookOpenIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
);
const MenuIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
);
const XIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);
const LogOutIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16,17 21,12 16,7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
);
const AnalyticsIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 3v18h18" /><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" /></svg>
);

// --- Main Student Dashboard Component ---
const StudentDashboard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [view, setView] = useState('dashboard');
  const [completedTests, setCompletedTests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, logout, token } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [toast, setToast] = useState(null);

  // Fetch completed tests
  useEffect(() => {
    const fetchCompletedTests = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch('/api/tests/completed', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Failed to fetch completed tests');

        const tests = await response.json();
        setCompletedTests(tests);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompletedTests();
  }, [token]);

  // Toast on returning from test page
  useEffect(() => {
    if (location.state?.testSubmitted) {
      setToast({
        message: `Test submitted successfully. Score: ${location.state.score}% (${location.state.correct}/${location.state.total}).`,
      });
      (async () => {
        try {
          setIsLoading(true);
          const response = await fetch('/api/tests/completed', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          if (response.ok) {
            const tests = await response.json();
            setCompletedTests(tests);
          }
        } catch (_) { }
        finally { setIsLoading(false); }
      })();
      window.history.replaceState({}, document.title, window.location.pathname);
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [location.state, token]);

  const navItems = [
    { name: "Home", icon: HomeIcon },
    { name: "Profile", icon: UserCircleIcon },
    { name: "My Courses", icon: BookOpenIcon },
    // "Results" item has been removed
    { name: "Analytics", icon: AnalyticsIcon },
  ];

  const Sidebar = () => (
    <div className="flex h-full flex-col bg-gradient-to-b from-cyan-800 to-cyan-900 dark:from-gray-800 dark:to-gray-900 text-white">
      <div className="flex h-20 items-center justify-between px-6">
        <h1 className="text-2xl font-bold tracking-wider dark:text-white">Dashboard</h1>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-cyan-200 hover:text-white">
          <XIcon className="h-6 w-6" />
        </button>
      </div>
      <nav className="flex-1 space-y-2 px-4">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => {
              if (item.name === 'Home') setView('dashboard');
              else if (item.name === 'Profile') setView('profile');
              else if (item.name === 'My Courses') setView('courses');
              // "Results" logic has been removed
              else if (item.name === 'Analytics') navigate('/student/analytics');
            }}
            className={`flex items-center gap-4 rounded-lg px-4 py-3 text-cyan-200 transition-colors hover:bg-white/10 hover:text-white w-full text-left ${
              (item.name === 'Home' && view === 'dashboard') ||
              (item.name === 'Profile' && view === 'profile') ||
              (item.name === 'My Courses' && view === 'courses')
                ? 'bg-white/20 text-white'
                : ''
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.name}</span>
          </button>
        ))}
      </nav>
    </div>
  );

  // ✅ Updated Logout with confirmation
  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      logout();
      navigate("/");
    }
  };

  const handleJoinTest = () => setView('testLogin');
  const handleBackToDashboard = () => setView('dashboard');

  return (
    <div className="flex min-h-screen w-full bg-gray-50 dark:bg-gray-900 font-sans">
      {/* --- Static Sidebar for Desktop --- */}
      <aside className="hidden w-64 flex-shrink-0 lg:block">
        <Sidebar />
      </aside>

      {/* --- Mobile Sidebar (off-canvas) --- */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/60" aria-hidden="true"></div>
          <div className="relative flex w-64 max-w-xs flex-1">
            <Sidebar />
          </div>
        </div>
      )}

      {/* --- Main Content --- */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-20 items-center justify-between border-b bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white lg:hidden"
            >
              <MenuIcon className="h-6 w-6" />
              <span className="sr-only">Open sidebar</span>
            </button>
            <div className="flex items-center gap-3">
              <span className="text-lg font-medium text-gray-700 dark:text-gray-200">Welcome, {user?.username || "Student"}!</span>
              <img
                src={user?.profilePictureUrl || "https://placehold.co/40x40/E2E8F0/4A5568?text=S"}
                alt="User avatar"
                className="h-10 w-10 rounded-full border-2 border-gray-300 dark:border-gray-600"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg dark:bg-gray-700 bg-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors font-medium"
            >
              <LogOutIcon className="h-4 w-4" />
              Logout
            </button>
          </div>
        </header>

        {/* --- Page Content --- */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900">
          {toast && (
            <div className="mb-4 rounded-md border border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/30 px-4 py-3 text-sm text-green-800 dark:text-green-300">
              {toast.message}
            </div>
          )}

          {view === 'dashboard' && (
            <div className="mx-auto max-w-4xl">
              <div className="grid grid-cols-1 gap-8">
                {/* --- Join New Test --- */}
                <div className="rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                  <h2 className="mb-1 text-xl font-semibold text-gray-800 dark:text-white">Join New Test</h2>
                  <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">Ready to start? Click below to enter test details.</p>
                  <button
                    onClick={handleJoinTest}
                    className="w-full rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-500 px-6 py-3 text-lg font-semibold text-white shadow-md transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
                  >
                    Join Test
                  </button>
                </div>

                {/* --- Completed Tests --- */}
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                  <h2 className="mb-4 text-xl font-semibold text-gray-800">Completed Tests</h2>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8 text-gray-500">
                      Loading completed tests...
                    </div>
                  ) : error ? (
                    <div className="flex items-center justify-center py-8 text-red-500">
                      Error loading tests: {error}
                    </div>
                  ) : completedTests.length === 0 ? (
                    <div className="flex items-center justify-center py-8 text-gray-500">
                      No completed tests yet.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {completedTests.map((test) => (
                        <div key={test.id} className="flex flex-wrap items-center justify-between gap-4 rounded-lg border bg-gray-50 p-4">
                          <div>
                            <h3 className="font-semibold text-gray-900">{test.testTitle}</h3>
                            <p className="text-sm text-gray-500">
                              {test.joinCode} | {test.subject} | Completed on: {new Date(test.completedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-lg text-cyan-700">{test.score}%</span>
                            <button 
                              onClick={() => navigate(`/student/test/${test.id}/review`)}
                              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                            >
                              Review
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {view === 'profile' && <StudentProfile onBack={() => setView('dashboard')} />}
          {view === 'courses' && <StudentCourses onBack={() => setView('dashboard')} />}
          {view === 'testLogin' && <TestLogin onBack={handleBackToDashboard} />}
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
