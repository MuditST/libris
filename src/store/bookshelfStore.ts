import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { debounce } from 'lodash';
import { 
  addBookToBookshelf, 
  removeBookFromShelf, 
  fetchBookshelf,
  checkGoogleBooksAccess,
  getGoogleOAuthToken,
  fetchAllBookshelves,
  loggedFetch
} from '@/actions/bookshelfActions';
import { AuthError } from '@/lib/errors'; 
import { SHELF_IDS } from "@/lib/constants";
import { BookItem } from '@/lib/types';
import { batchOperation } from '@/lib/apiBatchManager';
import { updateBookInCaches } from '@/lib/cacheUtils';

type ReadingShelfCategory = 'WILL_READ' | 'READING' | 'HAVE_READ';
type BookshelfCategory = keyof typeof SHELF_IDS;

const refreshInProgress: Record<BookshelfCategory, boolean> = Object.keys(SHELF_IDS).reduce((acc, shelf) => {
  acc[shelf as BookshelfCategory] = false;
  return acc;
}, {} as Record<BookshelfCategory, boolean>);

const debouncedRefresh = debounce(async (refreshFn: () => Promise<void>) => {
  await refreshFn();
}, 1000);

const refreshSingleShelf = async (category: BookshelfCategory, set: any) => {
  if (refreshInProgress[category]) return;
  
  try {
    refreshInProgress[category] = true;
    const books = await fetchBookshelf(category, { maxResults: 20 });
    set((state: BookshelfState) => {
      const updates: Partial<BookshelfState> = {};
      const newTotalCounts = {...state.totalCounts};
      
      switch (category) {
        case 'FAVORITES':
          updates.favorites = books;
          newTotalCounts.favorites = books.length;
          break;
        case 'WILL_READ':
          updates.wantToRead = books;
          newTotalCounts.wantToRead = books.length;
          break;
        case 'READING':
          updates.reading = books;
          newTotalCounts.reading = books.length;
          break;
        case 'HAVE_READ':
          updates.finished = books;
          newTotalCounts.finished = books.length;
          break;
      }
      
      updates.totalCounts = newTotalCounts;
      return updates;
    });
  } catch (error) {
    console.error(`Error refreshing ${category} shelf:`, error);
  } finally {
    refreshInProgress[category] = false;
  }
};

const debouncedRefreshShelves: Record<BookshelfCategory, (setFn: any) => void> = {} as Record<BookshelfCategory, (setFn: any) => void>;

Object.keys(SHELF_IDS).forEach(shelf => {
  const shelfKey = shelf as BookshelfCategory;
  debouncedRefreshShelves[shelfKey] = debounce((setFn: any) => {
    refreshSingleShelf(shelfKey, setFn);
  }, 1500);
});

export interface BookshelfState {
  bookshelfMap: { [key: string]: BookshelfCategory };
  favoritesMap: { [key: string]: boolean };
  loading: boolean;
  error: string | null;
  authError: boolean;
  lastUpdated: number | null;
  isInitialized: boolean;
  favorites: BookItem[];
  wantToRead: BookItem[];
  reading: BookItem[];
  finished: BookItem[];
  totalCounts: {
    favorites: number;
    wantToRead: number;
    reading: number;
    finished: number;
  };
  
  refreshBookshelves: () => Promise<void>;
  addToBookshelf: (bookId: string, category: BookshelfCategory, options?: { localLoadingOnly?: boolean, skipRefresh?: boolean, bookData?: BookItem }) => Promise<void>;
  removeFromBookshelf: (bookId: string, options?: { localLoadingOnly?: boolean }) => Promise<void>;
  toggleFavorite: (bookId: string, options?: { localLoadingOnly?: boolean, bookData?: BookItem }) => Promise<void>;
  isOnShelf: (bookId: string) => ReadingShelfCategory | null;
  isFavorite: (bookId: string) => boolean;
  clearError: () => void;
  clearAuthError: () => void;
  setInitialized: (value: boolean) => void;
  updateLocalBookshelves: (bookId: string, newCategory: BookshelfCategory | null, favorite: boolean, bookData?: BookItem) => void;
  clearStore: () => void;
}

