"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Lesson = {
  id: string;
  title: string;
  slug: string;
  content: string; 
  image?: string; 
  iframeUrl?: string; 
  createdAt: string;
};

type Course = {
  id: string;
  title: string;
  slug: string;
  description: string;
  image?: string;
  createdAt: string;
  lessons: Lesson[];
};

const extractHeadings = (markdownContent: string): { level: 2 | 3; text: string }[] => {
  const headings: { level: 2 | 3; text: string }[] = [];
  const headingRegex = /^(##|###)\s+(.*)$/gm;
  let match;
  while ((match = headingRegex.exec(markdownContent)) !== null) {
    const markdownPrefix = match[1];
    const headingText = match[2].trim();

    if (markdownPrefix === '##') {
      headings.push({ level: 2, text: headingText });
    } else if (markdownPrefix === '###') {
      headings.push({ level: 3, text: headingText });
    }
  }
  return headings;
};

const extractTextSnippet = (markdownContent: string, maxLength: number = 150): string => {
 
  let cleanedContent = markdownContent.replace(/^(#+\s+.*)$/gm, '');
 
  cleanedContent = cleanedContent.replace(/(\*\*|__)(.*?)\1/g, '$2'); 
  cleanedContent = cleanedContent.replace(/(\*|_)(.*?)\1/g, '$2');    
  cleanedContent = cleanedContent.replace(/\[(.*?)\]\(.*?\)/g, '$1'); 
  cleanedContent = cleanedContent.replace(/!\[(.*?)\]\(.*?\)/g, '$1'); 
  cleanedContent = cleanedContent.replace(/^>\s+.*$/gm, '');       
  cleanedContent = cleanedContent.replace(/```[\s\S]*?```/g, '');   
  cleanedContent = cleanedContent.replace(/`([^`]+)`/g, '$1');    

  const firstParagraph = cleanedContent.split('\n').find(line => line.trim() !== '') || '';

  if (firstParagraph.length > maxLength) {
    return firstParagraph.substring(0, maxLength).trim() + '...';
  }
  return firstParagraph.trim();
};


export default function CourseViewPage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  const courseSlug = params.slug as string;

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseSlug || courseSlug === 'null') {
        console.error("Invalid course slug:", courseSlug);
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching course with slug:", courseSlug);
        const res = await fetch(`/api/courses/${courseSlug}`);
        if (res.ok) {
          const data = await res.json();
          setCourse(data.course);
        } else {
          console.error("Failed to fetch course:", res.status, res.statusText);
        }
      } catch (err) {
        console.error("Error loading course:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseSlug]);

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

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto mt-12 px-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Course not found</h1>
        <button
          onClick={() => router.push("/courses/dashboard")}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 px-6 pb-12">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => router.push("/courses/dashboard")}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors cursor-pointer duration-200"
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
          Back to Courses
        </button>
      </div>

      {course.image && (
        <div className="mb-8 rounded-xl overflow-hidden shadow-lg">
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-64 md:h-80 object-cover"
          />
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
          {course.title}
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
          Published on {new Date(course.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
        <p className="text-gray-700 text-lg mt-4">{course.description}</p>
      </div>

      <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6 border-b pb-2">
        Lessons in this Course ({course.lessons.length})
      </h2>

      {course.lessons.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No lessons added to this course yet.
        </div>
      ) : (
        <ul className="space-y-6">
          {course.lessons.map((lesson) => {
            const extractedHeadings = extractHeadings(lesson.content);
            const lessonDescriptionSnippet = extractTextSnippet(lesson.content, 150);

            return (
              <li
                key={lesson.id}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
              >
                <div
                  className="cursor-pointer"
                  onClick={() => router.push(`/courses/${courseSlug}/lessons/${lesson.slug}`)}
                >
                  <div className="flex items-center mb-3">
                    <h3 className="text-2xl font-bold text-gray-900 mr-2 hover:text-blue-600 transition-colors">
                      {lesson.title}
                    </h3>
                    {lesson.image && (
                      <span title="Contains Image" className="ml-1 text-gray-500">
                        <svg className="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L20 18m-4-10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                      </span>
                    )}
                    {lesson.iframeUrl && (
                      <span title="Contains Video" className="ml-1 text-gray-500">
                        <svg className="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18H3a2 2 0 01-2-2V8a2 2 0 012-2h3.672a2 2 0 011.414.586l7.414 7.414L18 9m0 0h3.672a2 2 0 011.414.586l7.414 7.414L18 9z" /></svg>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-gray-500 text-sm mb-4">
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

                  {lessonDescriptionSnippet && (
                    <p className="text-gray-700 text-base mb-4 line-clamp-3">
                      {lessonDescriptionSnippet}
                    </p>
                  )}

                  {extractedHeadings.length > 0 && (
                    <div className="mb-4">
                      <p className="text-gray-700 font-semibold mb-2">Key topics:</p>
                      <ul className="list-disc list-inside text-gray-600 space-y-1">
                        {extractedHeadings.map((heading, index) => (
                          <li
                            key={index}
                            className={`${heading.level === 3 ? "ml-4 text-gray-500 list-circle" : ""}`}
                          >
                            {heading.text}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}