"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the role selection page
    router.replace("/register/role");
  }, [router]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Redirecting to registration...</p>
    </div>
  );
} 