import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react'

/**
 * FrameBorder component - React Bits Pro specification
 * A crisp, glowing animated border that frames any content with canvas-rendered light flow,
 * corner radiance, and click-triggered dual pulse waves.
 */
export const FrameBorder = forwardRef(function FrameBorder(
  {
    children,
    radius = 16,
    lineWidth = 1.5,
    glow = 0.7,
    glowWidth = 14,
    flowSpeed = 1,
    accentColor = '#3b82f6',
    baseBorderColor = 'rgba(255, 255, 255, 0.12)',
    beamLength = 0.22, // fraction of perimeter
    interactive = true,
    paused = false,
    className = '',
    style = {},
    ...props
  },
  ref
) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const pulsesRef = useRef([])
  const isHoveredRef = useRef(false)

  // Imperative handle for ref access
  useImperativeHandle(ref, () => ({
    pulse: (x, y) => triggerPulse(x, y),
    replay: () => {
      // resets animation phase
    }
  }))

  const triggerPulse = (clientX, clientY) => {
    if (!canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const x = clientX !== undefined ? clientX - rect.left : rect.width / 2
    const y = clientY !== undefined ? clientY - rect.top : 0
    pulsesRef.current.push({
      x,
      y,
      progress: 0,
      opacity: 1
    })
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId
    let width = 0
    let height = 0
    let phase = 0

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isPaused = paused || prefersReducedMotion

    const updateSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = container.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const resizeObserver = new ResizeObserver(() => updateSize())
    resizeObserver.observe(container)
    updateSize()

    // Perimeter coordinate mapping along rounded rectangle
    const getPointOnPerimeter = (t, w, h, r) => {
      // clamp r
      r = Math.min(r, w / 2, h / 2)
      const straightH = w - 2 * r
      const straightV = h - 2 * r
      const corner = 0.5 * Math.PI * r
      const total = 2 * straightH + 2 * straightV + 4 * corner
      if (total <= 0) return { x: 0, y: 0 }

      let dist = (t % 1) * total
      if (dist < 0) dist += total

      // 1. Top edge: (r, 0) -> (w - r, 0)
      if (dist < straightH) {
        return { x: r + dist, y: 0 }
      }
      dist -= straightH

      // 2. Top-right arc: center (w - r, r)
      if (dist < corner) {
        const a = -Math.PI / 2 + dist / r
        return { x: w - r + Math.cos(a) * r, y: r + Math.sin(a) * r }
      }
      dist -= corner

      // 3. Right edge: (w, r) -> (w, h - r)
      if (dist < straightV) {
        return { x: w, y: r + dist }
      }
      dist -= straightV

      // 4. Bottom-right arc: center (w - r, h - r)
      if (dist < corner) {
        const a = dist / r
        return { x: w - r + Math.cos(a) * r, y: h - r + Math.sin(a) * r }
      }
      dist -= corner

      // 5. Bottom edge: (w - r, h) -> (r, h)
      if (dist < straightH) {
        return { x: w - r - dist, y: h }
      }
      dist -= straightH

      // 6. Bottom-left arc: center (r, h - r)
      if (dist < corner) {
        const a = Math.PI / 2 + dist / r
        return { x: r + Math.cos(a) * r, y: h - r + Math.sin(a) * r }
      }
      dist -= corner

      // 7. Left edge: (0, h - r) -> (0, r)
      if (dist < straightV) {
        return { x: 0, y: h - r - dist }
      }
      dist -= straightV

      // 8. Top-left arc: center (r, r)
      const a = Math.PI + dist / r
      return { x: r + Math.cos(a) * r, y: r + Math.sin(a) * r }
    }

    const drawRoundedRectPath = (w, h, r) => {
      r = Math.min(r, w / 2, h / 2)
      ctx.beginPath()
      ctx.moveTo(r, 0)
      ctx.lineTo(w - r, 0)
      ctx.arcTo(w, 0, w, r, r)
      ctx.lineTo(w, h - r)
      ctx.arcTo(w, h, w - r, h, r)
      ctx.lineTo(r, h)
      ctx.arcTo(0, h, 0, h - r, r)
      ctx.lineTo(0, r)
      ctx.arcTo(0, 0, r, 0, r)
      ctx.closePath()
    }

    let lastTime = performance.now()

    const render = (time) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1)
      lastTime = time

      if (width <= 0 || height <= 0) {
        animationFrameId = requestAnimationFrame(render)
        return
      }

      ctx.clearRect(0, 0, width, height)

      const effectiveRadius = Math.max(0, radius)

      // 1. Base hairline frame
      ctx.save()
      drawRoundedRectPath(width, height, effectiveRadius)
      ctx.strokeStyle = baseBorderColor
      ctx.lineWidth = lineWidth
      ctx.stroke()
      ctx.restore()

      if (!isPaused) {
        const currentSpeed = (isHoveredRef.current ? flowSpeed * 2.2 : flowSpeed) * 0.18
        phase = (phase + dt * currentSpeed) % 1

        // 2. Traveling glowing beam
        ctx.save()
        const steps = 36
        const activeRadius = effectiveRadius

        for (let i = 0; i < steps; i++) {
          const t = i / steps
          const p1 = (phase - (1 - t) * beamLength + 1) % 1
          const p2 = (p1 + (1 / steps) * beamLength) % 1

          const pt1 = getPointOnPerimeter(p1, width, height, activeRadius)
          const pt2 = getPointOnPerimeter(p2, width, height, activeRadius)

          const alpha = Math.pow(t, 2.5) * glow

          ctx.beginPath()
          ctx.moveTo(pt1.x, pt1.y)
          ctx.lineTo(pt2.x, pt2.y)
          ctx.strokeStyle = accentColor
          ctx.lineWidth = lineWidth * (1 + t * 0.8)
          ctx.globalAlpha = alpha

          // Head has stronger glow
          if (i > steps - 6) {
            ctx.shadowColor = accentColor
            ctx.shadowBlur = glowWidth * (t * 1.2)
          }

          ctx.stroke()
        }
        ctx.restore()

        // 3. Render any active click pulse waves
        if (pulsesRef.current.length > 0) {
          ctx.save()
          pulsesRef.current = pulsesRef.current.filter((pulse) => {
            pulse.progress += dt * 1.5
            pulse.opacity = Math.max(0, 1 - pulse.progress)

            if (pulse.opacity <= 0) return false

            const waveRadius = pulse.progress * Math.max(width, height) * 0.6
            ctx.beginPath()
            ctx.arc(pulse.x, pulse.y, waveRadius, 0, Math.PI * 2)
            ctx.strokeStyle = accentColor
            ctx.lineWidth = lineWidth * 2.5
            ctx.globalAlpha = pulse.opacity * 0.75
            ctx.shadowColor = accentColor
            ctx.shadowBlur = glowWidth * 1.5
            ctx.stroke()

            return true
          })
          ctx.restore()
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    animationFrameId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animationFrameId)
      resizeObserver.disconnect()
    }
  }, [radius, lineWidth, glow, glowWidth, flowSpeed, accentColor, baseBorderColor, beamLength, paused])

  const handleClick = (e) => {
    if (interactive) {
      triggerPulse(e.clientX, e.clientY)
    }
  }

  const handleMouseEnter = () => {
    if (interactive) {
      isHoveredRef.current = true
    }
  }

  const handleMouseLeave = () => {
    if (interactive) {
      isHoveredRef.current = false
    }
  }

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative ${interactive ? 'cursor-pointer' : ''} ${className}`}
      style={{
        borderRadius: `${radius}px`,
        ...style
      }}
      {...props}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-10"
        style={{ borderRadius: `${radius}px` }}
      />
      <div className="relative z-0 h-full w-full">
        {children}
      </div>
    </div>
  )
})

export default FrameBorder

