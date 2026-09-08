"""
progress_routes.py
=================
All progress-related API endpoints.

ENDPOINTS:
- POST /api/progress              — Mark a lesson as completed (or uncompleted)
- GET  /api/progress/<course_id>   — Get progress for the logged-in user in a course
"""

from flask import Blueprint, request, session, jsonify
from database import get_db_connection
from auth import login_required
from datetime import datetime

progress_bp = Blueprint("progress", __name__)


@progress_bp.route("/api/progress", methods=["POST"])
@login_required
def update_progress():
    """
    Mark a lesson as completed or not completed.
    Expects JSON: { course_id, lesson_id, completed (true/false) }

    HOW PROGRESS WORKS:
    - Each lesson has a progress record per user.
    - When completed = 1, we record the completion time.
    - Course progress = (completed lessons / total lessons) * 100
    """
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided."}), 400

    course_id = data.get("course_id")
    lesson_id = data.get("lesson_id")
    completed = data.get("completed", True)
    user_id = session.get("user_id")

    if not course_id or not lesson_id:
        return jsonify({"error": "Course ID and Lesson ID are required."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if a progress record already exists for this user + lesson
    cursor.execute(
        "SELECT * FROM progress WHERE user_id = ? AND lesson_id = ?",
        (user_id, lesson_id)
    )
    existing = cursor.fetchone()

    if existing:
        # Update existing record
        completed_at = datetime.now().isoformat() if completed else None
        cursor.execute(
            "UPDATE progress SET completed = ?, completed_at = ? WHERE id = ?",
            (1 if completed else 0, completed_at, existing["id"])
        )
    else:
        # Insert new record
        completed_at = datetime.now().isoformat() if completed else None
        cursor.execute(
            "INSERT INTO progress (user_id, course_id, lesson_id, completed, completed_at) VALUES (?, ?, ?, ?, ?)",
            (user_id, course_id, lesson_id, 1 if completed else 0, completed_at)
        )

    conn.commit()
    conn.close()

    return jsonify({"message": "Progress updated successfully."}), 200


@progress_bp.route("/api/progress/<int:course_id>", methods=["GET"])
@login_required
def get_progress(course_id):
    """
    Get the logged-in user's progress for a specific course.
    Returns list of completed lesson IDs and a progress percentage.
    """
    user_id = session.get("user_id")

    conn = get_db_connection()
    cursor = conn.cursor()

    # Get total lessons in course
    cursor.execute("SELECT COUNT(*) as total FROM lessons WHERE course_id = ?", (course_id,))
    total_row = cursor.fetchone()
    total_lessons = total_row["total"] if total_row else 0

    # Get completed lessons
    cursor.execute(
        "SELECT lesson_id FROM progress WHERE user_id = ? AND course_id = ? AND completed = 1",
        (user_id, course_id)
    )
    completed = [row["lesson_id"] for row in cursor.fetchall()]

    # Calculate percentage
    if total_lessons > 0:
        percentage = round((len(completed) / total_lessons) * 100)
    else:
        percentage = 0

    conn.close()
    return jsonify({
        "total_lessons": total_lessons,
        "completed_lessons": len(completed),
        "completed_lesson_ids": completed,
        "percentage": percentage
    }), 200
