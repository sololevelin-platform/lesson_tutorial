"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";

export default function CreateLessonPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const courseSlug = params.slug as string;
  const lessonSlug = searchParams.get("lessonSlug");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [iframeUrl, setIframeUrl] = useState("");
  const [markdownFile, setMarkdownFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [contentInputMethod, setContentInputMethod] = useState<"text" | "file">(
    "text"
  );
  const [mediaType, setMediaType] = useState<"image" | "iframe">("image");

  useEffect(() => {
    if (!lessonSlug || !courseSlug) return;

    const fetchLesson = async () => {
      try {
        const res = await fetch(`/api/courses/${courseSlug}/lessons/${lessonSlug}`);
        if (!res.ok) {
          console.error("Failed to fetch lesson");
          return;
        }
        const data = await res.json();
        setTitle(data.lesson.title);
        setContent(data.lesson.content);
        setImage(data.lesson.image || "");
        setIframeUrl(data.lesson.iframeUrl || "");

        if (data.lesson.iframeUrl) {
          setMediaType("iframe");
        } else if (data.lesson.image) {
          setMediaType("image");
        }
      } catch (error) {
        console.error("Error loading lesson:", error);
      }
    };

    fetchLesson();
  }, [lessonSlug, courseSlug]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImage(previewUrl);
    }
  };

  const handleMarkdownFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setMarkdownFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileContent = event.target?.result as string;
        setContent(fileContent);
      };
      reader.readAsText(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    const data = await response.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let imageUrl = "";
      let finalIframeUrl = "";

      if (mediaType === "image") {
        if (imageFile) {
          imageUrl = await uploadImage(imageFile);
        } else if (image && !image.startsWith('blob:')) {
          imageUrl = image;
        }
      } else if (mediaType === "iframe") {
        finalIframeUrl = iframeUrl;
      }

      const method = lessonSlug ? "PUT" : "POST";
      const url = lessonSlug
        ? `/api/courses/${courseSlug}/lessons/${lessonSlug}`
        : `/api/courses/${courseSlug}/lessons`;

      const requestBody = {
        title,
        content,
        image: mediaType === "image" ? imageUrl : null,
        iframeUrl: mediaType === "iframe" ? finalIframeUrl : null,
      };

      console.log("Sending request:", { method, url, body: requestBody });

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Failed to save lesson: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log("API Response:", result);

      router.push(`/courses/${courseSlug}`);
    } catch (error) {
      console.error("Error saving lesson:", error);
      alert(`Error saving lesson: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-12 px-6">
      <h2 className="text-2xl font-bold mb-6">
        {lessonSlug ? "Edit Lesson" : "Create New Lesson"} for Course: {courseSlug}
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-6 shadow rounded"
      >
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
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Media Content
          </label>

          <div className="mb-4">
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="image"
                  checked={mediaType === "image"}
                  onChange={(e) =>
                    setMediaType(e.target.value as "image" | "iframe")
                  }
                  className="mr-2"
                />
                Upload Image
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="iframe"
                  checked={mediaType === "iframe"}
                  onChange={(e) =>
                    setMediaType(e.target.value as "image" | "iframe")
                  }
                  className="mr-2"
                />
                Embed Content (iframe)
              </label>
            </div>
          </div>

          {mediaType === "image" && (
            <>
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
            </>
          )}

          {mediaType === "iframe" && (
            <>
              <input
                type="url"
                value={iframeUrl}
                onChange={(e) => setIframeUrl(e.target.value)}
                placeholder="Enter URL (e.g., YouTube, Google Maps, CodePen, etc.)"
                className="w-full border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-2">
                Enter a URL to embed content like YouTube videos, Google Maps, interactive demos, etc.
              </p>
              {iframeUrl && isValidUrl(iframeUrl) && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                  <div className="border rounded-md overflow-hidden">
                    <iframe
                      src={iframeUrl}
                      className="w-full h-64"
                      frameBorder="0"
                      allowFullScreen
                      title="Embedded content preview"
                    />
                  </div>
                </div>
              )}
              {iframeUrl && !isValidUrl(iframeUrl) && (
                <p className="text-sm text-red-600 mt-2">
                  Please enter a valid URL
                </p>
              )}
            </>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Lesson Content (Markdown Supported)
            </label>
          </div>

          <div className="mb-4">
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="text"
                  checked={contentInputMethod === "text"}
                  onChange={(e) =>
                    setContentInputMethod(e.target.value as "text" | "file")
                  }
                  className="mr-2"
                />
                Type Content
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="file"
                  checked={contentInputMethod === "file"}
                  onChange={(e) =>
                    setContentInputMethod(e.target.value as "text" | "file")
                  }
                  className="mr-2"
                />
                Upload Markdown File
              </label>
            </div>
          </div>

          {contentInputMethod === "file" && (
            <div className="mb-4">
              <input
                type="file"
                accept=".md,.markdown,.txt"
                onChange={handleMarkdownFileChange}
                className="w-full border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {markdownFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Loaded: {markdownFile.name}
                </p>
              )}
            </div>
          )}

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            rows={12}
            required
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isUploading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading
              ? "Saving..."
              : lessonSlug
              ? "Update Lesson"
              : "Create Lesson"}
          </button>
        </div>
      </form>
    </div>
  );
}