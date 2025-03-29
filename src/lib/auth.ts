import { currentUser } from "@clerk/nextjs/server";

export type UserRole = 'admin' | 'faculty' | 'student';

// Get the user's role from Clerk metadata
export async function getUserRole(): Promise<UserRole | null> {
  const user = await currentUser();
  
  if (!user) return null;
  
  // Check both unsafeMetadata and publicMetadata for the role
  // @ts-ignore - Clerk's types might not be up to date
  const role = (user.unsafeMetadata?.role as UserRole) || (user.publicMetadata?.role as UserRole);
  
  if (!role || !['admin', 'faculty', 'student'].includes(role)) {
    return null;
  }
  
  return role;
}

// Check if a user has access to a specific route based on their role
export async function hasAccess(allowedRoles: UserRole[]): Promise<boolean> {
  const role = await getUserRole();
  
  if (!role) return false;
  
  return allowedRoles.includes(role);
}

// This can be used to verify access in server components or API routes
export async function verifyAccess(allowedRoles: UserRole[]): Promise<{ allowed: boolean; role: UserRole | null }> {
  const role = await getUserRole();
  
  return {
    allowed: role ? allowedRoles.includes(role) : false,
    role,
  };
}

// This function creates an error message based on the user's role and the allowed roles
export function getRoleErrorMessage(userRole: UserRole | null, allowedRoles: UserRole[]): string {
  if (!userRole) {
    return "You must be logged in to access this page.";
  }
  
  const roleDisplay = {
    admin: "an Admin",
    faculty: "a Faculty member",
    student: "a Student"
  };
  
  const allowedRolesDisplay = allowedRoles.map(role => roleDisplay[role]).join(" or ");
  
  return `Access denied. You are logged in as ${roleDisplay[userRole]}, but this page requires ${allowedRolesDisplay} access.`;
} 