"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useBookshelfStore } from "@/store/bookshelfStore";
import { useBookBlendStore } from "@/store/bookblendStore";

export default function StoreCleanup() {
  const { isSignedIn, isLoaded } = useUser();
  const wasSignedIn = useRef<boolean | null>(null);

  useEffect(() => {
    // Only run logic once Clerk is loaded
    if (!isLoaded) {
      return;
    }

    // Check if the sign-in status changed from signed-in to signed-out
    if (wasSignedIn.current === true && isSignedIn === false) {
      console.log("User signed out, clearing stores and chat history...");

      // Clear Zustand stores
      useBookshelfStore.getState().clearStore();
      useBookBlendStore.getState().clearSelectedBooks();
      useBookBlendStore.getState().clearRecommendations();

      // Clear Gookit chat history from localStorage
      try {
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("gookit-chat-")) {
            localStorage.removeItem(key);
            console.log(`Removed chat history: ${key}`);
          }
        });
      } catch (error) {
        console.error("Error clearing chat history from localStorage:", error);
      }

      // Optionally clear other relevant stores here
    }

    // Update the previous state for the next render
    wasSignedIn.current = isSignedIn;
  }, [isSignedIn, isLoaded]);

  // This component does not render anything
  return null;
}
