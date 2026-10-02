'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import PageHeader from '../../components/PageHeader';
import {
  User,
  Lock,
  ShieldCheck,
  CreditCard,
  Mail,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function AccountPage() {
  const { user, refreshUser } = useAuth();

  // Profile Edit State
  const [name, setName] = useState(user?.name || '');
  const [cardName, setCardName] = useState(user?.cardName || '');
  const [cardLast4, setCardLast4] = useState(user?.cardLast4 || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password Update State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setProfileLoading(true);
      setProfileError('');
      setProfileSuccess('');

      const res = await api.updateProfile({
        name,
        cardName,
        cardLast4,
      });

      if (res.success) {
        setProfileSuccess('Profile information updated successfully.');
        await refreshUser();
      }
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setPwError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match. Please verify.');
      return;
    }

    try {
      setPwLoading(true);
      setPwError('');
      setPwSuccess('');

      const res = await api.updatePassword({
        currentPassword,
        newPassword,
      });

      if (res.success) {
        setPwSuccess('Password has been securely updated!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setPwError(err.message || 'Failed to update password');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      {/* Header */}
      <PageHeader
        icon={User}
        title="Account & Security Settings"
        description="Manage your personal credentials, linked card details, and production security safeguards"
      />


      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.75rem' }}>
        {/* Left Column: User Details & Profile */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* User Details Card */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--sage-200)',
                  color: 'var(--sage-700)',
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{user?.name || 'Authorized User'}</h2>
                <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>{user?.email}</span>
              </div>
            </div>

            {profileSuccess && (
              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  backgroundColor: 'var(--sage-50)',
                  color: 'var(--sage-700)',
                  border: '1px solid var(--sage-200)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.825rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <CheckCircle2 size={16} />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  backgroundColor: 'var(--rose-50)',
                  color: 'var(--rose-600)',
                  border: '1px solid var(--rose-200)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.825rem',
                  marginBottom: '1rem',
                }}
              >
                {profileError}
              </div>
            )}

            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label className="form-label" htmlFor="user-display-name">
                  Full Name
                </label>
                <input
                  type="text"
                  id="user-display-name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address (Read-only)</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="form-input"
                  style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-muted)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="card-name-input">
                    Card Name / Brand
                  </label>
                  <input
                    type="text"
                    id="card-name-input"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="form-input"
                    placeholder="e.g. HDFC Regalia"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="card-last4-input">
                    Card Ending (Last 4)
                  </label>
                  <input
                    type="text"
                    id="card-last4-input"
                    maxLength={4}
                    value={cardLast4}
                    onChange={(e) => setCardLast4(e.target.value)}
                    className="form-input"
                    placeholder="4589"
                  />
                </div>
              </div>

              <div style={{ marginTop: '0.5rem' }}>
                <button
                  type="submit"
                  id="btn-update-profile"
                  disabled={profileLoading}
                  className="btn btn-secondary btn-sm"
                >
                  {profileLoading ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Production Security Card */}
          <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--slate-blue-50)', borderColor: '#D7E2F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
              <ShieldCheck size={20} color="var(--slate-blue-700)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-blue-700)' }}>
                Production Security & Encryption
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.8rem', color: 'var(--slate-blue-700)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem' }}>
                <Lock size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>
                  <strong>AES-256-GCM Cipher:</strong> Private notes, statement details, and sensitive account tokens are encrypted at the field level before storing in MongoDB.
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem' }}>
                <KeyRound size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>
                  <strong>Bcrypt-12 Salting:</strong> Passwords are cryptographically hashed using 12 salt rounds, resilient against dictionary attacks.
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem' }}>
                <FileCheck size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>
                  <strong>Brute-Force Guard:</strong> Express rate limiters protect all authentication and password change endpoints.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Update Password Form */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <KeyRound size={18} color="var(--sage-600)" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Update Password</h2>
          </div>

          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Ensure your account uses a strong, unique password with at least 8 characters.
          </p>

          {pwSuccess && (
            <div
              style={{
                padding: '0.65rem 0.85rem',
                backgroundColor: 'var(--sage-50)',
                color: 'var(--sage-700)',
                border: '1px solid var(--sage-200)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.825rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <CheckCircle2 size={16} />
              <span>{pwSuccess}</span>
            </div>
          )}

          {pwError && (
            <div
              style={{
                padding: '0.65rem 0.85rem',
                backgroundColor: 'var(--rose-50)',
                color: 'var(--rose-600)',
                border: '1px solid var(--rose-200)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.825rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <AlertTriangle size={16} />
              <span>{pwError}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword}>
            {/* Current Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="input-current-password">
                Current Password *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrentPw ? 'text' : 'password'}
                  id="input-current-password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="form-input"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-faint)',
                    cursor: 'pointer',
                  }}
                >
                  {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="input-new-password">
                New Password *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPw ? 'text' : 'password'}
                  id="input-new-password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-input"
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-faint)',
                    cursor: 'pointer',
                  }}
                >
                  {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="input-confirm-password">
                Confirm New Password *
              </label>
              <input
                type="password"
                id="input-confirm-password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input"
                placeholder="Repeat new password"
              />
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <button
                type="submit"
                id="btn-update-password"
                disabled={pwLoading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem' }}
              >
                <Lock size={16} />
                <span>{pwLoading ? 'Encrypting & Updating...' : 'Update Password'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
