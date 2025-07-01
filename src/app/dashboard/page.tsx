'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Lesson = {
  id: string;
  title: string;
  content: string;
  image?: string;
  createdAt: string;
};

export default function DashboardPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const router = useRouter();

  const fetchLessons = async () => {
    const res = await fetch('/api/lessons');
    const data = await res.json();
    setLessons(data.lessons);
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this lesson?')) {
      await fetch(`/api/lessons/${id}`, { method: 'DELETE' });
      fetchLessons();
    }
  };

  const handleEdit = (lesson: Lesson) => {
    router.push(`/create?id=${lesson.id}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-6xl mx-auto mt-12 px-6 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">All Lessons</h2>
        <button
          onClick={() => router.push('/create')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
        >
          + New Lesson
        </button>
      </div>

      {lessons.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">No lessons found</div>
          <button
            onClick={() => router.push('/create')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Create Your First Lesson
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
            >
              {/* Image Section */}
              <div className="h-48 bg-gray-200 overflow-hidden">
                {lesson.image ? (
                  <img
                    src={lesson.image}
                    alt={lesson.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
                    <div className="text-gray-500">
                      <svg
                        className="w-16 h-16 mx-auto mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                      <p className="text-sm">No Image</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="p-6">
                <div className="mb-3">
                  <h4 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {lesson.title}
                  </h4>
                  <p className="text-gray-600 text-sm mb-3">
                    {formatDate(lesson.createdAt)}
                  </p>
                </div>

                <p className="text-gray-700 mb-6 line-clamp-3">
                  {lesson.content.length > 120
                    ? lesson.content.slice(0, 120) + '...'
                    : lesson.content}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    className="flex-1 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors duration-200 font-medium"
                    onClick={() => handleEdit(lesson)}
                  >
                    Edit
                  </button>
                  <button
                    className="flex-1 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors duration-200 font-medium"
                    onClick={() => handleDelete(lesson.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}