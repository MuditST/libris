"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs"; // Add this import
import { initBookshelfStore } from "@/store/bookshelfStore";

export default function BookshelfInitializer() {
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    // Only initialize if the user is signed in and loaded
    if (isLoaded && isSignedIn) {
      // Add a small delay to prevent competing with more critical resources
      const timer = setTimeout(() => {
        console.log("Initializing bookshelf store...");
        initBookshelfStore();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isLoaded, isSignedIn]);

  return null; // This component doesn't render anything
}
