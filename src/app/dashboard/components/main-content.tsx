"use client";

import { motion } from "framer-motion";
import { 
  BookOpen, 
  FileQuestion, 
  PlusCircle, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Copy, 
  CheckCircle,
  Clock,
  Calendar,
  Users,
  User,
  BarChart2,
  Settings,
  Timer,
  Award,
  Shield,
  GraduationCap,
  Eye,
  Upload,
  Download,
  Loader2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useState, useRef, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { TabType } from "./sidebar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Mock types for our application
interface Exam {
  id: string;
  title: string;
  subject: string;
  duration: number; // in minutes
  totalQuestions: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  status: 'Draft' | 'Published' | 'Closed';
  createdBy: string;
  createdAt: Date;
  startDate?: Date;
  endDate?: Date;
}

interface Question {
  id: string;
  text: string;
  options: { id: string; text: string }[];
  correctOption: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  createdBy: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  class: string;
  rollNumber: string;
}

interface Result {
  id: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  score: number;
  totalMarks: number;
  percentage: number;
  timeTaken: number; // in minutes
  completedAt: Date;
}

interface TabContentProps {
  activeTab: TabType;
  userRole?: 'admin' | 'faculty' | 'student';
}

// Mock data
const mockExams: Exam[] = [
  {
    id: '1',
    title: 'Midterm Computer Science',
    subject: 'Computer Science',
    duration: 60,
    totalQuestions: 30,
    difficulty: 'Medium',
    status: 'Published',
    createdBy: 'Prof. Johnson',
    createdAt: new Date('2023-10-15'),
    startDate: new Date('2023-11-01'),
    endDate: new Date('2023-11-02')
  },
  {
    id: '2',
    title: 'Mathematics Final',
    subject: 'Mathematics',
    duration: 120,
    totalQuestions: 50,
    difficulty: 'Hard',
    status: 'Draft',
    createdBy: 'Prof. Williams',
    createdAt: new Date('2023-10-20')
  },
  {
    id: '3',
    title: 'Physics Quiz 3',
    subject: 'Physics',
    duration: 30,
    totalQuestions: 15,
    difficulty: 'Easy',
    status: 'Published',
    createdBy: 'Prof. Smith',
    createdAt: new Date('2023-10-18'),
    startDate: new Date('2023-10-30'),
    endDate: new Date('2023-11-05')
  },
  {
    id: '4',
    title: 'Database Systems Final',
    subject: 'Database Systems',
    duration: 90,
    totalQuestions: 40,
    difficulty: 'Medium',
    status: 'Closed',
    createdBy: 'Prof. Johnson',
    createdAt: new Date('2023-09-10'),
    startDate: new Date('2023-10-01'),
    endDate: new Date('2023-10-02')
  }
];

// Mock data for questions, students, and results
const mockQuestions: Question[] = [
  {
    id: '1',
    text: 'What is the time complexity of binary search?',
    options: [
      { id: 'a', text: 'O(1)' },
      { id: 'b', text: 'O(log n)' },
      { id: 'c', text: 'O(n)' },
      { id: 'd', text: 'O(n²)' }
    ],
    correctOption: 'b',
    category: 'Algorithms',
    difficulty: 'Medium',
    createdBy: 'Prof. Johnson'
  },
  {
    id: '2',
    text: 'Which data structure uses LIFO principle?',
    options: [
      { id: 'a', text: 'Queue' },
      { id: 'b', text: 'Stack' },
      { id: 'c', text: 'Linked List' },
      { id: 'd', text: 'Tree' }
    ],
    correctOption: 'b',
    category: 'Data Structures',
    difficulty: 'Easy',
    createdBy: 'Prof. Williams'
  },
  {
    id: '3',
    text: 'What is a primary key in a database?',
    options: [
      { id: 'a', text: 'A key that can contain NULL values' },
      { id: 'b', text: 'A key used for establishing relationships between tables' },
      { id: 'c', text: 'A unique identifier for a record in a table' },
      { id: 'd', text: 'A key that can have duplicate values' }
    ],
    correctOption: 'c',
    category: 'Databases',
    difficulty: 'Medium',
    createdBy: 'Prof. Smith'
  }
];

const mockStudents: Student[] = [
  { id: '1', name: 'John Doe', email: 'john.doe@example.com', class: 'CS101', rollNumber: 'CS2023001' },
  { id: '2', name: 'Jane Smith', email: 'jane.smith@example.com', class: 'CS101', rollNumber: 'CS2023002' },
  { id: '3', name: 'Bob Johnson', email: 'bob.johnson@example.com', class: 'CS102', rollNumber: 'CS2023101' }
];

const mockResults: Result[] = [
  { 
    id: '1', 
    examId: '1', 
    examTitle: 'Midterm Computer Science', 
    studentId: '1', 
    studentName: 'John Doe', 
    score: 25, 
    totalMarks: 30, 
    percentage: 83.33, 
    timeTaken: 54, 
    completedAt: new Date('2023-11-01T14:30:00') 
  },
  { 
    id: '2', 
    examId: '1', 
    examTitle: 'Midterm Computer Science', 
    studentId: '2', 
    studentName: 'Jane Smith', 
    score: 28, 
    totalMarks: 30, 
    percentage: 93.33, 
    timeTaken: 48, 
    completedAt: new Date('2023-11-01T14:20:00') 
  },
  { 
    id: '3', 
    examId: '3', 
    examTitle: 'Physics Quiz 3', 
    studentId: '3', 
    studentName: 'Bob Johnson', 
    score: 12, 
    totalMarks: 15, 
    percentage: 80, 
    timeTaken: 27, 
    completedAt: new Date('2023-10-30T10:15:00') 
  }
];

// Main TabContent component
export function MainContentTabContent({ activeTab, userRole = 'faculty' }: TabContentProps) {
  const router = useRouter();
  
  // States for different actions 
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Format dates for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Render the appropriate view based on the active tab
  switch (activeTab) {
    case "overview":
      return <OverviewTab userRole={userRole} />;
    case "exams":
      return <ExamsTab userRole={userRole} />;
    case "questions":
      return <QuestionsTab />;
    case "students":
      return <StudentsTab />;
    case "results":
      return <ResultsTab userRole={userRole} />;
    case "settings":
      return <SettingsTab userRole={userRole} />;
    default:
      return <OverviewTab userRole={userRole} />;
  }
}

// Overview Tab Component
function OverviewTab({ userRole }: { userRole?: 'admin' | 'faculty' | 'student' }) {
  const { user } = useUser();
  const router = useRouter();
  const [upcomingExams, setUpcomingExams] = useState<any[]>([]);
  const [recentResults, setRecentResults] = useState<any[]>([]);
  const [isLoadingExams, setIsLoadingExams] = useState(true);

  useEffect(() => {
    // Load data based on user role
    if (userRole === "student") {
      // Load exams for student
      try {
        setIsLoadingExams(true);
        const savedExams = JSON.parse(localStorage.getItem('facultyExams') || '[]');
        
        // Filter for published or scheduled exams and sort by scheduled date
        const parsedExams = savedExams
          .filter((exam: any) => exam.status === "published" || exam.status === "scheduled")
          .map((exam: any) => ({
            ...exam,
            scheduledFor: new Date(exam.scheduledFor)
          }))
          .sort((a: any, b: any) => a.scheduledFor.getTime() - b.scheduledFor.getTime())
          .slice(0, 4); // Get only the next 4 upcoming exams
        
        setUpcomingExams(parsedExams);
        setIsLoadingExams(false);
      } catch (error) {
        console.error('Error loading exams from localStorage:', error);
        setIsLoadingExams(false);
      }
    }
  }, [userRole]);

  // Format exam date
  const formatExamDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get days until exam
  const getDaysUntilExam = (date: Date) => {
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 0) return "Past due";
    return `In ${diffDays} days`;
  };

  if (userRole === 'admin') {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-100 p-3 rounded-full">
                <FileQuestion className="h-6 w-6 text-blue-700" />
              </div>
              <div>
                <div className="text-muted-foreground">Total Exams</div>
                <div className="text-2xl font-bold">124</div>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center space-x-2">
              <div className="bg-green-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <div className="text-muted-foreground">Students</div>
                <div className="text-2xl font-bold">1,205</div>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center space-x-2">
              <div className="bg-purple-100 p-3 rounded-full">
                <User className="h-6 w-6 text-purple-700" />
              </div>
              <div>
                <div className="text-muted-foreground">Faculty</div>
                <div className="text-2xl font-bold">48</div>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center space-x-2">
              <div className="bg-amber-100 p-3 rounded-full">
                <BookOpen className="h-6 w-6 text-amber-700" />
              </div>
              <div>
                <div className="text-muted-foreground">Active Exams</div>
                <div className="text-2xl font-bold">18</div>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Other admin dashboard content here */}
      </div>
    );
  }
  
  if (userRole === 'faculty') {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Faculty Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-100 p-3 rounded-full">
                <FileQuestion className="h-6 w-6 text-blue-700" />
              </div>
              <div>
                <div className="text-muted-foreground">My Exams</div>
                <div className="text-2xl font-bold">24</div>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center space-x-2">
              <div className="bg-green-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <div className="text-muted-foreground">Students</div>
                <div className="text-2xl font-bold">156</div>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center space-x-2">
              <div className="bg-amber-100 p-3 rounded-full">
                <Award className="h-6 w-6 text-amber-700" />
              </div>
              <div>
                <div className="text-muted-foreground">Avg. Score</div>
                <div className="text-2xl font-bold">75%</div>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center space-x-2">
              <div className="bg-red-100 p-3 rounded-full">
                <Shield className="h-6 w-6 text-red-700" />
              </div>
              <div>
                <div className="text-muted-foreground">Security Alerts</div>
                <div className="text-2xl font-bold">3</div>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Other faculty dashboard content here */}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome, {user?.firstName || 'Student'}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-100 p-3 rounded-full dark:bg-blue-900">
              <BookOpen className="h-6 w-6 text-blue-700 dark:text-blue-300" />
            </div>
            <div>
              <div className="text-muted-foreground">Upcoming Exams</div>
              <div className="text-2xl font-bold">{upcomingExams.length}</div>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center space-x-2">
            <div className="bg-green-100 p-3 rounded-full dark:bg-green-900">
              <CheckCircle className="h-6 w-6 text-green-700 dark:text-green-300" />
            </div>
            <div>
              <div className="text-muted-foreground">Completed Exams</div>
              <div className="text-2xl font-bold">8</div>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center space-x-2">
            <div className="bg-amber-100 p-3 rounded-full dark:bg-amber-900">
              <Award className="h-6 w-6 text-amber-700 dark:text-amber-300" />
            </div>
            <div>
              <div className="text-muted-foreground">Average Score</div>
              <div className="text-2xl font-bold">82%</div>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center space-x-2">
            <div className="bg-purple-100 p-3 rounded-full dark:bg-purple-900">
              <GraduationCap className="h-6 w-6 text-purple-700 dark:text-purple-300" />
            </div>
            <div>
              <div className="text-muted-foreground">Achievements</div>
              <div className="text-2xl font-bold">3</div>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upcoming Exams Card */}
        <div className="md:col-span-2">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Upcoming Exams</h2>
                <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/student/exams')}>
                  View All
                </Button>
              </div>
              
              {isLoadingExams ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : upcomingExams.length === 0 ? (
                <div className="text-center py-8 border border-dashed rounded-lg">
                  <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-medium mb-1">No Upcoming Exams</h3>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto">
                    You don't have any upcoming exams scheduled at the moment. Check back later for updates.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingExams.map((exam, index) => (
                    <Card key={index} className="overflow-hidden border-0 shadow-sm">
                      <div className="p-4">
                        <div className="flex justify-between">
                          <div className="space-y-1">
                            <h3 className="font-medium">{exam.title}</h3>
                            <p className="text-sm text-muted-foreground">{exam.course}</p>
                          </div>
                          <Badge 
                            className={cn(
                              "h-fit",
                              new Date(exam.scheduledFor) <= new Date(Date.now() + 24 * 60 * 60 * 1000)
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                            )}
                          >
                            {getDaysUntilExam(new Date(exam.scheduledFor))}
                          </Badge>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                              <span>{formatExamDate(new Date(exam.scheduledFor))}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                              <span>{exam.duration} minutes</span>
                            </div>
                          </div>
                          <Button size="sm" asChild>
                            <Link href={`/dashboard/student/exams/${exam.id}`}>
                              View Details
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
        
        {/* Recent Results / Activity Card */}
        <div>
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Results</h2>
              <div className="space-y-4">
                <div className="text-center py-8 border border-dashed rounded-lg">
                  <Award className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-medium mb-1">No Results Yet</h3>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto">
                    Complete some exams to see your results and performance here.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper function to format date
function formatDate(date: Date | undefined) {
  if (!date) return 'Not set';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Exams Tab Component
function ExamsTab({ userRole }: { userRole?: 'admin' | 'faculty' | 'student' }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [facultyExams, setFacultyExams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    // For students, load exams from localStorage
    if (userRole === 'student') {
      try {
        setIsLoading(true);
        const savedExams = JSON.parse(localStorage.getItem('facultyExams') || '[]');
        
        // Parse date strings back to Date objects
        const parsedExams = savedExams.map((exam: any) => ({
          ...exam,
          createdAt: new Date(exam.createdAt),
          scheduledFor: new Date(exam.scheduledFor),
          // Map to match our mockExams structure
          title: exam.title,
          subject: exam.course,
          duration: exam.duration,
          totalQuestions: exam.numQuestions,
          difficulty: exam.numQuestions <= 15 ? 'Easy' : exam.numQuestions <= 30 ? 'Medium' : 'Hard',
          status: exam.status.charAt(0).toUpperCase() + exam.status.slice(1), // Capitalize first letter
          createdBy: "Professor", // We don't have this info in localStorage
          startDate: exam.scheduledFor,
          endDate: new Date(exam.scheduledFor.getTime() + exam.duration * 60000)
        }));
        
        // Filter to only show published, active, or scheduled exams
        const availableExams = parsedExams.filter((exam: any) => 
          exam.status === "Published" || 
          exam.status === "Active" || 
          exam.status === "Scheduled"
        );
        
        setFacultyExams(availableExams);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading exams from localStorage:', error);
        setIsLoading(false);
      }
    }
  }, [userRole]);
  
  // Filter exams based on search term and status
  const filteredExams = userRole === 'student' 
    ? facultyExams.filter(exam => {
        const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             exam.subject.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
      })
    : mockExams.filter(exam => {
        const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             exam.subject.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !statusFilter || exam.status === statusFilter;
        return matchesSearch && matchesStatus;
      });
  
  const handleViewAvailableExams = () => {
    router.push('/dashboard/student/exams');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {userRole === 'student' ? 'Available Exams' : 'Manage Exams'}
        </h1>
        {userRole === 'student' ? (
          <Button className="gap-2" onClick={handleViewAvailableExams}>
            <BookOpen className="h-4 w-4" />
            View All Exams
          </Button>
        ) : (
          <Button className="gap-2" asChild>
            <Link href="/dashboard/faculty/exams/create">
              <PlusCircle className="h-4 w-4" />
              Create Exam
            </Link>
          </Button>
        )}
      </div>
      
      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium mb-1 block">Search Exams</label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or subject..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {userRole !== 'student' && (
            <div className="w-full md:w-1/4">
              <label className="text-sm font-medium mb-1 block">Status</label>
              <select 
                className="w-full p-2 rounded-md border"
                value={statusFilter || ''}
                onChange={(e) => setStatusFilter(e.target.value || null)}
              >
                <option value="">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          )}
          
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            {statusFilter ? `Filtered by: ${statusFilter}` : 'Filter'}
          </Button>
        </div>
      </Card>
      
      {/* Exams List */}
      {isLoading && userRole === 'student' ? (
        <Card className="p-8">
          <div className="text-center">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading available exams...</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredExams.length > 0 ? (
            filteredExams.map(exam => (
              <Card key={exam.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="md:w-1/3">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-lg">{exam.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{exam.subject}</p>
                  </div>
                  
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-6 mt-2 md:mt-0">
                    <div>
                      <p className="text-xs text-muted-foreground">Questions</p>
                      <p className="font-medium">{exam.totalQuestions}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="font-medium">{exam.duration} mins</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Difficulty</p>
                      <Badge variant="outline" className={cn(
                        exam.difficulty === 'Easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        exam.difficulty === 'Medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      )}>
                        {exam.difficulty}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <Badge variant="outline" className={cn(
                        exam.status === 'Published' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        exam.status === 'Draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' :
                        'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      )}>
                        {exam.status}
                      </Badge>
                    </div>
                    {exam.startDate && (
                      <div>
                        <p className="text-xs text-muted-foreground">Date</p>
                        <p className="font-medium">{formatDate(exam.startDate)}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-3 md:mt-0">
                    {userRole === 'student' ? (
                      <Button className="gap-2" size="sm">
                        <BookOpen className="h-4 w-4" />
                        Take Exam
                      </Button>
                    ) : (
                      <>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            {exam.status === 'Draft' && (
                              <DropdownMenuItem>
                                <BookOpen className="h-4 w-4 mr-2" />
                                Publish
                              </DropdownMenuItem>
                            )}
                            {exam.status === 'Published' && (
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                Download Results
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600 dark:text-red-400">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8">
              <div className="text-center">
                <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No exams found</h3>
                <p className="text-muted-foreground">
                  {searchTerm 
                    ? "No exams match your search criteria. Try adjusting your filters."
                    : userRole === 'student'
                    ? "There are no exams available for you at the moment."
                    : "You haven't created any exams yet. Get started by creating your first exam."}
                </p>
                {userRole !== 'student' && !searchTerm && (
                  <Button className="mt-4 gap-2" asChild>
                    <Link href="/dashboard/faculty/exams/create">
                      <PlusCircle className="h-4 w-4" />
                      Create Exam
                    </Link>
                  </Button>
                )}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// Questions Tab Component
function QuestionsTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  
  // Get unique categories for filter
  const categories = Array.from(new Set(mockQuestions.map(q => q.category)));
  
  // Filter questions based on search term, category, and difficulty
  const filteredQuestions = mockQuestions.filter(question => {
    const matchesSearch = question.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || question.category === categoryFilter;
    const matchesDifficulty = !difficultyFilter || question.difficulty === difficultyFilter;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Question Bank</h1>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Question
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium mb-1 block">Search Questions</label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search question text..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="w-full md:w-1/5">
            <label className="text-sm font-medium mb-1 block">Category</label>
            <select 
              className="w-full p-2 rounded-md border"
              value={categoryFilter || ''}
              onChange={(e) => setCategoryFilter(e.target.value || null)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div className="w-full md:w-1/5">
            <label className="text-sm font-medium mb-1 block">Difficulty</label>
            <select 
              className="w-full p-2 rounded-md border"
              value={difficultyFilter || ''}
              onChange={(e) => setDifficultyFilter(e.target.value || null)}
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>
      </Card>
      
      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((question, index) => (
            <Card key={question.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col md:flex-row justify-between md:items-center">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-full h-fit">
                      <span className="text-sm font-semibold">{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-medium">{question.text}</h3>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {question.category}
                        </Badge>
                        <Badge variant="outline" className={cn(
                          question.difficulty === 'Easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          question.difficulty === 'Medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        )}>
                          {question.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2 md:mt-0">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600 dark:text-red-400">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-10">
                  {question.options.map((option, index) => (
                    <div key={option.id} className="flex items-center gap-2">
                      <div className={cn(
                        "p-1 rounded-full h-6 w-6 flex items-center justify-center text-xs font-medium",
                        option.id === question.correctOption
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                      )}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className={cn(
                        option.id === question.correctOption && "font-medium"
                      )}>
                        {option.text}
                      </span>
                      {option.id === question.correctOption && (
                        <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8">
            <div className="text-center">
              <FileQuestion className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No questions found</h3>
              <p className="text-muted-foreground">
                {searchTerm || categoryFilter || difficultyFilter
                  ? "No questions match your search criteria. Try adjusting your filters."
                  : "You haven't added any questions yet. Get started by creating your first question."}
              </p>
              {!searchTerm && !categoryFilter && !difficultyFilter && (
                <Button className="mt-4 gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Add Question
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// Students Tab Component
function StudentsTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState<string | null>(null);
  
  // Get unique classes for filter
  const classes = Array.from(new Set(mockStudents.map(s => s.class)));
  
  // Filter students based on search term and class
  const filteredStudents = mockStudents.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = !classFilter || student.class === classFilter;
    
    return matchesSearch && matchesClass;
  });
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Student Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Import Students
          </Button>
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Student
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium mb-1 block">Search Students</label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or roll number..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="w-full md:w-1/4">
            <label className="text-sm font-medium mb-1 block">Class</label>
            <select 
              className="w-full p-2 rounded-md border"
              value={classFilter || ''}
              onChange={(e) => setClassFilter(e.target.value || null)}
            >
              <option value="">All Classes</option>
              {classes.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
          
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>
      </Card>
      
      {/* Students List */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Roll Number</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student, index) => (
                <TableRow key={student.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.class}</TableCell>
                  <TableCell>{student.rollNumber}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-100">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <User className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No students found</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

// Results Tab Component
function ResultsTab({ userRole }: { userRole?: 'admin' | 'faculty' | 'student' }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [examFilter, setExamFilter] = useState<string | null>(null);
  
  // Get unique exams for filter
  const exams = Array.from(new Set(mockResults.map(r => r.examTitle)));
  
  // Filter results based on search term and exam
  const filteredResults = mockResults.filter(result => {
    // For students, only show their own results
    if (userRole === 'student' && result.studentId !== '1') return false;
    
    const matchesSearch = 
      result.examTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.studentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesExam = !examFilter || result.examTitle === examFilter;
    
    return matchesSearch && matchesExam;
  });
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {userRole === 'student' ? 'My Results' : 'Exam Results'}
        </h1>
        {userRole !== 'student' && (
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Results
          </Button>
        )}
      </div>
      
      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium mb-1 block">Search Results</label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={userRole === 'student' ? "Search by exam title..." : "Search by exam title or student name..."}
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {userRole !== 'student' && (
            <div className="w-full md:w-1/4">
              <label className="text-sm font-medium mb-1 block">Exam</label>
              <select 
                className="w-full p-2 rounded-md border"
                value={examFilter || ''}
                onChange={(e) => setExamFilter(e.target.value || null)}
              >
                <option value="">All Exams</option>
                {exams.map(exam => (
                  <option key={exam} value={exam}>{exam}</option>
                ))}
              </select>
            </div>
          )}
          
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>
      </Card>
      
      {/* Results */}
      <div className="grid gap-4">
        {filteredResults.length > 0 ? (
          filteredResults.map((result) => (
            <Card key={result.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="md:w-1/3">
                  <h3 className="font-semibold text-lg">{result.examTitle}</h3>
                  {userRole !== 'student' && (
                    <p className="text-sm text-muted-foreground mt-1">Student: {result.studentName}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Completed on: {result.completedAt.toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 mt-2 md:mt-0">
                  <div className="flex flex-col items-center">
                    <div className="relative h-16 w-16">
                      <svg viewBox="0 0 100 100" className="h-full w-full">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          className="stroke-current text-gray-200 dark:text-gray-700"
                          strokeWidth="10"
                          fill="none"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          className={cn(
                            "stroke-current",
                            result.percentage >= 75 ? "text-green-500" :
                            result.percentage >= 50 ? "text-amber-500" : "text-red-500"
                          )}
                          strokeWidth="10"
                          fill="none"
                          strokeDasharray={251.2}
                          strokeDashoffset={251.2 - (251.2 * result.percentage) / 100}
                          strokeLinecap="round"
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold">{result.percentage}%</span>
                      </div>
                    </div>
                    <p className="text-xs mt-1">Score</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Marks</p>
                      <p className="font-medium">{result.score} / {result.totalMarks}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Time Taken</p>
                      <p className="font-medium">{result.timeTaken} mins</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Grade</p>
                      <Badge variant="outline" className={cn(
                        result.percentage >= 90 ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                        result.percentage >= 80 ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" :
                        result.percentage >= 70 ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" :
                        result.percentage >= 60 ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" :
                        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      )}>
                        {result.percentage >= 90 ? 'A+' :
                         result.percentage >= 80 ? 'A' :
                         result.percentage >= 70 ? 'B' :
                         result.percentage >= 60 ? 'C' :
                         result.percentage >= 50 ? 'D' : 'F'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-3 md:mt-0">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Eye className="h-4 w-4" />
                    View Details
                  </Button>
                  {userRole !== 'student' && (
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8">
            <div className="text-center">
              <Award className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No results found</h3>
              <p className="text-muted-foreground">
                {searchTerm || examFilter
                  ? "No results match your search criteria. Try adjusting your filters."
                  : userRole === 'student'
                  ? "You haven't taken any exams yet."
                  : "No exam results available yet."}
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// Settings Tab Component
function SettingsTab({ userRole }: { userRole?: 'admin' | 'faculty' | 'student' }) {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Settings</h1>
      
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Account Settings</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Name</label>
              <Input value="John Doe" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Email</label>
              <Input value="johndoe@example.com" disabled />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Profile Photo</label>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <Button variant="outline" size="sm">Change Photo</Button>
            </div>
          </div>
          
          <div>
            <Button>Save Changes</Button>
          </div>
        </div>
      </Card>
      
      {userRole === 'admin' && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">System Settings</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <div>
                <p className="font-medium">Auto-publish Exams</p>
                <p className="text-sm text-muted-foreground">Automatically publish exams on the scheduled date</p>
              </div>
              <div>
                <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700">
                  <span className="absolute left-1 h-4 w-4 rounded-full bg-white transition-transform duration-200 transform translate-x-5"></span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Send email notifications for exam results</p>
              </div>
              <div>
                <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary">
                  <span className="absolute left-1 h-4 w-4 rounded-full bg-white transition-transform duration-200 transform translate-x-5"></span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b">
              <div>
                <p className="font-medium">Auto-grade MCQs</p>
                <p className="text-sm text-muted-foreground">Automatically grade MCQ exams upon submission</p>
              </div>
              <div>
                <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary">
                  <span className="absolute left-1 h-4 w-4 rounded-full bg-white transition-transform duration-200 transform translate-x-5"></span>
                </div>
              </div>
            </div>
            
            <div>
              <Button>Save System Settings</Button>
            </div>
          </div>
        </Card>
      )}
      
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Exam Preferences</h2>
        <div className="space-y-4">
          {userRole !== 'student' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Default Exam Duration (minutes)</label>
                <Input type="number" defaultValue="60" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Default Pass Percentage</label>
                <Input type="number" defaultValue="50" />
              </div>
            </div>
          )}
          
          <div className="flex justify-between items-center py-2 border-b">
            <div>
              <p className="font-medium">Full Screen Mode</p>
              <p className="text-sm text-muted-foreground">
                {userRole === 'student' 
                  ? 'Enter full screen mode during exams'
                  : 'Force full screen mode for students during exams'}
              </p>
            </div>
            <div>
              <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary">
                <span className="absolute left-1 h-4 w-4 rounded-full bg-white transition-transform duration-200 transform translate-x-5"></span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b">
            <div>
              <p className="font-medium">Show Timer</p>
              <p className="text-sm text-muted-foreground">Display countdown timer during exams</p>
            </div>
            <div>
              <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary">
                <span className="absolute left-1 h-4 w-4 rounded-full bg-white transition-transform duration-200 transform translate-x-5"></span>
              </div>
            </div>
          </div>
          
          {userRole !== 'student' && (
            <div className="flex justify-between items-center py-2 border-b">
              <div>
                <p className="font-medium">Randomize Questions</p>
                <p className="text-sm text-muted-foreground">Shuffle questions for each student</p>
              </div>
              <div>
                <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary">
                  <span className="absolute left-1 h-4 w-4 rounded-full bg-white transition-transform duration-200 transform translate-x-5"></span>
                </div>
              </div>
            </div>
          )}
          
          <div>
            <Button>Save Preferences</Button>
          </div>
        </div>
      </Card>
      
      <Card className="p-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
        <h2 className="text-lg font-semibold mb-4 text-red-700 dark:text-red-400">Danger Zone</h2>
        <div className="space-y-4">
          {userRole === 'admin' && (
            <div className="flex justify-between items-center py-2 border-b border-red-200 dark:border-red-800">
              <div>
                <p className="font-medium text-red-700 dark:text-red-400">Reset System</p>
                <p className="text-sm text-red-600/70 dark:text-red-300/70">
                  Delete all exams, questions, and results. This cannot be undone.
                </p>
              </div>
              <Button variant="destructive">Reset System</Button>
            </div>
          )}
          
          <div className="flex justify-between items-center py-2">
            <div>
              <p className="font-medium text-red-700 dark:text-red-400">Delete Account</p>
              <p className="text-sm text-red-600/70 dark:text-red-300/70">
                Delete your account and all associated data. This cannot be undone.
              </p>
            </div>
            <Button variant="destructive">Delete Account</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
