"use client";

import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TabType } from './sidebar';
import { 
  BookOpen, 
  FileQuestion,
  User,
  Settings,
  PlusCircle,
  Award,
  Shield,
  GraduationCap
} from "lucide-react";

// Simple interface for tabs
interface TabContentProps {
  activeTab: TabType;
  userRole?: 'admin' | 'faculty' | 'student';
}

// Main TabContent component
export function TabContent({ activeTab, userRole = 'faculty' }: TabContentProps) {
  switch (activeTab) {
    case "overview":
      return <OverviewTab userRole={userRole} />;
    case "exams":
      return <ExamsTab userRole={userRole} />;
    case "questions":
      return <QuestionsTab />;
    case "students":
      return <StudentsTab />;
    case "results":
      return <ResultsTab userRole={userRole} />;
    case "settings":
      return <SettingsTab userRole={userRole} />;
    default:
      return <OverviewTab userRole={userRole} />;
  }
}

// Simple Overview Tab
function OverviewTab({ userRole }: { userRole?: 'admin' | 'faculty' | 'student' }) {
  const [passKeyModalOpen, setPassKeyModalOpen] = useState(false);
  const [generatedPassKey, setGeneratedPassKey] = useState('');
  
  // Function to generate a random pass key
  const generatePassKey = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setGeneratedPassKey(result);
    setPassKeyModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="md:w-2/3">
            <h1 className="text-2xl font-bold mb-2">
              {userRole === 'admin' ? 'Admin Dashboard' : 
               userRole === 'faculty' ? 'Faculty Dashboard' : 'Student Dashboard'}
            </h1>
            <p className="mb-4 text-muted-foreground">
              {userRole === 'admin' 
                ? 'Monitor all exams, manage users, and view comprehensive analytics.' 
                : userRole === 'faculty' 
                ? 'Create and manage exams, question banks, and view student performance.' 
                : 'Take exams, view results, and track your performance.'}
            </p>
            <Button className="gap-2">
              {userRole === 'student' ? <BookOpen className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
              {userRole === 'student' ? 'View Available Exams' : 'Create New Exam'}
            </Button>
          </div>
          <div className="md:w-1/3 flex justify-center">
            <div className="p-6 bg-primary/10 rounded-full">
              {userRole === 'admin' ? (
                <Shield className="h-16 w-16 text-primary" />
              ) : userRole === 'faculty' ? (
                <GraduationCap className="h-16 w-16 text-primary" />
              ) : (
                <User className="h-16 w-16 text-primary" />
              )}
            </div>
          </div>
        </div>
      </Card>
      
      {/* Admin-specific features */}
      {userRole === 'admin' && (
        <>
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Faculty Pass Key Management</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Generate one-time-use authentication codes to allow students to resume exams after security violations.
            </p>
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/3">
                  <label className="text-sm font-medium mb-1 block">Student</label>
                  <select className="w-full p-2 rounded-md border">
                    <option value="">Select Student</option>
                    <option value="student1">John Doe - CS101</option>
                    <option value="student2">Jane Smith - CS101</option>
                    <option value="student3">Bob Johnson - CS102</option>
                  </select>
                </div>
                <div className="w-full md:w-1/3">
                  <label className="text-sm font-medium mb-1 block">Exam</label>
                  <select className="w-full p-2 rounded-md border">
                    <option value="">Select Exam</option>
                    <option value="exam1">Midterm Computer Science</option>
                    <option value="exam2">Physics Quiz 3</option>
                    <option value="exam3">Mathematics Final</option>
                  </select>
                </div>
                <div className="w-full md:w-1/3">
                  <label className="text-sm font-medium mb-1 block">Violation Type</label>
                  <select className="w-full p-2 rounded-md border">
                    <option value="">Select Violation</option>
                    <option value="tab_switch">Tab Switching</option>
                    <option value="multiple_login">Multiple Login</option>
                    <option value="suspicious">Suspicious Activity</option>
                    <option value="technical">Technical Issue</option>
                  </select>
                </div>
              </div>
              <Button onClick={generatePassKey}>Generate Pass Key</Button>
            </div>
            
            {/* Pass Key Modal */}
            {passKeyModalOpen && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-background p-6 rounded-lg shadow-lg max-w-md w-full">
                  <h3 className="text-lg font-bold mb-2">Faculty Pass Key Generated</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Share this one-time-use code with the faculty member. It will expire in 30 minutes.
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-center mb-4">
                    <span className="text-2xl font-mono tracking-wider">{generatedPassKey}</span>
                  </div>
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setPassKeyModalOpen(false)}>Close</Button>
                    <Button>Copy to Clipboard</Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
          
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">User Mapping Dashboard</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Manage structured mapping of students and faculty based on subjects, classes, and exam permissions.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-4 text-left">Subject</th>
                    <th className="py-2 px-4 text-left">Class/Batch</th>
                    <th className="py-2 px-4 text-left">Faculty</th>
                    <th className="py-2 px-4 text-left">Students</th>
                    <th className="py-2 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-2 px-4">Computer Science</td>
                    <td className="py-2 px-4">CS101</td>
                    <td className="py-2 px-4">Prof. Johnson</td>
                    <td className="py-2 px-4">25 students</td>
                    <td className="py-2 px-4">
                      <Button variant="ghost" size="sm">View</Button>
                    </td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-2 px-4">Physics</td>
                    <td className="py-2 px-4">CS101, CS102</td>
                    <td className="py-2 px-4">Prof. Smith</td>
                    <td className="py-2 px-4">43 students</td>
                    <td className="py-2 px-4">
                      <Button variant="ghost" size="sm">View</Button>
                    </td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-2 px-4">Mathematics</td>
                    <td className="py-2 px-4">CS102</td>
                    <td className="py-2 px-4">Prof. Williams</td>
                    <td className="py-2 px-4">18 students</td>
                    <td className="py-2 px-4">
                      <Button variant="ghost" size="sm">View</Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              <Button variant="outline">Manage Mappings</Button>
            </div>
          </Card>
          
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Recent Security Violations</h2>
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-red-50 dark:bg-red-900/10">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold">Tab Switching Detected</h3>
                    <p className="text-sm text-muted-foreground">John Doe (CS101) - Midterm Computer Science</p>
                    <p className="text-xs text-muted-foreground mt-1">Today, 10:15 AM</p>
                  </div>
                  <Button variant="outline" size="sm">Issue Pass Key</Button>
                </div>
              </div>
              <div className="border rounded-lg p-4 bg-red-50 dark:bg-red-900/10">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold">Multiple Login Attempt</h3>
                    <p className="text-sm text-muted-foreground">Jane Smith (CS101) - Physics Quiz 3</p>
                    <p className="text-xs text-muted-foreground mt-1">Today, 9:45 AM</p>
                  </div>
                  <Button variant="outline" size="sm">Issue Pass Key</Button>
                </div>
              </div>
              <div className="border rounded-lg p-4 bg-red-50 dark:bg-red-900/10">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold">Suspicious Activity</h3>
                    <p className="text-sm text-muted-foreground">Bob Johnson (CS102) - Mathematics Final</p>
                    <p className="text-xs text-muted-foreground mt-1">Yesterday, 2:30 PM</p>
                  </div>
                  <Button variant="outline" size="sm">Issue Pass Key</Button>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Button variant="outline">View All Violations</Button>
            </div>
          </Card>
        </>
      )}
      
      <div className="text-center p-12 text-muted-foreground">
        Dashboard content for {userRole} role
      </div>
    </div>
  );
}

// Simple placeholders for other tabs
function ExamsTab({ userRole }: { userRole?: 'admin' | 'faculty' | 'student' }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        {userRole === 'student' ? 'Available Exams' : 'Manage Exams'}
      </h1>
      <div className="flex flex-col gap-4">
        {userRole !== 'student' && (
          <Button className="w-fit gap-2">
            <PlusCircle className="h-4 w-4" />
            Create Exam
          </Button>
        )}
      </div>
    </div>
  );
}

function QuestionsTab() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Question Bank</h1>
      <Button className="w-fit gap-2">
        <PlusCircle className="h-4 w-4" />
        Add Question
      </Button>
    </div>
  );
}

function StudentsTab() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Student Management</h1>
    </div>
  );
}

function ResultsTab({ userRole }: { userRole?: 'admin' | 'faculty' | 'student' }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        {userRole === 'student' ? 'My Results' : 'Exam Results'}
      </h1>
    </div>
  );
}

function SettingsTab({ userRole }: { userRole?: 'admin' | 'faculty' | 'student' }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
    </div>
  );
} 