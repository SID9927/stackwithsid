import ImageCompressor from '@/components/tools/ImageCompressor'

export const metadata = {
  title: 'Universal Image Compressor & Converter | StackWithSid',
  description: 'Compress, convert, and optimize images client-side for faster web pages and high-performance applications. Safe, 100% private, and fast.',
  keywords: [
    'image compressor', 'image converter', 'webp compressor', 'png optimizer',
    'lossless compression', 'client-side image compressor', 'developer tools',
    'web performance', 'speed up website'
  ],
  openGraph: {
    title: 'Universal Image Compressor & Converter | StackWithSid',
    description: 'Compress, convert, and optimize images client-side for faster web pages and high-performance applications. Safe, 100% private, and fast.',
    url: 'https://stackwithsid.com/tools/image-compressor',
    siteName: 'StackWithSid',
    type: 'website',
    images: [
      {
        url: 'https://stackwithsid.com/images/image-compressor-preview.png',
        width: 1200,
        height: 630,
        alt: 'Universal Image Compressor Tool Preview'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Universal Image Compressor & Converter | StackWithSid',
    description: 'Compress, convert, and optimize images client-side for faster web pages and high-performance applications. Safe, 100% private, and fast.',
    images: ['https://stackwithsid.com/images/image-compressor-preview.png']
  }
}

export default function ImageCompressorPage() {
  return (
    <main style={{ minHeight: 'calc(100vh - var(--nav-height))', position: 'relative' }} className="grid-pattern">
      <ImageCompressor />
    </main>
  )
}
