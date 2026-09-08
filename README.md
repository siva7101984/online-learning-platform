# Online Learning & Course Management Platform

A full-stack web application built with **React**, **Flask**, and **SQLite** that allows students to browse courses, enroll, complete lessons, take quizzes, and track their progress — while instructors can manage courses, lessons, and quizzes.

## Features

### Student
- Register and log in
- Browse, search, and filter courses by category
- View course details and lesson lists
- Enroll in courses
- View lessons with Previous/Next navigation
- Mark lessons as completed
- Track course progress with progress bars
- Take quizzes and view scores
- View personal dashboard with stats

### Admin / Instructor
- Log in to admin dashboard
- Create, edit, and delete courses
- Add, edit, and delete lessons
- Create quizzes and manage quiz questions
- View all students
- View all enrollments
- View student progress

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router, Tailwind CSS, Lucide Icons |
| Backend | Python Flask, Flask-CORS |
| Database | SQLite |
| Auth | Werkzeug password hashing, Flask sessions |
| Build Tool | Vite |

## Architecture

```
React Frontend (port 5174)
       |
       | HTTP requests using fetch()
       ↓
Flask REST API (port 5000)
       |
       ↓
SQLite Database (learning.db)
```

**Data flow example:**
1. User clicks "Enroll" in React
2. React calls `fetch('/api/enrollments', { method: 'POST' })`
3. Flask receives the request, validates the session
4. Flask executes `INSERT INTO enrollments ...` in SQLite
5. Flask returns JSON response `{ "message": "Successfully enrolled." }`
6. React updates the UI to show "Continue Learning"

## Database Schema

```
USERS
  id, name, email, password, role, created_at

COURSES
  id, title, description, category, instructor, image, created_at

LESSONS
  id, course_id (FK→courses), title, content, lesson_order

ENROLLMENTS
  id, user_id (FK→users), course_id (FK→courses), enrolled_at

PROGRESS
  id, user_id, course_id, lesson_id, completed, completed_at

QUIZZES
  id, course_id (FK→courses), title

QUESTIONS
  id, quiz_id (FK→quizzes), question, option_a/b/c/d, correct_answer

QUIZ_RESULTS
  id, user_id, quiz_id, score, total_questions, attempted_at
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/register` | Register new user |
| POST | `/api/login` | Login |
| POST | `/api/logout` | Logout |
| GET | `/api/user` | Get current user |

### Courses
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/courses` | List courses (supports ?search= & ?category=) |
| GET | `/api/courses/<id>` | Get single course |
| POST | `/api/courses` | Create course (admin) |
| PUT | `/api/courses/<id>` | Update course (admin) |
| DELETE | `/api/courses/<id>` | Delete course (admin) |

### Lessons
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/courses/<course_id>/lessons` | List lessons |
| POST | `/api/courses/<course_id>/lessons` | Add lesson (admin) |
| PUT | `/api/lessons/<id>` | Update lesson (admin) |
| DELETE | `/api/lessons/<id>` | Delete lesson (admin) |

### Enrollments
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/enrollments` | Enroll in course |
| GET | `/api/enrollments/user/<user_id>` | Get user's enrollments |

### Progress
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/progress` | Mark lesson complete |
| GET | `/api/progress/<course_id>` | Get progress for course |

### Quizzes
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/courses/<course_id>/quiz` | Get quiz |
| POST | `/api/quizzes` | Create quiz (admin) |
| POST | `/api/quizzes/<quiz_id>/questions` | Add question (admin) |
| DELETE | `/api/questions/<question_id>` | Delete question (admin) |
| POST | `/api/quizzes/<quiz_id>/submit` | Submit quiz answers |
| GET | `/api/quizzes/<quiz_id>/results` | Get quiz results |

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/student/dashboard` | Student stats |
| GET | `/api/admin/dashboard` | Admin stats |
| GET | `/api/admin/students` | All students (admin) |
| GET | `/api/admin/enrollments` | All enrollments (admin) |
| GET | `/api/admin/progress` | All progress (admin) |

## Installation & Running

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend
```bash
cd backend
pip install -r requirements.txt
python app.py
```
Server starts at `http://localhost:5000`

### Frontend
```bash
npm install
npm run dev
```
App opens at `http://localhost:5174`

## Sample Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@learn.com | admin123 |
| Student | siva@learn.com | student123 |

## Manual Testing

1. Register a new student → Account created
2. Login as student → Dashboard appears
3. Search "Python" → Python course appears
4. Click "View Course" → Course details show
5. Click "Enroll Now" → Enrollment confirmed
6. Open a lesson → Lesson content displays
7. Click "Mark as Completed" → Progress bar increases
8. Take quiz → Score displayed
9. Login as admin → Admin dashboard with stats
10. Admin creates a course → Course appears in list
11. Admin deletes a course → Course removed

## Future Enhancements
- Video lesson support
- Certificate generation
- Discussion forum
- Payment integration
- Email notifications

## Author
B.Tech CSE / AI & Data Science student project.
