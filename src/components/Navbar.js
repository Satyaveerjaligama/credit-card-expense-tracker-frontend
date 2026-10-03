'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import {
  CreditCard,
  LayoutDashboard,
  History,
  SlidersHorizontal,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if current route is an auth page (login or register)
  const isAuthPage = pathname === '/login' || pathname === '/register';

  // Navigation items strictly limited to Dashboard, History, Limit
  const navLinks = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'History', href: '/history', icon: History },
    { name: 'Limit', href: '/limits', icon: SlidersHorizontal },
  ];

  const isAccountActive = pathname === '/account';

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-light)',
        boxShadow: '0 1px 3px rgba(32, 45, 38, 0.03), 0 4px 12px -2px rgba(32, 45, 38, 0.02)',
        transition: 'all var(--transition-fast)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '66px',
        }}
      >
        {/* Brand / App Name */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            textDecoration: 'none',
            color: 'var(--text-main)',
          }}
          className="brand-link"
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--sage-500) 0%, var(--sage-700) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(66, 112, 84, 0.25)',
              flexShrink: 0,
            }}
          >
            <CreditCard size={19} strokeWidth={2.2} />
          </div>
          <span
            style={{
              fontWeight: 800,
              fontSize: '1.2rem',
              letterSpacing: '-0.025em',
              color: 'var(--text-main)',
            }}
          >
            AuraSpend
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        {!isAuthPage && isAuthenticated && (
          <nav
            className="desktop-nav"
            style={{
              alignItems: 'center',
              gap: '0.3rem',
              backgroundColor: 'var(--sage-50)',
              padding: '0.28rem 0.35rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-light)',
            }}
          >
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname === item.href || pathname.startsWith(item.href + '/');

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  id={`nav-link-${item.name.toLowerCase()}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.42rem 0.95rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.85rem',
                    fontWeight: isActive ? 600 : 500,
                    textDecoration: 'none',
                    color: isActive ? 'var(--sage-700)' : 'var(--text-muted)',
                    backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                    boxShadow: isActive ? '0 1px 4px rgba(32, 45, 38, 0.08)' : 'none',
                    border: isActive ? '1px solid var(--sage-200)' : '1px solid transparent',
                    transition: 'all var(--transition-fast)',
                  }}
                  className={`nav-pill ${isActive ? 'nav-pill-active' : ''}`}
                >
                  <Icon size={15} strokeWidth={isActive ? 2.3 : 2} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right Section: Account & Logout (or Auth Buttons) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {!isAuthPage && isAuthenticated ? (
            <>
              {/* Account Section with User Name */}
              <Link
                href="/account"
                id="nav-account-section"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.55rem',
                  padding: '0.32rem 0.85rem 0.32rem 0.38rem',
                  borderRadius: 'var(--radius-full)',
                  textDecoration: 'none',
                  color: 'var(--text-main)',
                  border: isAccountActive
                    ? '1px solid var(--sage-400)'
                    : '1px solid var(--border-light)',
                  backgroundColor: isAccountActive ? 'var(--sage-50)' : 'var(--bg-card)',
                  boxShadow: isAccountActive
                    ? '0 1px 4px rgba(66, 112, 84, 0.12)'
                    : '0 1px 2px rgba(0, 0, 0, 0.03)',
                  transition: 'all var(--transition-fast)',
                }}
                className="account-pill"
                title="Account Settings"
              >
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--sage-100) 0%, var(--sage-200) 100%)',
                    color: 'var(--sage-700)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1.5px solid #FFFFFF',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    flexShrink: 0,
                  }}
                >
                  {user?.name ? user.name[0].toUpperCase() : <User size={14} />}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
                  <span
                    style={{
                      fontSize: '0.66rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      color: isAccountActive ? 'var(--sage-600)' : 'var(--text-faint)',
                    }}
                    className="account-label"
                  >
                    Account
                  </span>
                  <span
                    style={{
                      fontSize: '0.825rem',
                      fontWeight: 600,
                      color: isAccountActive ? 'var(--sage-700)' : 'var(--text-main)',
                      maxWidth: '120px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    className="account-user-name"
                  >
                    {user?.name || 'My Profile'}
                  </span>
                </div>
              </Link>

              {/* Logout Button */}
              <button
                onClick={logout}
                id="btn-logout"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-light)',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--text-muted)',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
                className="btn-logout-custom"
                title="Logout from AuraSpend"
              >
                <LogOut size={14} strokeWidth={2.2} />
                <span className="logout-text">Logout</span>
              </button>

              {/* Mobile Hamburger Toggle Button */}
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
                  borderRadius: 'var(--radius-sm)',
                }}
                className="mobile-toggle-btn"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </>
          ) : isAuthPage ? (
            // On login / register pages, keep header minimalist
            null
          ) : (
            // Guest / Logged out state
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Link href="/login" className="btn btn-secondary btn-sm" style={{ borderRadius: 'var(--radius-full)' }}>
                Sign In
              </Link>
              <Link href="/register" className="btn btn-primary btn-sm" style={{ borderRadius: 'var(--radius-full)' }}>
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && !isAuthPage && isAuthenticated && (
        <div
          style={{
            borderTop: '1px solid var(--border-light)',
            backgroundColor: '#FFFFFF',
            padding: '1rem 1.25rem 1.5rem',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem',
          }}
          className="mobile-drawer"
        >
          {/* Account Profile Card in Mobile */}
          <Link
            href="/account"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              backgroundColor: isAccountActive ? 'var(--sage-100)' : 'var(--sage-50)',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              border: isAccountActive ? '1px solid var(--sage-300)' : '1px solid var(--sage-100)',
              marginBottom: '0.4rem',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--sage-200) 0%, var(--sage-300) 100%)',
                color: 'var(--sage-700)',
                fontSize: '0.9rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {user?.name ? user.name[0].toUpperCase() : <User size={16} />}
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--sage-600)', fontWeight: 600, textTransform: 'uppercase' }}>
                Account
              </div>
              <div style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {user?.name || 'My Profile'}
              </div>
            </div>
          </Link>

          {/* Navigation Links in Mobile */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname === item.href || pathname.startsWith(item.href + '/');

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.7rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.925rem',
                    fontWeight: isActive ? 600 : 500,
                    textDecoration: 'none',
                    color: isActive ? 'var(--sage-700)' : 'var(--text-main)',
                    backgroundColor: isActive ? 'var(--sage-100)' : 'transparent',
                    border: isActive ? '1px solid var(--sage-200)' : '1px solid transparent',
                  }}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Logout in Mobile */}
          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem', marginTop: '0.35rem' }}>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.7rem 1rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--rose-600)',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Scoped CSS styles for responsiveness and micro-interactions */}
      <style jsx>{`
        .desktop-nav {
          display: none;
        }
        .mobile-toggle-btn {
          display: flex;
        }

        .nav-pill:not(.nav-pill-active):hover {
          color: var(--text-main) !important;
          background-color: rgba(255, 255, 255, 0.7) !important;
        }

        .account-pill:hover {
          border-color: var(--sage-300) !important;
          box-shadow: 0 2px 8px rgba(66, 112, 84, 0.1) !important;
          transform: translateY(-1px);
        }

        .btn-logout-custom:hover {
          background-color: var(--rose-50) !important;
          border-color: var(--rose-200) !important;
          color: var(--rose-600) !important;
          transform: translateY(-1px);
          box-shadow: 0 2px 6px rgba(183, 78, 73, 0.1);
        }

        .brand-link:hover div {
          transform: scale(1.04);
          transition: transform 0.2s ease;
        }

        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-toggle-btn {
            display: none !important;
          }
        }

        @media (max-width: 640px) {
          .account-label {
            display: none;
          }
          .account-user-name {
            max-width: 80px !important;
          }
          .logout-text {
            display: none;
          }
          .btn-logout-custom {
            padding: 0.45rem !important;
          }
        }
      `}</style>
    </header>
  );
}
