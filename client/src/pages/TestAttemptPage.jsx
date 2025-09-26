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

    const [test, setTest] = useState(null);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);

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
                    const session = new ProctoringSession({ testId, stompClient: client });
                    sessionRef.current = session;
                    try {
                        await session.start();
                        try { await session.startScreen(); } catch (_) {}
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

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-semibold">Test Attempt</h1>
                <button onClick={handleExit} className="px-4 py-2 rounded-md bg-gray-800 text-white">Exit</button>
            </div>

            {loading && (
                <div className="text-gray-600">Loading test...</div>
            )}
            {error && (
                <div className="text-red-600 mb-4">{error}</div>
            )}
            {!loading && test && (
                <div className="space-y-3">
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
                        <div className="text-sm text-gray-700">Monitoring is active. Keep this tab focused.</div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            disabled={submitting}
                            onClick={async () => {
                                if (!test) return;
                                try {
                                    setSubmitting(true);
                                    setError('');
                                    // Convert answers object to ordered list by index aligned to questions
                                    const total = Array.isArray(test.questions) ? test.questions.length : 0;
                                    const ordered = new Array(total).fill(null);
                                    Object.keys(answers).forEach(k => {
                                        const idx = Number(k);
                                        if (!Number.isNaN(idx) && idx >= 0 && idx < total) ordered[idx] = answers[k];
                                    });
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
                                    // After showing score briefly, return to dashboard and pass success state for toast
                                    setTimeout(() => {
                                        navigate('/student', { state: { testSubmitted: true, score: data.score, correct: data.correct, total: data.total } });
                                    }, 1500);
                                } catch (e) {
                                    setError(e.message || 'Failed to submit');
                                } finally {
                                    setSubmitting(false);
                                }
                            }}
                            className="px-5 py-2 rounded-md bg-purple-600 text-white disabled:opacity-50"
                        >
                            {submitting ? 'Submitting...' : 'Submit Test'}
                        </button>
                        {result && (
                            <span className="text-sm text-gray-700">Score: {result.score}% ({result.correct}/{result.total}). Redirecting…</span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}


