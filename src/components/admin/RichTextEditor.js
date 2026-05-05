'use client'

import { useState } from 'react'
import { useEditor, EditorContent, Extension, Mark } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import Link from '@tiptap/extension-link'
import {
  Bold, Italic, Strikethrough, Code, List, ListOrdered,
  Quote, Minus, Undo, Redo, Table as TableIcon,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  ShieldCheck, Zap, Info, Star, Link2, Link2Off, ChevronDown
} from 'lucide-react'

// ── Toolbar helpers ──────────────────────────────────────────────────────────

function Btn({ onClick, active, title, children, danger }) {
  return (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick() }}
      title={title}
      className={`tb-btn ${active ? 'active' : ''} ${danger ? 'danger' : ''}`}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <span className="tb-div" />
}

// ── Line Height (custom inline style extension) ──────────────────────────────
const LineHeight = Extension.create({
  name: 'lineHeight',
  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading'],
        attributes: {
          lineHeight: {
            default: null,
            renderHTML: attrs => attrs.lineHeight ? { style: `line-height:${attrs.lineHeight}` } : {},
            parseHTML: el => el.style.lineHeight || null,
          },
        },
      },
    ]
  },
  addCommands() {
    return {
      setLineHeight: (lh) => ({ commands }) => {
        commands.updateAttributes('paragraph', { lineHeight: lh })
        commands.updateAttributes('heading', { lineHeight: lh })
        return true
      },
    }
  },
})

