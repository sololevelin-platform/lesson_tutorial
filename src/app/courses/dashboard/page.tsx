"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Course = {
  id: string;
  title: string;
  slug: string;
  description: string;
  image?: string;
  createdAt: string;
  lessonCount?: number;
};

export default function CoursesDashboardPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState<string | null>(null); 
  const router = useRouter();

  const fetchCourses = async () => {
    setLoading(true); 
    setError(null); 
    try {
      const res = await fetch("/api/courses");

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to fetch courses: ${res.status}`);
      }

      const data = await res.json();

      if (Array.isArray(data.courses)) {
        setCourses(data.courses);
      } else {
        throw new Error("API returned unexpected data format for courses.");
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred while fetching courses.");
      setCourses([]); 
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getPlainTextPreview = (text: string, maxLength: number = 120) => {
    let plainText = text;
    plainText = plainText.replace(/#{1,6}\s+/g, '');
    plainText = plainText.replace(/\*\*(.*?)\*\*/g, '$1');
    plainText = plainText.replace(/\*(.*?)\*/g, '$1');
    plainText = plainText.replace(/`([^`]+)`/g, '$1');
    plainText = plainText.replace(/```[\s\S]*?```/g, '[Code Block]');
    plainText = plainText.replace(/^\- /gm, '• ');
    plainText = plainText.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    plainText = plainText.replace(/\n+/g, ' ');
    plainText = plainText.trim();

    return plainText.length > maxLength ? plainText.slice(0, maxLength) + "..." : plainText;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto mt-12 px-6 space-y-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900">Loading Courses...</h2>
        <p className="text-gray-600">Please wait while fetching the courses.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto mt-12 px-6 space-y-8 text-center text-red-600">
        <h2 className="text-3xl font-bold">Error Loading Courses</h2>
        <p>{error}</p>
        <button
          onClick={fetchCourses}
          className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200 shadow-md"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-12 px-6 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">All Courses</h2>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">No courses found</div>
          <button
            onClick={() => router.push("/courses/create")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Create Your First Course
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group"
              onClick={() => router.push(`/courses/${course.slug}`)}
            >
              <div className="h-48 bg-gray-200 overflow-hidden relative">
                {course.image ? (
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-200 flex items-center justify-center">
                    <div className="text-gray-500">
                      <p className="text-sm">No Course Image</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="mb-3">
                  <h4 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {course.title}
                  </h4>
                  <p className="text-gray-600 text-sm mb-3">
                    {formatDate(course.createdAt)}
                  </p>
                </div>

                <div className="text-gray-700 mb-6 line-clamp-3">
                  {getPlainTextPreview(course.description)}
                </div>

                <div className="text-sm text-gray-500 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm6 4a1 1 0 10-2 0v2a1 1 0 102 0V9zm-2-1a1 1 0 00-1 1v2a1 1 0 102 0V9a1 1 0 00-1-1zm6 1a1 1 0 10-2 0v2a1 1 0 102 0V9z" clipRule="evenodd" />
                  </svg>
                  {course.lessonCount === 0
                    ? "No lessons yet"
                    : `${course.lessonCount} lesson${course.lessonCount! > 1 ? "s" : ""}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}