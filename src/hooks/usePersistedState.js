import { useState, useEffect } from 'react'

/**
 * Like useState, but persists the value in localStorage.
 *
 * @param {string} key - The localStorage key.
 * @param {*} defaultValue - Value to use when nothing is stored yet.
 * @param {object} [options]
 * @param {function} [options.serialize]   - How to convert state → string for storage. Default: JSON.stringify.
 * @param {function} [options.deserialize] - How to convert string → state when reading. Default: JSON.parse.
 */
function usePersistedState(
  key,
  defaultValue,
  { serialize = JSON.stringify, deserialize = JSON.parse } = {}
) {
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored !== null ? deserialize(stored) : defaultValue
    } catch {
      return defaultValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, serialize(state))
    } catch {
      // Silently ignore (e.g. private mode storage limits)
    }
  }, [key, state])

  return [state, setState]
}

export default usePersistedState
