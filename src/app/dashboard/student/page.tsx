"use client";

import { Sidebar } from "../components/sidebar";
import { MainContentTabContent } from "../components/main-content";
import { TopBar } from "../components/top-bar";
import { useState, useEffect, Suspense } from "react";
import { TabType } from "../components/sidebar";
import { useSearchParams, useRouter } from "next/navigation";
import { RoleProtected } from "@/components/role-protected";
import { LoginRoleCheck } from "@/components/login-middleware";

// Create a client component that uses searchParams
function StudentDashboardContent() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Set active tab from URL parameter
    const tab = searchParams.get("tab") as TabType;
    if (tab && ["overview", "exams", "results", "settings"].includes(tab)) {
      setActiveTab(tab);
      
      // Redirect to the dedicated exams page when that tab is selected
      if (tab === "exams") {
        router.push("/dashboard/student/exams");
      }
    }
  }, [searchParams, router]);

  const handleTabChange = (tab: TabType) => {
    if (tab === "exams") {
      // When exams tab is clicked, navigate to the dedicated page
      router.push("/dashboard/student/exams");
    } else {
      setActiveTab(tab);
    }
  };

  // Check if there's an access denied message
  const accessDenied = searchParams.get("access-denied") === "true";

  return (
    <div className="min-h-screen bg-background">
      {/* Role checking component - no UI, just logic */}
      <LoginRoleCheck />
      
      {/* Access Denied Banner */}
      {accessDenied && (
        <div className="fixed top-2 left-0 right-0 mx-auto w-fit z-50 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-4 py-2 rounded-lg shadow-lg">
          Access denied: You don't have permission to view that page
        </div>
      )}
      
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar 
          activeTab={activeTab}
          onTabChange={handleTabChange}
          userRole="student"
        />
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          <TopBar />
          <main className="container mx-auto px-4 py-6">
            <MainContentTabContent 
              tab={activeTab}
              userRole="student"
            />
          </main>
        </div>
      </div>
    </div>
  );
}

// Main component with suspense boundary
export default function StudentDashboard() {
  return (
    <RoleProtected allowedRoles={["student", "admin"]}>
      <Suspense fallback={<div>Loading...</div>}>
        <StudentDashboardContent />
      </Suspense>
    </RoleProtected>
  );
} 