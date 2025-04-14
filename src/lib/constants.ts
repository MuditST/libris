// These are the exact shelf IDs from Google Books API
export const SHELF_IDS = {
    // Standard Google Books bookshelves
    FAVORITES: 0,    // Favorites
    PURCHASED: 1,    // Purchased
    WILL_READ: 2,    // To Read
    READING: 3,      // Currently Reading  
    HAVE_READ: 4,    // Have Read
    REVIEWED: 5,     // Reviewed
    RECENTLY_VIEWED: 6, // Recently Viewed
    ALL: 7,          // Books for you
    ALL_BOOKS: 8,    // All books
  } as const;