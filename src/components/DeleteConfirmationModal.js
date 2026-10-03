'use client';

import React, { useEffect } from 'react';
import {
  Trash2,
  AlertTriangle,
  X,
  Calendar,
  Tag,
  CreditCard,
  Lock,
  ArrowRight,
} from 'lucide-react';

/**
 * DeleteConfirmationModal component
 * A sleek, high-visibility confirmation dialog shown when deleting a credit card transaction.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is currently visible
 * @param {Function} props.onClose - Callback when modal is closed/cancelled
 * @param {Function} props.onConfirm - Callback when user confirms deletion
 * @param {Object} [props.transaction] - The transaction object being deleted
 * @param {boolean} [props.loading] - Whether the delete request is currently processing
 * @param {string} [props.currencySymbol] - Currency symbol for display (default: ₹)
 */
export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  transaction,
  loading = false,
  currencySymbol = '₹',
}) {
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

  const formattedDate = transaction.date
    ? new Date(transaction.date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'Unknown Date';

  return (
    <div
      className="modal-overlay"
      onClick={!loading ? onClose : undefined}
      id="delete-confirmation-modal-overlay"
    >
      <div
        className="modal-content"
        style={{
          maxWidth: '460px',
          padding: '1.5rem',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-float)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
        id="delete-confirmation-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-faint)',
            cursor: loading ? 'not-allowed' : 'pointer',
            padding: '0.25rem',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color var(--transition-fast)',
          }}
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        {/* Modal Header Icon & Titles */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: 'var(--rose-100)',
              border: '1px solid var(--rose-200)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--rose-500)',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(183, 78, 73, 0.15)',
            }}
          >
            <Trash2 size={22} strokeWidth={2.2} />
          </div>
          <div>
            <h3
              id="delete-modal-title"
              style={{
                fontSize: '1.15rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                // marginBottom: '0.25rem',
              }}
            >
              Delete Transaction?
            </h3>
          </div>
        </div>

        {/* Transaction Summary Preview Card */}
        <div
          style={{
            backgroundColor: 'var(--bg-card-subtle)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--border-light)',
              paddingBottom: '0.65rem',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                {transaction.merchant || 'Unknown Merchant'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  <Calendar size={12} />
                  {formattedDate}
                </span>
                {transaction.category && (
                  <span
                    className="badge badge-sage"
                    style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}
                  >
                    {transaction.category}
                  </span>
                )}
              </div>
            </div>

            {/* Amount */}
            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: 'var(--rose-600)',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                -{currencySymbol}
                {Number(transaction.amount || 0).toLocaleString()}
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>
                {transaction.source || 'Manual'}
              </span>
            </div>
          </div>

          {/* Encrypted Notes (if any) */}
          {transaction.notes && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                backgroundColor: '#FFFFFF',
                padding: '0.4rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)',
              }}
            >
              <Lock size={12} color="var(--sage-500)" style={{ flexShrink: 0 }} />
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {transaction.notes}
              </span>
            </div>
          )}

          {/* Limit Impact Notice */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.73rem',
              color: 'var(--sage-700)',
              backgroundColor: 'var(--sage-50)',
              padding: '0.45rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--sage-200)',
            }}
          >
            <CreditCard size={13} style={{ flexShrink: 0 }} />
            <span>
              Deleting this expense will restore <strong>{currencySymbol}{Number(transaction.amount || 0).toLocaleString()}</strong> to your available limit.
            </span>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            id="btn-cancel-delete"
            className="btn btn-secondary"
            style={{
              padding: '0.55rem 1rem',
              fontSize: '0.85rem',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            id="btn-confirm-delete"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1.15rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--rose-500)',
              backgroundColor: 'var(--rose-500)',
              color: '#FFFFFF',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 6px rgba(183, 78, 73, 0.25)',
              transition: 'all var(--transition-fast)',
            }}
            className="btn-delete-confirm-hover"
          >
            <Trash2 size={15} />
            <span>{loading ? 'Deleting...' : 'Delete Expense'}</span>
          </button>
        </div>

        {/* Hover styles for button */}
        <style jsx>{`
          .btn-delete-confirm-hover:hover:not(:disabled) {
            background-color: var(--rose-600) !important;
            border-color: var(--rose-600) !important;
            box-shadow: 0 4px 12px rgba(183, 78, 73, 0.35) !important;
            transform: translateY(-1px);
          }
        `}</style>
      </div>
    </div>
  );
}
