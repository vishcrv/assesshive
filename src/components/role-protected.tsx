"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { UserRole } from "@/lib/auth";
import { AccessDenied } from "./access-denied";

interface RoleProtectedProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
}

export function RoleProtected({ 
  children, 
  allowedRoles,
  fallback
}: RoleProtectedProps) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [role, setRole] = useState<UserRole | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (isLoaded) {
      if (!user) {
        // User is not logged in, redirect to login
        router.push("/login");
        return;
      }

      // Get role from either unsafeMetadata or publicMetadata
      // @ts-ignore - Clerk's types might not be up to date
      const userRole = (user.unsafeMetadata?.role as UserRole) || (user.publicMetadata?.role as UserRole);
      setRole(userRole);

      // If no role is set, redirect to role selection
      if (!userRole) {
        router.push("/role-select");
        return;
      }

      // Check if user has access based on their role
      setHasAccess(allowedRoles.includes(userRole));
    }
  }, [user, isLoaded, router, allowedRoles]);

  // Show loading state while checking access
  if (!isLoaded || hasAccess === null || role === null) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <p>Loading...</p>
      </div>
    );
  }

  // If user doesn't have access, show access denied component
  if (!hasAccess) {
    if (fallback) return <>{fallback}</>;
    return <AccessDenied userRole={role} requiredRoles={allowedRoles} />;
  }

  // User has access, render children
  return <>{children}</>;
} 