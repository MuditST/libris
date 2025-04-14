// Global counter for API calls in the current session
let apiCallCount = 0;

// Wrapper around fetch that logs and tracks API calls
export async function fetch(url: string, options?: RequestInit): Promise<Response> {
  // Increment counter
  apiCallCount++;
  
  // Log call info
  console.log(`Google API Call #${apiCallCount}: ${url.split('?')[0]}`);
  
  // Make the actual fetch call
  return window.fetch(url, options);
}

// Standard fetch but without tracking
export async function safeFetch(url: string, options?: RequestInit): Promise<Response> {
  return window.fetch(url, options);
}