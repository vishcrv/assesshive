"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RoleProtected } from "@/components/role-protected";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, Clock, ArrowRight, ArrowLeft, Plus, XCircle, Save, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type FormStep = "details" | "questions" | "review";

interface Question {
  id: string;
  text: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
}

export default function CreateExam() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<FormStep>("details");
  const [formData, setFormData] = useState({
    title: "",
    course: "",
    description: "",
    scheduledFor: new Date(),
    duration: "60", // minutes
    maxAttempts: "1",
    passingScore: "60", // percentage
  });
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "1",
      text: "",
      options: [
        { id: "1-1", text: "", isCorrect: false },
        { id: "1-2", text: "", isCorrect: false },
        { id: "1-3", text: "", isCorrect: false },
        { id: "1-4", text: "", isCorrect: false },
      ],
    },
  ]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateDetailsForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.course.trim()) errors.course = "Course is required";
    if (!formData.duration) errors.duration = "Duration is required";
    if (parseInt(formData.duration) <= 0) errors.duration = "Duration must be greater than 0";
    if (!formData.maxAttempts) errors.maxAttempts = "Max attempts is required";
    if (parseInt(formData.maxAttempts) <= 0) errors.maxAttempts = "Max attempts must be greater than 0";
    if (!formData.passingScore) errors.passingScore = "Passing score is required";
    if (parseInt(formData.passingScore) < 0 || parseInt(formData.passingScore) > 100) 
      errors.passingScore = "Passing score must be between 0 and 100";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateQuestionsForm = () => {
    const hasEmptyQuestions = questions.some(q => !q.text.trim());
    const hasEmptyOptions = questions.some(q => 
      q.options.some(o => !o.text.trim())
    );
    const hasMissingCorrectAnswers = questions.some(q => 
      !q.options.some(o => o.isCorrect)
    );

    const errors: Record<string, string> = {};
    
    if (hasEmptyQuestions) errors.questions = "All questions must have text";
    if (hasEmptyOptions) errors.options = "All options must have text";
    if (hasMissingCorrectAnswers) errors.correctAnswers = "Each question must have at least one correct answer";
    if (questions.length === 0) errors.questionCount = "You must add at least one question";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === "details" && validateDetailsForm()) {
      setCurrentStep("questions");
    } else if (currentStep === "questions" && validateQuestionsForm()) {
      setCurrentStep("review");
    }
  };

  const handlePrevStep = () => {
    if (currentStep === "questions") {
      setCurrentStep("details");
    } else if (currentStep === "review") {
      setCurrentStep("questions");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData({
        ...formData,
        scheduledFor: date,
      });
    }
  };

  const handleQuestionChange = (questionId: string, value: string) => {
    setQuestions(
      questions.map(q => 
        q.id === questionId 
          ? { ...q, text: value } 
          : q
      )
    );
    
    // Clear question error if it exists
    if (formErrors.questions) {
      setFormErrors({
        ...formErrors,
        questions: "",
      });
    }
  };

  const handleOptionChange = (questionId: string, optionId: string, value: string) => {
    setQuestions(
      questions.map(q => 
        q.id === questionId 
          ? { 
              ...q, 
              options: q.options.map(o => 
                o.id === optionId 
                  ? { ...o, text: value } 
                  : o
              )
            } 
          : q
      )
    );
    
    // Clear option error if it exists
    if (formErrors.options) {
      setFormErrors({
        ...formErrors,
        options: "",
      });
    }
  };

  const handleCorrectAnswerChange = (questionId: string, optionId: string) => {
    setQuestions(
      questions.map(q => 
        q.id === questionId 
          ? { 
              ...q, 
              options: q.options.map(o => 
                o.id === optionId 
                  ? { ...o, isCorrect: true } 
                  : { ...o, isCorrect: false }
              )
            } 
          : q
      )
    );
    
    // Clear correct answer error if it exists
    if (formErrors.correctAnswers) {
      setFormErrors({
        ...formErrors,
        correctAnswers: "",
      });
    }
  };

  const addQuestion = () => {
    const newQuestionId = String(questions.length + 1);
    const newQuestion: Question = {
      id: newQuestionId,
      text: "",
      options: [
        { id: `${newQuestionId}-1`, text: "", isCorrect: false },
        { id: `${newQuestionId}-2`, text: "", isCorrect: false },
        { id: `${newQuestionId}-3`, text: "", isCorrect: false },
        { id: `${newQuestionId}-4`, text: "", isCorrect: false },
      ],
    };
    
    setQuestions([...questions, newQuestion]);
    
    // Clear question count error if it exists
    if (formErrors.questionCount) {
      setFormErrors({
        ...formErrors,
        questionCount: "",
      });
    }
  };

  const removeQuestion = (questionId: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== questionId));
    }
  };

  const handleSubmit = () => {
    // Validate the form one more time
    if (!validateDetailsForm() || !validateQuestionsForm()) {
      return;
    }

    // Create a new exam object based on the form data
    const newExam = {
      id: `exam-${Date.now()}`, // Generate a unique ID
      title: formData.title,
      course: formData.course,
      createdAt: new Date(),
      scheduledFor: formData.scheduledFor,
      duration: parseInt(formData.duration),
      numQuestions: questions.length,
      maxAttempts: parseInt(formData.maxAttempts),
      status: "scheduled", // Default status for new exams
      description: formData.description,
      questions: questions.map(q => ({
        id: q.id,
        text: q.text,
        options: q.options
      }))
    };

    // Get existing exams from localStorage or initialize empty array
    const existingExams = JSON.parse(localStorage.getItem('facultyExams') || '[]');
    
    // Add the new exam to the array
    const updatedExams = [...existingExams, newExam];
    
    // Save back to localStorage
    localStorage.setItem('facultyExams', JSON.stringify(updatedExams));

    // Here you would normally send the data to your API
    console.log("Form submitted:", { ...formData, questions });
    
    // Show success toast/alert (could be implemented better with a toast library)
    alert("Exam created successfully!");
    
    // Navigate back to the exams list page
    router.push("/dashboard/faculty?tab=exams");
  };

  return (
    <RoleProtected allowedRoles={["faculty", "admin"]}>
      {/* Return to Exams button positioned at the top-left */}
      <div className="fixed top-4 left-4 z-10">
        <Button
          variant="outline"
          className="flex items-center gap-2 shadow-md"
          onClick={() => router.push("/dashboard/faculty/exams")}
        >
          <ArrowLeft className="h-4 w-4" /> Return to Exams
        </Button>
      </div>
      
      {/* Main content with increased margins */}
      <div className="space-y-6 max-w-5xl mx-auto pt-20 px-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Create New Exam</h1>
            <p className="text-muted-foreground">Set up an MCQ-based exam for your students</p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="w-full flex justify-between items-center mb-8">
          <div className="w-full flex items-center">
            <div className={`rounded-full h-10 w-10 flex items-center justify-center ${
              currentStep === "details" || currentStep === "questions" || currentStep === "review" 
                ? "bg-primary text-white"
                : "bg-gray-200 text-gray-600"
            }`}>
              1
            </div>
            <div className={`h-1 flex-1 ${
              currentStep === "questions" || currentStep === "review" 
                ? "bg-primary" 
                : "bg-gray-200"
            }`}></div>
            <div className={`rounded-full h-10 w-10 flex items-center justify-center ${
              currentStep === "questions" || currentStep === "review" 
                ? "bg-primary text-white"
                : "bg-gray-200 text-gray-600"
            }`}>
              2
            </div>
            <div className={`h-1 flex-1 ${
              currentStep === "review" 
                ? "bg-primary" 
                : "bg-gray-200"
            }`}></div>
            <div className={`rounded-full h-10 w-10 flex items-center justify-center ${
              currentStep === "review" 
                ? "bg-primary text-white"
                : "bg-gray-200 text-gray-600"
            }`}>
              3
            </div>
          </div>
        </div>

        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>
              {currentStep === "details" && "Exam Details"}
              {currentStep === "questions" && "Exam Questions"}
              {currentStep === "review" && "Review and Submit"}
            </CardTitle>
            <CardDescription>
              {currentStep === "details" && "Enter the basic information about your exam"}
              {currentStep === "questions" && "Create multiple-choice questions for your exam"}
              {currentStep === "review" && "Review your exam details before submitting"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Exam Details */}
            {currentStep === "details" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Exam Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Midterm Exam, Final Exam, Quiz 1"
                    className={formErrors.title ? "border-red-500" : ""}
                  />
                  {formErrors.title && (
                    <p className="text-red-500 text-sm">{formErrors.title}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="course">Course</Label>
                  <Input
                    id="course"
                    name="course"
                    value={formData.course}
                    onChange={handleInputChange}
                    placeholder="e.g., CS101, Introduction to Programming"
                    className={formErrors.course ? "border-red-500" : ""}
                  />
                  {formErrors.course && (
                    <p className="text-red-500 text-sm">{formErrors.course}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter a brief description of the exam"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Scheduled Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.scheduledFor && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.scheduledFor ? (
                            format(formData.scheduledFor, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.scheduledFor}
                          onSelect={handleDateChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      name="duration"
                      type="number"
                      value={formData.duration}
                      onChange={handleInputChange}
                      min="1"
                      className={formErrors.duration ? "border-red-500" : ""}
                    />
                    {formErrors.duration && (
                      <p className="text-red-500 text-sm">{formErrors.duration}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxAttempts">Maximum Attempts</Label>
                    <Input
                      id="maxAttempts"
                      name="maxAttempts"
                      type="number"
                      value={formData.maxAttempts}
                      onChange={handleInputChange}
                      min="1"
                      className={formErrors.maxAttempts ? "border-red-500" : ""}
                    />
                    {formErrors.maxAttempts && (
                      <p className="text-red-500 text-sm">{formErrors.maxAttempts}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passingScore">Passing Score (%)</Label>
                    <Input
                      id="passingScore"
                      name="passingScore"
                      type="number"
                      value={formData.passingScore}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      className={formErrors.passingScore ? "border-red-500" : ""}
                    />
                    {formErrors.passingScore && (
                      <p className="text-red-500 text-sm">{formErrors.passingScore}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Questions */}
            {currentStep === "questions" && (
              <div className="space-y-8">
                {Object.keys(formErrors).length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-600">
                    <h4 className="font-semibold mb-2">Please fix the following errors:</h4>
                    <ul className="list-disc list-inside">
                      {Object.values(formErrors).map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {questions.map((question, questionIndex) => (
                  <div key={question.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">Question {questionIndex + 1}</h3>
                      {questions.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuestion(question.id)}
                        >
                          <XCircle className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`question-${question.id}`}>Question Text</Label>
                      <Textarea
                        id={`question-${question.id}`}
                        value={question.text}
                        onChange={(e) => handleQuestionChange(question.id, e.target.value)}
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
                            checked={option.isCorrect}
                            onChange={() => handleCorrectAnswerChange(question.id, option.id)}
                            className="mt-2.5"
                          />
                          <div className="flex-1">
                            <Label htmlFor={`option-${option.id}-text`} className="sr-only">
                              Option {String.fromCharCode(65 + optionIndex)}
                            </Label>
                            <Input
                              id={`option-${option.id}-text`}
                              value={option.text}
                              onChange={(e) => handleOptionChange(question.id, option.id, e.target.value)}
                              placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <Button onClick={addQuestion} variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" /> Add Another Question
                </Button>
              </div>
            )}

            {/* Step 3: Review */}
            {currentStep === "review" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground">Exam Title</h3>
                      <p>{formData.title}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground">Course</h3>
                      <p>{formData.course}</p>
                    </div>
                    {formData.description && (
                      <div>
                        <h3 className="font-semibold text-sm text-muted-foreground">Description</h3>
                        <p>{formData.description}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground">Scheduled For</h3>
                      <p>{format(formData.scheduledFor, "PPP")}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground">Duration</h3>
                      <p>{formData.duration} minutes</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground">Max Attempts</h3>
                      <p>{formData.maxAttempts}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground">Passing Score</h3>
                      <p>{formData.passingScore}%</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Questions ({questions.length})</h3>
                  <div className="border rounded-lg divide-y">
                    {questions.map((question, qIndex) => (
                      <div key={question.id} className="p-4">
                        <p className="font-medium mb-2">
                          {qIndex + 1}. {question.text}
                        </p>
                        <ul className="space-y-1 pl-6 list-disc">
                          {question.options.map((option, oIndex) => (
                            <li key={option.id} className={option.isCorrect ? "font-semibold text-green-600" : ""}>
                              {String.fromCharCode(65 + oIndex)}: {option.text} {option.isCorrect && "(Correct)"}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            {currentStep !== "details" ? (
              <Button variant="outline" onClick={handlePrevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            ) : (
              <Button variant="outline" onClick={() => router.push("/dashboard/faculty?tab=exams")}>
                Cancel
              </Button>
            )}

            {currentStep !== "review" ? (
              <Button onClick={handleNextStep}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit}>
                <Save className="mr-2 h-4 w-4" /> Create Exam
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </RoleProtected>
  );
} 