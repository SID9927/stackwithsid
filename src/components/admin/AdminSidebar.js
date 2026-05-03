"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  Layers,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function AdminSidebar({ isCollapsed, setIsCollapsed, zIndex = 100 }) {
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { supabase } = await import("@/lib/supabase");
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUser(user);
    };
    fetchUser();
  }, []);

  const menuItems = [
    { name: "Dashboard", path: "/admin", icon: <LayoutDashboard size={22} /> },
    { name: "Articles", path: "/admin/articles", icon: <FileText size={22} /> },
    {
      name: "Interviews",
      path: "/admin/interviews",
      icon: <MessageSquare size={22} />,
    },
    { name: "Settings", path: "/admin/settings", icon: <Settings size={22} /> },
  ];

  const handleSignOut = async () => {
    const { supabase } = await import("@/lib/supabase");
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  };

  const handleNavClick = () => {
    if (typeof window !== "undefined" && window.innerWidth <= 1024) {
      setIsCollapsed(true);
    }
  };

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      isCollapsed ? "68px" : "260px",
    );
  }, [isCollapsed]);

  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : "A";
  const userDisplay = user?.email ? user.email.split('@')[0] : "Admin";

  return (
    <motion.aside
      className={`admin-sidebar ${isCollapsed ? "collapsed" : "expanded"}`}
      animate={{
        width: isCollapsed ? 68 : 260
      }}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        height: "100dvh",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: zIndex,
      }}
      transition={{
        duration: 0.5,
        cubicBezier: [0.16, 1, 0.3, 1],
      }}
    >
      <div className="sidebar-brand">
        <div className="brand-main">
          <div
            className="brand-logo"
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{ cursor: "pointer" }}
          >
            <Layers size={20} color="white" />
          </div>
          {!isCollapsed && (
            <div className="brand-text">
              <h2>SidCMS</h2>
              <p>Admin Portal</p>
            </div>
          )}
        </div>
      </div>

      <div className="sidebar-divider" />

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.path}
            onClick={handleNavClick}
            className={`nav-item ${pathname === item.path ? "active" : ""}`}
          >
            <span className="nav-icon">{item.icon}</span>

            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="nav-label"
                >
                  {item.name}
                </motion.span>
              )}
            </AnimatePresence>

            {isCollapsed && <div className="nav-tooltip">{item.name}</div>}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-divider" />
        
        {!isCollapsed && (
          <div className="user-profile">
            <div className="user-avatar">{userInitial}</div>
            <div className="user-info">
              <span className="user-name">{userDisplay}</span>
              <span className="user-role">Full Access</span>
            </div>
            <button className="icon-btn logout-mini" onClick={handleSignOut} title="Sign Out">
              <LogOut size={16} />
            </button>
          </div>
        )}

        <div className="footer-tools">
          {isCollapsed && (
            <div className="footer-tool-avatar" onClick={handleSignOut}>
              <div className="user-avatar-mini">{userInitial}</div>
              <div className="nav-tooltip">Sign Out</div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .admin-sidebar {
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-subtle);
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          z-index: 100 !important;
          transition:
            background 0.4s ease,
            border-color 0.4s ease;
          box-shadow: 8px 0 32px rgba(0, 0, 0, 0.12);
          overflow: hidden;
        }

        .sidebar-divider {
          height: 1px;
          background-color: var(--border-subtle);
          margin: 8px 16px;
        }

        .collapsed .sidebar-divider {
          margin: 8px;
        }

        .sidebar-brand {
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 80px;
          transition: justify-content 0.3s;
          font-family: var(--font-syne);
        }

        .collapsed .sidebar-brand {
          justify-content: center;
          padding: 16px 0;
        }

        .brand-main {
          display: flex;
          align-items: center;
          gap: 12px;
          overflow: hidden;
        }

        .brand-logo {
          width: 36px;
          height: 36px;
          background: var(--gradient-purple);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25);
        }

        .brand-text {
          display: flex;
          flex-direction: column;
        }

        .brand-text h2 {
          font-size: 1.1rem;
          font-weight: 800;
          margin: 0;
          line-height: 1;
          letter-spacing: -0.01em;
          color: var(--text-primary);
          white-space: nowrap;
        }

        .brand-text p {
          font-size: 0.65rem;
          color: var(--text-muted);
          margin: 0;
          margin-top: 4px;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.1em;
          white-space: nowrap;
        }

        .sidebar-nav {
          flex: 1;
          padding: 12px 10px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          overflow-y: auto;
          min-height: 0;
          font-family: var(--font-syne);
        }

        .nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          flex-shrink: 0;
          transition: transform 0.2s ease;
        }
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          flex-shrink: 0;
          transition: transform 0.2s ease;
        }

        .collapsed .nav-item {
          justify-content: center;
          padding: 10px;
          width: 44px;
          height: 44px;
          margin: 8px auto;
          gap: 0;
        }

        .nav-tooltip {
          position: absolute;
          left: 100%;
          margin-left: 15px;
          background: var(--text-primary);
          color: var(--bg-primary);
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 700;
          opacity: 0;
          pointer-events: none;
          transition: all 0.2s ease;
          white-space: nowrap;
          z-index: 1000;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .nav-item:hover .nav-tooltip,
        .footer-tool:hover .nav-tooltip {
          opacity: 1;
          transform: translateX(5px);
        }

        .nav-item:hover {
          background: rgba(0, 0, 0, 0.03);
        }

        .nav-item.active {
          color: #ff7d00 !important;
          background: rgba(255, 125, 0, 0.1) !important;
        }

        .nav-item.active .nav-icon {
          color: #ff7d00 !important;
        }

        [data-theme='dark'] .nav-item.active {
          background: rgba(255, 125, 0, 0.15) !important;
        }

        .user-profile {
          display: flex; align-items: center; gap: 12px; padding: 12px; margin: 12px;
          background: var(--bg-primary); border-radius: 16px; border: 1px solid var(--border-subtle);
        }
        .user-avatar {
          width: 38px; height: 38px; border-radius: 10px; background: var(--gradient-purple);
          display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
        }
        .user-info { display: flex; flex-direction: column; flex: 1; min-width: 0; }
        .user-name { font-size: 0.85rem; font-weight: 700; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .user-role { font-size: 0.7rem; color: var(--text-muted); }
        .logout-mini { 
          width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
          color: var(--text-muted); background: transparent; border: none; cursor: pointer; transition: all 0.2s; 
        }
        .logout-mini:hover { color: #ef4444; background: rgba(239, 68, 68, 0.1); }

        .footer-tools { display: flex; flex-direction: column; gap: 4px; padding: 0 12px 12px; }

        .sidebar-footer {
          padding: 12px 10px 48px 10px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          width: 100%;
          flex-shrink: 0;
          margin-top: auto;
          position: relative;
        }

        .sidebar-footer::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            transparent,
            var(--bg-secondary)
          );
          opacity: 0.5;
          pointer-events: none;
        }

        .sidebar-footer .sidebar-divider {
          margin: 8px 6px;
        }

        .collapsed .sidebar-footer .sidebar-divider {
          margin: 8px 0;
        }

        .footer-tool {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 18px;
          border-radius: 10px;
          color: var(--text-muted);
          font-weight: 700;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s;
          background: none;
          border: none;
          width: 100%;
          font-family: var(--font-syne);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .footer-tool:hover {
          color: var(--text-primary);
          background: var(--bg-card-hover);
        }

        .footer-tool.logout {
          color: #ef4444;
        }

        .footer-tool.logout:hover {
          background: rgba(239, 68, 68, 0.08);
        }

        .footer-tool-avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
          transition: all 0.2s ease;
          width: 44px;
          height: 44px;
          margin: 0 auto;
        }

        .user-avatar-mini {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: var(--gradient-purple);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: 800;
          font-size: 0.85rem;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2);
          transition: transform 0.2s ease;
        }

        .footer-tool-avatar:hover .user-avatar-mini {
          transform: scale(1.1);
        }

        .footer-tool-avatar:hover .nav-tooltip {
          opacity: 1;
          transform: translateX(5px);
        }
      `}</style>
    </motion.aside>
  );
}
