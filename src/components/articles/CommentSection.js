'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Send, User, Trash2, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { timeAgo } from '@/lib/utils'

export default function CommentSection({ 
  articleId, // Keep for backward compatibility
  targetId, 
  targetType = 'article', 
  totalCount 
}) {
  const finalId = targetId || articleId
  const tableName = targetType === 'article' ? 'article_comments' : 'interview_comments'
  const foreignKey = targetType === 'article' ? 'article_id' : 'question_id'

  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const pageSize = 5

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    if (finalId) fetchComments(true)

    return () => subscription.unsubscribe()
  }, [finalId, targetType])

  async function fetchComments(reset = false) {
    if (reset) setLoading(true)
    const start = reset ? 0 : comments.length
    const end = start + pageSize - 1

    const { data } = await supabase
      .from(tableName)
      .select(`
        *,
        profiles (
          full_name,
          avatar_url
        )
      `)
      .eq(foreignKey, finalId)
      .order('created_at', { ascending: false })
      .range(start, end)
    
    if (data) {
      if (reset) {
        setComments(data)
      } else {
        setComments(prev => [...prev, ...data])
      }
      setHasMore(data.length === pageSize)
    }
    setLoading(false)
  }

  const handleSubmit = async (e, parentId = null) => {
    if (e) e.preventDefault()
    if (!user) {
      alert('Please sign in to participate.')
      return
    }

    const content = parentId ? replyText : newComment
    if (!content.trim()) return

    setSubmitting(true)
    const { data, error } = await supabase
      .from(tableName)
      .insert({
        [foreignKey]: finalId,
        user_id: user.id,
        content: content.trim(),
        parent_id: parentId
      })
      .select(`
        *,
        profiles (
          full_name,
          avatar_url
        )
      `)
      .single()

    if (error) {
      alert(error.message)
    } else {
      setComments([data, ...comments])
      if (parentId) {
        setReplyTo(null)
        setReplyText('')
      } else {
        setNewComment('')
      }
    }
    setSubmitting(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this comment?')) return
    
    const { error } = await supabase.from(tableName).delete().eq('id', id)
    if (!error) {
      setComments(comments.filter(c => c.id !== id))
    }
  }

  const renderComment = (comment, isReply = false) => {
    const isAdmin = user?.email === '5065sid@gmail.com'
    const isCommentOwner = comment.user_id === user?.id
    const isOwner = comment.user_id === '5065sid@gmail.com' || comment.profiles?.full_name?.toLowerCase().includes('sid')

    return (
      <div key={comment.id} style={{ width: '100%' }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', gap: '16px' }}
        >
          {/* Avatar */}
          <div style={{
            width: isReply ? '32px' : '44px',
            height: isReply ? '32px' : '44px',
            borderRadius: '50%',
            background: 'var(--bg-elevated)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            overflow: 'hidden',
            border: '2px solid var(--border-subtle)',
            color: 'var(--text-muted)'
          }}>
            {comment.profiles?.avatar_url ? (
              <img src={comment.profiles.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
            ) : (
              <User size={isReply ? 14 : 18} />
            )}
          </div>
          
          {/* Content Bubble */}
          <div style={{
            flex: 1,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '20px',
            padding: '16px 20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            minWidth: 0
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  color: isOwner ? 'var(--accent)' : 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {comment.profiles?.full_name || comment.user_id.split('-')[0]}
                  {isOwner && (
                    <span style={{
                      fontSize: '0.6rem',
                      background: 'var(--gradient-purple)',
                      color: '#fff',
                      padding: '2px 8px',
                      borderRadius: '20px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Admin
                    </span>
                  )}
                </span>
                <span style={{ color: 'var(--border-mid)', opacity: 0.5 }}>•</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Clock size={12} /> {timeAgo(comment.created_at)}
                </span>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {user && !isReply && (
                  <button onClick={() => setReplyTo(comment.id)} style={{
                    background: 'none', border: 'none', color: 'var(--accent-soft)',
                    fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer'
                  }}>
                    Reply
                  </button>
                )}
                {(isCommentOwner || isAdmin) && (
                  <button onClick={() => handleDelete(comment.id)} style={{
                    background: 'none', border: 'none', color: 'var(--text-muted)',
                    cursor: 'pointer', padding: '4px'
                  }}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>

            <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6, wordBreak: 'break-word' }}>
              {comment.content}
            </div>

            {/* Reply Form */}
            {replyTo === comment.id && (
              <div style={{ marginTop: '16px', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                <textarea 
                  autoFocus
                  placeholder="Write a reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', minHeight: '60px' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                  <button onClick={() => setReplyTo(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer' }}>Cancel</button>
                  <button onClick={() => handleSubmit(null, comment.id)} style={{
                    background: 'var(--gradient-purple)', border: 'none', color: '#fff',
                    padding: '6px 16px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer'
                  }}>
                    Reply
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Nested Replies */}
        <div style={{ 
          marginLeft: isReply ? '32px' : '48px', 
          marginTop: '10px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '12px',
          borderLeft: '2px solid var(--border-subtle)', 
          paddingLeft: '20px' 
        }}>
          {comments
            .filter(c => c.parent_id === comment.id)
            .map(reply => renderComment(reply, true))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ paddingTop: '64px', marginTop: '64px', borderTop: '1px solid var(--border-subtle)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '32px' }}>
        <MessageSquare size={20} color="var(--accent)" />
        <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          Discussion ({totalCount || 0})
        </h3>
      </div>

      {user ? (
        <form onSubmit={(e) => handleSubmit(e)} style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
          borderRadius: '24px', padding: '24px', marginBottom: '48px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
        }}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            required
            style={{
              width: '100%', minHeight: '120px', background: 'transparent',
              border: 'none', color: 'var(--text-primary)', fontSize: '1rem',
              outline: 'none', marginBottom: '16px', resize: 'none'
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              Posting as <strong>{user.email.split('@')[0]}</strong>
            </p>
            <button type="submit" disabled={submitting} style={{
              background: 'var(--gradient-purple)', border: 'none', color: '#fff',
              padding: '10px 24px', borderRadius: '14px', fontWeight: 700, cursor: 'pointer'
            }}>
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      ) : (
        <div style={{ textAlign: 'center', padding: '48px', background: 'var(--bg-card)', borderRadius: '24px', border: '2px dashed var(--border-subtle)', marginBottom: '48px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>
            Please <button onClick={() => window.location.href = '/login'} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>Sign In</button> to participate.
          </p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading comments...</div>
        ) : comments.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No comments yet.</div>
        ) : (
          <AnimatePresence>
            {comments
              .filter(c => !c.parent_id)
              .map(comment => renderComment(comment))}
          </AnimatePresence>
        )}

        {(hasMore && comments.length >= pageSize) || comments.length > pageSize ? (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '16px' }}>
            {hasMore && comments.length >= pageSize && (
              <button 
                onClick={() => fetchComments()} 
                disabled={loading}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  padding: '10px 32px',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            )}
            
            {comments.length > pageSize && (
              <button 
                onClick={() => fetchComments(true)} 
                style={{
                  background: 'none',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)',
                  padding: '10px 24px',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Show Less
              </button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}
