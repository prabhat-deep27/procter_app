import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createStompClient } from '../lib/stompClient';
import { ProctoringSession } from '../lib/proctoring';
import { useAuth } from '../context/AuthContext';

export default function TestAttemptPage() {
    const { testId } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();

    const sessionRef = useRef(null);
    const clientRef = useRef(null);
    const videoRef = useRef(null);
    const timerRef = useRef(null);

    const [test, setTest] = useState(null);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [facesDetected, setFacesDetected] = useState(0);
    const [cameraActive, setCameraActive] = useState(false);

    // Timer functionality
    useEffect(() => {
        if (test && test.durationInMinutes) {
            const durationInSeconds = test.durationInMinutes * 60;
            setTimeLeft(durationInSeconds);
            
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        // Auto-submit when time runs out
                        handleAutoSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => {
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                }
            };
        }
    }, [test]);

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAutoSubmit = async () => {
        if (submitting || result) return;
        
        try {
            setSubmitting(true);
            setError('');
            
            const total = Array.isArray(test.questions) ? test.questions.length : 0;
            const ordered = new Array(total).fill(null);
            Object.keys(answers).forEach(k => {
                const idx = Number(k);
                if (!Number.isNaN(idx) && idx >= 0 && idx < total) ordered[idx] = answers[k];
            });
            
            console.log('Submitting test with token:', token ? token.substring(0, 20) + '...' : 'null');
            console.log('Test ID:', testId);
            console.log('Answers:', ordered);
            
            const res = await fetch(`/api/tests/${encodeURIComponent(testId)}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
                credentials: 'include',
                body: JSON.stringify({ answers: ordered, durationInMinutes: test.durationInMinutes })
            });
            
            if (!res.ok) {
                const raw = await res.text();
                throw new Error(raw || 'Submit failed');
            }
            
            const data = await res.json();
            setResult(data);
            
            setTimeout(() => {
                navigate('/student', { state: { testSubmitted: true, score: data.score, correct: data.correct, total: data.total } });
            }, 1500);
        } catch (e) {
            setError(e.message || 'Failed to submit');
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        let cancelled = false;
        const fetchTest = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/tests/${encodeURIComponent(testId)}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                    },
                    credentials: 'include',
                });
                if (!res.ok) {
                    const raw = await res.text();
                    throw new Error(raw || 'Failed to load test');
                }
                const data = await res.json();
                if (!cancelled) setTest(data);
            } catch (e) {
                if (!cancelled) setError(e.message || 'Failed to load test');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchTest();
        return () => { cancelled = true; };
    }, [testId, token]);

    useEffect(() => {
        let stopped = false;
        const startProctoring = async () => {
            try {
                // Request camera and microphone permissions before starting
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ 
                        video: true, 
                        audio: true 
                    });
                    // Stop the test stream - we'll start it again in the session
                    stream.getTracks().forEach(track => track.stop());
                } catch (permError) {
                    setError('Camera and microphone permissions are required to take this test. Please grant permissions and reload.');
                    return;
                }

                // Optional: verify single display again here
                try {
                    const single = await ProctoringSession.verifySingleDisplayOrThrow();
                    if (!single) {
                        setError('Multiple displays detected. Disconnect extra monitors and reload.');
                        return;
                    }
                } catch (_) {
                    // If unsupported, continue but warn
                }

                const client = createStompClient();
                clientRef.current = client;
                client.activate();
                client.onConnect = async () => {
                    if (stopped) return;
                    const session = new ProctoringSession({ 
                        testId, 
                        stompClient: client,
                        onEvent: (event) => {
                            if (event.type === 'VISION_SAMPLE' || event.type === 'COMPREHENSIVE_ANALYSIS') {
                                setFacesDetected(event.facesDetected || 0);
                            }
                        }
                    });
                    sessionRef.current = session;
                    try {
                        await session.start();
                        setCameraActive(true);
                        
                        // Set up video element for camera display
                        if (videoRef.current && session.mediaStreams.camera) {
                            videoRef.current.srcObject = session.mediaStreams.camera;
                            videoRef.current.play();
                        }
                        
                        try { 
                            await session.startScreen(); 
                        } catch (_) {
                            console.log('Screen sharing not available');
                        }
                    } catch (e) {
                        setError(e.message || 'Failed to start proctoring');
                    }
                };
            } catch (e) {
                setError(e.message || 'Failed to start monitoring');
            }
        };

        startProctoring();
        return () => {
            stopped = true;
            try { sessionRef.current?.stop(); } catch (_) {}
            try { clientRef.current?.deactivate(); } catch (_) {}
        };
    }, [testId]);

    const handleExit = () => {
        navigate('/student');
    };

    const handleOptionChange = (qIndex, optionIndex, isMulti) => {
        setAnswers(prev => {
            const current = prev[qIndex] ?? (isMulti ? [] : null);
            if (isMulti) {
                const set = new Set(current);
                if (set.has(optionIndex)) set.delete(optionIndex); else set.add(optionIndex);
                return { ...prev, [qIndex]: Array.from(set).sort((a,b)=>a-b) };
            }
            return { ...prev, [qIndex]: optionIndex };
        });
    };

    const handleTextChange = (qIndex, text) => {
        setAnswers(prev => ({ ...prev, [qIndex]: text }));
    };

    const handleSubmit = async () => {
        if (!test) return;
        try {
            setSubmitting(true);
            setError('');
            
            const total = Array.isArray(test.questions) ? test.questions.length : 0;
            const ordered = new Array(total).fill(null);
            Object.keys(answers).forEach(k => {
                const idx = Number(k);
                if (!Number.isNaN(idx) && idx >= 0 && idx < total) ordered[idx] = answers[k];
            });
            
            console.log('Submitting test with token:', token ? token.substring(0, 20) + '...' : 'null');
            console.log('Test ID:', testId);
            console.log('Answers:', ordered);
            
            const res = await fetch(`/api/tests/${encodeURIComponent(testId)}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
                credentials: 'include',
                body: JSON.stringify({ answers: ordered, durationInMinutes: test.durationInMinutes })
            });
            
            if (!res.ok) {
                const raw = await res.text();
                throw new Error(raw || 'Submit failed');
            }
            
            const data = await res.json();
            setResult(data);
            
            setTimeout(() => {
                navigate('/student', { state: { testSubmitted: true, score: data.score, correct: data.correct, total: data.total } });
            }, 1500);
        } catch (e) {
            setError(e.message || 'Failed to submit');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-semibold">Test Attempt</h1>
                <div className="flex items-center gap-4">
                    {/* Timer Display */}
                    {test && (
                        <div className={`text-lg font-bold px-3 py-1 rounded ${
                            timeLeft < 300 ? 'bg-red-100 text-red-800' : 
                            timeLeft < 600 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-green-100 text-green-800'
                        }`}>
                            {formatTime(timeLeft)}
                        </div>
                    )}
                    <button onClick={handleExit} className="px-4 py-2 rounded-md bg-gray-800 text-white">Exit</button>
                </div>
            </div>

            {loading && (
                <div className="text-gray-600">Loading test...</div>
            )}
            {error && (
                <div className="text-red-600 mb-4">{error}</div>
            )}
            {!loading && test && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Test Content */}
                    <div className="lg:col-span-2 space-y-3">
                        <div className="rounded-md border p-4 bg-white">
                            <div className="font-bold text-lg">{test.title}</div>
                            <div className="text-sm text-gray-600">Subject: {test.subject}</div>
                            <div className="text-sm text-gray-600">Duration: {test.durationInMinutes} minutes</div>
                        </div>
                        
                        <div className="rounded-md border p-4 bg-white">
                            {Array.isArray(test.questions) && test.questions.length > 0 ? (
                                <div className="space-y-6">
                                    {test.questions.map((q, idx) => {
                                        const isMulti = Array.isArray(q?.correctAnswer) && q.correctAnswer.length > 1;
                                        const a = answers[idx];
                                        return (
                                            <div key={idx} className="border-b pb-4 last:border-b-0">
                                                <div className="font-medium mb-2">Q{idx + 1}. {q?.questionText}</div>
                                                {Array.isArray(q?.options) && q.options.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {q.options.map((opt, optIdx) => (
                                                            <label key={optIdx} className="flex items-center gap-2 cursor-pointer">
                                                                <input
                                                                    type={isMulti ? 'checkbox' : 'radio'}
                                                                    name={`q_${idx}`}
                                                                    checked={isMulti ? Array.isArray(a) && a.includes(optIdx) : a === optIdx}
                                                                    onChange={() => handleOptionChange(idx, optIdx, isMulti)}
                                                                />
                                                                <span>{opt}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <textarea
                                                            className="w-full border rounded-md p-2"
                                                            rows={Math.min(6, Math.max(3, (q?.wordLimit ? Math.ceil(q.wordLimit / 40) : 3)))}
                                                            placeholder={q?.wordLimit ? `Answer (up to ${q.wordLimit} words)` : 'Answer'}
                                                            value={typeof a === 'string' ? a : ''}
                                                            onChange={(e) => handleTextChange(idx, e.target.value)}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-sm text-gray-600">No questions available for this test.</div>
                            )}
                        </div>
                        
                        <div className="rounded-md border p-4 bg-white">
                            <div className="text-sm text-gray-700 mb-2">Monitoring is active. Keep this tab focused.</div>
                            <div className="flex items-center gap-3">
                                <button
                                    disabled={submitting || result}
                                    onClick={handleSubmit}
                                    className="px-5 py-2 rounded-md bg-cyan-600 text-white disabled:opacity-50"
                                >
                                    {submitting ? 'Submitting...' : 'Submit Test'}
                                </button>
                                {result && (
                                    <span className="text-sm text-gray-700">Score: {result.score}% ({result.correct}/{result.total}). Redirecting…</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Camera and Monitoring Panel */}
                    <div className="space-y-3">
                        <div className="rounded-md border p-4 bg-white">
                            <h3 className="font-semibold mb-3">Live Monitoring</h3>
                            
                            {/* Camera Feed */}
                            <div className="mb-4">
                                <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
                                    <video
                                        ref={videoRef}
                                        className="w-full h-full object-cover"
                                        autoPlay
                                        muted
                                        playsInline
                                    />
                                    {!cameraActive && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                                            <div className="text-center">
                                                <div className="text-gray-500 mb-2">📹</div>
                                                <div className="text-sm text-gray-600">Starting camera...</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Face Detection Status */}
                                <div className="mt-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${
                                            facesDetected === 1 ? 'bg-green-500' : 
                                            facesDetected > 1 ? 'bg-yellow-500' : 
                                            'bg-red-500'
                                        }`}></div>
                                        <span>
                                            {facesDetected === 1 ? 'Face detected ✓' : 
                                             facesDetected > 1 ? 'Multiple faces detected ⚠' : 
                                             'No face detected ✗'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Monitoring Status */}
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>Screen sharing active</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>Audio monitoring active</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>Tab focus monitoring</span>
                                </div>
                            </div>
                        </div>

                        {/* Test Instructions */}
                        <div className="rounded-md border p-4 bg-blue-50">
                            <h3 className="font-semibold mb-2 text-blue-800">Test Instructions</h3>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• Keep your face visible to the camera</li>
                                <li>• Do not switch tabs or applications</li>
                                <li>• Ensure good lighting for face detection</li>
                                <li>• Test will auto-submit when time expires</li>
                                <li>• You can submit manually before time runs out</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}