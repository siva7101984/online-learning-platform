"""
enrollment_routes.py
====================
All enrollment-related API endpoints.

ENDPOINTS:
- POST /api/enrollments              — Enroll a student in a course
- GET  /api/enrollments/user/<user_id> — Get all courses a student is enrolled in
"""

from flask import Blueprint, request, session, jsonify
from database import get_db_connection
from auth import login_required

enrollment_bp = Blueprint("enrollments", __name__)


@enrollment_bp.route("/api/enrollments", methods=["POST"])
@login_required
def enroll():
    """
    Enroll the logged-in student in a course.
    Expects JSON: { course_id }
    Prevents duplicate enrollment using the UNIQUE constraint in the database.
    """
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided."}), 400

    course_id = data.get("course_id")
    user_id = session.get("user_id")

    if not course_id:
        return jsonify({"error": "Course ID is required."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if course exists
    cursor.execute("SELECT * FROM courses WHERE id = ?", (course_id,))
    if not cursor.fetchone():
        conn.close()
        return jsonify({"error": "Course not found."}), 404

    # Check if already enrolled
    cursor.execute(
        "SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?",
        (user_id, course_id)
    )
    if cursor.fetchone():
        conn.close()
        return jsonify({"error": "You are already enrolled in this course."}), 409

    cursor.execute(
        "INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)",
        (user_id, course_id)
    )
    conn.commit()
    conn.close()

    return jsonify({"message": "Successfully enrolled."}), 201


@enrollment_bp.route("/api/enrollments/user/<int:user_id>", methods=["GET"])
@login_required
def get_user_enrollments(user_id):
    """Get all courses that a user is enrolled in, with progress info."""
    # Users can only see their own enrollments (or admin can see anyone's)
    if session.get("user_id") != user_id and session.get("role") != "admin":
        return jsonify({"error": "Access denied."}), 403

    conn = get_db_connection()
    cursor = conn.cursor()

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
    enrollments = cursor.fetchall()
    result = [dict(e) for e in enrollments]
    conn.close()
    return jsonify(result), 200
