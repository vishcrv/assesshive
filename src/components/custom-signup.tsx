"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserRole } from "@/lib/auth";

export function CustomSignUp() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("student");

  const handleRoleSelect = () => {
    // Store the selected role in localStorage to access after Clerk signup
    localStorage.setItem("selectedRole", role);
    
    // Redirect to the Clerk signup page - now using signup instead of register
    // because Clerk's catch-all route is still at /signup
    router.push("/signup/clerk");
  };

  return (
    <div className="w-full max-w-md p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">Select Your Role</h1>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium block">
            I am a:
          </label>
          
          <div className="space-y-3">
            <label className="flex items-start space-x-3 p-4 border rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
              <input
                type="radio"
                name="role"
                value="student"
                checked={role === "student"}
                onChange={() => setRole("student")}
                className="mt-1"
              />
              <div>
                <p className="font-medium">Student</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Access exams, submit answers, and view your results
                </p>
              </div>
            </label>
            
            <label className="flex items-start space-x-3 p-4 border rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
              <input
                type="radio"
                name="role"
                value="faculty"
                checked={role === "faculty"}
                onChange={() => setRole("faculty")}
                className="mt-1"
              />
              <div>
                <p className="font-medium">Faculty</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Create exams, manage questions, and review student performance
                </p>
              </div>
            </label>
            
            <label className="flex items-start space-x-3 p-4 border rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
              <input
                type="radio"
                name="role"
                value="admin"
                checked={role === "admin"}
                onChange={() => setRole("admin")}
                className="mt-1"
              />
              <div>
                <p className="font-medium">Admin</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Full access to manage the platform, users, and all content
                </p>
              </div>
            </label>
          </div>
        </div>
        
        <button
          onClick={handleRoleSelect}
          className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
        >
          Continue to Sign Up
        </button>
        
        <div className="text-center text-sm">
          <span className="text-gray-500 dark:text-gray-400">Already have an account?</span>{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Log in
          </a>
        </div>
      </div>
    </div>
  );
} 