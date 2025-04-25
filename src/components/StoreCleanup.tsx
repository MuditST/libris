"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useBookshelfStore } from "@/store/bookshelfStore";
import { useBookBlendStore } from "@/store/bookblendStore";

export default function StoreCleanup() {
  const { isSignedIn, isLoaded } = useUser();
  const wasSignedIn = useRef<boolean | null>(null);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (wasSignedIn.current === true && isSignedIn === false) {
      console.log("User signed out, clearing stores and chat history...");

      // Clear Zustand stores
      useBookshelfStore.getState().clearStore();
      useBookBlendStore.getState().clearSelectedBooks();
      useBookBlendStore.getState().clearRecommendations();

      try {
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("booktalk-chat-")) {
            localStorage.removeItem(key);
            console.log(`Removed chat history: ${key}`);
          }
        });
      } catch (error) {
        console.error("Error clearing chat history from localStorage:", error);
      }
    }

    wasSignedIn.current = isSignedIn;
  }, [isSignedIn, isLoaded]);

  return null;
}
