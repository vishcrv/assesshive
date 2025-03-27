"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Clock, ArrowLeft } from "lucide-react"
import { RoleProtected } from "@/components/role-protected"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

// Mock data for initial state
const mockExam = {
  id: "1",
  title: "Midterm Examination on Web Development",
  course: "CSC301: Web Development",
  description: "This examination covers HTML, CSS, JavaScript, and React fundamentals.",
  scheduledFor: new Date("2023-11-20"),
  duration: 120,
  maxAttempts: 1,
  passingScore: 70,
}

// Near the top of the file, add or update these interfaces
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

export default function EditExam({ params }: { params: { examId: string } }) {
  // Use React.use with proper typing
  const unwrappedParams = React.use(params as any) as { examId: string };
  const examId = unwrappedParams.examId;
  
  const router = useRouter()
  const [formData, setFormData] = useState(mockExam)
  const [date, setDate] = useState<Date | undefined>(mockExam.scheduledFor)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch exam data from localStorage or mock data
  useEffect(() => {
    const fetchExam = () => {
      try {
        // Try to get the exam from localStorage first
        const savedExams = JSON.parse(localStorage.getItem('facultyExams') || '[]');
        const foundExam = savedExams.find((e: any) => e.id === examId);
        
        // If found in localStorage
        if (foundExam) {
          // Parse date strings back to Date objects
          const scheduledFor = new Date(foundExam.scheduledFor);
          
          setFormData({
            id: foundExam.id,
            title: foundExam.title,
            course: foundExam.course,
            description: foundExam.description || "",
            scheduledFor: scheduledFor,
            duration: foundExam.duration,
            maxAttempts: foundExam.maxAttempts,
            passingScore: foundExam.passingScore || 60,
          });
          
          setDate(scheduledFor);
        } 
        // If not found in localStorage, check if it's a mock exam
        else if (examId === "1" || examId === "2" || examId === "3") {
          // For demo purposes, just use the mockExam
          setFormData(mockExam);
          setDate(mockExam.scheduledFor);
        } 
        // If not found anywhere
        else {
          console.error('Exam not found');
          router.push('/dashboard/faculty/exams');
        }
      } catch (error) {
        console.error('Error fetching exam:', error);
      }
    };

    fetchExam();
  }, [examId, router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    }
    
    if (!formData.course.trim()) {
      newErrors.course = "Course is required"
    }
    
    if (!date) {
      newErrors.scheduledFor = "Scheduled date is required"
    }
    
    if (!formData.duration || formData.duration <= 0) {
      newErrors.duration = "Duration must be a positive number"
    }
    
    if (!formData.maxAttempts || formData.maxAttempts <= 0) {
      newErrors.maxAttempts = "Max attempts must be a positive number"
    }
    
    if (!formData.passingScore || formData.passingScore < 0 || formData.passingScore > 100) {
      newErrors.passingScore = "Passing score must be between 0 and 100"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: parseInt(value) || 0,
    }))
  }

  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    if (selectedDate) {
      setFormData((prev) => ({
        ...prev,
        scheduledFor: selectedDate,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Save changes to localStorage
      const savedExams = JSON.parse(localStorage.getItem('facultyExams') || '[]');
      
      // If it's a mock exam (id 1, 2, or 3), convert it to a user-created exam with a new ID
      const updatedExam = {
        ...formData,
        id: ["1", "2", "3"].includes(examId) ? `exam-${Date.now()}` : examId
      };
      
      // Find the index of the exam to update
      const examIndex = savedExams.findIndex((e: any) => e.id === examId);
      
      // Either update existing exam or add as new
      if (examIndex >= 0) {
        // Preserve some fields from the original exam that weren't part of the edit form
        const originalExam = savedExams[examIndex];
        savedExams[examIndex] = {
          ...originalExam,
          title: updatedExam.title,
          course: updatedExam.course,
          description: updatedExam.description,
          scheduledFor: updatedExam.scheduledFor,
          duration: updatedExam.duration,
          maxAttempts: updatedExam.maxAttempts,
          passingScore: updatedExam.passingScore
        };
      } else {
        // If it's a mock exam we're editing, add it as a new exam to localStorage
        if (["1", "2", "3"].includes(examId)) {
          // For mock exams, we need to create a completely new entry
          // Get questions from the mock exam if it's one of our predefined ones
          let questions: ExamQuestion[] = [];
          
          // We would typically fetch these from an API, but for demo purposes:
          if (examId === "1") {
            questions = [
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
              // Add more questions as needed
            ];
          }
          
          // Create a new exam entry based on the edited mock exam
          const newExam = {
            ...updatedExam,
            createdAt: new Date(),
            status: "scheduled",
            numQuestions: questions.length || 0,
            questions: questions
          };
          savedExams.push(newExam);
        }
      }
      
      // Save back to localStorage
      localStorage.setItem('facultyExams', JSON.stringify(savedExams));
      
      // Show success message
      alert('Exam updated successfully!');
      
      // Redirect to the exam details page
      // If it was a mock exam (1, 2, 3), we need to redirect to the new ID
      const redirectId = ["1", "2", "3"].includes(examId) ? updatedExam.id : examId;
      router.push(`/dashboard/faculty/exams/${redirectId}`);
    } catch (error) {
      console.error("Error updating exam:", error);
      alert('Error updating exam. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RoleProtected allowedRoles={["faculty", "admin"]}>
      <div className="container mx-auto py-8">
        <Button
          variant="ghost"
          className="mb-4 flex items-center gap-2"
          onClick={() => router.push(`/dashboard/faculty/exams/${examId}`)}
        >
          <ArrowLeft className="h-4 w-4" /> Back to Exam
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold">Edit Exam</h1>
          <p className="text-gray-500">Update the exam details</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Exam Title</Label>
                <Input 
                  id="title" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleInputChange}
                  placeholder="Enter exam title"
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <Input 
                  id="course" 
                  name="course" 
                  value={formData.course} 
                  onChange={handleInputChange}
                  placeholder="Enter course name or code"
                  className={errors.course ? "border-red-500" : ""}
                />
                {errors.course && <p className="text-sm text-red-500">{errors.course}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange}
                  placeholder="Enter exam description"
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Exam Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Scheduled Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground",
                          errors.scheduledFor && "border-red-500"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleDateChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.scheduledFor && (
                    <p className="text-sm text-red-500">{errors.scheduledFor}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input 
                    id="duration" 
                    name="duration" 
                    type="number" 
                    min="1"
                    value={formData.duration} 
                    onChange={handleNumberChange}
                    className={errors.duration ? "border-red-500" : ""}
                  />
                  {errors.duration && <p className="text-sm text-red-500">{errors.duration}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxAttempts">Maximum Attempts</Label>
                  <Input 
                    id="maxAttempts" 
                    name="maxAttempts" 
                    type="number" 
                    min="1"
                    value={formData.maxAttempts} 
                    onChange={handleNumberChange}
                    className={errors.maxAttempts ? "border-red-500" : ""}
                  />
                  {errors.maxAttempts && (
                    <p className="text-sm text-red-500">{errors.maxAttempts}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passingScore">Passing Score (%)</Label>
                  <Input 
                    id="passingScore" 
                    name="passingScore" 
                    type="number" 
                    min="0"
                    max="100"
                    value={formData.passingScore} 
                    onChange={handleNumberChange}
                    className={errors.passingScore ? "border-red-500" : ""}
                  />
                  {errors.passingScore && (
                    <p className="text-sm text-red-500">{errors.passingScore}</p>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push(`/dashboard/faculty/exams/${examId}`)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </RoleProtected>
  )
} 