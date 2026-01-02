import React from "react";
import { BookOpen } from "lucide-react";

const subjects = [
  { name: "Networking", tests: 1, active: true, link: "https://en.wikipedia.org/wiki/Computer_network" },
  { name: "Mathematics", tests: 1, active: true, link: "https://en.wikipedia.org/wiki/Mathematics" },
  { name: "Software Development", tests: 0, active: false, link: "https://en.wikipedia.org/wiki/Software_development" },
  { name: "Data Structures & Algorithms", tests: 0, active: false, link: "https://en.wikipedia.org/wiki/Data_structure" },
  { name: "Database Management Systems", tests: 0, active: false, link: "https://en.wikipedia.org/wiki/Database_management_system" },
  { name: "Operating Systems", tests: 0, active: false, link: "https://en.wikipedia.org/wiki/Operating_system" },
  { name: "AI & ML", tests: 0, active: false, link: "https://en.wikipedia.org/wiki/Artificial_intelligence" },
  { name: "Web Development", tests: 0, active: false, link: "https://en.wikipedia.org/wiki/Web_development" },
  { name: "App Development", tests: 0, active: false, link: "https://en.wikipedia.org/wiki/Mobile_app_development" },
  { name: "Cloud Computing & DevOps", tests: 0, active: false, link: "https://en.wikipedia.org/wiki/Cloud_computing" },
  { name: "Blockchain & Cryptocurrency", tests: 0, active: false, link: "https://en.wikipedia.org/wiki/Blockchain" },
  { name: "Data Science & Big Data Analytics", tests: 0, active: false, link: "https://en.wikipedia.org/wiki/Data_science" },
  { name: "Internet of Things (IoT)", tests: 0, active: false, link: "https://en.wikipedia.org/wiki/Internet_of_things" },
  { name: "Ethical Hacking", tests: 0, active: false, link: "https://en.wikipedia.org/wiki/Ethical_hacking" },
  { name: "Physics", tests: 0, active: false, link: "https://en.wikipedia.org/wiki/Physics" },
  { name: "Chemistry", tests: 0, active: false, link: "https://en.wikipedia.org/wiki/Chemistry" },
  { name: "Biology", tests: 0, active: false, link: "https://en.wikipedia.org/wiki/Biology" },
  { name: "Science", tests: 0, active: false, link: "https://en.wikipedia.org/wiki/Science" },
];

export default function StudentCourses() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        My Courses
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {subjects.map((subject, index) => (
          <div
            key={index}
            className="bg-white border rounded-xl shadow-sm p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-200"
          >
            <div className="flex items-center gap-3 mb-3">
              <BookOpen className="w-6 h-6 text-cyan-600" />
              <h2 className="text-lg font-semibold text-gray-800">
                {subject.name}
              </h2>
            </div>

            <div className="text-gray-600 text-sm">
              <p>
                <span className="font-medium">{subject.tests}</span> Tests Created
              </p>
              <p>
                Active Subject:{" "}
                <span
                  className={`font-medium ${
                    subject.active ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  {subject.active ? "Yes" : "No"}
                </span>
              </p>
            </div>

            <div className="mt-4">
              <button
                onClick={() => window.open(subject.link, "_blank")}
                className="w-full bg-cyan-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-cyan-700 transition-colors"
              >
                Learn
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
