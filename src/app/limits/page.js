'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import PageHeader from '../../components/PageHeader';
import CustomDropdown from '../../components/CustomDropdown';
import { formatIndianNumber } from '../../lib/formatters';
import {
  SlidersHorizontal,
  BellRing,
  Save,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  Coins,
} from 'lucide-react';

const CURRENCY_OPTIONS = [
  { value: '₹', label: '₹ (INR Rupee)', badge: 'INR' },
  { value: '$', label: '$ (USD Dollar)', badge: 'USD' },
  { value: '€', label: '€ (EUR Euro)', badge: 'EUR' },
  { value: '£', label: '£ (GBP Pound)', badge: 'GBP' },
  { value: 'AED', label: 'AED (Dirham)', badge: 'AED' },
];

export default function LimitsPage() {
  const { isAuthenticated, refreshUser } = useAuth();

  const [cardLimit, setCardLimit] = useState(100000);
  const [personalLimit, setPersonalLimit] = useState(10000);
  const [alertThreshold, setAlertThreshold] = useState(80);
  const [billingCycleDay, setBillingCycleDay] = useState(1);
  const [currencySymbol, setCurrencySymbol] = useState('₹');
  const [cardName, setCardName] = useState('Primary Credit Card');

  // Simulation state for live preview
  const [simulatedSpend, setSimulatedSpend] = useState(8500);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const clearFieldError = (field) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const loadLimits = async () => {
    try {
      const res = await api.getLimitsOverview();
      if (res.success && res.data) {
        setCardLimit(res.data.cardLimit ?? 100000);
        setPersonalLimit(res.data.personalLimit ?? 10000);
        setAlertThreshold(res.data.alertThreshold || 80);
        setBillingCycleDay(res.data.billingCycleDay || 1);
        setCurrencySymbol(res.data.currencySymbol || '₹');
        setCardName(res.data.cardName || 'Primary Credit Card');
        setSimulatedSpend(res.data.totalSpent || 8500);
      }
    } catch (err) {
      console.error('Failed to load limits:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadLimits();
    }
  }, [isAuthenticated]);

  const handleSaveLimits = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const errors = {};

    // Validate Card Limit
    const trimmedCard = String(cardLimit ?? '').trim();
    if (!trimmedCard) {
      errors.cardLimit = 'Credit card limit is required.';
    } else {
      const numCard = Number(trimmedCard);
      if (isNaN(numCard) || numCard <= 0) {
        errors.cardLimit = 'Please enter a valid credit card limit greater than 0.';
      }
    }

    // Validate Personal Limit
    const trimmedPersonal = String(personalLimit ?? '').trim();
    if (!trimmedPersonal) {
      errors.personalLimit = 'Personal spending limit is required.';
    } else {
      const numPersonal = Number(trimmedPersonal);
      if (isNaN(numPersonal) || numPersonal <= 0) {
        errors.personalLimit = 'Please enter a valid personal limit greater than 0.';
      } else if (!errors.cardLimit && numPersonal > Number(trimmedCard)) {
        errors.personalLimit = 'Personal spending limit cannot exceed the total credit card limit.';
      }
    }

    // Validate Billing Cycle Day
    const trimmedDay = String(billingCycleDay ?? '').trim();
    if (!trimmedDay) {
      errors.billingCycleDay = 'Billing cycle start day is required.';
    } else {
      const numDay = Number(trimmedDay);
      if (isNaN(numDay) || !Number.isInteger(numDay) || numDay < 1 || numDay > 28) {
        errors.billingCycleDay = 'Billing cycle day must be an integer between 1 and 28.';
      }
    }

    // Validate Card Name
    if (!cardName || !String(cardName).trim()) {
      errors.cardName = 'Credit card name/label is required.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});

    try {
      setLoading(true);

      const res = await api.updateLimits({
        cardLimit: Number(cardLimit),
        personalLimit: Number(personalLimit),
        alertThreshold: Number(alertThreshold),
        billingCycleDay: Number(billingCycleDay),
        currencySymbol,
        cardName: String(cardName).trim(),
      });

      if (res.success) {
        setSuccessMsg('Credit card limits & warning thresholds updated successfully!');
        await refreshUser();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update limits');
    } finally {
      setLoading(false);
    }
  };

  // Calculations for live preview
  const numPersonalLimit = Number(personalLimit) || 0;
  const numCardLimit = Number(cardLimit) || 0;
  const thresholdAmount = (numPersonalLimit * alertThreshold) / 100;
  const simPercent = numPersonalLimit > 0 ? (simulatedSpend / numPersonalLimit) * 100 : 0;
  const simRemaining = Math.max(0, numPersonalLimit - simulatedSpend);

  let simStatus = 'SAFE';
  if (simulatedSpend > numPersonalLimit) {
    simStatus = 'EXCEEDED';
  } else if (simPercent >= alertThreshold) {
    simStatus = 'WARNING';
  }

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      {/* Header */}
      <PageHeader
        icon={SlidersHorizontal}
        title="Configure Spending Limits & Alerts"
        description="Set your total bank credit limit, personal budget ceiling, and proactive warning threshold."
      />


      {successMsg && (
        <div
          style={{
            padding: '0.85rem 1.15rem',
            backgroundColor: 'var(--sage-50)',
            border: '1px solid var(--sage-200)',
            color: 'var(--sage-700)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            padding: '0.85rem 1.15rem',
            backgroundColor: 'var(--rose-50)',
            border: '1px solid var(--rose-200)',
            color: 'var(--rose-600)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
          }}
        >
          <AlertTriangle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Two-Column Grid: Form & Live Interactive Simulator */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.75rem' }}>
        {/* Limits Configuration Form */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Limits & Alert Settings
          </h2>

          <form onSubmit={handleSaveLimits} noValidate>
            {/* Card Limit */}
            <div className="form-group">
              <label className="form-label" htmlFor="input-card-limit">
                Total Credit Card Limit ({currencySymbol}) *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  id="input-card-limit"
                  min="1"
                  step="any"
                  value={cardLimit}
                  onChange={(e) => {
                    setCardLimit(e.target.value);
                    clearFieldError('cardLimit');
                  }}
                  className={`form-input ${fieldErrors.cardLimit ? 'has-error' : ''}`}
                  placeholder="e.g. 100000"
                />
              </div>
              {fieldErrors.cardLimit && (
                <div className="form-error-msg" id="error-card-limit">
                  <AlertCircle size={14} />
                  <span>{fieldErrors.cardLimit}</span>
                </div>
              )}
              <span className="form-hint">
                The total credit line sanctioned by your bank.
              </span>
            </div>

            {/* Personal Spending Limit */}
            <div className="form-group">
              <label className="form-label" htmlFor="input-personal-limit">
                Personal Spending Limit ({currencySymbol}) *
              </label>
              <input
                type="number"
                id="input-personal-limit"
                min="1"
                step="any"
                value={personalLimit}
                onChange={(e) => {
                  setPersonalLimit(e.target.value);
                  clearFieldError('personalLimit');
                }}
                className={`form-input ${fieldErrors.personalLimit ? 'has-error' : ''}`}
                placeholder="e.g. 10000"
              />
              {fieldErrors.personalLimit && (
                <div className="form-error-msg" id="error-personal-limit">
                  <AlertCircle size={14} />
                  <span>{fieldErrors.personalLimit}</span>
                </div>
              )}
              <span className="form-hint">
                Your monthly target budget cap that you do not want to exceed.
              </span>
            </div>

            {/* Alert Threshold Slider */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="input-alert-threshold">
                  Warning Alert Threshold
                </label>
                <span className="badge badge-amber" style={{ fontSize: '0.8rem' }}>
                  {alertThreshold}% ({currencySymbol}
                  {formatIndianNumber(Math.round(thresholdAmount))})
                </span>
              </div>
              <input
                type="range"
                id="input-alert-threshold"
                min="50"
                max="95"
                step="5"
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(Number(e.target.value))}
                style={{ width: '100%', margin: '0.5rem 0', accentColor: 'var(--amber-500)' }}
              />
              <span className="form-hint">
                You will receive a warning banner when your spending reaches {alertThreshold}% (
                {currencySymbol}
                {formatIndianNumber(Math.round(thresholdAmount))}) of your personal limit.
              </span>
            </div>

            {/* Billing Cycle Day */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: "center" }}>
              <div className="form-group">
                <label className="form-label" htmlFor="input-billing-day">
                  Billing Cycle Start Day
                </label>
                <input
                  type="number"
                  id="input-billing-day"
                  min="1"
                  max="28"
                  step="1"
                  value={billingCycleDay}
                  onChange={(e) => {
                    setBillingCycleDay(e.target.value);
                    clearFieldError('billingCycleDay');
                  }}
                  className={`form-input ${fieldErrors.billingCycleDay ? 'has-error' : ''}`}
                />
                {fieldErrors.billingCycleDay && (
                  <div className="form-error-msg" id="error-billing-day">
                    <AlertCircle size={14} />
                    <span>{fieldErrors.billingCycleDay}</span>
                  </div>
                )}
                <span className="form-hint">Day of month (1 to 28)</span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="input-currency">
                  Currency Symbol
                </label>
                <CustomDropdown
                  id="input-currency"
                  value={currencySymbol}
                  onChange={(val) => setCurrencySymbol(val)}
                  options={CURRENCY_OPTIONS}
                  icon={Coins}
                  width="100%"
                />
                <span className="form-hint">Display currency</span>
              </div>
            </div>

            {/* Card Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="input-card-name">
                Credit Card Name / Label
              </label>
              <input
                type="text"
                id="input-card-name"
                value={cardName}
                onChange={(e) => {
                  setCardName(e.target.value);
                  clearFieldError('cardName');
                }}
                className={`form-input ${fieldErrors.cardName ? 'has-error' : ''}`}
                placeholder="e.g. HDFC Regalia Gold, ICICI Coral"
              />
              {fieldErrors.cardName && (
                <div className="form-error-msg" id="error-card-name">
                  <AlertCircle size={14} />
                  <span>{fieldErrors.cardName}</span>
                </div>
              )}
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <button
                type="submit"
                id="btn-save-limits"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem' }}
              >
                <Save size={16} />
                <span>{loading ? 'Saving...' : 'Save Limit Preferences'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Simulator Preview Card */}
        <div className="card" style={{ padding: '1.75rem', backgroundColor: 'var(--sage-50)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '1.25rem' }}>
            <Sparkles size={18} color="var(--sage-600)" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
              Live Limit Warning Preview
            </h2>
          </div>

          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Drag the test slider below to preview how your dashboard alerts you when spending gets close to or exceeds your personal limit:
          </p>

          {/* Test Spend Slider */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              padding: '1rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-light)',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.825rem', fontWeight: 600 }}>Simulate Spent Amount:</span>
              <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>
                {currencySymbol}
                {formatIndianNumber(simulatedSpend)}
              </strong>
            </div>

            <input
              type="range"
              min="0"
              max={Math.max(1000, Math.round(numPersonalLimit * 1.5))}
              step="250"
              value={simulatedSpend}
              onChange={(e) => setSimulatedSpend(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--sage-600)' }}
            />

            <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setSimulatedSpend(Math.round(numPersonalLimit * 0.5))}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.7rem' }}
              >
                50% (Safe)
              </button>
              <button
                type="button"
                onClick={() => setSimulatedSpend(Math.round((numPersonalLimit * alertThreshold) / 100 + 400))}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.7rem' }}
              >
                Approaching Alert
              </button>
              <button
                type="button"
                onClick={() => setSimulatedSpend(Math.round(numPersonalLimit + 1200))}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.7rem' }}
              >
                Exceeded Limit
              </button>
            </div>
          </div>

          {/* Simulated Warning Banner */}
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor:
                simStatus === 'EXCEEDED'
                  ? 'var(--rose-100)'
                  : simStatus === 'WARNING'
                  ? 'var(--amber-100)'
                  : 'var(--sage-100)',
              border: `1.5px solid ${
                simStatus === 'EXCEEDED'
                  ? 'var(--rose-200)'
                  : simStatus === 'WARNING'
                  ? 'var(--amber-200)'
                  : 'var(--sage-200)'
              }`,
              marginBottom: '1.25rem',
            }}
          >
            <div
              style={{
                fontWeight: 700,
                fontSize: '0.9rem',
                color:
                  simStatus === 'EXCEEDED'
                    ? 'var(--rose-700)'
                    : simStatus === 'WARNING'
                    ? 'var(--amber-700)'
                    : 'var(--sage-700)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                marginBottom: '0.35rem',
              }}
            >
              {simStatus === 'EXCEEDED' && <AlertTriangle size={16} />}
              {simStatus === 'WARNING' && <BellRing size={16} />}
              {simStatus === 'SAFE' && <CheckCircle2 size={16} />}
              <span>
                {simStatus === 'EXCEEDED'
                  ? '🚨 Alert: Personal Limit Exceeded!'
                  : simStatus === 'WARNING'
                  ? '⚠️ Warning: Approaching Personal Limit!'
                  : '✅ Budget Healthy (Safe Zone)'}
              </span>
            </div>

            <p
              style={{
                fontSize: '0.825rem',
                color:
                  simStatus === 'EXCEEDED'
                    ? 'var(--rose-600)'
                    : simStatus === 'WARNING'
                    ? 'var(--amber-700)'
                    : 'var(--sage-700)',
              }}
            >
              {simStatus === 'EXCEEDED'
                ? `You have spent ${currencySymbol}${formatIndianNumber(simulatedSpend)} which exceeds your budget of ${currencySymbol}${formatIndianNumber(numPersonalLimit)} by ${currencySymbol}${formatIndianNumber(simulatedSpend - numPersonalLimit)}!`
                : simStatus === 'WARNING'
                ? `Caution: You have utilized ${simPercent.toFixed(1)}% of your personal limit. Remaining budget: ${currencySymbol}${formatIndianNumber(simRemaining)}.`
                : `You have spent ${currencySymbol}${formatIndianNumber(simulatedSpend)} out of ${currencySymbol}${formatIndianNumber(numPersonalLimit)} (${simPercent.toFixed(1)}%). Remaining: ${currencySymbol}${formatIndianNumber(simRemaining)}.`}
            </p>
          </div>

          {/* Visual Progress Bar */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
              <span>Progress against Personal Limit:</span>
              <strong>{simPercent.toFixed(1)}%</strong>
            </div>
            <div className="progress-container" style={{ height: '8px' }}>
              <div
                className={`progress-bar-fill ${
                  simStatus === 'EXCEEDED'
                    ? 'fill-exceeded'
                    : simStatus === 'WARNING'
                    ? 'fill-warning'
                    : 'fill-safe'
                }`}
                style={{ width: `${Math.min(100, simPercent)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
