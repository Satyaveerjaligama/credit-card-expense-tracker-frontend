'use client';

import React, { useState, useEffect, useCallback } from 'react';
import NextLink from 'next/link';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import AddTransactionModal from '../components/AddTransactionModal';
import EditTransactionModal from '../components/EditTransactionModal';
import TrackingGuideModal from '../components/TrackingGuideModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { formatIndianNumber } from '../lib/formatters';
import {
  CreditCard,
  Target,
  TrendingDown,
  AlertTriangle,
  AlertCircle,
  Plus,
  MessageSquare,
  HelpCircle,
  Search,
  Filter,
  Trash2,
  Pencil,
  Lock,
  ArrowRight,
  RefreshCw,
  Utensils,
  ShoppingBag,
  ShoppingCart,
  Zap,
  Plane,
  Film,
  HeartPulse,
  GraduationCap,
  Tv,
  Fuel,
  MoreHorizontal,
  Eye,
  EyeOff,
} from 'lucide-react';

const CATEGORY_ICONS = {
  Dining: Utensils,
  Shopping: ShoppingBag,
  Groceries: ShoppingCart,
  Utilities: Zap,
  Travel: Plane,
  Entertainment: Film,
  Healthcare: HeartPulse,
  Education: GraduationCap,
  Subscriptions: Tv,
  Fuel: Fuel,
  Other: MoreHorizontal,
};

