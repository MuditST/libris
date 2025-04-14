import { create } from 'zustand';
import { BookItem } from '@/lib/types';

interface RecommendedBook extends BookItem {
  reason: string;
}

interface BookBlendState {
  // Selected books for generating recommendations
  selectedBooks: BookItem[];
  // Generated recommendations
  recommendations: RecommendedBook[];
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Actions
  selectBook: (book: BookItem) => void;
  unselectBook: (bookId: string) => void;
  clearSelectedBooks: () => void;
  generateRecommendations: () => Promise<void>;
  clearRecommendations: () => void;
}

export const useBookBlendStore = create<BookBlendState>((set, get) => ({
  selectedBooks: [],
  recommendations: [],
  isLoading: false,
  error: null,
  
  selectBook: (book) => {
    set((state) => {
      // Don't add if already selected or if we already have 5 books
      if (
        state.selectedBooks.some((selectedBook) => selectedBook.id === book.id) ||
        state.selectedBooks.length >= 5
      ) {
        return state;
      }
      return { selectedBooks: [...state.selectedBooks, book] };
    });
  },
  
  unselectBook: (bookId) => {
    set((state) => ({
      selectedBooks: state.selectedBooks.filter((book) => book.id !== bookId),
    }));
  },
  
  clearSelectedBooks: () => {
    set({ selectedBooks: [] });
  },
  
  generateRecommendations: async () => {
    const { selectedBooks } = get();
    
    // Validate selection
    if (selectedBooks.length === 0) {
      set({ error: 'Please select at least one book' });
      return;
    }
    
    if (selectedBooks.length > 5) {
      set({ error: 'Please select no more than 5 books' });
      return;
    }
    
    // Reset state before fetching
    set({ isLoading: true, error: null });
    
    // Add retry logic
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        const response = await fetch('/api/bookblend', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ books: selectedBooks }),
        });
        
        if (!response.ok) {
          const errorData = await response.json()
            .catch(() => ({ error: `Error: ${response.status}` }));
          throw new Error(errorData.error || `Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.recommendations || data.recommendations.length === 0) {
          throw new Error('No recommendations were found. Please try different books.');
        }
        
        set({ recommendations: data.recommendations, isLoading: false });
        return; // Success, exit the retry loop
      } catch (error) {
        console.error(`Attempt ${attempts + 1} failed:`, error);
        attempts++;
        
        // If we've used all our attempts, throw the error
        if (attempts >= maxAttempts) {
          console.error('Maximum retry attempts reached:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Unknown error occurred', 
            isLoading: false 
          });
          return;
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    }
  },
  
  clearRecommendations: () => {
    set({ recommendations: [] });
  },
}));