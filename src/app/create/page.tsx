'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function CreateLessonPage() {
  const searchParams = useSearchParams();
  const lessonId = searchParams.get('id');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const router = useRouter();

  useEffect(() => {
  if (!lessonId) return; // skip until we have the ID

  const fetchLesson = async () => {
    try {
      const res = await fetch(`/api/lessons/${lessonId}`);
      if (!res.ok) {
        console.error('Failed to fetch lesson');
        return;
      }
      const data = await res.json();
      setTitle(data.lesson.title);
      setContent(data.lesson.content);
    } catch (error) {
      console.error('Error loading lesson:', error);
    }
  };

  fetchLesson();
}, [lessonId]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const method = lessonId ? 'PUT' : 'POST';
    const url = lessonId ? `/api/lessons/${lessonId}` : '/api/lessons';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    });

    router.push('/dashboard');
  };

  return (
    <div className="max-w-3xl mx-auto mt-12 px-6">
      <h2 className="text-2xl font-bold mb-6">
        {lessonId ? 'Edit Lesson' : 'Create Lesson'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 shadow rounded">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Lesson Title"
          className="w-full border border-gray-300 px-4 py-2 rounded-md"
          required
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Lesson Content"
          className="w-full border border-gray-300 px-4 py-2 rounded-md"
          rows={6}
          required
        ></textarea>
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            {lessonId ? 'Update Lesson' : 'Publish Lesson'}
          </button>
        </div>
      </form>
    </div>
  );
}
