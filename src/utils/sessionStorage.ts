import { useEffect, useState } from 'react'

export function readSessionJson<T>(key: string, fallback: T): T {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) {
      return fallback
    }

    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeSessionJson<T>(key: string, value: T) {
  sessionStorage.setItem(key, JSON.stringify(value))
}

export function removeSessionJson(key: string) {
  sessionStorage.removeItem(key)
}

export function useSessionStorageState<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(() => readSessionJson(key, initialValue))

  useEffect(() => {
    writeSessionJson(key, state)
  }, [key, state])

  return [state, setState] as const
}
