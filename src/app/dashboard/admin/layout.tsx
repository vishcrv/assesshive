"use client";

import { SidebarNav } from "@/components/SidebarNav";
import { UserButton } from "@clerk/nextjs";
import { Shield, LayoutDashboard, UserCog, GraduationCap, BookOpen, Bell, Settings } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Navigation items for the admin sidebar
  const sidebarNavItems = [
    {
      href: "/dashboard/admin",
      title: "Dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      href: "/dashboard/admin/users",
      title: "Users",
      icon: <UserCog className="h-4 w-4" />,
    },
    {
      href: "/dashboard/admin/courses",
      title: "Courses",
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      href: "/dashboard/admin/activities",
      title: "Security Activities",
      icon: <Shield className="h-4 w-4" />,
    },
    {
      href: "/dashboard/admin/notifications",
      title: "Notifications",
      icon: <Bell className="h-4 w-4" />,
    },
    {
      href: "/dashboard/admin/settings",
      title: "Settings",
      icon: <Settings className="h-4 w-4" />,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top navigation */}
      <div className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link href="/" className="hidden items-center space-x-2 md:flex">
          <span className="hidden font-bold sm:inline-block">
            ExamGenius
          </span>
        </Link>
        <div className="flex-1"></div>
        <UserButton afterSignOutUrl="/" />
      </div>
      
      <div className="flex-1 items-start md:grid md:grid-cols-[220px_1fr] lg:grid-cols-[240px_1fr]">
        <aside className="fixed top-16 z-30 -ml-2 hidden h-[calc(100vh-4rem)] w-full shrink-0 border-r md:sticky md:block">
          <div className="h-full py-6 pl-8 pr-6 lg:py-8">
            <SidebarNav items={sidebarNavItems} className="mx-2" />
          </div>
        </aside>
        <main className="flex w-full flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
} 