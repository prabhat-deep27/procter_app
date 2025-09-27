import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';

const AIReportPanel = ({ aiReport }) => {
  const [expandedSection, setExpandedSection] = useState('summary');

  if (!aiReport) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No AI report available</p>
      </div>
    );
  }

  const sections = [
    { id: 'summary', label: 'Summary', icon: '📋' },
    { id: 'insights', label: 'Key Insights', icon: '🔍' },
    { id: 'recommendations', label: 'Recommendations', icon: '💡' },
    { id: 'performance', label: 'Class Performance', icon: '📊' },
    { id: 'concerns', label: 'Areas of Concern', icon: '⚠️' },
    { id: 'actions', label: 'Suggested Actions', icon: '🎯' },
  ];

  const SectionCard = ({ sectionId, title, children, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-50 border-blue-200',
      green: 'bg-green-50 border-green-200',
      yellow: 'bg-yellow-50 border-yellow-200',
      red: 'bg-red-50 border-red-200',
      purple: 'bg-purple-50 border-purple-200',
    };

    return (
      <Card className={`p-6 ${colorClasses[color]} ${expandedSection === sectionId ? 'ring-2 ring-purple-300' : ''}`}>
        <button
          onClick={() => setExpandedSection(expandedSection === sectionId ? null : sectionId)}
          className="w-full text-left"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <span className="mr-2">{sections.find(s => s.id === sectionId)?.icon}</span>
              {title}
            </h3>
            <span className="text-sm text-gray-500">
              {expandedSection === sectionId ? '▼' : '▶'}
            </span>
          </div>
        </button>
        {expandedSection === sectionId && (
          <div className="mt-4">
            {children}
          </div>
        )}
      </Card>
    );
  };

  const InsightCard = ({ insight, type = 'info' }) => {
    const typeClasses = {
      info: 'bg-blue-100 text-blue-800 border-blue-200',
      success: 'bg-green-100 text-green-800 border-green-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      error: 'bg-red-100 text-red-800 border-red-200',
    };

    return (
      <div className={`p-4 rounded-lg border ${typeClasses[type]} mb-3`}>
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-3">
            <span className="text-lg">
              {type === 'info' ? 'ℹ️' : 
               type === 'success' ? '✅' : 
               type === 'warning' ? '⚠️' : '❌'}
            </span>
          </div>
          <div className="text-sm font-medium">{insight}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* AI Report Header */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-purple-800 flex items-center">
              <span className="mr-3">🤖</span>
              AI-Generated Test Analysis Report
            </h2>
            <p className="text-purple-600 mt-2">
              Comprehensive analysis powered by artificial intelligence to help improve teaching and learning outcomes.
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-purple-600">Generated on</div>
            <div className="font-semibold text-purple-800">
              {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex flex-wrap gap-2">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setExpandedSection(section.id)}
            className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center space-x-2 transition-colors ${
              expandedSection === section.id
                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>{section.icon}</span>
            <span>{section.label}</span>
          </button>
        ))}
      </div>

      {/* Executive Summary */}
      <SectionCard sectionId="summary" title="Executive Summary" color="blue">
        <div className="prose max-w-none">
          <p className="text-gray-700 leading-relaxed">
            {aiReport.summary || 'No summary available.'}
          </p>
        </div>
      </SectionCard>

      {/* Key Insights */}
      <SectionCard sectionId="insights" title="Key Insights" color="green">
        <div className="space-y-3">
          {aiReport.insights?.map((insight, index) => (
            <InsightCard key={index} insight={insight} type="info" />
          )) || (
            <div className="text-center py-4 text-gray-500">
              No insights available
            </div>
          )}
        </div>
      </SectionCard>

      {/* Recommendations */}
      <SectionCard sectionId="recommendations" title="Recommendations" color="purple">
        <div className="space-y-4">
          {aiReport.recommendations?.map((recommendation, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-purple-600">{index + 1}</span>
              </div>
              <div className="flex-1">
                <p className="text-gray-700">{recommendation}</p>
              </div>
            </div>
          )) || (
            <div className="text-center py-4 text-gray-500">
              No recommendations available
            </div>
          )}
        </div>
      </SectionCard>

      {/* Class Performance */}
      <SectionCard sectionId="performance" title="Class Performance Assessment" color="blue">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">Overall Class Performance</h4>
              <p className="text-gray-600 mt-1">
                {aiReport.classPerformance || 'No performance assessment available.'}
              </p>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Areas of Concern */}
      <SectionCard sectionId="concerns" title="Areas of Concern" color="red">
        <div className="space-y-3">
          {aiReport.areasOfConcern?.map((concern, index) => (
            <InsightCard key={index} insight={concern} type="error" />
          )) || (
            <div className="text-center py-4">
              <div className="text-green-600 font-semibold">✅ No Major Concerns Identified</div>
              <p className="text-gray-600 mt-1">The class is performing well overall!</p>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Suggested Actions */}
      <SectionCard sectionId="actions" title="Suggested Actions" color="yellow">
        <div className="bg-white p-6 rounded-lg border">
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed">
              {aiReport.suggestedActions || 'No specific actions suggested at this time.'}
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 pt-6">
        <Button className="bg-purple-600 hover:bg-purple-700 flex items-center space-x-2">
          <span>📧</span>
          <span>Share Report</span>
        </Button>
        <Button variant="outline" className="flex items-center space-x-2">
          <span>💾</span>
          <span>Export PDF</span>
        </Button>
        <Button variant="outline" className="flex items-center space-x-2">
          <span>🔄</span>
          <span>Regenerate Report</span>
        </Button>
        <Button variant="outline" className="flex items-center space-x-2">
          <span>⚙️</span>
          <span>Customize Analysis</span>
        </Button>
      </div>

      {/* AI Disclaimer */}
      <Card className="p-4 bg-gray-50 border-gray-200">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <span className="text-lg">🤖</span>
          </div>
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-1">AI-Generated Content Disclaimer</p>
            <p>
              This report is generated using artificial intelligence algorithms based on test performance data. 
              While AI analysis can provide valuable insights, it should be used as a supplement to, not a 
              replacement for, professional teaching judgment and individual student assessment.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AIReportPanel;
