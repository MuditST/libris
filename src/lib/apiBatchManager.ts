
let pendingOperations: {[key: string]: Promise<any>} = {};


export function batchOperation<T>(key: string, operation: () => Promise<T>, ttl: number = 3000): Promise<T> {
 
  if (key in pendingOperations) {
    return pendingOperations[key] as Promise<T>;
  }
  
  const promise = operation();
  pendingOperations[key] = promise;
  

  Promise.race([
    promise.catch(() => {}), 
    new Promise(resolve => setTimeout(resolve, ttl))
  ]).then(() => {
    delete pendingOperations[key];
  });
  
  return promise;
}


export async function batchFetch(url: string, options?: RequestInit): Promise<Response> {
  return batchOperation(`GET:${url}`, () => fetch(url, options));
}