import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../Components/ui/card';
import { Button } from '../Components/ui/button';

const TeacherTestReviewPage = () => {
  const { user, token } = useAuth();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [testAnalytics, setTestAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tests', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tests');
      }

      const data = await response.json();
      setTests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTestAnalytics = async (testId) => {
    try {
      const response = await fetch(`/api/analytics/test/${testId}/review?includeAIReport=true`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch test analytics');
      }

      const data = await response.json();
      setTestAnalytics(data);
    } catch (err) {
      console.error('Error fetching test analytics:', err);
    }
  };

  const handleTestSelect = (test) => {
    setSelectedTest(test);
    setActiveTab('overview');
    fetchTestAnalytics(test.id);
  };

  const StatCard = ({ title, value, subtitle, color = "blue", icon }) => {
    const colorClasses = {
      blue: "bg-blue-50 border-blue-200 text-blue-700",
      green: "bg-green-50 border-green-200 text-green-700",
      purple: "bg-purple-50 border-purple-200 text-purple-700",
      orange: "bg-orange-50 border-orange-200 text-orange-700",
      red: "bg-red-50 border-red-200 text-red-700",
    };

    return (
      <Card className={`p-6 border-l-4 ${colorClasses[color]}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg">{icon}</span>
              <p className="text-sm font-medium opacity-75">{title}</p>
            </div>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="text-xs opacity-75 mt-1">{subtitle}</p>}
          </div>
        </div>
      </Card>
    );
  };

  const TestOverview = ({ test, analytics }) => {
    if (!analytics) return <div>Loading analytics...</div>;

    return (
      <div className="space-y-6">
        {/* Test Information */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Test Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Test Title</label>
              <p className="text-lg font-semibold">{test.title}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Subject</label>
              <p className="text-lg font-semibold">{test.subject}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Duration</label>
              <p className="text-lg font-semibold">{test.durationInMinutes} minutes</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Questions</label>
              <p className="text-lg font-semibold">{test.questions?.length || 0}</p>
            </div>
          </div>
        </Card>

        {/* Key Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Students"
            value={analytics.statistics?.totalStudents || 0}
            subtitle="Completed test"
            color="blue"
            icon="👥"
          />
          <StatCard
            title="Average Score"
            value={`${analytics.statistics?.averageScore?.toFixed(1) || 0}%`}
            subtitle="Class average"
            color="green"
            icon="📊"
          />
          <StatCard
            title="Pass Rate"
            value={`${analytics.statistics?.passRate?.toFixed(1) || 0}%`}
            subtitle="Students passed"
            color="purple"
            icon="✅"
          />
          <StatCard
            title="Highest Score"
            value={`${analytics.statistics?.highestScore || 0}%`}
            subtitle="Top performer"
            color="orange"
            icon="🏆"
          />
        </div>

        {/* Grade Distribution */}
        {analytics.statistics?.gradeDistribution && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <span className="mr-2">📊</span>
              Grade Distribution
            </h3>
            <div className="space-y-3">
              {Object.entries(analytics.statistics.gradeDistribution).map(([grade, count]) => {
                const percentage = analytics.statistics.totalStudents > 0 ? 
                  (count / analytics.statistics.totalStudents) * 100 : 0;
                const colors = {
                  "A (90-100)": "bg-green-500",
                  "B (80-89)": "bg-blue-500",
                  "C (70-79)": "bg-yellow-500",
                  "D (60-69)": "bg-orange-500",
                  "F (0-59)": "bg-red-500",
                };
                return (
                  <div key={grade} className="flex items-center space-x-4">
                    <div className="w-20 text-sm font-medium">{grade}</div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${colors[grade] || "bg-gray-500"}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-12 text-sm text-right">{count}</div>
                    <div className="w-12 text-sm text-right text-gray-500">
                      {percentage.toFixed(1)}%
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    );
  };

  const StudentResults = ({ analytics }) => {
    if (!analytics?.studentResults) return <div>No student results available</div>;

    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <span className="mr-2">👥</span>
          Student Results
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Student Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Completed
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.studentResults.map((result, index) => (
                <tr key={result.studentId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-purple-700">
                          {result.studentName?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {result.studentName || 'Unknown Student'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {result.score}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      result.grade === 'A' ? 'bg-green-100 text-green-800' :
                      result.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                      result.grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                      result.grade === 'D' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {result.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      result.performanceLevel === 'Excellent' ? 'bg-green-100 text-green-800' :
                      result.performanceLevel === 'Good' ? 'bg-blue-100 text-blue-800' :
                      result.performanceLevel === 'Average' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {result.performanceLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {result.completedAt ? new Date(result.completedAt).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    );
  };

  const AIInsights = ({ analytics }) => {
    if (!analytics?.aiReport) return <div>No AI insights available</div>;

    return (
      <div className="space-y-6">
        <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="mr-2">🤖</span>
            AI-Generated Test Analysis
          </h3>
          <p className="text-gray-700 mb-4">{analytics.aiReport.summary}</p>
        </Card>

        {analytics.aiReport.insights && analytics.aiReport.insights.length > 0 && (
          <Card className="p-6">
            <h4 className="font-semibold text-gray-900 mb-3">Key Insights</h4>
            <ul className="space-y-2">
              {analytics.aiReport.insights.map((insight, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span className="text-gray-700">{insight}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {analytics.aiReport.recommendations && analytics.aiReport.recommendations.length > 0 && (
          <Card className="p-6">
            <h4 className="font-semibold text-gray-900 mb-3">Recommendations</h4>
            <ul className="space-y-2">
              {analytics.aiReport.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span className="text-gray-700">{recommendation}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {analytics.aiReport.areasOfConcern && analytics.aiReport.areasOfConcern.length > 0 && (
          <Card className="p-6 bg-red-50 border-red-200">
            <h4 className="font-semibold text-red-900 mb-3">Areas of Concern</h4>
            <ul className="space-y-2">
              {analytics.aiReport.areasOfConcern.map((concern, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-red-600 mt-1">⚠️</span>
                  <span className="text-red-700">{concern}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Test Review Dashboard
          </h1>
          <p className="text-gray-600">
            Comprehensive analytics and insights for all your tests
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Test Selection Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Select Test</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {tests.map((test) => (
                  <button
                    key={test.id}
                    onClick={() => handleTestSelect(test)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedTest?.id === test.id
                        ? 'bg-purple-100 border-purple-300 text-purple-800'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">{test.title}</div>
                    <div className="text-sm text-gray-600">{test.subject}</div>
                    <div className="text-xs text-gray-500">
                      {test.questions?.length || 0} questions • {test.durationInMinutes} min
                    </div>
                  </button>
                ))}
                {tests.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No tests available</p>
                )}
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedTest ? (
              <div className="space-y-6">
                {/* Test Header */}
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedTest.title}</h2>
                      <p className="text-gray-600">{selectedTest.subject}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Join Code</div>
                      <div className="font-mono text-lg font-bold text-purple-600">
                        {selectedTest.joinCode}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Navigation Tabs */}
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                  {[
                    { id: 'overview', label: 'Overview', icon: '📊' },
                    { id: 'students', label: 'Students', icon: '👥' },
                    { id: 'ai-insights', label: 'AI Insights', icon: '🤖' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors ${
                        activeTab === tab.id
                          ? 'bg-white text-purple-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                  <TestOverview test={selectedTest} analytics={testAnalytics} />
                )}
                {activeTab === 'students' && (
                  <StudentResults analytics={testAnalytics} />
                )}
                {activeTab === 'ai-insights' && (
                  <AIInsights analytics={testAnalytics} />
                )}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Select a Test to Review
                </h3>
                <p className="text-gray-600">
                  Choose a test from the sidebar to view detailed analytics and insights.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherTestReviewPage;
