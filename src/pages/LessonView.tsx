import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "@/api";
import { useAuth } from "@/context/AuthContext";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/ErrorMessage";
import { ArrowLeft, ArrowRight, CheckCircle, Circle, FileQuestion } from "lucide-react";

export default function LessonView() {
  const { id: courseId, lessonId } = useParams<{ id: string; lessonId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lessons, setLessons] = useState<any[]>([]);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [completedIds, setCompletedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    Promise.all([
      api.getLessons(Number(courseId)),
      api.getProgress(Number(courseId)).catch(() => null),
    ])
      .then(([lessonsData, progressData]) => {
        setLessons(lessonsData);
        if (progressData) setCompletedIds(progressData.completed_lesson_ids || []);
        const current = lessonsData.find((l: any) => l.id === Number(lessonId));
        setCurrentLesson(current || lessonsData[0] || null);
      })
      .catch((err) => setError(err.message || "Failed to load lessons."))
      .finally(() => setLoading(false));
  }, [courseId, lessonId]);

  const currentIndex = lessons.findIndex((l) => l.id === currentLesson?.id);
  const isCompleted = currentLesson ? completedIds.includes(currentLesson.id) : false;

  const toggleComplete = async () => {
    if (!currentLesson || !courseId) return;
    setUpdating(true);
    try {
      await api.updateProgress(Number(courseId), currentLesson.id, !isCompleted);
      if (isCompleted) {
        setCompletedIds(completedIds.filter((id) => id !== currentLesson.id));
      } else {
        setCompletedIds([...completedIds, currentLesson.id]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update progress.");
    } finally {
      setUpdating(false);
    }
  };

  const goToLesson = (lesson: any) => {
    setCurrentLesson(lesson);
    navigate(`/courses/${courseId}/lessons/${lesson.id}`);
  };

  if (loading) return <Loading />;
  if (error) return <div className="max-w-4xl mx-auto px-4 py-8"><ErrorMessage message={error} /></div>;
  if (!currentLesson) return <div className="max-w-4xl mx-auto px-4 py-8"><ErrorMessage message="Lesson not found." /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to={`/courses/${courseId}`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Course
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lesson content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">Lesson {currentIndex + 1} of {lessons.length}</span>
              <button
                onClick={toggleComplete}
                disabled={updating}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isCompleted
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {isCompleted ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                {isCompleted ? "Completed" : "Mark as Completed"}
              </button>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4">{currentLesson.title}</h1>
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-sans">
                {currentLesson.content}
              </pre>
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-100">
              <button
                onClick={() => currentIndex > 0 && goToLesson(lessons[currentIndex - 1])}
                disabled={currentIndex === 0}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Previous
              </button>
              <button
                onClick={() => currentIndex < lessons.length - 1 && goToLesson(lessons[currentIndex + 1])}
                disabled={currentIndex === lessons.length - 1}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 transition-colors"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quiz link */}
          <div className="mt-4 bg-blue-50 rounded-xl border border-blue-100 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileQuestion className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Ready to test your knowledge?</span>
            </div>
            <Link
              to={`/courses/${courseId}/quiz`}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Take Quiz
            </Link>
          </div>
        </div>

        {/* Sidebar: lesson list */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-20">
            <h3 className="text-sm font-bold text-gray-900 mb-3">All Lessons</h3>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {lessons.map((lesson, i) => {
                const done = completedIds.includes(lesson.id);
                const isCurrent = lesson.id === currentLesson.id;
                return (
                  <button
                    key={lesson.id}
                    onClick={() => goToLesson(lesson)}
                    className={`flex items-center gap-2 w-full p-2 rounded-lg text-left text-sm transition-colors ${
                      isCurrent ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    {done ? (
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                    )}
                    <span className="line-clamp-1">{i + 1}. {lesson.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
