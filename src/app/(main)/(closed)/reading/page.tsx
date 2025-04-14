"use client";

import ShelfPageLayout, { ShelfConfig } from "@/components/ShelfPageLayout";

const readingConfig: ShelfConfig = {
  title: "Currently Reading",
  shelfKey: "reading",
  apiCategory: "READING",
  emptyStateMessage: "You're not currently reading any books.",
  returnPath: "/reading",
};

export default function ReadingPage() {
  return <ShelfPageLayout config={readingConfig} />;
}
