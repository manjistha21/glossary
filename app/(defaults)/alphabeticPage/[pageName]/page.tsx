"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import DOMPurify from "dompurify";

export default function AlphabeticPage() {
  const params = useParams();
  const pageName = params?.pageName ? decodeURIComponent(Array.isArray(params.pageName) ? params.pageName.join(" ") : params.pageName) : null;

  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!pageName) return;

    fetch(`/api/page?name=${encodeURIComponent(pageName)}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!data || !data.pageName || !data.content) {
          throw new Error("Invalid API response structure");
        }
        setPageData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Fetching error:", error);
        setError(error.message);
        setLoading(false);
      });
  }, [pageName]);

  if (loading) return <p className="text-lg text-center">Loading...</p>;
  if (error) return <p className="text-lg text-red-500 text-center">{error}</p>;
  if (!pageData) return <p className="text-lg text-center">No data available.</p>;

  return (
    <div className="container mx-auto p-6">
    
      <h2 className="text-2xl font-bold">{pageData.title}</h2>
      <p className="text-lg mt-4">{DOMPurify.sanitize(pageData.content, { ALLOWED_TAGS: [] })}</p>

      <a href="/alphabeticPage" className="text-blue-500 text-lg underline mt-4 block">
        ← Back 
      </a>
    </div>
  );
}
