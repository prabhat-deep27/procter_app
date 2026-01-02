import React, { useState } from 'react';
import { Card } from './ui/card';

const QuestionAnalysis = ({ questionAnalysis }) => {
  const [activeView, setActiveView] = useState('difficulty');

  if (!questionAnalysis) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No question analysis available</p>
      </div>
    );
  }

  const DifficultyBar = ({ difficulty }) => {
    const getDifficultyColor = (level) => {
      const colors = {
        'Easy': 'bg-green-500',
        'Medium': 'bg-yellow-500',
        'Hard': 'bg-red-500',
      };
      return colors[level] || 'bg-gray-500';
    };

    return (
      <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
        <div className="w-8 text-sm font-medium">Q{difficulty.questionIndex + 1}</div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Difficulty Level</span>
            <span className="text-sm text-gray-600">
              {difficulty.difficultyPercentage.toFixed(1)}% incorrect
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getDifficultyColor(difficulty.difficultyLevel)}`}
              style={{ width: `${difficulty.difficultyPercentage}%` }}
            ></div>
          </div>
        </div>
        <div className="w-20">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            difficulty.difficultyLevel === 'Easy' ? 'bg-green-100 text-green-800' :
            difficulty.difficultyLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {difficulty.difficultyLevel}
          </span>
        </div>
      </div>
    );
  };

  const TopicPerformanceBar = ({ topic, performance }) => {
    const getPerformanceColor = (score) => {
      if (score >= 80) return 'bg-green-500';
      if (score >= 60) return 'bg-yellow-500';
      return 'bg-red-500';
    };

    return (
      <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
        <div className="w-32 text-sm font-medium">{topic}</div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Performance</span>
            <span className="text-sm text-gray-600">{performance.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getPerformanceColor(performance)}`}
              style={{ width: `${performance}%` }}
            ></div>
          </div>
        </div>
        <div className="w-16">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            performance >= 80 ? 'bg-green-100 text-green-800' :
            performance >= 60 ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {performance >= 80 ? 'Good' : performance >= 60 ? 'Fair' : 'Poor'}
          </span>
        </div>
      </div>
    );
  };

  const views = [
    { id: 'difficulty', label: 'Question Difficulty', icon: '📊' },
    { id: 'missed', label: 'Most Missed', icon: '❌' },
    { id: 'correct', label: 'Most Correct', icon: '✅' },
    { id: 'topics', label: 'Topic Performance', icon: '📚' },
  ];

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2">
        {views.map((view) => (
          <button
            key={view.id}
            onClick={() => setActiveView(view.id)}
            className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center space-x-2 transition-colors ${
              activeView === view.id
                ? 'bg-cyan-100 text-cyan-700 border border-cyan-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>{view.icon}</span>
            <span>{view.label}</span>
          </button>
        ))}
      </div>

      {/* Question Difficulty Analysis */}
      {activeView === 'difficulty' && (
        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <span className="mr-2">📊</span>
              Question Difficulty Analysis
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Analysis of how difficult each question was for students based on correct answer rates.
            </p>
            <div className="space-y-3">
              {questionAnalysis.questionDifficulties?.map((difficulty, index) => (
                <DifficultyBar key={index} difficulty={difficulty} />
              )) || (
                <div className="text-center py-8 text-gray-500">
                  No difficulty data available
                </div>
              )}
            </div>
          </Card>

          {/* Difficulty Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {questionAnalysis.questionDifficulties?.filter(q => q.difficultyLevel === 'Easy').length || 0}
              </div>
              <div className="text-sm text-gray-600">Easy Questions</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {questionAnalysis.questionDifficulties?.filter(q => q.difficultyLevel === 'Medium').length || 0}
              </div>
              <div className="text-sm text-gray-600">Medium Questions</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {questionAnalysis.questionDifficulties?.filter(q => q.difficultyLevel === 'Hard').length || 0}
              </div>
              <div className="text-sm text-gray-600">Hard Questions</div>
            </Card>
          </div>
        </div>
      )}

      {/* Most Missed Questions */}
      {activeView === 'missed' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="mr-2">❌</span>
            Most Missed Questions
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Questions that students found most challenging and need additional attention.
          </p>
          <div className="space-y-3">
            {questionAnalysis.mostMissedQuestions?.map((question, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-red-700">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{question}</div>
                  <div className="text-xs text-gray-600">High miss rate - consider reviewing</div>
                </div>
                <div className="flex-shrink-0">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                    Review Needed
                  </span>
                </div>
              </div>
            )) || (
              <div className="text-center py-8 text-gray-500">
                No missed questions data available
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Most Correct Questions */}
      {activeView === 'correct' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="mr-2">✅</span>
            Most Correct Questions
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Questions that students answered correctly most often - these topics were well understood.
          </p>
          <div className="space-y-3">
            {questionAnalysis.mostCorrectQuestions?.map((question, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-green-700">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{question}</div>
                  <div className="text-xs text-gray-600">High success rate - well understood</div>
                </div>
                <div className="flex-shrink-0">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Well Understood
                  </span>
                </div>
              </div>
            )) || (
              <div className="text-center py-8 text-gray-500">
                No correct questions data available
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Topic Performance */}
      {activeView === 'topics' && (
        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <span className="mr-2">📚</span>
              Topic Performance Analysis
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Performance breakdown by topic areas to identify strengths and weaknesses.
            </p>
            <div className="space-y-3">
              {questionAnalysis.topicPerformance && Object.entries(questionAnalysis.topicPerformance).map(([topic, performance]) => (
                <TopicPerformanceBar key={topic} topic={topic} performance={performance} />
              )) || (
                <div className="text-center py-8 text-gray-500">
                  No topic performance data available
                </div>
              )}
            </div>
          </Card>

          {/* Topic Summary */}
          {questionAnalysis.topicPerformance && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Object.entries(questionAnalysis.topicPerformance).filter(([, score]) => score >= 80).length}
                </div>
                <div className="text-sm text-gray-600">Strong Topics</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {Object.entries(questionAnalysis.topicPerformance).filter(([, score]) => score >= 60 && score < 80).length}
                </div>
                <div className="text-sm text-gray-600">Fair Topics</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {Object.entries(questionAnalysis.topicPerformance).filter(([, score]) => score < 60).length}
                </div>
                <div className="text-sm text-gray-600">Weak Topics</div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Recommendations */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center text-blue-800">
          <span className="mr-2">💡</span>
          Recommendations Based on Analysis
        </h3>
        <div className="space-y-2 text-sm text-blue-700">
          <p>• Review difficult questions and provide additional explanations</p>
          <p>• Focus teaching efforts on topics with low performance scores</p>
          <p>• Use well-understood topics as examples for teaching difficult concepts</p>
          <p>• Consider adjusting question difficulty for future tests</p>
          <p>• Provide extra practice materials for challenging topics</p>
        </div>
      </Card>
    </div>
  );
};

export default QuestionAnalysis;
