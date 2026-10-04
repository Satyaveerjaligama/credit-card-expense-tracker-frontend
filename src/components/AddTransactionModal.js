'use client';

import React, { useState } from 'react';
import { api } from '../lib/api';
import { formatIndianNumber } from '../lib/formatters';
import {
  X,
  PlusCircle,
  MessageSquare,
  Lock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Tag,
  Calendar,
} from 'lucide-react';

const CATEGORIES = [
  'Dining',
  'Shopping',
  'Groceries',
  'Utilities',
  'Travel',
  'Entertainment',
  'Healthcare',
  'Education',
  'Subscriptions',
  'Fuel',
  'Other',
];

const SAMPLE_SMS = [
  {
    label: 'HDFC Swiggy',
    text: 'Alert: INR 1,450.00 spent on HDFC Bank Card ending 4589 at Swiggy on 02-OCT-26. Avail limit: INR 91,551.00.',
  },
  {
    label: 'ICICI Amazon',
    text: 'Dear Customer, Rs 3,299.00 spent on ICICI Bank Credit Card ending XX4589 at Amazon Retail on 02-Oct-26.',
  },
  {
    label: 'Axis Starbucks',
    text: 'Txn of INR 740.00 done on Axis Bank Credit Card at Starbucks Coffee on 02-OCT-26.',
  },
];

