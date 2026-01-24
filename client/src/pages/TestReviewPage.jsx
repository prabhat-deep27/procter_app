import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../Components/ui/card';
import { Button } from '../Components/ui/button';
import { useAuth } from '../context/AuthContext';
import TestStatistics from '../Components/TestStatistics';
import StudentResultsTable from '../Components/StudentResultsTable';
import QuestionAnalysis from '../Components/QuestionAnalysis';
import AIReportPanel from '../Components/AIReportPanel';

const TestReviewPage = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [testReview, setTestReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchTestReview();
  }, [testId]);

  const fetchTestReview = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/analytics/test/${testId}/review?includeAIReport=true`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch test review');
      }

      const data = await response.json();
      setTestReview(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportResults = () => {
    // Export functionality - could generate CSV or PDF
    console.log('Exporting results...');
    // Implementation would depend on requirements
  };

  const handleSendFeedback = () => {
    // Navigate to feedback page or open modal
    console.log('Sending feedback...');
    // Implementation would depend on requirements
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/teacher-dashboard')}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  if (!testReview) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 max-w-md">
          <h2 className="text-xl font-bold mb-4">No Data Available</h2>
          <p className="text-gray-600 mb-4">No test review data found for this test.</p>
          <Button onClick={() => navigate('/teacher-dashboard')}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'students', label: 'Student Results', icon: '👥' },
    { id: 'questions', label: 'Question Analysis', icon: '❓' },
    { id: 'ai-report', label: 'AI Report', icon: '🤖' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-pink-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/teacher-dashboard')}
                className="mr-4"
              >
                ← Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Test Review: {testReview.testTitle}
                </h1>
                <p className="text-sm text-gray-500">
                  Subject: {testReview.subject} • {testReview.statistics?.totalStudents || 0} students
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleExportResults}
                className="flex items-center space-x-2"
              >
                <span>📄</span>
                <span>Export</span>
              </Button>
              <Button
                onClick={handleSendFeedback}
                className="flex items-center space-x-2 bg-cyan-600 hover:bg-cyan-700"
              >
                <span>💬</span>
                <span>Send Feedback</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-cyan-500 text-cyan-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <TestStatistics statistics={testReview.statistics} />
        )}
        
        {activeTab === 'students' && (
          <StudentResultsTable studentResults={testReview.studentResults} />
        )}
        
        {activeTab === 'questions' && (
          <QuestionAnalysis questionAnalysis={testReview.questionAnalysis} />
        )}
        
        {activeTab === 'ai-report' && (
          <AIReportPanel aiReport={testReview.aiReport} />
        )}
      </div>
    </div>
  );
};

export default TestReviewPage;