export default function DashboardPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [overview, setOverview] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCardLimit, setShowCardLimit] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalCount: 0 });

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState(null);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [bannerAlert, setBannerAlert] = useState(null);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setRefreshing(true);
      const [overviewRes, txnsRes] = await Promise.all([
        api.getLimitsOverview(),
        api.getTransactions({
          search,
          category: selectedCategory,
          page,
          limit: 15,
        }),
      ]);

      if (overviewRes.success) {
        setOverview(overviewRes.data);
      }

      if (txnsRes.success) {
        setTransactions(txnsRes.data);
        setPagination(txnsRes.pagination);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, selectedCategory, page]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated, fetchDashboardData]);

  const handleConfirmDelete = async () => {
    if (!transactionToDelete) return;
    try {
      setDeleteLoading(true);
      await api.deleteTransaction(transactionToDelete._id);
      setTransactionToDelete(null);
      fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to delete transaction');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleTransactionAdded = (warningAlert) => {
    fetchDashboardData();
    if (warningAlert) {
      setBannerAlert(warningAlert);
    }
  };

  const handleTransactionUpdated = () => {
    fetchDashboardData();
  };

  if (authLoading) {
    return (
      <div className="container" style={{ paddingTop: '5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading your dashboard...</p>
      </div>
    );
  }

  const currency = overview?.currencySymbol || user?.currencySymbol || '₹';
  const cardLimit = overview?.cardLimit || 100000;
  const personalLimit = overview?.personalLimit || 10000;
  const totalSpent = overview?.totalSpent || 0;
  const remainingPersonal = overview?.remainingPersonal !== undefined ? overview.remainingPersonal : personalLimit - totalSpent;
  const remainingCard = overview?.remainingCard !== undefined ? overview.remainingCard : cardLimit - totalSpent;
  const personalPercent = overview?.personalPercent || (personalLimit > 0 ? (totalSpent / personalLimit) * 100 : 0);
  const alertStatus = overview?.status || 'SAFE'; // SAFE, WARNING, EXCEEDED

  // Active warning banner (either from overview calculation or newly triggered)
  const showWarningBanner = alertStatus !== 'SAFE' || bannerAlert;

  const categoriesList = [
    'All',
    'Dining',
    'Shopping',
    'Groceries',
    'Utilities',
    'Travel',
    'Entertainment',
    'Healthcare',
    'Subscriptions',
    'Fuel',
    'Other',
  ];

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      {/* Top Welcome & Actions Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
            Expense Overview
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Welcome back, <strong style={{ color: 'var(--text-main)' }}>{user?.name || 'User'}</strong>
            </span>
            <span style={{ color: 'var(--border-strong)' }}>•</span>
            <span className="badge badge-sage">
              Active Cycle: Day {overview?.billingCycleDay || 1} resets monthly
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsGuideModalOpen(true)}
            id="btn-how-it-works"
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <HelpCircle size={15} color="var(--sage-600)" />
            <span>Tracking Options</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            id="btn-add-expense-primary"
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Plus size={16} />
            <span>Record Expense</span>
          </button>

          <button
            onClick={fetchDashboardData}
            id="btn-refresh-dashboard"
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.5rem', color: 'var(--text-muted)' }}
            title="Refresh Data"
          >
            <RefreshCw size={15} className={refreshing ? 'pulse-warning' : ''} />
          </button>
        </div>
      </div>

      {/* Critical Budget Warning Alert Banner */}
      {showWarningBanner && (
        <div
          id="budget-warning-banner"
          className="pulse-warning"
          style={{
            marginBottom: '1.75rem',
            padding: '1.15rem 1.35rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: alertStatus === 'EXCEEDED' ? 'var(--rose-50)' : 'var(--amber-50)',
            border: `1.5px solid ${alertStatus === 'EXCEEDED' ? 'var(--rose-200)' : 'var(--amber-200)'}`,
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: alertStatus === 'EXCEEDED' ? 'var(--rose-100)' : 'var(--amber-100)',
                color: alertStatus === 'EXCEEDED' ? 'var(--rose-600)' : 'var(--amber-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {alertStatus === 'EXCEEDED' ? <AlertCircle size={20} /> : <AlertTriangle size={20} />}
            </div>
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '0.975rem',
                  color: alertStatus === 'EXCEEDED' ? 'var(--rose-700)' : 'var(--amber-700)',
                  marginBottom: '0.2rem',
                }}
              >
                {alertStatus === 'EXCEEDED'
                  ? '🚨 Alert: Personal Spending Limit Exceeded!'
                  : '⚠️ Warning: Approaching Your Personal Spending Limit!'}
              </div>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: alertStatus === 'EXCEEDED' ? 'var(--rose-600)' : 'var(--amber-700)',
                  lineHeight: 1.45,
                }}
              >
                {overview?.warningMessage ||
                  bannerAlert?.message ||
                  `You have utilized ${personalPercent.toFixed(1)}% of your monthly budget. Spent ${currency}${formatIndianNumber(totalSpent)} of ${currency}${formatIndianNumber(personalLimit)}. Only ${currency}${formatIndianNumber(remainingPersonal)} remaining!`}
              </p>
            </div>
          </div>

          <NextLink
            href="/limits"
            prefetch={false}
            id="link-adjust-limits"
            className="btn btn-secondary btn-sm"
            style={{
              flexShrink: 0,
              borderColor: alertStatus === 'EXCEEDED' ? 'var(--rose-300)' : 'var(--amber-300)',
              color: alertStatus === 'EXCEEDED' ? 'var(--rose-700)' : 'var(--amber-700)',
              backgroundColor: '#FFFFFF',
            }}
          >
            <span>Adjust Limit</span>
            <ArrowRight size={14} />
          </NextLink>
        </div>
      )}

      {/* 3 Main Overview Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        {/* Card 1: Credit Card Total Limit */}
        <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--slate-blue-50)', borderColor: '#D7E2F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--slate-blue-500)',
                }}
              >
                <CreditCard size={18} />
              </div>
              <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--slate-blue-700)' }}>
                Bank Credit Limit
              </span>
            </div>
            <span className="badge badge-slate">{user?.cardName || 'Primary Card'}</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.35rem',
            }}
          >
            <div
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                letterSpacing: showCardLimit ? 'normal' : '2px',
                fontFamily: showCardLimit ? 'inherit' : 'var(--font-mono)',
              }}
            >
              {showCardLimit ? `${currency}${formatIndianNumber(cardLimit)}` : '••••••••'}
            </div>
            <button
              type="button"
              id="btn-toggle-card-limit"
              onClick={() => setShowCardLimit((prev) => !prev)}
              aria-label={showCardLimit ? 'Hide credit limit' : 'Show credit limit'}
              title={showCardLimit ? 'Hide credit limit' : 'Show credit limit'}
              style={{
                background: '#FFFFFF',
                border: '1px solid #D7E2F0',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                color: 'var(--slate-blue-700)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--slate-blue-100)';
                e.currentTarget.style.borderColor = 'var(--slate-blue-500)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.borderColor = '#D7E2F0';
              }}
            >
              {showCardLimit ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div style={{ fontSize: '0.825rem', color: 'var(--slate-blue-700)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Available Bank Credit:</span>
            <strong style={{ color: 'var(--text-main)', letterSpacing: showCardLimit ? 'normal' : '1px' }}>
              {showCardLimit ? `${currency}${formatIndianNumber(remainingCard)}` : '••••••••'}
            </strong>
          </div>

          <div style={{ marginTop: '0.85rem' }}>
            <div className="progress-container" style={{ backgroundColor: '#D7E2F0', height: '6px' }}>
              <div
                className="progress-bar-fill"
                style={{
                  width: `${Math.min(100, (totalSpent / cardLimit) * 100)}%`,
                  backgroundColor: 'var(--slate-blue-500)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Personal Spending Limit */}
        <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--sage-50)', borderColor: 'var(--sage-200)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--sage-600)',
                }}
              >
                <Target size={18} />
              </div>
              <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--sage-700)' }}>
                Personal Spending Limit
              </span>
            </div>
            <NextLink href="/limits" prefetch={false} style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--sage-700)', textDecoration: 'none' }}>
              Edit Limit →
            </NextLink>
          </div>

          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
            {currency}
            {formatIndianNumber(personalLimit)}
          </div>

          <div style={{ fontSize: '0.825rem', color: 'var(--sage-700)', display: 'flex', justifyContent: 'space-between' }}>
            <span>Remaining Before Limit:</span>
            <strong
              style={{
                color: remainingPersonal <= 0 ? 'var(--rose-600)' : 'var(--sage-700)',
                fontSize: '0.925rem',
              }}
            >
              {currency}
              {formatIndianNumber(remainingPersonal)}
            </strong>
          </div>

          <div style={{ marginTop: '0.85rem' }}>
            <div className="progress-container" style={{ backgroundColor: 'var(--sage-200)', height: '6px' }}>
              <div
                className="progress-bar-fill"
                style={{
                  width: `${Math.min(100, personalPercent)}%`,
                  backgroundColor:
                    alertStatus === 'EXCEEDED'
                      ? 'var(--rose-500)'
                      : alertStatus === 'WARNING'
                      ? 'var(--amber-500)'
                      : 'var(--sage-500)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Total Amount Spent */}
        <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
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
                <TrendingDown size={18} />
              </div>
              <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Total Spent This Cycle
              </span>
            </div>

            <span
              className={`badge ${
                alertStatus === 'EXCEEDED'
                  ? 'badge-rose'
                  : alertStatus === 'WARNING'
                  ? 'badge-amber'
                  : 'badge-sage'
              }`}
            >
              {personalPercent.toFixed(0)}% of Personal Limit
            </span>
          </div>

          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
            {currency}
            {formatIndianNumber(totalSpent)}
          </div>

          <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
            <span>Warning threshold:</span>
            <span>
              {overview?.alertThreshold || 80}% ({currency}
              {formatIndianNumber(((personalLimit * (overview?.alertThreshold || 80)) / 100))})
            </span>
          </div>

          <div style={{ marginTop: '0.85rem' }}>
            <div className="progress-container" style={{ height: '6px' }}>
              <div
                className={`progress-bar-fill ${
                  alertStatus === 'EXCEEDED'
                    ? 'fill-exceeded'
                    : alertStatus === 'WARNING'
                    ? 'fill-warning'
                    : 'fill-safe'
                }`}
                style={{ width: `${Math.min(100, personalPercent)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        {/* Section Header */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '1.25rem',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Recent Transactions
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              All credit card debits tracked in your billing period
            </p>
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', width: '240px' }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-faint)',
              }}
            />
            <input
              type="text"
              id="search-transactions"
              placeholder="Filter by merchant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '32px', fontSize: '0.85rem' }}
            />
          </div>
        </div>

        {/* Category Filters Pills */}
        <div
          style={{
            display: 'flex',
            gap: '0.4rem',
            overflowX: 'auto',
            paddingBottom: '0.75rem',
            marginBottom: '1rem',
          }}
        >
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                borderRadius: 'var(--radius-full)',
                padding: '0.35rem 0.75rem',
                fontSize: '0.775rem',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Transactions Table */}
        <div className="table-wrapper">
          <table className="custom-table" id="transactions-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Merchant</th>
                <th>Category</th>
                <th>Source</th>
                <th>Notes</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Loading transactions...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <CreditCard size={32} color="var(--sage-300)" />
                      <p style={{ fontWeight: 600 }}>No transactions found</p>
                      <p style={{ fontSize: '0.8rem' }}>Add your first credit card expense to start tracking!</p>
                      <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="btn btn-primary btn-sm"
                        style={{ marginTop: '0.5rem' }}
                      >
                        + Add Expense
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((txn) => {
                  const CategoryIcon = CATEGORY_ICONS[txn.category] || MoreHorizontal;
                  const dateStr = new Date(txn.date).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <tr key={txn._id} id={`txn-row-${txn._id}`}>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>{dateStr}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              backgroundColor: 'var(--sage-100)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'var(--sage-600)',
                            }}
                          >
                            <CategoryIcon size={14} />
                          </div>
                          <span style={{ fontWeight: 600 }}>{txn.merchant}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-lavender">{txn.category}</span>
                      </td>
                      <td>
                        {txn.source === 'sms_sync' ? (
                          <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>
                            <MessageSquare size={10} /> Bank SMS
                          </span>
                        ) : (
                          <span className="badge badge-sage" style={{ fontSize: '0.7rem' }}>
                            Manual
                          </span>
                        )}
                      </td>
                      <td style={{ maxWidth: '240px' }}>
                        {txn.notes ? (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              fontSize: '0.8rem',
                              color: 'var(--text-muted)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                            title={txn.notes}
                          >
                            <Lock size={12} color="var(--sage-500)" />
                            <span>{txn.notes}</span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-faint)', fontSize: '0.75rem' }}>—</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '0.95rem' }}>
                        {currency}
                        {formatIndianNumber(txn.amount)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.35rem',
                          }}
                        >
                          <button
                            onClick={() => setTransactionToEdit(txn)}
                            className="btn-table-edit"
                            title="Edit expense"
                            aria-label={`Edit expense from ${txn.merchant}`}
                            id={`btn-edit-txn-${txn._id}`}
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setTransactionToDelete(txn)}
                            className="btn-table-delete"
                            title="Delete expense"
                            aria-label={`Delete expense from ${txn.merchant}`}
                            id={`btn-delete-txn-${txn._id}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '1.25rem',
              fontSize: '0.825rem',
              color: 'var(--text-muted)',
            }}
          >
            <span>
              Page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} expenses)
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="btn btn-secondary btn-sm"
              >
                Previous
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="btn btn-secondary btn-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleTransactionAdded}
        currencySymbol={currency}
      />

      {/* Edit Transaction Modal */}
      <EditTransactionModal
        isOpen={Boolean(transactionToEdit)}
        onClose={() => setTransactionToEdit(null)}
        onSuccess={handleTransactionUpdated}
        transaction={transactionToEdit}
        currencySymbol={currency}
      />

      {/* Tracking Options Guide Modal */}
      <TrackingGuideModal isOpen={isGuideModalOpen} onClose={() => setIsGuideModalOpen(false)} />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={Boolean(transactionToDelete)}
        onClose={() => !deleteLoading && setTransactionToDelete(null)}
        onConfirm={handleConfirmDelete}
        transaction={transactionToDelete}
        loading={deleteLoading}
        currencySymbol={currency}
      />
    </div>
  );
}
