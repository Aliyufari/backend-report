import { useEffect, useRef, useState } from "react"

/**
 * Returns a ref to attach to the chart wrapper div, and a boolean
 * that is true only once the container has a measurable width > 0.
 * This prevents Recharts from rendering with width=-1 on first paint.
 */
export function useChart() {
  const ref = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Already has size
    if (el.getBoundingClientRect().width > 0) {
      setReady(true)
      return
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setReady(true)
          observer.disconnect()
        }
      }
    })

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, ready }
}