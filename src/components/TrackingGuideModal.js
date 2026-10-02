'use client';

import React from 'react';
import {
  X,
  MessageSquare,
  Building2,
  FileSpreadsheet,
  Mail,
  Smartphone,
  Shield,
  CheckCircle2,
} from 'lucide-react';

export default function TrackingGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const trackingOptions = [
    {
      id: 'sms-sync',
      title: '1. Bank SMS & Push Notification Listener (Built-in Demo)',
      tag: 'Most Popular & Real-Time',
      tagColor: 'badge-sage',
      icon: MessageSquare,
      summary:
        'In India and many regions, banks instantly dispatch an SMS/Push alert for every credit card transaction with the amount, merchant, and card last 4 digits.',
      howItWorks: [
        'An Android listener app or iOS Shortcut intercepts incoming transaction SMS from HDFC, ICICI, SBI, Axis, etc.',
        'The text payload is automatically forwarded via webhook to your backend at /api/transactions/parse-sms.',
        'Our built-in regex & NLP engine parses amount, merchant name, card last-4, and assigns a category in milliseconds.',
        'You can also paste any bank SMS directly into our "Parse Bank SMS" tool right now on the Dashboard!',
      ],
      pros: 'Instant zero-delay sync, works with all credit cards, no bank credentials required.',
    },
    {
      id: 'account-aggregator',
      title: '2. RBI Account Aggregator (AA) / Open Banking APIs',
      tag: 'Enterprise Grade & 100% Automated',
      tagColor: 'badge-slate',
      icon: Building2,
      summary:
        'Official, consent-based financial data sharing framework regulated by the central bank (e.g., RBI Account Aggregator in India via Setu / Finvu / OneMoney; or Plaid / SaltEdge globally).',
      howItWorks: [
        'User authorizes read-only access to their credit card account once via OTP.',
        'The Account Aggregator delivers periodic or real-time webhooks with verified bank transaction feeds directly into your MongoDB database.',
      ],
      pros: 'Zero manual effort, 100% authentic transaction details, exact billing cycle synchronization.',
    },
    {
      id: 'statement-import',
      title: '3. Monthly E-Statement PDF / CSV Ingestion',
      tag: 'Great for Bulk Reconciliation',
      tagColor: 'badge-lavender',
      icon: FileSpreadsheet,
      summary:
        'Download your official monthly statement from your netbanking portal and import all transactions in one click.',
      howItWorks: [
        'Upload your statement CSV or PDF into the system.',
        'The backend parses transaction rows, encrypts notes, and bulk inserts them to keep monthly records pristine.',
      ],
      pros: 'Reconciles every penny including bank fees, interest, reward points, and GST.',
    },
    {
      id: 'email-webhook',
      title: '4. Bank Transaction Email Forwarding Webhook',
      tag: 'Automated via Cloud Mailer',
      tagColor: 'badge-amber',
      icon: Mail,
      summary:
        'Banks send e-transaction confirmation emails. You can configure an automated forwarding filter in Gmail/Outlook to an inbound Express webhook.',
      howItWorks: [
        'Setup a rule: If sender contains "alerts@hdfcbank.net" or similar -> auto-forward to your custom ingest webhook (e.g. using SendGrid Inbound Parse or Cloudflare Email Workers).',
        'Your Express server receives the email JSON, extracts details, and updates the database.',
      ],
      pros: 'Hands-free, operates completely in the background without needing phone apps.',
    },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '680px', padding: '1.75rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
            borderBottom: '1px solid var(--border-light)',
            paddingBottom: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Smartphone size={20} color="var(--sage-600)" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                How Credit Card Spending is Tracked
              </h2>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Production architectures to automatically feed credit card expenses into your MongoDB database.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.25rem',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Options List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {trackingOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <div
                key={opt.id}
                style={{
                  padding: '1.15rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--sage-50)',
                  border: '1px solid var(--sage-200)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem',
                    flexWrap: 'wrap',
                    gap: '0.4rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--bg-card)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--sage-700)',
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{opt.title}</span>
                  </div>
                  <span className={`badge ${opt.tagColor}`}>{opt.tag}</span>
                </div>

                <p style={{ fontSize: '0.835rem', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
                  {opt.summary}
                </p>

                <div
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)',
                    marginBottom: '0.6rem',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--text-main)',
                      marginBottom: '0.35rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em',
                    }}
                  >
                    Operational Flow:
                  </div>
                  <ul
                    style={{
                      paddingLeft: '1.2rem',
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem',
                    }}
                  >
                    {opt.howItWorks.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.775rem',
                    color: 'var(--sage-700)',
                    fontWeight: 600,
                  }}
                >
                  <CheckCircle2 size={14} />
                  <span>Advantage: {opt.pros}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security Note */}
        <div
          style={{
            marginTop: '1.25rem',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--slate-blue-50)',
            border: '1px solid var(--slate-blue-100)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
          }}
        >
          <Shield size={18} color="var(--slate-blue-500)" />
          <div style={{ fontSize: '0.775rem', color: 'var(--slate-blue-700)' }}>
            <strong>Production Data Protection:</strong> All private transaction notes and card identifiers are encrypted in the database using <strong>AES-256-GCM</strong> cryptography with unique initialization vectors.
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn btn-primary" style={{ padding: '0.5rem 1.25rem' }}>
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
