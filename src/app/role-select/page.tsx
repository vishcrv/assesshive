"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { UserRole } from "@/lib/auth";

export default function RoleSelect() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isLoaded || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  const handleRoleSelection = async () => {
    if (!selectedRole) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Try to update metadata using Clerk's JS API
      // @ts-ignore - Clerk's types might not be up to date
      await user.update({
        unsafeMetadata: {
          role: selectedRole,
        },
      });
      
      // Redirect to dashboard after successful role selection
      router.push("/dashboard");
    } catch (err) {
      console.error("Error setting user role:", err);
      setError("Failed to set user role. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-md shadow-lg bg-white dark:bg-slate-800 rounded-lg overflow-hidden">
        <div className="text-center p-6 border-b">
          <h1 className="text-2xl font-bold">Select Your Role</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Choose the role that best describes you to access the appropriate features.
          </p>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {/* Student Role */}
            <label className="flex items-start space-x-3 p-4 border rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
              <input
                type="radio"
                name="role"
                value="student"
                checked={selectedRole === "student"}
                onChange={() => setSelectedRole("student")}
                className="mt-1"
              />
              <div>
                <p className="font-medium">Student</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Access exams, submit answers, and view your results.
                </p>
              </div>
            </label>
            
            {/* Faculty Role */}
            <label className="flex items-start space-x-3 p-4 border rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
              <input
                type="radio"
                name="role"
                value="faculty"
                checked={selectedRole === "faculty"}
                onChange={() => setSelectedRole("faculty")}
                className="mt-1"
              />
              <div>
                <p className="font-medium">Faculty</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Create exams, manage questions, and review student performance.
                </p>
              </div>
            </label>
            
            {/* Admin Role */}
            <label className="flex items-start space-x-3 p-4 border rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
              <input
                type="radio"
                name="role"
                value="admin"
                checked={selectedRole === "admin"}
                onChange={() => setSelectedRole("admin")}
                className="mt-1"
              />
              <div>
                <p className="font-medium">Admin</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Full access to manage the platform, users, and all content.
                </p>
              </div>
            </label>
          </div>
          
          {error && (
            <div className="text-red-500 text-sm mt-4 p-2 bg-red-50 dark:bg-red-900/20 rounded">
              {error}
            </div>
          )}
        </div>
        
        <div className="p-6 border-t">
          <button 
            className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleRoleSelection}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Setting role..." : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
} 