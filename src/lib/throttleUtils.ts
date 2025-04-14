// In-memory storage for server context
let apiCallsMemory = {
  count: 0,
  date: new Date().toDateString(),
  dailyLimit: 1000,
};

// Check if window is defined (client-side)
const isClient = typeof window !== 'undefined';

// Track API calls per day
function getAPICallsState() {
  // If running on server, use memory storage
  if (!isClient) {
    // Reset if date has changed
    if (apiCallsMemory.date !== new Date().toDateString()) {
      apiCallsMemory = {
        count: 0,
        date: new Date().toDateString(),
        dailyLimit: 1000,
      };
    }
    return apiCallsMemory;
  }
  
  // Client-side: Try to get from localStorage
  try {
    const storedState = localStorage.getItem('api-calls-state');
    
    if (storedState) {
      const state = JSON.parse(storedState);
      // Reset if date has changed
      if (state.date !== new Date().toDateString()) {
        const newState = {
          count: 0,
          date: new Date().toDateString(),
          dailyLimit: 1000,
        };
        localStorage.setItem('api-calls-state', JSON.stringify(newState));
        return newState;
      }
      return state;
    }
    
    // Default state if no stored state
    const defaultState = {
      count: 0,
      date: new Date().toDateString(),
      dailyLimit: 1000,
    };
    localStorage.setItem('api-calls-state', JSON.stringify(defaultState));
    return defaultState;
  } catch (e) {
    console.error("Error accessing localStorage:", e);
    // Fallback to in-memory if localStorage fails
    return apiCallsMemory;
  }
}

function saveAPICallsState(state: any) {
  // Update memory storage for server-side
  apiCallsMemory = state;
  
  // Update localStorage if on client side
  if (isClient) {
    try {
      localStorage.setItem('api-calls-state', JSON.stringify(state));
    } catch (e) {
      console.error("Error saving to localStorage:", e);
    }
  }
}

// Check if we're approaching our limit
export function canMakeApiCall() {
  const state = getAPICallsState();
  return state.count < state.dailyLimit;
}

// Track an API call
export function trackApiCall() {
  const state = getAPICallsState();
  
  state.count++;
  saveAPICallsState(state);
  
  // Log API usage statistics
  const remaining = state.dailyLimit - state.count;
  const percentUsed = (state.count / state.dailyLimit) * 100;
  
  if (percentUsed > 90) {
    console.warn(`WARNING: ${state.count}/${state.dailyLimit} API calls used (${percentUsed.toFixed(1)}%). Only ${remaining} calls remaining today.`);
  } else if (state.count % 50 === 0) {
    console.log(`API usage: ${state.count}/${state.dailyLimit} calls (${percentUsed.toFixed(1)}%)`);
  }
  
  return state.count;
}