"""
app.py
======
Main entry point of the Flask application.

WHAT THIS FILE DOES:
1. Creates the Flask app
2. Enables CORS (Cross-Origin Resource Sharing) so React (port 5174) can call Flask (port 5000)
3. Sets a SECRET_KEY for session security
4. Registers all route blueprints
5. Initializes the database with sample data
6. Starts the server

HOW TO RUN:
    python app.py
    Server starts at http://localhost:5000
"""

import os
from flask import Flask, jsonify
from flask_cors import CORS

# Import database functions
from database import init_db, seed_db

# Import route blueprints
from routes.auth_routes import auth_bp
from routes.course_routes import course_bp
from routes.lesson_routes import lesson_bp
from routes.enrollment_routes import enrollment_bp
from routes.progress_routes import progress_bp
from routes.quiz_routes import quiz_bp
from routes.dashboard_routes import dashboard_bp

app = Flask(__name__)

# SECRET_KEY is used to sign session cookies so they can't be tampered with.
app.config["SECRET_KEY"] = "learning-platform-secret-key-2024"

# CORS allows the React frontend (running on a different port) to make requests to Flask.
CORS(app, supports_credentials=True)

# Register all blueprints — each one adds a group of API endpoints.
app.register_blueprint(auth_bp)
app.register_blueprint(course_bp)
app.register_blueprint(lesson_bp)
app.register_blueprint(enrollment_bp)
app.register_blueprint(progress_bp)
app.register_blueprint(quiz_bp)
app.register_blueprint(dashboard_bp)


@app.route("/")
def index():
    """Simple health-check endpoint."""
    return jsonify({"message": "Online Learning Platform API is running."})


if __name__ == "__main__":
    # Initialize database and seed sample data before starting the server.
    init_db()
    seed_db()
    print("Starting Flask server on http://localhost:5000")
    app.run(debug=True, port=5000)
