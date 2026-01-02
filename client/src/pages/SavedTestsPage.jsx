import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SavedTestsPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTests = async () => {
      console.log('SavedTestsPage: Starting to fetch tests...');
      console.log('SavedTestsPage: Token available:', !!token);
      console.log('SavedTestsPage: Token value:', token);
      
      if (!token) {
        console.log('SavedTestsPage: No token found, setting error');
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('SavedTestsPage: Making API request to /api/tests');
        const response = await fetch('/api/tests', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('SavedTestsPage: Response status:', response.status);
        console.log('SavedTestsPage: Response ok:', response.ok);

        if (!response.ok) {
          const errorText = await response.text();
          console.log('SavedTestsPage: Error response:', errorText);
          throw new Error(`Failed to fetch tests. Status: ${response.status} - ${errorText}`);
        }

        const testsData = await response.json();
        console.log('SavedTestsPage: Tests data received:', testsData);
        console.log('SavedTestsPage: Number of tests:', testsData.length);
        setTests(testsData);
      } catch (err) {
        console.error('SavedTestsPage: Error fetching tests:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, [token]);

  console.log('SavedTestsPage: Current state - loading:', loading, 'error:', error, 'tests:', tests);

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto my-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Saved Tests</h1>
          <Link
            to="/teacher/create-test"
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition"
          >
            + Create New Test
          </Link>
        </div>
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
          <p className="mt-2 text-gray-500">Loading tests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto my-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Saved Tests</h1>
          <Link
            to="/teacher/create-test"
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition"
          >
            + Create New Test
          </Link>
        </div>
        <div className="text-center py-10 px-6 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-600 font-semibold">Error loading tests</p>
          <p className="text-red-500 text-sm mt-1">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto my-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Saved Tests</h1>
        <Link
          to="/teacher/create-test"
          className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition"
        >
          + Create New Test
        </Link>
      </div>

      {tests.length === 0 ? (
        <div className="text-center py-10 px-6 bg-gray-50 rounded-lg">
          <p className="text-gray-500">You haven't created any tests yet.</p>
          <Link
            to="/teacher/create-test"
            className="inline-block mt-4 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition"
          >
            Create Your First Test
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {tests.map((test) => (
            <div key={test.id} className="p-4 bg-white rounded-lg shadow-md border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-semibold text-cyan-700">{test.title}</h2>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {test.joinCode}
                </span>
              </div>
              
              {test.subject && (
                <p className="text-sm text-gray-500 mb-3">{test.subject}</p>
              )}
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                <div>
                  <strong className="text-gray-800">Duration:</strong>
                  <p>{test.durationInMinutes} minutes</p>
                </div>
                <div>
                  <strong className="text-gray-800">Questions:</strong>
                  <p>{test.questions ? test.questions.length : 0}</p>
                </div>
                <div>
                  <strong className="text-gray-800">Participants:</strong>
                  <p>{test.participantIds ? test.participantIds.size : 0}</p>
                </div>
                <div>
                  <strong className="text-gray-800">Scheduled:</strong>
                  <p>{new Date(test.scheduledAt).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex gap-2 flex-wrap">
                  <button 
                    onClick={() => navigate(`/teacher/test-review/${test.id}`)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200 transition flex items-center space-x-1"
                  >
                    <span>📊</span>
                    <span>Review Results</span>
                  </button>
                  <button className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200 transition flex items-center space-x-1">
                    <span>🔗</span>
                    <span>Share Join Code</span>
                  </button>
                  <button className="px-3 py-1 bg-cyan-100 text-cyan-700 text-xs rounded hover:bg-cyan-200 transition flex items-center space-x-1">
                    <span>✏️</span>
                    <span>Edit Test</span>
                  </button>
                  <button className="px-3 py-1 bg-orange-100 text-orange-700 text-xs rounded hover:bg-orange-200 transition flex items-center space-x-1">
                    <span>👥</span>
                    <span>View Participants</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}