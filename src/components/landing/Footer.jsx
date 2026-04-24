import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: '#2C3E2D' }}>
      {/* Divider */}
      <div style={{ borderTop: '1px solid #3D5A3E' }} />

      {/* Main row */}
      <div
        className="flex items-center justify-between flex-wrap gap-4 px-12 py-5"
        style={{ minHeight: 80 }}
      >
        {/* Logo left */}
        <span className="font-cormorant font-semibold text-white" style={{ fontSize: 18 }}>
          Glow-Up Advisor
        </span>

        {/* Links center */}
        <div className="flex items-center gap-8">
          {[['Features', '#features'], ['How It Works', '#how-it-works'], ['Dashboard', '/login'], ['Get Started', '/login']].map(([label, href]) => {
            const isRoute = href.startsWith('/');
            return isRoute ? (
              <Link
                key={label}
                to={href}
                className="font-jost transition-colors duration-150"
                style={{ fontSize: 12, color: '#9AAA9A' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#9AAA9A'; }}
              >
                {label}
              </Link>
            ) : (
              <a
                key={label}
                href={href}
                className="font-jost transition-colors duration-150"
                style={{ fontSize: 12, color: '#9AAA9A' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#9AAA9A'; }}
              >
                {label}
              </a>
            );
          })}
        </div>

        {/* Social icons right */}
        <div className="flex items-center gap-4">
          {['IG', 'TW', 'TK'].map((s) => (
            <button
              key={s}
              className="font-jost font-medium text-xs transition-colors duration-150"
              style={{ color: '#9AAA9A' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#9AAA9A'; }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center pb-4">
        <p className="font-jost" style={{ fontSize: 11, color: '#6B8F6C' }}>
          © {new Date().getFullYear()} Glow-Up Advisor. All rights reserved.
        </p>
      </div>
    </footer>
  );
}