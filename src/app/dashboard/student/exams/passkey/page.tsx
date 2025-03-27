"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RoleProtected } from "@/components/role-protected";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LockKeyhole, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { verifyPasskey, clearSecurityViolation } from "@/lib/passkey-utils";
import { useToast } from "@/components/ui/use-toast";

export default function PasskeyEntry() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const examId = searchParams.get("examId");
  const { toast } = useToast();
  
  const [passkey, setPasskey] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // In a real app, we would get the student ID from the authentication system
  const studentId = "current-user-id";
  
  const handlePasskeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passkey.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please enter a valid passkey",
      });
      return;
    }
    
    if (!examId) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Missing exam ID. Please try accessing this page from the exam link.",
      });
      return;
    }
    
    setIsVerifying(true);
    
    // Verify the passkey against stored security violations
    const isValid = verifyPasskey(studentId, examId, passkey);
    
    if (isValid) {
      // Clear the security violation to allow re-entry
      const cleared = clearSecurityViolation(studentId, examId, passkey);
      
      if (cleared) {
        setSuccess(true);
        toast({
          title: "Success",
          description: "Passkey verified. Redirecting you to your exam...",
        });
        
        // Redirect back to the exam after a short delay
        setTimeout(() => {
          router.push(`/dashboard/student/exams/${examId}`);
        }, 2000);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to clear security violation. Please contact your administrator.",
        });
      }
    } else {
      toast({
        variant: "destructive",
        title: "Invalid Passkey",
        description: "Please check and try again, or contact your administrator.",
      });
    }
    
    setIsVerifying(false);
  };
  
  const formatPasskey = (input: string) => {
    // Remove all non-alphanumeric characters
    const cleaned = input.replace(/[^A-Z0-9]/g, "");
    
    // Format with dashes after every 4 characters
    const segments = [];
    for (let i = 0; i < cleaned.length; i += 4) {
      segments.push(cleaned.slice(i, i + 4));
    }
    
    return segments.join("-");
  };
  
  const handlePasskeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value.toUpperCase();
    const formatted = formatPasskey(rawInput);
    setPasskey(formatted);
  };

  return (
    <RoleProtected allowedRoles={["student"]}>
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
        <div className="w-full max-w-md">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="mb-4"
          >
            <Link href="/dashboard/student/exams">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Exams
            </Link>
          </Button>
          
          <Card className="border shadow-md">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <LockKeyhole className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-center">Exam Access Restricted</CardTitle>
              <CardDescription className="text-center">
                Enter the passkey provided by your administrator to continue your exam
              </CardDescription>
            </CardHeader>
            <CardContent>
              {success ? (
                <Alert className="mb-4 bg-green-50 border-green-200 text-green-800">
                  <AlertTitle>Passkey Verified</AlertTitle>
                  <AlertDescription>
                    Access granted. Redirecting you back to your exam...
                    <div className="mt-2 flex justify-center">
                      <Loader2 className="animate-spin h-5 w-5" />
                    </div>
                  </AlertDescription>
                </Alert>
              ) : (
                <form onSubmit={handlePasskeySubmit}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="passkey">Administrator Passkey</Label>
                      <Input
                        id="passkey"
                        value={passkey}
                        onChange={handlePasskeyChange}
                        placeholder="XXXX-XXXX-XXXX"
                        className="text-center font-mono tracking-widest"
                        maxLength={14} // 12 characters + 2 dashes
                        disabled={isVerifying}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isVerifying || !passkey || passkey.length < 12}
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify Passkey"
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-center text-sm text-muted-foreground">
                <p>Need help? Contact your course administrator or faculty member.</p>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </RoleProtected>
  );
} 