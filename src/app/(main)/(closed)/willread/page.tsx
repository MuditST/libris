"use client";

import ShelfPageLayout, { ShelfConfig } from "@/components/ShelfPageLayout";

const willReadConfig: ShelfConfig = {
  title: "Want to Read",
  shelfKey: "wantToRead",
  apiCategory: "WILL_READ",
  emptyStateMessage: "Your reading list is empty.",
  returnPath: "/willread",
};

export default function WillReadPage() {
  return <ShelfPageLayout config={willReadConfig} />;
}
