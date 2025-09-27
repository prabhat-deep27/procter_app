import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../Components/ui/card';
import { Button } from '../Components/ui/button';

const StudentAnalyticsPage = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');

  useEffect(() => {
    fetchAnalytics();
  }, [selectedSubject, selectedTimeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (selectedSubject) params.append('subject', selectedSubject);
      if (selectedTimeRange) params.append('timeRange', selectedTimeRange);

      const response = await fetch(`/api/analytics/my-analytics?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, color = "blue", icon }) => {
    const colorClasses = {
      blue: "bg-blue-50 border-blue-200 text-blue-700",
      green: "bg-green-50 border-green-200 text-green-700",
      purple: "bg-purple-50 border-purple-200 text-purple-700",
      orange: "bg-orange-50 border-orange-200 text-orange-700",
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

  const PerformanceTrend = ({ trend }) => {
    if (!trend) return null;

    const getTrendColor = (trendType) => {
      switch (trendType) {
        case 'Improving': return 'text-green-600';
        case 'Declining': return 'text-red-600';
        default: return 'text-blue-600';
      }
    };

    const getTrendIcon = (trendType) => {
      switch (trendType) {
        case 'Improving': return '📈';
        case 'Declining': return '📉';
        default: return '➡️';
      }
    };

    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <span className="mr-2">📊</span>
          Performance Trend
        </h3>
        <div className="flex items-center space-x-4 mb-4">
          <div className={`text-2xl font-bold ${getTrendColor(trend.trend)} flex items-center`}>
            <span className="mr-2">{getTrendIcon(trend.trend)}</span>
            {trend.trend}
          </div>
          <div className="text-sm text-gray-600">
            {trend.trendPercentage.toFixed(1)}% change
          </div>
        </div>
        {trend.scoresOverTime && trend.scoresOverTime.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">Recent Scores:</h4>
            <div className="flex space-x-2 overflow-x-auto">
              {trend.scoresOverTime.slice(-5).map((score, index) => (
                <div key={index} className="flex-shrink-0 text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-purple-700">{score}%</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {trend.timeLabels && trend.timeLabels[index] ? 
                      trend.timeLabels[index].substring(5) : `${index + 1}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    );
  };

  const SubjectPerformance = ({ subjectAverages }) => {
    if (!subjectAverages || Object.keys(subjectAverages).length === 0) {
      return (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Subject Performance</h3>
          <p className="text-gray-500">No subject data available</p>
        </Card>
      );
    }

    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <span className="mr-2">📚</span>
          Subject Performance
        </h3>
        <div className="space-y-4">
          {Object.entries(subjectAverages).map(([subject, average]) => (
            <div key={subject} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="font-medium">{subject}</div>
              <div className="flex items-center space-x-3">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      average >= 85 ? 'bg-green-500' :
                      average >= 70 ? 'bg-blue-500' :
                      average >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${average}%` }}
                  ></div>
                </div>
                <span className="font-semibold w-12 text-right">{average.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  const StrengthsWeaknesses = ({ strengthsWeaknesses }) => {
    if (!strengthsWeaknesses || strengthsWeaknesses.length === 0) {
      return null;
    }

    const strengths = strengthsWeaknesses.filter(item => item.type === 'Strength');
    const weaknesses = strengthsWeaknesses.filter(item => item.type === 'Weakness');

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-green-50 border-green-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center text-green-700">
            <span className="mr-2">💪</span>
            Strengths
          </h3>
          <div className="space-y-3">
            {strengths.map((strength, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">✓</span>
                </div>
                <div>
                  <div className="font-medium text-green-800">{strength.subject}</div>
                  <div className="text-sm text-green-600">{strength.description}</div>
                </div>
              </div>
            ))}
            {strengths.length === 0 && (
              <p className="text-green-600">No specific strengths identified</p>
            )}
          </div>
        </Card>

        <Card className="p-6 bg-red-50 border-red-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center text-red-700">
            <span className="mr-2">⚠️</span>
            Areas for Improvement
          </h3>
          <div className="space-y-3">
            {weaknesses.map((weakness, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-bold">!</span>
                </div>
                <div>
                  <div className="font-medium text-red-800">{weakness.subject}</div>
                  <div className="text-sm text-red-600">{weakness.description}</div>
                </div>
              </div>
            ))}
            {weaknesses.length === 0 && (
              <p className="text-red-600">No specific weaknesses identified</p>
            )}
          </div>
        </Card>
      </div>
    );
  };

  const AIInsights = ({ insights }) => {
    if (!insights) return null;

    return (
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <span className="mr-2">🤖</span>
          AI Insights & Recommendations
        </h3>
        
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-medium text-gray-900 mb-2">Overall Summary</h4>
            <p className="text-gray-700 text-sm">{insights.overallSummary}</p>
          </div>

          {insights.recommendations && insights.recommendations.length > 0 && (
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
              <ul className="space-y-2">
                {insights.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm">
                    <span className="text-purple-600 mt-1">•</span>
                    <span className="text-gray-700">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {insights.concerns && insights.concerns.length > 0 && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h4 className="font-medium text-red-900 mb-2">Areas of Concern</h4>
              <ul className="space-y-2">
                {insights.concerns.map((concern, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm">
                    <span className="text-red-600 mt-1">⚠️</span>
                    <span className="text-red-700">{concern}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-medium text-gray-900 mb-2">Predicted Performance</h4>
              <p className="text-gray-700 text-sm">{insights.predictedPerformance}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-medium text-gray-900 mb-2">Learning Style</h4>
              <p className="text-gray-700 text-sm">{insights.learningStyle}</p>
            </div>
          </div>
        </div>
      </Card>
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
            My Academic Analytics
          </h1>
          <p className="text-gray-600">
            Comprehensive analysis of your test performance and learning progress
          </p>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject:
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Subjects</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Science">Science</option>
                <option value="English">English</option>
                <option value="History">History</option>
                <option value="Computer Science">Computer Science</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Range:
              </label>
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All Time</option>
                <option value="semester">This Semester</option>
                <option value="month">Last Month</option>
                <option value="week">Last Week</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={fetchAnalytics} className="bg-purple-600 hover:bg-purple-700">
                Refresh Data
              </Button>
            </div>
          </div>
        </Card>

        {analytics ? (
          <div className="space-y-8">
            {/* Key Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Overall Average"
                value={`${analytics.overallAverage?.toFixed(1) || 0}%`}
                subtitle="Across all subjects"
                color="blue"
                icon="📊"
              />
              <StatCard
                title="Total Tests"
                value={analytics.recentTests?.length || 0}
                subtitle="Completed recently"
                color="green"
                icon="📝"
              />
              <StatCard
                title="Performance Trend"
                value={analytics.performanceTrend?.trend || 'Stable'}
                subtitle={`${analytics.performanceTrend?.trendPercentage?.toFixed(1) || 0}% change`}
                color="purple"
                icon="📈"
              />
              <StatCard
                title="Learning Style"
                value={analytics.aiInsights?.learningStyle?.split(' ')[0] || 'Balanced'}
                subtitle="Identified by AI"
                color="orange"
                icon="🧠"
              />
            </div>

            {/* Performance Trend */}
            <PerformanceTrend trend={analytics.performanceTrend} />

            {/* Subject Performance */}
            <SubjectPerformance subjectAverages={analytics.subjectAverages} />

            {/* Strengths and Weaknesses */}
            <StrengthsWeaknesses strengthsWeaknesses={analytics.strengthsWeaknesses} />

            {/* AI Insights */}
            <AIInsights insights={analytics.aiInsights} />

            {/* Recent Tests */}
            {analytics.recentTests && analytics.recentTests.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <span className="mr-2">📋</span>
                  Recent Test Performance
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Test
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Subject
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Score
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Performance
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {analytics.recentTests.map((test, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {test.testTitle}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {test.subject}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {test.score}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              test.performanceLevel === 'Excellent' ? 'bg-green-100 text-green-800' :
                              test.performanceLevel === 'Good' ? 'bg-blue-100 text-blue-800' :
                              test.performanceLevel === 'Average' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {test.performanceLevel}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {test.completedAt ? new Date(test.completedAt).toLocaleDateString() : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <h2 className="text-xl font-bold text-gray-600 mb-4">No Analytics Data</h2>
            <p className="text-gray-500">
              Complete some tests to see your academic analytics and AI insights.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudentAnalyticsPage;
