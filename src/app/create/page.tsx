'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function CreateLessonPage() {
  const searchParams = useSearchParams();
  const lessonId = searchParams.get('id');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!lessonId) return;

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
        setImage(data.lesson.image || '');
      } catch (error) {
        console.error('Error loading lesson:', error);
      }
    };

    fetchLesson();
  }, [lessonId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      
      const previewUrl = URL.createObjectURL(file);
      setImage(previewUrl);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let imageUrl = image;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const method = lessonId ? 'PUT' : 'POST';
      const url = lessonId ? `/api/lessons/${lessonId}` : '/api/lessons';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, image: imageUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to save lesson');
      }

      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving lesson:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-12 px-6">
      <h2 className="text-2xl font-bold mb-6">
        {lessonId ? 'Edit Lesson' : 'Create Lesson'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 shadow rounded">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lesson Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter lesson title"
            className="w-full border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lesson Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {image && (
            <div className="mt-4">
              <img
                src={image}
                alt="Lesson preview"
                className="w-full max-w-md h-48 object-cover rounded-md border"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lesson Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter lesson content"
            className="w-full border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={8}
            required
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isUploading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Saving...' : lessonId ? 'Update Lesson' : 'Publish Lesson'}
          </button>
        </div>
      </form>
    </div>
  );
}