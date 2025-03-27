"use client";

import { RoleProtected } from "@/components/role-protected";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  Bell, 
  User, 
  FileCog, 
  BarChart, 
  CheckCircle, 
  Shield,
  AlertTriangle
} from "lucide-react";

export default function AdminDashboard() {
  return (
    <RoleProtected allowedRoles={["admin"]}>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        </div>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Students
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">127</div>
                  <p className="text-xs text-muted-foreground">
                    +5 this month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Faculty
                  </CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">
                    +2 this month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Courses
                  </CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">
                    +3 from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Exams
                  </CardTitle>
                  <FileCog className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">
                    +2 this week
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Quick Access Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* User Management Card */}
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    User Management
                  </CardTitle>
                  <CardDescription>
                    Manage students and faculty accounts
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm">
                    Add, edit, or remove user accounts. Update roles and permissions for system access.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild>
                    <Link href="/dashboard/admin/users">
                      Manage Users
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Course Management Card */}
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" /> 
                    Course Management
                  </CardTitle>
                  <CardDescription>
                    Oversee courses and assignments
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm">
                    Review course creation, monitor course activities, and manage course assignments.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild>
                    <Link href="/dashboard/admin/courses">
                      Manage Courses
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Exam Oversight Card */}
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart className="h-5 w-5" />
                    Exam Oversight
                  </CardTitle>
                  <CardDescription>
                    Monitor exams and performance
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm">
                    Review exam statistics, monitor active exams, and analyze student performance data.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild>
                    <Link href="/dashboard/admin/exams">
                      View Exams
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Security Activities Card - NEW */}
              <Card className="flex flex-col bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    Security Activities
                  </CardTitle>
                  <CardDescription>
                    Monitor exam security violations
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm">
                    Track student exam security violations, manage passkeys, and authorize exam re-entry requests.
                  </p>
                  <div className="mt-3 p-2 bg-amber-100 dark:bg-amber-900/30 rounded-md">
                    <div className="flex items-center text-amber-800 dark:text-amber-300 text-xs gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>Active violations may require your attention</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="outline" className="bg-white dark:bg-amber-950 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50">
                    <Link href="/dashboard/admin/activities">
                      View Security Activities
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
              
              {/* System Settings Card */}
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCog className="h-5 w-5" />
                    System Settings
                  </CardTitle>
                  <CardDescription>
                    Configure system parameters
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm">
                    Adjust system settings, set up security parameters, and configure notification preferences.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild>
                    <Link href="/dashboard/admin/settings">
                      Manage Settings
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Notification Center Card */}
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notification Center
                  </CardTitle>
                  <CardDescription>
                    Manage system notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm">
                    Review system alerts, send announcements to users, and manage notification settings.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild>
                    <Link href="/dashboard/admin/notifications">
                      View Notifications
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>
                  View detailed statistics and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Analytics content will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reports</CardTitle>
                <CardDescription>
                  Generate and view system reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Reports content will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Manage system notifications and alerts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Notifications content will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RoleProtected>
  );
} 