// ── Font Size (custom mark extension) ─────────────────────────────────────────
const FontSize = Mark.create({
  name: 'fontSize',
  addAttributes() {
    return {
      size: {
        default: null,
        renderHTML: attributes => {
          if (!attributes.size) return {}
          return { style: `font-size: ${attributes.size}` }
        },
        parseHTML: element => element.style.fontSize || null,
      },
    }
  },
  parseHTML() {
    return [{ tag: 'span[style*="font-size"]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', HTMLAttributes, 0]
  },
  addCommands() {
    return {
      setFontSize: size => ({ chain }) => {
        return chain().setMark('fontSize', { size }).run()
      },
      unsetFontSize: () => ({ chain }) => {
        return chain().unsetMark('fontSize').run()
      },
    }
  },
})

// ── Callout (info card) ──────────────────────────────────────────────────────
// We insert raw HTML callout blocks as a toggle
function insertCallout(editor, type) {
  const presets = {
    info: { icon: 'ℹ️', label: 'Info', cls: 'callout-info' },
    tip: { icon: '💡', label: 'Tip', cls: 'callout-tip' },
    warning: { icon: '⚠️', label: 'Warning', cls: 'callout-warning' },
    success: { icon: '✅', label: 'Core Benefits', cls: 'callout-success' },
  }
  const { icon, label, cls } = presets[type]
  editor.chain().focus().insertContent(
    `<div class="callout ${cls}"><p><strong>${icon} ${label}</strong></p><p>Write your content here...</p></div>`
  ).run()
}

// ── Table picker ─────────────────────────────────────────────────────────────
function TablePicker({ onInsert }) {
  const [hover, setHover] = useState({ r: 0, c: 0 })
  const max = 6
  return (
    <div className="table-picker">
      <div className="table-picker-label">
        {hover.r > 0 ? `${hover.r} × ${hover.c} Table` : 'Insert Table'}
      </div>
      <div className="table-picker-grid">
        {Array.from({ length: max }, (_, ri) =>
          Array.from({ length: max }, (_, ci) => (
            <div
              key={`${ri}-${ci}`}
              className={`tp-cell ${ri < hover.r && ci < hover.c ? 'lit' : ''}`}
              onMouseEnter={() => setHover({ r: ri + 1, c: ci + 1 })}
              onClick={() => onInsert(hover.r, hover.c)}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ── Main Editor ──────────────────────────────────────────────────────────────
function LinkDialog({ onInsert, onClose, initialText }) {
  const [url, setUrl] = useState('')
  const [text, setText] = useState(initialText || '')
  return (
    <div className="link-dialog" onClick={e => e.stopPropagation()}>
      <div className="link-dialog-title">Insert Hyperlink</div>
      <div className="link-field">
        <label>Display Text</label>
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Click here" />
      </div>
      <div className="link-field">
        <label>URL</label>
        <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." type="url" />
      </div>
      <div className="link-actions">
        <button type="button" className="link-cancel" onMouseDown={e => { e.preventDefault(); onClose() }}>Cancel</button>
        <button type="button" className="link-insert" onMouseDown={e => { e.preventDefault(); if(url) onInsert(url, text) }}>Insert Link</button>
      </div>
    </div>
  )
}

export default function RichTextEditor({ value, onChange }) {
  const [lineHeight, setLineHeight] = useState('1.8')
  const [showTablePicker, setShowTablePicker] = useState(false)
  const [showCalloutMenu, setShowCalloutMenu] = useState(false)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [showLHMenu, setShowLHMenu] = useState(false)
  const [showFSMenu, setShowFSMenu] = useState(false)
  const [fontSize, setFontSize] = useState('16px')
  const [showAlignMenu, setShowAlignMenu] = useState(false)
  const [showListMenu, setShowListMenu] = useState(false)
  const [showHeadingMenu, setShowHeadingMenu] = useState(false)
  const [showInlineMenu, setShowInlineMenu] = useState(false)
  const [selectedText, setSelectedText] = useState('')

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: true,
        heading: { levels: [2, 3] },
        codeBlock: { HTMLAttributes: { class: 'article-code-block' } },
        blockquote: { HTMLAttributes: { class: 'article-blockquote' } },
        link: false,
      }),
      Placeholder.configure({
        placeholder: 'Start writing your article...',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph', 'table'],
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      LineHeight,
      FontSize,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'article-link', target: '_blank', rel: 'noopener noreferrer' } }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: { attributes: { class: 'rich-editor-content' } },
    immediatelyRender: false,
  })

  if (!editor) return null

  const applyLH = (lh) => {
    setLineHeight(lh)
    editor.chain().focus().setLineHeight(lh).run()
  }

  const applyFS = (size) => {
    setFontSize(size)
    if (size === 'default') {
      editor.chain().focus().unsetFontSize().run()
    } else {
      editor.chain().focus().setFontSize(size).run()
    }
  }

  const insertTable = (rows, cols) => {
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run()
    setShowTablePicker(false)
  }

  const openLinkDialog = () => {
    const { from, to } = editor.state.selection
    const txt = editor.state.doc.textBetween(from, to, '')
    setSelectedText(txt)
    setShowLinkDialog(true)
    setShowTablePicker(false)
    setShowCalloutMenu(false)
  }

  const handleInsertLink = (url, text) => {
    const { from, to } = editor.state.selection
    const hasSelection = from !== to
    if (hasSelection) {
      editor.chain().focus().setLink({ href: url }).run()
    } else {
      editor.chain().focus().insertContent(`<a href="${url}">${text || url}</a>`).run()
    }
    setShowLinkDialog(false)
  }

  return (
    <div className="rich-editor-wrapper" onClick={() => { 
      setShowTablePicker(false); 
      setShowCalloutMenu(false); 
      setShowLinkDialog(false);
      setShowLHMenu(false);
      setShowFSMenu(false);
    }}>
      {/* ── STICKY COMMAND CENTER ── */}
      <div className="editor-sticky-header">
        <div className="editor-top-bar">
          <div className="editor-status-label">Rich Text Editor</div>
          <div className="history-group">
            <Btn onClick={() => editor.chain().focus().undo().run()} title="Undo (Ctrl+Z)"><Undo size={16} /></Btn>
            <Btn onClick={() => editor.chain().focus().redo().run()} title="Redo (Ctrl+Y)"><Redo size={16} /></Btn>
          </div>
        </div>

        <div className="editor-toolbar" onClick={e => e.stopPropagation()}>

        {/* Headings Dropdown */}
        <div className="tb-group" style={{ position: 'relative' }}>
          <Btn onClick={() => { setShowHeadingMenu(!showHeadingMenu); setShowAlignMenu(false); setShowListMenu(false); setShowFSMenu(false); setShowLHMenu(false); setShowTablePicker(false); setShowCalloutMenu(false); setShowLinkDialog(false); }} active={showHeadingMenu} title="Text Style">
            {editor.isActive('heading', { level: 2 }) ? <span className="tb-text">H2</span> : 
             editor.isActive('heading', { level: 3 }) ? <span className="tb-text">H3</span> : 
             <span className="tb-text">¶</span>}
          </Btn>
          {showHeadingMenu && (
            <div className="tb-popover heading-mini-toolbar">
              <button
                type="button"
                className={`tb-btn ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}
                onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run(); setShowHeadingMenu(false); }}
                title="Heading 2"
              >
                <span className="tb-text">H2</span>
              </button>
              <button
                type="button"
                className={`tb-btn ${editor.isActive('heading', { level: 3 }) ? 'active' : ''}`}
                onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 3 }).run(); setShowHeadingMenu(false); }}
                title="Heading 3"
              >
                <span className="tb-text">H3</span>
              </button>
              <button
                type="button"
                className={`tb-btn ${editor.isActive('paragraph') ? 'active' : ''}`}
                onMouseDown={e => { e.preventDefault(); editor.chain().focus().setParagraph().run(); setShowHeadingMenu(false); }}
                title="Paragraph"
              >
                <span className="tb-text">¶</span>
              </button>
            </div>
          )}
        </div>

        <Divider />

        {/* Inline formatting Dropdown */}
        <div className="tb-group" style={{ position: 'relative' }}>
          <Btn onClick={() => { setShowInlineMenu(!showInlineMenu); setShowHeadingMenu(false); setShowAlignMenu(false); setShowListMenu(false); setShowFSMenu(false); setShowLHMenu(false); setShowTablePicker(false); setShowCalloutMenu(false); setShowLinkDialog(false); }} active={showInlineMenu} title="Inline Styles">
            {editor.isActive('bold') ? <Bold size={16} /> : 
             editor.isActive('italic') ? <Italic size={16} /> : 
             editor.isActive('strike') ? <Strikethrough size={16} /> :
             <Bold size={16} />}
          </Btn>
          {showInlineMenu && (
            <div className="tb-popover align-mini-toolbar">
              <button
                type="button"
                className={`tb-btn ${editor.isActive('bold') ? 'active' : ''}`}
                onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleBold().run(); setShowInlineMenu(false); }}
                title="Bold (Ctrl+B)"
              >
                <Bold size={16} />
              </button>
              <button
                type="button"
                className={`tb-btn ${editor.isActive('italic') ? 'active' : ''}`}
                onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); setShowInlineMenu(false); }}
                title="Italic (Ctrl+I)"
              >
                <Italic size={16} />
              </button>
              <button
                type="button"
                className={`tb-btn ${editor.isActive('strike') ? 'active' : ''}`}
                onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleStrike().run(); setShowInlineMenu(false); }}
                title="Strikethrough"
              >
                <Strikethrough size={16} />
              </button>
            </div>
          )}
        </div>

        <Divider />

        {/* Alignment Dropdown */}
        <div className="tb-group" style={{ position: 'relative' }}>
          <Btn onClick={() => { setShowAlignMenu(!showAlignMenu); setShowFSMenu(false); setShowLHMenu(false); setShowTablePicker(false); setShowCalloutMenu(false); setShowLinkDialog(false); }} active={showAlignMenu} title="Text Alignment">
            {editor.isActive({ textAlign: 'center' }) ? <AlignCenter size={16} /> : 
             editor.isActive({ textAlign: 'right' }) ? <AlignRight size={16} /> :
             editor.isActive({ textAlign: 'justify' }) ? <AlignJustify size={16} /> : 
             <AlignLeft size={16} />}
          </Btn>
          {showAlignMenu && (
            <div className="tb-popover align-mini-toolbar">
              {[
                { key: 'left', icon: <AlignLeft size={16} />, title: 'Align Left' },
                { key: 'center', icon: <AlignCenter size={16} />, title: 'Align Center' },
                { key: 'right', icon: <AlignRight size={16} />, title: 'Align Right' },
                { key: 'justify', icon: <AlignJustify size={16} />, title: 'Justify' },
              ].map(item => (
                <button
                  key={item.key}
                  type="button"
                  className={`tb-btn ${editor.isActive({ textAlign: item.key }) ? 'active' : ''}`}
                  onMouseDown={e => { 
                    e.preventDefault(); 
                    editor.chain().focus().setTextAlign(item.key).run(); 
                    setShowAlignMenu(false); 
                  }}
                  title={item.title}
                >
                  {item.icon}
                </button>
              ))}
            </div>
          )}
        </div>

        <Divider />

        {/* Font Size & Line height */}
        <div className="tb-group" style={{ position: 'relative' }}>
          <div className="lh-label">A</div>
          <button 
            type="button"
            className={`tb-btn custom-select ${showFSMenu ? 'active' : ''}`}
            onClick={() => { setShowFSMenu(!showFSMenu); setShowLHMenu(false); setShowTablePicker(false); setShowCalloutMenu(false); setShowLinkDialog(false); }}
          >
            {fontSize === 'default' ? 'Auto' : fontSize} <ChevronDown size={14} />
          </button>
          {showFSMenu && (
            <div className="tb-popover fs-menu">
              {['default', '12px', '14px', '16px', '18px', '20px', '24px', '32px', '48px'].map(v => (
                <button
                  key={v}
                  type="button"
                  className={`menu-option ${fontSize === v ? 'active' : ''}`}
                  onMouseDown={e => { e.preventDefault(); applyFS(v); setShowFSMenu(false); }}
                >
                  {v === 'default' ? 'Reset' : v}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="tb-group" style={{ position: 'relative' }}>
          <div className="lh-label">↕</div>
          <button 
            type="button"
            className={`tb-btn custom-select ${showLHMenu ? 'active' : ''}`}
            onClick={() => { setShowLHMenu(!showLHMenu); setShowFSMenu(false); setShowTablePicker(false); setShowCalloutMenu(false); setShowLinkDialog(false); }}
          >
            {lineHeight}× <ChevronDown size={14} />
          </button>
          {showLHMenu && (
            <div className="tb-popover lh-menu">
              {['1', '1.2', '1.4', '1.6', '1.8', '2', '2.4', '3'].map(v => (
                <button
                  key={v}
                  type="button"
                  className={`menu-option ${lineHeight === v ? 'active' : ''}`}
                  onMouseDown={e => { e.preventDefault(); applyLH(v); setShowLHMenu(false); }}
                >
                  {v}×
                </button>
              ))}
            </div>
          )}
        </div>

        <Divider />

        {/* Lists Dropdown */}
        <div className="tb-group" style={{ position: 'relative' }}>
          <Btn onClick={() => { setShowListMenu(!showListMenu); setShowAlignMenu(false); setShowFSMenu(false); setShowLHMenu(false); setShowTablePicker(false); setShowCalloutMenu(false); setShowLinkDialog(false); }} active={showListMenu} title="List Options">
            {editor.isActive('orderedList') ? <ListOrdered size={16} /> : <List size={16} />}
          </Btn>
          {showListMenu && (
            <div className="tb-popover align-mini-toolbar">
              <button
                type="button"
                className={`tb-btn ${editor.isActive('bulletList') ? 'active' : ''}`}
                onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); setShowListMenu(false); }}
                title="Bullet List"
              >
                <List size={16} />
              </button>
              <button
                type="button"
                className={`tb-btn ${editor.isActive('orderedList') ? 'active' : ''}`}
                onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run(); setShowListMenu(false); }}
                title="Numbered List"
              >
                <ListOrdered size={16} />
              </button>
            </div>
          )}
        </div>

        <Divider />

        {/* Other blocks */}
        <div className="tb-group">
          <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote"><Quote size={16} /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline Code"><Code size={16} /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code Block">
            <span className="tb-text">&lt;/&gt;</span>
          </Btn>
          <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule"><Minus size={16} /></Btn>
        </div>

        <Divider />

        {/* Table */}
        <div className="tb-group" style={{ position: 'relative' }}>
          <Btn onClick={() => { setShowTablePicker(p => !p); setShowCalloutMenu(false) }} active={showTablePicker} title="Insert Table">
            <TableIcon size={16} />
          </Btn>
          {showTablePicker && (
            <div className="tb-popover" onClick={e => e.stopPropagation()}>
              <TablePicker onInsert={insertTable} />
            </div>
          )}
        </div>

        {/* Table controls (visible when cursor is inside a table) */}
        {editor.isActive('table') && (
          <>
            <Divider />
            <div className="tb-group">
              <Btn onClick={() => editor.chain().focus().addColumnBefore().run()} title="Add Column Before"><span className="tb-text">+←</span></Btn>
              <Btn onClick={() => editor.chain().focus().addColumnAfter().run()} title="Add Column After"><span className="tb-text">+→</span></Btn>
              <Btn onClick={() => editor.chain().focus().deleteColumn().run()} title="Delete Column" danger><span className="tb-text">−C</span></Btn>
              <Btn onClick={() => editor.chain().focus().addRowBefore().run()} title="Add Row Above"><span className="tb-text">+↑</span></Btn>
              <Btn onClick={() => editor.chain().focus().addRowAfter().run()} title="Add Row Below"><span className="tb-text">+↓</span></Btn>
              <Btn onClick={() => editor.chain().focus().deleteRow().run()} title="Delete Row" danger><span className="tb-text">−R</span></Btn>
              <Divider />
              <Btn onClick={() => editor.chain().focus().toggleHeaderRow().run()} title="Toggle Header Row" active={editor.isActive('tableHeader')}><span className="tb-text">TH</span></Btn>
              <Btn onClick={() => editor.chain().focus().deleteTable().run()} title="Delete Table" danger><span className="tb-text">⊗T</span></Btn>
            </div>
          </>
        )}

        <Divider />

        {/* Callout / Info Cards */}
        <div className="tb-group" style={{ position: 'relative' }}>
          <Btn onClick={() => { setShowCalloutMenu(p => !p); setShowTablePicker(false) }} active={showCalloutMenu} title="Insert Callout Card">
            <ShieldCheck size={16} />
          </Btn>
          {showCalloutMenu && (
            <div className="tb-popover callout-menu" onClick={e => e.stopPropagation()}>
              <div className="callout-menu-header">Insert Technical Card</div>
              {[
                { key: 'success', icon: <ShieldCheck size={18} />, label: 'Core Benefits', desc: 'Positive outcomes & features', cls: 'tco-success' },
                { key: 'info', icon: <Info size={18} />, label: 'Information', desc: 'General notes & context', cls: 'tco-info' },
                { key: 'tip', icon: <Zap size={18} />, label: 'Pro Tip', desc: 'Best practices & shortcuts', cls: 'tco-tip' },
                { key: 'warning', icon: <Star size={18} />, label: 'Warning', desc: 'Critical alerts & cautions', cls: 'tco-warning' },
              ].map(item => (
                <button
                  key={item.key}
                  type="button"
                  className={`tech-card-option ${item.cls}`}
                  onMouseDown={e => { e.preventDefault(); insertCallout(editor, item.key); setShowCalloutMenu(false) }}
                >
                  <div className="tco-icon">{item.icon}</div>
                  <div className="tco-body">
                    <span className="tco-label">{item.label}</span>
                    <span className="tco-desc">{item.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <Divider />

        {/* Hyperlink */}
        <div className="tb-group" style={{ position: 'relative' }}>
          <Btn onClick={openLinkDialog} active={editor.isActive('link')} title="Insert / Edit Link">
            <Link2 size={16} />
          </Btn>
          {editor.isActive('link') && (
            <Btn onClick={() => editor.chain().focus().unsetLink().run()} title="Remove Link" danger>
              <Link2Off size={16} />
            </Btn>
          )}
          {showLinkDialog && (
            <div className="tb-popover link-popover" onClick={e => e.stopPropagation()}>
              <LinkDialog
                initialText={selectedText}
                onInsert={handleInsertLink}
                onClose={() => setShowLinkDialog(false)}
              />
            </div>
          )}
        </div>
      </div> {/* End editor-sticky-header */}
      </div>

      {/* ── EDITOR AREA ── */}
      <EditorContent editor={editor} />

      {/* ── STYLES ── */}
      <style jsx global>{`
        /* Wrapper */
        .rich-editor-wrapper {
          border-radius: 20px; overflow: visible;
          border: 1px solid var(--border-subtle);
          background: var(--bg-secondary);
          transition: border-color 0.3s;
        }
        .rich-editor-wrapper:focus-within {
          border-color: var(--accent);
          box-shadow: 0 0 0 4px rgba(124,58,237,0.08);
        }

        /* Top Bar / History */
        .editor-top-bar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 8px 16px; background: rgba(124,58,237,0.03);
          border-radius: 20px 20px 0 0;
        }
        .editor-status-label { font-size: 0.65rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.12em; }
        .history-group { display: flex; gap: 4px; }
        .history-group .tb-btn { width: 32px; height: 32px; opacity: 0.7; }
        .history-group .tb-btn:hover { opacity: 1; background: rgba(124,58,237,0.1); }

        /* Sticky Command Center (Header + Toolbar) */
        .editor-sticky-header {
          position: sticky; top: 72px; z-index: 30;
          background: var(--bg-elevated);
          border-bottom: 1px solid var(--border-subtle);
          border-radius: 20px 20px 0 0;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }

        .editor-top-bar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 16px; border-bottom: 1px solid rgba(255,255,255,0.03);
        }

        .editor-toolbar {
          display: flex; align-items: center; flex-wrap: wrap;
          gap: 2px; padding: 10px 12px;
        }
        .tb-group { display: flex; align-items: center; gap: 2px; }
        .tb-div { width: 1px; height: 22px; background: var(--border-subtle); margin: 0 4px; flex-shrink:0; }

        .tb-btn {
          display: flex; align-items: center; justify-content: center;
          min-width: 32px; height: 32px; padding: 0 6px;
          border-radius: 8px; border: 1px solid transparent;
          background: transparent; color: var(--text-muted);
          cursor: pointer; transition: all 0.15s; font-size: 0.82rem;
        }
        .tb-btn:hover { color: var(--accent); background: rgba(124,58,237,0.1); border-color: rgba(124,58,237,0.2); }
        .tb-btn.active { color: var(--accent); background: rgba(124,58,237,0.15); border-color: rgba(124,58,237,0.3); }
        .tb-btn.danger:hover { color: #ef4444; background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.3); }
        .tb-text { font-family: var(--font-mono); font-weight: 700; font-size: 0.78rem; }

        /* Popovers */
        .tb-popover {
          position: absolute; top: calc(100% + 8px); left: 0;
          background: var(--bg-elevated); border: 1px solid var(--border-subtle);
          border-radius: 14px; padding: 12px;
          box-shadow: 0 16px 48px rgba(0,0,0,0.35);
          z-index: 200; min-width: 200px;
        }

        /* Table Picker */
        .table-picker-label {
          font-size: 0.78rem; color: var(--text-muted); font-weight: 600;
          margin-bottom: 10px; text-align: center;
        }
        .table-picker-grid {
          display: grid; grid-template-columns: repeat(6, 24px);
          gap: 3px;
        }
        .tp-cell {
          width: 24px; height: 24px; border-radius: 4px;
          border: 1px solid var(--border-subtle); cursor: pointer;
          transition: all 0.1s; background: var(--bg-card);
        }
        .tp-cell.lit { background: rgba(124,58,237,0.3); border-color: var(--accent); }
        .tp-cell:hover ~ .tp-cell { background: var(--bg-card); }

        /* Custom Dropdown Menus */
        .lh-menu { width: 80px; }
        .align-mini-toolbar {
          display: flex !important; flex-direction: row !important;
          gap: 4px; padding: 4px; 
          width: max-content !important; min-width: unset !important;
          left: 50% !important; transform: translateX(-50%) !important;
        }
        .heading-mini-toolbar {
          display: flex !important; flex-direction: row !important;
          gap: 4px; padding: 4px; 
          width: max-content !important; min-width: unset !important;
          left: 0 !important; transform: none !important;
        }
        .fs-menu { min-width: 90px; }
        .menu-option {
          display: flex; align-items: center; justify-content: center;
          width: 100%; padding: 8px; border-radius: 6px;
          border: none; background: transparent; color: var(--text-muted);
          font-size: 0.85rem; font-weight: 500; cursor: pointer;
          transition: all 0.2s;
        }
        .menu-option:hover { background: rgba(124,58,237,0.1); color: var(--accent); }
        .menu-option.active { background: rgba(124,58,237,0.15); color: var(--accent); }
        
        .custom-select { gap: 6px; padding: 0 10px; min-width: 70px; border: 1px solid var(--border-subtle) !important; background: var(--bg-card) !important; }
        .custom-select svg { opacity: 0.5; transition: transform 0.2s; }
        .custom-select.active svg { transform: rotate(180deg); }

        /* Callout Menu - List Design */
        .callout-menu { 
          min-width: 280px; padding: 12px; border-radius: 20px; 
          display: flex !important; flex-direction: column !important; 
          align-items: stretch !important; gap: 2px !important; 
        }
        .callout-menu-header { 
          font-size: 0.65rem; font-weight: 800; color: var(--text-muted); 
          text-transform: uppercase; letter-spacing: 0.12em; 
          padding: 6px 12px 10px; border-bottom: 1px solid var(--border-subtle);
          margin: 0 0 6px 0 !important; width: 100%;
        }
        .tech-card-option {
          display: flex !important; align-items: center !important; 
          justify-content: flex-start !important; gap: 14px !important; 
          width: 100% !important; padding: 10px 12px !important; border-radius: 12px !important; 
          border: 1px solid transparent !important; background: transparent !important; 
          cursor: pointer !important; transition: all 0.2s !important;
          text-align: left !important; position: relative !important;
          margin: 0 !important; flex-shrink: 0 !important;
        }
        .tech-card-option:hover { background: rgba(255,255,255,0.04) !important; }
        
        .tco-icon { 
          display: flex !important; align-items: center !important; justify-content: center !important;
          width: 38px !important; height: 38px !important; border-radius: 10px !important; flex-shrink: 0 !important;
          transition: transform 0.2s !important; margin: 0 !important;
        }
        .tech-card-option:hover .tco-icon { transform: scale(1.05); }

        .tco-body { 
          display: flex !important; flex-direction: column !important; 
          gap: 1px !important; align-items: flex-start !important;
          margin: 0 !important; padding: 0 !important;
        }
        .tco-label { font-size: 0.9rem; font-weight: 700; color: var(--text-primary); display: block; margin: 0 !important; }
        .tco-desc { font-size: 0.72rem; color: var(--text-muted); font-weight: 400; display: block; margin: 0 !important; }

        .tco-success .tco-icon { background: rgba(0,255,170,0.1); color: #00ffaa; }
        .tco-success:hover { background: rgba(0,255,170,0.05) !important; border-color: rgba(0,255,170,0.2) !important; }
        
        .tco-info .tco-icon { background: rgba(59,130,246,0.1); color: #60a5fa; }
        .tco-info:hover { background: rgba(59,130,246,0.05) !important; border-color: rgba(59,130,246,0.2) !important; }
        
        .tco-tip .tco-icon { background: rgba(245,158,11,0.1); color: #fbbf24; }
        .tco-tip:hover { background: rgba(245,158,11,0.05) !important; border-color: rgba(245,158,11,0.2) !important; }
        
        .tco-warning .tco-icon { background: rgba(239,68,68,0.1); color: #f87171; }
        .tco-warning:hover { background: rgba(239,68,68,0.05) !important; border-color: rgba(239,68,68,0.2) !important; }

        /* ── Editor Content ─────────────────────────────────────────── */
        .rich-editor-content {
          min-height: 300px;
          padding: 32px 36px;
          outline: none; caret-color: var(--accent);
          color: var(--text-secondary); line-height: 1.8;
          font-size: 1.1rem; font-family: "DM Sans", sans-serif;
          border-radius: 0 0 20px 20px;
        }
        .rich-editor-content p { margin-bottom: 20px; }
        .rich-editor-content p.is-editor-empty:first-child::before {
          content: attr(data-placeholder); color: var(--text-muted);
          pointer-events: none; height: 0; float: left; font-style: italic;
        }

        /* Headings */
        .rich-editor-content h1 { font-family: Syne, sans-serif; font-size: 2.6rem; font-weight: 800; margin: 48px 0 20px; color: var(--text-primary); letter-spacing: -0.03em; line-height: 1.1; }
        .rich-editor-content h2 { font-family: Syne, sans-serif; font-size: 2rem; font-weight: 700; margin: 40px 0 18px; color: var(--text-primary); letter-spacing: -0.02em; line-height: 1.15; }
        .rich-editor-content h3 { font-family: Syne, sans-serif; font-size: 1.4rem; font-weight: 700; margin: 32px 0 14px; color: var(--text-primary); }

        /* Inline */
        .rich-editor-content strong { color: var(--text-primary); font-weight: 700; }
        .rich-editor-content em { font-style: italic; }
        .rich-editor-content s { text-decoration: line-through; opacity: 0.6; }
        .rich-editor-content code { background: var(--bg-elevated); color: var(--accent-soft); padding: 2px 8px; border-radius: 6px; font-family: var(--font-mono); font-size: 0.88em; }

        /* Blockquote */
        .rich-editor-content blockquote {
          border-left: 4px solid var(--accent); padding: 16px 32px;
          margin: 40px 0; font-style: italic; color: var(--text-muted);
          font-size: 1.2rem; line-height: 1.6;
          background: rgba(124,58,237,0.04); border-radius: 0 12px 12px 0;
        }

        /* Code Block */
        .rich-editor-content pre {
          background: var(--bg-elevated); border: 1px solid var(--border-subtle);
          border-radius: 16px; padding: 28px 32px; margin: 32px 0; overflow-x: auto;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
        }
        .rich-editor-content pre code { background: none; color: var(--text-primary); padding: 0; font-size: inherit; line-height: 1.7; opacity: 0.95; }

        /* Lists */
        .rich-editor-content ul, .rich-editor-content ol { padding-left: 28px; margin-bottom: 24px; }
        .rich-editor-content li { margin-bottom: 8px; line-height: 1.7; }
        .rich-editor-content ul li { list-style-type: disc; }
        .rich-editor-content ol li { list-style-type: decimal; }

        .rich-editor-content hr { border: none; border-top: 1px solid var(--border-subtle); margin: 48px 0; }
        .rich-editor-content ::selection { background: rgba(124,58,237,0.25); }

        /* ── Table ─────────────────────────────────────────────────── */
        .rich-editor-content table {
          border-collapse: collapse; width: auto; min-width: 200px; margin: 32px 0;
          border-radius: 12px; overflow: hidden;
          border: 1px solid var(--border-subtle);
        }
        .rich-editor-content th {
          background: rgba(124, 58, 237, 0.15); color: var(--accent);
          font-weight: 800; font-size: 1rem; text-transform: uppercase;
          letter-spacing: 0.05em; padding: 12px 16px;
          border: 1px solid rgba(124, 58, 237, 0.3); text-align: left;
        }
        .rich-editor-content td {
          padding: 12px 16px; border: 1px solid rgba(124, 58, 237, 0.15);
          color: var(--text-secondary); vertical-align: top;
          transition: background 0.2s;
          position: relative;
        }
        .rich-editor-content .selectedCell {
          background: rgba(124, 58, 237, 0.1) !important;
          border: 2px solid var(--accent) !important;
          z-index: 5;
        }
        .rich-editor-content tr:hover td { background: rgba(124,58,237,0.04); }
        .rich-editor-content .selectedCell:after {
          z-index: 2; position: absolute; content: ""; left: 0; right: 0; top: 0; bottom: 0;
          background: rgba(124,58,237,0.15); pointer-events: none;
        }
        .rich-editor-content .column-resize-handle {
          position: absolute; right: -1px; top: 0; bottom: 0; width: 2px;
          background: var(--accent); pointer-events: none;
          z-index: 20;
          opacity: 0;
        }
        .rich-editor-content table:hover .column-resize-handle {
          opacity: 0.8;
        }
        .tableWrapper { overflow-x: auto; padding: 10px 0; }
        .rich-editor-content tr:nth-child(even) td { background: rgba(255,255,255,0.01); }

        /* Table Alignment Support */
        .rich-editor-content table[style*="text-align: center"] { margin-left: auto !important; margin-right: auto !important; }
        .rich-editor-content table[style*="text-align: right"] { margin-left: auto !important; margin-right: 0 !important; }
        .rich-editor-content table[style*="text-align: left"] { margin-left: 0 !important; margin-right: auto !important; }

        /* ── Callout Cards ──────────────────────────────────────────── */
        .rich-editor-content .callout {
          margin: 40px 0; padding: 24px 28px; border-radius: 16px;
          border: 1px solid var(--border-subtle);
          background: rgba(255,255,255,0.02);
        }
        .rich-editor-content .callout-success {
          border-color: rgba(0,255,170,0.25);
          background: rgba(0,255,170,0.04);
        }
        .rich-editor-content .callout-success strong { color: #00ffaa; }
        .rich-editor-content .callout-info {
          border-color: rgba(59,130,246,0.3);
          background: rgba(59,130,246,0.05);
        }
        .rich-editor-content .callout-info strong { color: #60a5fa; }
        .rich-editor-content .callout-tip {
          border-color: rgba(245,158,11,0.3);
          background: rgba(245,158,11,0.05);
        }
        .rich-editor-content .callout-tip strong { color: #fbbf24; }
        .rich-editor-content .callout-warning {
          border-color: rgba(239,68,68,0.3);
          background: rgba(239,68,68,0.05);
        }
        .rich-editor-content .callout-warning strong { color: #f87171; }
        .rich-editor-content .callout p { margin-bottom: 8px; }
        .rich-editor-content .callout p:last-child { margin-bottom: 0; }

        /* ── Links ──────────────────────────────────────────────────── */
        .rich-editor-content a.article-link {
          color: var(--accent); text-decoration: underline;
          text-underline-offset: 3px; font-weight: 500;
          transition: color 0.2s;
        }
        .rich-editor-content a.article-link:hover { color: var(--accent-glow); }

        /* Link popover */
        .link-popover { min-width: 280px; right: 0 !important; left: auto !important; }
        .link-dialog-title { font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 12px; }
        .link-field { margin-bottom: 10px; }
        .link-field label { display: block; font-size: 0.75rem; font-weight: 600; color: var(--text-muted); margin-bottom: 4px; }
        .link-field input {
          width: 100%; background: var(--bg-secondary); border: 1px solid var(--border-subtle);
          border-radius: 8px; padding: 8px 10px; color: var(--text-primary); font-size: 0.85rem; outline: none;
        }
        .link-field input:focus { border-color: var(--accent); }
        .link-actions { display: flex; gap: 8px; margin-top: 12px; }
        .link-cancel {
          flex: 1; padding: 8px; border-radius: 8px; border: 1px solid var(--border-subtle);
          background: var(--bg-card); color: var(--text-muted); font-size: 0.82rem; font-weight: 600; cursor: pointer;
        }
        .link-insert {
          flex: 2; padding: 8px; border-radius: 8px; border: none;
          background: var(--gradient-purple); color: white; font-size: 0.82rem; font-weight: 700; cursor: pointer;
        }
      `}</style>
    </div>
  )
}
