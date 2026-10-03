'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Calendar } from 'lucide-react';

/**
 * CustomDropdown component tailored to SwipeSense pastel sage design system.
 * Replaces unstyled native selects with an elegant, accessible popover menu.
 *
 * @param {Object} props
 * @param {string|number} props.value - Currently selected value
 * @param {Function} props.onChange - Selection change callback
 * @param {Array<{value: string|number, label: string, subtitle?: string, badge?: string}>} props.options
 * @param {string} [props.id] - Element ID
 * @param {React.ComponentType} [props.icon] - Leading icon component
 * @param {string} [props.label] - Label prefix
 * @param {'left'|'right'} [props.align] - Popover alignment
 * @param {string} [props.width] - Optional width override
 */
export default function CustomDropdown({
  value,
  onChange,
  options = [],
  id = 'select-dropdown',
  icon: Icon = null,
  label = '',
  align = 'right',
  width = 'auto',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);

  const isFullWidth = width === '100%';

  // Find currently selected option
  const selectedOption =
    options.find((opt) => String(opt.value) === String(value)) || options[0];

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      const currentIndex = options.findIndex(
        (opt) => String(opt.value) === String(value)
      );
      let nextIndex = currentIndex;
      if (e.key === 'ArrowDown') {
        nextIndex = (currentIndex + 1) % options.length;
      } else {
        nextIndex = (currentIndex - 1 + options.length) % options.length;
      }
      onChange(options[nextIndex].value);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    }
  };

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        display: isFullWidth ? 'flex' : 'inline-flex',
        flexDirection: isFullWidth && label ? 'column' : 'row',
        alignItems: isFullWidth && label ? 'flex-start' : 'center',
        gap: isFullWidth && label ? '0.4rem' : '0.6rem',
        width: isFullWidth ? '100%' : 'auto',
        userSelect: 'none',
      }}
      onKeyDown={handleKeyDown}
    >
      {/* Hidden native select to preserve DOM testability & form accessibility */}
      <select
        id={id}
        value={value}
        onChange={(e) =>
          onChange(typeof value === 'number' ? Number(e.target.value) : e.target.value)
        }
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
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {label && (
        <span
          style={{
            fontSize: '0.825rem',
            color: 'var(--text-muted)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          {label}:
        </span>
      )}

      {/* Dropdown Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={`${id}-menu`}
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.65rem',
          padding: isFullWidth ? '0.65rem 0.875rem' : '0.45rem 0.85rem',
          fontSize: isFullWidth ? '0.925rem' : '0.85rem',
          fontFamily: 'inherit',
          color: 'var(--text-main)',
          backgroundColor: isOpen ? 'var(--sage-50)' : 'var(--bg-card)',
          border: isOpen
            ? '1px solid var(--sage-400)'
            : isFullWidth
            ? '1px solid var(--border-medium)'
            : '1px solid var(--border-light)',
          borderRadius: isFullWidth ? 'var(--radius-sm)' : '10px',
          boxShadow: isOpen
            ? '0 0 0 3px rgba(87, 142, 108, 0.15), var(--shadow-sm)'
            : 'var(--shadow-sm)',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)',
          width: isFullWidth ? '100%' : width !== 'auto' ? width : undefined,
          minWidth: isFullWidth ? undefined : '155px',
        }}
        className="dropdown-trigger"
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {Icon && (
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isOpen ? 'var(--sage-600)' : 'var(--sage-500)',
                transition: 'color var(--transition-fast)',
              }}
            >
              <Icon size={15} strokeWidth={2.2} />
            </span>
          )}
          <span
            style={{
              fontSize: isFullWidth ? '0.925rem' : '0.85rem',
              fontWeight: 600,
              color: 'var(--text-main)',
              letterSpacing: '-0.01em',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
            }}
          >
            {selectedOption?.label || 'Select'}
          </span>
        </span>

        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            color: 'var(--text-muted)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <ChevronDown size={14} strokeWidth={2.4} />
        </span>
      </button>

      {/* Floating Menu Popover */}
      {isOpen && (
        <div
          id={`${id}-menu`}
          role="listbox"
          tabIndex={-1}
          className="custom-dropdown-panel"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            ...(isFullWidth
              ? { left: 0, right: 0, width: '100%' }
              : { [align === 'right' ? 'right' : 'left']: 0, minWidth: '220px' }),
            zIndex: 60,
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--border-light)',
            borderRadius: '12px',
            boxShadow: '0 12px 30px -4px rgba(32, 45, 38, 0.14), 0 4px 10px -2px rgba(32, 45, 38, 0.05)',
            padding: '0.4rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
          }}
        >

          {/* Options list */}
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(option.value)}
                className={`dropdown-option ${isSelected ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '8px',
                  border: isSelected
                    ? '1px solid var(--sage-200)'
                    : '1px solid transparent',
                  backgroundColor: isSelected ? 'var(--sage-100)' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all var(--transition-fast)',
                  fontFamily: 'inherit',
                  width: '100%',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <span
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: isSelected ? 700 : 500,
                        color: isSelected ? 'var(--sage-700)' : 'var(--text-main)',
                      }}
                    >
                      {option.label}
                    </span>
                    {option.badge && (
                      <span
                        style={{
                          fontSize: '0.675rem',
                          fontWeight: 700,
                          padding: '0.1rem 0.35rem',
                          borderRadius: '4px',
                          backgroundColor: isSelected ? 'var(--sage-200)' : 'var(--lavender-100)',
                          color: isSelected ? 'var(--sage-700)' : 'var(--lavender-600)',
                          lineHeight: 1.1,
                        }}
                      >
                        {option.badge}
                      </span>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--sage-500)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginLeft: '0.5rem',
                      boxShadow: '0 1px 3px rgba(87, 142, 108, 0.25)',
                    }}
                  >
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
