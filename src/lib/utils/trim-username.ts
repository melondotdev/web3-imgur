export function trimUsername(username: string): string {
  if (!username) return '';
  
  // If it looks like a wallet address (0x... or similar)
  if (username.length > 20) {
    return `${username.slice(0, 6)}...${username.slice(-4)}`;
  }
  
  // For regular usernames, keep as is or trim if too long
  return username.length > 15 ? `${username.slice(0, 12)}...` : username;
} 