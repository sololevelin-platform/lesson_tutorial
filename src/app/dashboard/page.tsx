'use client';

import { useEffect, useState } from 'react';

type Lesson = {
  id: string;
  title: string;
  content: string;
};

export default function DashboardPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  const fetchLessons = async () => {
    const res = await fetch('/api/lessons');
    const data = await res.json();
    setLessons(data.lessons);
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const method = editingLesson ? 'PUT' : 'POST';
    const url = editingLesson ? `/api/lessons/${editingLesson.id}` : '/api/lessons';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    });

    setTitle('');
    setContent('');
    setEditingLesson(null);
    fetchLessons();
  };

  const handleEdit = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setTitle(lesson.title);
    setContent(lesson.content);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/lessons/${id}`, { method: 'DELETE' });
    fetchLessons();
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 border rounded-lg shadow space-y-6">
      <h2 className="text-xl font-bold">
        {editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Lesson Title"
          className="w-full border px-3 py-2"
          required
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Lesson Content"
          className="w-full border px-3 py-2"
          rows={4}
          required
        ></textarea>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {editingLesson ? 'Update Lesson' : 'Add Lesson'}
        </button>
      </form>

      <div>
        <h3 className="text-lg font-semibold mb-2">Your Lessons</h3>
        <ul className="space-y-2">
          {lessons.map((lesson) => (
            <li key={lesson.id} className="border p-4 rounded-md flex justify-between items-start gap-4">
              <div>
                <h4 className="font-bold">{lesson.title}</h4>
                <p>{lesson.content}</p>
              </div>
              <div className="flex gap-2">
                <button
                  className="text-sm text-blue-600 underline"
                  onClick={() => handleEdit(lesson)}
                >
                  Edit
                </button>
                <button
                  className="text-sm text-red-600 underline"
                  onClick={() => handleDelete(lesson.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
