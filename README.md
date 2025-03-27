Secure & Automated MCQ-Based Examination System


AssessHive

Overview
This project is a secure, automated, and scalable MCQ-based examination system designed for universities and institutions. It ensures fair assessments, prevents cheating, and provides real-time monitoring with automated grading for instant results.
Features
User Roles & Functionalities
Admin
•	Faculty-Student Mapping
•	Activate/Deactivate Student & Faculty Accounts
•	View Ongoing Exams
•	Access Student Performance Analytics
•	Download Batch-wise or Exam-wise Reports
•	Monitor Login Attempts & Prevent Multiple Logins
•	Approve Passkey for Re-entry
•	Track Student Logout Status & Violations
Faculty
•	Create MCQ-Based Exams (Set Duration, No. of Attempts, Schedule Exam Time)
•	Select or Generate Question Sets
•	Add/Edit/Delete MCQs & Categorize by Topic
•	Receive Alerts for Suspected Cheating
•	Automated Grading & Instant Result Generation
•	Access & Download Student Performance Reports
Student
•	Access Scheduled Exams
•	Attempt Exams Only Once
•	View Instant Scores After Submission
•	Track Exam Progress & Performance Analysis
•	Check Correct vs. Incorrect Answers (If Allowed)
Security Measures
•	Auto-Fullscreen Mode on Exam Start
•	Tab Switching Restrictions (Triggers Warning & Possible Auto-Submit)
•	Multiple Tab Violation → Auto-Submit Exam
•	Disable Copy/Paste (Ctrl+C, Ctrl+V, Ctrl+X) & Right-Click
•	Monitor IP Address to Prevent Multiple Logins from Different Locations
•	Passkey-Based Re-login for Accidental Logouts
•	Flagging System: Students are flagged as Suspicious (Red, Yellow, Orange) based on violation frequency.
Technology Stack
•	Frontend: React.js
•	Backend: Node.js, Express.js
•	Database: Supabase (PostgreSQL) (future)
•	Authentication: Clerk
Installation & Setup
1.	Clone the Repository
2.	git clone https://github.com/vishcrv/assesshive
3.	cd assesshive
4.	Install Dependencies
5.	npm install
6.	Set Up Environment Variables
o	Create a .env file in the root directory.
o	Add required credentials for Supabase and Clerk.
7.	Run the Application
8.	npm start
Future Enhancements
•	AI-Based Violation Flagging for Enhanced Security
•	Adaptive Testing for Dynamic Difficulty Adjustments
•	Enhanced Reporting & Insights for Faculty & Admin
•	Student flagging
