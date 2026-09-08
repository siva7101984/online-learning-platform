import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { GraduationCap, BookOpen, TrendingUp, Award, ArrowRight, Users, Lightbulb, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/api";

export default function Home() {
  const { user } = useAuth();
  const [courseCount, setCourseCount] = useState(0);

  useEffect(() => {
    api.getCourses().then((courses) => setCourseCount(courses.length)).catch(() => {});
  }, []);

  const features = [
    { icon: BookOpen, title: "Browse Courses", desc: "Explore courses across Python, Web Dev, Java, Data Science, and AI/ML." },
    { icon: TrendingUp, title: "Track Progress", desc: "Mark lessons as completed and watch your progress bar fill up." },
    { icon: Award, title: "Take Quizzes", desc: "Test your knowledge with quizzes and see your scores instantly." },
    { icon: Users, title: "Role-Based Access", desc: "Students learn, instructors manage — a complete learning platform." },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-gray-900 text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-sm font-medium mb-6">
              <GraduationCap className="w-4 h-4" /> {courseCount} courses available
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Learn Skills That <span className="text-blue-300">Matter</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8">
              A complete online learning platform with courses, lessons, quizzes, and progress tracking.
              Built with React, Flask, and SQLite.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-blue-700 bg-white hover:bg-blue-50 transition-colors"
                >
                  Browse Courses <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-blue-700 bg-white hover:bg-blue-50 transition-colors"
                  >
                    Get Started <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/courses"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white border-2 border-white/30 hover:bg-white/10 transition-colors"
                  >
                    Explore Courses
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Everything You Need to Learn</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            A full-featured learning platform designed for students and instructors.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                <f.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center">How It Works</h2>
          <p className="text-gray-500 text-center mb-12">Four simple steps to start learning</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: Users, step: "1", title: "Register", desc: "Create your free student account" },
              { icon: BookOpen, step: "2", title: "Browse & Enroll", desc: "Find a course and enroll" },
              { icon: Lightbulb, step: "3", title: "Learn", desc: "Complete lessons at your pace" },
              { icon: Target, step: "4", title: "Track & Quiz", desc: "Monitor progress and test yourself" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white mb-4">
                  <s.icon className="w-7 h-7" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center">
                    {s.step}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{s.title}</h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
