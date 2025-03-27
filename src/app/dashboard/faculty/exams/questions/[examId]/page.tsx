"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RoleProtected } from "@/components/role-protected";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save,
  CheckCircle,
  AlertCircle 
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import React from "react";

// Define interfaces for our data
interface ExamOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

interface ExamQuestion {
  id: string;
  text: string;
  options: ExamOption[];
  correctAnswer?: string;
}

interface Exam {
  id: string;
  title: string;
  course: string;
  description?: string;
  createdAt: Date;
  scheduledFor: Date;
  duration: number;
  numQuestions: number;
  maxAttempts: number;
  passingScore?: number;
  status: string;
  questions?: ExamQuestion[];
}

export default function ManageQuestions({ params }: { params: { examId: string } }) {
  // Use React.use with proper typing
  const unwrappedParams = React.use(params as any) as { examId: string };
  const examId = unwrappedParams.examId;
  
  const router = useRouter();
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  // Fetch exam data from localStorage or mock data
  useEffect(() => {
    const fetchExam = () => {
      setLoading(true);
      
      try {
        // Try to get the exam from localStorage first
        const savedExams = JSON.parse(localStorage.getItem('facultyExams') || '[]');
        const foundExam = savedExams.find((e: any) => e.id === examId);
        
        // If found in localStorage
        if (foundExam) {
          // Parse date strings back to Date objects
          const parsedExam = {
            ...foundExam,
            createdAt: new Date(foundExam.createdAt),
            scheduledFor: new Date(foundExam.scheduledFor)
          };
          setExam(parsedExam);
          setQuestions(parsedExam.questions || []);
        } 
        // If not found in localStorage, check if it's one of the mock exams
        else if (examId === "1" || examId === "2" || examId === "3") {
          // Mock data for exam 1
          const mockExam = {
            id: "1",
            title: "Midterm Examination on Web Development",
            course: "CSC301: Web Development",
            description: "This examination covers HTML, CSS, JavaScript, and React fundamentals.",
            createdAt: new Date("2023-10-15"),
            scheduledFor: new Date("2023-11-20"),
            duration: 120,
            numQuestions: 3,
            maxAttempts: 1,
            passingScore: 70,
            status: "scheduled",
            questions: [
              {
                id: "q1",
                text: "Which of the following is NOT a JavaScript data type?",
                options: [
                  { id: "a", text: "String" },
                  { id: "b", text: "Boolean" },
                  { id: "c", text: "Float" },
                  { id: "d", text: "Symbol" },
                ],
                correctAnswer: "c",
              },
              {
                id: "q2",
                text: "Which CSS property is used to change the text color?",
                options: [
                  { id: "a", text: "color" },
                  { id: "b", text: "text-color" },
                  { id: "c", text: "font-color" },
                  { id: "d", text: "text-style" },
                ],
                correctAnswer: "a",
              },
              {
                id: "q3",
                text: "Which HTML tag is used to create a hyperlink?",
                options: [
                  { id: "a", text: "<link>" },
                  { id: "b", text: "<a>" },
                  { id: "c", text: "<href>" },
                  { id: "d", text: "<url>" },
                ],
                correctAnswer: "b",
              },
            ],
          };
          setExam(mockExam);
          setQuestions(mockExam.questions || []);
        } 
        // If not found anywhere
        else {
          console.error('Exam not found');
          router.push('/dashboard/faculty/exams');
        }
      } catch (error) {
        console.error('Error fetching exam:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [examId, router]);

  const handleQuestionTextChange = (questionId: string, text: string) => {
    setQuestions(
      questions.map(q => 
        q.id === questionId 
          ? { ...q, text } 
          : q
      )
    );
  };

  const handleOptionTextChange = (questionId: string, optionId: string, text: string) => {
    setQuestions(
      questions.map(q => 
        q.id === questionId 
          ? { 
              ...q, 
              options: q.options.map(o => 
                o.id === optionId 
                  ? { ...o, text } 
                  : o
              )
            } 
          : q
      )
    );
  };

  const handleCorrectAnswerChange = (questionId: string, optionId: string) => {
    setQuestions(
      questions.map(q => 
        q.id === questionId 
          ? { 
              ...q, 
              correctAnswer: optionId,
              options: q.options.map(o => 
                o.id === optionId 
                  ? { ...o, isCorrect: true } 
                  : { ...o, isCorrect: false }
              )
            } 
          : q
      )
    );
  };

  const addQuestion = () => {
    const newQuestionId = `q${Date.now()}`;
    const newQuestion: ExamQuestion = {
      id: newQuestionId,
      text: "",
      options: [
        { id: `${newQuestionId}-a`, text: "", isCorrect: false },
        { id: `${newQuestionId}-b`, text: "", isCorrect: false },
        { id: `${newQuestionId}-c`, text: "", isCorrect: false },
        { id: `${newQuestionId}-d`, text: "", isCorrect: false },
      ],
    };
    
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q.id !== questionId));
    setDeleteDialogOpen(false);
    setQuestionToDelete(null);
  };

  const confirmDeleteQuestion = (questionId: string) => {
    setQuestionToDelete(questionId);
    setDeleteDialogOpen(true);
  };

  const saveChanges = async () => {
    if (!exam) return;
    
    setSaving(true);
    
    try {
      // Validate questions
      const hasEmptyQuestions = questions.some(q => !q.text.trim());
      const hasEmptyOptions = questions.some(q => 
        q.options.some(o => !o.text.trim())
      );
      const hasMissingCorrectAnswers = questions.some(q => 
        !q.correctAnswer && !q.options.some(o => o.isCorrect)
      );
      
      if (hasEmptyQuestions || hasEmptyOptions || hasMissingCorrectAnswers) {
        alert("Please fill in all question texts, option texts, and select correct answers.");
        setSaving(false);
        return;
      }
      
      // Save to localStorage
      const savedExams = JSON.parse(localStorage.getItem('facultyExams') || '[]');
      
      // Handle mock exams differently
      if (["1", "2", "3"].includes(exam.id)) {
        // Create a new exam based on the mock one
        const newExamId = `exam-${Date.now()}`;
        const newExam = {
          ...exam,
          id: newExamId,
          createdAt: new Date(),
          numQuestions: questions.length,
          questions: questions
        };
        
        savedExams.push(newExam);
        localStorage.setItem('facultyExams', JSON.stringify(savedExams));
        
        // Show success alert
        setShowSuccessAlert(true);
        setTimeout(() => setShowSuccessAlert(false), 3000);
        
        // Redirect to the new exam
        router.push(`/dashboard/faculty/exams/${newExamId}`);
      } else {
        // Update existing exam
        const examIndex = savedExams.findIndex((e: any) => e.id === exam.id);
        
        if (examIndex >= 0) {
          savedExams[examIndex] = {
            ...savedExams[examIndex],
            numQuestions: questions.length,
            questions: questions
          };
          
          localStorage.setItem('facultyExams', JSON.stringify(savedExams));
          
          // Show success alert
          setShowSuccessAlert(true);
          setTimeout(() => setShowSuccessAlert(false), 3000);
        } else {
          throw new Error("Exam not found in localStorage");
        }
      }
    } catch (error) {
      console.error("Error saving questions:", error);
      setShowErrorAlert(true);
      setTimeout(() => setShowErrorAlert(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading exam questions...</p>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <p className="text-lg text-red-600">Exam not found</p>
          <Button 
            className="mt-4" 
            onClick={() => router.push('/dashboard/faculty/exams')}
          >
            Back to Exams
          </Button>
        </div>
      </div>
    );
  }

  return (
    <RoleProtected allowedRoles={["faculty", "admin"]}>
      <div className="container mx-auto py-8">
        <Button
          variant="ghost"
          className="mb-4 flex items-center gap-2"
          onClick={() => router.push(`/dashboard/faculty/exams/${examId}`)}
        >
          <ArrowLeft className="h-4 w-4" /> Back to Exam Details
        </Button>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Manage Questions</h1>
            <p className="text-gray-500">{exam.title} - {exam.course}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="default"
              className="flex items-center gap-2"
              onClick={saveChanges}
              disabled={saving}
            >
              {saving ? (
                <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>

        {/* Success alert */}
        {showSuccessAlert && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-600">Success</AlertTitle>
            <AlertDescription className="text-green-600">
              Questions saved successfully!
            </AlertDescription>
          </Alert>
        )}

        {/* Error alert */}
        {showErrorAlert && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-600">Error</AlertTitle>
            <AlertDescription className="text-red-600">
              Failed to save questions. Please try again.
            </AlertDescription>
          </Alert>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Questions ({questions.length})</CardTitle>
            <CardDescription>
              Create and manage multiple-choice questions for this exam
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {questions.length === 0 ? (
              <div className="text-center p-6">
                <p className="text-muted-foreground mb-4">No questions yet. Add your first question below.</p>
              </div>
            ) : (
              questions.map((question, index) => (
                <div key={question.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">Question {index + 1}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => confirmDeleteQuestion(question.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`question-${question.id}`}>Question Text</Label>
                    <Textarea
                      id={`question-${question.id}`}
                      value={question.text}
                      onChange={(e) => handleQuestionTextChange(question.id, e.target.value)}
                      placeholder="Enter your question here"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Answer Options</Label>
                    {question.options.map((option, optionIndex) => (
                      <div key={option.id} className="flex items-start space-x-2">
                        <input
                          type="radio"
                          id={`option-${option.id}`}
                          name={`question-${question.id}-correct`}
                          checked={option.isCorrect || option.id === question.correctAnswer}
                          onChange={() => handleCorrectAnswerChange(question.id, option.id)}
                          className="mt-2.5"
                        />
                        <div className="flex-1">
                          <Label htmlFor={`option-${option.id}-text`} className="sr-only">
                            Option {['A', 'B', 'C', 'D'][optionIndex] || optionIndex + 1}
                          </Label>
                          <Input
                            id={`option-${option.id}-text`}
                            value={option.text}
                            onChange={(e) => handleOptionTextChange(question.id, option.id, e.target.value)}
                            placeholder={`Option ${['A', 'B', 'C', 'D'][optionIndex] || optionIndex + 1}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}

            <Button onClick={addQuestion} variant="outline" className="w-full">
              <Plus className="mr-2 h-4 w-4" /> Add New Question
            </Button>
          </CardContent>
        </Card>

        {/* Delete Question Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Question</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this question? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setQuestionToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => questionToDelete && removeQuestion(questionToDelete)}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RoleProtected>
  );
} 