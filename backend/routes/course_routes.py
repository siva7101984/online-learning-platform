"""
course_routes.py
===============
All course-related API endpoints (CRUD operations).

ENDPOINTS:
- GET    /api/courses          — List all courses (with optional search/filter)
- GET    /api/courses/<id>      — Get a single course by ID
- POST   /api/courses           — Create a new course (admin only)
- PUT    /api/courses/<id>      — Update a course (admin only)
- DELETE /api/courses/<id>      — Delete a course (admin only)

WHAT IS CRUD?
- Create (POST), Read (GET), Update (PUT), Delete (DELETE)
- These are the four basic operations on any data.
"""

from flask import Blueprint, request, jsonify
from database import get_db_connection
from auth import admin_required

course_bp = Blueprint("courses", __name__)


@course_bp.route("/api/courses", methods=["GET"])
def get_courses():
    """
    Get all courses. Supports search and filter via query parameters:
    - /api/courses?search=python
    - /api/courses?category=Python
    - /api/courses?search=python&category=Web Development
    """
    search = request.args.get("search", "").strip()
    category = request.args.get("category", "").strip()

    conn = get_db_connection()
    cursor = conn.cursor()

    # Build the query with optional filters
    # We use LIKE for search and parameterized queries to prevent SQL injection
    query = "SELECT * FROM courses WHERE 1=1"
    params = []

    if search:
        query += " AND (title LIKE ? OR instructor LIKE ? OR category LIKE ?)"
        like = f"%{search}%"
        params.extend([like, like, like])

    if category:
        query += " AND category = ?"
        params.append(category)

    query += " ORDER BY created_at DESC"
    cursor.execute(query, params)
    courses = cursor.fetchall()

    result = [dict(c) for c in courses]
    conn.close()
    return jsonify(result), 200


@course_bp.route("/api/courses/<int:course_id>", methods=["GET"])
def get_course(course_id):
    """Get a single course by ID, including its lesson count."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM courses WHERE id = ?", (course_id,))
    course = cursor.fetchone()

    if not course:
        conn.close()
        return jsonify({"error": "Course not found."}), 404

    cursor.execute("SELECT COUNT(*) as lesson_count FROM lessons WHERE course_id = ?", (course_id,))
    count_row = cursor.fetchone()
    lesson_count = count_row["lesson_count"] if count_row else 0

    result = dict(course)
    result["lesson_count"] = lesson_count
    conn.close()
    return jsonify(result), 200


@course_bp.route("/api/courses", methods=["POST"])
@admin_required
def create_course():
    """
    Create a new course. Admin only.
    Expects JSON: { title, description, category, instructor, image (optional) }
    """
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided."}), 400

    title = data.get("title", "").strip()
    description = data.get("description", "").strip()
    category = data.get("category", "").strip()
    instructor = data.get("instructor", "").strip()
    image = data.get("image", "").strip()

    if not title:
        return jsonify({"error": "Course title is required."}), 400
    if not description:
        return jsonify({"error": "Course description is required."}), 400
    if not category:
        return jsonify({"error": "Course category is required."}), 400
    if not instructor:
        return jsonify({"error": "Instructor name is required."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO courses (title, description, category, instructor, image) VALUES (?, ?, ?, ?, ?)",
        (title, description, category, instructor, image)
    )
    conn.commit()
    course_id = cursor.lastrowid
    conn.close()

    return jsonify({
        "message": "Course created successfully.",
        "course": {"id": course_id, "title": title, "description": description,
                   "category": category, "instructor": instructor, "image": image}
    }), 201


@course_bp.route("/api/courses/<int:course_id>", methods=["PUT"])
@admin_required
def update_course(course_id):
    """
    Update an existing course. Admin only.
    Expects JSON with any of: title, description, category, instructor, image
    """
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM courses WHERE id = ?", (course_id,))
    course = cursor.fetchone()
    if not course:
        conn.close()
        return jsonify({"error": "Course not found."}), 404

    title = data.get("title", course["title"]).strip()
    description = data.get("description", course["description"]).strip()
    category = data.get("category", course["category"]).strip()
    instructor = data.get("instructor", course["instructor"]).strip()
    image = data.get("image", course["image"] or "").strip()

    cursor.execute(
        """UPDATE courses SET title = ?, description = ?, category = ?, instructor = ?, image = ?
           WHERE id = ?""",
        (title, description, category, instructor, image, course_id)
    )
    conn.commit()
    conn.close()

    return jsonify({
        "message": "Course updated successfully.",
        "course": {"id": course_id, "title": title, "description": description,
                   "category": category, "instructor": instructor, "image": image}
    }), 200


@course_bp.route("/api/courses/<int:course_id>", methods=["DELETE"])
@admin_required
def delete_course(course_id):
    """Delete a course by ID. Admin only."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM courses WHERE id = ?", (course_id,))
    course = cursor.fetchone()
    if not course:
        conn.close()
        return jsonify({"error": "Course not found."}), 404

    cursor.execute("DELETE FROM courses WHERE id = ?", (course_id,))
    conn.commit()
    conn.close()

    return jsonify({"message": "Course deleted successfully."}), 200
