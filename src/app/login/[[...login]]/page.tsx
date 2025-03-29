"use client";

import { useState, useEffect } from "react";
import { SignIn } from "@clerk/nextjs";
import { UserRole } from "@/lib/auth";
import { useSearchParams } from "next/navigation";

export default function Page() {
    const searchParams = useSearchParams();
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Check for error message in URL
        const errorMsg = searchParams.get("error");
        if (errorMsg) {
            setError(decodeURIComponent(errorMsg));
        }
    }, [searchParams]);

    const handleRoleSelect = (role: UserRole) => {
        // Store the selected role in localStorage so we can check it after login
        if (typeof window !== 'undefined') {
            localStorage.setItem("loginRole", role);
        }
        setSelectedRole(role);
    };

    if (selectedRole) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="mb-6 p-3 bg-blue-50 text-blue-700 rounded-md w-full max-w-md text-center">
                    Logging in as: <strong className="font-bold">{selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}</strong>
                    <button 
                        onClick={() => setSelectedRole(null)}
                        className="ml-2 text-sm underline hover:no-underline"
                    >
                        Change
                    </button>
                </div>
                <SignIn
                    path="/login"
                    routing="path"
                    signUpUrl="/register"
                    redirectUrl="/dashboard"
                    appearance={{
                        elements: {
                            formButtonPrimary: 
                                "bg-blue-600 hover:bg-blue-700 text-sm normal-case",
                        },
                    }}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-md p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
                {error && (
                    <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                        {error}
                    </div>
                )}
                
                <h1 className="text-2xl font-bold mb-6 text-center">Log in as</h1>
                
                <div className="space-y-4">
                    <button
                        onClick={() => handleRoleSelect("student")}
                        className="w-full p-4 flex items-center space-x-3 border rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                            S
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="font-medium">Student</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Access your exams and view your results
                            </p>
                        </div>
                    </button>
                    
                    <button
                        onClick={() => handleRoleSelect("faculty")}
                        className="w-full p-4 flex items-center space-x-3 border rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400 font-bold">
                            F
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="font-medium">Faculty</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Create and manage exams, review student performance
                            </p>
                        </div>
                    </button>
                    
                    <button
                        onClick={() => handleRoleSelect("admin")}
                        className="w-full p-4 flex items-center space-x-3 border rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold">
                            A
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="font-medium">Admin</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Full platform access and management
                            </p>
                        </div>
                    </button>
                </div>
                
                <div className="mt-6 text-center text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Don't have an account?</span>{" "}
                    <a href="/register" className="text-blue-600 hover:underline">
                        Sign up
                    </a>
                </div>
            </div>
        </div>
    );
}