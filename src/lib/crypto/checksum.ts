/**
 * Compute the SHA-256 hash of a Blob using the Web Crypto API.
 * Returns an uppercase hex string for comparison with backend checksums.
 */
export async function computeSha256(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase()
}

/**
 * Compare two hex-encoded checksums in a case-insensitive manner.
 */
export function checksumsMatch(expected: string, actual: string): boolean {
  return expected.toUpperCase() === actual.toUpperCase()
}
