// A simple batch manager to reduce API calls
let pendingOperations: {[key: string]: Promise<any>} = {};

// Batch operations by key
export function batchOperation<T>(key: string, operation: () => Promise<T>, ttl: number = 3000): Promise<T> {
  // If there's already a pending operation with this key, return it
  if (key in pendingOperations) {
    return pendingOperations[key] as Promise<T>;
  }
  
  // Otherwise, execute the operation
  const promise = operation();
  pendingOperations[key] = promise;
  
  // Remove from pending after completion or TTL
  Promise.race([
    promise.catch(() => {}), // Handle rejections
    new Promise(resolve => setTimeout(resolve, ttl))
  ]).then(() => {
    delete pendingOperations[key];
  });
  
  return promise;
}

// Batch GET requests
export async function batchFetch(url: string, options?: RequestInit): Promise<Response> {
  return batchOperation(`GET:${url}`, () => fetch(url, options));
}