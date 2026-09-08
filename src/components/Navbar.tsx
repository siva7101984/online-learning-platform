import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { GraduationCap, Home, BookOpen, LayoutDashboard, LogOut, LogIn, UserPlus } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  const linkClass = (path: string) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive(path)
        ? "bg-blue-50 text-blue-700"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            LearnHub
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/" className={linkClass("/")}>
              <Home className="w-4 h-4" /> Home
            </Link>
            <Link to="/courses" className={linkClass("/courses")}>
              <BookOpen className="w-4 h-4" /> Courses
            </Link>
            {user && (
              <Link
                to={user.role === "admin" ? "/admin/dashboard" : "/dashboard"}
                className={linkClass(user.role === "admin" ? "/admin/dashboard" : "/dashboard")}
              >
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
            )}
            {user && user.role === "student" && (
              <Link to="/my-courses" className={linkClass("/my-courses")}>
                <BookOpen className="w-4 h-4" /> My Courses
              </Link>
            )}
            {user ? (
              <div className="flex items-center gap-3 ml-2 pl-3 border-l border-gray-200">
                <span className="text-sm text-gray-600">Hi, {user.name}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-2 pl-3 border-l border-gray-200">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <LogIn className="w-4 h-4" /> Login
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  <UserPlus className="w-4 h-4" /> Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-1">
            <Link to="/" className={linkClass("/")} onClick={() => setMobileOpen(false)}>
              <Home className="w-4 h-4" /> Home
            </Link>
            <Link to="/courses" className={linkClass("/courses")} onClick={() => setMobileOpen(false)}>
              <BookOpen className="w-4 h-4" /> Courses
            </Link>
            {user && (
              <Link
                to={user.role === "admin" ? "/admin/dashboard" : "/dashboard"}
                className={linkClass(user.role === "admin" ? "/admin/dashboard" : "/dashboard")}
                onClick={() => setMobileOpen(false)}
              >
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
            )}
            {user && user.role === "student" && (
              <Link to="/my-courses" className={linkClass("/my-courses")} onClick={() => setMobileOpen(false)}>
                <BookOpen className="w-4 h-4" /> My Courses
              </Link>
            )}
            {user ? (
              <button
                onClick={() => { handleLogout(); setMobileOpen(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" /> Logout ({user.name})
              </button>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link to="/login" className="flex-1 text-center px-4 py-2 rounded-lg text-sm font-medium text-blue-600 border border-blue-200" onClick={() => setMobileOpen(false)}>
                  Login
                </Link>
                <Link to="/register" className="flex-1 text-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600" onClick={() => setMobileOpen(false)}>
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
