import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import Register from "@/pages/Register";
import Login from "@/pages/Login";
import Courses from "@/pages/Courses";
import CourseDetails from "@/pages/CourseDetails";
import MyCourses from "@/pages/MyCourses";
import LessonView from "@/pages/LessonView";
import Quiz from "@/pages/Quiz";
import StudentDashboard from "@/pages/StudentDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import ManageCourses from "@/pages/ManageCourses";
import ManageLessons from "@/pages/ManageLessons";
import ManageQuizzes from "@/pages/ManageQuizzes";
import type { JSX } from "react";

function ProtectedRoute({ children, requireAdmin }: { children: JSX.Element; requireAdmin?: boolean }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;
  if (!user) return <Navigate to="/login" />;
  if (requireAdmin && user.role !== "admin") return <Navigate to="/dashboard" />;
  return children;
}

function AppRoutes() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetails />} />
          <Route path="/courses/:id/lessons/:lessonId" element={<ProtectedRoute><LessonView /></ProtectedRoute>} />
          <Route path="/courses/:id/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
          <Route path="/my-courses" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/courses" element={<ProtectedRoute requireAdmin><ManageCourses /></ProtectedRoute>} />
          <Route path="/admin/lessons" element={<ProtectedRoute requireAdmin><ManageLessons /></ProtectedRoute>} />
          <Route path="/admin/quizzes" element={<ProtectedRoute requireAdmin><ManageQuizzes /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
