"use client";

import { Sidebar } from "../components/sidebar";
import { TopBar } from "../components/top-bar";
import { useState, useEffect } from "react";
import { TabType } from "../components/sidebar";
import { useSearchParams, useRouter } from "next/navigation";
import { RoleProtected } from "@/components/role-protected";
import { LoginRoleCheck } from "@/components/login-middleware";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, BookOpen, PlusCircle, Calendar, Clock, User, GraduationCap, BookOpenCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function FacultyDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Set active tab from URL parameter
    const tab = searchParams.get("tab") as TabType;
    if (tab && ["overview", "exams", "questions", "students", "results", "settings"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  // Check if there's an access denied message
  const accessDenied = searchParams.get("access-denied") === "true";

  return (
    <RoleProtected allowedRoles={["faculty", "admin"]}>
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
            userRole="faculty" 
          />

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto">
            <TopBar />
            <main className="container mx-auto px-4 py-6">
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">Faculty Dashboard</h1>
                    <p className="text-muted-foreground">Manage your exams, students, and courses.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <User className="mr-2 h-5 w-5 text-primary" />
                          Students
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">42</div>
                        <p className="text-sm text-muted-foreground">Students enrolled in your courses</p>
                      </CardContent>
                      <CardFooter>
                        <Button variant="ghost" size="sm" className="w-full" asChild>
                          <Link href="/dashboard/faculty?tab=students">View all students</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <BookOpen className="mr-2 h-5 w-5 text-primary" />
                          Courses
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">3</div>
                        <p className="text-sm text-muted-foreground">Courses being taught this semester</p>
                      </CardContent>
                      <CardFooter>
                        <Button variant="ghost" size="sm" className="w-full">
                          View all courses
                        </Button>
                      </CardFooter>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <BookOpenCheck className="mr-2 h-5 w-5 text-primary" />
                          Exams
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">5</div>
                        <p className="text-sm text-muted-foreground">Exams scheduled (2 pending grades)</p>
                      </CardContent>
                      <CardFooter>
                        <Button variant="ghost" size="sm" className="w-full" asChild>
                          <Link href="/dashboard/faculty?tab=exams">View all exams</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Exams</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium">Midterm Examination</h3>
                              <p className="text-sm text-muted-foreground">Web Development</p>
                            </div>
                            <Badge>Scheduled</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium">Quiz 3</h3>
                              <p className="text-sm text-muted-foreground">Database Systems</p>
                            </div>
                            <Badge variant="outline">Published</Badge>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button asChild variant="outline" className="w-full">
                          <Link href="/dashboard/faculty/exams">
                            View Exams Analysis
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Exam Management</CardTitle>
                        <CardDescription>Create and manage MCQ exams</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center gap-2">
                          <PlusCircle className="h-4 w-4 text-primary" />
                          <p>Create multiple-choice questions</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          <p>Set exam duration and attempts</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          <p>Schedule exams for your students</p>
                        </div>
                      </CardContent>
                      <CardFooter className="flex gap-2">
                        <Button asChild className="w-full">
                          <Link href="/dashboard/faculty/exams/create">
                            Manage Exams
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                </div>
              )}
              
              {activeTab === "exams" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Manage Exams</h1>
                    <Button className="gap-2" asChild>
                      <Link href="/dashboard/faculty/exams/create">
                        <PlusCircle className="h-4 w-4" />
                        Create New Exam
                      </Link>
                    </Button>
                  </div>
                  
                  <Card className="p-6">
                    <div className="grid gap-4">
                      {[1, 2, 3].map((id) => (
                        <div key={id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex flex-col md:flex-row md:items-center justify-between">
                            <div className="md:w-1/3">
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-primary" />
                                <h3 className="font-semibold text-lg">
                                  {id === 1 ? "Midterm Examination" : id === 2 ? "Final Exam" : "Quiz 3"}
                                </h3>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {id === 1 ? "Web Development" : id === 2 ? "Database Systems" : "Object-Oriented Programming"}
                              </p>
                            </div>
                            
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-6 mt-2 md:mt-0">
                              <div>
                                <p className="text-xs text-muted-foreground">Questions</p>
                                <p className="font-medium">{id === 1 ? 30 : id === 2 ? 45 : 15}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Duration</p>
                                <p className="font-medium">{id === 1 ? 120 : id === 2 ? 180 : 45} mins</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Status</p>
                                <Badge variant="outline">
                                  {id === 1 ? "Scheduled" : id === 2 ? "Draft" : "Published"}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-3 md:mt-0">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/dashboard/faculty/exams/${id}`}>
                                  View
                                </Link>
                              </Button>
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/dashboard/faculty/exams/edit/${id}`}>
                                  Edit
                                </Link>
                              </Button>
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/dashboard/faculty/exams/questions/${id}`}>
                                  Questions
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                  
                  <div className="flex justify-center">
                    <Button asChild>
                      <Link href="/dashboard/faculty/exams">
                        View Complete Exams Analysis
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
              
              {activeTab !== "overview" && activeTab !== "exams" && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
                  <p>This is the {activeTab} tab content.</p>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </RoleProtected>
  );
} 