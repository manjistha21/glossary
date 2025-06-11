"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AlphabeticalPages() {
  const [pages, setPages] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPages, setCurrentPages] = useState({});
  const itemsPerPage = 5;
  const router = useRouter();

  useEffect(() => {
    fetch("/api/page")
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data.pages)) {
          console.error("Invalid API response: Expected an array under 'pages'");
          return;
        }
        const groupedPages = data.pages.reduce((acc, page) => {
          const firstLetter = page.pageName[0].toUpperCase();
          if (!acc[firstLetter]) acc[firstLetter] = [];
          acc[firstLetter].push(page);
          return acc;
        }, {});
        setPages(groupedPages);
        setCurrentPages(Object.keys(groupedPages).reduce((acc, letter) => {
          acc[letter] = 0;
          return acc;
        }, {}));
        setLoading(false);
      })
      .catch((error) => console.error("Fetching error:", error));
  }, []);

  if (loading) return <p className="text-lg">Loading...</p>;

  const handleNextPage = (letter) => {
    setCurrentPages((prev) => ({
      ...prev,
      [letter]: prev[letter] + 1,
    }));
  };

  const handlePrevPage = (letter) => {
    setCurrentPages((prev) => ({
      ...prev,
      [letter]: prev[letter] > 0 ? prev[letter] - 1 : 0,
    }));
  };

  return (
    <div className="container mx-auto p-6 text-lg">
      <nav className="flex justify-center space-x-4 mb-8 text-xl font-semibold">
        {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
          <a
            key={letter}
            href={`#${letter}`}
            className={`text-blue-500 ${pages[letter] ? "" : "opacity-50"}`}
          >
            {letter}
          </a>
        ))}
      </nav>
      <div>
        {Object.keys(pages).sort().map((letter) => {
          const startIdx = currentPages[letter] * itemsPerPage;
          const paginatedPages = pages[letter].slice(startIdx, startIdx + itemsPerPage);
          const showPagination = pages[letter].length > itemsPerPage;
          return (
            <div key={letter} id={letter} className="mb-6">
              <h2 className="text-2xl font-bold">{letter}</h2>
              <ul className="ml-4 list-disc">
                {paginatedPages.map((page, index) => (
                  <li key={index}>
                    <button
                      onClick={() => router.push(`/alphabeticPage/${encodeURIComponent(page.pageName)}`)}
                      className="text-blue-500 text-xl underline"
                    >
                      {page.pageName}
                    </button>
                  </li>
                ))}
              </ul>
              {showPagination && (
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={() => handlePrevPage(letter)}
                  disabled={currentPages[letter] === 0}
                  className="px-2 py-1 bg-gray-300 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => handleNextPage(letter)}
                  disabled={startIdx + itemsPerPage >= pages[letter].length}
                  className="px-2 py-1 bg-gray-300 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              )}
            </div>
          );
        })}
      </div>
      <a href="#top" className="text-blue-500 fixed bottom-4 right-4 text-xl">↑ Back to Top</a>
    </div>
  );
}
