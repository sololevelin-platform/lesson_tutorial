"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Lesson = {
  id: string;
  title: string;
  slug: string;
  content: string;
  image?: string;
  iframeUrl?: string;
  createdAt: string;
};

export default function DashboardPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const router = useRouter();

  const fetchLessons = async () => {
    const res = await fetch("/api/lessons");
    const data = await res.json();
    setLessons(data.lessons);
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const markdownToHtml = (markdown: string) => {
    let html = markdown;
    
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold">$1</h1>');   
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');   
    html = html.replace(/```[\s\S]*?```/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono">Code Block</code>');
    html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 rounded text-sm font-mono">$1</code>');
    html = html.replace(/^\- (.*$)/gim, '<li class="ml-4">• $1</li>');
    html = html.replace(/\n/g, '<br>');
    
    return html;
  };

  const getPlainTextPreview = (markdown: string, maxLength: number = 120) => {
    let text = markdown;
    
    text = text.replace(/#{1,6}\s+/g, ''); 
    text = text.replace(/\*\*(.*?)\*\*/g, '$1');
    text = text.replace(/\*(.*?)\*/g, '$1'); 
    text = text.replace(/`([^`]+)`/g, '$1'); 
    text = text.replace(/```[\s\S]*?```/g, '[Code Block]'); 
    text = text.replace(/^\- /gm, '• '); 
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); 
    text = text.replace(/\n+/g, ' '); 
    text = text.trim();
    
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  const getDomainFromUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return 'External Content';
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-12 px-6 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">All Lessons</h2>
      </div>

      {lessons.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">No lessons found</div>
          <button
            onClick={() => router.push("/create")}
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
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group"
              onClick={() => router.push(`/lessons/${lesson.slug}`)}
            >
              {/* Media Section - Image or Iframe */}
              <div className="h-48 bg-gray-200 overflow-hidden relative">
                {lesson.iframeUrl ? (
                  <>
                    <iframe
                      src={lesson.iframeUrl}
                      className="w-full h-full border-0 pointer-events-none"
                      title={lesson.title}
                    />
                    {/* Overlay to prevent iframe interaction and show it's embedded content */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-end justify-end p-3">
                      <div className="bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                        📺 {getDomainFromUrl(lesson.iframeUrl)}
                      </div>
                    </div>
                  </>
                ) : lesson.image ? (
                  <img
                    src={lesson.image}
                    alt={lesson.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
                    <div className="text-gray-500">
                      <p className="text-sm">No Media</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="mb-3">
                  <h4 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {lesson.title}
                  </h4>
                  <p className="text-gray-600 text-sm mb-3">
                    {formatDate(lesson.createdAt)}
                  </p>
                </div>

                <div className="text-gray-700 mb-6 line-clamp-3">
                  {getPlainTextPreview(lesson.content)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}