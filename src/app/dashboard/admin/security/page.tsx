"use client";

import { useState, useEffect } from "react";
import { RoleProtected } from "@/components/role-protected";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, AlertTriangle, CheckCircle, Copy, RotateCcw } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { clearSecurityViolation } from "@/lib/passkey-utils";
import { format } from "date-fns";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
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

export default function SecurityManagement() {
  const [violations, setViolations] = useState<SecurityViolation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCleared, setShowCleared] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState<SecurityViolation | null>(null);
  const [manualPasskey, setManualPasskey] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Load security violations from localStorage
    try {
      setIsLoading(true);
      const savedViolations = JSON.parse(localStorage.getItem('securityViolations') || '[]');
      setViolations(savedViolations);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading security violations:', error);
      setIsLoading(false);
    }
  }, []);

  // Filter violations based on search term and show/hide cleared violations
  const filteredViolations = violations.filter(violation => {
    // Filter by search term
    const matchesSearch = 
      violation.examId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      violation.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      violation.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      violation.passkey.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by cleared status
    const matchesCleared = showCleared || !violation.cleared;
    
    return matchesSearch && matchesCleared;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

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
      const updatedViolations = violations.map(v => {
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
      
      setViolations(updatedViolations);
      
      toast({
        title: "Violation Cleared",
        description: "Student can now re-enter the exam with this passkey",
        variant: "default",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to clear the security violation",
        variant: "destructive",
      });
    }
  };

  const verifyManualPasskey = () => {
    // Find violation matching this passkey
    const matchingViolation = violations.find(v => v.passkey === manualPasskey);
    
    if (matchingViolation) {
      setSelectedViolation(matchingViolation);
      
      if (matchingViolation.cleared) {
        toast({
          title: "Passkey Already Used",
          description: "This passkey has already been cleared and used",
          variant: "default",
        });
      }
    } else {
      toast({
        title: "Invalid Passkey",
        description: "No security violation found with this passkey",
        variant: "destructive",
      });
    }
  };

  return (
    <RoleProtected allowedRoles={["admin"]}>
      {/* Return to Dashboard button positioned at the top-left */}
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
      <div className="space-y-6 pt-20 px-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Security Management</h1>
            <p className="text-muted-foreground">Monitor and manage exam security violations</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Security Violations Panel */}
          <div className="md:col-span-2 space-y-4">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
                  Security Violations
                </CardTitle>
                <CardDescription>
                  Recent security violations detected during exams
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <Label htmlFor="search" className="sr-only">Search</Label>
                    <Input
                      id="search"
                      placeholder="Search by student ID, exam ID, or passkey..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showCleared"
                      checked={showCleared}
                      onChange={(e) => setShowCleared(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="showCleared">Show Cleared Violations</Label>
                  </div>
                </div>
                
                {isLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p>Loading security violations...</p>
                  </div>
                ) : filteredViolations.length === 0 ? (
                  <div className="text-center py-8 border border-dashed rounded-lg">
                    <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-1">No Security Violations</h3>
                    <p className="text-muted-foreground text-sm">
                      {searchTerm ? "No violations match your search criteria" : "There are no security violations to display"}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Student</TableHead>
                          <TableHead>Exam</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredViolations.map((violation, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-mono text-xs">
                              {format(new Date(violation.timestamp), "MMM d, yyyy HH:mm:ss")}
                            </TableCell>
                            <TableCell>{violation.studentId}</TableCell>
                            <TableCell className="max-w-[100px] truncate">
                              <span title={violation.examId}>{violation.examId}</span>
                            </TableCell>
                            <TableCell className="max-w-[150px] truncate">
                              <span title={violation.reason}>{violation.reason}</span>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline" 
                                className={violation.cleared 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-red-100 text-red-800"
                                }
                              >
                                {violation.cleared ? "Cleared" : "Active"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleCopyPasskey(violation.passkey)}
                                  title="Copy Passkey"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                
                                {!violation.cleared && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleClearViolation(violation)}
                                    title="Clear Violation"
                                  >
                                    <RotateCcw className="h-4 w-4" />
                                  </Button>
                                )}
                                
                                <Button 
                                  size="sm"
                                  onClick={() => setSelectedViolation(violation)}
                                >
                                  Details
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Passkey Management Panel */}
          <div className="space-y-4">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Passkey Verification</CardTitle>
                <CardDescription>
                  Verify and manage student passkeys
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="passkey">Enter Passkey</Label>
                  <div className="flex gap-2">
                    <Input
                      id="passkey"
                      placeholder="XXXX-XXXX-XXXX"
                      value={manualPasskey}
                      onChange={(e) => setManualPasskey(e.target.value.toUpperCase())}
                    />
                    <Button
                      onClick={verifyManualPasskey}
                      disabled={!manualPasskey}
                    >
                      Verify
                    </Button>
                  </div>
                </div>
                
                {selectedViolation && (
                  <div className="border rounded-md p-4 space-y-3 bg-muted/30">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold">Violation Details</h3>
                      <Badge 
                        variant="outline" 
                        className={selectedViolation.cleared 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                        }
                      >
                        {selectedViolation.cleared ? "Cleared" : "Active"}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-muted-foreground">Student ID:</span>
                        <span className="ml-2">{selectedViolation.studentId}</span>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Exam ID:</span>
                        <span className="ml-2">{selectedViolation.examId}</span>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Timestamp:</span>
                        <span className="ml-2">{format(new Date(selectedViolation.timestamp), "MMM d, yyyy HH:mm:ss")}</span>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Reason:</span>
                        <span className="ml-2">{selectedViolation.reason}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium text-muted-foreground">Passkey:</span>
                        <code className="ml-2 font-mono bg-muted p-1 rounded text-sm">
                          {selectedViolation.passkey}
                        </code>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="ml-1 h-6 w-6 p-0"
                          onClick={() => handleCopyPasskey(selectedViolation.passkey)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      {selectedViolation.cleared && (
                        <div>
                          <span className="font-medium text-muted-foreground">Cleared At:</span>
                          <span className="ml-2">{format(new Date(selectedViolation.clearedAt!), "MMM d, yyyy HH:mm:ss")}</span>
                        </div>
                      )}
                    </div>
                    
                    {!selectedViolation.cleared && (
                      <Button 
                        className="w-full"
                        onClick={() => handleClearViolation(selectedViolation)}
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Clear Violation
                      </Button>
                    )}
                  </div>
                )}
                
                <Alert className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Important Note</AlertTitle>
                  <AlertDescription>
                    Clearing a security violation will allow the student to re-enter the exam using their passkey.
                    Make sure you verify the circumstances before clearing violations.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </RoleProtected>
  );
} 