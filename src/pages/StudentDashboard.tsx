import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api";
import { useAuth } from "@/context/AuthContext";
import CourseCard from "@/components/CourseCard";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/ErrorMessage";
import { BookOpen, CheckCircle, Award, TrendingUp } from "lucide-react";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getStudentDashboard()
      .then((d) => { setData(d); setError(""); })
      .catch((err) => setError(err.message || "Failed to load dashboard."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (error) return <div className="max-w-7xl mx-auto px-4 py-8"><ErrorMessage message={error} /></div>;
  if (!data) return null;

  const stats = [
    { icon: BookOpen, label: "Enrolled Courses", value: data.enrolled_courses, color: "bg-blue-50 text-blue-600" },
    { icon: CheckCircle, label: "Completed Courses", value: data.completed_courses, color: "bg-green-50 text-green-600" },
    { icon: Award, label: "Avg Quiz Score", value: `${data.average_quiz_score}%`, color: "bg-orange-50 text-orange-600" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Welcome, {user?.name}</h1>
        <p className="text-gray-500">Here's your learning overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className={`inline-flex w-10 h-10 rounded-lg items-center justify-center mb-3 ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* My Courses */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">My Courses</h2>
          <Link to="/my-courses" className="text-sm text-blue-600 font-medium hover:underline">View all</Link>
        </div>
        {data.courses.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <TrendingUp className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-3">No courses yet. Start learning today!</p>
            <Link to="/courses" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.courses.slice(0, 6).map((course: any) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
