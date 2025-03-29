"use client";

import { useState, Suspense } from "react";
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

// Create a client component that uses searchParams
function PasskeyEntryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const examId = searchParams.get("examId");
  const { toast } = useToast();
  
  const [passkey, setPasskey] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // In a real app, we would get the student ID from the authentication system
  const studentId = "current-user-id";
  
  const handleVerifyPasskey = async () => {
    if (!passkey) return;
    
    setIsVerifying(true);
    
    try {
      const isValid = await verifyPasskey(examId || '', passkey, studentId);
      
      if (isValid) {
        setSuccess(true);
        toast({
          title: "Passkey verified",
          description: "Redirecting to exam..."
        });
        
        // Clear any security violations from previous attempts
        clearSecurityViolation(examId || '', studentId);
        
        // Redirect to exam page after a short delay
        setTimeout(() => {
          router.push(`/dashboard/student/exams/${examId}`);
        }, 1500);
      } else {
        toast({
          title: "Invalid passkey",
          description: "Please check the passkey and try again",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error verifying passkey:', error);
      toast({
        title: "Error verifying passkey",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };
  
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-start mb-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/student/exams" className="flex items-center gap-2 text-muted-foreground">
                <ArrowLeft className="h-4 w-4" /> Back to Exams
              </Link>
            </Button>
          </div>
          <CardTitle className="flex items-center gap-2">
            <LockKeyhole className="h-5 w-5 text-amber-500" />
            Exam Security Check
          </CardTitle>
          <CardDescription>
            Enter the passkey provided by your instructor to access the exam
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {success ? (
            <Alert className="bg-green-50 border-green-200">
              <AlertTitle className="text-green-800">Passkey verified successfully!</AlertTitle>
              <AlertDescription className="text-green-700">
                Redirecting you to the exam...
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="passkey">Exam Passkey</Label>
                <Input
                  id="passkey"
                  placeholder="Enter passkey"
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerifyPasskey()}
                />
              </div>
              
              <Button 
                className="w-full" 
                onClick={handleVerifyPasskey}
                disabled={isVerifying || !passkey}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Passkey'
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Main component with suspense boundary
export default function PasskeyEntry() {
  return (
    <RoleProtected allowedRoles={["student", "admin"]}>
      <Suspense fallback={<div>Loading...</div>}>
        <PasskeyEntryContent />
      </Suspense>
    </RoleProtected>
  );
} 