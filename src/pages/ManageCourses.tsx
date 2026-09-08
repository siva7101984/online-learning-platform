import { useState, useEffect, type FormEvent } from "react";
import { api } from "@/api";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/ErrorMessage";
import Modal from "@/components/Modal";
import { Plus, Pencil, Trash2, BookOpen } from "lucide-react";

const CATEGORIES = ["Python", "Web Development", "Java", "Data Science", "AI/ML", "Database"];
const EMOJIS = ["🐍", "🌐", "☕", "📊", "🤖", "🗄️", "📚", "💻", "🎓"];

interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  instructor: string;
  image: string;
}

export default function ManageCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const [form, setForm] = useState({ title: "", description: "", category: CATEGORIES[0], instructor: "", image: "📚" });

  const load = () => {
    api.getCourses()
      .then((data) => { setCourses(data); setError(""); })
      .catch((err) => setError(err.message || "Failed to load courses."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", description: "", category: CATEGORIES[0], instructor: "", image: "📚" });
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (c: Course) => {
    setEditing(c);
    setForm({ title: c.title, description: c.description, category: c.category, instructor: c.instructor, image: c.image || "📚" });
    setFormError("");
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!form.title.trim()) return setFormError("Title is required.");
    if (!form.description.trim()) return setFormError("Description is required.");
    if (!form.instructor.trim()) return setFormError("Instructor is required.");

    setFormLoading(true);
    try {
      if (editing) {
        await api.updateCourse(editing.id, form);
      } else {
        await api.createCourse(form);
      }
      setShowForm(false);
      load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save course.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.deleteCourse(deleteId);
      setDeleteId(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete course.");
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Courses</h1>
          <p className="text-gray-500 text-sm mt-1">Create, edit, and delete courses</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Course
        </button>
      </div>

      {error && <div className="mb-4"><ErrorMessage message={error} /></div>}

      {courses.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No courses yet. Create your first course!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{c.image || "📚"}</span>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(c)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteId(c.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{c.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-2">{c.description}</p>
              <div className="flex gap-2">
                <span className="px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">{c.category}</span>
                <span className="px-2 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-600">{c.instructor}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{editing ? "Edit Course" : "Add Course"}</h2>
            {formError && <div className="mb-4"><ErrorMessage message={formError} /></div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instructor</label>
                  <input type="text" value={form.instructor} onChange={(e) => setForm({ ...form, instructor: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJIS.map((e) => (
                    <button key={e} type="button" onClick={() => setForm({ ...form, image: e })}
                      className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center border-2 transition-colors ${form.image === e ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="submit" disabled={formLoading}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  {formLoading ? "Saving..." : editing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <Modal
        isOpen={deleteId !== null}
        title="Delete Course"
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        confirmText="Delete"
      >
        Are you sure you want to delete this course? This will also delete all its lessons and quiz data.
      </Modal>
    </div>
  );
}
