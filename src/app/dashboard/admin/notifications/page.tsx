"use client";

import { useState, useEffect } from "react";
import { RoleProtected } from "@/components/role-protected";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Bell, AlertTriangle, Clock, CheckCircle, Shield, X, Search, Filter } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { clearSecurityViolation } from "@/lib/passkey-utils";
import { format } from "date-fns";

interface SecurityViolation {
  examId: string;
  studentId: string;
  timestamp: string;
  reason: string;
  passkey: string;
  cleared?: boolean;
  clearedAt?: string;
}

export default function AdminNotifications() {
  const [securityViolations, setSecurityViolations] = useState<SecurityViolation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("violations");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCleared, setShowCleared] = useState(false);
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

  // Filter violations based on search term and cleared status
  const filteredViolations = securityViolations
    .filter(violation => {
      // Search filter
      const matchesSearch = searchTerm === "" || 
        violation.examId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        violation.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        violation.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        violation.passkey.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Cleared status filter
      const matchesCleared = showCleared || !violation.cleared;
      
      return matchesSearch && matchesCleared;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Format the date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMM d, yyyy HH:mm:ss");
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

  const handleCopyPasskey = (passkey: string) => {
    navigator.clipboard.writeText(passkey);
    toast({
      title: "Passkey Copied",
      description: "The passkey has been copied to your clipboard",
    });
  };

  const handleClearViolation = (violation: SecurityViolation) => {
    const success = clearSecurityViolation(
      violation.studentId,
      violation.examId,
      violation.passkey
    );
    
    if (success) {
      // Update the local state
      const updatedViolations = securityViolations.map(v => {
        if (v.studentId === violation.studentId && 
            v.examId === violation.examId && 
            v.passkey === violation.passkey) {
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
        title: "Violation Cleared",
        description: "Student can now re-enter the exam with this passkey",
        variant: "default",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to clear the security violation",
      });
    }
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
      
      {/* Main content with increased margins */}
      <div className="space-y-6 pt-20 px-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Bell className="h-6 w-6" /> System Notifications
            </h1>
            <p className="text-muted-foreground">
              Monitor security incidents and system notifications
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
            <TabsTrigger value="system">System Notifications</TabsTrigger>
            <TabsTrigger value="all">All Notifications</TabsTrigger>
          </TabsList>

          <div className="flex flex-col sm:flex-row gap-4 mb-4 items-center">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student ID, exam ID, or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showCleared"
                checked={showCleared}
                onChange={(e) => setShowCleared(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="showCleared" className="text-sm">Show Cleared</label>
            </div>
          </div>

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
                    {searchTerm ? 
                      "No violations match your search criteria" : 
                      "There are no security violations to report at this time"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredViolations.map((violation, index) => (
                  <Card key={index} className={cn(
                    "transition-all",
                    violation.cleared ? "border-green-200 bg-green-50/30 dark:bg-green-950/10" : "border-red-200 bg-red-50/30 dark:bg-red-950/10"
                  )}>
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "rounded-full p-2 flex-shrink-0",
                            violation.cleared ? "bg-green-100 dark:bg-green-900" : "bg-red-100 dark:bg-red-900"
                          )}>
                            {violation.cleared ? (
                              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-base font-medium flex items-center">
                              <Shield className="inline-block h-4 w-4 mr-1 text-red-500" />
                              Security Violation
                              <Badge 
                                variant={violation.cleared ? "outline" : "destructive"} 
                                className={cn(
                                  "ml-2",
                                  violation.cleared && "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                                )}
                              >
                                {violation.cleared ? "Resolved" : "Active"}
                              </Badge>
                            </CardTitle>
                            <CardDescription className="mt-1 text-sm text-muted-foreground">
                              {violation.reason}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1"
                            onClick={() => handleCopyPasskey(violation.passkey)}
                          >
                            Copy Passkey
                          </Button>
                          {!violation.cleared && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                              onClick={() => handleClearViolation(violation)}
                            >
                              Clear Violation
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Student:</span> {violation.studentId}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Exam:</span> {violation.examId}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Passkey:</span> 
                          <span className="font-mono ml-1">{violation.passkey}</span>
                        </div>
                      </div>
                      <Separator className="my-3" />
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          <span>Violation: {formatDate(violation.timestamp)}</span>
                        </div>
                        {violation.cleared && violation.clearedAt && (
                          <div className="flex items-center">
                            <CheckCircle className="h-3.5 w-3.5 mr-1 text-green-500" />
                            <span>Cleared: {formatDate(violation.clearedAt)}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="system">
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-1">System Notifications</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  This tab will display important system notifications, updates, and maintenance alerts.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all">
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-1">All Notifications</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  This tab will display all types of notifications from across the system.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RoleProtected>
  );
} 