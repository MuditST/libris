import { BookItem } from '@/lib/types';

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

export const CACHE_DURATION = 10 * 60 * 1000;


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


export function updateBookInCaches(bookId: string, category: string | null, isFavorite: boolean) {
  
  Object.keys(discoverCache).forEach(key => {
    const cache = discoverCache[key];
    if (cache.data?.items) {
      const items = cache.data.items;
      const bookIndex = items.findIndex((book: BookItem) => book.id === bookId);
      
      if (bookIndex >= 0) {
     
        items[bookIndex]._shelf = category;
        items[bookIndex]._favorite = isFavorite;
      }
    }
  });
  

  Object.keys(searchResultsCache).forEach(key => {
    const cache = searchResultsCache[key];
    if (cache.data?.items) {
      const items = cache.data.items;
      const bookIndex = items.findIndex((book: BookItem) => book.id === bookId);
      
      if (bookIndex >= 0) {
       
        items[bookIndex]._shelf = category;
        items[bookIndex]._favorite = isFavorite;
      }
    }
  });
}