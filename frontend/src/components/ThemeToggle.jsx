import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';

function ThemeToggle({ showLabel = false, style = {} }) {
    const { isDark, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to Light Day Mode" : "Switch to Dark Night Mode"}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 12px',
                borderRadius: '9999px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-glass)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                backdropFilter: 'blur(8px)',
                boxShadow: 'var(--shadow-sm)',
                userSelect: 'none',
                ...style
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: isDark ? 'rgba(245, 158, 11, 0.18)' : 'rgba(217, 119, 6, 0.15)',
                    color: isDark ? '#fbbf24' : '#d97706',
                    fontSize: '15px',
                    transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    transform: isDark ? 'rotate(0deg)' : 'rotate(180deg)'
                }}
            >
                {isDark ? <FiMoon /> : <FiSun />}
            </div>
            
            {showLabel && (
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    {isDark ? 'Night Mode' : 'Day Mode'}
                </span>
            )}
        </button>
    );
}

export default ThemeToggle;
