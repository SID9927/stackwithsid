'use client'

export default function AdminFormStyles() {
  return (
    <style jsx global>{`
      .editor-layout-wrapper { min-height: 800px; overflow-x: clip; }
      .editor-grid {
        display: flex;
        gap: 24px;
        align-items: flex-start;
        position: relative;
        width: 100%;
        box-sizing: border-box;
        min-height: calc(100vh - 220px);
      }

      @media (max-width: 1024px) {
        .editor-grid { flex-direction: column; gap: 40px; }
        .editor-main { padding: 24px !important; }
        .editor-sidebar { width: 100% !important; position: relative !important; top: 0 !important; }
      }

      .editor-main {
        flex: 1;
        min-width: 0;
        width: 100%;
        padding: 40px;
        box-sizing: border-box;
        overflow-x: hidden;
      }

      .editor-sidebar {
        width: 340px;
        flex-shrink: 0;
        position: sticky;
        top: 96px;
        display: flex;
        flex-direction: column;
        gap: 24px;
        max-height: calc(100vh - 150px);
        overflow-y: auto;
      }

      /* Custom scrollbar for sidebar */
      .editor-sidebar::-webkit-scrollbar { width: 4px; }
      .editor-sidebar::-webkit-scrollbar-track { background: transparent; }
      .editor-sidebar::-webkit-scrollbar-thumb { background: transparent; border-radius: 4px; }
      .editor-sidebar:hover::-webkit-scrollbar-thumb { background: var(--border-mid); }

      .sidebar-card { padding: 24px; }
      .sidebar-card h3 { display: flex; align-items: center; gap: 8px; font-size: 1rem; margin-bottom: 20px; color: var(--text-primary); }

      .field-group { margin-bottom: 28px; }
      .field-group label { display: flex; align-items: center; gap: 8px; color: var(--text-secondary); font-weight: 600; font-size: 0.9rem; margin-bottom: 10px; }
      .field-hint { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 12px; }

      .title-input { 
        font-family: Syne, sans-serif; font-size: 1.8rem !important; font-weight: 700; width: 100%;
        background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 16px;
        padding: 20px 24px !important; color: var(--text-primary); transition: all 0.3s;
        letter-spacing: -0.01em; margin-bottom: 24px;
      }
      @media (max-width: 768px) {
        .title-input { font-size: 1.3rem !important; padding: 14px 18px !important; border-radius: 12px; }
      }
      .title-input:focus { border-color: var(--accent); background: var(--bg-primary); box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1); }

      input, select, textarea {
        width: 100%; background: var(--bg-secondary); border: 1px solid var(--border-subtle);
        border-radius: 12px; padding: 12px 16px; color: var(--text-primary); outline: none; font-size: 0.95rem; transition: all 0.2s;
      }
      input:focus, textarea:focus { border-color: var(--accent); background: var(--bg-primary); box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1); }

      /* Preview Layout */
      .full-preview-container {
        background: var(--bg-primary); border-radius: 32px; border: 1px solid var(--border-subtle); overflow: hidden;
        box-shadow: 0 20px 50px rgba(0,0,0,0.3);
      }
      .preview-header-bar {
        background: var(--bg-secondary); padding: 16px 32px; border-bottom: 1px solid var(--border-subtle);
        display: flex; justify-content: space-between; align-items: center;
      }
      .preview-badge {
        background: var(--accent); color: white; padding: 4px 12px; border-radius: 999px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;
      }
      .btn-secondary-sm {
        display: flex; align-items: center; gap: 6px; background: var(--bg-elevated); color: var(--text-primary);
        border: 1px solid var(--border-subtle); padding: 8px 16px; border-radius: 10px; font-size: 0.85rem; font-weight: 600; cursor: pointer;
      }
      .preview-content-wrapper { padding: 40px; max-height: 80vh; overflow-y: auto; background: var(--bg-primary); }

      @media (max-width: 768px) {
        .preview-header-bar { padding: 12px 16px; }
        .preview-content-wrapper { padding: 20px; }
      }
    `}</style>
  )
}
