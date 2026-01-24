import React, { useState } from 'react';
import { createStompClient } from '../lib/stompClient';
import { ProctoringSession } from '../lib/proctoring';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// A simple back arrow icon
const ArrowLeftIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
    </svg>
);

const TestLogin = ({ onBack }) => {
    const navigate = useNavigate();
    const [joinCode, setJoinCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { token } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!joinCode) {
            setError("Enter join code");
            return;
        }
        try {
            setLoading(true);
            // Enforce single-display before making server call
            try {
                const isSingle = await ProctoringSession.verifySingleDisplayOrThrow();
                if (!isSingle) {
                    setError('Multiple displays detected. Disconnect extra monitors and try again.');
                    setLoading(false);
                    return;
                }
            } catch (checkErr) {
                setError('Unable to verify single display on this browser. Please disconnect all external displays and use a supported browser (Chrome 116+).');
                setLoading(false);
                return;
            }
            const res = await fetch(`/api/tests/join/${encodeURIComponent(joinCode)}`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
            });
            const raw = await res.text();
            let data;
            try { data = raw ? JSON.parse(raw) : {}; } catch { data = { error: raw || 'Unexpected response' }; }
            if (!res.ok) throw new Error(data?.error || 'Join failed');

            const testId = data.testId;
            // Redirect to dedicated attempt page where proctoring starts
            navigate(`/student/test/${encodeURIComponent(testId)}`);
        } catch (err) {
            setError(err.message || 'Failed to join');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-2xl">
            <div className="relative rounded-xl border bg-white p-6 shadow-sm sm:p-8">
                {/* Back Button */}
                <button 
                    onClick={onBack} 
                    className="absolute top-4 left-4 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-cyan-700"
                >
                    <ArrowLeftIcon className="h-4 w-4" />
                    Back to Dashboard
                </button>

                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 sm:text-3xl">Join Test</h2>
                    <p className="mt-2 text-sm text-gray-500">Enter the join code provided by your teacher</p>
                </div>

                <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="joinCode" className="mb-1 block text-sm font-medium text-gray-700">
                            Join Code
                        </label>
                        <input
                            type="text"
                            id="joinCode"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value)}
                            placeholder="ABC123"
                            className="w-full rounded-md border-gray-300 px-4 py-2 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
                        />
                    </div>

                    {error && <div className="text-red-600 text-sm">{error}</div>}

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-gradient-to-r from-cyan-600 to-pink-500 px-6 py-3 text-lg font-semibold text-white shadow-md transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                            {loading ? 'Joining...' : 'Join & Start Monitoring'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TestLogin;
