'use client'

import { useState, useEffect, useRef } from 'react'
import SidebarStats from './sidebar/SidebarStats'
import SidebarActivity from './sidebar/SidebarActivity'
import SidebarDiscussion from './sidebar/SidebarDiscussion'

export default function ArticleSidebar({ readTime, commentsCount = 12, likes = 42, isLiked, onLikeToggle, onShare, recentComments = [] }) {
  const scrollRef = useRef(null)
  const [isHinting, setIsHinting] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: 50, behavior: 'smooth' })
        setTimeout(() => {
          scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
          setIsHinting(false)
        }, 1000)
      }
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <aside style={{ position: 'sticky', top: '100px' }} className="article-sidebar">
      <div 
        ref={scrollRef}
        className={`custom-scrollbar ${isHinting ? 'hinting' : ''}`}
        style={{ 
          maxHeight: 'calc(100vh - 120px)', 
          overflowY: 'auto', 
          overflowX: 'hidden',
          display: 'flex', 
          flexDirection: 'column', 
          gap: '24px',
          paddingRight: '12px',
          paddingBottom: '32px',
          overscrollBehavior: 'contain'
        }}
      >
        <SidebarStats 
          readTime={readTime} 
          commentsCount={commentsCount} 
          likes={likes} 
          isLiked={isLiked}
          onLikeToggle={onLikeToggle}
          onShare={onShare}
        />
        
        <SidebarActivity recentComments={recentComments} />
        
        <SidebarDiscussion />
      </div>
    </aside>
  )
}
