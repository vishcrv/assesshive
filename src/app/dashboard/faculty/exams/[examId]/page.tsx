"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ArrowLeft, Clock, Calendar, FileText, MousePointerClick, PenLine, Trash } from "lucide-react"
import { RoleProtected } from "@/components/role-protected"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

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

// Mock data
const mockExam = {
  id: "1",
  title: "Midterm Examination on Web Development",
  course: "CSC301: Web Development",
  description: "This examination covers HTML, CSS, JavaScript, and React fundamentals.",
  createdAt: new Date("2023-10-15"),
  scheduledFor: new Date("2023-11-20"),
  duration: 120,
  numQuestions: 30,
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
}

// Helper function to get badge color based on status
const getStatusColor = (status: string) => {
  switch (status) {
    case "draft":
      return "bg-yellow-100 text-yellow-800"
    case "scheduled":
      return "bg-blue-100 text-blue-800"
    case "active":
      return "bg-green-100 text-green-800"
    case "completed":
      return "bg-purple-100 text-purple-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function ExamDetail({ params }: { params: { examId: string } }) {
  // Use React.use with proper typing
  const unwrappedParams = React.use(params as any) as { examId: string };
  const examId = unwrappedParams.examId;
  const router = useRouter()
  const [exam, setExam] = useState<Exam | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Fetch exam data from localStorage or mock data
  useEffect(() => {
    const fetchExam = () => {
      setLoading(true)
      
      // Try to get the exam from localStorage first
      try {
        const savedExams = JSON.parse(localStorage.getItem('facultyExams') || '[]')
        const foundExam = savedExams.find((e: any) => e.id === examId)
        
        // If found in localStorage
        if (foundExam) {
          // Parse date strings back to Date objects
          const parsedExam = {
            ...foundExam,
            createdAt: new Date(foundExam.createdAt),
            scheduledFor: new Date(foundExam.scheduledFor)
          }
          setExam(parsedExam)
        } 
        // If not found in localStorage, check if it's one of the mock exams
        else if (examId === "1" || examId === "2" || examId === "3") {
          setExam(mockExam)
        } 
        // If not found anywhere
        else {
          console.error('Exam not found')
          router.push('/dashboard/faculty/exams')
        }
      } catch (error) {
        console.error('Error fetching exam:', error)
        // Fallback to mock data
        setExam(mockExam)
      } finally {
        setLoading(false)
      }
    }

    fetchExam()
  }, [examId, router])

  const handleDelete = () => {
    // Delete the exam from localStorage
    try {
      const savedExams = JSON.parse(localStorage.getItem('facultyExams') || '[]')
      const updatedExams = savedExams.filter((e: any) => e.id !== examId)
      localStorage.setItem('facultyExams', JSON.stringify(updatedExams))
    } catch (error) {
      console.error('Error deleting exam:', error)
    }
    
    // Navigate back to exams list
    router.push("/dashboard/faculty/exams")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading exam...</p>
        </div>
      </div>
    )
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
    )
  }

  return (
    <RoleProtected allowedRoles={["faculty", "admin"]}>
      <div className="container mx-auto py-8">
        <Button
          variant="ghost"
          className="mb-4 flex items-center gap-2"
          onClick={() => router.push("/dashboard/faculty?tab=exams")}
        >
          <ArrowLeft className="h-4 w-4" /> Back to Faculty Dashboard
        </Button>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">{exam.title}</h1>
            <p className="text-gray-500">{exam.course}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => router.push(`/dashboard/faculty/exams/edit/${examId}`)}
            >
              <PenLine className="h-4 w-4" />
              Edit
            </Button>
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="flex items-center gap-2 text-white">
                  <Trash className="h-4 w-4" />
                  Delete
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-popover">
                <DialogHeader>
                  <DialogTitle>Confirm Deletion</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this exam? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDelete} className="text-white">
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Exam Details</CardTitle>
                <CardDescription>Information about the exam and its settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {exam.description && (
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Description</h2>
                    <p className="text-gray-700">{exam.description}</p>
                  </div>
                )}
                
                {exam.description && <Separator />}
                
                <div>
                  <h2 className="text-xl font-semibold mb-2">Settings</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Scheduled Date</p>
                        <p className="font-medium">{format(exam.scheduledFor, "MMMM d, yyyy")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Duration</p>
                        <p className="font-medium">{exam.duration} minutes</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Questions</p>
                        <p className="font-medium">{exam.numQuestions} questions</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MousePointerClick className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Max Attempts</p>
                        <p className="font-medium">{exam.maxAttempts} {exam.maxAttempts === 1 ? "attempt" : "attempts"}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {exam.passingScore && (
                  <>
                    <Separator />
                    <div>
                      <h2 className="text-xl font-semibold mb-2">Passing Score</h2>
                      <p className="font-medium">{exam.passingScore}%</p>
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter>
                <div className="flex items-center gap-2">
                  <p className="text-sm">Status:</p>
                  <Badge className={getStatusColor(exam.status)}>
                    {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                  </Badge>
                </div>
              </CardFooter>
            </Card>
          </div>
          
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Questions</CardTitle>
                <CardDescription>Preview of exam questions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {exam.questions ? (
                    exam.questions.map((question, index) => (
                      <div key={question.id} className="border rounded-md p-4">
                        <p className="font-medium mb-2">
                          Question {index + 1}: {question.text}
                        </p>
                        <div className="space-y-1 ml-4">
                          {question.options.map((option, optionIndex) => (
                            <div 
                              key={option.id} 
                              className="flex items-center gap-2"
                            >
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                                (option.isCorrect || option.id === question.correctAnswer) 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-gray-100 text-gray-800"
                              }`}>
                                {['A', 'B', 'C', 'D'][optionIndex] || optionIndex + 1}
                              </div>
                              <p className={
                                (option.isCorrect || option.id === question.correctAnswer) 
                                  ? "font-medium" 
                                  : ""
                              }>
                                {option.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      No questions available for this exam yet.
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => router.push(`/dashboard/faculty/exams/questions/${examId}`)}
                >
                  Manage Questions
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </RoleProtected>
  );
} 