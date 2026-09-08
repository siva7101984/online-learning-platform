"""
auth.py
=======
Handles authentication logic for the Flask backend.

WHAT IS AUTHENTICATION?
- Authentication = verifying "who you are" (login).
- Authorization = checking "what you are allowed to do" (role-based access).

HOW IT WORKS IN THIS PROJECT:
1. User registers -> password is hashed (never stored as plain text).
2. User logs in -> we check the hash, then store user info in Flask session.
3. For protected routes, we use decorators: @login_required, @admin_required.

WHY SESSION-BASED AUTH?
- Flask sessions use a signed cookie stored in the browser.
- The cookie contains the user's ID and role.
- It is signed with SECRET_KEY so it can't be tampered with.
- Simple and easy to understand — no JWT tokens needed for this project.
"""

from functools import wraps
from flask import session, jsonify
from werkzeug.security import generate_password_hash, check_password_hash


def login_required(f):
    """
    Decorator: allows access only if a user is logged in.
    Usage:
        @login_required
        def some_route(): ...
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "user_id" not in session:
            return jsonify({"error": "Please log in to access this page."}), 401
        return f(*args, **kwargs)
    return decorated_function


def admin_required(f):
    """
    Decorator: allows access only if the logged-in user is an admin.
    Usage:
        @admin_required
        def admin_route(): ...
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "user_id" not in session:
            return jsonify({"error": "Please log in to access this page."}), 401
        if session.get("role") != "admin":
            return jsonify({"error": "Admin access required."}), 403
        return f(*args, **kwargs)
    return decorated_function
