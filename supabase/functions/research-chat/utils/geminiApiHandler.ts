
// Helper functions for managing Gemini API calls with failover and rate limiting
const apiKeyRotator = {
  keys: [Deno.env.get("GEMINI_API_KEY"), Deno.env.get("GEMINI_API_KEY_2")].filter(Boolean),
  currentIndex: 0,
  lastCallTimestamps: new Map<string, number[]>(),
  rateLimitWindow: 60000, // 1 minute window
  maxCallsPerWindow: 50, // Maximum calls per minute per key

  getNextKey(): string | null {
    const startIndex = this.currentIndex;
    
    do {
      const key = this.keys[this.currentIndex];
      if (this.canUseKey(key)) {
        this.recordApiCall(key);
        return key;
      }
      
      this.currentIndex = (this.currentIndex + 1) % this.keys.length;
    } while (this.currentIndex !== startIndex);
    
    return null; // All keys are rate limited
  },

  canUseKey(key: string): boolean {
    if (!key) return false;
    
    const timestamps = this.lastCallTimestamps.get(key) || [];
    const now = Date.now();
    
    // Remove timestamps outside the window
    const recentCalls = timestamps.filter(
      timestamp => now - timestamp < this.rateLimitWindow
    );
    
    return recentCalls.length < this.maxCallsPerWindow;
  },

  recordApiCall(key: string) {
    const timestamps = this.lastCallTimestamps.get(key) || [];
    timestamps.push(Date.now());
    this.lastCallTimestamps.set(key, timestamps);
  }
};

export async function callGeminiWithRetry(url: string, requestBody: any, retries = 2) {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    const apiKey = apiKeyRotator.getNextKey();
    
    if (!apiKey) {
      throw new Error("All API keys are currently rate limited. Please try again later.");
    }
    
    try {
      console.log(`Attempt ${attempt + 1} with API key ending in ...${apiKey.slice(-4)}`);
      
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...requestBody,
          key: apiKey
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // Rate limit error - try next key
        if (response.status === 429) {
          console.log("Rate limit hit, trying next key...");
          continue;
        }
        
        throw new Error(`Gemini API error (${response.status}): ${errorText}`);
      }

      return await response.json();
      
    } catch (error) {
      console.error(`Error with API key ending in ...${apiKey.slice(-4)}:`, error);
      lastError = error;
      
      if (error.message.includes("quota exceeded") || error.message.includes("rate limit")) {
        continue; // Try next key
      }
      
      // For other errors, only retry if we have attempts left
      if (attempt < retries) {
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError || new Error("All API keys failed");
}
