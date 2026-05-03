'use client'

export default function AdminStyles() {
  return (
    <style jsx global>{`
      .admin-layout {
        display: flex;
        min-height: 100vh;
        background: var(--bg-primary);
        color: var(--text-primary);
        position: relative;
        transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
      }
      
      .admin-layout::before {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at top right, rgba(124, 58, 237, 0.05), transparent 40%),
                    radial-gradient(circle at bottom left, rgba(59, 130, 246, 0.05), transparent 40%);
        pointer-events: none;
        z-index: 0;
      }
      
      .admin-main {
        background-color: var(--bg-card);
        min-height: 100vh;
        position: relative;
        z-index: 1;
        flex: 1;
        min-width: 0;
        border-radius: 40px 0 0 0;
        box-shadow: -20px 0 80px rgba(0,0,0,0.05);
        border: 1px solid var(--border-subtle);
        border-right: none;
        margin-left: var(--sidebar-width, 260px);
        transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
      }

      @media (max-width: 1024px) {
        .admin-main { 
          margin-left: 0; 
          border-radius: 0; 
          padding: 0; 
          border-left: none;
          box-shadow: none;
        }
        h1 { font-size: 1.4rem !important; line-height: 1.2; }
        h2 { font-size: 1.1rem !important; }
        .form-header h1 { font-size: 1.5rem !important; margin-top: 8px; }
        .admin-content-wrapper { padding: 20px 16px 80px !important; }
      }

      .admin-overlay {
        display: none;
      }

      @media (max-width: 1024px) {
        .admin-overlay { 
          display: block; 
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(8px);
          z-index: 10;
        }

        /* Mobile Sidebar Hard Overrides */
        .admin-sidebar {
          display: flex !important;
          width: 300px !important;
          left: -320px !important;
          opacity: 0 !important;
          pointer-events: none !important;
          transition: left 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease !important;
          box-shadow: 20px 0 60px rgba(0, 0, 0, 0.5);
          background: var(--bg-secondary) !important;
          border-right: 1px solid var(--border-subtle);
          z-index: 9999 !important;
          transform: none !important; /* Force override framer-motion transform */
        }
        .admin-sidebar.expanded {
          left: 0 !important;
          opacity: 1 !important;
          pointer-events: auto !important;
        }
        .admin-sidebar::before { display: none !important; }
        .admin-sidebar .nav-item { 
          margin: 4px 12px; 
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          gap: 12px !important;
        }
        .admin-sidebar .active-pill { display: none !important; }
      }

      /* Admin UI Shared Styles */
      .glass-card {
        background: var(--bg-card);
        border: 1px solid var(--border-subtle);
        box-shadow: 0 10px 30px rgba(0,0,0,0.04);
        border-radius: 32px;
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        position: relative;
      }
      .glass-card:hover { 
        border-color: var(--accent-soft); 
        background: var(--bg-card-hover);
        transform: translateY(-4px);
        box-shadow: 0 20px 40px rgba(124, 58, 237, 0.08);
      }

      .admin-btn {
        padding: 10px 20px;
        border-radius: var(--radius-btn);
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 8px;
        border: 1px solid transparent;
      }

      .btn-primary { background: var(--gradient-purple); color: white; border: none; box-shadow: 0 4px 12px hsl(270,75%,55%,0.3); }
      .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 16px hsl(270,75%,55%,0.4); }

      .btn-secondary { background: var(--bg-elevated); color: var(--text-primary); border-color: var(--border-subtle); }
      .btn-secondary:hover { border-color: var(--accent); background: var(--bg-card-hover); }

      .admin-table { width: 100%; border-collapse: collapse; }
      .admin-table th { 
        text-align: left; padding: 16px; 
        border-bottom: 1px solid var(--border-subtle); 
        color: var(--text-muted); font-size: 0.8rem; 
        text-transform: uppercase; letter-spacing: 0.1em; 
      }
      .admin-table td { 
        padding: 16px; 
        border-bottom: 1px solid var(--border-subtle); 
        font-size: 0.9rem; color: var(--text-secondary);
      }
      .admin-table tr:hover td { background: rgba(124, 58, 237, 0.02); }

      /* Form Elements Global */
      .field-group input, .field-group select, .field-group textarea {
        background: var(--bg-secondary);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }
      .field-group input:focus, .field-group select:focus, .field-group textarea:focus {
        border-color: var(--accent);
        background: var(--bg-primary);
      }

      /* Global Navigation Overhaul (Kharchaa Style) */
      .nav-item {
        display: flex !important;
        flex-direction: row !important;
        align-items: center !important;
        gap: 16px !important;
        padding: 12px 16px !important;
        margin-bottom: 4px !important;
        border-radius: 12px !important;
        color: var(--text-secondary) !important;
        font-weight: 600 !important;
        font-size: 0.95rem !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
        position: relative !important;
        text-decoration: none !important;
        font-family: var(--font-syne) !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        width: 100% !important;
      }

      .nav-label {
        flex: 1 !important;
        text-align: left !important;
        display: block !important;
      }

      .nav-item:hover {
        background: rgba(0, 0, 0, 0.03) !important;
      }

      .nav-item.active {
        color: var(--accent) !important;
        background: rgba(124, 58, 237, 0.1) !important;
      }

      .nav-item.active .nav-icon {
        color: var(--accent) !important;
      }

      [data-theme='dark'] .nav-item.active {
        background: rgba(124, 58, 237, 0.15) !important;
      }

      .collapsed .nav-item,
      .collapsed .footer-tool-avatar {
        justify-content: center !important;
        padding: 10px !important;
        width: 44px !important;
        height: 44px !important;
        margin: 8px auto !important;
        gap: 0 !important;
        display: flex !important;
      }
    `}</style>
  )
}
