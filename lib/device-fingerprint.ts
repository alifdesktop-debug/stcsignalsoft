export function generateDeviceFingerprint(): string {
  // Generate a unique device fingerprint based on browser/device characteristics
  const fingerprint = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: (navigator as any).deviceMemory,
    maxTouchPoints: navigator.maxTouchPoints,
    vendor: navigator.vendor,
    timestamp: new Date().getTime(),
  }

  // Create a simple hash from the fingerprint
  const fingerprintString = JSON.stringify(fingerprint)
  let hash = 0
  for (let i = 0; i < fingerprintString.length; i++) {
    const char = fingerprintString.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }

  return `DF-${Math.abs(hash).toString(36).toUpperCase()}`
}

export function getStoredDeviceFingerprint(uniqueCode: string): string | null {
  try {
    return localStorage.getItem(`device_fingerprint_${uniqueCode}`)
  } catch {
    return null
  }
}

export function storeDeviceFingerprint(uniqueCode: string, fingerprint: string): void {
  try {
    localStorage.setItem(`device_fingerprint_${uniqueCode}`, fingerprint)
  } catch {
    console.error("[v0] Failed to store device fingerprint")
  }
}

export function clearDeviceFingerprint(uniqueCode: string): void {
  try {
    localStorage.removeItem(`device_fingerprint_${uniqueCode}`)
  } catch {
    console.error("[v0] Failed to clear device fingerprint")
  }
}
