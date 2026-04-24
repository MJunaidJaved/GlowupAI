import { api, removeToken } from "../../api/client"

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

import {
  LayoutDashboard, MessageCircle, CalendarCheck,
  TrendingUp, BookOpen, Heart, Settings, LogOut,
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',        path: '/dashboard' },
  { icon: MessageCircle,   label: 'Chat with Advisor',path: '/chat' },
  { icon: CalendarCheck,   label: 'My Routine',       path: '/routine' },
  { icon: TrendingUp,      label: 'Progress Tracker', path: '/progress' },
  { icon: BookOpen,        label: 'Skin Diary',       path: '/diary' },
  { icon: Heart,           label: 'Wellness Tracker', path: '/wellness' },
  { icon: Settings,        label: 'Settings',         path: '/settings' },
];


export default function AppSidebar() {
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => { api.get('/api/auth/me').then(setUser).catch(() => {}); }, []);

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-40 bg-white"
        style={{ borderRight: '1px solid #E2E8E2' }}
        animate={{ width: expanded ? 240 : 68 }}
        transition={{ duration: 0.22 }}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 overflow-hidden" style={{ borderBottom: '1px solid #E2E8E2' }}>
          <div
            className="w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0 font-cormorant font-bold text-sm"
            style={{ background: '#C8A882', color: '#fff' }}
          >
            G
          </div>
          {expanded && (
            <motion.span
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
              className="font-cormorant font-semibold whitespace-nowrap text-sm"
              style={{ color: '#1A1F1A' }}
            >
              Glow-Up
            </motion.span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-0.5 px-2 mt-3 overflow-hidden">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <div key={item.path} className="relative">
                <Link
                  to={item.path}
                  className="flex items-center gap-3 px-3 py-2.5 transition-all duration-150 group relative"
                  style={{
                    borderRadius: 3,
                    borderLeft: isActive ? '3px solid #3D5A3E' : '3px solid transparent',
                    background: isActive ? '#E8EFE8' : 'transparent',
                    color: isActive ? '#3D5A3E' : '#5C6B5C',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = '#E8EFE8';
                      e.currentTarget.style.borderLeftColor = '#3D5A3E';
                      e.currentTarget.style.color = '#3D5A3E';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderLeftColor = 'transparent';
                      e.currentTarget.style.color = '#5C6B5C';
                    }
                  }}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {expanded && (
                    <motion.span
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
                      className="font-jost text-[13px] font-medium whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                  {!expanded && (
                    <div
                      className="absolute left-full ml-3 px-3 py-1.5 text-white text-xs font-jost rounded-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50"
                      style={{ background: '#1A1F1A', fontSize: 11 }}
                    >
                      {item.label}
                    </div>
                  )}
                </Link>
              </div>
            );
          })}
        </nav>

        {/* User + logout */}
        <div className="p-2 overflow-hidden" style={{ borderTop: '1px solid #E2E8E2' }}>
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <div
              className="w-7 h-7 rounded-sm flex items-center justify-center flex-shrink-0 font-jost text-xs font-bold text-white"
              style={{ background: '#3D5A3E' }}
            >
              {user?.full_name?.[0]?.toUpperCase() || '?'}
            </div>
            {expanded && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 min-w-0">
                <p className="font-jost text-xs font-semibold truncate" style={{ color: '#1A1F1A' }}>{user?.full_name || 'User'}</p>
                <p className="font-jost text-[10px] truncate" style={{ color: '#9AAA9A' }}>{user?.email || ''}</p>
              </motion.div>
            )}
          </div>
          <button
            onClick={() => { removeToken(); window.location.href = '/login'; }}
            className="flex items-center gap-3 px-3 py-2 w-full transition-colors duration-150"
            style={{ color: '#9AAA9A', borderRadius: 3 }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#3D5A3E'; e.currentTarget.style.background = '#E8EFE8'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#9AAA9A'; e.currentTarget.style.background = 'transparent'; }}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {expanded && <span className="font-jost text-xs">Log Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Mobile bottom nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white px-1 py-2 flex justify-around"
        style={{ borderTop: '1px solid #E2E8E2' }}
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center gap-0.5 px-2 py-1.5 transition-colors"
              style={isActive ? { color: '#3D5A3E' } : { color: '#9AAA9A' }}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-jost" style={{ fontSize: 9 }}>{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}