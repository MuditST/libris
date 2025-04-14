"use client";
import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { initBookshelfStore } from '@/store/bookshelfStore';

export function BookshelfInitializer() {
  const { isLoaded, isSignedIn } = useUser();
  
  useEffect(() => {
    // If user is signed in, initialize their bookshelf data
    if (isLoaded && isSignedIn) {
      // Delay slightly to prevent competing with more critical resources
      const timer = setTimeout(() => {
        console.log("Pre-loading user bookshelf data...");
        initBookshelfStore();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isLoaded, isSignedIn]);
  
  // This component doesn't render anything
  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BookshelfInitializer />
      {children}
    </>
  );
}