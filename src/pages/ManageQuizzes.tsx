import { useState, useEffect, type FormEvent } from "react";
import { api } from "@/api";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/ErrorMessage";
import Modal from "@/components/Modal";
import { Plus, Trash2, FileQuestion, ChevronDown, ChevronRight } from "lucide-react";

interface Course { id: number; title: string; }
interface Quiz { id: number; course_id: number; title: string; questions?: any[]; }

export default function ManageQuizzes() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [quizzes, setQuizzes] = useState<Record<number, Quiz | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null);
  const [showQuestionForm, setShowQuestionForm] = useState<number | null>(null);
  const [deleteQuestionId, setDeleteQuestionId] = useState<number | null>(null);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState({ question: "", option_a: "", option_b: "", option_c: "", option_d: "", correct_answer: "" });

  useEffect(() => {
    api.getCourses()
      .then(async (data) => {
        setCourses(data);
        const quizMap: Record<number, Quiz | null> = {};
        for (const c of data) {
          try {
            const quiz = await api.getQuiz(c.id);
            quizMap[c.id] = quiz;
          } catch {
            quizMap[c.id] = null;
          }
        }
        setQuizzes(quizMap);
        setError("");
      })
      .catch((err) => setError(err.message || "Failed to load."))
      .finally(() => setLoading(false));
  }, []);

  const handleCreateQuiz = async (courseId: number, courseTitle: string) => {
    try {
      await api.createQuiz(courseId, `${courseTitle} Quiz`);
      const quiz = await api.getQuiz(courseId);
      setQuizzes({ ...quizzes, [courseId]: quiz });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create quiz.");
    }
  };

  const openQuestionForm = (quizId: number) => {
    setShowQuestionForm(quizId);
    setForm({ question: "", option_a: "", option_b: "", option_c: "", option_d: "", correct_answer: "" });
    setFormError("");
  };

  const handleSubmitQuestion = async (e: FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!form.question.trim()) return setFormError("Question is required.");
    if (!form.option_a || !form.option_b || !form.option_c || !form.option_d) return setFormError("All four options are required.");
    if (!form.correct_answer) return setFormError("Please select the correct answer.");

    setFormLoading(true);
    try {
      await api.addQuestion(showQuestionForm!, form);
      setShowQuestionForm(null);
      const quiz = await api.getQuiz(quizzes[expandedCourse!]?.course_id || 0);
      setQuizzes({ ...quizzes, [expandedCourse!]: quiz });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to add question.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!deleteQuestionId || !expandedCourse) return;
    try {
      await api.deleteQuestion(deleteQuestionId);
      setDeleteQuestionId(null);
      const quiz = await api.getQuiz(expandedCourse);
      setQuizzes({ ...quizzes, [expandedCourse]: quiz });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete question.");
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Manage Quizzes</h1>
        <p className="text-gray-500 text-sm mt-1">Create quizzes and add questions for each course</p>
      </div>

      {error && <div className="mb-4"><ErrorMessage message={error} /></div>}

      <div className="space-y-3">
        {courses.map((c) => {
          const quiz = quizzes[c.id];
          const isExpanded = expandedCourse === c.id;
          return (
            <div key={c.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => setExpandedCourse(isExpanded ? null : c.id)}
                className="flex items-center justify-between w-full p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                  <FileQuestion className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900">{c.title}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {quiz ? `${quiz.questions?.length || 0} questions` : "No quiz"}
                </span>
              </button>

              {isExpanded && (
                <div className="p-4 border-t border-gray-100">
                  {!quiz ? (
                    <button
                      onClick={() => handleCreateQuiz(c.id, c.title)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Create Quiz
                    </button>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-gray-700">{quiz.title}</h3>
                        <button
                          onClick={() => openQuestionForm(quiz.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                        >
                          <Plus className="w-3 h-3" /> Add Question
                        </button>
                      </div>
                      <div className="space-y-2">
                        {quiz.questions?.map((q, i) => (
                          <div key={q.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                            <span className="text-sm font-bold text-gray-400 flex-shrink-0">{i + 1}.</span>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{q.question}</p>
                              <div className="grid grid-cols-2 gap-1 mt-1 text-xs text-gray-500">
                                <span className={q.correct_answer === q.option_a ? "text-green-600 font-medium" : ""}>A. {q.option_a}</span>
                                <span className={q.correct_answer === q.option_b ? "text-green-600 font-medium" : ""}>B. {q.option_b}</span>
                                <span className={q.correct_answer === q.option_c ? "text-green-600 font-medium" : ""}>C. {q.option_c}</span>
                                <span className={q.correct_answer === q.option_d ? "text-green-600 font-medium" : ""}>D. {q.option_d}</span>
                              </div>
                            </div>
                            <button onClick={() => setDeleteQuestionId(q.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors flex-shrink-0">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Question form modal */}
      {showQuestionForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowQuestionForm(null)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add Question</h2>
            {formError && <div className="mb-4"><ErrorMessage message={formError} /></div>}
            <form onSubmit={handleSubmitQuestion} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                <input type="text" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {(["option_a", "option_b", "option_c", "option_d"] as const).map((key, i) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Option {String.fromCharCode(65 + i)}</label>
                    <input type="text" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
                <select value={form.correct_answer} onChange={(e) => setForm({ ...form, correct_answer: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select correct answer</option>
                  <option value={form.option_a}>A. {form.option_a}</option>
                  <option value={form.option_b}>B. {form.option_b}</option>
                  <option value={form.option_c}>C. {form.option_c}</option>
                  <option value={form.option_d}>D. {form.option_d}</option>
                </select>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowQuestionForm(null)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="submit" disabled={formLoading}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  {formLoading ? "Adding..." : "Add Question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Modal isOpen={deleteQuestionId !== null} title="Delete Question" onClose={() => setDeleteQuestionId(null)} onConfirm={handleDeleteQuestion} confirmText="Delete">
        Are you sure you want to delete this question?
      </Modal>
    </div>
  );
}