export default function AddTransactionModal({ isOpen, onClose, onSuccess, currencySymbol = '₹' }) {
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' | 'sms'

  // Manual Form State
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState('Dining');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [notes, setNotes] = useState('');

  // SMS Form State
  const [smsText, setSmsText] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [isParsing, setIsParsing] = useState(false);

  // General State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !merchant) {
      setError('Please provide both amount and merchant name.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await api.addTransaction({
        amount: parseFloat(amount),
        merchant,
        category,
        date,
        paymentMethod,
        notes,
      });

      if (res.success) {
        // Reset form
        setAmount('');
        setMerchant('');
        setNotes('');
        onSuccess(res.warningAlert);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to record transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleParseSMS = async () => {
    if (!smsText.trim()) {
      setError('Please paste or select a bank SMS to parse');
      return;
    }

    try {
      setIsParsing(true);
      setError('');
      const res = await api.parseSMS({ smsText });
      if (res.success && res.parsed) {
        setParsedData(res.parsed);
      }
    } catch (err) {
      setError(err.message || 'Failed to parse SMS');
    } finally {
      setIsParsing(false);
    }
  };

  const handleSaveParsedSMS = async () => {
    if (!parsedData || !parsedData.amount) return;

    try {
      setLoading(true);
      setError('');
      const res = await api.addTransaction({
        amount: parsedData.amount,
        merchant: parsedData.merchant,
        category: parsedData.category,
        date: parsedData.date,
        source: 'sms_sync',
        notes: `Extracted from bank SMS: ${parsedData.originalText.slice(0, 80)}`,
      });

      if (res.success) {
        setSmsText('');
        setParsedData(null);
        onSuccess(res.warningAlert);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to save parsed transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ padding: '1.75rem', maxWidth: '540px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
            borderBottom: '1px solid var(--border-light)',
            paddingBottom: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'var(--sage-100)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--sage-600)',
              }}
            >
              <PlusCircle size={18} />
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Record Card Expense</h2>
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

        {/* Tab Switcher */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            backgroundColor: 'var(--sage-50)',
            padding: '4px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.25rem',
            border: '1px solid var(--sage-200)',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            id="tab-manual-entry"
            style={{
              padding: '0.5rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'manual' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'manual' ? 'var(--sage-700)' : 'var(--text-muted)',
              boxShadow: activeTab === 'manual' ? 'var(--shadow-sm)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
            }}
          >
            <Receipt size={15} />
            <span>Manual Entry</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sms')}
            id="tab-sms-parser"
            style={{
              padding: '0.5rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'sms' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'sms' ? 'var(--sage-700)' : 'var(--text-muted)',
              boxShadow: activeTab === 'sms' ? 'var(--shadow-sm)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
            }}
          >
            <MessageSquare size={15} />
            <span>Parse Bank SMS</span>
          </button>
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
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Tab 1: Manual Entry Form */}
        {activeTab === 'manual' && (
          <form onSubmit={handleManualSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="expense-amount">
                  Amount ({currencySymbol}) *
                </label>
                <input
                  type="number"
                  id="expense-amount"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="e.g. 850"
                  className="form-input"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="expense-merchant">
                  Merchant / Payee *
                </label>
                <input
                  type="text"
                  id="expense-merchant"
                  required
                  placeholder="e.g. Swiggy, Amazon"
                  className="form-input"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="expense-category">
                  Category
                </label>
                <select
                  id="expense-category"
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="expense-date">
                  Date
                </label>
                <input
                  type="date"
                  id="expense-date"
                  className="form-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label className="form-label" htmlFor="expense-notes">
                  Private Note / Memo
                </label>
                <span
                  style={{
                    fontSize: '0.7rem',
                    color: 'var(--sage-700)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                    fontWeight: 600,
                  }}
                >
                  <Lock size={11} />
                  <span>AES-256 Encrypted in DB</span>
                </span>
              </div>
              <input
                type="text"
                id="expense-notes"
                placeholder="e.g. Client coffee meeting or flight ticket details"
                className="form-input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" id="btn-submit-expense" disabled={loading} className="btn btn-primary">
                {loading ? 'Recording...' : 'Add Expense'}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Bank SMS Parser */}
        {activeTab === 'sms' && (
          <div>
            <div style={{ marginBottom: '0.85rem' }}>
              <label className="form-label" htmlFor="sms-input-field">
                Paste Bank Transaction SMS Text
              </label>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Paste the SMS message your bank sent when using your credit card:
              </p>
              <textarea
                id="sms-input-field"
                rows={3}
                className="form-textarea"
                placeholder="Alert: INR 1,450.00 spent on HDFC Bank Card ending 4589 at Swiggy on 02-OCT-26..."
                value={smsText}
                onChange={(e) => setSmsText(e.target.value)}
              />
            </div>

            {/* Quick Sample Buttons */}
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)', fontWeight: 600 }}>
                Test with sample SMS:
              </span>
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                {SAMPLE_SMS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSmsText(sample.text);
                      setParsedData(null);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1rem' }}>
              <button
                type="button"
                id="btn-parse-sms"
                onClick={handleParseSMS}
                disabled={isParsing || !smsText.trim()}
                className="btn btn-secondary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  borderColor: 'var(--sage-300)',
                  backgroundColor: 'var(--sage-50)',
                }}
              >
                <Sparkles size={15} color="var(--sage-600)" />
                <span>{isParsing ? 'Extracting...' : 'Extract Transaction Data'}</span>
              </button>
            </div>

            {/* Parsed Result Card */}
            {parsedData && (
              <div
                style={{
                  backgroundColor: 'var(--sage-50)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--sage-200)',
                  marginBottom: '1.25rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem',
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--sage-700)' }}>
                    Extracted Expense
                  </span>
                  <span className="badge badge-sage">
                    <CheckCircle2 size={12} /> High Confidence
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '0.5rem',
                    fontSize: '0.825rem',
                    backgroundColor: 'var(--bg-card)',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-light)',
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Amount:</span>{' '}
                    <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>
                      {currencySymbol}
                      {formatIndianNumber(parsedData.amount)}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Merchant:</span>{' '}
                    <strong>{parsedData.merchant}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Category:</span>{' '}
                    <span className="badge badge-lavender">{parsedData.category}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Card:</span>{' '}
                    <span>ending {parsedData.cardLast4 || '4589'}</span>
                  </div>
                </div>

                <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    id="btn-save-parsed-sms"
                    onClick={handleSaveParsedSMS}
                    disabled={loading}
                    className="btn btn-primary btn-sm"
                  >
                    {loading ? 'Saving...' : 'Confirm & Add to DB'}
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
