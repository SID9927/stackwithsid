'use client'

import { 
  ThumbsUp, 
  MessageSquare, 
  Bookmark, 
  Share2,
  Sparkles,
  Award,
  Zap,
  Info
} from 'lucide-react'

export default function InterviewDetailView({ q }) {
  if (!q) return (
    <div className="empty-detail">
      <div className="empty-icon"><Info size={40} /></div>
      <h3>Select a question to begin mastery</h3>
      <p>Choose from the list on the left to view expert explanations and hiring insights.</p>
    </div>
  )

  return (
    <div className="detail-wrapper">
      {/* Article Content Area */}
      <div className="article-body-wrapper">
        <header className="detail-header">
          <div className="meta-row">
            <span className={`badge-difficulty ${q.difficulty?.toLowerCase()}`}>
              {q.difficulty}
            </span>
            <span className="badge-stack">{q.stack}</span>
            <span className="company-tag">• {q.company || 'Common'}</span>
          </div>
          <h1>{q.question}</h1>
        </header>

        <div className="content-divider" />

        {/* Expert Explanation */}
        <div className="explanation-section">
          <div className="section-label">
            <Sparkles size={16} className="text-accent" /> Expert Explanation
          </div>
          <div className="explanation-text">
            {q.answer?.includes('<p>') ? (
              <div dangerouslySetInnerHTML={{ __html: q.answer }} />
            ) : (
              q.answer?.split('\n\n').map((para, i) => {
                const formattedPara = para.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                return (
                  <p key={i} dangerouslySetInnerHTML={{ __html: formattedPara }} />
                );
              })
            )}
          </div>
        </div>

        {/* Hiring Insight (Blockquote Style) */}
        <blockquote className="hiring-insight">
          <strong>The Hiring Insight:</strong> 
          {q.hiring_insight ? (
            q.hiring_insight
          ) : (
            <>Interviewers are looking for how you handle conceptual stability. Mentioning how {q.stack} optimizes this {q.difficulty} level concept shows senior-level maturity.</>
          )}
        </blockquote>

        {/* Interaction Bar */}
        <footer className="detail-footer">
          <div className="actions-left">
            <button className="action-btn active"><ThumbsUp size={18} /> Helpful</button>
            <button className="action-btn"><MessageSquare size={18} /> Discuss</button>
          </div>
          <div className="actions-right">
            <button className="icon-btn"><Bookmark size={20} /></button>
            <button className="icon-btn"><Share2 size={20} /></button>
          </div>
        </footer>
      </div>

      <style jsx global>{`
        .detail-wrapper {
          min-height: 600px;
        }

        .article-body-wrapper {
          background: var(--bg-card); 
          border: 1px solid var(--border-subtle); 
          border-radius: 32px;
          padding: clamp(24px, 5%, 56px); 
          box-shadow: var(--shadow-card); 
          backdrop-filter: blur(10px);
          position: relative;
        }

        .detail-header .meta-row {
          display: flex; align-items: center; gap: 12px; margin-bottom: 24px; flex-wrap: wrap;
        }
        .badge-difficulty {
          padding: 6px 14px; border-radius: 8px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;
        }
        .badge-difficulty.beginner { background: rgba(34, 197, 94, 0.1); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.2); }
        .badge-difficulty.intermediate { background: rgba(234, 179, 8, 0.1); color: #eab308; border: 1px solid rgba(234, 179, 8, 0.2); }
        .badge-difficulty.advanced { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }
        
        .badge-stack {
          background: rgba(124, 58, 237, 0.1); color: var(--accent-soft); padding: 6px 14px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; border: 1px solid rgba(124, 58, 237, 0.2);
        }
        .company-tag { color: var(--text-muted); font-size: 0.85rem; font-weight: 500; }

        .detail-header h1 {
          font-family: Syne, sans-serif; 
          font-size: clamp(1.8rem, 4vw, 2.8rem); 
          font-weight: 600; 
          color: var(--accent-soft); /* Vibrant Purple from reference */
          line-height: 1.1; 
          margin: 0;
          letter-spacing: -0.02em;
        }

        .content-divider {
          height: 1px; background: linear-gradient(90deg, var(--border-subtle), transparent); margin: 40px 0;
        }

        .section-label {
          display: flex; align-items: center; gap: 8px; color: var(--accent-soft); font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 24px;
        }

        .explanation-text { color: var(--text-secondary); line-height: 1.8; font-size: 1.1rem; }
        .explanation-text p { margin-bottom: 24px; }
        .explanation-text strong { color: var(--text-primary); font-weight: 700; }

        .hiring-insight {
          background: rgba(124, 58, 237, 0.03); border-left: 4px solid var(--accent); padding: 24px 32px; border-radius: 0 16px 16px 0; margin: 48px 0; color: var(--text-secondary); font-style: italic; line-height: 1.6;
        }
        .hiring-insight strong { color: var(--accent-soft); font-style: normal; display: block; margin-bottom: 8px; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; }

        .detail-footer {
          margin-top: 56px; padding-top: 40px; border-top: 1px solid var(--border-subtle); 
          display: flex; justify-content: space-between; align-items: center;
        }

        .actions-left, .actions-right { display: flex; gap: 12px; align-items: center; }
        
        .action-btn {
          height: 44px; background: none; border: 1px solid var(--border-subtle); border-radius: 12px;
          padding: 0 20px; color: var(--text-muted); cursor: pointer;
          display: flex; align-items: center; gap: 10px; font-weight: 600; transition: all 0.2s;
        }
        .action-btn:hover { border-color: var(--accent-soft); color: var(--text-primary); background: rgba(255,255,255,0.02); }
        .action-btn.active { background: rgba(124, 58, 237, 0.08); color: var(--accent); border-color: var(--accent); }

        .icon-btn {
          width: 44px; height: 44px; border-radius: 12px; border: 1px solid var(--border-subtle);
          background: none; color: var(--text-muted);
          display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;
        }
        .icon-btn:hover { border-color: var(--accent); color: var(--accent); background: rgba(124, 58, 237, 0.05); transform: translateY(-2px); }

        .empty-detail {
          height: 500px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 40px;
          background: rgba(255,255,255,0.01); border: 2px dashed var(--border-subtle); border-radius: 32px; color: var(--text-muted);
        }
        .empty-icon { width: 80px; height: 80px; background: rgba(255,255,255,0.03); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; }
        .empty-detail h3 { color: var(--text-primary); font-family: Syne, sans-serif; margin-bottom: 12px; }
        .empty-detail p { max-width: 320px; line-height: 1.6; }

        @media (max-width: 1024px) {
          .article-body-wrapper { 
            padding: 24px 16px !important; 
            border-radius: 24px !important; 
            border: none !important;
            background: none !important;
            box-shadow: none !important;
          }
          .detail-header h1 { font-size: 1.6rem !important; line-height: 1.2 !important; }
          .explanation-text { font-size: 1.05rem !important; }
          .hiring-insight { padding: 20px !important; margin: 32px 0 !important; }
          .detail-footer { flex-direction: column; gap: 24px; align-items: flex-start !important; }
          .actions-right { width: 100%; justify-content: flex-start; }
          .content-divider { margin: 24px 0 !important; }
        }
      `}</style>
    </div>
  )
}
