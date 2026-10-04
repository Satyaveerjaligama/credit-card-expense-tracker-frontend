'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  RotateCcw,
} from 'lucide-react';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DAY_NAMES = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

/**
 * Safely parse YYYY-MM-DD string into a local Date object without UTC timezone skew
 */
function parseISODate(dateStr) {
  if (!dateStr) return new Date();
  const parts = String(dateStr).split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      return new Date(y, m - 1, d);
    }
  }
  return new Date();
}

/**
 * Format Date object to YYYY-MM-DD
 */
function toISODateString(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Get readable human date representation
 */
function formatReadableDate(dateStr) {
  if (!dateStr) return 'Select Date';
  const d = parseISODate(dateStr);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthShorts = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${dayNames[d.getDay()]}, ${String(d.getDate()).padStart(2, '0')} ${monthShorts[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Modern, accessible DatePickerInput component for SwipeSense.
 * Replaces basic browser HTML <input type="date"> with a polished, theme-aligned
 * calendar picker featuring 1-click quick shortcuts (Today, Yesterday, 2 Days Ago)
 * and an interactive month grid.
 */
export default function DatePickerInput({
  value,
  onChange,
  id = 'expense-date',
  label = 'Date',
  disabled = false,
  error = '',
  width = '100%',
  align = 'left',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);

  // Initialize viewing calendar month and year based on selected value
  const initialDate = useMemo(() => parseISODate(value), [value]);
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth()); // 0-11

  // Today & Yesterday ISO strings
  const todayObj = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => toISODateString(todayObj), [todayObj]);

  const yesterdayStr = useMemo(() => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    return toISODateString(y);
  }, []);

  const twoDaysAgoStr = useMemo(() => {
    const t = new Date();
    t.setDate(t.getDate() - 2);
    return toISODateString(t);
  }, []);

  const firstOfMonthStr = useMemo(() => {
    const f = new Date();
    f.setDate(1);
    return toISODateString(f);
  }, []);

  // Relative status tag
  const relativeBadge = useMemo(() => {
    if (value === todayStr) return { text: 'Today', type: 'badge-sage' };
    if (value === yesterdayStr) return { text: 'Yesterday', type: 'badge-amber' };
    return null;
  }, [value, todayStr, yesterdayStr]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleJumpToToday = (e) => {
    e.stopPropagation();
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
  };

  const handleToggle = () => {
    if (!isOpen && value) {
      const parsed = parseISODate(value);
      setViewYear(parsed.getFullYear());
      setViewMonth(parsed.getMonth());
    }
    setIsOpen((prev) => !prev);
  };

  const handleSelectDate = (dateStr) => {
    const parsed = parseISODate(dateStr);
    setViewYear(parsed.getFullYear());
    setViewMonth(parsed.getMonth());
    onChange?.(dateStr);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      triggerRef.current?.focus();
    }
  };

  // Build 42-cell calendar grid (6 rows of 7 days, Monday to Sunday)
  const calendarCells = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    // (firstDayOfMonth.getDay() + 6) % 7 converts Sunday=0 to 6, Monday=1 to 0
    const startDayIndex = (firstDayOfMonth.getDay() + 6) % 7;
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells = [];

    // Previous month filler days
    for (let i = startDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
      const iso = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        dayNum: d,
        iso,
        isCurrentMonth: false,
        isPrevMonth: true,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        dayNum: d,
        iso,
        isCurrentMonth: true,
        isToday: iso === todayStr,
        isSelected: iso === value,
      });
    }

    // Next month filler days (fill up to 35 or 42 cells)
    const totalCellsTarget = cells.length > 35 ? 42 : 35;
    const nextDaysNeeded = totalCellsTarget - cells.length;
    for (let d = 1; d <= nextDaysNeeded; d++) {
      const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
      const iso = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        dayNum: d,
        iso,
        isCurrentMonth: false,
        isNextMonth: true,
      });
    }

    return cells;
  }, [viewYear, viewMonth, todayStr, value]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: width === '100%' ? '100%' : 'auto',
      }}
      onKeyDown={handleKeyDown}
    >
      {/* Hidden native input to preserve DOM testability & form accessibility */}
      <input
        type="date"
        id={id}
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        tabIndex={-1}
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          borderWidth: 0,
          opacity: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        id={`${id}-trigger`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={`${id}-calendar`}
        disabled={disabled}
        onClick={handleToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.65rem',
          padding: '0.45rem 0.75rem',
          fontSize: '0.9rem',
          fontFamily: 'inherit',
          backgroundColor: isOpen ? 'var(--sage-50)' : 'var(--bg-card)',
          border: isOpen
            ? '1.5px solid var(--sage-500)'
            : error
            ? '1px solid var(--rose-400)'
            : '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-sm)',
          boxShadow: isOpen
            ? '0 0 0 3px rgba(87, 142, 108, 0.18), var(--shadow-sm)'
            : 'var(--shadow-sm)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all var(--transition-fast)',
          textAlign: 'left',
        }}
      >
        {/* Left: Calendar Icon Box & Formatted Date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'var(--sage-100)',
              color: 'var(--sage-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            }}
          >
            <Calendar size={16} strokeWidth={2.2} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'nowrap' }}>
              <span
                style={{
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                  lineHeight: 1.25,
                  whiteSpace: 'nowrap',
                }}
              >
                {formatReadableDate(value)}
              </span>
              {relativeBadge && (
                <span
                  className={`badge ${relativeBadge.type}`}
                  style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', lineHeight: 1 }}
                >
                  {relativeBadge.text}
                </span>
              )}
            </div>
            <span
              style={{
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                lineHeight: 1.15,
                fontFamily: 'var(--font-mono, monospace)',
              }}
            >
              {value || 'YYYY-MM-DD'}
            </span>
          </div>
        </div>

        {/* Right: Chevron */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            color: 'var(--text-muted)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            flexShrink: 0,
          }}
        >
          <ChevronDown size={16} strokeWidth={2.2} />
        </div>
      </button>

      {/* Floating Calendar Popover */}
      {isOpen && (
        <div
          id={`${id}-calendar`}
          role="dialog"
          aria-label="Date Picker Calendar"
          className="custom-dropdown-panel"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            ...(align === 'right'
              ? { right: 0, left: 'auto', width: '310px' }
              : { left: 0, width: '320px', maxWidth: '100%' }),
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--border-light)',
            borderRadius: '12px',
            boxShadow: '0 14px 34px -4px rgba(32, 45, 38, 0.16), 0 4px 12px rgba(32, 45, 38, 0.05)',
            zIndex: 90,
            padding: '0.6rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.45rem',
          }}
        >
          {/* Quick Preset Shortcuts */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '0.675rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: 'var(--text-faint)',
                marginRight: '0.1rem',
              }}
            >
              Quick:
            </span>
            <button
              type="button"
              onClick={() => handleSelectDate(todayStr)}
              style={{
                padding: '0.2rem 0.45rem',
                fontSize: '0.7rem',
                fontWeight: 600,
                borderRadius: '5px',
                border: value === todayStr ? '1px solid var(--sage-400)' : '1px solid var(--border-light)',
                backgroundColor: value === todayStr ? 'var(--sage-100)' : 'var(--bg-card)',
                color: value === todayStr ? 'var(--sage-700)' : 'var(--text-main)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => handleSelectDate(yesterdayStr)}
              style={{
                padding: '0.2rem 0.45rem',
                fontSize: '0.7rem',
                fontWeight: 600,
                borderRadius: '5px',
                border: value === yesterdayStr ? '1px solid var(--amber-400, #FBBF24)' : '1px solid var(--border-light)',
                backgroundColor: value === yesterdayStr ? 'var(--amber-100)' : 'var(--bg-card)',
                color: value === yesterdayStr ? 'var(--amber-700, #B45309)' : 'var(--text-main)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              Yesterday
            </button>
            <button
              type="button"
              onClick={() => handleSelectDate(twoDaysAgoStr)}
              style={{
                padding: '0.2rem 0.45rem',
                fontSize: '0.7rem',
                fontWeight: 600,
                borderRadius: '5px',
                border: value === twoDaysAgoStr ? '1px solid var(--sage-400)' : '1px solid var(--border-light)',
                backgroundColor: value === twoDaysAgoStr ? 'var(--sage-100)' : 'var(--bg-card)',
                color: value === twoDaysAgoStr ? 'var(--sage-700)' : 'var(--text-main)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              2d Ago
            </button>
            <button
              type="button"
              onClick={() => handleSelectDate(firstOfMonthStr)}
              style={{
                padding: '0.2rem 0.45rem',
                fontSize: '0.7rem',
                fontWeight: 600,
                borderRadius: '5px',
                border: value === firstOfMonthStr ? '1px solid var(--sage-400)' : '1px solid var(--border-light)',
                backgroundColor: value === firstOfMonthStr ? 'var(--sage-100)' : 'var(--bg-card)',
                color: value === firstOfMonthStr ? 'var(--sage-700)' : 'var(--text-main)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              1st
            </button>
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--border-light)' }} />

          {/* Month & Year Navigation Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.1rem 0.15rem',
            }}
          >
            <button
              type="button"
              onClick={handlePrevMonth}
              title="Previous Month"
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                border: '1px solid var(--border-light)',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--sage-50)';
                e.currentTarget.style.borderColor = 'var(--sage-300)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                e.currentTarget.style.borderColor = 'var(--border-light)';
              }}
            >
              <ChevronLeft size={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>
              <button
                type="button"
                onClick={handleJumpToToday}
                title="Jump to current month"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--sage-600)',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <RotateCcw size={12} />
              </button>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              title="Next Month"
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                border: '1px solid var(--border-light)',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--sage-50)';
                e.currentTarget.style.borderColor = 'var(--sage-300)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                e.currentTarget.style.borderColor = 'var(--border-light)';
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Weekday Names Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              textAlign: 'center',
              gap: '2px',
            }}
          >
            {DAY_NAMES.map((name) => (
              <span
                key={name}
                style={{
                  fontSize: '0.685rem',
                  fontWeight: 700,
                  color: 'var(--text-faint)',
                  padding: '0.2rem 0',
                }}
              >
                {name}
              </span>
            ))}
          </div>

          {/* Calendar Days 7-column Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '3px',
            }}
          >
            {calendarCells.map((cell, idx) => {
              const isSelected = cell.iso === value;
              const isToday = cell.iso === todayStr;

              return (
                <button
                  key={`${cell.iso}-${idx}`}
                  type="button"
                  onClick={() => handleSelectDate(cell.iso)}
                  style={{
                    height: '24px',
                    borderRadius: '5px',
                    border: isSelected
                      ? '1px solid var(--sage-600)'
                      : isToday
                      ? '1px solid var(--sage-400)'
                      : '1px solid transparent',
                    backgroundColor: isSelected
                      ? 'var(--sage-500)'
                      : isToday
                      ? 'var(--sage-50)'
                      : 'transparent',
                    color: isSelected
                      ? '#FFFFFF'
                      : !cell.isCurrentMonth
                      ? 'var(--text-faint)'
                      : isToday
                      ? 'var(--sage-700)'
                      : 'var(--text-main)',
                    fontWeight: isSelected || isToday ? 700 : cell.isCurrentMonth ? 500 : 400,
                    fontSize: '0.785rem',
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    boxShadow: isSelected ? '0 2px 5px rgba(87, 142, 108, 0.35)' : 'none',
                    opacity: !cell.isCurrentMonth ? 0.45 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'var(--sage-100)';
                      e.currentTarget.style.color = 'var(--sage-800)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = isToday ? 'var(--sage-50)' : 'transparent';
                      e.currentTarget.style.color = isToday
                        ? 'var(--sage-700)'
                        : !cell.isCurrentMonth
                        ? 'var(--text-faint)'
                        : 'var(--text-main)';
                    }
                  }}
                >
                  {cell.dayNum}
                </button>
              );
            })}
          </div>

          {/* Footer Bar with Current Date & Close */}
          <div
            style={{
              borderTop: '1px solid var(--border-light)',
              paddingTop: '0.45rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
            }}
          >
            <span style={{ color: 'var(--text-muted)' }}>
              Selected: <strong style={{ color: 'var(--text-main)' }}>{value || 'None'}</strong>
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="btn btn-secondary btn-sm"
              style={{
                fontSize: '0.725rem',
                padding: '0.2rem 0.55rem',
                borderRadius: '5px',
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
