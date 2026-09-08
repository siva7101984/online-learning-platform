const API_BASE = "http://localhost:5000";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "Something went wrong. Please try again.");
  }

  return data;
}

export const api = {
  // --- Auth ---
  register: (name, email, password, role = "student") =>
    request("/api/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role }),
    }),

  login: (email, password) =>
    request("/api/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  logout: () => request("/api/logout", { method: "POST" }),

  getCurrentUser: () => request("/api/user"),

  // --- Courses ---
  getCourses: (search = "", category = "") => {
    let qs = "";
    if (search) qs += `search=${encodeURIComponent(search)}&`;
    if (category) qs += `category=${encodeURIComponent(category)}&`;
    return request(`/api/courses${qs ? "?" + qs : ""}`);
  },

  getCourse: (id) => request(`/api/courses/${id}`),

  createCourse: (course) =>
    request("/api/courses", { method: "POST", body: JSON.stringify(course) }),

  updateCourse: (id, course) =>
    request(`/api/courses/${id}`, { method: "PUT", body: JSON.stringify(course) }),

  deleteCourse: (id) =>
    request(`/api/courses/${id}`, { method: "DELETE" }),

  // --- Lessons ---
  getLessons: (courseId) => request(`/api/courses/${courseId}/lessons`),

  createLesson: (courseId, lesson) =>
    request(`/api/courses/${courseId}/lessons`, {
      method: "POST",
      body: JSON.stringify(lesson),
    }),

  updateLesson: (id, lesson) =>
    request(`/api/lessons/${id}`, { method: "PUT", body: JSON.stringify(lesson) }),

  deleteLesson: (id) =>
    request(`/api/lessons/${id}`, { method: "DELETE" }),

  // --- Enrollments ---
  enroll: (courseId) =>
    request("/api/enrollments", {
      method: "POST",
      body: JSON.stringify({ course_id: courseId }),
    }),

  getEnrollments: (userId) => request(`/api/enrollments/user/${userId}`),

  // --- Progress ---
  updateProgress: (courseId, lessonId, completed) =>
    request("/api/progress", {
      method: "POST",
      body: JSON.stringify({ course_id: courseId, lesson_id: lessonId, completed }),
    }),

  getProgress: (courseId) => request(`/api/progress/${courseId}`),

  // --- Quizzes ---
  getQuiz: (courseId) => request(`/api/courses/${courseId}/quiz`),

  createQuiz: (courseId, title) =>
    request("/api/quizzes", {
      method: "POST",
      body: JSON.stringify({ course_id: courseId, title }),
    }),

  addQuestion: (quizId, question) =>
    request(`/api/quizzes/${quizId}/questions`, {
      method: "POST",
      body: JSON.stringify(question),
    }),

  deleteQuestion: (questionId) =>
    request(`/api/questions/${questionId}`, { method: "DELETE" }),

  submitQuiz: (quizId, answers) =>
    request(`/api/quizzes/${quizId}/submit`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    }),

  getQuizResults: (quizId) =>
    request(`/api/quizzes/${quizId}/results`),

  // --- Dashboard ---
  getStudentDashboard: () => request("/api/student/dashboard"),

  getAdminDashboard: () => request("/api/admin/dashboard"),

  getAdminStudents: () => request("/api/admin/students"),

  getAdminEnrollments: () => request("/api/admin/enrollments"),

  getAdminProgress: () => request("/api/admin/progress"),
};
