import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../Components/ui/card';
import { Button } from '../Components/ui/button';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const StudentAnalyticsPage = () => {
  const { user, token } = useAuth();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');

  const fetchAnalytics = useCallback(async () => {
    if (!token || !user) {
      setError('User not authenticated');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (selectedSubject) params.append('subject', selectedSubject);
      if (selectedTimeRange) params.append('timeRange', selectedTimeRange);

      const url = `${API_BASE_URL}/api/analytics/my-analytics?${params.toString()}`;

      console.log('📡 Fetching Student Analytics');
      console.log('➡️ URL:', url);
      console.log('👤 User:', user.email, user.role);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Handle errors
      if (response.status === 401) {
        throw new Error('Unauthorized – Please login again');
      }
      if (response.status === 403) {
        const errorText = await response.text();
        throw new Error(errorText || 'Forbidden – Access denied. Please check your permissions.');
      }
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to fetch analytics');
      }

      const data = await response.json();
      console.log('✅ Analytics received:', data);
      setAnalytics(data);
    } catch (err) {
      console.error('❌ Analytics error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, user, selectedSubject, selectedTimeRange]);

  useEffect(() => {
    if (token && user?.role === 'STUDENT') {
      fetchAnalytics();
    }
  }, [fetchAnalytics, token, user]);

  const StatCard = ({ title, value, subtitle, color = "blue" }) => {
    const colorClasses = {
      blue: "bg-blue-50 border-blue-200 text-blue-700",
      green: "bg-green-50 border-green-200 text-green-700",
      cyan: "bg-cyan-50 border-cyan-200 text-cyan-700",
      orange: "bg-orange-50 border-orange-200 text-orange-700",
    };

    return (
      <Card className={`p-6 border-l-4 ${colorClasses[color]}`}>
        <p className="text-sm font-medium opacity-75">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
        {subtitle && <p className="text-xs opacity-75 mt-1">{subtitle}</p>}
      </Card>
    );
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin h-16 w-16 border-b-2 border-cyan-600 rounded-full"></div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="p-8 max-w-md text-center">
        <h2 className="text-xl font-bold text-red-600 mb-3">Error</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={fetchAnalytics}>Retry</Button>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-100 to-white">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">My Academic Analytics</h1>

        {/* Filters */}
        <Card className="p-4 mb-6 flex gap-4 flex-wrap">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="">All Subjects</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Science">Science</option>
            <option value="English">English</option>
          </select>

          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="all">All Time</option>
            <option value="month">Last Month</option>
            <option value="week">Last Week</option>
          </select>

          <Button onClick={fetchAnalytics} className="bg-cyan-600 hover:bg-cyan-700">
            Refresh
          </Button>
        </Card>

        {!analytics ? (
          <Card className="p-8 text-center text-gray-500">
            No analytics available
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Overall Average" value={`${analytics.overallAverage?.toFixed(1) || 0}%`} />
            <StatCard title="Total Tests" value={analytics.recentTests?.length || 0} />
            <StatCard title="Learning Style" value={analytics.aiInsights?.learningStyle || 'N/A'} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAnalyticsPage;
