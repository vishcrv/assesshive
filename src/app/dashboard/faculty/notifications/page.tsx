"use client";

import { useState, useEffect } from "react";
import { RoleProtected } from "@/components/role-protected";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Bell, AlertTriangle, Clock, CheckCircle, X } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface SecurityViolation {
  examId: string;
  studentId: string;
  timestamp: string;
  reason: string;
  passkey: string;
  cleared?: boolean;
  clearedAt?: string;
}

export default function FacultyNotifications() {
  const [securityViolations, setSecurityViolations] = useState<SecurityViolation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("violations");
  const { toast } = useToast();

  useEffect(() => {
    // Load security violations from localStorage
    const loadViolations = () => {
      try {
        setIsLoading(true);
        const savedViolations = JSON.parse(localStorage.getItem('securityViolations') || '[]');
        setSecurityViolations(savedViolations);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading security violations:', error);
        toast({
          variant: "destructive",
          title: "Error Loading Notifications",
          description: "Failed to load notification data. Please refresh the page.",
        });
        setIsLoading(false);
      }
    };

    loadViolations();

    // Set up a refresh interval to check for new notifications
    const refreshInterval = setInterval(loadViolations, 30000); // Refresh every 30 seconds

    return () => clearInterval(refreshInterval);
  }, [toast]);

  // Filter violations to only include those from exams created by this faculty member
  // In a real app, this would be based on the actual faculty ID and exam ownership
  const filteredViolations = securityViolations
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Format the date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Get relative time (e.g. "2 hours ago")
  const getRelativeTime = (dateString: string) => {
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
    <RoleProtected allowedRoles={["faculty"]}>
      {/* Fixed Return to Dashboard button */}
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
      <div className="space-y-6 pt-20 px-6 max-w-5xl mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Bell className="h-6 w-6" /> Notifications
            </h1>
            <p className="text-muted-foreground">
              Stay informed about exam security and important events
            </p>
          </div>
        </div>

        <Tabs defaultValue="violations" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="violations" className="relative">
              Security Violations
              {filteredViolations.filter(v => !v.cleared).length > 0 && (
                <Badge 
                  variant="destructive" 
                  className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full text-xs"
                >
                  {filteredViolations.filter(v => !v.cleared).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all">All Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="violations" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                <p>Loading notifications...</p>
              </div>
            ) : filteredViolations.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-1">No Security Violations</h3>
                  <p className="text-muted-foreground">
                    There are no security violations to report at this time
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredViolations.map((violation, index) => (
                  <Card key={index} className={cn(
                    "transition-all",
                    violation.cleared ? "opacity-70" : "shadow-md"
                  )}>
                    <CardHeader className="p-4 pb-0">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "rounded-full p-2 flex-shrink-0",
                            violation.cleared ? "bg-green-100" : "bg-red-100"
                          )}>
                            {violation.cleared ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-red-600" />
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-base font-medium">
                              Security Violation: {violation.reason}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              Student ID: {violation.studentId} • Exam ID: {violation.examId}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge 
                          variant={violation.cleared ? "outline" : "destructive"} 
                          className={cn(
                            "ml-2",
                            violation.cleared && "bg-green-50 text-green-700 border-green-200"
                          )}
                        >
                          {violation.cleared ? "Resolved" : "Active"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          <span title={new Date(violation.timestamp).toLocaleString()}>
                            {getRelativeTime(violation.timestamp)}
                          </span>
                        </div>
                        {violation.passkey && (
                          <div>
                            <span className="font-mono">Passkey: {violation.passkey}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all">
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-1">All Notifications</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  This tab will display all types of notifications including exam submissions, 
                  student questions, and system updates.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RoleProtected>
  );
} 