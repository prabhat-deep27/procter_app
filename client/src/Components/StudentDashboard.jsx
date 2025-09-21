import React, { useState } from 'react';
// Make sure this path is correct based on your file structure
import TestLogin from '../pages/TestLogin'; 

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
const FileTextIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><line x1="10" x2="8" y1="9" y2="9" /></svg>
);
const MenuIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
);
const XIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);


// --- Main Student Dashboard Component ---
const StudentDashboard = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [view, setView] = useState('dashboard'); // Can be 'dashboard' or 'testLogin'

    // Mock data for the list of completed tests
    const savedTests = [
        { id: 1, title: "Midterm Exam - Algebra I", code: "TEST-2023-001", date: "2023-05-23", score: "88%" },
        { id: 2, title: "Chapter 2 Quiz - Biology", code: "TEST-2023-002", date: "2023-06-14", score: "92%" },
        { id: 3, title: "Final Exam - Chemistry", code: "TEST-2023-004", date: "2023-08-10", score: "76%" },
    ];

    // Data for the sidebar navigation links
    const navItems = [
        { name: "Home", icon: HomeIcon },
        { name: "Profile", icon: UserCircleIcon },
        { name: "Subjects", icon: BookOpenIcon },
        { name: "Test Review", icon: FileTextIcon },
    ];

    // Reusable Sidebar component
    const Sidebar = () => (
        <div className="flex h-full flex-col bg-gradient-to-b from-purple-800 to-purple-900 text-white">
            <div className="flex h-20 items-center justify-between px-6">
                <h1 className="text-2xl font-bold tracking-wider">Dashboard</h1>
                <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-purple-200 hover:text-white">
                    <XIcon className="h-6 w-6" />
                </button>
            </div>
            <nav className="flex-1 space-y-2 px-4">
                {navItems.map((item) => (
                    <a
                        key={item.name}
                        href="#"
                        className="flex items-center gap-4 rounded-lg px-4 py-3 text-purple-200 transition-colors hover:bg-white/10 hover:text-white"
                    >
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.name}</span>
                    </a>
                ))}
            </nav>
        </div>
    );
    
    // Function to switch the view to the test login page
    const handleJoinTest = () => {
        setView('testLogin');
    };

    // Function to switch the view back to the main dashboard
    const handleBackToDashboard = () => {
        setView('dashboard');
    };

    return (
        <div className="flex min-h-screen w-full bg-gray-50 font-sans">
            {/* --- Static Sidebar for Desktop --- */}
            <aside className="hidden w-64 flex-shrink-0 lg:block">
                <Sidebar />
            </aside>

            {/* --- Mobile Sidebar (off-canvas) --- */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-40 flex lg:hidden">
                    {/* Overlay to close sidebar on click */}
                    <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/60" aria-hidden="true"></div>
                    {/* Sidebar content */}
                    <div className="relative flex w-64 max-w-xs flex-1">
                        <Sidebar />
                    </div>
                </div>
            )}

            {/* --- Main Content Area --- */}
            <div className="flex flex-1 flex-col">
                {/* --- Header --- */}
                <header className="flex h-20 items-center justify-between border-b bg-white px-4 sm:px-6 lg:px-8">
                    {/* Hamburger menu button for mobile */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-gray-600 hover:text-gray-900 lg:hidden"
                    >
                        <MenuIcon className="h-6 w-6" />
                        <span className="sr-only">Open sidebar</span>
                    </button>
                    {/* User welcome message and avatar */}
                    <div className="flex items-center gap-4">
                        <span className="text-lg font-medium text-gray-700">Welcome, Julia!</span>
                        <img
                            src="https://placehold.co/40x40/E2E8F0/4A5568?text=J"
                            alt="User avatar"
                            className="h-10 w-10 rounded-full"
                        />
                    </div>
                </header>

                {/* --- Page Content --- */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    {/* --- Conditional Rendering based on 'view' state --- */}
                    {view === 'dashboard' && (
                        <div className="mx-auto max-w-4xl">
                            <div className="grid grid-cols-1 gap-8">
                                
                                {/* --- Join New Test Card --- */}
                                <div className="rounded-xl border bg-white p-6 shadow-sm">
                                    <h2 className="mb-1 text-xl font-semibold text-gray-800">Join New Test</h2>
                                    <p className="mb-6 text-sm text-gray-500">Ready to start? Click the button to enter the test details.</p>
                                    <div className="space-y-4">
                                        <button 
                                            onClick={handleJoinTest}
                                            className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-3 text-lg font-semibold text-white shadow-md transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                                        >
                                            Join Test
                                        </button>
                                    </div>
                                </div>

                                {/* --- Completed Tests Section --- */}
                                <div className="rounded-xl border bg-white p-6 shadow-sm">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-800">Completed Tests</h2>
                                    <div className="space-y-4">
                                        {savedTests.map((test) => (
                                            <div key={test.id} className="flex flex-wrap items-center justify-between gap-4 rounded-lg border bg-gray-50 p-4">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{test.title}</h3>
                                                    <p className="text-sm text-gray-500">{test.code} | Completed on: {test.date}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-bold text-lg text-purple-700">{test.score}</span>
                                                    <button className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                                                        Review
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Show the TestLogin component when view is 'testLogin' */}
                    {view === 'testLogin' && (
                        <TestLogin onBack={handleBackToDashboard} />
                    )}
                </main>
            </div>
        </div>
    );
};

export default StudentDashboard;