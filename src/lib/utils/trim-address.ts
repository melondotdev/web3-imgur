/**
 * Trims a SUI address to show first n and last n characters with ellipsis in the middle
 * @param address The SUI address to trim
 * @param startLength Number of characters to show at start (default: 6)
 * @param endLength Number of characters to show at end (default: 4)
 * @returns Trimmed address string
 */
export function trimAddress(
  address: string,
  startLength = 6,
  endLength = 4,
): string {
  if (!address) {
    return '';
  }

  // Remove '0x' prefix for consistent handling
  const cleanAddress = address.startsWith('0x') ? address.slice(2) : address;

  if (cleanAddress.length <= startLength + endLength) {
    return address;
  }

  const start = address.slice(0, startLength + 2); // +2 to include '0x'
  const end = cleanAddress.slice(-endLength);

  return `${start}...${end}`;
}
