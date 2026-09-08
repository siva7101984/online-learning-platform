"""
dashboard_routes.py
===================
Dashboard API endpoints for both students and admins.

ENDPOINTS:
- GET /api/student/dashboard  — Stats for the logged-in student
- GET /api/admin/dashboard    — Stats for the admin
- GET /api/admin/students      — List all students (admin only)
- GET /api/admin/enrollments   — All enrollments with details (admin only)
- GET /api/admin/progress       — All progress records (admin only)
"""

from flask import Blueprint, session, jsonify
from database import get_db_connection
from auth import login_required, admin_required

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("/api/student/dashboard", methods=["GET"])
@login_required
def student_dashboard():
    """
    Get dashboard stats for the logged-in student:
    - Enrolled courses count
    - Completed courses count
    - Average quiz score
    - Enrolled courses with progress
    """
    user_id = session.get("user_id")
    conn = get_db_connection()
    cursor = conn.cursor()

    # Count enrolled courses
    cursor.execute("SELECT COUNT(*) as cnt FROM enrollments WHERE user_id = ?", (user_id,))
    enrolled_count = cursor.fetchone()["cnt"]

    # Get enrolled courses with progress
    cursor.execute(
        """SELECT c.*, e.enrolled_at,
           (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) as total_lessons,
           (SELECT COUNT(*) FROM progress p
            WHERE p.user_id = e.user_id AND p.course_id = c.id AND p.completed = 1) as completed_lessons
           FROM enrollments e
           JOIN courses c ON e.course_id = c.id
           WHERE e.user_id = ?
           ORDER BY e.enrolled_at DESC""",
        (user_id,)
    )
    courses = [dict(r) for r in cursor.fetchall()]

    # Count completed courses (where all lessons are completed)
    completed_count = 0
    for c in courses:
        if c["total_lessons"] > 0 and c["completed_lessons"] == c["total_lessons"]:
            completed_count += 1

    # Average quiz score
    cursor.execute(
        "SELECT AVG(CAST(score AS FLOAT) / total_questions * 100) as avg_score FROM quiz_results WHERE user_id = ?",
        (user_id,)
    )
    avg_row = cursor.fetchone()
    avg_score = round(avg_row["avg_score"], 1) if avg_row and avg_row["avg_score"] is not None else 0

    conn.close()
    return jsonify({
        "enrolled_courses": enrolled_count,
        "completed_courses": completed_count,
        "average_quiz_score": avg_score,
        "courses": courses
    }), 200


@dashboard_bp.route("/api/admin/dashboard", methods=["GET"])
@admin_required
def admin_dashboard():
    """
    Get dashboard stats for the admin:
    - Total courses, students, enrollments, lessons
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) as cnt FROM courses")
    total_courses = cursor.fetchone()["cnt"]

    cursor.execute("SELECT COUNT(*) as cnt FROM users WHERE role = 'student'")
    total_students = cursor.fetchone()["cnt"]

    cursor.execute("SELECT COUNT(*) as cnt FROM enrollments")
    total_enrollments = cursor.fetchone()["cnt"]

    cursor.execute("SELECT COUNT(*) as cnt FROM lessons")
    total_lessons = cursor.fetchone()["cnt"]

    conn.close()
    return jsonify({
        "total_courses": total_courses,
        "total_students": total_students,
        "total_enrollments": total_enrollments,
        "total_lessons": total_lessons
    }), 200


@dashboard_bp.route("/api/admin/students", methods=["GET"])
@admin_required
def admin_students():
    """List all students with their enrollment counts."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """SELECT u.id, u.name, u.email, u.created_at,
           (SELECT COUNT(*) FROM enrollments WHERE user_id = u.id) as enrollment_count
           FROM users u WHERE u.role = 'student' ORDER BY u.created_at DESC"""
    )
    students = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return jsonify(students), 200


@dashboard_bp.route("/api/admin/enrollments", methods=["GET"])
@admin_required
def admin_enrollments():
    """List all enrollments with student and course names."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """SELECT e.id, e.enrolled_at, u.name as student_name, u.email as student_email,
           c.title as course_title, c.instructor
           FROM enrollments e
           JOIN users u ON e.user_id = u.id
           JOIN courses c ON e.course_id = c.id
           ORDER BY e.enrolled_at DESC"""
    )
    enrollments = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return jsonify(enrollments), 200


@dashboard_bp.route("/api/admin/progress", methods=["GET"])
@admin_required
def admin_progress():
    """List all progress records with student and course details."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """SELECT p.user_id, u.name as student_name, c.title as course_title,
           COUNT(CASE WHEN p.completed = 1 THEN 1 END) as completed_lessons,
           (SELECT COUNT(*) FROM lessons WHERE course_id = p.course_id) as total_lessons
           FROM progress p
           JOIN users u ON p.user_id = u.id
           JOIN courses c ON p.course_id = c.id
           GROUP BY p.user_id, p.course_id
           ORDER BY u.name"""
    )
    progress = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return jsonify(progress), 200
