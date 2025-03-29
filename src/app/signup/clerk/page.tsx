"use client";

import { SignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ClerkSignUpPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  useEffect(() => {
    // Get the role from localStorage
    const role = localStorage.getItem("selectedRole");
    
    // If no role was selected, redirect back to role selection
    if (!role) {
      router.push("/register");
      return;
    }

    setSelectedRole(role);
  }, [router]);

  if (!selectedRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen my-10">
      <div className="mb-6 p-3 bg-blue-50 text-blue-700 rounded-md w-full max-w-md text-center">
        Signing up as: <strong className="font-bold">
          {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
        </strong>
        <button 
          onClick={() => {
            localStorage.removeItem("selectedRole");
            router.push("/register");
          }}
          className="ml-2 text-sm underline hover:no-underline"
        >
          Change
        </button>
      </div>
      
      <SignUp
        path="/signup/clerk"
        routing="path"
        signInUrl="/login"
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