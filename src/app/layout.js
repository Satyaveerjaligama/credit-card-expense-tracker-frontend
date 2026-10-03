import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { ShieldCheck, Lock, Database } from 'lucide-react';

export const metadata = {
  title: 'SwipeSense - Credit Card Expense & Limit Tracker',
  description:
    'Track your credit card expenses against your personal spending limit, receive real-time threshold warnings, and manage your budget with production-grade encryption.',
  keywords: 'credit card tracker, expense tracker, personal budget, credit card limit alert, finance manager',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <AuthProvider>
          <Navbar />
          <main style={{ flex: 1, paddingBottom: '3rem' }}>{children}</main>
          <footer
            style={{
              borderTop: '1px solid var(--border-light)',
              backgroundColor: 'var(--bg-card)',
              padding: '1.75rem 0',
              marginTop: 'auto',
            }}
          >
            <div
              className="container"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  SwipeSense
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  © 2026 Production Credit Expense Tracker
                </span>
              </div>

              {/* Security badges */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Lock size={13} color="var(--sage-600)" />
                  <span>AES-256-GCM Field Encryption</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <ShieldCheck size={13} color="var(--slate-blue-500)" />
                  <span>Bcrypt-12 & JWT Security</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Database size={13} color="var(--amber-500)" />
                  <span>Isolated MongoDB Store</span>
                </div>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
