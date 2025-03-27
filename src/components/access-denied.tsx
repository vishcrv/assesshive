import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserRole } from "@/lib/auth";

interface AccessDeniedProps {
  userRole: UserRole;
  requiredRoles: UserRole[];
}

export function AccessDenied({ userRole, requiredRoles }: AccessDeniedProps) {
  const roleDisplay = {
    admin: "an Administrator",
    faculty: "a Faculty member",
    student: "a Student"
  };

  const allowedRolesDisplay = requiredRoles.map(role => roleDisplay[role]).join(" or ");

  return (
    <div className="flex flex-col items-center justify-center h-[70vh] p-6 text-center">
      <div className="rounded-full bg-yellow-100 p-4 mb-4">
        <AlertTriangle className="h-12 w-12 text-yellow-600" />
      </div>
      <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
      <p className="text-lg mb-6 max-w-md">
        You are logged in as <span className="font-semibold">{roleDisplay[userRole]}</span>, but this area requires {allowedRolesDisplay} access.
      </p>
      <div className="space-x-4">
        <Button asChild>
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    </div>
  );
} 