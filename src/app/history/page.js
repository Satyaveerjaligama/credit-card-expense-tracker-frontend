'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import PageHeader from '../../components/PageHeader';
import CustomDropdown from '../../components/CustomDropdown';
import { formatIndianNumber } from '../../lib/formatters';
import {
  BarChart3,
  Calendar,
  TrendingUp,
  PieChart,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Shield,
} from 'lucide-react';

const TIMEFRAME_OPTIONS = [
  {
    value: 3,
    label: 'Last 3 Months',
    badge: '3M',
  },
  {
    value: 6,
    label: 'Last 6 Months',
    badge: '6M',
  },
  {
    value: 12,
    label: 'Last 12 Months',
    badge: '1Y',
  },
];

export default function HistoryPage() {
  const { user, isAuthenticated } = useAuth();
  const [monthsCount, setMonthsCount] = useState(6);
  const [historyData, setHistoryData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTooltip, setActiveTooltip] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadHistory();
    }
  }, [isAuthenticated, monthsCount]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const [histRes, catRes] = await Promise.all([
        api.getMonthlyHistory(monthsCount),
        api.getCategoryBreakdown(selectedMonth),
      ]);

      if (histRes.success) {
        setHistoryData(histRes.data.history);
        setSummary(histRes.data.summary);
      }

      if (catRes.success) {
        setCategories(catRes.data.categories);
      }
    } catch (err) {
      console.error('Failed to load history data:', err);
    } finally {
      setLoading(false);
    }
  };

  const currency = summary?.currencySymbol || user?.currencySymbol || '₹';
  const personalLimit = summary?.personalLimit || user?.personalLimit || 10000;

  // Calculate SVG Graph Dimensions
  const graphHeight = 240;
  const graphWidth = 700;
  const paddingX = 40;
  const paddingY = 30;

  const maxDataValue = Math.max(
    personalLimit * 1.25,
    ...historyData.map((d) => d.totalSpent || 0)
  );

  const getY = (val) => {
    if (maxDataValue === 0) return graphHeight - paddingY;
    return graphHeight - paddingY - (val / maxDataValue) * (graphHeight - paddingY * 2);
  };

  const limitY = getY(personalLimit);

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      {/* Page Header */}
      <PageHeader
        icon={BarChart3}
        title="Month-wise Spending History"
        description="Analyze past spending cycles and monitor budget compliance against your personal limit"
        actions={
          <CustomDropdown
            id="select-history-months"
            label="Timeframe"
            icon={Calendar}
            value={monthsCount}
            onChange={(val) => setMonthsCount(Number(val))}
            options={TIMEFRAME_OPTIONS}
          />
        }
      />


      {/* Summary KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Average Monthly Spend
          </span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem' }}>
            {currency}
            {formatIndianNumber(summary?.avgMonthly || 0)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>
            Over {monthsCount} months
          </span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Peak Spending Month
          </span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--text-main)' }}>
            {summary?.peakMonth || '—'}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--rose-600)', fontWeight: 600 }}>
            {currency}
            {formatIndianNumber(summary?.peakAmount || 0)} spent
          </span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Current Personal Budget Cap
          </span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--sage-700)' }}>
            {currency}
            {formatIndianNumber(personalLimit)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--sage-600)' }}>
            Threshold reference line
          </span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Total Period Spending
          </span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem' }}>
            {currency}
            {formatIndianNumber(summary?.totalSpentPeriod || 0)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>
            Total credit debits recorded
          </span>
        </div>
      </div>

      {/* Interactive Spending Graph Card */}
      <div className="card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
            gap: '1rem',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Monthly Expense Graph</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Red bars indicate months where spending crossed your {currency}{formatIndianNumber(personalLimit)} limit
            </p>
          </div>

          {/* Graph Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'var(--sage-400)' }} />
              <span>Within Limit</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'var(--rose-400)' }} />
              <span>Exceeded Limit</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: '16px', height: '2px', backgroundColor: 'var(--amber-500)', borderStyle: 'dashed' }} />
              <span>Limit Cap ({currency}{formatIndianNumber(personalLimit)})</span>
            </div>
          </div>
        </div>

        {/* SVG Graph Container */}
        <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          <svg
            viewBox={`0 0 ${graphWidth} ${graphHeight}`}
            style={{ width: '100%', minWidth: '600px', height: 'auto', overflow: 'visible' }}
          >
            {/* Background Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
              const yVal = paddingY + pct * (graphHeight - paddingY * 2);
              const labelAmount = Math.round(maxDataValue * (1 - pct));
              return (
                <g key={idx}>
                  <line
                    x1={paddingX}
                    y1={yVal}
                    x2={graphWidth - paddingX}
                    y2={yVal}
                    stroke="var(--border-light)"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={paddingX - 6}
                    y={yVal + 3}
                    textAnchor="end"
                    fontSize="9"
                    fill="var(--text-faint)"
                    fontFamily="var(--font-sans)"
                  >
                    {labelAmount >= 1000 ? `${(labelAmount / 1000).toFixed(0)}k` : labelAmount}
                  </text>
                </g>
              );
            })}

            {/* Target Personal Limit Line */}
            <line
              x1={paddingX}
              y1={limitY}
              x2={graphWidth - paddingX}
              y2={limitY}
              stroke="var(--amber-500)"
              strokeWidth="2"
              strokeDasharray="5 4"
            />
            <text
              x={graphWidth - paddingX - 2}
              y={limitY + 3}
              fontSize="9"
              fontWeight="bold"
              fill="var(--amber-600)"
            >
              Limit Cap
            </text>

            {/* Bars */}
            {historyData.map((item, idx) => {
              const barCount = historyData.length;
              const availableWidth = graphWidth - paddingX * 2;
              const slotWidth = availableWidth / barCount;
              const barWidth = Math.min(48, slotWidth * 0.55);
              const x = paddingX + idx * slotWidth + (slotWidth - barWidth) / 2;
              const y = getY(item.totalSpent);
              const barHeight = Math.max(4, graphHeight - paddingY - y);
              const isOver = item.totalSpent > personalLimit;

              return (
                <g
                  key={item.monthKey}
                  onMouseEnter={() => setActiveTooltip({ ...item, x: x + barWidth / 2, y })}
                  onMouseLeave={() => setActiveTooltip(null)}
                  style={{ cursor: 'pointer' }}
                >
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    rx="6"
                    fill={isOver ? 'url(#roseGrad)' : 'url(#sageGrad)'}
                    stroke={isOver ? 'var(--rose-400)' : 'var(--sage-400)'}
                    strokeWidth="1.2"
                    style={{ transition: 'all 0.3s ease' }}
                  />

                  {/* Top Amount Label */}
                  <text
                    x={x + barWidth / 2}
                    y={y - 8}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="600"
                    fill={isOver ? 'var(--rose-600)' : 'var(--text-main)'}
                  >
                    {currency}
                    {item.totalSpent > 999
                      ? `${(item.totalSpent / 1000).toFixed(1)}k`
                      : item.totalSpent}
                  </text>

                  {/* Month Label */}
                  <text
                    x={x + barWidth / 2}
                    y={graphHeight - paddingY + 18}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="600"
                    fill="var(--text-muted)"
                  >
                    {item.label}
                  </text>
                </g>
              );
            })}

            {/* Gradients */}
            <defs>
              <linearGradient id="sageGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7BAF8E" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#CDE2D4" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="roseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D86D67" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#F1C3BF" stopOpacity="0.4" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Hover Tooltip display */}
        {activeTooltip && (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.65rem 1rem',
              backgroundColor: 'var(--sage-50)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--sage-200)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.85rem',
            }}
          >
            <div>
              <strong>{activeTooltip.fullLabel}:</strong> Spent {currency}
              {formatIndianNumber(activeTooltip.totalSpent)} across {activeTooltip.transactionCount} expenses
            </div>
            <div>
              {activeTooltip.totalSpent > personalLimit ? (
                <span className="badge badge-rose">
                  Exceeded Limit by {currency}
                  {formatIndianNumber(activeTooltip.totalSpent - personalLimit)}
                </span>
              ) : (
                <span className="badge badge-sage">
                  Within Budget ({activeTooltip.percentOfLimit}% Used)
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Grid: Month Breakdown Table & Category Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Monthly Breakdown Table */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>
            Monthly Cycles Performance
          </h2>
          <div className="table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Amount</th>
                  <th>Limit Status</th>
                </tr>
              </thead>
              <tbody>
                {historyData.map((item) => (
                  <tr key={item.monthKey}>
                    <td style={{ fontWeight: 600 }}>{item.fullLabel}</td>
                    <td>
                      {currency}
                      {formatIndianNumber(item.totalSpent)}
                    </td>
                    <td>
                      {item.isOverLimit ? (
                        <span className="badge badge-rose" style={{ fontSize: '0.72rem' }}>
                          <AlertTriangle size={11} /> Over by {currency}
                          {formatIndianNumber(item.totalSpent - personalLimit)}
                        </span>
                      ) : (
                        <span className="badge badge-sage" style={{ fontSize: '0.72rem' }}>
                          <CheckCircle2 size={11} /> {item.percentOfLimit}% Used
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Category Distribution</h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>All recorded expenses</span>
          </div>

          {categories.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No expense records available.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {categories.map((cat) => (
                <div key={cat.category}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.825rem',
                      marginBottom: '0.25rem',
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{cat.category}</span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {currency}
                      {formatIndianNumber(cat.totalSpent)} ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="progress-container" style={{ height: '7px' }}>
                    <div
                      className="progress-bar-fill fill-safe"
                      style={{ width: `${Math.min(100, cat.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
