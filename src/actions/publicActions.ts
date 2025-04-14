"use server";

// Use only one declaration of API key
const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY;

// Track book IDs per search query to avoid duplicates
const searchCache: Record<string, Set<string>> = {};
export async function searchBooksServer(
  query: string, 
  startIndex: number = 0, 
  maxResults: number = 10,
  resetCache: boolean = false
): Promise<any> {
  if (!GOOGLE_BOOKS_API_KEY) {
    throw new Error('Google Books API key is not configured');
  }
  
  // Improve query handling
  const safeQuery = query.trim() ? query.trim() : "books";
  console.log(`Server searching for: "${safeQuery}"`); // Debug log
  
  // Initialize or reset the cache for this query if needed
  const cacheKey = safeQuery.toLowerCase();
  if (resetCache || startIndex === 0 || !searchCache[cacheKey]) {
    searchCache[cacheKey] = new Set();
  }
  
  // Keep fetching until we get enough unique results or run out of results
  const uniqueItems: any[] = [];
  let currentIndex = startIndex;
  let totalItems = 0;
  let attempts = 0;
  const maxAttempts = 5; // Limit API calls to avoid infinite loops
  
  while (uniqueItems.length < maxResults && attempts < maxAttempts) {
    attempts++;
    
    // Add a wildcard * to the end of single word queries to improve results
    let queryParam = safeQuery;
    if (safeQuery.split(/\s+/).length === 1 && !safeQuery.includes('*')) {
      // For single words, add both a trailing wildcard and intitle search for better results
      queryParam = `intitle:${safeQuery} OR ${safeQuery}*`;
    }
    
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(queryParam)}&startIndex=${currentIndex}&maxResults=${maxResults * 2}&key=${GOOGLE_BOOKS_API_KEY}`
    );
    
    if (!response.ok) throw new Error(`Failed to search books: ${response.status}`);
    
    const data = await response.json();
    totalItems = data.totalItems || 0;
    
    // No results or no more results
    if (!data.items || data.items.length === 0) {
      break;
    }
    
    // Filter for unique books we haven't seen before
    for (const item of data.items) {
      if (!searchCache[cacheKey].has(item.id) && uniqueItems.length < maxResults) {
        uniqueItems.push(item);
        searchCache[cacheKey].add(item.id);
      }
    }
    
    // If we got enough unique items or reached the end, break
    if (uniqueItems.length >= maxResults || currentIndex + data.items.length >= totalItems) {
      break;
    }
    
    // Otherwise, move to the next page
    currentIndex += data.items.length;
  }
  
  // Return the data in the same format as the Google Books API
  return {
    items: uniqueItems,
    totalItems: totalItems,
    kind: "books#volumes",
    hasMore: currentIndex < totalItems && uniqueItems.length === maxResults
  };
}
export type SubjectFilter = 
  | "fiction" 
  | "nonfiction" 
  | "science" 
  | "romance" 
  | "thriller" 
  | "mystery" 
  | "fantasy" 
  | "biography" 
  | "history" 
  | "business" 
  | "poetry" 
  | "comics";

export type OrderFilter = "relevance" | "newest";

// Add the new PrintType filter type
export type PrintTypeFilter = "all" | "books" | "magazines";

// Update this function to support subject, order, and print type filters
export async function discoverBooks(
  startIndex: number = 0, 
  maxResults: number = 10,
  subject: SubjectFilter = "fiction",
  orderBy: OrderFilter = "relevance",
  printType: PrintTypeFilter = "all"
): Promise<any> {
  if (!GOOGLE_BOOKS_API_KEY) {
    console.error('Google Books API key is not configured');
    return { items: [], hasMore: false }; // Provide fallback data
  }
  
  try {
    // Construct the query - for magazines, we need a broader search
    let queryString = "";
    
    if (printType === "magazines") {
      // For magazines, use a more general search term
      queryString = `${subject}+magazine`;
    } else {
      // For books or all, use subject search
      queryString = `subject:${subject}`;
    }
    
    // For "newest" order, add a date parameter to ensure sorting works
    const orderParams = orderBy === "newest" 
      ? `&orderBy=newest&langRestrict=en`  // Add language restriction to improve newest sorting
      : `&orderBy=${orderBy}`;
    
    // Log what we're fetching for debugging
    console.log(`Fetching with query:${queryString}, orderBy:${orderBy}, printType:${printType}, startIndex:${startIndex}, maxResults:${maxResults}`);
    
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?` +
      `q=${encodeURIComponent(queryString)}` +
      orderParams +
      `&printType=${printType}` +
      `&startIndex=${startIndex}` +
      `&maxResults=${maxResults}` +
      `&key=${GOOGLE_BOOKS_API_KEY}`
    );
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Google Books API error:', errorData);
      throw new Error(`Failed to fetch discover books: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Add debug info for empty results
    if (!data.items || data.items.length === 0) {
      console.log(`No items found for query: ${queryString}, printType: ${printType}`);
    } else {
      console.log(`Found ${data.items.length} items of type ${printType}, orderBy: ${orderBy}`);
      
      // For debugging, log publication dates when ordering by newest
      if (orderBy === "newest" && data.items && data.items.length > 0) {
        console.log("Publication dates of first 3 items:");
        for (let i = 0; i < Math.min(3, data.items.length); i++) {
          const item = data.items[i];
          console.log(`Book ${i+1}: ${item.volumeInfo?.title} - Published: ${item.volumeInfo?.publishedDate}`);
        }
      }
    }
    
    // Calculate if there are more books to load
    const totalItems = data.totalItems || 0;
    const hasMore = (startIndex + (data.items?.length || 0)) < totalItems;
    
    return {
      ...data,
      hasMore
    };
  } catch (error) {
    console.error('Error fetching discover books:', error);
    return { items: [], hasMore: false }; // Provide fallback data on error
  }
}

export async function getBookDetails(bookId: string): Promise<any> {
  if (!GOOGLE_BOOKS_API_KEY) {
    console.error('Google Books API key is not configured');
    throw new Error('Google Books API key is not configured');
  }
  
  console.log(`Fetching details for book: ${bookId}`);
  
  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes/${bookId}?key=${GOOGLE_BOOKS_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch book details: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching book details:', error);
    throw error;
  }
}

// Add your other public action functions here