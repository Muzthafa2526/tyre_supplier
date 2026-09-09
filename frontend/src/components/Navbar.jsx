import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { FiMenu, FiX, FiHome, FiGrid, FiLock, FiPhone, FiCheckCircle } from 'react-icons/fi';
import { GiCarWheel } from 'react-icons/gi';

function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();

    const navLinks = [
        { to: "/categories", label: "Categories", icon: <FiHome /> },
        { to: "/products", label: "Tyre Catalogue", icon: <FiGrid /> },
        // { to: "/admin-erp", label: "Admin ERP", icon: <FiLock /> }
    ];

    const isActive = (path) => {
        if (path === "/categories" && (location.pathname === "/" || location.pathname === "/categories")) return true;
        return location.pathname === path;
    };

    return (
        <nav style={{
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            backgroundColor: 'var(--nav-bg)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.3s ease'
        }}>
            <div style={{
                maxWidth: '1380px',
                margin: '0 auto',
                padding: 'clamp(10px, 2vw, 14px) clamp(14px, 3vw, 28px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
            }}>
                {/* Brand Logo */}
                <Link to="/" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    textDecoration: 'none',
                    color: 'inherit'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: 'var(--accent-gradient)',
                        color: '#000',
                        fontSize: '22px',
                        boxShadow: '0 4px 14px var(--accent-glow)',
                        flexShrink: 0
                    }}>
                        <GiCarWheel style={{ animation: 'spinSlow 15s linear infinite' }} />
                    </div>
                    <div>
                        <div style={{
                            fontSize: 'clamp(17px, 3.8vw, 21px)',
                            fontWeight: '900',
                            letterSpacing: '0.8px',
                            fontFamily: "'Outfit', sans-serif",
                            color: 'var(--text-primary)',
                            lineHeight: 1
                        }}>
                            APPOLO <span style={{ color: 'var(--accent-primary)' }}>TYRES</span>
                        </div>
                        <div style={{
                            fontSize: '9.5px',
                            fontWeight: '800',
                            letterSpacing: '1.2px',
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase',
                            marginTop: '3px'
                        }}>
                            Authorized Direct Hub
                        </div>
                    </div>
                </Link>

                {/* Desktop Nav Links */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '24px'
                }} className="desktop-nav">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {navLinks.map((link) => {
                            const active = isActive(link.to);
                            return (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '9px 18px',
                                        borderRadius: '10px',
                                        textDecoration: 'none',
                                        fontSize: '14px',
                                        fontWeight: active ? '800' : '600',
                                        color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                        backgroundColor: active ? 'var(--badge-bg)' : 'transparent',
                                        border: active ? '1px solid var(--border-highlight)' : '1px solid transparent',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!active) {
                                            e.currentTarget.style.color = 'var(--text-primary)';
                                            e.currentTarget.style.backgroundColor = 'var(--bg-glass)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!active) {
                                            e.currentTarget.style.color = 'var(--text-secondary)';
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }
                                    }}
                                >
                                    <span>{link.icon}</span>
                                    <span>{link.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-color)' }} />

                    {/* WhatsApp Fast Connect */}
                    <a
                        href="https://wa.me/918848493933"
                        target="_blank"
                        rel="noreferrer"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '9px 18px',
                            borderRadius: '10px',
                            backgroundColor: 'rgba(37, 211, 102, 0.12)',
                            color: '#25D366',
                            border: '1px solid rgba(37, 211, 102, 0.3)',
                            fontSize: '13.5px',
                            fontWeight: '700',
                            textDecoration: 'none',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(37, 211, 102, 0.25)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(37, 211, 102, 0.12)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <FiPhone /> WhatsApp Inquiry
                    </a>

                    {/* Day / Night Theme Toggle */}
                    <ThemeToggle showLabel={false} />
                </div>

                {/* Mobile Menu & Theme Button */}
                <div style={{ display: 'none', alignItems: 'center', gap: '8px' }} className="mobile-actions">
                    <ThemeToggle showLabel={false} />
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label="Toggle mobile menu"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--bg-glass)',
                            color: 'var(--text-primary)',
                            fontSize: '19px',
                            cursor: 'pointer'
                        }}
                    >
                        {mobileOpen ? <FiX /> : <FiMenu />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {mobileOpen && (
                <>
                    <div
                        onClick={() => setMobileOpen(false)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            top: '60px',
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 998
                        }}
                    />
                    <div style={{
                        position: 'relative',
                        zIndex: 999,
                        padding: '14px 18px 20px',
                        borderTop: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-secondary)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        boxShadow: 'var(--shadow-lg)'
                    }} className="mobile-drawer animate-fade-in">
                        {navLinks.map((link) => {
                            const active = isActive(link.to);
                            return (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    onClick={() => setMobileOpen(false)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px 14px',
                                        borderRadius: '10px',
                                        textDecoration: 'none',
                                        fontSize: '14.5px',
                                        fontWeight: active ? '800' : '600',
                                        color: active ? 'var(--accent-primary)' : 'var(--text-primary)',
                                        backgroundColor: active ? 'var(--badge-bg)' : 'var(--bg-glass)',
                                        border: '1px solid var(--border-color)'
                                    }}
                                >
                                    <span style={{ fontSize: '18px' }}>{link.icon}</span>
                                    <span>{link.label}</span>
                                </Link>
                            );
                        })}

                        <a
                            href="https://wa.me/918848493933"
                            target="_blank"
                            rel="noreferrer"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                padding: '12px 14px',
                                borderRadius: '10px',
                                backgroundColor: '#25D366',
                                color: '#fff',
                                fontWeight: '700',
                                fontSize: '14.5px',
                                textDecoration: 'none',
                                marginTop: '4px'
                            }}
                        >
                            <FiPhone /> WhatsApp Fast Order
                        </a>
                    </div>
                </>
            )}

            <style>{`
                @media (max-width: 860px) {
                    .desktop-nav {
                        display: none !important;
                    }
                    .mobile-actions {
                        display: flex !important;
                    }
                }
            `}</style>
        </nav>
    );
}

export default Navbar;
