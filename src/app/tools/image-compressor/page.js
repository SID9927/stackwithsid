import ImageCompressor from '@/components/tools/ImageCompressor'

export const metadata = {
  title: 'Universal Image Compressor & Converter | StackWithSid',
  description: 'Compress, convert, and optimize images client-side for faster web pages and high-performance applications. Safe, 100% private, and fast.',
  keywords: [
    'image compressor', 'image converter', 'webp compressor', 'png optimizer',
    'lossless compression', 'client-side image compressor', 'developer tools',
    'web performance', 'speed up website'
  ]
}

export default function ImageCompressorPage() {
  return (
    <main style={{ minHeight: 'calc(100vh - var(--nav-height))', position: 'relative' }} className="grid-pattern">
      <ImageCompressor />
    </main>
  )
}
