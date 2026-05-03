'use client'

import { useState, useEffect } from 'react'
import { animate } from 'framer-motion'

export default function Counter({ value, delay = 1.2 }) {
  const [displayValue, setDisplayValue] = useState(0)
  const numericValue = parseInt(value.replace(/[^0-9]/g, '')) || 0
  const suffix = value.replace(/[0-9]/g, '')

  useEffect(() => {
    const controls = animate(0, numericValue, { 
      duration: 2, 
      ease: [0.16, 1, 0.3, 1],
      delay,
      onUpdate: (val) => setDisplayValue(Math.round(val))
    })
    return controls.stop
  }, [numericValue, delay])

  return (
    <span>
      {displayValue}{suffix}
    </span>
  )
}
