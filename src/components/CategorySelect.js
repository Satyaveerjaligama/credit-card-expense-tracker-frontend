'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
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
  ChevronDown,
  Check,
  Search,
  X,
  Tag,
} from 'lucide-react';

export const CATEGORY_DETAILS = {
  Dining: {
    name: 'Dining',
    label: 'Dining',
    // subtitle: 'Restaurants, cafes & food delivery',
    icon: Utensils,
    color: '#D97706',
    bgColor: '#FEF3C7',
    badgeClass: 'badge-amber',
    keywords: ['dining', 'restaurant', 'food', 'cafe', 'swiggy', 'zomato', 'eat', 'dinner', 'lunch', 'breakfast', 'coffee', 'drinks', 'bar', 'takeout'],
  },
  Shopping: {
    name: 'Shopping',
    label: 'Shopping',
    // subtitle: 'Clothing, electronics, retail & goods',
    icon: ShoppingBag,
    color: '#7C3AED',
    bgColor: '#EDE9FE',
    badgeClass: 'badge-lavender',
    keywords: ['shopping', 'amazon', 'clothes', 'fashion', 'retail', 'electronics', 'flipkart', 'myntra', 'shoes', 'mall', 'apparel', 'gadgets'],
  },
  Groceries: {
    name: 'Groceries',
    label: 'Groceries',
    // subtitle: 'Supermarkets, daily essentials & food',
    icon: ShoppingCart,
    color: '#059669',
    bgColor: '#D1FAE5',
    badgeClass: 'badge-sage',
    keywords: ['groceries', 'grocery', 'supermarket', 'blinkit', 'zepto', 'instamart', 'fruits', 'vegetables', 'milk', 'bread', 'food', 'provisions'],
  },
  Utilities: {
    name: 'Utilities',
    label: 'Utilities',
    // subtitle: 'Electricity, water, mobile & wifi',
    icon: Zap,
    color: '#B45309',
    bgColor: '#FEF9C3',
    badgeClass: 'badge-amber',
    keywords: ['utilities', 'bill', 'electricity', 'water', 'gas', 'power', 'internet', 'wifi', 'broadband', 'phone', 'recharge', 'dth'],
  },
  Travel: {
    name: 'Travel',
    label: 'Travel',
    // subtitle: 'Flights, cabs, train & hotels',
    icon: Plane,
    color: '#0284C7',
    bgColor: '#E0F2FE',
    badgeClass: 'badge-slate',
    keywords: ['travel', 'flight', 'airline', 'cab', 'uber', 'ola', 'train', 'irctc', 'hotel', 'booking', 'trip', 'commute', 'metro', 'fare'],
  },
  Entertainment: {
    name: 'Entertainment',
    label: 'Entertainment',
    // subtitle: 'Movies, concerts, events & gaming',
    icon: Film,
    color: '#9333EA',
    bgColor: '#F3E8FF',
    badgeClass: 'badge-lavender',
    keywords: ['entertainment', 'movie', 'cinema', 'bookmyshow', 'concert', 'gaming', 'steam', 'playstation', 'events', 'fun', 'tickets'],
  },
  Healthcare: {
    name: 'Healthcare',
    label: 'Healthcare',
    // subtitle: 'Pharmacy, doctors, wellness & lab',
    icon: HeartPulse,
    color: '#E11D48',
    bgColor: '#FEE2E2',
    badgeClass: 'badge-rose',
    keywords: ['healthcare', 'health', 'doctor', 'hospital', 'pharmacy', 'medicine', 'apollo', 'medical', 'clinic', 'dentist', 'lab', 'tests'],
  },
  Education: {
    name: 'Education',
    label: 'Education',
    // subtitle: 'Courses, books, tuition & skills',
    icon: GraduationCap,
    color: '#4F46E5',
    bgColor: '#E0E7FF',
    badgeClass: 'badge-slate',
    keywords: ['education', 'course', 'tuition', 'books', 'school', 'college', 'udemy', 'coursera', 'training', 'learning', 'exam', 'fees'],
  },
  Subscriptions: {
    name: 'Subscriptions',
    label: 'Subscriptions',
    // subtitle: 'Netflix, Spotify, SaaS & cloud apps',
    icon: Tv,
    color: '#6366F1',
    bgColor: '#EEF2FF',
    badgeClass: 'badge-lavender',
    keywords: ['subscriptions', 'subscription', 'netflix', 'spotify', 'youtube', 'prime', 'icloud', 'software', 'membership', 'chatgpt', 'hotstar'],
  },
  Fuel: {
    name: 'Fuel',
    label: 'Fuel',
    // subtitle: 'Petrol, diesel, CNG & EV charging',
    icon: Fuel,
    color: '#EA580C',
    bgColor: '#FFEDD5',
    badgeClass: 'badge-amber',
    keywords: ['fuel', 'petrol', 'diesel', 'cng', 'ev', 'gas station', 'hp', 'indian oil', 'shell', 'bharat petroleum', 'pump'],
  },
  Other: {
    name: 'Other',
    label: 'Other',
    // subtitle: 'Miscellaneous & general expenses',
    icon: MoreHorizontal,
    color: '#4B5563',
    bgColor: '#F3F4F6',
    badgeClass: 'badge-slate',
    keywords: ['other', 'misc', 'miscellaneous', 'general', 'cash', 'transfer', 'charges', 'penalty', 'fee'],
  },
};

