import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../Components/ui/card';
import { Button } from '../Components/ui/button';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

const StudentTestReviewPage = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [testReview, setTestReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchStudentTestReview();
  }, [testId]);

  const fetchStudentTestReview = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('Fetching test review for testId:', testId);
      console.log('Using token:', token ? 'Present' : 'Missing');
      
      const response = await fetch(`/api/student/test/${testId}/review`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch test review: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Test review data:', data);
      setTestReview(data);
    } catch (err) {
      console.error('Error fetching test review:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getAnswerDisplay = (question, studentAnswer, correctAnswer) => {
    if (!question) {
      return {
        student: studentAnswer !== null && studentAnswer !== undefined ? String(studentAnswer) : 'No answer',
        correct: correctAnswer !== null && correctAnswer !== undefined ? String(correctAnswer) : 'No correct answer',
        isCorrect: false
      };
    }
    
    const options = question.options || [];
    const type = question.type;
    
    // Handle MCQ (Multiple Choice)
    if (type === 'MCQ' || options.length > 0) {
      const studentIdx = Array.isArray(studentAnswer) ? studentAnswer[0] : studentAnswer;
      const correctIdxArray = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
      const correctIdx = correctIdxArray[0];
      
      const studentText = (studentIdx !== null && studentIdx !== undefined && studentIdx < options.length) 
        ? `${String.fromCharCode(65 + studentIdx)}. ${options[studentIdx]}`
        : 'No answer submitted';
      const correctText = (correctIdx !== null && correctIdx !== undefined && correctIdx < options.length)
        ? `${String.fromCharCode(65 + correctIdx)}. ${options[correctIdx]}`
        : 'No correct answer set';
      
      return {
        student: studentText,
        correct: correctText,
        isCorrect: studentIdx === correctIdx
      };
    }
    
    // Handle MSQ (Multiple Select)
    if (type === 'MSQ') {
      const studentIndices = Array.isArray(studentAnswer) ? studentAnswer : [];
      const correctIndices = Array.isArray(correctAnswer) ? correctAnswer : [];
      
      const studentText = studentIndices.length > 0 
        ? studentIndices.map(idx => `${String.fromCharCode(65 + idx)}. ${options[idx]}`).join(', ')
        : 'No answer submitted';
      const correctText = correctIndices.length > 0
        ? correctIndices.map(idx => `${String.fromCharCode(65 + idx)}. ${options[idx]}`).join(', ')
        : 'No correct answer set';
      
      const studentSorted = [...studentIndices].sort();
      const correctSorted = [...correctIndices].sort();
      
      return {
        student: studentText,
        correct: correctText,
        isCorrect: JSON.stringify(studentSorted) === JSON.stringify(correctSorted)
      };
    }
    
    // Handle Theory/Text answers
    return {
      student: studentAnswer || 'No answer submitted',
      correct: correctAnswer || 'No correct answer set',
      isCorrect: false // Theory answers need manual grading
    };
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGradeColor = (grade) => {
    const colors = {
      'A': 'bg-green-100 text-green-800',
      'B': 'bg-blue-100 text-blue-800',
      'C': 'bg-yellow-100 text-yellow-800',
      'D': 'bg-orange-100 text-orange-800',
      'F': 'bg-red-100 text-red-800',
    };
    return colors[grade] || 'bg-gray-100 text-gray-800';
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
          <Button onClick={() => navigate('/student')}>
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
          <h2 className="text-xl font-bold mb-4">No Results Available</h2>
          <p className="text-gray-600 mb-4">No test results found for this test.</p>
          <Button onClick={() => navigate('/student')}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'questions', label: 'Question Review', icon: '❓' },
    { id: 'feedback', label: 'Teacher Feedback', icon: '💬' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 via-pink-50 dark:via-gray-800 to-white dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/student')}
                className="mr-4 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                ← Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Test Review: {testReview.testTitle}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Subject: {testReview.subject} • Completed: {new Date(testReview.completedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg dark:bg-gray-700 bg-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700" />
                )}
              </button>
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400">Your Score</div>
                <div className={`text-2xl font-bold ${getScoreColor(testReview.score)}`}>
                  {testReview.score}%
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400">Grade</div>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getGradeColor(testReview.grade)}`}>
                  {testReview.grade}
                </span>
              </div>
              {testReview.rank && (
                <div className="text-right">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Rank</div>
                  <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                    #{testReview.rank} / {testReview.totalStudents || 'N/A'}
                  </div>
                  {testReview.percentile && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {testReview.percentile.toFixed(1)}th percentile
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-cyan-500 dark:border-cyan-400 text-cyan-600 dark:text-cyan-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
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
          <div className="space-y-6">
            {/* Performance Summary */}
            <Card className="p-6 dark:bg-gray-800 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">Performance Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getScoreColor(testReview.score)}`}>
                    {testReview.score}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Overall Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {testReview.correctAnswers}/{testReview.totalQuestions}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Correct Answers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                    {testReview.performanceLevel}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Performance Level</div>
                </div>
                {testReview.rank && (
                  <>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-indigo-600">
                        #{testReview.rank}
                      </div>
                      <div className="text-sm text-gray-600">
                        Rank out of {testReview.totalStudents} students
                      </div>
                      {testReview.percentile && (
                        <div className="text-xs text-gray-500 mt-1">
                          {testReview.percentile.toFixed(1)}th percentile
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Test Information */}
            <Card className="p-6 dark:bg-gray-800 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">Test Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Test Title</label>
                  <p className="text-lg font-semibold dark:text-white">{testReview.testTitle}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Subject</label>
                  <p className="text-lg font-semibold dark:text-white">{testReview.subject}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed On</label>
                  <p className="text-lg font-semibold dark:text-white">
                    {new Date(testReview.completedAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Duration</label>
                  <p className="text-lg font-semibold dark:text-white">{testReview.durationInMinutes} minutes</p>
                </div>
              </div>
            </Card>
          </div>
        )}
        
        {activeTab === 'questions' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Question-by-Question Review</h3>
              <div className="space-y-6">
                {testReview.questionResults?.map((result, index) => {
                  const answerDisplay = getAnswerDisplay(
                    result.question,
                    result.studentAnswer,
                    result.correctAnswer
                  );
                  
                  return (
                    <div key={index} className={`border rounded-lg p-4 ${
                      answerDisplay.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">
                          Question {index + 1}
                        </h4>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          answerDisplay.isCorrect 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {answerDisplay.isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-gray-700 font-medium">{result.questionText}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600 mb-1">Your Answer</label>
                          <div className={`p-2 rounded border ${
                            answerDisplay.isCorrect ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'
                          }`}>
                            {answerDisplay.student}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600 mb-1">Correct Answer</label>
                          <div className="p-2 rounded border bg-green-100 border-green-300">
                            {answerDisplay.correct}
                          </div>
                        </div>
                      </div>
                      
                      {result.explanation && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                          <label className="text-sm font-medium text-blue-800 mb-1">Explanation</label>
                          <p className="text-blue-700">{result.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}
        
        {activeTab === 'feedback' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Teacher Feedback</h3>
              {testReview.teacherFeedback ? (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">General Feedback</h4>
                    <p className="text-blue-800">{testReview.teacherFeedback.general}</p>
                  </div>
                  
                  {testReview.teacherFeedback.suggestions && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">Suggestions for Improvement</h4>
                      <ul className="list-disc list-inside text-green-800 space-y-1">
                        {testReview.teacherFeedback.suggestions.map((suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">💬</div>
                  <p className="text-gray-600">No teacher feedback available yet.</p>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentTestReviewPage;
