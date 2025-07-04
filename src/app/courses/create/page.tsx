"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function CreateCoursePage() {
  const searchParams = useSearchParams();
  const courseSlug = searchParams.get("slug");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!courseSlug) return;

    const fetchCourse = async () => {
      try {
        const res = await fetch(`/api/courses/${courseSlug}`);
        if (!res.ok) {
          console.error("Failed to fetch course");
          return;
        }
        const data = await res.json();
        setTitle(data.course.title);
        setDescription(data.course.description);
        setImage(data.course.image || "");
      } catch (error) {
        console.error("Error loading course:", error);
      }
    };

    fetchCourse();
  }, [courseSlug]);

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
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      } else if (image && !image.startsWith('blob:')) {
        imageUrl = image;
      }

      const method = courseSlug ? "PUT" : "POST";
      const url = courseSlug ? `/api/courses/${courseSlug}` : "/api/courses";

      
      const dummyUserId = "4c56bbf9-32be-4d0d-a6f0-42e576c7791e";

      const requestBody = {
        title,
        description,
        image: imageUrl || null,
        userId: dummyUserId, 
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
        throw new Error(`Failed to save course: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log("API Response:", result);

      if (courseSlug) {
        const newSlug = result.slug || courseSlug;
        if (newSlug !== courseSlug) {
          router.push(`/courses/${newSlug}`);
        } else {
          router.push("/courses/dashboard");
        }
      } else {
        const newSlug = result.slug;
        if (newSlug) {
          router.push(`/courses/${newSlug}`);
        } else {
          router.push("/courses/dashboard");
        }
      }
    } catch (error) {
      console.error("Error saving course:", error);
      alert(`Error saving course: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-12 px-6">
      <h2 className="text-2xl font-bold mb-6">
        {courseSlug ? "Edit Course" : "Create New Course"}
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-6 shadow rounded"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter course title"
            className="w-full border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide a brief description of the course content"
            className="w-full border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            rows={6}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course Image
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
                alt="Course preview"
                className="w-full max-w-md h-48 object-cover rounded-md border"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isUploading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading
              ? "Saving..."
              : courseSlug
              ? "Update Course"
              : "Create Course"}
          </button>
        </div>
      </form>
    </div>
  );
}