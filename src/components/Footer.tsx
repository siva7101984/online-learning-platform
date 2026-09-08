import { GraduationCap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-lg font-bold text-white">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            LearnHub
          </div>
          <p className="text-sm text-gray-400">
            Online Learning & Course Management Platform
          </p>
          <p className="text-sm text-gray-500">
            Built with React, Flask & SQLite
          </p>
        </div>
      </div>
    </footer>
  );
}
