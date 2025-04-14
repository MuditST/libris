"use client";

import ShelfPageLayout, { ShelfConfig } from "@/components/ShelfPageLayout";

const favoritesConfig: ShelfConfig = {
  title: "Favorite Books",
  shelfKey: "favorites",
  apiCategory: "FAVORITES",
  emptyStateMessage: "You haven't favorited any books yet.",
  returnPath: "/favorites",
};

export default function FavoritesPage() {
  return <ShelfPageLayout config={favoritesConfig} />;
}
