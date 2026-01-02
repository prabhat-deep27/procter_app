import React, { useState } from 'react';

const QuestionForm = ({ onQuestionsChange }) => {
    const [questions, setQuestions] = useState([]);
    const [questionType, setQuestionType] = useState(''); // No default selection
    const [previewMode, setPreviewMode] = useState(false);

    // --- FIX: This function now correctly builds the payload to match Postman ---
    const handleAddQuestion = () => {
        if (!questionType) {
            alert('Please select a question type first');
            return;
        }
        
        // 1. Create the base object with properties all questions share
        const newQuestion = {
            id: Date.now(),
            type: questionType,
            questionText: '',
            points: 1,
            correctAnswer: [], // Correct: Always start as an array
        };

        // 2. Conditionally add properties specific to the type
        if (questionType === 'Theory') {
            newQuestion.options = [];
            newQuestion.wordLimit = '';      // Add theory-specific keys
            newQuestion.sampleAnswer = ''; // Add theory-specific keys
        } else {
            // This covers both 'MCQ' and 'MSQ'
            newQuestion.options = ['', '', '', ''];
            // We intentionally DO NOT add wordLimit or sampleAnswer keys
        }

        const updatedQuestions = [...questions, newQuestion];
        setQuestions(updatedQuestions);
        onQuestionsChange && onQuestionsChange(updatedQuestions);
    };
    
    // Updates the text of a specific question
    const handleQuestionTextChange = (id, text) => {
        const updatedQuestions = questions.map(q =>
            q.id === id ? { ...q, questionText: text } : q
        );
        setQuestions(updatedQuestions);
        onQuestionsChange && onQuestionsChange(updatedQuestions);
    };

    // Updates points for a question
    const handlePointsChange = (id, points) => {
        const updatedQuestions = questions.map(q =>
            q.id === id ? { ...q, points: parseInt(points) || 1 } : q
        );
        setQuestions(updatedQuestions);
        onQuestionsChange && onQuestionsChange(updatedQuestions);
    };

    // Updates word limit for theory questions
    const handleWordLimitChange = (id, limit) => {
        const updatedQuestions = questions.map(q =>
            q.id === id ? { ...q, wordLimit: limit } : q
        );
        setQuestions(updatedQuestions);
        onQuestionsChange && onQuestionsChange(updatedQuestions);
    };

    // Updates sample answer for theory questions
    const handleSampleAnswerChange = (id, answer) => {
        const updatedQuestions = questions.map(q =>
            q.id === id ? { ...q, sampleAnswer: answer } : q
        );
        setQuestions(updatedQuestions);
        onQuestionsChange && onQuestionsChange(updatedQuestions);
    };

    // Updates the text of an option for an MCQ or MSQ question
    const handleOptionChange = (questionId, optionIndex, value) => {
        const updatedQuestions = questions.map(q => {
            if (q.id === questionId) {
                const newOptions = [...q.options];
                newOptions[optionIndex] = value;
                return { ...q, options: newOptions };
            }
            return q;
        });
        setQuestions(updatedQuestions);
        onQuestionsChange && onQuestionsChange(updatedQuestions);
    };
    
    // Handles selecting a correct answer for MCQ or MSQ
    const handleAnswerChange = (questionId, optionIndex, type) => {
        const updatedQuestions = questions.map(q => {
            if (q.id === questionId) {
                // Correct: MCQ answer is saved as an array
                if (type === 'MCQ') {
                    return { ...q, correctAnswer: [optionIndex] }; 
                } else if (type === 'MSQ') {
                    // Correct: This logic handles array toggling
                    const newCorrectAnswers = q.correctAnswer.includes(optionIndex)
                        ? q.correctAnswer.filter(i => i !== optionIndex)
                        : [...q.correctAnswer, optionIndex];
                    return { ...q, correctAnswer: newCorrectAnswers };
                }
            }
            return q;
        });
        setQuestions(updatedQuestions);
        onQuestionsChange && onQuestionsChange(updatedQuestions);
    };

    // Adds a new blank option field to an MCQ or MSQ question
    const handleAddOption = (questionId) => {
        const updatedQuestions = questions.map(q =>
            q.id === questionId ? { ...q, options: [...q.options, ''] } : q
        );
        setQuestions(updatedQuestions);
        onQuestionsChange && onQuestionsChange(updatedQuestions);
    };

    // Deletes a question from the form
    const handleDeleteQuestion = (id) => {
        if (window.confirm('Are you sure you want to delete this question?')) {
            const updatedQuestions = questions.filter(q => q.id !== id);
            setQuestions(updatedQuestions);
            onQuestionsChange && onQuestionsChange(updatedQuestions);
        }
    };

    // Clear all questions
    const handleClearAll = () => {
        if (window.confirm('Are you sure you want to clear all questions?')) {
            setQuestions([]);
            setQuestionType('');
            onQuestionsChange && onQuestionsChange([]);
        }
    };

    // JSX remains unchanged
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-cyan-600 to-cyan-700 p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-cyan-600 text-white p-8 rounded-t-3xl text-center">
                    <h1 className="text-4xl font-bold mb-3">📚 Question Creator</h1>
                    <p className="text-lg opacity-90">Create engaging questions for your students with multiple question types</p>
                </div>

                <div className="bg-white/95 backdrop-blur-sm p-8 rounded-b-3xl shadow-2xl">
                    {/* Question Type Selection */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Choose Question Type</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                             {/* MCQ Card */}
                            <div 
                                onClick={() => setQuestionType('MCQ')}
                                className={`cursor-pointer p-6 rounded-2xl text-center transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                                    questionType === 'MCQ' 
                                        ? 'bg-gradient-to-br from-indigo-600 to-cyan-600 text-white shadow-lg' 
                                        : 'bg-white border-2 border-gray-200 hover:border-indigo-300'
                                }`}
                            >
                                <div className="text-4xl mb-4">🔘</div>
                                <h3 className="text-xl font-semibold mb-2">Multiple Choice (MCQ)</h3>
                                <p className={`text-sm ${questionType === 'MCQ' ? 'text-white/80' : 'text-gray-600'}`}>
                                    Single correct answer from multiple options
                                </p>
                            </div>

                            {/* MSQ Card */}
                            <div 
                                onClick={() => setQuestionType('MSQ')}
                                className={`cursor-pointer p-6 rounded-2xl text-center transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                                    questionType === 'MSQ' 
                                        ? 'bg-gradient-to-br from-indigo-600 to-cyan-600 text-white shadow-lg' 
                                        : 'bg-white border-2 border-gray-200 hover:border-indigo-300'
                                }`}
                            >
                                <div className="text-4xl mb-4">☑️</div>
                                <h3 className="text-xl font-semibold mb-2">Multiple Select (MSQ)</h3>
                                <p className={`text-sm ${questionType === 'MSQ' ? 'text-white/80' : 'text-gray-600'}`}>
                                    Multiple correct answers can be selected
                                </p>
                            </div>

                            {/* Theory Card */}
                            <div 
                                onClick={() => setQuestionType('Theory')}
                                className={`cursor-pointer p-6 rounded-2xl text-center transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                                    questionType === 'Theory' 
                                        ? 'bg-gradient-to-br from-indigo-600 to-cyan-600 text-white shadow-lg' 
                                        : 'bg-white border-2 border-gray-200 hover:border-indigo-300'
                                }`}
                            >
                                <div className="text-4xl mb-4">✍️</div>
                                <h3 className="text-xl font-semibold mb-2">Theory/Essay</h3>
                                <p className={`text-sm ${questionType === 'Theory' ? 'text-white/80' : 'text-gray-600'}`}>
                                    Open-ended written responses
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-4">
                            <button 
                                type="button"
                                onClick={handleAddQuestion}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-xl hover:from-indigo-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
                            >
                                ➕ Add Question
                            </button>
                            <button 
                                type="button"
                                onClick={() => setPreviewMode(!previewMode)}
                                className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-300 font-semibold"
                            >
                                👁️ {previewMode ? 'Edit Mode' : 'Preview'}
                            </button>
                            {questions.length > 0 && (
                                <button 
                                    type="button"
                                    onClick={handleClearAll}
                                    className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-300 font-semibold"
                                >
                                    🗑️ Clear All
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Questions List */}
                    {questions.length > 0 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">
                                Questions ({questions.length})
                            </h3>
                            
                            {previewMode ? (
                                /* Preview Mode */
                                <div className="space-y-6">
                                    {questions.map((q, index) => (
                                       <div key={q.id} className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-sm">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-sm font-medium">
                                                    {q.type}
                                                </span>
                                                <span className="text-gray-600 text-sm">Points: {q.points}</span>
                                            </div>
                                            <h4 className="text-lg font-medium text-gray-800 mb-4">
                                                {index + 1}. {q.questionText || 'Question text not entered'}
                                            </h4>
                                            
                                            {q.type !== 'Theory' && (
                                                <div className="space-y-2">
                                                    {q.options.map((option, optIndex) => {
                                                        if (!option.trim()) return null;
                                                        const letter = String.fromCharCode(65 + optIndex);
                                                        return (
                                                            <div key={optIndex} className="flex items-center gap-3">
                                                                <input 
                                                                    type={q.type === 'MCQ' ? 'radio' : 'checkbox'}
                                                                    disabled 
                                                                    className="text-indigo-600"
                                                                />
                                                                <span>{letter}. {option}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                            
                                            {q.type === 'Theory' && (
                                                <div>
                                                    <textarea 
                                                        placeholder="Student will type their answer here..."
                                                        className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                                                        rows="4"
                                                        disabled
                                                    />
                                                    {q.wordLimit && (
                                                        <p className="text-gray-600 text-sm mt-2">Word limit: {q.wordLimit}</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                /* Edit Mode */
                                <div className="space-y-6">
                                    {questions.map((q, index) => (
                                        <div key={q.id} className="bg-gray-50 border border-gray-200 rounded-2xl p-6 relative">
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteQuestion(q.id)}
                                                className="absolute top-4 right-4 w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200 flex items-center justify-center font-bold"
                                            >
                                                ×
                                            </button>
                                            
                                             <div className="mb-4">
                                                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                                    Question {index + 1} ({q.type})
                                                </h3>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Question Text *
                                                        </label>
                                                        <textarea
                                                            placeholder="Enter your question here..."
                                                            value={q.questionText}
                                                            onChange={(e) => handleQuestionTextChange(q.id, e.target.value)}
                                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                                            rows="3"
                                                        />
                                                    </div>
                                                    
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Points
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={q.points}
                                                            onChange={(e) => handlePointsChange(q.id, e.target.value)}
                                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Options for MCQ/MSQ */}
                                            {q.type !== 'Theory' && (
                                                <div className="space-y-3">
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        Answer Options (select correct answer{q.type === 'MSQ' ? 's' : ''})
                                                    </label>
                                                    {q.options.map((option, optIndex) => (
                                                        <div key={optIndex} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
                                                            <input
                                                                type={q.type === 'MCQ' ? 'radio' : 'checkbox'}
                                                                name={`question-answer-${q.id}`}
                                                                // Correct: This logic works for both MCQ/MSQ arrays
                                                                checked={q.correctAnswer.includes(optIndex)}
                                                                onChange={() => handleAnswerChange(q.id, optIndex, q.type)}
                                                                className="text-indigo-600 focus:ring-indigo-500"
                                                            />
                                                            <span className="text-gray-600 font-medium w-6">
                                                                {String.fromCharCode(65 + optIndex)}.
                                                            </span>
                                                            <input
                                                                type="text"
                                                                placeholder={`Option ${optIndex + 1}`}
                                                                value={option}
                                                                onChange={(e) => handleOptionChange(q.id, optIndex, e.target.value)}
                                                                className="flex-1 p-2 border-0 focus:ring-0 focus:outline-none"
                                                            />
                                                        </div>
                                                    ))}
                                                    <button 
                                                        type="button"
                                                        onClick={() => handleAddOption(q.id)}
                                                        className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1"
                                                    >
                                                        ➕ Add another option
                                                    </button>
                                                </div>
                                            )}

                                            {/* Theory Question Fields */}
                                            {q.type === 'Theory' && (
                                                 <div className="space-y-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Word Limit (Optional)
                                                            </label>
                                                            <input
                                                                type="number"
                                                                placeholder="e.g., 500"
                                                                value={q.wordLimit}
                                                                onChange={(e) => handleWordLimitChange(q.id, e.target.value)}
                                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                                            />
                                                        </div>
                                                    </div>
                                                    
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Sample Answer/Keywords (Optional)
                                                        </label>
                                                        <textarea
                                                            placeholder="Enter key points or sample answer for grading reference..."
                                                            value={q.sampleAnswer}
                                                            onChange={(e) => handleSampleAnswerChange(q.id, e.target.value)}
                                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                                            rows="3"
                                                        />
                                                    </div>
                                                    
                                                    <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 text-center">
                                                        Students will type their answer here
                                                        {q.wordLimit && <span className="block text-sm mt-1">Word limit: {q.wordLimit}</span>}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {questions.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            <div className="text-6xl mb-4">📝</div>
                            <h3 className="text-xl font-medium mb-2">No questions added yet</h3>
                            <p>Select a question type above and click "Add Question" to get started</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuestionForm;