"use client";
import React, { useEffect } from "react";
import { useBookshelfStore } from "@/store/bookshelfStore";
import { useRouter } from "next/navigation";
import LoadingIndicator from "@/components/LoadingIndicator";
import { useClerk } from "@clerk/nextjs";

export default function ClosedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { signOut } = useClerk();
  const { authError, clearAuthError } = useBookshelfStore();

  useEffect(() => {
    if (authError) {
      console.log("Authentication error detected in layout, signing out.");

      clearAuthError();
      signOut({ redirectUrl: "/sign-in?reason=google_reauth" });
    }
  }, [authError, router, clearAuthError, signOut]);

  if (authError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingIndicator text="Authentication issue. Signing out..." />
      </div>
    );
  }

  return <>{children}</>;
}
