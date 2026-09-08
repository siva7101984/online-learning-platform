import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "@/api";
import { useAuth } from "@/context/AuthContext";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/ErrorMessage";
import { User, Tag, BookOpen, CheckCircle, ArrowLeft, Play } from "lucide-react";

export default function CourseDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.getCourse(Number(id)),
      api.getLessons(Number(id)),
    ])
      .then(async ([courseData, lessonsData]) => {
        setCourse(courseData);
        setLessons(lessonsData);
        if (user && user.role === "student") {
          try {
            const enrollments = await api.getEnrollments(user.id);
            setEnrolled(enrollments.some((e: any) => e.id === Number(id)));
          } catch {}
        }
      })
      .catch((err) => setError(err.message || "Failed to load course."))
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleEnroll = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setActionLoading(true);
    try {
      await api.enroll(Number(id));
      setEnrolled(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enrollment failed.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <div className="max-w-4xl mx-auto px-4 py-8"><ErrorMessage message={error} /></div>;
  if (!course) return <div className="max-w-4xl mx-auto px-4 py-8"><ErrorMessage message="Course not found." /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/courses" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Courses
      </Link>

      {/* Course header */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
        <div className="h-40 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-6xl">
          {course.image || "📚"}
        </div>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 flex items-center gap-1">
              <Tag className="w-3 h-3" /> {course.category}
            </span>
            {enrolled && (
              <span className="px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Enrolled
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{course.title}</h1>
          <p className="text-gray-600 mb-4">{course.description}</p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
            <span className="flex items-center gap-1"><User className="w-4 h-4" /> {course.instructor}</span>
            <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {course.lesson_count || lessons.length} lessons</span>
          </div>

          {user?.role === "student" && (
            enrolled ? (
              <button
                onClick={() => navigate(`/courses/${id}/lessons/${lessons[0]?.id || ""}`)}
                disabled={lessons.length === 0}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Play className="w-4 h-4" /> Continue Learning
              </button>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {actionLoading ? "Enrolling..." : "Enroll Now"}
              </button>
            )
          )}
          {!user && (
            <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors">
              Login to Enroll
            </Link>
          )}
        </div>
      </div>

      {/* Lessons list */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Course Content</h2>
        {lessons.length === 0 ? (
          <p className="text-gray-500 text-sm">No lessons available yet.</p>
        ) : (
          <div className="space-y-2">
            {lessons.map((lesson, i) => (
              <div
                key={lesson.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  enrolled
                    ? "border-gray-200 hover:bg-gray-50 cursor-pointer"
                    : "border-gray-100 bg-gray-50"
                }`}
                onClick={() => enrolled && navigate(`/courses/${id}/lessons/${lesson.id}`)}
              >
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 text-blue-600 text-sm font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{lesson.title}</p>
                </div>
                {enrolled && <Play className="w-4 h-4 text-gray-400" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
