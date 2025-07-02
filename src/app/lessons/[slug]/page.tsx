"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";

type Lesson = {
  id: string;
  title: string;
  slug: string;
  content: string;
  image?: string;
  createdAt: string;
};

export default function LessonViewPage() {
  const params = useParams();
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  console.log("Current params:", params);
  console.log("Slug value:", params.slug, "Type:", typeof params.slug);

  useEffect(() => {
    const fetchLesson = async () => {
      if (!params.slug || params.slug === 'null') {
        console.error("Invalid slug:", params.slug);
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching lesson with slug:", params.slug);
        const res = await fetch(`/api/lessons/${params.slug}`);
        if (res.ok) {
          const data = await res.json();
          setLesson(data.lesson);
        } else {
          console.error("Failed to fetch lesson:", res.status, res.statusText);
        }
      } catch (err) {
        console.error("Error loading lesson:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto mt-12 px-6">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-lg mb-8"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="max-w-4xl mx-auto mt-12 px-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Lesson not found</h1>
        <button
          onClick={() => router.push("/dashboard")}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 px-6 pb-12">
      <button
        onClick={() => router.push("/dashboard")}
        className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors cursor-pointer duration-200"
      >
        <svg 
          className="w-5 h-5 mr-2" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 19l-7-7 7-7" 
          />
        </svg>
        Back to Dashboard
      </button>

      {lesson.image && (
        <div className="mb-8 rounded-xl overflow-hidden shadow-lg">
          <img
            src={lesson.image}
            alt={lesson.title}
            className="w-full h-64 md:h-80 object-cover"
          />
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
          {lesson.title}
        </h1>
        <div className="flex items-center text-gray-600 text-sm">
          <svg 
            className="w-4 h-4 mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
          Published on {new Date(lesson.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>

      <article className="prose prose-lg prose-gray max-w-none">
        <ReactMarkdown 
          components={{
            
            h1: ({children}) => <h1 className="text-3xl font-bold text-gray-900 mt-8 mb-4">{children}</h1>,
            h2: ({children}) => <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-3">{children}</h2>,
            h3: ({children}) => <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">{children}</h3>,
            p: ({children}) => <p className="text-gray-700 leading-relaxed mb-4">{children}</p>,
            code: ({children}) => <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">{children}</code>,
            pre: ({children}) => <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto border">{children}</pre>,
            blockquote: ({children}) => <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-4">{children}</blockquote>,
            ul: ({children}) => <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>,
            ol: ({children}) => <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>,
            li: ({children}) => <li className="text-gray-700">{children}</li>,
          }}
        >
          {lesson.content}
        </ReactMarkdown>
      </article>
    </div>
  );
}