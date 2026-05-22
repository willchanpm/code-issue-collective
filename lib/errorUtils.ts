// Turns messy errors (objects, API responses, etc.) into plain text for the UI.
export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    // Some libraries do `throw new Error(someObject)` which becomes "[object Object]".
    if (error.message === '[object Object]' || error.message === 'object Object') {
      return fallback
    }

    return error.message || fallback
  }

  if (typeof error === 'string') {
    return error || fallback
  }

  if (error && typeof error === 'object') {
    const record = error as Record<string, unknown>

    // Common API shapes: { message: "..." }, { error: "..." }, or { error: { message: "..." } }
    if (typeof record.message === 'string' && record.message) {
      return record.message
    }

    if (typeof record.error === 'string' && record.error) {
      return record.error
    }

    if (record.error && typeof record.error === 'object') {
      const nested = record.error as Record<string, unknown>
      if (typeof nested.message === 'string' && nested.message) {
        return nested.message
      }
    }

    try {
      return JSON.stringify(error)
    } catch {
      return fallback
    }
  }

  return fallback
}
