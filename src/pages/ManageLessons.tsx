import { useState, useEffect, type FormEvent } from "react";
import { api } from "@/api";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/ErrorMessage";
import Modal from "@/components/Modal";
import { Plus, Pencil, Trash2, ListChecks } from "lucide-react";

interface Lesson {
  id: number;
  course_id: number;
  title: string;
  content: string;
  lesson_order: number;
}

interface Course {
  id: number;
  title: string;
}

export default function ManageLessons() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Lesson | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", lesson_order: 0 });

  useEffect(() => {
    api.getCourses()
      .then((data) => {
        setCourses(data);
        if (data.length > 0) setSelectedCourse(data[0].id);
        setError("");
      })
      .catch((err) => setError(err.message || "Failed to load courses."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    api.getLessons(selectedCourse)
      .then((data) => setLessons(data))
      .catch((err) => setError(err.message || "Failed to load lessons."));
  }, [selectedCourse]);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", content: "", lesson_order: lessons.length + 1 });
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (l: Lesson) => {
    setEditing(l);
    setForm({ title: l.title, content: l.content, lesson_order: l.lesson_order });
    setFormError("");
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!form.title.trim()) return setFormError("Title is required.");
    if (!form.content.trim()) return setFormError("Content is required.");
    if (!selectedCourse) return;

    setFormLoading(true);
    try {
      if (editing) {
        await api.updateLesson(editing.id, form);
      } else {
        await api.createLesson(selectedCourse, form);
      }
      setShowForm(false);
      const data = await api.getLessons(selectedCourse);
      setLessons(data);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save lesson.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId || !selectedCourse) return;
    try {
      await api.deleteLesson(deleteId);
      setDeleteId(null);
      const data = await api.getLessons(selectedCourse);
      setLessons(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete lesson.");
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Lessons</h1>
          <p className="text-gray-500 text-sm mt-1">Add, edit, and delete lessons for each course</p>
        </div>
        <button onClick={openCreate} disabled={!selectedCourse}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors">
          <Plus className="w-4 h-4" /> Add Lesson
        </button>
      </div>

      {/* Course selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Course</label>
        <select value={selectedCourse || ""} onChange={(e) => setSelectedCourse(Number(e.target.value))}
          className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-md w-full">
          {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>

      {error && <div className="mb-4"><ErrorMessage message={error} /></div>}

      {lessons.length === 0 ? (
        <div className="text-center py-16">
          <ListChecks className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No lessons yet. Add your first lesson!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {lessons.map((l, i) => (
            <div key={l.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 text-blue-600 text-sm font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{l.title}</p>
                <p className="text-sm text-gray-500 line-clamp-1">{l.content}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => openEdit(l)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => setDeleteId(l.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
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
            <h2 className="text-xl font-bold text-gray-900 mb-4">{editing ? "Edit Lesson" : "Add Lesson"}</h2>
            {formError && <div className="mb-4"><ErrorMessage message={formError} /></div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={6}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                <input type="number" value={form.lesson_order} onChange={(e) => setForm({ ...form, lesson_order: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
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

      <Modal isOpen={deleteId !== null} title="Delete Lesson" onClose={() => setDeleteId(null)} onConfirm={handleDelete} confirmText="Delete">
        Are you sure you want to delete this lesson?
      </Modal>
    </div>
  );
}
