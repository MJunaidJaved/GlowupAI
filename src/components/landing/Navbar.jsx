import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 bg-white"
        style={{ height: 64, borderBottom: '1px solid #E2E8E2' }}
      >
        <div className="h-full flex items-center justify-between" style={{ paddingLeft: 48, paddingRight: 48 }}>
          {/* Left nav links */}
          <div className="hidden md:flex items-center gap-8 w-[220px]">
            {[['Features', '#features'], ['How It Works', '#how-it-works']].map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="font-jost text-[13px] font-medium transition-colors duration-150"
                style={{ color: '#1A1F1A', letterSpacing: '0.04em' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#3D5A3E'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#1A1F1A'; }}
              >
                {label}
              </a>
            ))}
          </div>

          {/* Center logo */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <Link to="/" className="font-cormorant text-xl font-semibold" style={{ color: '#1A1F1A' }}>
              Glow-Up Advisor
            </Link>
          </div>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-4 w-[220px] justify-end">
            <Link
              to="/login"
              className="font-jost text-[13px] font-medium transition-colors duration-150"
              style={{ color: '#1A1F1A', letterSpacing: '0.04em' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#3D5A3E'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#1A1F1A'; }}
            >
              Log In
            </Link>
            <Link to="/login">
              <motion.button
                className="font-jost text-[12px] font-semibold tracking-[0.1em] uppercase text-white"
                style={{ background: '#3D5A3E', padding: '10px 22px', borderRadius: 3 }}
                whileHover={{ backgroundColor: '#2C3E2D', y: -1, boxShadow: '0 4px 14px rgba(61,90,62,0.22)' }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                Get Started
              </motion.button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden" onClick={() => setMobileOpen(true)} style={{ color: '#1A1F1A' }}>
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col"
          >
            <div className="flex justify-between items-center px-6 py-4" style={{ borderBottom: '1px solid #E2E8E2' }}>
              <span className="font-cormorant text-xl font-semibold" style={{ color: '#1A1F1A' }}>Glow-Up Advisor</span>
              <button onClick={() => setMobileOpen(false)}><X className="w-6 h-6" style={{ color: '#1A1F1A' }} /></button>
            </div>
            <div className="flex flex-col items-center gap-8 mt-16 px-6">
              {[['Features', '#features'], ['How It Works', '#how-it-works']].map(([label, href]) => (
                <a key={label} href={href} onClick={() => setMobileOpen(false)}
                  className="font-cormorant text-2xl font-semibold" style={{ color: '#1A1F1A' }}>
                  {label}
                </a>
              ))}
              <div className="flex flex-col gap-3 mt-8 w-64">
                <Link to="/login" onClick={() => setMobileOpen(false)}
                  className="w-full text-center font-jost text-sm font-medium py-3 border rounded-[3px]"
                  style={{ color: '#3D5A3E', borderColor: '#3D5A3E' }}>
                  Log In
                </Link>
                <Link to="/login" onClick={() => setMobileOpen(false)}
                  className="w-full text-center font-jost text-xs font-semibold tracking-[0.1em] uppercase text-white py-3.5 rounded-[3px]"
                  style={{ background: '#3D5A3E' }}>
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}