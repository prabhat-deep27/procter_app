import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { BookOpen, Clock, Users, Calendar, Star, Play, Download, Eye, ArrowLeft, Search, Filter } from 'lucide-react';

// Sample course data - in a real app, this would come from an API
const sampleCourses = [
  {
    id: 1,
    title: "Introduction to Computer Science",
    instructor: "Dr. Sarah Johnson",
    subject: "Computer Science",
    duration: "12 weeks",
    enrolledStudents: 45,
    rating: 4.8,
    status: "active",
    startDate: "2024-01-15",
    endDate: "2024-04-15",
    description: "Learn the fundamentals of computer science including algorithms, data structures, and programming concepts.",
    progress: 75,
    nextClass: "2024-02-20",
    materials: ["Syllabus", "Lecture Notes", "Assignments", "Practice Tests"]
  },
  {
    id: 2,
    title: "Web Development Fundamentals",
    instructor: "Prof. Michael Chen",
    subject: "Web Development",
    duration: "8 weeks",
    enrolledStudents: 32,
    rating: 4.6,
    status: "active",
    startDate: "2024-02-01",
    endDate: "2024-03-30",
    description: "Master HTML, CSS, JavaScript and modern web development frameworks.",
    progress: 45,
    nextClass: "2024-02-22",
    materials: ["Course Outline", "Code Examples", "Projects", "Resources"]
  },
  {
    id: 3,
    title: "Data Structures and Algorithms",
    instructor: "Dr. Emily Rodriguez",
    subject: "Computer Science",
    duration: "16 weeks",
    enrolledStudents: 28,
    rating: 4.9,
    status: "upcoming",
    startDate: "2024-03-01",
    endDate: "2024-06-30",
    description: "Deep dive into advanced data structures and algorithm design techniques.",
    progress: 0,
    nextClass: "2024-03-01",
    materials: ["Prerequisites", "Textbook", "Practice Problems"]
  },
  {
    id: 4,
    title: "Database Management Systems",
    instructor: "Prof. David Kim",
    subject: "Database Management",
    duration: "10 weeks",
    enrolledStudents: 38,
    rating: 4.7,
    status: "completed",
    startDate: "2023-09-01",
    endDate: "2023-11-15",
    description: "Learn SQL, database design, and management systems.",
    progress: 100,
    nextClass: null,
    materials: ["Final Project", "Certification", "References"]
  }
];

export default function StudentCourses({ onBack }) {
  const { user, token } = useAuth();
  const [courses, setCourses] = useState(sampleCourses);
  const [filteredCourses, setFilteredCourses] = useState(sampleCourses);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Filter courses based on search term and status
  useEffect(() => {
    let filtered = courses;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(course => course.status === filterStatus);
    }

    setFilteredCourses(filtered);
  }, [searchTerm, filterStatus, courses]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <Play className="w-4 h-4" />;
      case 'upcoming': return <Calendar className="w-4 h-4" />;
      case 'completed': return <Star className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const CourseCard = ({ course }) => (
    <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">{course.title}</h3>
          <p className="text-sm text-gray-600 mb-2">by {course.instructor}</p>
          <p className="text-sm text-gray-500">{course.description}</p>
        </div>
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}>
          {getStatusIcon(course.status)}
          <span className="capitalize">{course.status}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>{course.duration}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>{course.enrolledStudents} students</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Star className="w-4 h-4 text-yellow-500" />
          <span>{course.rating}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{course.startDate}</span>
        </div>
      </div>

      {/* Progress Bar */}
      {course.status === 'active' && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{course.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${course.progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setSelectedCourse(course)}
          className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
        >
          <Eye className="w-4 h-4" />
          View Details
        </button>
        {course.status === 'active' && (
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2">
            <Play className="w-4 h-4" />
            Continue
          </button>
        )}
        {course.status === 'completed' && (
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Certificate
          </button>
        )}
      </div>
    </div>
  );

  const CourseDetailModal = ({ course, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">{course.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Course Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Instructor</h3>
                <p className="text-gray-600">{course.instructor}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Subject</h3>
                <p className="text-gray-600">{course.subject}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Duration</h3>
                <p className="text-gray-600">{course.duration}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Enrolled Students</h3>
                <p className="text-gray-600">{course.enrolledStudents}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Rating</h3>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-gray-600">{course.rating}</span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Status</h3>
                <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}>
                  {getStatusIcon(course.status)}
                  <span className="capitalize">{course.status}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
              <p className="text-gray-600">{course.description}</p>
            </div>

            {/* Schedule */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Schedule</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="text-gray-600">{course.startDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">End Date</p>
                  <p className="text-gray-600">{course.endDate}</p>
                </div>
                {course.nextClass && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Next Class</p>
                    <p className="text-gray-600">{course.nextClass}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Course Materials */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Course Materials</h3>
              <div className="grid grid-cols-2 gap-2">
                {course.materials.map((material, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <Download className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{material}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress (if active) */}
            {course.status === 'active' && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Your Progress</h3>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Course Completion</span>
                  <span>{course.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-purple-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              {course.status === 'active' && (
                <button className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                  <Play className="w-5 h-5" />
                  Continue Learning
                </button>
              )}
              {course.status === 'upcoming' && (
                <button className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Set Reminder
                </button>
              )}
              {course.status === 'completed' && (
                <button className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" />
                  Download Certificate
                </button>
              )}
              <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                Add to Favorites
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="text-sm font-medium">Back to Dashboard</span>
            </button>
          )}
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">My Courses</h1>
        <p className="text-gray-600">Manage and access all your enrolled courses</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search courses, instructors, or subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">All Courses</option>
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Course Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Courses</p>
              <p className="text-2xl font-bold text-gray-800">{courses.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Play className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-bold text-gray-800">{courses.filter(c => c.status === 'active').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Upcoming</p>
              <p className="text-2xl font-bold text-gray-800">{courses.filter(c => c.status === 'upcoming').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Star className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-gray-800">{courses.filter(c => c.status === 'completed').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {/* No Results */}
      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No courses found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Course Detail Modal */}
      {selectedCourse && (
        <CourseDetailModal 
          course={selectedCourse} 
          onClose={() => setSelectedCourse(null)} 
        />
      )}
    </div>
  );
}
