
// Helper functions for managing Gemini API calls with failover and rate limiting
const apiKeyRotator = {
  keys: [Deno.env.get("GEMINI_API_KEY"), Deno.env.get("GEMINI_API_KEY_2")].filter(Boolean),
  currentIndex: 0,
  lastCallTimestamps: new Map<string, number[]>(),
  rateLimitWindow: 60000, // 1 minute window
  maxCallsPerWindow: 40, // Reduced from 50 to be more conservative
  
  // Track keys currently in cooldown due to rate limiting
  cooldownKeys: new Map<string, number>(),

  getNextKey(): string | null {
    if (this.keys.length === 0) {
      console.error("No API keys available");
      return null;
    }
    
    const startIndex = this.currentIndex;
    let attempts = 0;
    
    do {
      const key = this.keys[this.currentIndex];
      
      // Check if key is in cooldown
      const cooldownUntil = this.cooldownKeys.get(key);
      if (cooldownUntil && Date.now() < cooldownUntil) {
        console.log(`API key ending in ...${key?.slice(-4)} is in cooldown for ${Math.ceil((cooldownUntil - Date.now()) / 1000)}s`);
        this.currentIndex = (this.currentIndex + 1) % this.keys.length;
        attempts++;
        continue;
      }
      
      // Remove expired cooldown
      if (cooldownUntil) {
        this.cooldownKeys.delete(key);
      }
      
      if (this.canUseKey(key)) {
        this.recordApiCall(key);
        return key;
      }
      
      this.currentIndex = (this.currentIndex + 1) % this.keys.length;
      attempts++;
    } while (attempts < this.keys.length);
    
    console.log("All API keys are currently rate limited or in cooldown");
    return this.keys[startIndex]; // Return the first key anyway, we'll handle the rate limit error
  },

  canUseKey(key: string): boolean {
    if (!key) return false;
    
    const timestamps = this.lastCallTimestamps.get(key) || [];
    const now = Date.now();
    
    // Remove timestamps outside the window
    const recentCalls = timestamps.filter(
      timestamp => now - timestamp < this.rateLimitWindow
    );
    
    this.lastCallTimestamps.set(key, recentCalls);
    return recentCalls.length < this.maxCallsPerWindow;
  },

  recordApiCall(key: string) {
    const timestamps = this.lastCallTimestamps.get(key) || [];
    timestamps.push(Date.now());
    this.lastCallTimestamps.set(key, timestamps);
  },
  
  // Set a key in cooldown after a rate limit error
  setCooldown(key: string, seconds: number) {
    const cooldownUntil = Date.now() + (seconds * 1000);
    this.cooldownKeys.set(key, cooldownUntil);
    console.log(`Setting API key ending in ...${key.slice(-4)} in cooldown for ${seconds}s until ${new Date(cooldownUntil).toISOString()}`);
  },
  
  // Get number of available keys (not in cooldown)
  getAvailableKeyCount(): number {
    const now = Date.now();
    return this.keys.filter(key => {
      const cooldownUntil = this.cooldownKeys.get(key);
      return !cooldownUntil || now >= cooldownUntil;
    }).length;
  }
};

export async function callGeminiWithRetry(url: string, requestBody: any, retries = 3) {
  let lastError: Error | null = null;
  let apiKey: string | null = null;
  
  // Fix topK parameter if present and too large
  if (requestBody.generationConfig?.topK && requestBody.generationConfig.topK > 40) {
    console.log(`Adjusting topK from ${requestBody.generationConfig.topK} to 40 (maximum allowed)`);
    requestBody.generationConfig.topK = 40;
  }
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    // Exponential backoff for retries
    if (attempt > 0) {
      const backoffMs = Math.min(Math.pow(2, attempt) * 1000, 10000);
      console.log(`Retry attempt ${attempt} of ${retries}, backing off for ${backoffMs}ms`);
      await new Promise(resolve => setTimeout(resolve, backoffMs));
    }
    
    apiKey = apiKeyRotator.getNextKey();
    
    if (!apiKey) {
      throw new Error(`All API keys are currently rate limited. Please try again in a minute.`);
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
        const status = response.status;
        let errorText = await response.text();
        let cooldownDuration = 60; // Default cooldown
        
        // Parse the error response for more details
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.error?.details) {
            // Try to extract retry delay information
            for (const detail of errorJson.error.details) {
              if (detail["@type"] === "type.googleapis.com/google.rpc.RetryInfo" && detail.retryDelay) {
                const retryDelay = detail.retryDelay.match(/(\d+)s/);
                if (retryDelay && retryDelay[1]) {
                  cooldownDuration = parseInt(retryDelay[1], 10);
                }
              }
            }
          }
        } catch (e) {
          // Ignore JSON parsing errors
        }
        
        // Handle rate limiting (429)
        if (status === 429) {
          console.log(`Rate limit hit for API key ending in ...${apiKey.slice(-4)}, setting cooldown for ${cooldownDuration}s`);
          apiKeyRotator.setCooldown(apiKey, cooldownDuration);
          
          // Only continue if we have other keys available
          if (apiKeyRotator.getAvailableKeyCount() > 0) {
            continue;
          } else {
            throw new Error(`Rate limit exceeded for all API keys. Please try again in ${cooldownDuration} seconds.`);
          }
        }
        
        // For other errors, throw with details
        throw new Error(`Gemini API error (${status}): ${errorText}`);
      }

      return await response.json();
      
    } catch (error) {
      console.error(`Error with API key ending in ...${apiKey.slice(-4)}:`, error);
      lastError = error;
      
      // Special handling for certain error messages
      const errorMessage = error.message?.toLowerCase() || '';
      if (
        errorMessage.includes("quota exceeded") || 
        errorMessage.includes("rate limit") || 
        errorMessage.includes("resource exhausted")
      ) {
        // Apply cooldown to this key
        apiKeyRotator.setCooldown(apiKey, 60);
        
        // Only continue if we have other keys available
        if (apiKeyRotator.getAvailableKeyCount() > 0) {
          continue;
        }
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
