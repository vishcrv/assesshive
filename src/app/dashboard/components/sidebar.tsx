"use client";

import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  FileQuestion,
  BookOpen,
  Settings,
  BarChart2,
  Users,
  User,
  Database,
  Shield,
  Clock,
  GraduationCap,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  Award,
  BookOpenCheck,
  Activity,
  Bell
} from "lucide-react";
import { useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export type TabType = "overview" | "exams" | "questions" | "students" | "results" | "settings" | "activities" | "notifications";

const navigation = [
  { name: "Overview", tab: "overview" as TabType, icon: BarChart2 },
  { name: "Activities", tab: "activities" as TabType, icon: Activity, roles: ["admin"] },
  { name: "Exams", tab: "exams" as TabType, icon: BookOpen },
  { name: "Question Bank", tab: "questions" as TabType, icon: FileQuestion },
  { name: "Notifications", tab: "notifications" as TabType, icon: Bell, roles: ["admin", "faculty"] },
  { name: "Students", tab: "students" as TabType, icon: GraduationCap },
  { name: "Results", tab: "results" as TabType, icon: BookOpenCheck },
  { name: "Settings", tab: "settings" as TabType, icon: Settings },
];

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  userRole?: "admin" | "faculty" | "student";
}

export function Sidebar({ activeTab, onTabChange, userRole = "faculty" }: SidebarProps) {
  const { user, isLoaded } = useUser();
  
  // Filter navigation based on user role
  const filteredNavigation = navigation.filter(item => {
    // If the item has specific roles defined, check if current role is included
    if (item.roles) {
      return item.roles.includes(userRole);
    }
    
    // Otherwise use the default role-based filtering
    if (userRole === "admin") return true;
    if (userRole === "faculty" && item.tab !== "students") return true;
    if (userRole === "student" && ["overview", "exams", "results"].includes(item.tab)) return true;
    return false;
  });

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card px-3 py-4">
      {/* Logo */}
      <div className="flex items-center px-3 py-4">
        <span className="text-xl font-bold">ExamGenius</span>
      </div>

      {/* User Role Badge */}
      <div className="mb-4 px-5">
        <span className={cn(
          "inline-block text-xs font-medium px-2 py-1 rounded",
          userRole === "admin" ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" :
          userRole === "faculty" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" :
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
        )}>
          {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2">
        {filteredNavigation.map((item) => {
          const isActive = activeTab === item.tab;
          return (
            <MenuItem
              key={item.name}
              icon={item.icon}
              label={item.name}
              isActive={isActive}
              onClick={() => onTabChange(item.tab)}
              isCollapsed={false}
              userRole={userRole}
            />
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="mt-auto border-t px-3 py-4">
        <div className="flex items-center gap-3">
          <UserButton afterSignOutUrl="/" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {user?.fullName || user?.firstName || user?.username || 'Anonymous User'}
            </span>
            <span className="text-xs text-muted-foreground">
              {user?.primaryEmailAddress?.emailAddress || ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MenuItem({ 
  icon: Icon, 
  label, 
  isActive, 
  onClick, 
  isCollapsed,
  userRole
}: { 
  icon: any; 
  label: string; 
  isActive: boolean; 
  onClick: () => void; 
  isCollapsed: boolean;
  userRole: string;
}) {
  // Determine the route for the link based on tab and user role
  const getRoute = () => {
    const baseRoute = "/dashboard";
    
    // Specific routes for exams
    if (label.toLowerCase() === "exams" && userRole === "faculty") {
      return `${baseRoute}/faculty/exams`;
    }
    
    // Route for notifications
    if (label.toLowerCase() === "notifications") {
      return `${baseRoute}/${userRole}/notifications`;
    }
    
    // Default route pattern
    return `${baseRoute}/${userRole}?tab=${label.toLowerCase()}`;
  };

  return (
    <Link href={getRoute()} className="no-underline w-full">
      <button
        className={cn(
          "flex items-center gap-3 w-full px-3 py-2 rounded-md transition-colors",
          isActive
            ? "bg-primary text-primary-foreground"
            : "hover:bg-muted"
        )}
        onClick={onClick}
        aria-current={isActive ? "page" : undefined}
      >
        <Icon className="h-5 w-5" />
        {!isCollapsed && <span>{label}</span>}
      </button>
    </Link>
  );
} 