import React from 'react';
import { Link } from 'react-router-dom';
import { FiPhone, FiMail, FiMapPin, FiShield, FiTruck, FiAward } from 'react-icons/fi';
import { GiCarWheel } from 'react-icons/gi';

function Footer() {
    return (
        <footer style={{
            backgroundColor: 'var(--footer-bg)',
            color: 'var(--text-secondary)',
            borderTop: '1px solid var(--border-color)',
            marginTop: 'auto',
            paddingTop: 'clamp(32px, 5vw, 50px)',
            paddingBottom: '24px'
        }}>
            <div style={{
                maxWidth: '1350px',
                margin: '0 auto',
                padding: '0 clamp(16px, 3vw, 24px)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
                gap: 'clamp(24px, 4vw, 40px)',
                marginBottom: '32px'
            }}>
                {/* Col 1: Brand Info */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            background: 'var(--accent-gradient)',
                            color: '#000',
                            fontSize: '20px'
                        }}>
                            <GiCarWheel />
                        </div>
                        <span style={{ fontSize: '20px', fontWeight: '900', color: '#ffffff', fontFamily: "'Outfit', sans-serif" }}>
                            APPOLO <span style={{ color: 'var(--accent-primary)' }}>TYRES</span>
                        </span>
                    </div>
                    <p style={{ fontSize: '13.5px', lineHeight: '1.6', color: 'rgba(255,255,255,0.7)', marginBottom: '18px' }}>
                        Leading authorized hub for all-season, high-performance, commercial, and heavy-duty industrial tyres. Guaranteed genuine stock with doorstep delivery.
                    </p>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '4px 10px', borderRadius: '20px', fontWeight: '600' }}>
                            <FiShield /> 100% Genuine
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.15)', padding: '4px 10px', borderRadius: '20px', fontWeight: '600' }}>
                            <FiAward /> Best Price
                        </span>
                    </div>
                </div>

                {/* Col 2: Quick Links */}
                <div>
                    <h3 style={{ color: '#ffffff', fontSize: '15px', fontWeight: '700', marginBottom: '14px' }}>
                        Quick Navigation
                    </h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <li>
                            <Link to="/categories" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s', display: 'inline-block', padding: '2px 0' }}
                                onMouseEnter={(e) => e.target.style.color = 'var(--accent-primary)'}
                                onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.7)'}>
                                Tyre Categories
                            </Link>
                        </li>
                        <li>
                            <Link to="/products" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s', display: 'inline-block', padding: '2px 0' }}
                                onMouseEnter={(e) => e.target.style.color = 'var(--accent-primary)'}
                                onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.7)'}>
                                Browse All Stock
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Col 3: Vehicle Tyres */}
                <div>
                    <h3 style={{ color: '#ffffff', fontSize: '15px', fontWeight: '700', marginBottom: '14px' }}>
                        Vehicle Segments
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {["Car & SUV", "Bikes & Scooters", "Heavy Trucks & Bus", "Agricultural / Tractor", "OTR & Industrial"].map((tag, i) => (
                            <span key={i} style={{
                                fontSize: '12px',
                                padding: '5px 10px',
                                borderRadius: '6px',
                                backgroundColor: 'rgba(255,255,255,0.06)',
                                color: 'rgba(255,255,255,0.8)',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Col 4: Contact info */}
                <div>
                    <h3 style={{ color: '#ffffff', fontSize: '15px', fontWeight: '700', marginBottom: '14px' }}>
                        Customer Support
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px', color: 'rgba(255,255,255,0.7)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FiPhone style={{ color: '#25D366', fontSize: '16px', flexShrink: 0 }} />
                            <a href="https://wa.me/918848493933" target="_blank" rel="noreferrer" style={{ color: '#25D366', textDecoration: 'none', fontWeight: '700' }}>
                                +91 88484 93933 (WhatsApp)
                            </a>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FiTruck style={{ color: 'var(--accent-primary)', fontSize: '16px', flexShrink: 0 }} />
                            <span>Express Shipping Available</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FiMapPin style={{ color: '#3b82f6', fontSize: '16px', flexShrink: 0 }} />
                            <span>Main Distribution Hub</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div style={{
                maxWidth: '1350px',
                margin: '0 auto',
                padding: '20px clamp(16px, 3vw, 24px) 0',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px',
                fontSize: '12.5px',
                color: 'rgba(255,255,255,0.5)'
            }}>
                <p style={{ margin: 0 }}>
                    &copy; {new Date().getFullYear()} APPOLO TYRES Distribution. All rights reserved.
                </p>
                <p style={{ margin: 0, display: 'flex', gap: '16px' }}>
                    <span>⚡ Engineered for Maximum Grip & Safety</span>
                </p>
            </div>
        </footer>
    );
}

export default Footer;
