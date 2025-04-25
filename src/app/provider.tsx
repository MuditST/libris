"use client";
import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { initBookshelfStore } from '@/store/bookshelfStore';

export function BookshelfInitializer() {
  const { isLoaded, isSignedIn } = useUser();
  
  useEffect(() => {

    if (isLoaded && isSignedIn) {

      const timer = setTimeout(() => {
      
        initBookshelfStore();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isLoaded, isSignedIn]);
  
 
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