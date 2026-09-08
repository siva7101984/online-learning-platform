"""
quiz_routes.py
==============
All quiz-related API endpoints.

ENDPOINTS:
- GET  /api/courses/<course_id>/quiz   — Get quiz + questions for a course
- POST /api/quizzes                     — Create a quiz (admin only)
- POST /api/quizzes/<quiz_id>/submit    — Submit quiz answers and get score
- POST /api/quizzes/<quiz_id>/questions  — Add a question to a quiz (admin only)
- DELETE /api/questions/<question_id>    — Delete a question (admin only)
"""

from flask import Blueprint, request, session, jsonify
from database import get_db_connection
from auth import admin_required, login_required

quiz_bp = Blueprint("quizzes", __name__)


@quiz_bp.route("/api/courses/<int:course_id>/quiz", methods=["GET"])
def get_quiz(course_id):
    """Get the quiz and all its questions for a specific course."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM quizzes WHERE course_id = ?", (course_id,))
    quiz = cursor.fetchone()

    if not quiz:
        conn.close()
        return jsonify({"error": "No quiz found for this course."}), 404

    cursor.execute("SELECT * FROM questions WHERE quiz_id = ?", (quiz["id"],))
    questions = cursor.fetchall()

    result = dict(quiz)
    result["questions"] = [dict(q) for q in questions]
    conn.close()
    return jsonify(result), 200


@quiz_bp.route("/api/quizzes", methods=["POST"])
@admin_required
def create_quiz():
    """Create a new quiz for a course. Admin only. Expects JSON: { course_id, title }"""
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided."}), 400

    course_id = data.get("course_id")
    title = data.get("title", "").strip()

    if not course_id:
        return jsonify({"error": "Course ID is required."}), 400
    if not title:
        return jsonify({"error": "Quiz title is required."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM courses WHERE id = ?", (course_id,))
    if not cursor.fetchone():
        conn.close()
        return jsonify({"error": "Course not found."}), 404

    cursor.execute("INSERT INTO quizzes (course_id, title) VALUES (?, ?)", (course_id, title))
    conn.commit()
    quiz_id = cursor.lastrowid
    conn.close()

    return jsonify({"message": "Quiz created.", "quiz": {"id": quiz_id, "course_id": course_id, "title": title}}), 201


@quiz_bp.route("/api/quizzes/<int:quiz_id>/questions", methods=["POST"])
@admin_required
def add_question(quiz_id):
    """Add a question to a quiz. Admin only."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided."}), 400

    question = data.get("question", "").strip()
    option_a = data.get("option_a", "").strip()
    option_b = data.get("option_b", "").strip()
    option_c = data.get("option_c", "").strip()
    option_d = data.get("option_d", "").strip()
    correct_answer = data.get("correct_answer", "").strip()

    if not question or not option_a or not option_b or not option_c or not option_d:
        return jsonify({"error": "Question and all four options are required."}), 400
    if correct_answer not in (option_a, option_b, option_c, option_d):
        return jsonify({"error": "Correct answer must match one of the options."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM quizzes WHERE id = ?", (quiz_id,))
    if not cursor.fetchone():
        conn.close()
        return jsonify({"error": "Quiz not found."}), 404

    cursor.execute(
        "INSERT INTO questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer)
    )
    conn.commit()
    q_id = cursor.lastrowid
    conn.close()

    return jsonify({"message": "Question added.", "question_id": q_id}), 201


@quiz_bp.route("/api/questions/<int:question_id>", methods=["DELETE"])
@admin_required
def delete_question(question_id):
    """Delete a quiz question. Admin only."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM questions WHERE id = ?", (question_id,))
    if not cursor.fetchone():
        conn.close()
        return jsonify({"error": "Question not found."}), 404

    cursor.execute("DELETE FROM questions WHERE id = ?", (question_id,))
    conn.commit()
    conn.close()

    return jsonify({"message": "Question deleted."}), 200


@quiz_bp.route("/api/quizzes/<int:quiz_id>/submit", methods=["POST"])
@login_required
def submit_quiz(quiz_id):
    """
    Submit quiz answers and calculate the score.
    Expects JSON: { answers: { question_id: "selected_option_text", ... } }
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided."}), 400

    answers = data.get("answers", {})
    user_id = session.get("user_id")

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM quizzes WHERE id = ?", (quiz_id,))
    if not cursor.fetchone():
        conn.close()
        return jsonify({"error": "Quiz not found."}), 404

    cursor.execute("SELECT * FROM questions WHERE quiz_id = ?", (quiz_id,))
    questions = cursor.fetchall()

    score = 0
    total = len(questions)
    for q in questions:
        user_answer = answers.get(str(q["id"]), "")
        if user_answer == q["correct_answer"]:
            score += 1

    cursor.execute(
        "INSERT INTO quiz_results (user_id, quiz_id, score, total_questions) VALUES (?, ?, ?, ?)",
        (user_id, quiz_id, score, total)
    )
    conn.commit()
    conn.close()

    percentage = round((score / total) * 100) if total > 0 else 0
    return jsonify({
        "message": "Quiz submitted.",
        "score": score,
        "total_questions": total,
        "percentage": percentage
    }), 200


@quiz_bp.route("/api/quizzes/<int:quiz_id>/results", methods=["GET"])
@login_required
def get_quiz_results(quiz_id):
    """Get all quiz results for the logged-in user for a specific quiz."""
    user_id = session.get("user_id")
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM quiz_results WHERE user_id = ? AND quiz_id = ? ORDER BY attempted_at DESC",
        (user_id, quiz_id)
    )
    results = cursor.fetchall()
    result_list = [dict(r) for r in results]
    conn.close()
    return jsonify(result_list), 200
