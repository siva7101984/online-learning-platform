"""
lesson_routes.py
================
All lesson-related API endpoints.

ENDPOINTS:
- GET    /api/courses/<course_id>/lessons  — List all lessons for a course
- POST   /api/courses/<course_id>/lessons  — Add a lesson (admin only)
- PUT    /api/lessons/<id>                  — Update a lesson (admin only)
- DELETE /api/lessons/<id>                  — Delete a lesson (admin only)
"""

from flask import Blueprint, request, jsonify
from database import get_db_connection
from auth import admin_required

lesson_bp = Blueprint("lessons", __name__)


@lesson_bp.route("/api/courses/<int:course_id>/lessons", methods=["GET"])
def get_lessons(course_id):
    """Get all lessons for a specific course, ordered by lesson_order."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM courses WHERE id = ?", (course_id,))
    if not cursor.fetchone():
        conn.close()
        return jsonify({"error": "Course not found."}), 404

    cursor.execute(
        "SELECT * FROM lessons WHERE course_id = ? ORDER BY lesson_order ASC",
        (course_id,)
    )
    lessons = cursor.fetchall()
    result = [dict(l) for l in lessons]
    conn.close()
    return jsonify(result), 200


@lesson_bp.route("/api/courses/<int:course_id>/lessons", methods=["POST"])
@admin_required
def create_lesson(course_id):
    """
    Add a new lesson to a course. Admin only.
    Expects JSON: { title, content, lesson_order (optional) }
    """
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided."}), 400

    title = data.get("title", "").strip()
    content = data.get("content", "").strip()
    lesson_order = data.get("lesson_order", 0)

    if not title:
        return jsonify({"error": "Lesson title is required."}), 400
    if not content:
        return jsonify({"error": "Lesson content is required."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM courses WHERE id = ?", (course_id,))
    if not cursor.fetchone():
        conn.close()
        return jsonify({"error": "Course not found."}), 404

    # If no order specified, put it at the end
    if not lesson_order:
        cursor.execute("SELECT COUNT(*) as cnt FROM lessons WHERE course_id = ?", (course_id,))
        row = cursor.fetchone()
        lesson_order = row["cnt"] + 1 if row else 1

    cursor.execute(
        "INSERT INTO lessons (course_id, title, content, lesson_order) VALUES (?, ?, ?, ?)",
        (course_id, title, content, lesson_order)
    )
    conn.commit()
    lesson_id = cursor.lastrowid
    conn.close()

    return jsonify({
        "message": "Lesson created successfully.",
        "lesson": {"id": lesson_id, "course_id": course_id, "title": title,
                   "content": content, "lesson_order": lesson_order}
    }), 201


@lesson_bp.route("/api/lessons/<int:lesson_id>", methods=["PUT"])
@admin_required
def update_lesson(lesson_id):
    """
    Update a lesson. Admin only.
    Expects JSON with any of: title, content, lesson_order
    """
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM lessons WHERE id = ?", (lesson_id,))
    lesson = cursor.fetchone()
    if not lesson:
        conn.close()
        return jsonify({"error": "Lesson not found."}), 404

    title = data.get("title", lesson["title"]).strip()
    content = data.get("content", lesson["content"]).strip()
    lesson_order = data.get("lesson_order", lesson["lesson_order"])

    cursor.execute(
        "UPDATE lessons SET title = ?, content = ?, lesson_order = ? WHERE id = ?",
        (title, content, lesson_order, lesson_id)
    )
    conn.commit()
    conn.close()

    return jsonify({
        "message": "Lesson updated successfully.",
        "lesson": {"id": lesson_id, "title": title, "content": content, "lesson_order": lesson_order}
    }), 200


@lesson_bp.route("/api/lessons/<int:lesson_id>", methods=["DELETE"])
@admin_required
def delete_lesson(lesson_id):
    """Delete a lesson. Admin only."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM lessons WHERE id = ?", (lesson_id,))
    if not cursor.fetchone():
        conn.close()
        return jsonify({"error": "Lesson not found."}), 404

    cursor.execute("DELETE FROM lessons WHERE id = ?", (lesson_id,))
    conn.commit()
    conn.close()

    return jsonify({"message": "Lesson deleted successfully."}), 200
