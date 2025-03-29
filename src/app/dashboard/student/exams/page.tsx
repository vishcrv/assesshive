"use client";

import { useState, useEffect } from "react";
import { RoleProtected } from "@/components/role-protected";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Clock, Calendar, ArrowLeft, Search, Filter, ChevronDown, AlertTriangle, Check } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, isPast, isFuture, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuRadioGroup, 
  DropdownMenuRadioItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentExams() {
  const [exams, setExams] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState("date-asc");
  const [statusFilter, setStatusFilter] = useState("all");

  // Load exams from localStorage on component mount
  useEffect(() => {
    const loadExams = () => {
      try {
        setIsLoading(true);
        // Get saved exams from localStorage
        const savedExams = JSON.parse(localStorage.getItem('facultyExams') || '[]');
        
        // Parse date strings back to Date objects and filter to only show published/scheduled exams
        const parsedExams = savedExams
          .filter((exam: any) => exam.status === "published" || exam.status === "scheduled" || exam.status === "active")
          .map((exam: any) => ({
            ...exam,
            createdAt: new Date(exam.createdAt),
            scheduledFor: new Date(exam.scheduledFor),
            examStatus: getExamStatus(new Date(exam.scheduledFor))
          }));
        
        setExams(parsedExams);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading exams from localStorage:', error);
        setIsLoading(false);
      }
    };

    loadExams();
    
    // Add an event listener to refresh the exam list when storage changes
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

  // Calculate exam status based on scheduled date
  const getExamStatus = (scheduledDate: Date) => {
    if (isPast(scheduledDate) && !isToday(scheduledDate)) {
      return "expired";
    } else if (isToday(scheduledDate)) {
      return "today";
    } else {
      return "upcoming";
    }
  };

  // Apply filters and sorting
  const filteredAndSortedExams = exams
    .filter(exam => {
      // Apply search filter
      const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            exam.course.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Apply status filter
      let matchesStatus = true;
      if (statusFilter !== "all") {
        matchesStatus = exam.examStatus === statusFilter;
      }
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Apply sorting
      switch (sortBy) {
        case "date-asc":
          return a.scheduledFor.getTime() - b.scheduledFor.getTime();
        case "date-desc":
          return b.scheduledFor.getTime() - a.scheduledFor.getTime();
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        case "duration-asc":
          return a.duration - b.duration;
        case "duration-desc":
          return b.duration - a.duration;
        default:
          return a.scheduledFor.getTime() - b.scheduledFor.getTime();
      }
    });

  // Format date for display
  const formatDate = (date: Date) => {
    return format(date, "MMM d, yyyy 'at' h:mm a");
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

  // Get exam status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "today":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            Today
          </Badge>
        );
      case "upcoming":
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Upcoming
          </Badge>
        );
      case "expired":
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Expired
          </Badge>
        );
      default:
        return null;
    }
  };

  // Get difficulty level based on questions
  const getDifficultyLevel = (numQuestions: number) => {
    if (numQuestions <= 15) return "Easy";
    if (numQuestions <= 30) return "Medium";
    return "Hard";
  };

  // Get difficulty badge color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Medium":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
      case "Hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  // Loading skeleton UI
  const ExamCardSkeleton = () => (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex flex-wrap gap-2 mb-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16" />
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
  );

  return (
    <RoleProtected allowedRoles={["student"]}>
      {/* Return to Dashboard button positioned at the top-left */}
      <div className="fixed top-4 left-4 z-10">
        <Button
          variant="outline"
          className="flex items-center gap-2 shadow-md"
          asChild
        >
          <Link href="/dashboard/student">
            <ArrowLeft className="h-4 w-4" /> Return to Dashboard
          </Link>
        </Button>
      </div>
      
      {/* Main content with increased margins */}
      <div className="space-y-6 pt-20 px-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Available Exams</h1>
            <p className="text-muted-foreground">View and take exams assigned to you</p>
          </div>
        </div>
        
        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Search Exams</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title or course..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Exams</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="expired">Past Exams</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Sort By</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-[160px] justify-between">
                    {sortBy === "date-asc" ? "Date (Earliest)" :
                     sortBy === "date-desc" ? "Date (Latest)" :
                     sortBy === "title-asc" ? "Title (A-Z)" :
                     sortBy === "title-desc" ? "Title (Z-A)" :
                     sortBy === "duration-asc" ? "Duration (Short-Long)" :
                     sortBy === "duration-desc" ? "Duration (Long-Short)" : "Sort By"}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
                    <DropdownMenuRadioItem value="date-asc">Date (Earliest First)</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="date-desc">Date (Latest First)</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="title-asc">Title (A-Z)</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="title-desc">Title (Z-A)</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="duration-asc">Duration (Short-Long)</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="duration-desc">Duration (Long-Short)</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </Card>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {Array(6).fill(0).map((_, i) => (
              <ExamCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredAndSortedExams.length === 0 ? (
          <Card className="p-8">
            <div className="text-center">
              <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No exams found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all"
                  ? "No exams match your search criteria. Try adjusting your filters."
                  : "There are no exams available for you at the moment."}
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredAndSortedExams.map((exam) => (
              <Card 
                key={exam.id} 
                className={cn(
                  "overflow-hidden transition-all",
                  exam.examStatus === "expired" ? "opacity-70" : "shadow-md hover:shadow-lg"
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between">
                    <CardTitle className="line-clamp-2 hover:line-clamp-none transition-all text-lg">
                      {exam.title}
                    </CardTitle>
                    {getStatusBadge(exam.examStatus)}
                  </div>
                  <CardDescription>
                    {exam.course} • {exam.numQuestions} questions
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{exam.duration} mins</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(exam.scheduledFor)}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      {exam.maxAttempts} {exam.maxAttempts === 1 ? "attempt" : "attempts"} allowed
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        getDifficultyColor(getDifficultyLevel(exam.numQuestions))
                      )}
                    >
                      {getDifficultyLevel(exam.numQuestions)}
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter>
                  {exam.examStatus === "expired" ? (
                    <Button className="w-full" size="sm" variant="outline" disabled>
                      <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
                      Exam Expired
                    </Button>
                  ) : (
                    <Button className="w-full" size="sm" asChild>
                      <Link href={`/dashboard/student/exams/${exam.id}`}>
                        {exam.examStatus === "today" ? (
                          <>
                            <Clock className="h-3.5 w-3.5 mr-1.5" />
                            Take Exam Now
                          </>
                        ) : (
                          "View Exam"
                        )}
                      </Link>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </RoleProtected>
  );
} 