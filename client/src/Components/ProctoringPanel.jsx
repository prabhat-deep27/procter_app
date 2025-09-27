import React, { useState, useEffect } from 'react';
import { createStompClient, subscribeToTestEvents } from '../lib/stompClient';

const ProctoringPanel = () => {
  const [events, setEvents] = useState([]);
  const [testId, setTestId] = useState("");

  useEffect(() => {
    if (!testId) return;
    const client = createStompClient();
    client.onConnect = () => {
      subscribeToTestEvents(client, testId, (evt) => {
        setEvents((prev) => [evt, ...prev].slice(0, 200));
      });
    };
    client.activate();
    return () => client.deactivate();
  }, [testId]);

  return (
    <div className="rounded-xl border bg-white p-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <span className="mr-2">👁️</span>
        Live Proctoring
      </h3>
      <div className="flex items-center gap-2 mb-3">
        <input
          placeholder="Enter Test ID to monitor"
          value={testId}
          onChange={(e) => setTestId(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        />
      </div>
      <div className="h-80 overflow-auto space-y-2">
        {events.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">🔍</div>
            <p>Enter a test ID to start monitoring</p>
          </div>
        ) : (
          events.map((e, idx) => (
            <div key={idx} className="text-sm text-gray-800 border-b pb-2">
              <span className="font-semibold">{e.type}</span>: {JSON.stringify(e)}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProctoringPanel;
