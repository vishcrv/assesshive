"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { RoleProtected } from "@/components/role-protected";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { generateRandomPasskey } from "@/lib/passkey-utils";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

// Determine OS for key detection
const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
const isWindows = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('WIN') >= 0;
const isLinux = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('LINUX') >= 0;

interface ExamQuestion {
  id: string;
  text: string;
  options: {
    id: string;
    text: string;
  }[];
  correctOptionId?: string;
}

interface Exam {
  id: string;
  title: string;
  course: string;
  description: string;
  scheduledFor: string;
  duration: number;
  maxAttempts: number;
  passingScore: number;
  numQuestions: number;
  questions: ExamQuestion[];
  status: string;
}

export default function ExamPage() {
  const { examId } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  
  // Security-related state
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showSecurityViolation, setShowSecurityViolation] = useState(false);
  const [securityViolationReason, setSecurityViolationReason] = useState("");
  const [generatedPasskey, setGeneratedPasskey] = useState("");
  
  // References for security monitoring
  const documentRef = useRef<Document | null>(null);
  const fullScreenElement = useRef<Element | null>(null);
  
  // Initialize document reference once component mounts
  useEffect(() => {
    documentRef.current = document;
  }, []);

  // Load exam data
  useEffect(() => {
    if (!examId) return;
    
    const fetchExam = () => {
      try {
        // Fetch from localStorage
        const exams = JSON.parse(localStorage.getItem("facultyExams") || "[]");
        const foundExam = exams.find((e: Exam) => e.id === examId);
        
        if (foundExam) {
          setExam(foundExam);
          setQuestions(foundExam.questions || []);
          setTimeLeft(foundExam.duration * 60); // Convert minutes to seconds
          setIsLoading(false);
        } else {
          toast({
            variant: "destructive",
            title: "Exam not found",
            description: "The requested exam could not be loaded."
          });
          router.push("/dashboard/student/exams");
        }
      } catch (error) {
        console.error("Error loading exam:", error);
        toast({
          variant: "destructive",
          title: "Error loading exam",
          description: "There was a problem loading the exam data."
        });
        setIsLoading(false);
      }
    };

    fetchExam();
  }, [examId, router, toast]);

  // Timer effect
  useEffect(() => {
    if (!exam || timeLeft <= 0 || examSubmitted || showSecurityViolation) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam(); // Auto-submit when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [exam, timeLeft, examSubmitted, showSecurityViolation]);
  
  // Request and monitor full screen
  useEffect(() => {
    const requestFullScreen = async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
          setIsFullScreen(true);
          fullScreenElement.current = document.fullscreenElement;
        }
      } catch (err) {
        console.error('Error attempting to enable full-screen mode:', err);
        logSecurityViolation("Failed to enter full-screen mode");
      }
    };
    
    if (!isLoading && exam && !examSubmitted && !showSecurityViolation) {
      requestFullScreen();
    }
    
    // Check if we're still in full screen
    const checkFullScreen = () => {
      if (!document.fullscreenElement && !showSecurityViolation && !examSubmitted) {
        // User has exited full screen
        logSecurityViolation("Exited full-screen mode during exam");
      }
    };
    
    // Monitor tab visibility
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !showSecurityViolation && !examSubmitted) {
        logSecurityViolation("Tab changed or minimized during exam");
      }
    };
    
    document.addEventListener('fullscreenchange', checkFullScreen);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', checkFullScreen);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isLoading, exam, examSubmitted, showSecurityViolation]);
  
  // Monitor key combinations
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showSecurityViolation || examSubmitted) return; // Skip if already showing violation
      
      // Detect Alt+Tab (Windows/Linux)
      if ((e.altKey && e.key === 'Tab') || 
          // Detect Command+Tab (Mac)
          (e.metaKey && e.key === 'Tab') ||
          // Detect Alt+F4 (Windows)
          (e.altKey && e.key === 'F4') ||
          // Detect Command+W (Mac)
          (e.metaKey && e.key === 'w') ||
          // Detect F11 (common fullscreen toggle)
          (e.key === 'F11') ||
          // Detect ESC (might exit fullscreen)
          (e.key === 'Escape') ||
          // Detect print screen
          (e.key === 'PrintScreen') ||
          // Detect Ctrl+P (Print)
          (e.ctrlKey && e.key === 'p') ||
          // Detect Command+P (Print on Mac)
          (e.metaKey && e.key === 'p') ||
          // Detect Ctrl+Shift+I (Developer Tools)
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          // Detect Command+Option+I (Developer Tools on Mac)
          (e.metaKey && e.altKey && e.key === 'i') ||
          // Detect F12 (Developer Tools)
          (e.key === 'F12')) {
        
        e.preventDefault();
        
        const violationReason = `Attempted to use restricted key combination: ${
          e.altKey ? 'Alt+' : ''
        }${
          e.ctrlKey ? 'Ctrl+' : ''
        }${
          e.metaKey ? 'Command+' : ''
        }${
          e.shiftKey ? 'Shift+' : ''
        }${e.key}`;
        
        logSecurityViolation(violationReason);
        return false;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown, true);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [showSecurityViolation, examSubmitted]);
  
  // Function to log security violations
  const logSecurityViolation = useCallback((reason: string) => {
    if (showSecurityViolation) return; // Prevent multiple violations at once
    
    // Generate a unique passkey for re-entry
    const passkey = generateRandomPasskey();
    setGeneratedPasskey(passkey);
    
    // Record the violation with timestamp and details
    const violation = {
      examId: examId,
      studentId: "student123", // In a real app, this would be the authenticated user ID
      timestamp: new Date().toISOString(),
      reason: reason,
      passkey: passkey,
      cleared: false
    };
    
    // Save to localStorage
    try {
      const currentViolations = JSON.parse(localStorage.getItem('securityViolations') || '[]');
      currentViolations.push(violation);
      localStorage.setItem('securityViolations', JSON.stringify(currentViolations));
    } catch (error) {
      console.error('Error saving security violation:', error);
    }
    
    // Update state to show violation screen
    setSecurityViolationReason(reason);
    setShowSecurityViolation(true);
    
    // Try to exit full screen mode
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => {
        console.error('Error exiting fullscreen:', err);
      });
    }
  }, [examId, showSecurityViolation]);

  const formatTimeRemaining = () => {
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;
    
    return `${hours > 0 ? `${hours}h ` : ''}${minutes}m ${seconds}s`;
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleAnswerSelect = (questionId: string, optionId: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleOpenSubmitDialog = () => {
    setIsSubmitDialogOpen(true);
  };
  
  const handleSubmitExam = async () => {
    setIsSubmitting(true);
    setIsSubmitDialogOpen(false);
    
    try {
      // Calculate score
      let correctAnswers = 0;
      
      questions.forEach(question => {
        if (question.correctOptionId && selectedAnswers[question.id] === question.correctOptionId) {
          correctAnswers++;
        }
      });
      
      const totalQuestions = questions.length;
      const calculatedScore = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
      
      setScore(calculatedScore);
      
      // Save exam attempt to localStorage
      const attempt = {
        examId: examId,
        date: new Date().toISOString(),
        score: calculatedScore,
        answers: selectedAnswers,
        timeSpent: exam?.duration ? (exam.duration * 60) - timeLeft : 0,
        isPassing: calculatedScore >= (exam?.passingScore || 0)
      };
      
      try {
        const studentAttempts = JSON.parse(localStorage.getItem('studentAttempts') || '[]');
        studentAttempts.push(attempt);
        localStorage.setItem('studentAttempts', JSON.stringify(studentAttempts));
      } catch (error) {
        console.error('Error saving exam attempt:', error);
      }
      
      // Exit full screen if needed
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      
      setExamSubmitted(true);
    } catch (error) {
      console.error('Error submitting exam:', error);
      toast({
        variant: "destructive",
        title: "Error submitting exam",
        description: "There was a problem submitting your exam. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateProgress = () => {
    return Object.keys(selectedAnswers).length / questions.length * 100;
  };

  const handleReturnToDashboard = () => {
    router.push('/dashboard/student/exams');
  };
  
  if (isLoading) {
    return (
      <RoleProtected allowedRoles={["student"]}>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-[600px] max-w-full">
            <CardHeader>
              <CardTitle>Loading Exam</CardTitle>
              <CardDescription>Please wait while we prepare your exam...</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 flex justify-center">
              <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
            </CardContent>
          </Card>
        </div>
      </RoleProtected>
    );
  }
  
  if (showSecurityViolation) {
    return (
      <RoleProtected allowedRoles={["student"]}>
        <div className="flex items-center justify-center min-h-screen bg-red-50 dark:bg-red-950/20">
          <Card className="w-[600px] max-w-full border-red-300 dark:border-red-800">
            <CardHeader className="bg-red-100 dark:bg-red-900/30">
              <CardTitle className="flex items-center text-red-700 dark:text-red-300">
                <AlertTriangle className="h-6 w-6 mr-2 text-red-600 dark:text-red-400" />
                Security Violation Detected
              </CardTitle>
              <CardDescription className="text-red-600 dark:text-red-400">
                You have been logged out of the exam due to a security violation
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 pb-2">
              <div className="space-y-4">
                <div className="p-3 border border-red-200 dark:border-red-800 rounded-md bg-red-50 dark:bg-red-950/30">
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">
                    Violation detected: {securityViolationReason}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Your exam session has been terminated</h3>
                  <p>Due to a security violation, you have been logged out of your exam. This incident has been reported to your administrator.</p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">To resume the exam:</h4>
                  <ol className="ml-6 space-y-1 list-decimal">
                    <li>Contact your administrator or faculty member</li>
                    <li>Show them this screen with your passkey</li>
                    <li>If approved, they will authorize you to continue</li>
                    <li>Use the passkey below to re-enter the exam</li>
                  </ol>
                </div>
                
                <div className="mt-6">
                  <Label className="text-xs text-muted-foreground mb-1 block">Your Passkey:</Label>
                  <div className="p-3 bg-amber-100 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md font-mono tracking-wider text-center text-xl">
                    {generatedPasskey}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Make a note of this passkey as you will need it to re-enter the exam after administrator approval.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <Button 
                variant="outline" 
                onClick={handleReturnToDashboard}
              >
                Return to Dashboard
              </Button>
              <Button asChild>
                <Link href={`/dashboard/student/exams/passkey?examId=${examId}`}>
                  Enter Passkey
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </RoleProtected>
    );
  }

  if (examSubmitted) {
    const isPassing = score >= (exam?.passingScore || 0);
    
    return (
      <RoleProtected allowedRoles={["student"]}>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-[600px] max-w-full">
            <CardHeader className={cn(
              isPassing ? "bg-green-50 dark:bg-green-900/20" : "bg-amber-50 dark:bg-amber-900/20",
              "border-b"
            )}>
              <CardTitle className="flex items-center">
                {isPassing ? (
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertTriangle className="h-5 w-5 mr-2 text-amber-600 dark:text-amber-400" />
                )}
                Exam Complete
              </CardTitle>
              <CardDescription>{exam?.title}</CardDescription>
            </CardHeader>
            <CardContent className="py-6">
              <div className="flex flex-col items-center justify-center">
                <div className={cn(
                  "text-5xl font-bold mb-4",
                  isPassing ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"
                )}>
                  {score}%
                </div>
                <Badge variant={isPassing ? "outline" : "secondary"} className={cn(
                  isPassing 
                    ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400" 
                    : "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400"
                )}>
                  {isPassing 
                    ? `Passed (minimum: ${exam?.passingScore}%)` 
                    : `Failed (minimum: ${exam?.passingScore}%)`}
                </Badge>
              </div>
              
              <div className="mt-8 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Questions:</span>
                  <span>{questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Correct Answers:</span>
                  <span>{questions.filter(q => 
                    q.correctOptionId && selectedAnswers[q.id] === q.correctOptionId
                  ).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Unanswered Questions:</span>
                  <span>{questions.filter(q => !selectedAnswers[q.id]).length}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button onClick={handleReturnToDashboard} className="w-full">
                Return to Exams
              </Button>
            </CardFooter>
          </Card>
        </div>
      </RoleProtected>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <RoleProtected allowedRoles={["student"]}>
      <div className="min-h-screen flex flex-col">
        {/* Header with timer and progress */}
        <div className="sticky top-0 z-10 bg-background border-b">
          <div className="container mx-auto px-4 py-2">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-lg font-semibold">{exam?.title}</h1>
                <p className="text-sm text-muted-foreground">{exam?.course}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">{Object.keys(selectedAnswers).length}</span>/{questions.length} answered
                </div>
                <Progress value={calculateProgress()} className="w-24 h-2" />
                <Badge variant="secondary" className="gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatTimeRemaining()}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 container mx-auto px-4 py-6">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-medium">
                Question {currentQuestionIndex + 1} of {questions.length}
              </h2>
              <Badge variant="outline">
                {selectedAnswers[currentQuestion?.id] ? "Answered" : "Unanswered"}
              </Badge>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-xl">{currentQuestion?.text}</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={selectedAnswers[currentQuestion?.id] || ""}
                  onValueChange={(value) => handleAnswerSelect(currentQuestion?.id, value)}
                >
                  <div className="space-y-3">
                    {currentQuestion?.options.map((option, index) => (
                      <div
                        key={option.id}
                        className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer"
                      >
                        <RadioGroupItem value={option.id} id={option.id} />
                        <Label
                          htmlFor={option.id}
                          className="flex-1 cursor-pointer text-base"
                        >
                          {option.text}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> Previous
              </Button>

              {currentQuestionIndex < questions.length - 1 ? (
                <Button
                  onClick={handleNextQuestion}
                >
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleOpenSubmitDialog}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Exam"}
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Submit confirmation dialog */}
        <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Exam</DialogTitle>
              <DialogDescription>
                Are you sure you want to submit your exam? You won't be able to make any changes after submission.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Questions:</span>
                  <span className="font-medium">{questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Answered:</span>
                  <span className="font-medium">{Object.keys(selectedAnswers).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Unanswered:</span>
                  <span className="font-medium">{questions.length - Object.keys(selectedAnswers).length}</span>
                </div>
              </div>
              
              {Object.keys(selectedAnswers).length < questions.length && (
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md">
                  <div className="flex gap-2 text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Warning: Unanswered Questions</p>
                      <p className="text-sm">You have {questions.length - Object.keys(selectedAnswers).length} unanswered questions. Unanswered questions will be marked as incorrect.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSubmitDialogOpen(false)}>
                Continue Exam
              </Button>
              <Button onClick={handleSubmitExam} disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Exam'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RoleProtected>
  );
} 