export const CATEGORIES = Object.keys(CATEGORY_DETAILS);

/**
 * Modern, accessible CategorySelect component tailored for SwipeSense.
 * Replaces basic HTML <select> with a rich, interactive popover featuring
 * category icons, color badges, search filtering, and quick popular presets.
 */
export default function CategorySelect({
  value = 'Dining',
  onChange,
  id = 'expense-category',
  label = 'Category',
  disabled = false,
  error = '',
  width = '100%',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const triggerRef = useRef(null);

  const selectedCategory = CATEGORY_DETAILS[value] || CATEGORY_DETAILS.Other;
  const SelectedIcon = selectedCategory.icon;

  // Filter categories based on search query
  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return CATEGORIES;
    return CATEGORIES.filter((catKey) => {
      const item = CATEGORY_DETAILS[catKey];
      if (item.name.toLowerCase().includes(q)) return true;
      if (item.subtitle?.toLowerCase().includes(q)) return true;
      if (item.keywords && item.keywords.some((kw) => kw.includes(q))) return true;
      return false;
    });
  }, [searchQuery]);

  // Handle clicking outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery('');
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

  // Auto-focus search input when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSelect = (catKey) => {
    onChange?.(catKey);
    setIsOpen(false);
    setSearchQuery('');
    triggerRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchQuery('');
      triggerRef.current?.focus();
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!isOpen) {
        e.preventDefault();
        setIsOpen(true);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: width === '100%' ? '100%' : 'auto',
      }}
      onKeyDown={handleKeyDown}
    >
      {/* Hidden native select to preserve DOM testability & form accessibility */}
      <select
        id={id}
        value={value}
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
      >
        {CATEGORIES.map((catKey) => (
          <option key={catKey} value={catKey}>
            {CATEGORY_DETAILS[catKey].name}
          </option>
        ))}
      </select>

      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        id={`${id}-trigger`}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={`${id}-popup`}
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
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
        {/* Left: Category Icon Box & Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: selectedCategory.bgColor,
              color: selectedCategory.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            }}
          >
            <SelectedIcon size={16} strokeWidth={2.2} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span
              style={{
                fontWeight: 600,
                color: 'var(--text-main)',
                fontSize: '0.875rem',
                lineHeight: 1.25,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {selectedCategory.name}
            </span>
            <span
              style={{
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                lineHeight: 1.15,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {selectedCategory.subtitle?.split(',')[0]}
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

      {/* Floating Category Popover */}
      {isOpen && (
        <div
          id={`${id}-popup`}
          role="listbox"
          className="custom-dropdown-panel"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            width: '100%',
            minWidth: '290px',
            maxHeight: '340px',
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--border-light)',
            borderRadius: '12px',
            boxShadow: '0 14px 34px -4px rgba(32, 45, 38, 0.16), 0 4px 12px rgba(32, 45, 38, 0.05)',
            zIndex: 90,
            padding: '0.45rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
          }}
        >
          {/* Search Input */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: '9px',
                color: 'var(--text-faint)',
                pointerEvents: 'none',
              }}
            />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search category ..."
              style={{
                width: '100%',
                padding: '0.45rem 1.8rem 0.45rem 1.85rem',
                fontSize: '0.785rem',
                fontFamily: 'inherit',
                border: '1px solid var(--border-light)',
                borderRadius: '7px',
                backgroundColor: 'var(--sage-50)',
                color: 'var(--text-main)',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--sage-400)';
                e.target.style.backgroundColor = '#FFFFFF';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-light)';
                e.target.style.backgroundColor = 'var(--sage-50)';
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '6px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-faint)',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Category List */}
          <div
            style={{
              overflowY: 'auto',
              maxHeight: '155px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.15rem',
              paddingRight: '2px',
            }}
          >
            {filteredCategories.length === 0 ? (
              <div
                style={{
                  padding: '1.25rem 0.5rem',
                  textAlign: 'center',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                }}
              >
                No categories matching &quot;{searchQuery}&quot;
              </div>
            ) : (
              filteredCategories.map((catKey) => {
                const item = CATEGORY_DETAILS[catKey];
                const ItemIcon = item.icon;
                const isSelected = value === catKey;

                return (
                  <button
                    key={catKey}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(catKey)}
                    className={`dropdown-option ${isSelected ? 'active' : ''}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.35rem 0.55rem',
                      borderRadius: '7px',
                      border: isSelected
                        ? '1px solid var(--sage-300)'
                        : '1px solid transparent',
                      backgroundColor: isSelected ? 'var(--sage-100)' : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all var(--transition-fast)',
                      width: '100%',
                      fontFamily: 'inherit',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '7px',
                          backgroundColor: item.bgColor,
                          color: item.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <ItemIcon size={15} strokeWidth={2.2} />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <span
                          style={{
                            fontSize: '0.835rem',
                            fontWeight: isSelected ? 700 : 600,
                            color: isSelected ? 'var(--sage-700)' : 'var(--text-main)',
                            lineHeight: 1.25,
                          }}
                        >
                          {item.name}
                        </span>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            color: 'var(--text-faint)',
                            lineHeight: 1.15,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {item.subtitle}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <div
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--sage-500)',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginLeft: '0.5rem',
                        }}
                      >
                        <Check size={11} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
