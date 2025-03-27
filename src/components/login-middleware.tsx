"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { UserRole } from "@/lib/auth";

// This component should be added to the dashboard page
// It checks if the user's role matches the role they selected at login
export function LoginRoleCheck() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      // Check if we have a role from the login selection
      const selectedRole = localStorage.getItem("loginRole") as UserRole;
      if (!selectedRole) return; // No login role selected
      
      // Get the user's stored role
      // @ts-ignore - Clerk's types might not be up to date
      const userRole = (user.unsafeMetadata?.role as UserRole) || (user.publicMetadata?.role as UserRole);
      
      // If the roles don't match, show an error and redirect back to login
      if (userRole && selectedRole && userRole !== selectedRole) {
        // Clear the selected role
        localStorage.removeItem("loginRole");
        
        // Redirect to login with error message
        const encodedMessage = encodeURIComponent(
          `This account is registered as ${userRole}. Please log in with the correct role.`
        );
        
        router.push(`/login?error=${encodedMessage}`);
      } else {
        // Roles match or no role set, remove login role from storage
        localStorage.removeItem("loginRole");
      }
    }
  }, [user, isLoaded, router]);

  // This component doesn't render anything
  return null;
} 