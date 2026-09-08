import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/ErrorMessage";
import { BookOpen, Users, FileText, TrendingUp, BookMarked, ListChecks, FileQuestion, UserCheck } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"overview" | "students" | "enrollments" | "progress">("overview");

  useEffect(() => {
    Promise.all([
      api.getAdminDashboard(),
      api.getAdminStudents(),
      api.getAdminEnrollments(),
      api.getAdminProgress(),
    ])
      .then(([s, st, en, pr]) => {
        setStats(s);
        setStudents(st);
        setEnrollments(en);
        setProgress(pr);
        setError("");
      })
      .catch((err) => setError(err.message || "Failed to load admin dashboard."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (error) return <div className="max-w-7xl mx-auto px-4 py-8"><ErrorMessage message={error} /></div>;

  const statCards = [
    { icon: BookOpen, label: "Total Courses", value: stats?.total_courses || 0, color: "bg-blue-50 text-blue-600" },
    { icon: Users, label: "Total Students", value: stats?.total_students || 0, color: "bg-green-50 text-green-600" },
    { icon: FileText, label: "Total Enrollments", value: stats?.total_enrollments || 0, color: "bg-orange-50 text-orange-600" },
    { icon: BookMarked, label: "Total Lessons", value: stats?.total_lessons || 0, color: "bg-purple-50 text-purple-600" },
  ];

  const manageLinks = [
    { to: "/admin/courses", icon: BookOpen, label: "Manage Courses" },
    { to: "/admin/lessons", icon: ListChecks, label: "Manage Lessons" },
    { to: "/admin/quizzes", icon: FileQuestion, label: "Manage Quizzes" },
  ];

  const tabs = [
    { key: "overview" as const, label: "Overview", icon: TrendingUp },
    { key: "students" as const, label: "Students", icon: Users },
    { key: "enrollments" as const, label: "Enrollments", icon: FileText },
    { key: "progress" as const, label: "Progress", icon: UserCheck },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Admin Dashboard</h1>
        <p className="text-gray-500">Manage your learning platform</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className={`inline-flex w-10 h-10 rounded-lg items-center justify-center mb-3 ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Manage links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {manageLinks.map((link, i) => (
          <Link
            key={i}
            to={link.to}
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-white hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <link.icon className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">{link.label}</span>
          </Link>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {tab === "overview" && (
          <div className="p-6">
            <p className="text-sm text-gray-500 mb-4">Quick summary of platform activity.</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50">
                <span className="text-sm text-gray-700">Active Courses</span>
                <span className="font-bold text-blue-700">{stats?.total_courses || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-green-50">
                <span className="text-sm text-gray-700">Registered Students</span>
                <span className="font-bold text-green-700">{stats?.total_students || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-orange-50">
                <span className="text-sm text-gray-700">Total Enrollments</span>
                <span className="font-bold text-orange-700">{stats?.total_enrollments || 0}</span>
              </div>
            </div>
          </div>
        )}

        {tab === "students" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Enrollments</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-8 text-gray-400">No students yet.</td></tr>
                ) : (
                  students.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                      <td className="px-4 py-3 text-gray-600">{s.email}</td>
                      <td className="px-4 py-3 text-gray-600">{s.enrollment_count}</td>
                      <td className="px-4 py-3 text-gray-500">{s.created_at?.slice(0, 10)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === "enrollments" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Student</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Course</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Instructor</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Enrolled At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {enrollments.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-8 text-gray-400">No enrollments yet.</td></tr>
                ) : (
                  enrollments.map((e, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{e.student_name}</td>
                      <td className="px-4 py-3 text-gray-600">{e.course_title}</td>
                      <td className="px-4 py-3 text-gray-600">{e.instructor}</td>
                      <td className="px-4 py-3 text-gray-500">{e.enrolled_at?.slice(0, 10)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === "progress" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Student</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Course</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Completed</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {progress.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-8 text-gray-400">No progress data yet.</td></tr>
                ) : (
                  progress.map((p, i) => {
                    const pct = p.total_lessons > 0 ? Math.round((p.completed_lessons / p.total_lessons) * 100) : 0;
                    return (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{p.student_name}</td>
                        <td className="px-4 py-3 text-gray-600">{p.course_title}</td>
                        <td className="px-4 py-3 text-gray-600">{p.completed_lessons}/{p.total_lessons}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${pct === 100 ? "bg-green-500" : "bg-blue-600"}`} style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs font-medium text-gray-600">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
