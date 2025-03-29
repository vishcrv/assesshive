"use client";

import { useState, useEffect } from "react";
import { RoleProtected } from "@/components/role-protected";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, FileText, Edit, Trash2, MoreHorizontal, Calendar, Clock, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

// Mock data for exams
const mockExams = [
  {
    id: "1",
    title: "Introduction to Computer Science Mid-Term",
    course: "CS101",
    createdAt: new Date("2023-03-10"),
    scheduledFor: new Date("2023-04-15"),
    duration: 60, // minutes
    numQuestions: 30,
    maxAttempts: 1,
    status: "scheduled",
  },
  {
    id: "2",
    title: "Data Structures Quiz 2",
    course: "CS201",
    createdAt: new Date("2023-03-05"),
    scheduledFor: new Date("2023-03-20"),
    duration: 30,
    numQuestions: 15,
    maxAttempts: 2,
    status: "active",
  },
  {
    id: "3",
    title: "Algorithms Final Exam",
    course: "CS301",
    createdAt: new Date("2023-02-28"),
    scheduledFor: new Date("2023-05-10"),
    duration: 120,
    numQuestions: 50,
    maxAttempts: 1,
    status: "draft",
  },
];

export default function FacultyExams() {
  const [exams, setExams] = useState(mockExams);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState<string | null>(null);

  // Load exams from localStorage on component mount
  useEffect(() => {
    const loadExams = () => {
      try {
        // Get saved exams from localStorage
        const savedExams = JSON.parse(localStorage.getItem('facultyExams') || '[]');
        
        // Parse date strings back to Date objects
        const parsedExams = savedExams.map((exam: any) => ({
          ...exam,
          createdAt: new Date(exam.createdAt),
          scheduledFor: new Date(exam.scheduledFor)
        }));
        
        // Combine with mock exams (in a real app, you'd just use saved exams)
        setExams([...mockExams, ...parsedExams]);
      } catch (error) {
        console.error('Error loading exams from localStorage:', error);
      }
    };

    loadExams();
    
    // Add an event listener to refresh the exam list when storage changes
    // (this helps when creating an exam in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'facultyExams') {
        loadExams();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleDeleteExam = (id: string) => {
    // Filter out the deleted exam
    const updatedExams = exams.filter(exam => exam.id !== id);
    setExams(updatedExams);
    
    // Update localStorage if the deleted exam was from there
    try {
      const savedExams = JSON.parse(localStorage.getItem('facultyExams') || '[]');
      const updatedSavedExams = savedExams.filter((exam: any) => exam.id !== id);
      localStorage.setItem('facultyExams', JSON.stringify(updatedSavedExams));
    } catch (error) {
      console.error('Error updating localStorage after delete:', error);
    }
    
    setIsDeleteDialogOpen(false);
    setExamToDelete(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      case "scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "completed":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <RoleProtected allowedRoles={["faculty", "admin"]}>
      {/* Return to Dashboard button positioned at the top-left */}
      <div className="fixed top-4 left-4 z-10">
        <Button
          variant="outline"
          className="flex items-center gap-2 shadow-md"
          asChild
        >
          <Link href="/dashboard/faculty">
            <ArrowLeft className="h-4 w-4" /> Return to Dashboard
          </Link>
        </Button>
      </div>
      
      {/* Main content with increased margins */}
      <div className="space-y-6 pt-20 pl-6 pr-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Exams Analysis</h1>
            <p className="text-muted-foreground">View and analyze your exams by subject and performance</p>
          </div>
        </div>
        
        {exams.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-10 text-center">
            <FileText className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No exams to analyze</h3>
            <p className="text-muted-foreground mb-4">
              You don't have any exams created yet. When exams are created, you'll be able to view their analysis here.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {exams.map((exam) => (
              <Card key={exam.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-4">
                      <CardTitle className="line-clamp-2 hover:line-clamp-none transition-all text-lg">
                        {exam.title}
                      </CardTitle>
                      <CardDescription>
                        {exam.course} • {exam.numQuestions} questions
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/faculty/exams/${exam.id}`}>
                            View Analysis
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/faculty/exams/${exam.id}?tab=statistics`}>
                            Statistics
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/faculty/exams/${exam.id}?tab=performance`}>
                            Student Performance
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600 dark:text-red-400"
                          onClick={() => {
                            setExamToDelete(exam.id);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Exam
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <Badge className={`mt-2 ${getStatusColor(exam.status)}`}>
                    {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                  </Badge>
                </CardHeader>
                <CardContent className="pb-1">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center text-sm">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>
                        {exam.scheduledFor.toLocaleDateString()} ({formatDistanceToNow(exam.scheduledFor, { addSuffix: true })})
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{exam.duration} minutes</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle2 className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>Max attempts: {exam.maxAttempts}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-3">
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href={`/dashboard/faculty/exams/${exam.id}`}>
                      View Exam Analysis
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        
        {/* Delete confirmation dialog */}
        {isDeleteDialogOpen && examToDelete && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full">
              <CardHeader>
                <CardTitle>Delete Exam</CardTitle>
                <CardDescription>
                  Are you sure you want to delete this exam? This action cannot be undone.
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsDeleteDialogOpen(false);
                    setExamToDelete(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => handleDeleteExam(examToDelete)}
                >
                  Delete
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </RoleProtected>
  );
} 