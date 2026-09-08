# Online Learning Platform

A full-stack learning management platform where students can discover courses, enroll in courses, complete lessons, track learning progress, and take quizzes. Administrators can manage courses, lessons, quizzes, students, enrollments, and progress from a dedicated dashboard.

## ✨ Features

### Student
- User registration and login
- Browse courses
- Search courses by keyword
- Filter courses by category
- View course details and lessons
- Enroll in courses
- Navigate between lessons
- Mark lessons as completed
- Track course progress
- Take course quizzes
- View quiz scores
- Student dashboard with learning statistics

### Admin
- Secure admin login
- Admin dashboard with platform statistics
- Create, update, and delete courses
- Create, update, and delete lessons
- Create quizzes and manage questions
- View registered students
- View course enrollments
- View student learning progress

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, TypeScript, React Router |
| Styling | Tailwind CSS |
| UI Icons | Lucide React |
| Backend | Python, Flask |
| API | Flask REST API, Flask-CORS |
| Database | SQLite |
| Authentication | Flask sessions, Werkzeug password hashing |
| Build Tool | Vite |

## 🏗️ Architecture

```text
┌─────────────────────────────┐
│      React + TypeScript     │
│        Frontend             │
│      Vite + Tailwind CSS    │
└──────────────┬──────────────┘
               │ HTTP / JSON
               ▼
┌─────────────────────────────┐
│        Flask REST API       │
│ Authentication & Business   │
│          Logic              │
└──────────────┬──────────────┘
               │ SQL
               ▼
┌─────────────────────────────┐
│          SQLite             │
│ Users, Courses, Lessons,    │
│ Enrollments, Progress,      │
│ Quizzes & Results           │
└─────────────────────────────┘
```

## 📂 Project Structure

```text
online-learning-platform/
├── backend/
│   ├── app.py
│   ├── auth.py
│   ├── database.py
│   ├── requirements.txt
│   └── routes/
│       ├── auth_routes.py
│       ├── course_routes.py
│       ├── dashboard_routes.py
│       ├── enrollment_routes.py
│       ├── lesson_routes.py
│       ├── progress_routes.py
│       └── quiz_routes.py
│
├── src/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── api.ts
│   ├── App.tsx
│   └── main.tsx
│
├── .gitignore
├── package.json
├── package-lock.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 🗄️ Database Design

The application uses SQLite with tables for:

- Users and roles
- Courses
- Lessons
- Enrollments
- Lesson progress
- Quizzes
- Quiz questions
- Quiz results

Relationships connect users with enrollments and progress, while courses connect to lessons and quizzes.

## 🔌 API Modules

The Flask backend provides REST endpoints for:

- **Authentication** — registration, login, logout, current-user information
- **Courses** — listing, searching, creating, updating, and deleting courses
- **Lessons** — retrieving and managing course lessons
- **Enrollments** — enrolling students and retrieving their courses
- **Progress** — recording and retrieving lesson completion
- **Quizzes** — creating quizzes, managing questions, submitting answers, and retrieving results
- **Dashboards** — student and administrator statistics

## ⚙️ Getting Started

### Prerequisites

Install:

- Python 3.10 or later
- Node.js 18 or later
- npm

### 1. Clone the repository

```bash
git clone https://github.com/siva7101984/online-learning-platform.git
cd online-learning-platform
```

### 2. Set up the backend

```bash
cd backend
python -m venv venv
```

Activate the virtual environment on Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start Flask:

```bash
python app.py
```

The backend runs on:

```text
http://localhost:5000
```

### 3. Set up the frontend

Open a second terminal in the project root:

```bash
npm install
npm run dev
```

The Vite development server will display the local frontend URL in the terminal.

## 🔐 Environment Variables

Do not commit secrets or environment files to GitHub.

Create environment variables for deployment as needed, for example:

```text
SECRET_KEY=your-secure-secret-key
```

The repository's `.gitignore` excludes `.env` files.

## 🧪 Testing the Main User Flow

1. Register a student account.
2. Log in as a student.
3. Browse and search for courses.
4. Open a course.
5. Enroll in the course.
6. Open lessons and mark them as completed.
7. Check the progress indicator.
8. Attempt the course quiz.
9. Review the quiz score.
10. Log in as an administrator.
11. Create or edit courses, lessons, and quizzes.
12. Review students, enrollments, and progress.

## 📸 Screenshots

Screenshots can be added here to showcase the main application screens:

- Home / Course listing
- Login and registration
- Student dashboard
- Course details
- Lesson view
- Quiz
- Admin dashboard

## 🚀 Future Enhancements

- Video-based lessons
- Course completion certificates
- Discussion forums
- Email notifications
- Payment integration
- More advanced analytics
- Cloud database and production deployment

## 📌 Project Highlights

This project demonstrates practical experience with:

- Full-stack web application development
- React and TypeScript component design
- REST API development with Flask
- Authentication and session management
- Role-based application features
- Relational database design
- CRUD operations
- Progress tracking
- Quiz and result management
- Frontend-backend integration

## 👨‍💻 Author

**Siva Prasad**

B.Tech — Computer Science / AI & Data Science

---

⭐ If you find this project useful, consider giving the repository a star.
