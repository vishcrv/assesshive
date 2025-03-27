"use client";

import { useState, useEffect } from "react";
import { RoleProtected } from "@/components/role-protected";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  BookOpen,
  Shield,
  Key,
  Eye,
  RefreshCcw,
  Filter,
  Copy,
  ChevronDown,
  Calendar
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { clearSecurityViolation } from "@/lib/passkey-utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

interface SecurityViolation {
  examId: string;
  studentId: string;
  timestamp: string;
  reason: string;
  passkey: string;
  cleared?: boolean;
  clearedAt?: string;
  examTitle?: string;
  studentName?: string;
}

export default function AdminActivities() {
  const [securityViolations, setSecurityViolations] = useState<SecurityViolation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [selectedViolation, setSelectedViolation] = useState<SecurityViolation | null>(null);
  const [isReauthorizing, setIsReauthorizing] = useState<string | null>(null);
  const { toast } = useToast();

  // Auto-refresh violations every 30 seconds
  useEffect(() => {
    loadViolations();
    const interval = setInterval(loadViolations, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadViolations = () => {
    try {
      setIsLoading(true);
      const savedViolations = JSON.parse(localStorage.getItem('securityViolations') || '[]');
      
      // Enhance violations with exam and student info (in a real app, this would come from a database)
      const enhancedViolations = savedViolations.map((violation: SecurityViolation) => {
        // Get exam info
        try {
          const exams = JSON.parse(localStorage.getItem('facultyExams') || '[]');
          const exam = exams.find((e: any) => e.id === violation.examId);
          if (exam) {
            violation.examTitle = exam.title;
          }
        } catch (err) {
          console.error('Error loading exam info:', err);
        }
        
        // In a real app, we would also fetch student names
        violation.studentName = `Student ${violation.studentId}`;
        return violation;
      });
      
      setSecurityViolations(enhancedViolations);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading security violations:', error);
      toast({
        variant: "destructive",
        title: "Error Loading Data",
        description: "Failed to load security violations. Please refresh the page.",
      });
      setIsLoading(false);
    }
  };

  // Apply filters
  const filteredViolations = securityViolations
    .filter(violation => {
      // Search term filter
      const matchesSearch = 
        searchTerm === "" ||
        violation.examId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (violation.examTitle && violation.examTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
        violation.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (violation.studentName && violation.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        violation.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        violation.passkey.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      const matchesStatus = 
        statusFilter === "all" ||
        (statusFilter === "active" && !violation.cleared) ||
        (statusFilter === "cleared" && violation.cleared);
      
      // Time filter
      const violationTime = new Date(violation.timestamp);
      const now = new Date();
      const isToday = violationTime.toDateString() === now.toDateString();
      const isThisWeek = now.getTime() - violationTime.getTime() < 7 * 24 * 60 * 60 * 1000;
      
      const matchesTime = 
        timeFilter === "all" ||
        (timeFilter === "today" && isToday) ||
        (timeFilter === "week" && isThisWeek);
      
      return matchesSearch && matchesStatus && matchesTime;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handleCopyPasskey = (passkey: string) => {
    navigator.clipboard.writeText(passkey);
    toast({
      title: "Passkey Copied",
      description: "The passkey has been copied to your clipboard",
    });
  };

  const handleReauthorize = (violation: SecurityViolation) => {
    setIsReauthorizing(violation.passkey);
    
    // Clear the security violation
    const success = clearSecurityViolation(
      violation.studentId,
      violation.examId,
      violation.passkey
    );
    
    if (success) {
      // Update local state
      const updatedViolations = securityViolations.map(v => {
        if (v.passkey === violation.passkey) {
          return {
            ...v,
            cleared: true,
            clearedAt: new Date().toISOString()
          };
        }
        return v;
      });
      
      setSecurityViolations(updatedViolations);
      
      toast({
        title: "Student Reauthorized",
        description: "The student can now re-enter the exam using their passkey.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Reauthorization Failed",
        description: "Could not reauthorize the student. Please try again.",
      });
    }
    
    setIsReauthorizing(null);
  };

  const handleViewDetails = (violation: SecurityViolation) => {
    setSelectedViolation(violation);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy 'at' h:mm:ss a");
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    const diffSecs = Math.floor(diffMs / 1000);
    if (diffSecs < 60) return `${diffSecs} seconds ago`;
    
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    
    return formatDate(dateString);
  };

  return (
    <RoleProtected allowedRoles={["admin"]}>
      {/* Fixed Return to Dashboard button */}
      <div className="fixed top-4 left-4 z-10">
        <Button
          variant="outline"
          className="flex items-center gap-2 shadow-md"
          asChild
        >
          <Link href="/dashboard/admin">
            <ArrowLeft className="h-4 w-4" /> Return to Dashboard
          </Link>
        </Button>
      </div>
      
      <div className="space-y-6 pt-20 px-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6" /> Security Activities
            </h1>
            <p className="text-muted-foreground">
              Monitor and manage student activities and security violations
            </p>
          </div>
          <Button 
            onClick={loadViolations} 
            variant="outline" 
            className="gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
        
        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by student, exam, reason..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-[150px] justify-between">
                    {statusFilter === "all" ? "All Status" :
                     statusFilter === "active" ? "Active" :
                     "Cleared"}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[150px]">
                  <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                    <DropdownMenuRadioItem value="all">All Status</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="active">Active</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="cleared">Cleared</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Time Period</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-[150px] justify-between">
                    {timeFilter === "all" ? "All Time" :
                     timeFilter === "today" ? "Today" :
                     "This Week"}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[150px]">
                  <DropdownMenuRadioGroup value={timeFilter} onValueChange={setTimeFilter}>
                    <DropdownMenuRadioItem value="all">All Time</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="today">Today</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="week">This Week</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </Card>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6">
          {isLoading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <div className="ml-auto flex gap-2">
                        <Skeleton className="h-9 w-24" />
                        <Skeleton className="h-9 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : filteredViolations.length === 0 ? (
            <Card className="p-8">
              <div className="text-center">
                <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">No Security Violations Found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== "all" || timeFilter !== "all" ?
                    "No violations match your search criteria. Try adjusting your filters." :
                    "There are no security violations recorded in the system."
                  }
                </p>
              </div>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Security Violations ({filteredViolations.length})</CardTitle>
                  <CardDescription>
                    Real-time tracking of exam security violations and passkey management
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Exam</TableHead>
                        <TableHead>Violation</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Passkey</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredViolations.map((violation, index) => (
                        <TableRow 
                          key={violation.passkey} 
                          className={cn(
                            "transition-colors",
                            violation.cleared ? "bg-green-50/50 dark:bg-green-950/20" : "bg-red-50/50 dark:bg-red-950/20"
                          )}
                        >
                          <TableCell className="whitespace-nowrap align-top">
                            <div className="flex items-center">
                              <Clock className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                              <div>
                                <div className="text-xs font-medium">{getTimeAgo(violation.timestamp)}</div>
                                <div className="text-xs text-muted-foreground">{formatDate(violation.timestamp)}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="align-top">
                            <div className="flex items-center gap-2">
                              <div className="bg-primary/10 p-1 rounded-full">
                                <User className="h-3.5 w-3.5 text-primary" />
                              </div>
                              <div>
                                <div className="font-medium">{violation.studentName}</div>
                                <div className="text-xs text-muted-foreground">ID: {violation.studentId}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="align-top">
                            <div className="flex items-center gap-2">
                              <div className="bg-blue-100 dark:bg-blue-900 p-1 rounded-full">
                                <BookOpen className="h-3.5 w-3.5 text-blue-700 dark:text-blue-300" />
                              </div>
                              <div>
                                <div className="font-medium">{violation.examTitle || "Unknown Exam"}</div>
                                <div className="text-xs text-muted-foreground">ID: {violation.examId}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="align-top">
                            <div className="max-w-[200px] break-words">
                              <div className="text-sm">
                                {violation.reason}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="align-top">
                            <Badge 
                              variant={violation.cleared ? "outline" : "destructive"} 
                              className={cn(
                                violation.cleared && "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                              )}
                            >
                              {violation.cleared ? "Cleared" : "Active"}
                            </Badge>
                            {violation.cleared && violation.clearedAt && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {getTimeAgo(violation.clearedAt)}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="align-top">
                            <div className="font-mono text-xs flex items-center gap-1">
                              <Key className="h-3 w-3 text-amber-600" />
                              {violation.passkey}
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-5 w-5 p-0 ml-1"
                                onClick={() => handleCopyPasskey(violation.passkey)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="align-top">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 gap-1"
                                onClick={() => handleViewDetails(violation)}
                              >
                                <Eye className="h-3.5 w-3.5" />
                                Details
                              </Button>
                              
                              {!violation.cleared && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 gap-1 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                                  onClick={() => handleReauthorize(violation)}
                                  disabled={isReauthorizing === violation.passkey}
                                >
                                  {isReauthorizing === violation.passkey ? (
                                    <>
                                      <RefreshCcw className="h-3.5 w-3.5 animate-spin" />
                                      Processing...
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="h-3.5 w-3.5" />
                                      Reauthorize
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Selected Violation Details */}
              {selectedViolation && (
                <Card className="border-primary/20">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-amber-500" />
                          Violation Details
                        </CardTitle>
                        <CardDescription>
                          Detailed information about the security violation
                        </CardDescription>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => setSelectedViolation(null)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 6 6 18"></path>
                          <path d="m6 6 12 12"></path>
                        </svg>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Student Information</h3>
                          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
                            <div className="bg-muted h-9 w-9 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">{selectedViolation.studentName}</div>
                              <div className="text-sm text-muted-foreground">ID: {selectedViolation.studentId}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Exam Information</h3>
                          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
                            <div className="bg-muted h-9 w-9 rounded-full flex items-center justify-center">
                              <BookOpen className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">{selectedViolation.examTitle || "Unknown Exam"}</div>
                              <div className="text-sm text-muted-foreground">ID: {selectedViolation.examId}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Passkey Information</h3>
                          <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md">
                            <div className="bg-amber-100 dark:bg-amber-900 h-9 w-9 rounded-full flex items-center justify-center">
                              <Key className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">Unique Passkey</div>
                              <div className="font-mono text-lg tracking-wider">{selectedViolation.passkey}</div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleCopyPasskey(selectedViolation.passkey)}
                            >
                              <Copy className="h-4 w-4 mr-1" />
                              Copy
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Violation Details</h3>
                          <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
                            <div className="flex items-center mb-2">
                              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                              <span className="font-medium text-red-700 dark:text-red-400">
                                Security Violation
                              </span>
                            </div>
                            <p className="text-sm text-red-800 dark:text-red-300 mb-2">
                              {selectedViolation.reason}
                            </p>
                            <div className="flex items-center text-xs text-red-600 dark:text-red-400">
                              <Calendar className="h-3.5 w-3.5 mr-1" />
                              <span>Occurred on {formatDate(selectedViolation.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Status Information</h3>
                          <div className={cn(
                            "p-3 rounded-md border",
                            selectedViolation.cleared 
                              ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800" 
                              : "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
                          )}>
                            <div className="flex items-center mb-2">
                              {selectedViolation.cleared ? (
                                <>
                                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                                  <span className="font-medium text-green-700 dark:text-green-400">
                                    Reauthorized
                                  </span>
                                </>
                              ) : (
                                <>
                                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-2" />
                                  <span className="font-medium text-amber-700 dark:text-amber-400">
                                    Waiting for Authorization
                                  </span>
                                </>
                              )}
                            </div>
                            
                            {selectedViolation.cleared ? (
                              <div className="text-sm text-green-800 dark:text-green-300">
                                <p>This student has been reauthorized to continue the exam.</p>
                                <div className="flex items-center text-xs mt-2">
                                  <Clock className="h-3.5 w-3.5 mr-1" />
                                  <span>Reauthorized on {formatDate(selectedViolation.clearedAt || "")}</span>
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm text-amber-800 dark:text-amber-300">
                                <p>This student needs your authorization to re-enter the exam.</p>
                                <div className="mt-3">
                                  <Button 
                                    onClick={() => handleReauthorize(selectedViolation)}
                                    disabled={isReauthorizing === selectedViolation.passkey}
                                    className="gap-2"
                                  >
                                    {isReauthorizing === selectedViolation.passkey ? (
                                      <>
                                        <RefreshCcw className="h-4 w-4 animate-spin" />
                                        Processing...
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle className="h-4 w-4" />
                                        Reauthorize Student
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Admin Notes</h3>
                          <div className="border rounded-md p-3">
                            <textarea
                              placeholder="Add notes about this violation (not saved in this prototype)"
                              className="w-full h-20 bg-transparent resize-none focus:outline-none"
                            ></textarea>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </RoleProtected>
  );
} 