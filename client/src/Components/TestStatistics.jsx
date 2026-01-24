import React from 'react';
import { Card } from './ui/card';

const TestStatistics = ({ statistics }) => {
  if (!statistics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No statistics available</p>
      </div>
    );
  }

  const StatCard = ({ title, value, subtitle, color = "blue" }) => {
    const colorClasses = {
      blue: "bg-blue-50 border-blue-200 text-blue-700",
      green: "bg-green-50 border-green-200 text-green-700",
      cyan: "bg-cyan-50 border-cyan-200 text-cyan-700",
      orange: "bg-orange-50 border-orange-200 text-orange-700",
      red: "bg-red-50 border-red-200 text-red-700",
    };

    return (
      <Card className={`p-6 border-l-4 ${colorClasses[color]}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-75">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="text-xs opacity-75 mt-1">{subtitle}</p>}
          </div>
        </div>
      </Card>
    );
  };

  const GradeDistributionBar = ({ grade, count, total, color }) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    
    return (
      <div className="flex items-center space-x-3">
        <div className="w-16 text-sm font-medium">{grade}</div>
        <div className="flex-1">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${color}`}
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
  };

  return (
    <div className="space-y-6">
      {/* Main Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Average Score"
          value={`${statistics.averageScore?.toFixed(1) || 0}%`}
          subtitle="Class average"
          color="blue"
        />
        <StatCard
          title="Pass Rate"
          value={`${statistics.passRate?.toFixed(1) || 0}%`}
          subtitle={`${Math.round((statistics.passRate || 0) / 100 * statistics.totalStudents)} of ${statistics.totalStudents} students`}
          color="green"
        />
        <StatCard
          title="Highest Score"
          value={`${statistics.highestScore || 0}%`}
          subtitle="Top performer"
          color="cyan"
        />
        <StatCard
          title="Lowest Score"
          value={`${statistics.lowestScore || 0}%`}
          subtitle="Needs attention"
          color="orange"
        />
      </div>

      {/* Additional Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Detailed Stats */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="mr-2">📈</span>
            Detailed Statistics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Students:</span>
              <span className="font-semibold">{statistics.totalStudents}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Median Score:</span>
              <span className="font-semibold">{statistics.medianScore?.toFixed(1) || 0}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Standard Deviation:</span>
              <span className="font-semibold">{statistics.standardDeviation?.toFixed(1) || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Score Range:</span>
              <span className="font-semibold">
                {statistics.lowestScore || 0} - {statistics.highestScore || 0}
              </span>
            </div>
          </div>
        </Card>

        {/* Grade Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="mr-2">📊</span>
            Grade Distribution
          </h3>
          <div className="space-y-3">
            {statistics.gradeDistribution && Object.entries(statistics.gradeDistribution).map(([grade, count]) => {
              const colors = {
                "A (90-100)": "bg-green-500",
                "B (80-89)": "bg-blue-500",
                "C (70-79)": "bg-yellow-500",
                "D (60-69)": "bg-orange-500",
                "F (0-59)": "bg-red-500",
              };
              return (
                <GradeDistributionBar
                  key={grade}
                  grade={grade}
                  count={count}
                  total={statistics.totalStudents}
                  color={colors[grade] || "bg-gray-500"}
                />
              );
            })}
          </div>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <span className="mr-2">💡</span>
          Performance Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {statistics.averageScore >= 85 ? 'Excellent' : 
               statistics.averageScore >= 70 ? 'Good' : 
               statistics.averageScore >= 60 ? 'Average' : 'Needs Improvement'}
            </div>
            <div className="text-sm text-blue-700">Overall Performance</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {statistics.passRate >= 90 ? 'High' : 
               statistics.passRate >= 70 ? 'Good' : 
               statistics.passRate >= 50 ? 'Moderate' : 'Low'}
            </div>
            <div className="text-sm text-green-700">Pass Rate</div>
          </div>
          
          <div className="text-center p-4 bg-cyan-50 rounded-lg">
            <div className="text-2xl font-bold text-cyan-600">
              {statistics.standardDeviation > 15 ? 'High' : 
               statistics.standardDeviation > 10 ? 'Moderate' : 'Low'}
            </div>
            <div className="text-sm text-cyan-700">Score Variance</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TestStatistics;
