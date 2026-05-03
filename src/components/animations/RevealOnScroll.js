'use client'

import { useEffect, useRef } from 'react'
import { motion, useInView, useAnimation } from 'framer-motion'

export default function RevealOnScroll({
  children,
  delay = 0,
  duration = 0.7,
  direction = 'up',
  distance = 40,
  className,
  style,
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px 0px' })
  const controls = useAnimation()

  const directionMap = {
    up:    { y: distance,  x: 0 },
    down:  { y: -distance, x: 0 },
    left:  { x: distance,  y: 0 },
    right: { x: -distance, y: 0 },
  }

  const from = directionMap[direction] || directionMap.up

  useEffect(() => {
    if (inView) {
      controls.start({
        opacity: 1,
        x: 0,
        y: 0,
        transition: {
          duration,
          delay,
          ease: [0.16, 1, 0.3, 1],
        },
      })
    }
  }, [inView, controls, delay, duration])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...from }}
      animate={controls}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  )
}
