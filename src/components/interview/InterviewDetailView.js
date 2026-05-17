import { Sparkles, Info } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import CommentSection from '@/components/articles/CommentSection'

export default function InterviewDetailView({ q, stats }) {
  if (!q) return (
    <div className="empty-detail">
      <div className="empty-icon"><Info size={40} /></div>
      <h3>Select a question to start learning</h3>
      <p>Choose from the list on the left to view simplified explanations and hiring insights.</p>
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
            <Sparkles size={16} className="text-accent" /> Simplified Explanation
          </div>
          <div className="explanation-text">
            {(() => {
              const formatRichText = (text) => {
                if (!text) return '';
                return text
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/`(.*?)`/g, '<code>$1</code>')
                  .replace(/(\/\/\s.*)/g, '<span class="code-comment">$1</span>');
              };

              if (q.answer?.includes('<p>') || q.answer?.includes('<pre>')) {
                return <div dangerouslySetInnerHTML={{ __html: formatRichText(q.answer) }} />;
              }

              return q.answer?.split('\n\n').map((para, i) => (
                <p key={i} dangerouslySetInnerHTML={{ __html: formatRichText(para) }} />
              ));
            })()}
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

        {/* Discussion Section */}
        <div id="discussion" style={{ marginTop: 64 }}>
          <CommentSection 
            targetId={q.id} 
            targetType="interview" 
            totalCount={stats?.comments || 0} 
          />
        </div>
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
        .explanation-text ul, .explanation-text ol { padding-left: 28px; margin-bottom: 24px; }
        .explanation-text li { margin-bottom: 8px; line-height: 1.7; }
        .explanation-text ul li { list-style-type: disc; }
        .explanation-text ol li { list-style-type: decimal; }

        /* Tables */
        .explanation-text table {
          border-collapse: collapse; width: 100%; margin: 32px 0;
          border-radius: 12px; overflow-x: auto !important; display: block !important;
          border: 1px solid var(--border-subtle); -webkit-overflow-scrolling: touch;
        }
        .explanation-text th {
          background: rgba(124, 58, 237, 0.15); color: var(--accent-soft);
          font-weight: 700; font-size: 0.85rem; text-transform: uppercase;
          letter-spacing: 0.05em; padding: 12px 16px; border: 1px solid var(--border-subtle); text-align: left;
          white-space: nowrap;
        }
        .explanation-text td {
          padding: 12px 16px; border: 1px solid var(--border-subtle);
          color: var(--text-secondary); vertical-align: top; transition: background 0.2s;
          min-width: 120px;
        }
        .explanation-text tr:hover td { background: rgba(124, 58, 237, 0.04); }
        
        .tableWrapper {
          width: 100%;
          overflow-x: auto !important;
          margin: 32px 0;
          -webkit-overflow-scrolling: touch;
          display: block !important;
        }

        .tableWrapper::-webkit-scrollbar,
        .explanation-text table::-webkit-scrollbar {
          height: 6px;
        }
        .tableWrapper::-webkit-scrollbar-thumb,
        .explanation-text table::-webkit-scrollbar-thumb {
          background: var(--accent-soft);
          border-radius: 10px;
        }

        .explanation-text pre {
          background: #0d0d12 !important;
          color: #e2e8f0 !important;
          border: 1px solid var(--border-subtle);
          border-radius: 16px;
          padding: 28px 32px;
          margin: 32px 0;
          overflow-x: auto;
          max-width: 100%;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.95rem;
          line-height: 1.7;
          box-shadow: inset 0 2px 10px rgba(0,0,0,0.5);
          position: relative;
        }
        .explanation-text pre::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 16px;
          padding: 1px;
          background: linear-gradient(to bottom right, var(--accent-soft), transparent, var(--accent-soft));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0.4;
          pointer-events: none;
        }

        .explanation-text code {
          font-family: 'JetBrains Mono', monospace;
          background: rgba(124, 58, 237, 0.1);
          color: var(--accent-soft);
          padding: 2px 6px;
          border-radius: 6px;
          font-size: 0.9em;
        }

        .explanation-text pre code {
          background: none;
          color: inherit;
          padding: 0;
          border-radius: 0;
          font-size: inherit;
        }

        .explanation-text .code-comment {
          color: #4ade80;
          font-style: italic;
        }

        @media (max-width: 1024px) {
          .explanation-text table {
            display: block !important;
            width: 100% !important;
            overflow-x: auto !important;
          }
        }

        /* Callout Cards */
        .explanation-text .callout {
          margin: 40px 0; padding: 24px 28px; border-radius: 16px;
          border: 1px solid var(--border-subtle); background: rgba(255, 255, 255, 0.02);
        }
        .explanation-text .callout-success { border-color: rgba(0, 255, 170, 0.25); background: rgba(0, 255, 170, 0.04); }
        .explanation-text .callout-success strong { color: #00ffaa !important; }
        .explanation-text .callout-info { border-color: rgba(59, 130, 246, 0.3); background: rgba(59, 130, 246, 0.05); }
        .explanation-text .callout-info strong { color: #60a5fa !important; }
        .explanation-text .callout-tip { border-color: rgba(245, 158, 11, 0.3); background: rgba(245, 158, 11, 0.05); }
        .explanation-text .callout-tip strong { color: #fbbf24 !important; }
        .explanation-text .callout-warning { border-color: rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.05); }
        .explanation-text .callout-warning strong { color: #f87171 !important; }
        .explanation-text .callout p { margin-bottom: 8px; }
        .explanation-text .callout p:last-child { margin-bottom: 0; }

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
        .icon-btn.active-bookmark { color: var(--accent); border-color: var(--accent); background: rgba(124, 58, 237, 0.08); }

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
