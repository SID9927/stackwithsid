'use client'

import { Save, CheckCircle2, Circle, FileEdit, Eye } from 'lucide-react'

export default function FormActions({ 
  activeTab, 
  setActiveTab, 
  published, 
  onTogglePublished, 
  saving, 
  onSave, 
  saveText, 
  formId 
}) {
  return (
    <div className="glass-card actions-card">
      <div className="actions-row">
        <div className="tab-switcher-mini">
          <button 
            type="button"
            className={activeTab === 'edit' ? 'active' : ''} 
            onClick={() => setActiveTab('edit')}
            title="Edit Mode"
          >
            <FileEdit size={16} />
          </button>
          <button 
            type="button"
            className={activeTab === 'preview' ? 'active' : ''} 
            onClick={() => setActiveTab('preview')}
            title="Preview Mode"
          >
            <Eye size={16} />
          </button>
        </div>
        
        <button 
          type="button"
          onClick={onTogglePublished}
          className={`status-toggle ${published ? 'published' : ''}`}
        >
          {published ? <CheckCircle2 size={14} /> : <Circle size={14} />}
          <span>{published ? 'Live' : 'Draft'}</span>
        </button>
      </div>

      <button 
        type={formId ? 'submit' : 'button'} 
        form={formId}
        disabled={saving} 
        onClick={onSave}
        className="admin-btn btn-primary publish-btn"
      >
        <Save size={18} /> 
        <span>{saving ? 'Saving...' : saveText}</span>
      </button>

      <style jsx>{`
        .actions-card { padding: 20px; display: flex; flex-direction: column; gap: 16px; border-color: var(--accent-soft); }
        .actions-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        
        .tab-switcher-mini {
          display: flex; background: var(--bg-secondary); padding: 4px; border-radius: 12px; border: 1px solid var(--border-subtle);
          flex: 1;
        }
        .tab-switcher-mini button {
          display: flex; align-items: center; justify-content: center; flex: 1; height: 32px; border-radius: 8px; border: none; background: transparent;
          color: var(--text-muted); cursor: pointer; transition: all 0.2s;
        }
        .tab-switcher-mini button.active { background: var(--bg-elevated); color: var(--accent); box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
        
        .status-toggle {
          display: flex; align-items: center; gap: 6px; padding: 0 12px; height: 40px; border-radius: 12px;
          border: 1px solid var(--border-subtle); background: var(--bg-secondary); color: var(--text-muted);
          font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: all 0.2s;
          white-space: nowrap;
        }
        .status-toggle.published { border-color: var(--accent-soft); color: var(--accent); background: rgba(124, 58, 237, 0.05); }
        .publish-btn { width: 100%; justify-content: center; height: 48px; font-size: 0.95rem; }
      `}</style>
    </div>
  )
}
