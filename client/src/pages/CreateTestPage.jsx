import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // For token
import QuestionForm from "../Components/QuestionForm";

// --- Parent Component: CreateTestPage ---
export default function CreateTestPage() {
    const { token } = useAuth();
    const navigate = useNavigate();

    // These states are for the main test details
    const [title, setTitle] = useState("");
    const [scheduledAt, setScheduledAt] = useState("");
    const [subject, setSubject] = useState("");
    const [durationInMinutes, setDurationInMinutes] = useState("");
    
    // This state will be FILLED by the QuestionForm child component
    const [questions, setQuestions] = useState([]);

    // --- FIX: Add state to manage resetting the child component ---
    const [resetKey, setResetKey] = useState(0);

    const [testResult, setTestResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // This callback function receives the question list from the child
    const handleQuestionsChange = (updatedQuestions) => {
        // We only want the data, not the internal React 'id' from the component
        const questionsForApi = updatedQuestions.map(({ id, ...rest }) => rest);
        setQuestions(questionsForApi);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        // Basic validation
        if (!title.trim()) {
            alert("Please enter a test title.");
            setIsLoading(false);
            return;
        }
        if (!subject) {
            alert("Please select a subject.");
            setIsLoading(false);
            return;
        }
        if (questions.length === 0) {
            alert("Please add at least one question.");
            setIsLoading(false);
            return;
        }

        const payload = {
            title,
            subject,
            scheduledAt: new Date(scheduledAt).toISOString(),
            durationInMinutes: parseInt(durationInMinutes, 10),
            questions, // This now contains the perfectly formatted questions from the child
        };
        
        console.log("Submitting Payload:", JSON.stringify(payload, null, 2));
        console.log("Token being used:", token); // Add this debug line

        try {
            const response = await fetch("/api/tests", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // This token MUST have the correct role (TEACHER, INSTRUCTOR, etc.)
                    // configured in your backend Spring SecurityConfig.
                    Authorization: `Bearer ${token}`, 
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData.message ||
                    `Failed to create test. Status: ${response.status}`
                );
            }

            const result = await response.json();
            setTestResult(result);
        } catch (err) {
            setError(err.message);
            console.error("Failed to submit the test:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // --- FIX: This function now correctly updates the resetKey state ---
    const handleCreateAnother = () => {
        setTestResult(null);
        setTitle("");
        setScheduledAt("");
        setSubject("");
        setDurationInMinutes("");
        setQuestions([]); 
        setError(null);
        // This increments the key, forcing React to unmount and re-mount
        // a fresh instance of the QuestionForm component.
        setResetKey(prevKey => prevKey + 1);
    };

    if (testResult) {
        return (
            <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-md my-8 text-center">
                <h1 className="text-2xl font-bold mb-4 text-green-600">
                    Test Created Successfully!
                </h1>
                <div className="bg-gray-100 p-4 rounded-lg space-y-3">
                    <div>
                        <label className="font-semibold text-gray-600 block">
                            Test Title:
                        </label>
                        <p className="text-lg text-black">{testResult.title}</p>
                    </div>
                    <div>
                        <label className="font-semibold text-gray-600 block">
                            Join Code:
                        </label>
                        <p className="text-2xl font-mono bg-gray-200 p-2 rounded-md inline-block">
                            {testResult.joinCode}
                        </p>
                    </div>
                    <div>
                        <label className="font-semibold text-gray-600 block">
                            Join Link:
                        </label>
                        <p className="text-sm text-blue-600 break-all">
                            {testResult.joinLink}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleCreateAnother}
                    className="mt-6 w-full bg-gradient-to-r from-cyan-600 to-pink-500 text-white py-3 rounded-lg hover:opacity-90 transition-opacity font-bold text-lg"
                >
                    Create Another Test
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto my-8">
            <h1 className="text-3xl font-bold mb-6 text-center text-cyan-700">
                Create New Test
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="p-6 bg-white rounded-lg shadow-md space-y-4">
                    <h2 className="text-xl font-semibold text-gray-800">Test Details</h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Test Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Subject
                        </label>
                        <select
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"
                            required
                        >
                            <option value="">Select a subject</option>
                            <option value="Mathematics">Mathematics</option>
                            <option value="Software Development">Software Development</option>
                            <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
                            <option value="Database Management Systems">Database Management Systems</option>
                            <option value="Networking">Networking</option>
                            <option value="Operating Systems">Operating Systems</option>
                            <option value="AI & ML">AI & ML</option>
                            <option value="Web Development">Web Development</option>
                            <option value="App Development">App Development</option>
                            <option value="Cloud Computing & DevOps">Cloud Computing & DevOps</option>
                            <option value="Blockchain & Cryptocurrency">Blockchain & Cryptocurrency</option>
                            <option value="Data Science & Big Data Analytics">Data Science & Big Data Analytics</option>
                            <option value="Internet of Things (IoT)">Internet of Things (IoT)</option>
                            <option value="Ethical Hacking">Ethical Hacking</option>
                            <option value="Physics">Physics</option>
                            <option value="Chemistry">Chemistry</option>
                            <option value="Biology">Biology</option>
                            <option value="Science">Science</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Scheduled Start Time
                            </label>
                            <input
                                type="datetime-local"
                                value={scheduledAt}
                                onChange={(e) => setScheduledAt(e.target.value)}
                                className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Duration (minutes)
                            </label>
                            <input
                                type="number"
                                value={durationInMinutes}
                                onChange={(e) => setDurationInMinutes(e.target.value)}
                                className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                min="1"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* --- FIX: Using the new 'resetKey' to force re-mounting --- */}
                <QuestionForm 
                    key={resetKey} 
                    onQuestionsChange={handleQuestionsChange} 
                />

                {error && (
                    <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                        <p className="font-bold">Error:</p>
                        <p>{error}</p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-cyan-600 to-pink-500 text-white py-3 rounded-lg hover:opacity-90 transition-opacity font-bold text-lg disabled:opacity-50"
                >
                    {isLoading ? "Creating Test..." : "Create and Save Test"}
                </button>
            </form>
        </div>
    );
}