export const useBookshelfStore = create<BookshelfState>()(
  persist(
    (set, get) => ({
      bookshelfMap: {},
      favoritesMap: {},
      loading: false,
      error: null,
      authError: false,
      lastUpdated: null,
      isInitialized: false,
      favorites: [],
      wantToRead: [],
      reading: [],
      finished: [],
      totalCounts: {
        favorites: 0,
        wantToRead: 0,
        reading: 0,
        finished: 0
      },
      
      refreshBookshelves: async () => {
        set({ loading: true, error: null, authError: false });
        try {
          const result = await batchOperation('refresh-all-bookshelves', async () => {
            const accessCheck = await checkGoogleBooksAccess();
            if (accessCheck.status !== 'success') {
              throw new AuthError(accessCheck.message); 
            }
            return await fetchAllBookshelves();
          });
          
          if (!result) {
            throw new Error("Failed to fetch bookshelf data");
          }
          
          const { favorites, wantToRead, reading, finished, totalCounts } = result;
          const bookMap: { [key: string]: BookshelfCategory } = {};
          const favoritesMap: { [key: string]: boolean } = {};
          
          favorites.forEach(book => {
            favoritesMap[book.id] = true;
          });
          
          wantToRead.forEach(book => {
            bookMap[book.id] = 'WILL_READ';
          });
          
          reading.forEach(book => {
            bookMap[book.id] = 'READING';
          });
          
          finished.forEach(book => {
            bookMap[book.id] = 'HAVE_READ';
          });
          
          set({ 
            bookshelfMap: bookMap,
            favoritesMap: favoritesMap,
            favorites,
            wantToRead,
            reading,
            finished,
            totalCounts,
            lastUpdated: Date.now(),
            loading: false,
            error: null,
            authError: false,
            isInitialized: true
          });
        } catch (err) {
          console.error("Error refreshing bookshelves:", err);
          if (err instanceof AuthError) {
            set({ loading: false, error: err.message, authError: true });
          } else {
            set({ loading: false, error: err instanceof Error ? err.message : "An error occurred while loading your bookshelves" });
          }
        }
      },
      
      addToBookshelf: async (bookId: string, newCategory: BookshelfCategory, options?: { localLoadingOnly?: boolean, skipRefresh?: boolean, bookData?: BookItem }) => {
        const state = get();
        const currentCategory = state.isOnShelf(bookId);
        
        set({ loading: !options?.localLoadingOnly, error: null, authError: false });
        try {
          if (options?.localLoadingOnly) {
            return;
          }
      
          if (currentCategory) {
            await removeBookFromShelf(bookId, currentCategory);
          }
          
          await addBookToBookshelf(bookId, newCategory);
          get().updateLocalBookshelves(bookId, newCategory, state.isFavorite(bookId), options?.bookData);
          updateBookInCaches(bookId, newCategory, state.isFavorite(bookId));
        } catch (error) {
          console.error('Error adding book to bookshelf:', error);
          if (error instanceof AuthError) {
            set({ error: error.message, authError: true }); 
          } else {
            set({ error: 'Failed to add book to shelf. Please try again.' });
          }
          throw error;
        } finally {
          set({ loading: false, lastUpdated: Date.now() });
        }
      },
      
      removeFromBookshelf: async (bookId: string, options?: { localLoadingOnly?: boolean }) => {
        if (!options?.localLoadingOnly) {
          set({ loading: true, error: null, authError: false });
        }
        
        try {
          const currentShelf = get().isOnShelf(bookId);
          const isFav = get().isFavorite(bookId);
          
          if (!currentShelf) {
            console.log("Book is not on any shelf, nothing to remove");
            if (!options?.localLoadingOnly) {
              set({ loading: false });
            }
            return;
          }
          
          if (options?.localLoadingOnly) {
            return;
          }
          
          await removeBookFromShelf(bookId, currentShelf);
          get().updateLocalBookshelves(bookId, null, isFav);
        } catch (err) {
          console.error("Error removing from bookshelf:", err);
          if (err instanceof AuthError) {
            set({ error: err.message, authError: true }); 
          } else {
            set(state => ({ 
              error: err instanceof Error ? err.message : "Failed to remove from bookshelf",
              loading: !options?.localLoadingOnly ? false : state.loading
            }));
          }
          throw err;
        } finally {
          if (!options?.localLoadingOnly) {
            set({ loading: false });
          }
        }
      },
      
      toggleFavorite: async (bookId: string, options?: { localLoadingOnly?: boolean, bookData?: BookItem }) => {
        if (!options?.localLoadingOnly) {
          set({ loading: true, error: null, authError: false }); 
        }
        
        try {
          const isFav = get().isFavorite(bookId);
          const currentShelf = get().isOnShelf(bookId);
          
          get().updateLocalBookshelves(bookId, currentShelf, !isFav, options?.bookData);
          
          if (options?.localLoadingOnly) {
            return;
          }
          
          if (!isFav) {
            await addBookToBookshelf(bookId, 'FAVORITES');
          } else {
            await removeBookFromShelf(bookId, 'FAVORITES');
          }
          
          updateBookInCaches(bookId, currentShelf, !isFav);
        } catch (err) {
          console.error("Error toggling favorite:", err);
          const isFav = get().isFavorite(bookId);
          const currentShelf = get().isOnShelf(bookId);
          
          get().updateLocalBookshelves(bookId, currentShelf, !isFav);
          
          if (err instanceof AuthError) {
            set({ error: err.message, authError: true }); 
          } else {
            set(state => ({ 
              error: "Failed to update favorites",
              loading: !options?.localLoadingOnly ? false : state.loading
            }));
          }
          throw new Error("Failed to update favorites");
        } finally {
          if (!options?.localLoadingOnly) {
            set({ loading: false, lastUpdated: Date.now() });
          }
        }
      },
      
      isOnShelf: (bookId: string) => {
        const shelf = get().bookshelfMap[bookId];
        return (shelf === 'WILL_READ' || shelf === 'READING' || shelf === 'HAVE_READ') 
          ? shelf as ReadingShelfCategory 
          : null;
      },
      
      isFavorite: (bookId: string) => {
        return !!get().favoritesMap[bookId];
      },
      
      clearError: () => {
        set({ error: null, authError: false }); 
      },
      
      clearAuthError: () => {
        set({ authError: false }); 
      },
      
      setInitialized: (value: boolean) => {
        set({ isInitialized: value });
      },
      
      updateLocalBookshelves: (bookId: string, newCategory: BookshelfCategory | null, favorite: boolean, bookData?: BookItem) => {
        set(state => {
          let theBook: BookItem | undefined;
          const oldCategory = state.bookshelfMap[bookId];
          
          if (oldCategory === 'WILL_READ') {
            theBook = state.wantToRead.find(b => b.id === bookId);
          } else if (oldCategory === 'READING') {
            theBook = state.reading.find(b => b.id === bookId);
          } else if (oldCategory === 'HAVE_READ') {
            theBook = state.finished.find(b => b.id === bookId);
          } 
          
          if (!theBook && favorite) {
            theBook = state.favorites.find(b => b.id === bookId);
          }
          
          if (!theBook && bookData) {
            theBook = bookData;
          } else if (!theBook && (newCategory || favorite)) {
            theBook = {
              id: bookId,
              volumeInfo: {
                title: "Loading...",
                authors: [],
                imageLinks: {}
              }
            } as BookItem;
          }
          
          if (!theBook) {
            return state;
          }
          
          const newBookshelfMap = { ...state.bookshelfMap };
          
          if (oldCategory) {
            delete newBookshelfMap[bookId];
          }
          
          if (newCategory) {
            newBookshelfMap[bookId] = newCategory;
          }
          
          let newWantToRead = state.wantToRead.filter(b => b.id !== bookId);
          let newReading = state.reading.filter(b => b.id !== bookId);
          let newFinished = state.finished.filter(b => b.id !== bookId);
          
          if (newCategory === 'WILL_READ') {
            newWantToRead = [theBook as BookItem, ...newWantToRead];
          } else if (newCategory === 'READING') {
            newReading = [theBook as BookItem, ...newReading];
          } else if (newCategory === 'HAVE_READ') {
            newFinished = [theBook as BookItem, ...newFinished];
          }
          
          const newFavoritesMap = { ...state.favoritesMap };
          let newFavorites = state.favorites.filter(b => b.id !== bookId);
          
          if (favorite) {
            newFavoritesMap[bookId] = true;
            newFavorites = [theBook as BookItem, ...newFavorites];
          } else {
            delete newFavoritesMap[bookId];
          }
          
          const newTotalCounts = {
            favorites: newFavorites.length,
            wantToRead: newWantToRead.length,
            reading: newReading.length,
            finished: newFinished.length
          };
          
          updateBookInCaches(bookId, newCategory, favorite);
          
          return {
            bookshelfMap: newBookshelfMap,
            favoritesMap: newFavoritesMap,
            wantToRead: newWantToRead,
            reading: newReading,
            finished: newFinished,
            favorites: newFavorites,
            totalCounts: newTotalCounts
          };
        });
      },
      
      clearStore: () => {
        set({
          bookshelfMap: {},
          favoritesMap: {},
          loading: false,
          error: null,
          authError: false, 
          lastUpdated: null,
          isInitialized: false,
          favorites: [],
          wantToRead: [],
          reading: [],
          finished: [],
          totalCounts: {
            favorites: 0,
            wantToRead: 0,
            reading: 0,
            finished: 0
          }
        });
      },
    }),
    {
      name: 'bookshelf-storage',
      partialize: (state) => ({ 
        bookshelfMap: state.bookshelfMap,
        favoritesMap: state.favoritesMap,
        favorites: state.favorites,
        wantToRead: state.wantToRead,
        reading: state.reading,
        finished: state.finished,
        lastUpdated: state.lastUpdated,
        isInitialized: state.isInitialized,
        totalCounts: state.totalCounts
      }),
    }
  )
);

export const initBookshelfStore = async () => {
  const { refreshBookshelves, lastUpdated, isInitialized } = useBookshelfStore.getState();
  const needsRefresh = !isInitialized || !lastUpdated || (Date.now() - lastUpdated > 30 * 60 * 1000);
  
  if (needsRefresh) {
    await refreshBookshelves();
  }
};