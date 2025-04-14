"use server";

import { clerkClient, auth } from '@clerk/nextjs/server';
import { BookItem } from '@/lib/types';
import { trackApiCall } from '@/lib/throttleUtils';
import { SHELF_IDS } from '@/lib/constants';
import { AuthError } from '@/lib/errors'; // Import the error from its new location

type BookshelfCategory = keyof typeof SHELF_IDS;
type ReadingShelfCategory = 'WILL_READ' | 'READING' | 'HAVE_READ';

export async function getGoogleOAuthToken(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new AuthError('User not authenticated');

  try {
    const client = await clerkClient();
    const oauthResponse = await client.users.getUserOauthAccessToken(userId, 'google');
    const token = oauthResponse.data[0]?.token;

    if (!token) {
      throw new AuthError('Google OAuth token not found or access revoked. Please re-authenticate.');
    }
    return token;
  } catch (error: any) {
    console.error('Clerk Error getting Google OAuth token:', error);
    throw new AuthError('Failed to retrieve Google OAuth token. Please sign in again.');
  }
}

export async function loggedFetch(url: string, options?: RequestInit): Promise<Response> {
  trackApiCall();
  const response = await fetch(url, options);

  if (response.status === 401 || response.status === 403) {
    console.error(`Google API Auth Error (${response.status}): ${url}`);
    throw new AuthError('Google API authentication failed. Please sign in again.');
  }

  return response;
}

export async function addBookToBookshelf(volumeId: string, category: BookshelfCategory): Promise<{ success: boolean }> {
  try {
    const token = await getGoogleOAuthToken();
    const shelfId = SHELF_IDS[category];
    if (shelfId === undefined) {
      console.error(`Invalid category provided: ${category}`);
      throw new Error(`Invalid bookshelf category: ${category}`);
    }
    const url = `https://www.googleapis.com/books/v1/mylibrary/bookshelves/${shelfId}/addVolume?volumeId=${volumeId}`;

    const response = await loggedFetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to add book ${volumeId} to shelf ${shelfId}: ${response.status} - ${errorText}`);
      throw new Error(`Google API Error: Failed to add book (${response.status})`);
    }

    return { success: true };
  } catch (error) {
    console.error(`Error in addBookToBookshelf (${volumeId}, ${category}):`, error);
    if (error instanceof AuthError) {
      throw error;
    }
    throw new Error('Failed to add book to bookshelf.');
  }
}

export async function fetchBookshelf(
  category: BookshelfCategory,
  options?: { maxResults?: number, startIndex?: number }
): Promise<BookItem[]> {
  try {
    const shelfId = SHELF_IDS[category];
    const token = await getGoogleOAuthToken();

    const shelfInfoResponse = await loggedFetch(
      `https://www.googleapis.com/books/v1/mylibrary/bookshelves/${shelfId}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    if (!shelfInfoResponse.ok) {
      throw new Error('Failed to fetch shelf info');
    }
    const shelfInfo = await shelfInfoResponse.json();
    const totalItems = shelfInfo.volumeCount || 0;

    let allBooks: BookItem[] = [];
    let currentIndex = options?.startIndex || 0;
    const maxResultsPerPage = 40;

    while (currentIndex < totalItems && (options?.maxResults === undefined || allBooks.length < options.maxResults)) {
      const fetchCount = Math.min(maxResultsPerPage, totalItems - currentIndex);
      if (fetchCount <= 0) break;

      const url = `https://www.googleapis.com/books/v1/mylibrary/bookshelves/${shelfId}/volumes?startIndex=${currentIndex}&maxResults=${fetchCount}`;
      const response = await loggedFetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch volumes page');
      }
      const data = await response.json();
      const items = data.items || [];
      allBooks = allBooks.concat(items);
      currentIndex += items.length;
      if (items.length < fetchCount) break;
    }

    return allBooks;
  } catch (error) {
    console.error(`Error in fetchBookshelf (${category}):`, error);
    if (error instanceof AuthError) {
      throw error;
    }
    throw new Error('Failed to fetch bookshelf.');
  }
}

export async function removeBookFromShelf(volumeId: string, category: BookshelfCategory): Promise<{ success: boolean }> {
  try {
    const token = await getGoogleOAuthToken();
    const shelfId = SHELF_IDS[category];
    if (shelfId === undefined) throw new Error(`Invalid bookshelf category: ${category}`);

    const url = `https://www.googleapis.com/books/v1/mylibrary/bookshelves/${shelfId}/removeVolume?volumeId=${volumeId}`;

    const response = await loggedFetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Google API error: ${response.status} - ${errorText}`);
      throw new Error(`Failed to remove book: ${response.status} - ${errorText}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error removing book from bookshelf:", error);
    if (error instanceof AuthError) {
      throw error;
    }
    throw new Error('Failed to remove book from bookshelf.');
  }
}

