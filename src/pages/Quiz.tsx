import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "@/api";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/ErrorMessage";
import { ArrowLeft, CheckCircle, Award, RotateCcw } from "lucide-react";

export default function Quiz() {
  const { id: courseId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; total_questions: number; percentage: number } | null>(null);
  const [previousResults, setPreviousResults] = useState<any[]>([]);

  useEffect(() => {
    if (!courseId) return;
    api.getQuiz(Number(courseId))
      .then(async (data) => {
        setQuiz(data);
        try {
          const results = await api.getQuizResults(data.id);
          setPreviousResults(results);
        } catch {}
      })
      .catch((err) => setError(err.message || "No quiz available for this course."))
      .finally(() => setLoading(false));
  }, [courseId]);

  const handleSubmit = async () => {
    if (!quiz) return;
    setSubmitting(true);
    try {
      const res = await api.submitQuiz(quiz.id, answers);
      setResult(res);
      const results = await api.getQuizResults(quiz.id);
      setPreviousResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setResult(null);
    setAnswers({});
  };

  if (loading) return <Loading />;
  if (error && !quiz) return <div className="max-w-3xl mx-auto px-4 py-8"><ErrorMessage message={error} /></div>;
  if (!quiz) return <div className="max-w-3xl mx-auto px-4 py-8"><ErrorMessage message="No quiz found." /></div>;

  if (result) {
    const passed = result.percentage >= 60;
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className={`inline-flex w-20 h-20 rounded-full items-center justify-center mb-4 ${passed ? "bg-green-50" : "bg-orange-50"}`}>
            <Award className={`w-10 h-10 ${passed ? "text-green-600" : "text-orange-600"}`} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h1>
          <p className="text-lg text-gray-600 mb-6">
            You scored <span className="font-bold text-blue-600">{result.score}</span> out of{" "}
            <span className="font-bold">{result.total_questions}</span>
          </p>
          <div className="w-full max-w-xs mx-auto mb-6">
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${passed ? "bg-green-500" : "bg-orange-500"}`}
                style={{ width: `${result.percentage}%` }}
              />
            </div>
            <p className="text-sm font-bold text-gray-700 mt-2">{result.percentage}%</p>
          </div>
          <p className={`text-sm font-medium mb-6 ${passed ? "text-green-600" : "text-orange-600"}`}>
            {passed ? "Great job! You passed the quiz." : "Keep practicing — you'll get there!"}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Try Again
            </button>
            <Link
              to={`/courses/${courseId}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Back to Course
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to={`/courses/${courseId}`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Course
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{quiz.title}</h1>
        <p className="text-sm text-gray-500">{quiz.questions?.length || 0} questions</p>
      </div>

      {error && <div className="mb-4"><ErrorMessage message={error} /></div>}

      {previousResults.length > 0 && (
        <div className="bg-blue-50 rounded-lg border border-blue-100 p-4 mb-4">
          <p className="text-sm font-medium text-blue-900 mb-1">Previous attempts:</p>
          <div className="flex flex-wrap gap-2">
            {previousResults.slice(0, 5).map((r, i) => (
              <span key={i} className="px-3 py-1 rounded-md text-xs font-medium bg-white text-blue-700 border border-blue-200">
                {r.score}/{r.total_questions} ({Math.round((r.score / r.total_questions) * 100)}%)
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {quiz.questions?.map((q: any, i: number) => {
          const options = [
            { key: "option_a", text: q.option_a },
            { key: "option_b", text: q.option_b },
            { key: "option_c", text: q.option_c },
            { key: "option_d", text: q.option_d },
          ];
          return (
            <div key={q.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="font-medium text-gray-900 mb-3">
                {i + 1}. {q.question}
              </p>
              <div className="space-y-2">
                {options.map((opt) => {
                  const selected = answers[String(q.id)] === opt.text;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => setAnswers({ ...answers, [String(q.id)]: opt.text })}
                      className={`flex items-center gap-3 w-full p-3 rounded-lg border text-left text-sm transition-colors ${
                        selected
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                        selected ? "border-blue-600 bg-blue-600" : "border-gray-300"
                      }`}>
                        {selected && <CheckCircle className="w-3 h-3 text-white" />}
                      </span>
                      {opt.text}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting || Object.keys(answers).length < (quiz.questions?.length || 0)}
        className="mt-6 w-full px-6 py-3 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {submitting ? "Submitting..." : `Submit Quiz (${Object.keys(answers).length}/${quiz.questions?.length || 0} answered)`}
      </button>
    </div>
  );
}
