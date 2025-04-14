import { BookItem } from '@/lib/types';

// Caches
export const discoverCache: {
  [key: string]: {
    timestamp: number;
    data: any;
  }
} = {};

export const searchResultsCache: {
  [key: string]: {
    timestamp: number;
    data: any;
  }
} = {};

// Cache duration in milliseconds (10 minutes)
export const CACHE_DURATION = 10 * 60 * 1000;

// Functions to clear caches
export function clearSearchCache() {
  Object.keys(searchResultsCache).forEach(key => {
    delete searchResultsCache[key];
  });
}

export function clearDiscoverCache() {
  Object.keys(discoverCache).forEach(key => {
    delete discoverCache[key];
  });
}

// Function to update book in caches when shelf changes
export function updateBookInCaches(bookId: string, category: string | null, isFavorite: boolean) {
  // Update book in discover cache
  Object.keys(discoverCache).forEach(key => {
    const cache = discoverCache[key];
    if (cache.data?.items) {
      const items = cache.data.items;
      const bookIndex = items.findIndex((book: BookItem) => book.id === bookId);
      
      if (bookIndex >= 0) {
        // Add shelf info to the book in cache
        items[bookIndex]._shelf = category;
        items[bookIndex]._favorite = isFavorite;
      }
    }
  });
  
  // Update book in search cache
  Object.keys(searchResultsCache).forEach(key => {
    const cache = searchResultsCache[key];
    if (cache.data?.items) {
      const items = cache.data.items;
      const bookIndex = items.findIndex((book: BookItem) => book.id === bookId);
      
      if (bookIndex >= 0) {
        // Add shelf info to the book in cache
        items[bookIndex]._shelf = category;
        items[bookIndex]._favorite = isFavorite;
      }
    }
  });
}