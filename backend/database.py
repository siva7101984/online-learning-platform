"""
database.py
===========
Handles all SQLite database operations:
1. Connects to the SQLite database file (database/learning.db)
2. Creates all 8 tables with proper foreign-key relationships
3. Inserts sample/seed data for testing

WHY SQLite?
- SQLite is a lightweight, file-based database. No server needed.
- Perfect for learning projects and small applications.
- The entire database is one file: learning.db

WHY foreign keys?
- Foreign keys link tables together. For example, lessons.course_id
  references courses.id. This ensures every lesson belongs to a real course.
- SQLite requires PRAGMA foreign_keys = ON to enforce these.
"""

import sqlite3
import os
from werkzeug.security import generate_password_hash

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "database", "learning.db")


def get_db_connection():
    """Create and return a connection to the SQLite database."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # This lets us access columns by name: row['title']
    conn.execute("PRAGMA foreign_keys = ON")  # Enforce foreign-key constraints
    return conn


def init_db():
    """
    Create all tables if they don't already exist.
    Each CREATE TABLE uses IF NOT EXISTS so it's safe to run multiple times.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # --- USERS ---
    # Stores all registered users (both students and admins).
    # 'role' column is either 'student' or 'admin'.
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'student',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # --- COURSES ---
    # Each course is created by an admin/instructor.
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS courses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            category TEXT NOT NULL,
            instructor TEXT NOT NULL,
            image TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # --- LESSONS ---
    # Each course has multiple lessons. lesson_order controls display order.
    # course_id is a foreign key -> courses.id
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS lessons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            course_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            lesson_order INTEGER DEFAULT 0,
            FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
        )
    """)

    # --- ENROLLMENTS ---
    # Records which student is enrolled in which course.
    # The UNIQUE constraint prevents duplicate enrollments.
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS enrollments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            course_id INTEGER NOT NULL,
            enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
            UNIQUE(user_id, course_id)
        )
    """)

    # --- PROGRESS ---
    # Tracks which lessons a student has completed.
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            course_id INTEGER NOT NULL,
            lesson_id INTEGER NOT NULL,
            completed INTEGER DEFAULT 0,
            completed_at TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
            FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
            UNIQUE(user_id, lesson_id)
        )
    """)

    # --- QUIZZES ---
    # Each course can have one quiz.
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS quizzes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            course_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
        )
    """)

    # --- QUESTIONS ---
    # Each quiz has multiple questions with 4 options and one correct answer.
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            quiz_id INTEGER NOT NULL,
            question TEXT NOT NULL,
            option_a TEXT NOT NULL,
            option_b TEXT NOT NULL,
            option_c TEXT NOT NULL,
            option_d TEXT NOT NULL,
            correct_answer TEXT NOT NULL,
            FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
        )
    """)

    # --- QUIZ_RESULTS ---
    # Stores each quiz attempt's score.
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS quiz_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            quiz_id INTEGER NOT NULL,
            score INTEGER NOT NULL,
            total_questions INTEGER NOT NULL,
            attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
        )
    """)

    conn.commit()
    conn.close()
    print("Database initialized: all tables created.")


