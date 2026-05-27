import { useState, useEffect } from 'react'

function usePersistedState(
  key,
  defaultValue,
  { serialize = JSON.stringify, deserialize = JSON.parse } = {}
) {
  const [state, setState] = useState(() => {
    try {
      const stored = sessionStorage.getItem(key)
      return stored !== null ? deserialize(stored) : defaultValue
    } catch {
      return defaultValue
    }
  })

  useEffect(() => {
    try {
      sessionStorage.setItem(key, serialize(state))
    } catch {
      // Silently ignore (e.g. private mode storage limits)
    }
  }, [key, state])

  return [state, setState]
}

export default usePersistedState
