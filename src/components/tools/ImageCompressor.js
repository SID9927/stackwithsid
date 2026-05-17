'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, Download, RefreshCw, Sliders, Eye, Zap, 
  Sparkles, CheckCircle2, ChevronRight, FileImage, 
  Trash2, Settings, AlertCircle, Info, Maximize, FileDown
} from 'lucide-react'

// Supported Output Formats
const OUTPUT_FORMATS = [
  { label: 'WebP (Recommended)', value: 'image/webp', ext: 'webp' },
  { label: 'JPEG (High Comp.)', value: 'image/jpeg', ext: 'jpg' },
  { label: 'PNG (Lossless)', value: 'image/png', ext: 'png' },
]

export default function ImageCompressor() {
  // Modes: 'single' | 'batch'
  const [mode, setMode] = useState('single')
  
  // Single Mode State
  const [file, setFile] = useState(null)
  const [originalUrl, setOriginalUrl] = useState(null)
  const [compressedUrl, setCompressedUrl] = useState(null)
  const [originalSize, setOriginalSize] = useState(0)
  const [compressedSize, setCompressedSize] = useState(0)
  const [imageDims, setImageDims] = useState({ w: 0, h: 0 })
  const [compDims, setCompDims] = useState({ w: 0, h: 0 })
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Custom Settings
  const [format, setFormat] = useState('image/webp')
  const [compMethod, setCompMethod] = useState('balanced') // 'balanced' | 'lossless' | 'target'
  const [quality, setQuality] = useState(75) // 1 - 100
  const [targetSize, setTargetSize] = useState(50) // KB
  const [scale, setScale] = useState(100) // 10 - 100 %
  
  // Interactive Slider
  const [sliderPos, setSliderPos] = useState(50)
  const isDraggingSlider = useRef(false)
  const sliderRef = useRef(null)

  // Batch Mode State
  const [batchFiles, setBatchFiles] = useState([])
  
  const fileInputRef = useRef(null)

  const originalUrlRef = useRef(originalUrl)
  const compressedUrlRef = useRef(compressedUrl)

  // Track latest URLs in refs for safe unmount cleanup
  useEffect(() => {
    originalUrlRef.current = originalUrl
    compressedUrlRef.current = compressedUrl
  }, [originalUrl, compressedUrl])

  // Clean up Object URLs only on unmount to prevent leaks
  useEffect(() => {
    return () => {
      if (originalUrlRef.current) URL.revokeObjectURL(originalUrlRef.current)
      if (compressedUrlRef.current) URL.revokeObjectURL(compressedUrlRef.current)
    }
  }, [])

  // Single File Upload Handler
  const handleFileChange = (e) => {
    const selected = e.target.files?.[0]
    if (selected) {
      processSelectedFile(selected)
    }
  }

  const processSelectedFile = (selectedFile) => {
    if (!selectedFile.type.startsWith('image/')) {
      alert('Please upload an image file.')
      return
    }
    
    // Revoke previous
    if (originalUrl) URL.revokeObjectURL(originalUrl)
    if (compressedUrl) {
      URL.revokeObjectURL(compressedUrl)
      setCompressedUrl(null)
    }

    setFile(selectedFile)
    setOriginalSize(selectedFile.size)
    
    const url = URL.createObjectURL(selectedFile)
    setOriginalUrl(url)

    // Read Dimensions
    const img = new Image()
    img.onload = () => {
      setImageDims({ w: img.width, h: img.height })
      setCompDims({ w: img.width, h: img.height })
    }
    img.src = url
  }

  // Drag and Drop
  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const selected = e.dataTransfer.files?.[0]
    if (selected) {
      processSelectedFile(selected)
    }
  }

  // Adaptive Quality Matcher using Binary Search
  const runAdaptiveCompression = async (canvas, mimeType, targetBytes) => {
    let minQ = 0.05
    let maxQ = 0.98
    let bestBlob = null
    let bestSizeDiff = Infinity

    // Maximum 7 iterations for speed and optimization
    for (let i = 0; i < 7; i++) {
      const currentQ = (minQ + maxQ) / 2
      const blob = await new Promise((resolve) => {
        canvas.toBlob((b) => resolve(b), mimeType, currentQ)
      })

      if (!blob) break

      const diff = blob.size - targetBytes
      if (Math.abs(diff) < Math.abs(bestSizeDiff)) {
        bestBlob = blob
        bestSizeDiff = diff
      }

      if (blob.size > targetBytes) {
        maxQ = currentQ // Size too large, decrease quality
      } else {
        minQ = currentQ // Size fits, try higher quality
      }
    }
    return bestBlob
  }

  // Core Compression logic
  const handleCompress = async () => {
    if (!originalUrl || !file) return
    setIsProcessing(true)

    try {
      const img = new Image()
      await new Promise((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = (err) => reject(err)
        img.src = originalUrl
      })

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      // Calculate new scaled dimensions
      const factor = scale / 100
      const newWidth = Math.round(img.width * factor)
      const newHeight = Math.round(img.height * factor)

      canvas.width = newWidth
      canvas.height = newHeight
      
      // Draw image on canvas
      ctx.drawImage(img, 0, 0, newWidth, newHeight)
      setCompDims({ w: newWidth, h: newHeight })

      let compressedBlob = null

      if (compMethod === 'lossless') {
        // High quality lossless PNG or equivalent
        compressedBlob = await new Promise((resolve) => {
          canvas.toBlob((b) => resolve(b), 'image/png')
        })
      } else if (compMethod === 'target') {
        // Target size matching
        const targetBytes = targetSize * 1024
        compressedBlob = await runAdaptiveCompression(canvas, format, targetBytes)
      } else {
        // Balanced Lossy Compression
        compressedBlob = await new Promise((resolve) => {
          canvas.toBlob((b) => resolve(b), format, quality / 100)
        })
      }

      if (compressedBlob) {
        if (compressedUrl) URL.revokeObjectURL(compressedUrl)
        setCompressedSize(compressedBlob.size)
        setCompressedUrl(URL.createObjectURL(compressedBlob))
      }
    } catch (err) {
      console.error('Compression failed:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  // Trigger compression automatically when options change
  useEffect(() => {
    if (file) {
      handleCompress()
    }
  }, [format, compMethod, quality, targetSize, scale, file])

  // Custom Split Slider Logic
  const handleSliderMove = (clientX) => {
    if (!sliderRef.current) return
    const rect = sliderRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSliderPos(percent)
  }

  const handleTouchMove = (e) => {
    if (e.touches[0]) {
      handleSliderMove(e.touches[0].clientX)
    }
  }

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const savingsPercent = originalSize && compressedSize 
    ? parseFloat((((originalSize - compressedSize) / originalSize) * 100).toFixed(1))
    : 0

  // Download individual compressed image
  const handleDownload = () => {
    if (!compressedUrl) return
    const link = document.createElement('a')
    const currentExt = OUTPUT_FORMATS.find(f => f.value === format)?.ext || 'webp'
    const originalName = file.name.substring(0, file.name.lastIndexOf('.'))
    link.download = `${originalName}_optimized.${currentExt}`
    link.href = compressedUrl
    link.click()
  }

  // Batch Mode Operations
  const handleBatchUpload = (e) => {
    const files = Array.from(e.target.files || [])
    const imageFiles = files.filter(f => f.type.startsWith('image/'))
    
    const newItems = imageFiles.map(f => ({
      id: Math.random().toString(36).substring(7),
      file: f,
      name: f.name,
      size: f.size,
      status: 'idle', // 'idle', 'compressing', 'success', 'failed'
      compressedSize: 0,
      savings: 0,
      blobUrl: null,
    }))

    setBatchFiles(prev => [...prev, ...newItems])
  }

  const removeBatchFile = (id) => {
    setBatchFiles(prev => {
      const item = prev.find(i => i.id === id)
      if (item?.blobUrl) URL.revokeObjectURL(item.blobUrl)
      return prev.filter(i => i.id !== id)
    })
  }

  // Batch compression process
  const runBatchCompression = async () => {
    const updated = [...batchFiles]
    
    for (let i = 0; i < updated.length; i++) {
      const item = updated[i]
      if (item.status === 'success') continue

      item.status = 'compressing'
      setBatchFiles([...updated])

      const tempUrl = URL.createObjectURL(item.file)
      try {
        const img = new Image()
        await new Promise((resolve, reject) => {
          img.onload = () => resolve()
          img.onerror = (err) => reject(err)
          img.src = tempUrl
        })

        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const factor = scale / 100
        const newWidth = Math.round(img.width * factor)
        const newHeight = Math.round(img.height * factor)
        canvas.width = newWidth
        canvas.height = newHeight
        ctx.drawImage(img, 0, 0, newWidth, newHeight)
        URL.revokeObjectURL(tempUrl)

        let compressedBlob = null
        if (compMethod === 'lossless') {
          compressedBlob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'))
        } else if (compMethod === 'target') {
          const targetBytes = targetSize * 1024
          compressedBlob = await runAdaptiveCompression(canvas, format, targetBytes)
        } else {
          compressedBlob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b), format, quality / 100))
        }

        if (compressedBlob) {
          item.compressedSize = compressedBlob.size
          item.savings = parseFloat((((item.size - compressedBlob.size) / item.size) * 100).toFixed(1))
          item.blobUrl = URL.createObjectURL(compressedBlob)
          item.status = 'success'
        } else {
          item.status = 'failed'
        }
      } catch (err) {
        console.error(err)
        item.status = 'failed'
      }

      setBatchFiles([...updated])
    }
  }

  const downloadAllBatch = () => {
    batchFiles.forEach(item => {
      if (item.status === 'success' && item.blobUrl) {
        const link = document.createElement('a')
        const currentExt = OUTPUT_FORMATS.find(f => f.value === format)?.ext || 'webp'
        const originalName = item.name.substring(0, item.name.lastIndexOf('.'))
        link.download = `${originalName}_optimized.${currentExt}`
        link.href = item.blobUrl
        link.click()
      }
    })
  }

  const clearAllBatch = () => {
    batchFiles.forEach(item => {
      if (item.blobUrl) URL.revokeObjectURL(item.blobUrl)
    })
    setBatchFiles([])
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 24px' }}>
      
      {/* Premium Header */}
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: 'rgba(124, 58, 237, 0.1)', border: '1px solid rgba(124, 58, 237, 0.25)', borderRadius: 999, marginBottom: 16 }}>
          <Sparkles size={14} className="text-accent" style={{ color: 'var(--accent)' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-soft)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>100% Client-Side</span>
        </div>
        <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 800, marginBottom: 12, lineHeight: 1.1 }}>
          Universal{' '}
          <span style={{ background: 'var(--gradient-purple)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Image Compressor
          </span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.6 }}>
          Optimize, resize, and convert your developer images securely in the browser. Zero server uploads, instant speeds, and max performance.
        </p>
      </div>

      {/* Mode Switches */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 14, padding: 6, display: 'flex', gap: 6 }}>
          <button 
            onClick={() => setMode('single')}
            style={{
              padding: '10px 24px', borderRadius: 10, border: 'none', minHeight: 40, fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              background: mode === 'single' ? 'var(--gradient-purple)' : 'transparent',
              color: mode === 'single' ? '#fff' : 'var(--text-muted)'
            }}
          >
            Single Optimization
          </button>
          <button 
            onClick={() => setMode('batch')}
            style={{
              padding: '10px 24px', borderRadius: 10, border: 'none', minHeight: 40, fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              background: mode === 'batch' ? 'var(--gradient-purple)' : 'transparent',
              color: mode === 'batch' ? '#fff' : 'var(--text-muted)'
            }}
          >
            Batch Compression ({batchFiles.length})
          </button>
        </div>
      </div>

      {/* Main Grid Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32, alignItems: 'start' }}>
        
        {/* Left Side: Settings Panel */}
        <div className="glass-card" style={{ padding: 32, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 24, boxShadow: 'var(--shadow-card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <div style={{ padding: 8, background: 'rgba(124, 58, 237, 0.1)', borderRadius: 10, color: 'var(--accent)' }}>
              <Settings size={20} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Optimization Engine Settings</h2>
          </div>

          {/* Compress Mode Select */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Compression Method</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {['balanced', 'lossless', 'target'].map((method) => (
                <button
                  key={method}
                  onClick={() => setCompMethod(method)}
                  style={{
                    padding: '12px 6px', borderRadius: 12, border: '1px solid', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                    background: compMethod === method ? 'rgba(124, 58, 237, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                    borderColor: compMethod === method ? 'var(--accent)' : 'var(--border-subtle)',
                    color: compMethod === method ? 'var(--accent-soft)' : 'var(--text-muted)'
                  }}
                >
                  {method === 'balanced' ? 'Balanced' : method === 'lossless' ? 'Lossless' : 'Target Size'}
                </button>
              ))}
            </div>
          </div>

          {/* Output Format Select (Hidden when lossless is selected, since lossless falls back to PNG) */}
          {compMethod !== 'lossless' && (
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Export Format</label>
              <select 
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 12, background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', outline: 'none', cursor: 'pointer', fontSize: '0.9rem'
                }}
              >
                {OUTPUT_FORMATS.map(f => (
                  <option key={f.value} value={f.value} style={{ background: 'var(--bg-card)' }}>{f.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Custom Sliders based on method */}
          {compMethod === 'balanced' && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Compression Quality</label>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-soft)' }}>{quality}%</span>
              </div>
              <input 
                type="range" min="1" max="100" value={quality} onChange={(e) => setQuality(Number(e.target.value))}
                style={{ width: '100%', height: 6, accentColor: 'var(--accent)', cursor: 'pointer', borderRadius: 999 }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>Max Compression</span>
                <span>Best Quality</span>
              </div>
            </div>
          )}

          {compMethod === 'target' && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Target File Size</label>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-soft)' }}>{targetSize} KB</span>
              </div>
              <input 
                type="range" min="5" max="1000" step="5" value={targetSize} onChange={(e) => setTargetSize(Number(e.target.value))}
                style={{ width: '100%', height: 6, accentColor: 'var(--accent)', cursor: 'pointer', borderRadius: 999 }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>5 KB (Tiny)</span>
                <span>1 MB (Large)</span>
              </div>
            </div>
          )}

          {/* Scale Dimension Controls */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Scale Resolution</label>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-soft)' }}>{scale}%</span>
            </div>
            <input 
              type="range" min="10" max="100" value={scale} onChange={(e) => setScale(Number(e.target.value))}
              style={{ width: '100%', height: 6, accentColor: 'var(--accent)', cursor: 'pointer', borderRadius: 999 }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>10% (Mini)</span>
              <span>100% (Original)</span>
            </div>
          </div>

          <div style={{ padding: '16px', background: 'rgba(124, 58, 237, 0.04)', border: '1px solid rgba(124, 58, 237, 0.1)', borderRadius: 16 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <Info size={16} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {compMethod === 'lossless' 
                  ? 'Lossless compression preserves absolute pixel fidelity. Best for web design assets, UI icons, and technical diagrams.' 
                  : compMethod === 'target' 
                    ? 'Target size uses a dynamic browser search compression loop to squeeze the image within your size constraint.'
                    : 'Balanced lossy compression matches modern standards with human eye limits for extremely tiny footprint web pages.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Upload / Sandbox / Viewport Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {mode === 'single' ? (
            <>
              {/* Dropzone */}
              {!file ? (
                <div 
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current.click()}
                  style={{
                    border: '2px dashed var(--border-mid)', borderRadius: 24, padding: '80px 40px', textAlign: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.01)', transition: 'all 0.3s ease', display: 'flex', flexDirection: 'column', alignItems: 'center'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'rgba(124, 58, 237, 0.03)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-mid)'; e.currentTarget.style.background = 'rgba(255,255,255,0.01)' }}
                >
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
                  <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(124, 58, 237, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, color: 'var(--accent)' }}>
                    <Upload size={28} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8 }}>Drag & drop your image here</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 0 }}>Supports JPG, PNG, WebP, AVIF, GIF, BMP, TIFF up to 25MB</p>
                </div>
              ) : (
                /* Interactive Split Screen Sandbox */
                <div className="glass-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRadius: 24, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                  
                  {/* Title and stats header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <FileImage size={20} style={{ color: 'var(--accent)' }} />
                      <div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{imageDims.w}x{imageDims.h}px</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        setFile(null)
                        setOriginalUrl(null)
                        setCompressedUrl(null)
                      }}
                      style={{
                        padding: '6px 12px', borderRadius: 8, border: 'none', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
                      }}
                    >
                      <Trash2 size={13} /> Reset
                    </button>
                  </div>

                  {/* Split Screen Image Slider */}
                  <div 
                    ref={sliderRef}
                    onMouseMove={(e) => isDraggingSlider.current && handleSliderMove(e.clientX)}
                    onTouchMove={handleTouchMove}
                    onMouseDown={(e) => { e.preventDefault(); isDraggingSlider.current = true }}
                    onMouseUp={() => isDraggingSlider.current = false}
                    onMouseLeave={() => isDraggingSlider.current = false}
                    onTouchStart={() => isDraggingSlider.current = true}
                    onTouchEnd={() => isDraggingSlider.current = false}
                    style={{
                      position: 'relative', width: '100%', height: 360, background: '#09090e', overflow: 'hidden', cursor: 'ew-resize', userSelect: 'none'
                    }}
                  >
                    {/* Compressed Image (Background) */}
                    {compressedUrl ? (
                      <img 
                        src={compressedUrl} 
                        alt="Compressed"
                        style={{ width: '100%', height: '100%', objectFit: 'contain', position: 'absolute', top: 0, left: 0 }}
                      />
                    ) : (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        <RefreshCw size={24} className="animate-spin" />
                      </div>
                    )}

                    {/* Original Image (Foreground, Clipped via clipPath) */}
                    {originalUrl && (
                      <img 
                        src={originalUrl} 
                        alt="Original"
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'contain', 
                          position: 'absolute', 
                          top: 0, 
                          left: 0,
                          clipPath: `inset(0 ${100 - sliderPos}% 0 0)`
                        }}
                      />
                    )}

                    {/* Vertical Divider Line */}
                    <div 
                      style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: `${sliderPos}%`,
                        width: 2,
                        background: 'var(--accent)',
                        boxShadow: '0 0 10px var(--accent)',
                        zIndex: 10,
                        pointerEvents: 'none'
                      }}
                    />

                    {/* Drag Handle Bar */}
                    <div 
                      style={{
                        position: 'absolute', top: 0, bottom: 0, left: `${sliderPos}%`, width: 40, transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 11
                      }}
                    >
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)', border: '4px solid rgba(255,255,255,0.2)', boxShadow: '0 0 16px rgba(124, 58, 237, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                        <Maximize size={14} style={{ transform: 'rotate(45deg)', margin: 'auto' }} />
                      </div>
                    </div>

                    {/* Floating Labels */}
                    <span style={{ position: 'absolute', left: 16, bottom: 16, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', padding: '4px 10px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 600, color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>ORIGINAL</span>
                    <span style={{ position: 'absolute', right: 16, bottom: 16, background: 'rgba(124,58,237,0.7)', backdropFilter: 'blur(8px)', padding: '4px 10px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 600, color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>OPTIMIZED</span>
                  </div>

                  {/* Interactive Stats Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.01)' }}>
                    <div style={{ padding: 20, borderRight: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                      <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Original Size</p>
                      <p style={{ fontSize: '1.2rem', fontWeight: 800 }}>{formatSize(originalSize)}</p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{imageDims.w} x {imageDims.h} px</p>
                    </div>
                    <div style={{ padding: 20, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                      <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Optimized Size</p>
                      {isProcessing ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, height: 28 }}>
                          <RefreshCw size={14} className="animate-spin" style={{ color: 'var(--accent)' }} />
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Calculating...</span>
                        </div>
                      ) : (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            <p style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-soft)' }}>{formatSize(compressedSize)}</p>
                            {savingsPercent > 0 && (
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: 6, border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                                -{savingsPercent}%
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{compDims.w} x {compDims.h} px</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Savings Ribbon */}
                  {savingsPercent > 0 && !isProcessing && (
                    <div style={{ background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.02) 100%)', borderTop: '1px solid rgba(16, 185, 129, 0.2)', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 8, color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>
                      <CheckCircle2 size={16} /> Space reduced by {savingsPercent}% ! Awesome for Web speed load.
                    </div>
                  )}

                  {/* Download Action */}
                  <div style={{ padding: 24, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                      onClick={handleDownload}
                      disabled={isProcessing || !compressedUrl}
                      style={{
                        padding: '14px 28px', minHeight: 48, borderRadius: 12, border: 'none', background: 'var(--gradient-purple)', color: '#fff', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
                        opacity: (isProcessing || !compressedUrl) ? 0.6 : 1
                      }}
                      onMouseEnter={(e) => { if (!isProcessing && compressedUrl) e.currentTarget.style.transform = 'translateY(-2px)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'none' }}
                    >
                      <Download size={18} /> Download Optimized Image
                    </button>
                  </div>

                </div>
              )}
            </>
          ) : (
            /* Batch Optimization Panel */
            <div className="glass-card" style={{ padding: 32, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 24, minHeight: 400, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Batch Processing Queue</h3>
                {batchFiles.length > 0 && (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button 
                      onClick={clearAllBatch}
                      style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Clear All
                    </button>
                    <button 
                      onClick={runBatchCompression}
                      style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: 'var(--gradient-purple)', color: '#fff', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <Zap size={14} /> Start Batch Optimize
                    </button>
                  </div>
                )}
              </div>

              {/* Batch Upload Dropzone */}
              <div 
                onClick={() => fileInputRef.current.click()}
                style={{
                  border: '2px dashed var(--border-mid)', borderRadius: 16, padding: '32px 20px', textAlign: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.01)', marginBottom: 24, transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'rgba(124, 58, 237, 0.02)' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-mid)'; e.currentTarget.style.background = 'rgba(255,255,255,0.01)' }}
              >
                <input type="file" ref={fileInputRef} onChange={handleBatchUpload} accept="image/*" multiple style={{ display: 'none' }} />
                <Upload size={20} style={{ color: 'var(--accent)', margin: '0 auto 8px auto' }} />
                <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>Click to add images to batch</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 4 }}>Add multiple items to compress all at once</p>
              </div>

              {/* Batch List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flexGrow: 1, maxHeight: 300, overflowY: 'auto', paddingRight: 6 }}>
                {batchFiles.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, flexGrow: 1, color: 'var(--text-muted)', padding: '40px 0' }}>
                    <AlertCircle size={24} />
                    <p style={{ fontSize: '0.85rem' }}>No images in queue yet. Add some to get started!</p>
                  </div>
                ) : (
                  batchFiles.map((item) => (
                    <div 
                      key={item.id}
                      style={{
                        padding: 16, background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-subtle)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(124, 58, 237, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
                          <FileImage size={18} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatSize(item.size)}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        {item.status === 'idle' && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: 6, fontWeight: 600 }}>Queued</span>
                        )}
                        {item.status === 'compressing' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <RefreshCw size={12} className="animate-spin" style={{ color: 'var(--accent)' }} />
                            <span style={{ fontSize: '0.75rem', color: 'var(--accent-soft)' }}>Optimizing</span>
                          </div>
                        )}
                        {item.status === 'success' && (
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.75rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: 6, fontWeight: 700 }}>-{item.savings}%</span>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{formatSize(item.compressedSize)}</p>
                          </div>
                        )}
                        {item.status === 'failed' && (
                          <span style={{ fontSize: '0.75rem', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '4px 8px', borderRadius: 6 }}>Failed</span>
                        )}

                        <button 
                          onClick={() => removeBatchFile(item.id)}
                          style={{
                            border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', padding: 4
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Batch Action Bar */}
              {batchFiles.some(f => f.status === 'success') && (
                <div style={{ padding: '24px 0 0 0', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                  <button 
                    onClick={downloadAllBatch}
                    style={{
                      padding: '12px 24px', minHeight: 44, borderRadius: 10, border: 'none', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
                    }}
                  >
                    <FileDown size={16} /> Download All Optimized ({batchFiles.filter(f => f.status === 'success').length})
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