def seed_db():
    """
    Insert sample data so the app has content to show on first run.
    This creates:
    - 2 users (1 admin, 1 student)
    - 5 courses
    - 5-8 lessons per course
    - 2 quizzes with 5 questions each
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if data already exists
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] > 0:
        conn.close()
        print("Database already has data. Skipping seed.")
        return

    # --- Sample Users ---
    # Passwords are hashed using Werkzeug's generate_password_hash.
    # In production you would never hardcode passwords like this.
    admin_password = generate_password_hash("admin123")
    student_password = generate_password_hash("student123")

    cursor.execute(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        ("Admin User", "admin@learn.com", admin_password, "admin")
    )
    cursor.execute(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        ("Siva Kumar", "siva@learn.com", student_password, "student")
    )

    # --- Sample Courses ---
    courses = [
        ("Python Programming", "Learn Python from basics to advanced concepts including functions, loops, and data structures.", "Python", "Siva Kumar", "🐍"),
        ("Web Development with HTML, CSS, JavaScript", "Build modern websites from scratch using HTML5, CSS3, and JavaScript.", "Web Development", "Priya Sharma", "🌐"),
        ("Java Programming Fundamentals", "Master Java basics: OOP, collections, exception handling, and more.", "Java", "Rajesh Reddy", "☕"),
        ("Data Science Essentials", "Learn data analysis, visualization, and machine learning basics with Python.", "Data Science", "Anita Verma", "📊"),
        ("AI & Machine Learning", "Introduction to AI, ML algorithms, neural networks, and deep learning.", "AI/ML", "Dr. Kiran Rao", "🤖"),
    ]
    for course in courses:
        cursor.execute(
            "INSERT INTO courses (title, description, category, instructor, image) VALUES (?, ?, ?, ?, ?)",
            course
        )

    # --- Sample Lessons for Course 1: Python Programming ---
    python_lessons = [
        ("Introduction to Python", "Python is a high-level, interpreted programming language. It was created by Guido van Rossum in 1991. Python is known for its simple, readable syntax which makes it great for beginners.\n\nKey features:\n- Easy to read and write\n- Interpreted (no compilation needed)\n- Cross-platform\n- Large standard library\n\nExample:\nprint('Hello, World!')"),
        ("Variables and Data Types", "Variables store data values. In Python, you don't need to declare the type — Python figures it out automatically.\n\nCommon data types:\n- int: whole numbers (x = 10)\n- float: decimals (x = 3.14)\n- str: text (x = 'hello')\n- bool: True/False (x = True)\n\nExample:\nage = 20\nname = 'Siva'\nprint(name, 'is', age, 'years old')"),
        ("Conditions (if/elif/else)", "Conditional statements let your program make decisions.\n\nSyntax:\nif condition:\n    # do something\nelif another_condition:\n    # do something else\nelse:\n    # fallback\n\nExample:\nscore = 85\nif score >= 90:\n    print('Grade A')\nelif score >= 80:\n    print('Grade B')\nelse:\n    print('Grade C')"),
        ("Loops (for and while)", "Loops let you repeat code multiple times.\n\nFor loop — iterate over a sequence:\nfor i in range(5):\n    print(i)  # prints 0,1,2,3,4\n\nWhile loop — repeat until condition is false:\ncount = 0\nwhile count < 3:\n    print(count)\n    count += 1"),
        ("Functions", "Functions are reusable blocks of code. Use 'def' to define one.\n\ndef greet(name):\n    return 'Hello, ' + name\n\nprint(greet('Siva'))  # Hello, Siva\n\nFunctions help avoid repeating code and make programs easier to maintain."),
        ("Lists", "Lists store multiple items in a single variable.\n\nfruits = ['apple', 'banana', 'cherry']\nfruits.append('orange')\nprint(fruits[0])  # apple\nprint(len(fruits))  # 4\n\nLists are ordered, mutable (changeable), and allow duplicates."),
        ("Dictionaries", "Dictionaries store data as key-value pairs.\n\nstudent = {'name': 'Siva', 'age': 20, 'course': 'Python'}\nprint(student['name'])  # Siva\nstudent['age'] = 21\n\nDictionaries are useful when you need to look up values by a key."),
        ("Mini Project: Calculator", "Let's build a simple calculator using everything we learned.\n\ndef add(a, b): return a + b\ndef subtract(a, b): return a - b\n\ndef calculator():\n    print('1. Add  2. Subtract')\n    choice = input('Choose: ')\n    a = float(input('First number: '))\n    b = float(input('Second number: '))\n    if choice == '1':\n        print('Result:', add(a, b))\n\ncalculator()"),
    ]
    for i, (title, content) in enumerate(python_lessons, 1):
        cursor.execute(
            "INSERT INTO lessons (course_id, title, content, lesson_order) VALUES (?, ?, ?, ?)",
            (1, title, content, i)
        )

    # --- Sample Lessons for Course 2: Web Development ---
    web_lessons = [
        ("Introduction to HTML", "HTML (HyperText Markup Language) is the standard language for creating web pages.\n\nBasic structure:\n<html>\n  <head><title>My Page</title></head>\n  <body>\n    <h1>Hello World</h1>\n  </body>\n</html>\n\nHTML uses tags enclosed in angle brackets to structure content."),
        ("HTML Forms and Inputs", "Forms collect user input. Common input types: text, email, password, submit.\n\n<form>\n  <input type='text' name='username' />\n  <input type='email' name='email' />\n  <button type='submit'>Send</button>\n</form>"),
        ("CSS Basics", "CSS (Cascading Style Sheets) controls how HTML looks.\n\nSelector { property: value; }\n\nh1 { color: blue; font-size: 24px; }\n\ndiv { background: #f0f0f0; padding: 20px; }\n\nCSS can be inline, internal, or external."),
        ("CSS Flexbox Layout", "Flexbox makes it easy to align items in a row or column.\n\n.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  gap: 10px;\n}\n\nFlexbox is great for responsive layouts."),
        ("JavaScript Fundamentals", "JavaScript adds interactivity to web pages.\n\nVariables:\nlet name = 'Siva';\nconst pi = 3.14;\n\nFunctions:\nfunction greet(name) {\n  return 'Hello ' + name;\n}\n\nconsole.log(greet('Siva'));"),
        ("DOM Manipulation", "The DOM (Document Object Model) represents the HTML page as objects.\n\ndocument.getElementById('title').innerHTML = 'New Title';\ndocument.querySelector('.btn').addEventListener('click', () => {\n  alert('Button clicked!');\n});"),
        ("Fetch API", "The Fetch API lets JavaScript send HTTP requests.\n\nfetch('/api/courses')\n  .then(response => response.json())\n  .then(data => console.log(data));\n\nThis is how React communicates with the backend Flask server."),
    ]
    for i, (title, content) in enumerate(web_lessons, 1):
        cursor.execute(
            "INSERT INTO lessons (course_id, title, content, lesson_order) VALUES (?, ?, ?, ?)",
            (2, title, content, i)
        )

    # --- Sample Lessons for Course 3: Java ---
    java_lessons = [
        ("Introduction to Java", "Java is a class-based, object-oriented programming language. It follows 'Write Once, Run Anywhere' principle.\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, World!\");\n    }\n}"),
        ("Variables and Data Types", "Java is statically typed — you must declare the type.\n\nint age = 20;\ndouble price = 99.99;\nString name = \"Siva\";\nboolean isActive = true;"),
        ("Object-Oriented Programming", "OOP concepts: encapsulation, inheritance, polymorphism, abstraction.\n\nclass Student {\n    String name;\n    int age;\n    Student(String n, int a) { name = n; age = a; }\n}"),
        ("Collections Framework", "Java provides built-in data structures:\n- ArrayList: dynamic arrays\n- HashMap: key-value pairs\n- HashSet: unique elements\n\nList<String> names = new ArrayList<>();\nnames.add(\"Siva\");"),
        ("Exception Handling", "Handle errors gracefully with try-catch.\n\ntry {\n    int result = 10 / 0;\n} catch (ArithmeticException e) {\n    System.out.println(\"Cannot divide by zero\");\n}"),
    ]
    for i, (title, content) in enumerate(java_lessons, 1):
        cursor.execute(
            "INSERT INTO lessons (course_id, title, content, lesson_order) VALUES (?, ?, ?, ?)",
            (3, title, content, i)
        )

    # --- Sample Lessons for Course 4: Data Science ---
    ds_lessons = [
        ("Introduction to Data Science", "Data Science combines statistics, programming, and domain knowledge to extract insights from data.\n\nKey tools: Python, Pandas, NumPy, Matplotlib, Scikit-learn."),
        ("Pandas Basics", "Pandas is a Python library for data analysis.\n\nimport pandas as pd\ndf = pd.read_csv('data.csv')\nprint(df.head())\nprint(df.describe())"),
        ("Data Visualization", "Visualize data using Matplotlib and Seaborn.\n\nimport matplotlib.pyplot as plt\nplt.bar(['A','B','C'], [10, 20, 15])\nplt.show()"),
        ("Statistics for Data Science", "Key concepts: mean, median, mode, standard deviation, correlation.\n\nimport numpy as np\ndata = [10, 20, 30, 40, 50]\nprint(np.mean(data))  # 30.0\nprint(np.std(data))   # 14.14"),
        ("Machine Learning Basics", "ML teaches computers to learn from data.\n\nTypes:\n- Supervised: labeled data (classification, regression)\n- Unsupervised: unlabeled data (clustering)\n- Reinforcement: reward-based\n\nfrom sklearn.linear_model import LinearRegression"),
        ("Model Evaluation", "Evaluate ML models using metrics:\n- Accuracy\n- Precision & Recall\n- F1-Score\n- Confusion Matrix\n\nfrom sklearn.metrics import accuracy_score"),
    ]
    for i, (title, content) in enumerate(ds_lessons, 1):
        cursor.execute(
            "INSERT INTO lessons (course_id, title, content, lesson_order) VALUES (?, ?, ?, ?)",
            (4, title, content, i)
        )

    # --- Sample Lessons for Course 5: AI/ML ---
    ai_lessons = [
        ("Introduction to AI", "Artificial Intelligence is the simulation of human intelligence by machines.\n\nSubfields: Machine Learning, Deep Learning, NLP, Computer Vision, Robotics."),
        ("Neural Networks", "Neural networks are inspired by the human brain.\n\nLayers: Input -> Hidden -> Output\nEach neuron applies weights and an activation function.\n\nfrom tensorflow import keras"),
        ("Deep Learning", "Deep learning uses multi-layer neural networks.\n\nFrameworks: TensorFlow, PyTorch, Keras.\n\nApplications: image recognition, NLP, speech, autonomous driving."),
        ("Natural Language Processing", "NLP deals with text and language.\n\nTasks: sentiment analysis, text classification, translation, chatbots.\n\nfrom transformers import pipeline\nclassifier = pipeline('sentiment-analysis')"),
        ("AI Ethics and Future", "Key ethical concerns in AI:\n- Bias and fairness\n- Privacy\n- Job displacement\n- Autonomous weapons\n- Deepfakes\n\nResponsible AI development is crucial."),
    ]
    for i, (title, content) in enumerate(ai_lessons, 1):
        cursor.execute(
            "INSERT INTO lessons (course_id, title, content, lesson_order) VALUES (?, ?, ?, ?)",
            (5, title, content, i)
        )

    # --- Sample Quiz for Course 1: Python Programming ---
    cursor.execute("INSERT INTO quizzes (course_id, title) VALUES (?, ?)", (1, "Python Basics Quiz"))
    python_quiz_questions = [
        ("Which keyword is used to define a function in Python?", "function", "def", "fun", "define", "def"),
        ("What is the output of: print(type(3.14))?", "<class 'int'>", "<class 'float'>", "<class 'str'>", "<class 'double'>", "<class 'float'>"),
        ("Which data structure stores key-value pairs?", "list", "tuple", "dictionary", "set", "dictionary"),
        ("What does len([1, 2, 3]) return?", "2", "3", "4", "Error", "3"),
        ("Which loop iterates over a sequence in Python?", "for", "foreach", "iterate", "loop", "for"),
    ]
    for q in python_quiz_questions:
        cursor.execute(
            "INSERT INTO questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (1, *q)
        )

    # --- Sample Quiz for Course 2: Web Development ---
    cursor.execute("INSERT INTO quizzes (course_id, title) VALUES (?, ?)", (2, "Web Development Quiz"))
    web_quiz_questions = [
        ("What does HTML stand for?", "Hyper Text Markup Language", "High Text Machine Language", "Hyper Tabular Markup Language", "Home Tool Markup Language", "Hyper Text Markup Language"),
        ("Which CSS property controls text size?", "text-size", "font-size", "size", "text-style", "font-size"),
        ("How do you select an element with id 'btn' in CSS?", ".btn", "#btn", "*btn", "btn", "#btn"),
        ("Which method sends a GET request in JavaScript Fetch API?", "fetch.get()", "fetch('/url')", "getRequest()", "fetchGet()", "fetch('/url')"),
        ("What is the DOM?", "A database", "Document Object Model", "Data Object Model", "Document Oriented Markup", "Document Object Model"),
    ]
    for q in web_quiz_questions:
        cursor.execute(
            "INSERT INTO questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (2, *q)
        )

    conn.commit()
    conn.close()
    print("Sample data inserted: 2 users, 5 courses, 30 lessons, 2 quizzes, 10 questions.")


if __name__ == "__main__":
    init_db()
    seed_db()
