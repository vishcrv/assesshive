"use client";

import { Sidebar } from "./components/sidebar";
import { TabContent } from "./components/dashboard-components";
import { TopBar } from "./components/top-bar";
import { useState, useEffect } from "react";
import { TabType } from "./components/sidebar";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { UserRole } from "@/lib/auth";
import { LoginRoleCheck } from "@/components/login-middleware";

export default function DashboardRedirect() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    // Get role from Clerk user metadata
    if (isLoaded && user) {
      // Check if we have a role from the custom signup
      const localRole = typeof window !== 'undefined' ? localStorage.getItem("selectedRole") as UserRole : null;
      
      // @ts-ignore - Clerk's types might not be up to date
      const storedRole = (user.unsafeMetadata?.role as UserRole) || (user.publicMetadata?.role as UserRole);
      
      // If no stored role but we have a locally selected one, set it in the metadata
      if (!storedRole && localRole) {
        console.log("Setting user role from localStorage:", localRole);
        // Update the user's metadata with the role from localStorage
        user.update({
          // @ts-ignore - Clerk's types might not be up to date
          unsafeMetadata: {
            role: localRole,
          },
        }).then(() => {
          // After setting the role, remove it from localStorage
          localStorage.removeItem("selectedRole");
          // Redirect based on role
          redirectBasedOnRole(localRole);
        }).catch(error => {
          console.error("Error setting user role:", error);
          localStorage.removeItem("selectedRole"); // Clear to avoid infinite loop
          router.push("/role-select");
        });
        return;
      }
      
      // If we have a stored role, redirect based on it
      if (storedRole) {
        redirectBasedOnRole(storedRole);
        return;
      }
      
      // If no role found, check if we're coming from signup
      const comingFromSignup = document.referrer.includes('/signup') || document.referrer.includes('/register');
      if (comingFromSignup) {
        // Show a message and redirect to role selection
        console.error("No role selected during signup. Redirecting to role selection.");
        router.push("/register");
        return;
      }
      
      // If no role at all, redirect to role selection page
      router.push("/role-select");
    }
  }, [user, isLoaded, router]);
  
  // Function to redirect based on user role
  const redirectBasedOnRole = (role: UserRole) => {
    switch (role) {
      case "faculty":
        router.push("/dashboard/faculty");
        break;
      case "student":
        router.push("/dashboard/student");
        break;
      case "admin":
        router.push("/dashboard/admin");
        break;
      default:
        router.push("/role-select");
    }
  };

  // Show loading indicator while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Loading your dashboard...</p>
    </div>
  );
}
  