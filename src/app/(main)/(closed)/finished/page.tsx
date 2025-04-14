"use client";

import ShelfPageLayout, { ShelfConfig } from "@/components/ShelfPageLayout";

const finishedConfig: ShelfConfig = {
  title: "Finished Books",
  shelfKey: "finished",
  apiCategory: "HAVE_READ",
  emptyStateMessage: "You haven't finished any books yet.",
  returnPath: "/finished",
};

export default function FinishedPage() {
  return <ShelfPageLayout config={finishedConfig} />;
}
