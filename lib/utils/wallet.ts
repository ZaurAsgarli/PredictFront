/**
 * Wallet address utilities for security and privacy
 * SINGLE SOURCE OF TRUTH for all address rendering
 * Ensures wallet addresses are not exposed publicly
 */

/**
 * Shorten wallet address for public display
 * @param address - Full wallet address (0x...)
 * @param startChars - Number of characters to show at start (default: 6)
 * @param endChars - Number of characters to show at end (default: 4)
 * @returns Shortened address like "0x1234...abcd"
 */
export function shortenAddress(
  address: string | null | undefined,
  startChars: number = 6,
  endChars: number = 4
): string {
  if (!address || !address.startsWith('0x')) {
    return '';
  }
  
  if (address.length <= startChars + endChars) {
    return address;
  }
  
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Render address based on context - SINGLE SOURCE OF TRUTH
 * @param address - Full wallet address
 * @param context - Display context ('public' | 'admin')
 * @returns Formatted address
 * 
 * Rules:
 * - "public" → ALWAYS shortened
 * - "admin" → full address allowed
 * - No other formatting allowed
 */
export function renderAddress(
  address: string | null | undefined,
  context: 'public' | 'admin' = 'public'
): string {
  if (!address) {
    return '';
  }
  
  // Admin context: full address allowed
  if (context === 'admin') {
    return address;
  }
  
  // Public context: ALWAYS shortened
  return shortenAddress(address);
}

/**
 * Validate Ethereum address format
 */
export function isValidAddress(address: string | null | undefined): boolean {
  if (!address) return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}
