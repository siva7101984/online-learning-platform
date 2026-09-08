"""
auth_routes.py
==============
All authentication-related API endpoints.

ENDPOINTS:
- POST /api/register  — Create a new user account
- POST /api/login     — Log in and start a session
- POST /api/logout    — Log out and clear the session
- GET  /api/user      — Get current logged-in user info

WHY HASH PASSWORDS?
- If someone steals the database, they can't see actual passwords.
- We use generate_password_hash() to store a hash.
- On login, we use check_password_hash() to compare.
- The original password can NEVER be recovered from the hash.
"""

from flask import Blueprint, request, session, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from database import get_db_connection

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/api/register", methods=["POST"])
def register():
    """
    Register a new user.
    Expects JSON: { name, email, password, role (optional, default "student") }
    """
    data = request.get_json()

    # --- Input Validation ---
    if not data:
        return jsonify({"error": "No data provided."}), 400

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    role = data.get("role", "student").strip()

    if not name:
        return jsonify({"error": "Please enter your name."}), 400
    if not email:
        return jsonify({"error": "Please enter your email."}), 400
    if not password:
        return jsonify({"error": "Please enter your password."}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters."}), 400
    if role not in ("student", "admin"):
        return jsonify({"error": "Invalid role."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if email already exists
    cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
    if cursor.fetchone():
        conn.close()
        return jsonify({"error": "This email is already registered."}), 409

    # Hash the password before storing
    hashed_password = generate_password_hash(password)

    cursor.execute(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        (name, email, hashed_password, role)
    )
    conn.commit()

    user_id = cursor.lastrowid
    conn.close()

    return jsonify({
        "message": "Account created successfully.",
        "user": {"id": user_id, "name": name, "email": email, "role": role}
    }), 201


@auth_bp.route("/api/login", methods=["POST"])
def login():
    """
    Log in a user.
    Expects JSON: { email, password }
    Stores user info in the Flask session.
    """
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided."}), 400

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email:
        return jsonify({"error": "Please enter your email."}), 400
    if not password:
        return jsonify({"error": "Please enter your password."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # Use parameterized query to prevent SQL injection
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()

    if not user:
        return jsonify({"error": "Invalid email or password."}), 401

    # Check the password hash
    if not check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid email or password."}), 401

    # Store user info in session (this sets a signed cookie)
    session["user_id"] = user["id"]
    session["name"] = user["name"]
    session["role"] = user["role"]

    return jsonify({
        "message": "Login successful.",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"]
        }
    }), 200


@auth_bp.route("/api/logout", methods=["POST"])
def logout():
    """Clear the session to log the user out."""
    session.clear()
    return jsonify({"message": "Logged out successfully."}), 200


@auth_bp.route("/api/user", methods=["GET"])
def get_current_user():
    """Return the currently logged-in user's info (or null if not logged in)."""
    if "user_id" not in session:
        return jsonify({"user": None}), 200

    return jsonify({
        "user": {
            "id": session["user_id"],
            "name": session["name"],
            "role": session["role"]
        }
    }), 200
