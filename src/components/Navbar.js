'use client';

import React, { useState } from 'react';
import Link from 'next/navigation';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import {
  CreditCard,
  LayoutDashboard,
  BarChart3,
  SlidersHorizontal,
  User,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Do not show full nav on auth pages
  const isAuthPage = pathname === '/login' || pathname === '/register';

  const navLinks = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'History & Charts', href: '/history', icon: BarChart3 },
    { name: 'Limits & Budget', href: '/limits', icon: SlidersHorizontal },
    { name: 'Account', href: '/account', icon: User },
  ];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border-light)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '70px',
        }}
      >
        {/* Brand Logo */}
        <NextLink
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            textDecoration: 'none',
            color: 'var(--text-main)',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: 'var(--sage-100)',
              border: '1px solid var(--sage-200)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--sage-600)',
            }}
          >
            <CreditCard size={20} strokeWidth={2.2} />
          </div>
          <div>
            <div
              style={{
                fontWeight: 800,
                fontSize: '1.15rem',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                color: 'var(--text-main)',
              }}
            >
              AuraSpend
            </div>
            <div
              style={{
                fontSize: '0.68rem',
                color: 'var(--text-muted)',
                fontWeight: 500,
              }}
            >
              Credit Expense & Limit Guard
            </div>
          </div>
        </NextLink>

        {/* Desktop Nav Links */}
        {!isAuthPage && isAuthenticated && (
          <nav
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '0.5rem',
            }}
            className="desktop-nav"
          >
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <NextLink
                  key={item.href}
                  href={item.href}
                  id={`nav-link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.5rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 500,
                    textDecoration: 'none',
                    color: isActive ? 'var(--sage-700)' : 'var(--text-muted)',
                    backgroundColor: isActive ? 'var(--sage-100)' : 'transparent',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <Icon size={16} />
                  <span>{item.name}</span>
                </NextLink>
              );
            })}
          </nav>
        )}

        {/* Right user menu / actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {!isAuthPage && isAuthenticated ? (
            <>
              {/* Card info chip */}
              <div
                style={{
                  display: 'none',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--slate-blue-50)',
                  border: '1px solid var(--slate-blue-100)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--slate-blue-700)',
                }}
                className="desktop-card-chip"
              >
                <CreditCard size={14} />
                <span>{user?.cardName || 'Primary Card'}</span>
                <span style={{ opacity: 0.6 }}>•</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
                  •••• {user?.cardLast4 || '4589'}
                </span>
              </div>

              {/* User Avatar & Logout */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <NextLink
                  href="/account"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.35rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    textDecoration: 'none',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-light)',
                    backgroundColor: 'var(--bg-card)',
                  }}
                  title="View Account"
                >
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--sage-200)',
                      color: 'var(--sage-700)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <span
                    style={{
                      fontSize: '0.825rem',
                      fontWeight: 600,
                      maxWidth: '100px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    className="desktop-username"
                  >
                    {user?.name?.split(' ')[0] || 'Account'}
                  </span>
                </NextLink>

                <button
                  onClick={logout}
                  id="btn-logout"
                  className="btn btn-secondary btn-sm"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.4rem 0.6rem',
                  }}
                  title="Sign Out"
                >
                  <LogOut size={15} />
                  <span className="desktop-logout-text">Exit</span>
                </button>
              </div>

              {/* Mobile hamburger toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                id="btn-mobile-menu-toggle"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-main)',
                  padding: '0.4rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                className="mobile-toggle-btn"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </>
          ) : isAuthPage ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.8rem',
                color: 'var(--sage-600)',
                backgroundColor: 'var(--sage-50)',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--sage-200)',
              }}
            >
              <ShieldCheck size={15} />
              <span>AES-256 Protected</span>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <NextLink href="/login" className="btn btn-secondary btn-sm">
                Sign In
              </NextLink>
              <NextLink href="/register" className="btn btn-primary btn-sm">
                Get Started
              </NextLink>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && !isAuthPage && isAuthenticated && (
        <div
          style={{
            borderTop: '1px solid var(--border-light)',
            backgroundColor: 'var(--bg-card)',
            padding: '1rem 1.5rem 1.5rem',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          {/* Card Info in Mobile */}
          <div
            style={{
              padding: '0.65rem 0.85rem',
              backgroundColor: 'var(--slate-blue-50)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1rem',
              fontSize: '0.8rem',
              color: 'var(--slate-blue-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>{user?.cardName || 'Primary Card'}</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>•••• {user?.cardLast4 || '4589'}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <NextLink
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.925rem',
                    fontWeight: isActive ? 600 : 500,
                    textDecoration: 'none',
                    color: isActive ? 'var(--sage-700)' : 'var(--text-main)',
                    backgroundColor: isActive ? 'var(--sage-100)' : 'transparent',
                  }}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </NextLink>
              );
            })}
          </div>
        </div>
      )}

      {/* Responsive media styling for desktop vs mobile */}
      <style jsx>{`
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
          .desktop-card-chip {
            display: inline-flex !important;
          }
          .mobile-toggle-btn {
            display: none !important;
          }
        }
        @media (max-width: 640px) {
          .desktop-username,
          .desktop-logout-text {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
