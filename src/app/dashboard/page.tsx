'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Lesson = {
  id: string;
  title: string;
  content: string;
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
    await fetch(`/api/lessons/${id}`, { method: 'DELETE' });
    fetchLessons();
  };

  const handleEdit = (lesson: Lesson) => {
    router.push(`/create?id=${lesson.id}`);
  };

  return (
    <div className="max-w-6xl mx-auto mt-12 px-6 space-y-16">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">All Lessons</h2>
        <button
          onClick={() => router.push('/create')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + New Lesson
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
          >
            <h4 className="text-lg font-bold text-gray-800 mb-2">
              {lesson.title}
            </h4>
            <p className="text-gray-700 mb-4">
              {lesson.content.length > 160
                ? lesson.content.slice(0, 160) + '...'
                : lesson.content}
            </p>
            <div className="flex gap-4 text-sm">
              <button
                className="text-blue-600 hover:underline"
                onClick={() => handleEdit(lesson)}
              >
                Edit
              </button>
              <button
                className="text-red-600 hover:underline"
                onClick={() => handleDelete(lesson.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
