import React, { useState, useEffect } from 'react';
import { Book, Code, Cpu, Database, Network, Server, Brain, Globe, ShieldCheck, Link as LinkIcon, BarChart2, Bot, Fingerprint, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Subject configuration with icons and colors
const subjectsConfig = [
  { name: "Software Development", icon: <Code size={32} />, color: "bg-blue-500" },
  { name: "Data Structures & Algorithms", icon: <BarChart2 size={32} />, color: "bg-green-500" },
  { name: "Database Management Systems", icon: <Database size={32} />, color: "bg-red-500" },
  { name: "Networking", icon: <Network size={32} />, color: "bg-yellow-500" },
  { name: "Operating Systems", icon: <Cpu size={32} />, color: "bg-indigo-500" },
  { name: "AI & ML", icon: <Brain size={32} />, color: "bg-pink-500" },
  { name: "Web Development", icon: <Globe size={32} />, color: "bg-cyan-500" },
  { name: "App Development", icon: <Bot size={32} />, color: "bg-teal-500" },
  { name: "Cloud Computing & DevOps", icon: <Server size={32} />, color: "bg-cyan-500" },
  { name: "Blockchain & Cryptocurrency", icon: <LinkIcon size={32} />, color: "bg-orange-500" },
  { name: "Data Science & Big Data Analytics", icon: <BarChart2 size={32} />, color: "bg-lime-500" },
  { name: "Internet of Things (IoT)", icon: <Bot size={32} />, color: "bg-fuchsia-500" },
  { name: "Ethical Hacking", icon: <ShieldCheck size={32} />, color: "bg-rose-500" },
  { name: "Mathematics", icon: <Book size={32} />, color: "bg-emerald-500" },
  { name: "Physics", icon: <Cpu size={32} />, color: "bg-slate-500" },
  { name: "Chemistry", icon: <Bot size={32} />, color: "bg-amber-500" },
  { name: "Biology", icon: <Brain size={32} />, color: "bg-green-600" },
  { name: "Science", icon: <Globe size={32} />, color: "bg-blue-600" },
];


export default function SubjectsPage() {
  const { token } = useAuth();
  const [subjectsData, setSubjectsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch test count for a specific subject
  const fetchTestCountForSubject = async (subjectName) => {
    try {
      const response = await fetch(`/api/tests/subject/${encodeURIComponent(subjectName)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn(`Failed to fetch tests for ${subjectName}:`, response.status);
        return 0;
      }

      const tests = await response.json();
      return tests.length;
    } catch (err) {
      console.warn(`Error fetching tests for ${subjectName}:`, err);
      return 0;
    }
  };

  // Function to fetch all subject test counts
  const fetchAllSubjectTestCounts = async () => {
    if (!token) {
      setError('No authentication token found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('SubjectsPage: Fetching test counts for all subjects...');
      
      // Fetch test counts for all subjects in parallel
      const testCountPromises = subjectsConfig.map(async (subject) => {
        const testCount = await fetchTestCountForSubject(subject.name);
        return {
          ...subject,
          tests: testCount
        };
      });

      const subjectsWithCounts = await Promise.all(testCountPromises);
      
      // Sort subjects by test count (descending) to show most active subjects first
      subjectsWithCounts.sort((a, b) => b.tests - a.tests);
      
      setSubjectsData(subjectsWithCounts);
      console.log('SubjectsPage: Successfully fetched test counts for all subjects');
    } catch (err) {
      console.error('SubjectsPage: Error fetching subject test counts:', err);
      setError('Failed to load subject data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllSubjectTestCounts();
  }, [token]);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-800">Subjects Overview</h1>
            <p className="mt-2 text-lg text-gray-500">
              A summary of all tests created across different subjects.
            </p>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
            <span className="ml-3 text-lg text-gray-600">Loading subjects...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-800">Subjects Overview</h1>
            <p className="mt-2 text-lg text-gray-500">
              A summary of all tests created across different subjects.
            </p>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <p className="text-red-600 text-lg mb-4">{error}</p>
              <button 
                onClick={fetchAllSubjectTestCounts}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800">Subjects Overview</h1>
          <p className="mt-2 text-lg text-gray-500">
            A summary of all tests created across different subjects.
          </p>
          
          {/* Create New Test Button */}
          <div className="mt-6 flex justify-center">
            <Link
              to="/teacher/create-test"
              className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-700 transition-colors shadow-md hover:shadow-lg"
            >
              <Plus size={20} />
              Create New Test
            </Link>
          </div>
        </div>

        {/* Grid of Subject Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {subjectsData.map((subject) => (
            <Link 
              to={`/teacher/subjects/${encodeURIComponent(subject.name)}`} 
              key={subject.name}
              className="group bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out cursor-pointer"
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white mb-4 ${subject.color} transition-transform duration-300 group-hover:scale-110`}>
                {subject.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{subject.name}</h3>
              <p className="text-2xl font-bold text-cyan-600">{subject.tests}</p>
              <p className="text-sm text-gray-500">Tests Created</p>
              {subject.tests > 0 && (
                <p className="text-xs text-green-600 mt-2 font-medium">Active Subject</p>
              )}
            </Link>
          ))}
        </div>

        {/* Show message if no tests found */}
        {subjectsData.length === 0 && (
          <div className="text-center mt-12">
            <p className="text-gray-500 text-lg">No subjects with tests found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
