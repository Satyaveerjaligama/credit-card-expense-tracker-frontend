'use client';

import React from 'react';

/**
 * Reusable PageHeader component for consistent subpage headers
 *
 * @param {Object} props
 * @param {React.ComponentType|React.ReactNode} [props.icon] - Lucide icon component or React element
 * @param {React.ReactNode} props.title - Main header title (rendered in h1)
 * @param {React.ReactNode} [props.description] - Subtitle/description text below title
 * @param {React.ReactNode} [props.subtitle] - Alias for description
 * @param {React.ReactNode} [props.actions] - Action buttons or controls rendered on the right side
 * @param {React.ReactNode} [props.children] - Additional content or fallback for actions
 * @param {string} [props.className] - Optional container CSS class name
 * @param {React.CSSProperties} [props.style] - Optional inline style overrides
 */
export default function PageHeader({
  icon: Icon,
  title,
  description,
  subtitle,
  actions,
  children,
  className = '',
  style = {},
}) {
  const rightContent = actions || children;
  const desc = description || subtitle;

  return (
    <div
      className={className}
      style={{
        display: rightContent ? 'flex' : 'block',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '1.75rem',
        ...style,
      }}
    >
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.25rem',
          }}
        >
          {Icon && (
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
                flexShrink: 0,
              }}
            >
              {React.isValidElement(Icon) ? (
                Icon
              ) : (
                <Icon size={18} />
              )}
            </div>
          )}
          <h1
            style={{
              fontSize: '1.65rem',
              fontWeight: 800,
              color: 'var(--text-main)',
            }}
          >
            {title}
          </h1>
        </div>
        {desc && (
          <p
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
            }}
          >
            {desc}
          </p>
        )}
      </div>

      {rightContent && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap',
          }}
        >
          {rightContent}
        </div>
      )}
    </div>
  );
}
