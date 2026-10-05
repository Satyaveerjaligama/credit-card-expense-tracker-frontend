'use client';

import React, { useState } from 'react';
import NextLink from 'next/link';
import { useAuth } from '../../context/AuthContext';
import {
  CreditCard,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cardLimit, setCardLimit] = useState(100000); // 1 Lakh
  const [personalLimit, setPersonalLimit] = useState(10000); // 10 Thousand
  const [cardLast4, setCardLast4] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please provide your name, email, and password.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await register({
        name,
        email,
        password,
        cardLimit: Number(cardLimit),
        personalLimit: Number(personalLimit),
        cardLast4,
        alertThreshold: 80,
      });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        padding: '1.5rem',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '520px',
          padding: '2.25rem',
          boxShadow: 'var(--shadow-lg)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'var(--sage-100)',
              color: 'var(--sage-600)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.75rem',
              border: '1px solid var(--sage-200)',
            }}
          >
            <CreditCard size={24} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Start Tracking Credit Expenses
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Set your credit card limit and personal monthly spending ceiling
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--rose-50)',
              color: 'var(--rose-600)',
              border: '1px solid var(--rose-200)',
              fontSize: '0.825rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="register-name">
              Full Name *
            </label>
            <input
              type="text"
              id="register-name"
              required
              placeholder="e.g. Test name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-email">
              Email Address *
            </label>
            <input
              type="email"
              id="register-email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-password">
              Password * (Min 8 chars)
            </label>
            <input
              type="password"
              id="register-password"
              required
              minLength={8}
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Initial Limit Preferences */}
          <div
            style={{
              backgroundColor: 'var(--sage-50)',
              padding: '1rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--sage-200)',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ fontSize: '0.785rem', fontWeight: 700, color: 'var(--sage-700)', marginBottom: '0.75rem' }}>
              INITIAL CREDIT & BUDGET LIMITS
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="form-label" htmlFor="register-card-limit" style={{ fontSize: '0.775rem' }}>
                  Bank Card Limit (₹)
                </label>
                <input
                  type="number"
                  id="register-card-limit"
                  required
                  value={cardLimit}
                  onChange={(e) => setCardLimit(Number(e.target.value))}
                  className="form-input"
                  style={{ backgroundColor: '#FFFFFF' }}
                  placeholder="100000"
                />
              </div>

              <div>
                <label className="form-label" htmlFor="register-personal-limit" style={{ fontSize: '0.775rem' }}>
                  Personal Budget (₹)
                </label>
                <input
                  type="number"
                  id="register-personal-limit"
                  required
                  value={personalLimit}
                  onChange={(e) => setPersonalLimit(Number(e.target.value))}
                  className="form-input"
                  style={{ backgroundColor: '#FFFFFF' }}
                  placeholder="10000"
                />
              </div>
            </div>

            <div style={{ marginTop: '0.75rem' }}>
              <label className="form-label" htmlFor="register-card-last4" style={{ fontSize: '0.775rem' }}>
                Card Last 4 Digits
              </label>
              <input
                type="text"
                id="register-card-last4"
                maxLength={4}
                value={cardLast4}
                onChange={(e) => setCardLast4(e.target.value)}
                className="form-input"
                style={{ backgroundColor: '#FFFFFF' }}
                placeholder="4589"
              />
            </div>
          </div>

          <button
            type="submit"
            id="btn-register-submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem' }}
          >
            <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Already have an account? </span>
          <NextLink
            href="/login"
            id="link-go-to-login"
            style={{ color: 'var(--sage-600)', fontWeight: 600, textDecoration: 'none' }}
          >
            Sign in
          </NextLink>
        </div>

        {/* Security badge */}
        <div
          style={{
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            fontSize: '0.75rem',
            color: 'var(--text-faint)',
          }}
        >
          <ShieldCheck size={14} color="var(--sage-500)" />
          <span>AES-256 Field Level Encryption Active</span>
        </div>
      </div>
    </div>
  );
}
