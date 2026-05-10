import { useState } from 'react'
import { Layout, Building2, Award, Zap, Sparkles, Plus } from 'lucide-react'
import CustomDropdown from './CustomDropdown'
import { supabase } from '@/lib/supabase'

export default function InterviewCategorization({ formData, setFormData, techStacks = [], onStackAdded }) {
  const [showAddStack, setShowAddStack] = useState(false)
  const [newStack, setNewStack] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleAddStack = async () => {
    if (!newStack.trim()) return
    setIsAdding(true)

    const { error } = await supabase
      .from('tech_stacks')
      .insert([{ name: newStack.trim() }])

    if (!error) {
      setFormData({ ...formData, stack: newStack.trim() })
      if (onStackAdded) onStackAdded(newStack.trim())
      setNewStack('')
      setShowAddStack(false)
    } else {
      alert('Error adding stack: ' + error.message)
    }
    setIsAdding(false)
  }

  return (
    <>
      <div className="sidebar-card glass-card">
        <h3><Layout size={16} /> Categorization</h3>
        
        <CustomDropdown 
          label="Difficulty"
          value={formData.difficulty}
          options={['Beginner', 'Intermediate', 'Advanced']}
          icon={Award}
          onChange={(val) => setFormData({...formData, difficulty: val})}
        />

        <div className="stack-selector">
          <CustomDropdown 
            label="Tech Stack"
            value={formData.stack}
            options={techStacks}
            icon={Zap}
            onChange={(val) => setFormData({...formData, stack: val})}
            upward={true}
          />
          {!showAddStack ? (
            <button 
              type="button" 
              className="add-stack-btn"
              onClick={() => setShowAddStack(true)}
            >
              <Plus size={14} /> Add New Stack
            </button>
          ) : (
            <div className="add-stack-form">
              <input 
                value={newStack}
                onChange={e => setNewStack(e.target.value)}
                placeholder="Stack name..."
                className="new-stack-input"
              />
              <div className="add-stack-actions">
                <button type="button" onClick={() => setShowAddStack(false)} className="cancel-btn">Cancel</button>
                <button type="button" onClick={handleAddStack} disabled={isAdding} className="confirm-btn">
                  {isAdding ? 'Adding...' : 'Add'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="field-group mt-6">
          <label><Building2 size={14} /> Target Company</label>
          <input 
            value={formData.company}
            onChange={e => setFormData({...formData, company: e.target.value})}
            placeholder="e.g. Meta, Google, Amazon"
          />
        </div>
      </div>

      <div className="sidebar-tip glass-card">
        <h4><Sparkles size={14} /> Pedagogy Tip</h4>
        <p>Structure your answer with <strong>H2/H3 headings</strong> and <strong>bullet points</strong>.</p>
      </div>

      <style jsx>{`
        .sidebar-card { padding: 24px; }
        .sidebar-card h3 { display: flex; align-items: center; gap: 8px; font-size: 1rem; margin-bottom: 20px; color: var(--text-primary); }
        .field-group { margin-bottom: 24px; }
        .field-group label { display: flex; align-items: center; gap: 8px; color: var(--text-secondary); font-weight: 600; font-size: 0.9rem; margin-bottom: 10px; }
        
        .add-stack-btn {
          background: none; border: none; color: var(--accent-soft); font-size: 0.75rem; 
          font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 4px;
          padding: 0; margin-top: -12px; margin-bottom: 12px; opacity: 0.8; transition: opacity 0.2s;
        }
        .add-stack-btn:hover { opacity: 1; }

        .add-stack-form {
          margin-top: -12px; margin-bottom: 20px; padding: 12px; 
          background: rgba(124, 58, 237, 0.05); border: 1px solid rgba(124, 58, 237, 0.1); 
          border-radius: 10px; display: flex; flex-direction: column; gap: 8px;
        }
        .new-stack-input {
          background: var(--bg-primary) !important; border: 1px solid var(--border-subtle) !important;
          padding: 8px 12px !important; font-size: 0.85rem !important; border-radius: 8px !important;
        }
        .add-stack-actions { display: flex; gap: 8px; justify-content: flex-end; }
        .add-stack-actions button {
          padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; cursor: pointer;
        }
        .cancel-btn { background: none; border: 1px solid var(--border-subtle); color: var(--text-muted); }
        .confirm-btn { background: var(--accent); border: none; color: white; }
        .confirm-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .sidebar-tip { padding: 20px; background: rgba(124, 58, 237, 0.05); border-color: rgba(124, 58, 237, 0.2); }
        .sidebar-tip h4 { font-size: 0.75rem; text-transform: uppercase; color: var(--accent-soft); margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
        .sidebar-tip p { font-size: 0.85rem; color: var(--text-secondary); margin: 0; line-height: 1.5; }
      `}</style>
    </>
  )
}
