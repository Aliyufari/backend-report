import { useEffect, useState } from "react"

export function useCounter(target: number, duration = 1000) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const increment = target / (duration / 16)
    const counter = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(counter)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(counter)
  }, [target, duration])

  return count.toLocaleString()
}