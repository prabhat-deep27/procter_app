import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Calendar, Clock, Users, BookOpen, Plus } from 'lucide-react';

export default function SubjectDetail() {
  const { subjectName } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Decode the subject name from URL
  const decodedSubjectName = decodeURIComponent(subjectName);

  useEffect(() => {
    fetchSubjectTests();
  }, [subjectName, token]);

  const fetchSubjectTests = async () => {
    if (!token) {
      setError('No authentication token found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('SubjectDetail: Fetching tests for subject:', decodedSubjectName);
      
      const response = await fetch(`/api/tests/subject/${encodeURIComponent(decodedSubjectName)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log('SubjectDetail: Error response:', errorText);
        throw new Error(`Failed to fetch tests. Status: ${response.status} - ${errorText}`);
      }

      const testsData = await response.json();
      console.log('SubjectDetail: Tests data received:', testsData);
      setTests(testsData);
    } catch (err) {
      console.error('SubjectDetail: Error fetching subject tests:', err);
      setError('Failed to load tests for this subject');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const handleCreateTest = () => {
    navigate('/teacher/create-test');
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
            <span className="ml-3 text-lg text-gray-600">Loading tests...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <p className="text-red-600 text-lg mb-4">{error}</p>
              <button 
                onClick={fetchSubjectTests}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/teacher/subjects')}
            className="flex items-center text-cyan-600 hover:text-cyan-700 mb-4 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Subjects
          </button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-800">{decodedSubjectName}</h1>
              <p className="mt-2 text-lg text-gray-500">
                {tests.length} {tests.length === 1 ? 'test' : 'tests'} found
              </p>
            </div>
            
            {user?.role === 'TEACHER' && (
              <button
                onClick={handleCreateTest}
                className="flex items-center px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
              >
                <Plus size={20} className="mr-2" />
                Create New Test
              </button>
            )}
          </div>
        </div>

        {/* Tests Grid */}
        {tests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => (
              <div key={test.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 line-clamp-2">{test.title}</h3>
                  <span className="text-xs bg-cyan-100 text-cyan-800 px-2 py-1 rounded-full">
                    {test.questions?.length || 0} questions
                  </span>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-gray-600">
                    <Calendar size={16} className="mr-2" />
                    <span className="text-sm">{formatDate(test.scheduledAt)}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Clock size={16} className="mr-2" />
                    <span className="text-sm">{formatDuration(test.durationInMinutes)}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Users size={16} className="mr-2" />
                    <span className="text-sm">{test.participantIds?.length || 0} participants</span>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Join Code:</span>
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{test.joinCode}</span>
                  </div>
                  
                  {user?.role === 'TEACHER' && test.createdByTeacherId === user.id && (
                    <div className="mt-3">
                      <button className="w-full text-sm bg-cyan-600 text-white py-2 px-4 rounded-lg hover:bg-cyan-700 transition-colors">
                        Manage Test
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No tests found</h3>
            <p className="text-gray-500 mb-6">
              There are no tests available for {decodedSubjectName} yet.
            </p>
            {user?.role === 'TEACHER' && (
              <button
                onClick={handleCreateTest}
                className="flex items-center mx-auto px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
              >
                <Plus size={20} className="mr-2" />
                Create First Test
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
