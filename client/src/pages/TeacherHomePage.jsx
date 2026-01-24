import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../Components/ui/card';
import { Button } from '../Components/ui/button';
// We are replacing TestCard, so we can remove this import if it's not used elsewhere.
// import TestCard from '../Components/TestCard'; 
import ProctoringPanel from '../Components/ProctoringPanel';

const TeacherHomePage = () => {

  return (
    <div className="flex flex-col lg:flex-row flex-1 p-4 lg:p-8 gap-8">
      {/* --- EDITED SECTION STARTS HERE --- */}
      <div className="lg:flex-shrink-0">
        {/* This Card replaces the old <TestCard /> component */}
        <Card className="p-6 flex flex-col items-start gap-4 bg-white w-full lg:w-80">
          <h3 className="text-xl font-semibold text-gray-800">Create New Test</h3>
          <p className="text-gray-500">Write a new test: Biology and others</p>
          
          {/* This is the new button you wanted to add */}
          <Link to="/teacher/create-test" className="w-full mt-4">
            <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3">
              + Create New Test
            </Button>
          </Link>
        </Card>
      </div>
      {/* --- EDITED SECTION ENDS HERE --- */}

      <div className="flex-1 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Tests</p>
                <p className="text-2xl font-bold text-blue-800">12</p>
              </div>
              <div className="text-3xl">📝</div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Active Students</p>
                <p className="text-2xl font-bold text-green-800">45</p>
              </div>
              <div className="text-3xl">👥</div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-r from-cyan-50 to-cyan-100 border-cyan-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-600 text-sm font-medium">Avg Score</p>
                <p className="text-2xl font-bold text-cyan-800">78%</p>
              </div>
              <div className="text-3xl">📊</div>
            </div>
          </Card>
        </div>

        {/* Recent Tests */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Tests</h3>
            <Link to="/teacher/saved-tests">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">Mathematics Quiz</div>
                <div className="text-sm text-gray-600">25 students • Avg: 82%</div>
              </div>
              <div className="text-sm text-gray-500">2 hours ago</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">Science Test</div>
                <div className="text-sm text-gray-600">18 students • Avg: 76%</div>
              </div>
              <div className="text-sm text-gray-500">1 day ago</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">English Assignment</div>
                <div className="text-sm text-gray-600">32 students • Avg: 85%</div>
              </div>
              <div className="text-sm text-gray-500">3 days ago</div>
            </div>
          </div>
        </Card>

        {/* Proctoring Panel */}
        <ProctoringPanel />
      </div>
    </div>
  );
};

export default TeacherHomePage;
