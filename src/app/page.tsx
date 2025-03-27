"use client"; 
import { motion } from "framer-motion";
import NavbarWrapper from "./components/NavbarWrapper";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure theme toggle only renders on client side to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="h-screen overflow-y-auto flex flex-col">
      <NavbarWrapper />

      {/* Theme Toggle Button */}
      {mounted && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.5 }}
          className="fixed top-6 right-6 z-50"
        >
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
            className="rounded-full w-10 h-10 shadow-md border-2 transition-all duration-300 hover:shadow-lg dark:bg-gray-800 light:bg-white"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-yellow-400" />
            ) : (
              <Moon className="h-5 w-5 text-indigo-700" />
            )}
          </Button>
        </motion.div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8 mt-50">
        <motion.h1
          initial={{ opacity: 0, y: -50, filter: "blur(5px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.0, ease: "easeOut" }}
          className="text-4xl md:text-5xl font-bold text-center"
        >
          Seamless. Secure. Smart.
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: -30, filter: "blur(3px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.0, ease: "easeOut", delay: 0.2 }}
          className="text-2xl md:text-3xl font-medium text-center max-w-3xl"
        >
          The Future of MCQ-Based Examinations.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, filter: "blur(3px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
          className="text-xl text-center max-w-3xl mt-4"
        >
          Automate, Monitor, and Evaluate Exams with Ease – A Secure & Scalable Solution for Universities and Institutions.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 mt-8"
        >
          <button className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Start Now
          </button>
          <button className="px-8 py-3 bg-gray-200 dark:bg-gray-800 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors">
            Watch Demo
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.0, delay: 0.8 }}
          className="w-full max-w-5xl mt-16"
        >
          <h3 className="text-2xl font-bold text-center mb-10">Key Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "User Authentication & Role-Based Access",
                description: "Admins, Faculty, and Students with distinct privileges for smooth management."
              },
              {
                title: "MCQ Exam Creation & Management",
                description: "Faculty can create exams with a dynamic pool of MCQs. Set time limits and shuffle questions for every student."
              },
              {
                title: "Automated Grading & Instant Results",
                description: "AI-driven evaluation and real-time result generation."
              },
              {
                title: "Real-Time Exam Monitoring",
                description: "Track student progress and prevent multiple attempts."
              },
              {
                title: "Secure & Cheat-Proof System",
                description: "Multi-layered security with full-screen enforcement & session tracking."
              },
              {
                title: "Advanced Question Bank Management",
                description: "Faculty can create, update, and reuse a vast question pool."
              }
            ].map((feature, index) => (
              <div key={index} className="p-6 border rounded-lg hover:shadow-md transition-shadow">
                <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                <p className="text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.0, delay: 1.0 }}
          className="w-full max-w-3xl mt-16"
        >
          <h3 className="text-2xl font-bold text-center mb-6">Why Choose Us?</h3>
          <div className="flex flex-col space-y-2 items-center">
            <p className="text-center">✔ Scalable for Institutions of Any Size</p>
            <p className="text-center">✔ User-Friendly & Intuitive Interface</p>
            <p className="text-center">✔ Fast, Reliable & Secure Platform</p>
            <p className="text-center">✔ 24/7 Support & Assistance</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-12 mb-8 text-center"
        >
          <p className="text-xl font-semibold mb-6">Revolutionize Your Online Exams Today! Sign Up Now and Experience the Future of MCQ-Based Assessments.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Sign Up for Free
            </button>
            <button className="px-8 py-3 bg-gray-200 dark:bg-gray-800 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors">
              Schedule a Demo
            </button>
          </div>
        </motion.div>
      </div>

      <footer className="p-4 text-center bg-gray-100 dark:bg-gray-900">
        <p className="text-sm">© 2023 Exam Management App. All rights reserved.</p>
      </footer>
    </div>
  );
}
