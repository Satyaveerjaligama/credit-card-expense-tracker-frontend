'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { formatIndianNumber } from '../lib/formatters';
import CategorySelect from './CategorySelect';
import DatePickerInput from './DatePickerInput';

import {
  X,
  Pencil,
  Lock,
  AlertTriangle,
  Check,
} from 'lucide-react';

/**
 * Helper to safely extract local YYYY-MM-DD from an ISO date or Date object
 */
function getLocalDateString(dateInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * EditTransactionModal Component
 * Allows users to edit an existing credit card transaction with live diff tracking.
 * Only sends modified fields to PUT /api/transactions/:id in compliance with partial update specifications.
 */
export default function EditTransactionModal({
  isOpen,
  onClose,
  onSuccess,
  transaction,
  currencySymbol = '₹',
}) {
  // Form State
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState('Other');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sync form state when transaction changes or modal opens
  useEffect(() => {
    if (transaction) {
      setAmount(transaction.amount !== undefined ? String(transaction.amount) : '');
      setMerchant(transaction.merchant || '');
      setCategory(transaction.category || 'Other');
      setDate(getLocalDateString(transaction.date) || getLocalDateString(new Date()));
      setNotes(transaction.notes || '');
      setError('');
    }
  }, [transaction, isOpen]);

  // Listen for Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen || !transaction) return null;

  // Compute which fields changed from original transaction
  const getChangedFields = () => {
    const changed = {};

    // 1. Amount
    const parsedAmount = parseFloat(amount);
    const origAmount = parseFloat(transaction.amount);
    if (!isNaN(parsedAmount) && parsedAmount !== origAmount) {
      changed.amount = parsedAmount;
    }

    // 2. Merchant
    const trimmedMerchant = merchant.trim();
    const origMerchant = (transaction.merchant || '').trim();
    if (trimmedMerchant && trimmedMerchant !== origMerchant) {
      changed.merchant = trimmedMerchant;
    }

    // 3. Category
    if (category && category !== transaction.category) {
      changed.category = category;
    }

    // 4. Date
    const origDateStr = getLocalDateString(transaction.date);
    if (date && date !== origDateStr) {
      // Send standard ISO 8601 UTC string
      changed.date = new Date(`${date}T12:00:00.000Z`).toISOString();
    }

    // 5. Notes
    const trimmedNotes = notes.trim();
    const origNotes = (transaction.notes || '').trim();
    if (trimmedNotes !== origNotes) {
      changed.notes = trimmedNotes;
    }

    return changed;
  };

  const changedFields = getChangedFields();
  const changedFieldKeys = Object.keys(changedFields);
  const hasChanges = changedFieldKeys.length > 0;

  // Field modified states for badges
  const isAmountModified = 'amount' in changedFields;
  const isMerchantModified = 'merchant' in changedFields;
  const isCategoryModified = 'category' in changedFields;
  const isDateModified = 'date' in changedFields;
  const isNotesModified = 'notes' in changedFields;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('Please provide a valid amount greater than 0.');
      return;
    }

    if (!merchant.trim()) {
      setError('Please provide a merchant / payee name.');
      return;
    }

    if (!hasChanges) {
      setError('No fields have been modified yet.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Send only changed fields to PUT /api/transactions/:id
      const res = await api.updateTransaction(transaction._id, changedFields);

      if (res.success) {
        onSuccess(res.data);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to update transaction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={!loading ? onClose : undefined}
      id="edit-transaction-modal-overlay"
    >
      <div
        className="modal-content modal-content-responsive"
        style={{
          maxWidth: '540px',
          boxShadow: 'var(--shadow-float)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
        id="edit-transaction-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-modal-title"
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            borderBottom: '1px solid var(--border-light)',
            paddingBottom: '0.75rem',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '9px',
                backgroundColor: 'var(--sage-100)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--sage-600)',
                flexShrink: 0,
              }}
            >
              <Pencil size={18} strokeWidth={2.2} />
            </div>
            <div style={{ minWidth: 0 }}>
              <h2
                id="edit-modal-title"
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  margin: 0,
                  lineHeight: 1.25,
                }}
              >
                Edit Expense
              </h2>
              <p
                style={{
                  fontSize: '0.775rem',
                  color: 'var(--text-muted)',
                  margin: '0.15rem 0 0 0',
                  lineHeight: 1.3,
                }}
              >
                Update details for this transaction.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-faint)',
              cursor: loading ? 'not-allowed' : 'pointer',
              padding: '0.35rem',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all var(--transition-fast)',
              flexShrink: 0,
            }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Error Banner */}
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
            role="alert"
          >
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Changes Indicator Bar */}
        <div
          style={{
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: hasChanges ? 'var(--sage-50)' : 'var(--bg-card-subtle)',
            border: `1px solid ${hasChanges ? 'var(--sage-200)' : 'var(--border-light)'}`,
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
            fontSize: '0.8rem',
            lineHeight: 1.4,
            transition: 'all var(--transition-fast)',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: hasChanges ? 'var(--sage-500)' : 'var(--border-strong)',
              display: 'inline-block',
              flexShrink: 0,
              marginTop: '4px',
            }}
          />
          <span style={{ color: hasChanges ? 'var(--sage-700)' : 'var(--text-muted)' }}>
            {hasChanges ? (
              <>
                <strong>{changedFieldKeys.length} field{changedFieldKeys.length > 1 ? 's' : ''} modified:</strong>{' '}
                {changedFieldKeys
                  .map((k) => k.charAt(0).toUpperCase() + k.slice(1))
                  .join(', ')}
              </>
            ) : (
              'No changes detected yet. Modify any field below to update.'
            )}
          </span>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit}>
          {/* Row 1: Amount & Merchant */}
          <div className="modal-form-grid">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem', flexWrap: 'wrap', gap: '0.25rem' }}>
                <label className="form-label" htmlFor="edit-expense-amount" style={{ marginBottom: 0 }}>
                  Amount ({currencySymbol}) *
                </label>
                {isAmountModified && (
                  <span className="badge badge-amber" style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem' }}>
                    Modified
                  </span>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    fontSize: '0.9rem',
                    pointerEvents: 'none',
                  }}
                >
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  id="edit-expense-amount"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  className="form-input"
                  style={{ paddingLeft: '28px', fontWeight: 600 }}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              {transaction.amount !== undefined && (
                <span style={{ fontSize: '0.725rem', color: 'var(--text-faint)', marginTop: '0.25rem', display: 'block' }}>
                  Original: {currencySymbol}{formatIndianNumber(transaction.amount)}
                </span>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem', flexWrap: 'wrap', gap: '0.25rem' }}>
                <label className="form-label" htmlFor="edit-expense-merchant" style={{ marginBottom: 0 }}>
                  Merchant / Payee *
                </label>
                {isMerchantModified && (
                  <span className="badge badge-amber" style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem' }}>
                    Modified
                  </span>
                )}
              </div>
              <input
                type="text"
                id="edit-expense-merchant"
                required
                placeholder="e.g. Swiggy, Amazon"
                className="form-input"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
              />
              {transaction.merchant && (
                <span style={{ fontSize: '0.725rem', color: 'var(--text-faint)', marginTop: '0.25rem', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Original: {transaction.merchant}
                </span>
              )}
            </div>
          </div>

          {/* Row 2: Category */}
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem', flexWrap: 'wrap', gap: '0.25rem' }}>
              <label className="form-label" htmlFor="edit-expense-category" style={{ marginBottom: 0 }}>
                Category
              </label>
              {isCategoryModified && (
                <span className="badge badge-amber" style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem' }}>
                  Modified
                </span>
              )}
            </div>
            <CategorySelect
              id="edit-expense-category"
              value={category}
              onChange={(val) => setCategory(val)}
            />
          </div>

          {/* Row 3: Date */}
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem', flexWrap: 'wrap', gap: '0.25rem' }}>
              <label className="form-label" htmlFor="edit-expense-date" style={{ marginBottom: 0 }}>
                Date
              </label>
              {isDateModified && (
                <span className="badge badge-amber" style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem' }}>
                  Modified
                </span>
              )}
            </div>
            <DatePickerInput
              id="edit-expense-date"
              value={date}
              onChange={(val) => setDate(val)}
              align="left"
            />
          </div>

          {/* Row 3: Notes */}
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem', flexWrap: 'wrap', gap: '0.35rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <label className="form-label" htmlFor="edit-expense-notes" style={{ marginBottom: 0 }}>
                  Private Note / Memo
                </label>
                {isNotesModified && (
                  <span className="badge badge-amber" style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem' }}>
                    Modified
                  </span>
                )}
              </div>
              <span
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--sage-700)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                <Lock size={11} />
                <span>AES-256 Encrypted in DB</span>
              </span>
            </div>
            <input
              type="text"
              id="edit-expense-notes"
              placeholder="e.g. Client coffee meeting or flight ticket details"
              className="form-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="modal-footer-actions">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn btn-secondary"
              id="btn-cancel-edit-expense"
            >
              Cancel
            </button>

            <button
              type="submit"
              id="btn-submit-edit-expense"
              disabled={loading || !hasChanges}
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                opacity: !hasChanges && !loading ? 0.65 : 1,
                cursor: !hasChanges && !loading ? 'not-allowed' : 'pointer',
              }}
              title={!hasChanges ? 'Make changes to at least one field to save' : 'Save changes'}
            >
              <Check size={16} />
              <span>{loading ? 'Saving Changes...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
