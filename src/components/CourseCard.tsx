import { Link } from "react-router-dom";
import { BookOpen, User, Tag } from "lucide-react";
import ProgressBar from "./ProgressBar";

interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  instructor: string;
  image?: string;
  lesson_count?: number;
  total_lessons?: number;
  completed_lessons?: number;
  enrolled_at?: string;
}

export default function CourseCard({ course }: { course: Course }) {
  const totalLessons = course.total_lessons ?? course.lesson_count ?? 0;
  const completed = course.completed_lessons ?? 0;
  const showProgress = course.completed_lessons !== undefined;
  const percentage = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
      {/* Course icon/emoji */}
      <div className="h-32 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-5xl group-hover:scale-105 transition-transform duration-300">
        {course.image || "📚"}
      </div>

      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 flex items-center gap-1">
            <Tag className="w-3 h-3" /> {course.category}
          </span>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">{course.title}</h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{course.description}</p>

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <span className="flex items-center gap-1">
            <User className="w-4 h-4" /> {course.instructor}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" /> {totalLessons} lessons
          </span>
        </div>

        {showProgress && (
          <div className="mb-4">
            <ProgressBar percentage={percentage} />
          </div>
        )}

        <Link
          to={`/courses/${course.id}`}
          className="block w-full text-center px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          {showProgress ? "Continue Learning" : "View Course"}
        </Link>
      </div>
    </div>
  );
}
