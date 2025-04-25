"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { initBookshelfStore } from "@/store/bookshelfStore";

export default function BookshelfInitializer() {
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const timer = setTimeout(() => {
        console.log("Initializing bookshelf store...");
        initBookshelfStore();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isLoaded, isSignedIn]);

  return null;
}