export async function checkGoogleBooksAccess(): Promise<{
  status: string;
  message: string;
  userId: string | null;
  hasToken: boolean;
  bookshelves?: any;
}> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        status: 'error',
        message: 'User not authenticated',
        userId: null,
        hasToken: false
      };
    }

    try {
      const client = await clerkClient();
      const oauthResponse = await client.users.getUserOauthAccessToken(userId, 'google');
      const token = oauthResponse.data[0]?.token;

      if (!token) {
        return {
          status: 'error',
          message: 'No Google OAuth token available. Please connect your Google account.',
          userId,
          hasToken: false
        };
      }

      const response = await loggedFetch(
        `https://www.googleapis.com/books/v1/mylibrary/bookshelves`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (!response.ok) {
        const errorText = await response.text();
        return {
          status: 'error',
          message: `Google API error: ${response.status} - ${errorText}`,
          userId,
          hasToken: true
        };
      }

      const bookshelves = await response.json();
      return {
        status: 'success',
        message: 'Successfully connected to Google Books API',
        userId,
        hasToken: true,
        bookshelves
      };
    } catch (tokenError) {
      return {
        status: 'error',
        message: `Token error: ${tokenError instanceof Error ? tokenError.message : 'Unknown error'}`,
        userId,
        hasToken: false
      };
    }
  } catch (error) {
    return {
      status: 'error',
      message: `Error checking Google Books access: ${error instanceof Error ? error.message : 'Unknown error'}`,
      userId: null,
      hasToken: false
    };
  }
}

export async function refreshBookshelves() {
  try {
    const token = await getGoogleOAuthToken();

    const bookshelvesResponse = await loggedFetch(
      `https://www.googleapis.com/books/v1/mylibrary/bookshelves`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!bookshelvesResponse.ok) {
      throw new Error(`Failed to fetch bookshelves: ${bookshelvesResponse.status}`);
    }

    return await bookshelvesResponse.json();
  } catch (error) {
    console.error("Error refreshing bookshelves:", error);
    if (error instanceof AuthError) {
      throw error;
    }
    throw new Error('Failed to refresh bookshelves.');
  }
}

export async function getBookshelvesMetadata(): Promise<any> {
  try {
    const token = await getGoogleOAuthToken();

    const response = await loggedFetch(
      `https://www.googleapis.com/books/v1/mylibrary/bookshelves`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get bookshelves: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching bookshelf metadata:', error);
    if (error instanceof AuthError) {
      throw error;
    }
    throw new Error('Failed to fetch bookshelf metadata.');
  }
}

export async function fetchAllBookshelves(): Promise<{
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
}> {
  try {
    const token = await getGoogleOAuthToken();

    const shelvesMetadata = await getBookshelvesMetadata();

    const shelves = shelvesMetadata.items || [];
    const totalCounts = {
      favorites: 0,
      wantToRead: 0,
      reading: 0,
      finished: 0
    };

    shelves.forEach((shelf: any) => {
      if (shelf.id === SHELF_IDS.FAVORITES) {
        totalCounts.favorites = shelf.volumeCount || 0;
      } else if (shelf.id === SHELF_IDS.WILL_READ) {
        totalCounts.wantToRead = shelf.volumeCount || 0;
      } else if (shelf.id === SHELF_IDS.READING) {
        totalCounts.reading = shelf.volumeCount || 0;
      } else if (shelf.id === SHELF_IDS.HAVE_READ) {
        totalCounts.finished = shelf.volumeCount || 0;
      }
    });

    const [favoritesPromise, wantToReadPromise, readingPromise, finishedPromise] = await Promise.all([
      getShelfBooks(token, SHELF_IDS.FAVORITES, totalCounts.favorites),
      getShelfBooks(token, SHELF_IDS.WILL_READ, totalCounts.wantToRead),
      getShelfBooks(token, SHELF_IDS.READING, totalCounts.reading),
      getShelfBooks(token, SHELF_IDS.HAVE_READ, totalCounts.finished)
    ]);

    return {
      favorites: favoritesPromise,
      wantToRead: wantToReadPromise,
      reading: readingPromise,
      finished: finishedPromise,
      totalCounts
    };
  } catch (error) {
    console.error('Error fetching all bookshelves:', error);
    if (error instanceof AuthError) {
      throw error;
    }
    throw new Error('Failed to fetch all bookshelves.');
  }
}

async function getShelfBooks(token: string, shelfId: number, totalBooks: number): Promise<BookItem[]> {
  try {
    if (totalBooks === 0) {
      return [];
    }

    let allBooks: BookItem[] = [];
    const batchSize = 40;
    let startIndex = 0;

    while (allBooks.length < totalBooks) {
      const url = `https://www.googleapis.com/books/v1/mylibrary/bookshelves/${shelfId}/volumes?startIndex=${startIndex}&maxResults=${batchSize}`;
      const response = await loggedFetch(url, { headers: { 'Authorization': `Bearer ${token}` } });

      if (!response.ok) {
        throw new Error(`Failed to get books: ${response.status}`);
      }

      const data = await response.json();
      const items = data.items || [];

      if (items.length === 0) {
        break;
      }

      allBooks = [...allBooks, ...items];
      startIndex += items.length;

      if (startIndex >= totalBooks || allBooks.length >= totalBooks) {
        break;
      }
    }

    return allBooks;
  } catch (error) {
    console.error(`Error fetching books for shelf ${shelfId}:`, error);
    if (error instanceof AuthError) {
      throw error;
    }
    return [];
  }
}