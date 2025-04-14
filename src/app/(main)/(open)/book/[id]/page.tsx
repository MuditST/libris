"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { getBookDetails } from "@/actions/publicActions";
import BookModal from "@/components/BookModal";
import { BookItem } from "@/lib/types";
import LoadingIndicator from "@/components/LoadingIndicator";

export default function BookPage() {
  const params = useParams();
  // Convert params to string safely
  const bookId =
    params && params.id
      ? typeof params.id === "string"
        ? params.id
        : Array.isArray(params.id)
        ? params.id[0]
        : null
      : null;

  const [book, setBook] = useState<BookItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const isDirectNavigation = useRef(true);

  // Check if this is a direct navigation
  useEffect(() => {
    // If there's a referrer from the same site, this isn't direct navigation
    const referrer = document.referrer;
    if (referrer && referrer.includes(window.location.host)) {
      isDirectNavigation.current = false;
    }
  }, []);

  // Fetch book details
  useEffect(() => {
    const fetchBook = async () => {
      if (!bookId) {
        setError("No book ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const bookData = await getBookDetails(bookId);
        setBook(bookData);
        setError(null);
      } catch (err) {
        console.error("Error fetching book:", err);
        setError("Failed to load book details");
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [bookId]);

  const handleCloseModal = () => {
    // If this was direct navigation or we're at the root of history stack
    if (isDirectNavigation.current || window.history.length <= 1) {
      router.push("/discover");
    } else {
      router.back();
    }
  };

  // Add key handler at the page level as a backup
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCloseModal();
      }
    };

    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="text-center font-mono text-xl">
          <LoadingIndicator text="Loading book" />
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <h1 className="text-2xl font-mono mb-4">Book Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error || "Book details could not be loaded"}
          </p>
          <button
            onClick={() => router.push("/discover")}
            className="px-8 py-3 bg-black text-white font-mono uppercase tracking-wide"
          >
            Back to Discover
          </button>
        </div>
      </div>
    );
  }

  return <BookModal book={book} isOpen={true} onClose={handleCloseModal} />;
}
