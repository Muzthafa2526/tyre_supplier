import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api, { getMediaUrl } from "../api/axios";
import {
    FiShield,
    FiTruck,
    FiHeadphones,
    FiArrowRight,
    FiCheckCircle,
    FiStar,
    FiZap,
    FiChevronLeft,
    FiChevronRight
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { GiCarWheel } from "react-icons/gi";

function getDefaultTyreImage(product) {
    if (!product) return "/images/tyres/car_suv_van.jpg";
    const cat = (product.category_name || (typeof product.category === "string" ? product.category : "") || "").toLowerCase();
    const rim = (product.rim_size || "").toLowerCase();
    const material = (product.material || "").toLowerCase();

    // 1. Bike & Scooter
    if (
        cat.includes("bike") || cat.includes("scooter") || cat.includes("2w") || cat.includes("two") || cat.includes("motorcycle") ||
        rim.includes("scooter") || rim.includes("motorcycle") || rim.includes("10") || rim.includes("12") ||
        material.includes("actigrip") || material.includes("actizip") || material.includes("actisteer") || material.includes("actizoom") ||
        material.includes("tramplr") || material.includes("alpha") || material.includes("wav") ||
        material.includes("activa") || material.includes("splendor") || material.includes("pulsar") || material.includes("fz") || material.includes("jupiter") ||
        material.includes("3.50-10") || material.includes("3.00-10") || material.includes("90/100-10") || material.includes("90/90-12") ||
        material.includes("100/80-12") || material.includes("110/80-12") || material.includes("110/70-12") || material.includes("110/90-10")
    ) {
        return "/images/tyres/bike_scooter.jpg";
    }

    // 2. Truck & Bus / Commercial
    if (cat.includes("truck") || cat.includes("bus") || cat.includes("tbr") || cat.includes("tbb") || cat.includes("scv") || cat.includes("ltr") || cat.includes("ltb") || rim.includes("truck") || rim.includes("bus") || material.includes("endurace") || material.includes("amar") || material.includes("miler") || material.includes("super miler")) {
        return "/images/tyres/truck_bus.jpg";
    }

    // 3. Agricultural & Tractor
    if (cat.includes("agri") || cat.includes("farm") || cat.includes("tractor") || rim.includes("tractor") || rim.includes("agri") || material.includes("virat") || material.includes("dhruv") || material.includes("azoom") || material.includes("fx 515") || material.includes("kisan") || material.includes("krishak")) {
        return "/images/tyres/agricultural.jpg";
    }

    // 4. Industrial & Earthmover
    if (cat.includes("industrial") || cat.includes("ind") || cat.includes("otr") || rim.includes("loader") || rim.includes("backhoe") || rim.includes("crane") || rim.includes("grader") || rim.includes("otr") || material.includes("loader") || material.includes("earthmover") || material.includes("jcb") || material.includes("tipper")) {
        return "/images/tyres/industrial.jpg";
    }

    // 5. Car, SUV & Van (Passenger)
    return "/images/tyres/car_suv_van.jpg";
}

function getTyreImageUrl(prod) {
    if (!prod) return "/images/tyres/car_suv_van.jpg";
    if (prod.image) {
        return getMediaUrl(prod.image);
    }
    return getDefaultTyreImage(prod);
}

const CATEGORY_ICONS = {
    "car": "🚗",
    "suv": "🚙",
    "bike": "🏍️",
    "scooter": "🛵",
    "truck": "🚛",
    "bus": "🚌",
    "agri": "🚜",
    "tractor": "🚜",
    "industrial": "🏗️",
};

function getCategoryIcon(name) {
    const n = (name || "").toLowerCase();
    for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
        if (n.includes(key)) return icon;
    }
    return "🛞";
}

// Curated built-in fallback Apollo slides when no custom banner is uploaded
const DEFAULT_FALLBACK_SLIDES = [
    {
        id: "slide-1",
        isCurated: true,
        title: "Apollo Alnac 4G & Apterra Series",
        subtitle: "Unmatched Precision & Highway Safety for Passenger Cars & SUVs",
        badge: "AUTHORIZED APOLLO DISTRIBUTOR",
        bgGradient: "linear-gradient(135deg, #09203f 0%, #1e3c72 100%)",
        accent: "#f59e0b",
        tyreImg: "/images/tyres/car_tyre_hero.jpg",
        btnText: "Explore Passenger Tyres",
        categoryFilter: "Car, SUV & Van"
    },
    {
        id: "slide-2",
        isCurated: true,
        title: "Apollo ActiGRIP Two-Wheeler Series",
        subtitle: "Supreme Cornering Stability & Wet-Grip for Bikes & Scooters",
        badge: "PERFORMANCE 2-WHEELER RANGE",
        bgGradient: "linear-gradient(135deg, #1b2838 0%, #2a475e 100%)",
        accent: "#ec4899",
        tyreImg: "/images/tyres/bike_tyre_hero.jpg",
        btnText: "Explore Bike & Scooter Tyres",
        categoryFilter: "Bike & Scooter"
    },
    {
        id: "slide-3",
        isCurated: true,
        title: "Apollo EnduRace Heavy Commercial Radial",
        subtitle: "Maximum Ton-Kilometer Mileage & Heavy Load Endurance for Fleets",
        badge: "COMMERCIAL FLEET PARTNER",
        bgGradient: "linear-gradient(135deg, #141e30 0%, #243b55 100%)",
        accent: "#3b82f6",
        tyreImg: "/images/tyres/truck_bus.jpg",
        btnText: "Explore Commercial Tyres",
        categoryFilter: "Truck & Bus"
    },
    {
        id: "slide-4",
        isCurated: true,
        title: "Apollo Farm & Virat Radials",
        subtitle: "Superior Soil Grip & Minimal Fuel Consumption on Every Acre",
        badge: "AGRICULTURE & HEAVY EQUIPMENT",
        bgGradient: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
        accent: "#10b981",
        tyreImg: "/images/tyres/agricultural.jpg",
        btnText: "Explore Agricultural Stock",
        categoryFilter: "Agricultural"
    }
];

// Exact Popular Bike & Scooty tyres requested
const POPULAR_TYRE_PATTERNS = [
    { size: "90/100", pattern: "s5", label: "90/100-10 S5" },
    { size: "90/100", pattern: "s1", label: "90/100-10 S1" },
    { size: "90/90-12", pattern: "s2", label: "90/90-12 S2" },
    { size: "90/90-12", pattern: "s5", label: "90/90-12 S5" },
    { size: "100/80-12", pattern: "", label: "100/80-12" },
    { size: "110/80-12", pattern: "", label: "110/80-12" },
    { size: "110/70-12", pattern: "", label: "110/70-12 EV" },
    { size: "110/90-10", pattern: "", label: "110/90-10 Scooty" },
    { size: "3.50-10", pattern: "s3", label: "3.50-10 S3 TT" },
    { size: "3.50-10", pattern: "s6", label: "3.50-10 S6 TT" },
];

function isBikeProduct(prod, cats = []) {
    if (!prod) return false;
    const catName = (prod.category_name || (typeof prod.category === "string" ? prod.category : "") || "").toLowerCase();
    const mat = (prod.material || "").toLowerCase();
    const rim = (prod.rim_size || "").toLowerCase();

    // Direct category name check
    if (catName.includes("bike") || catName.includes("scooter") || catName.includes("2w") || catName.includes("two") || catName.includes("motorcycle")) {
        return true;
    }

    // Match category ID with categories list
    if (prod.category_id || prod.category) {
        const catObj = cats.find(c => c.id === prod.category_id || c.id === prod.category || c.name === prod.category);
        if (catObj) {
            const cn = (catObj.name || "").toLowerCase();
            if (cn.includes("bike") || cn.includes("scooter") || cn.includes("2w") || cn.includes("two") || cn.includes("motorcycle")) {
                return true;
            }
        }
    }

    // Two-wheeler tyre model names & pattern keywords (Apollo Acti series, commuter bikes, scooters)
    if (
        mat.includes("actigrip") || mat.includes("actizoom") || mat.includes("actizip") ||
        mat.includes("actisteer") || mat.includes("wav") || mat.includes("tramplr") ||
        mat.includes("activa") || mat.includes("splendor") || mat.includes("pulsar") ||
        mat.includes("jupiter") || mat.includes("fz") || mat.includes("access") ||
        mat.includes("dio") || mat.includes("shine") || mat.includes("glamour") ||
        mat.includes("bullet") || mat.includes("classic") || mat.includes("scooter") ||
        mat.includes("motorcycle") || mat.includes("2w") || rim.includes("scooter") ||
        rim.includes("motorcycle") || rim.includes("2w")
    ) {
        return true;
    }

    return false;
}

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [popularProducts, setPopularProducts] = useState([]);
    const [banners, setBanners] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isHoveringBanner, setIsHoveringBanner] = useState(false);
    const navigate = useNavigate();
    const autoPlayRef = useRef(null);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            api.get("/api/categories/list/").then(res => {
                const cats = Array.isArray(res.data) ? res.data : [];
                setCategories(cats);
                return cats;
            }).catch(() => {
                setCategories([]);
                return [];
            }),
            api.get("/api/categories/banner/").then(res => {
                let list = [];
                if (Array.isArray(res.data)) {
                    list = res.data.filter(b => b && b.image);
                } else if (res.data && res.data.image) {
                    list = [res.data];
                }
                setBanners(list);
            }).catch(() => setBanners([])),
            api.get("/api/products/").then(res => {
                const prods = Array.isArray(res.data) ? res.data : (res.data?.results || []);
                return prods;
            }).catch(() => [])
        ]).then(([cats, , prods]) => {
            if (prods && prods.length > 0) {
                // Find the exact popular Bike & Scooty tyres requested
                const matchedPopular = [];
                POPULAR_TYRE_PATTERNS.forEach(({ size, pattern }) => {
                    const match = prods.find(p => {
                        const m = (p.material || "").toLowerCase();
                        const r = (p.rim_size || "").toLowerCase();
                        const sizeNorm = size.toLowerCase().replace(/\//g, "[/\\-\\s]");
                        const re = new RegExp(sizeNorm);
                        const matchesSize = re.test(m) || re.test(r) || m.includes(size.toLowerCase());
                        const matchesPattern = !pattern || m.includes(pattern.toLowerCase());
                        return matchesSize && matchesPattern && !matchedPopular.some(item => item.id === p.id);
                    });
                    if (match) matchedPopular.push(match);
                });

                // Supplement if needed with other bike & scooty products
                if (matchedPopular.length < 10) {
                    const otherBikeProds = prods.filter(p => isBikeProduct(p, cats) && !matchedPopular.some(item => item.id === p.id));
                    matchedPopular.push(...otherBikeProds.slice(0, 10 - matchedPopular.length));
                }

                setPopularProducts(matchedPopular);
            }
        }).finally(() => setLoading(false));
    }, []);

    // Combine uploaded banners with curated fallback slides if needed
    const activeSlides = banners.length > 0
        ? banners.map((b, idx) => ({
            id: b.id || `banner-${idx}`,
            isUploaded: true,
            title: b.title,
            image: getMediaUrl(b.image)
        }))
        : DEFAULT_FALLBACK_SLIDES;

    // Carousel Auto-play timer
    useEffect(() => {
        if (activeSlides.length <= 1 || isHoveringBanner) return;
        autoPlayRef.current = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % activeSlides.length);
        }, 5500);

        return () => {
            if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        };
    }, [activeSlides.length, isHoveringBanner]);

    const handlePrevSlide = (e) => {
        e.stopPropagation();
        setCurrentSlide(prev => (prev === 0 ? activeSlides.length - 1 : prev - 1));
    };

    const handleNextSlide = (e) => {
        e.stopPropagation();
        setCurrentSlide(prev => (prev + 1) % activeSlides.length);
    };

    const handleCategoryClick = (id) => navigate(`/products?category=${id}`);

    const currentBannerItem = activeSlides[currentSlide] || activeSlides[0];

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>

            {/* ── FULL-WIDTH PANORAMIC HERO BANNER SLIDER (FIT TO SITE) ── */}
            <section style={{
                maxWidth: "1400px",
                margin: "24px auto 0 auto",
                padding: "0 clamp(16px, 3vw, 24px)",
                position: "relative"
            }}>
                <div
                    style={{
                        position: "relative",
                        width: "100%",
                        height: "clamp(230px, 32vw, 420px)",
                        borderRadius: "20px",
                        overflow: "hidden",
                        boxShadow: "var(--shadow-lg), 0 10px 30px rgba(0,0,0,0.12)",
                        border: "1px solid var(--border-card)",
                        backgroundColor: "#0b0f19",
                        cursor: "pointer"
                    }}
                    onMouseEnter={() => setIsHoveringBanner(true)}
                    onMouseLeave={() => setIsHoveringBanner(false)}
                    onClick={() => navigate("/products")}
                >
                    {/* Render Uploaded Banner Image or Curated Rich Graphic Slide */}
                    {currentBannerItem?.isUploaded ? (
                        <div style={{ width: "100%", height: "100%", position: "relative" }}>
                            <img
                                src={currentBannerItem.image}
                                alt={currentBannerItem.title || "Apollo Promotional Banner"}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    display: "block",
                                    transition: "transform 0.4s ease"
                                }}
                            />
                            {currentBannerItem.title && (
                                <div style={{
                                    position: "absolute",
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    padding: "24px 30px",
                                    background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 70%, transparent 100%)",
                                    color: "#ffffff"
                                }}>
                                    <h3 style={{ fontSize: "clamp(18px, 2.5vw, 26px)", fontWeight: "800", margin: 0, textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
                                        {currentBannerItem.title}
                                    </h3>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Curated Fallback Slide Graphic */
                        <div style={{
                            width: "100%",
                            height: "100%",
                            background: currentBannerItem.bgGradient,
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "clamp(18px, 4.5vw, 55px) clamp(16px, 5.5vw, 75px)",
                            color: "#ffffff",
                            overflow: "hidden"
                        }} className="banner-hero-content">
                            {/* Background Ambient Glow */}
                            <div style={{
                                position: "absolute",
                                right: "15%",
                                top: "-20%",
                                width: "400px",
                                height: "400px",
                                borderRadius: "50%",
                                background: `radial-gradient(circle, ${currentBannerItem.accent}44 0%, transparent 70%)`,
                                filter: "blur(50px)",
                                pointerEvents: "none"
                            }} />

                            {/* Left Text Block */}
                            <div style={{ maxWidth: "620px", zIndex: 2 }} className="banner-hero-text">
                                <div style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    padding: "5px 12px",
                                    borderRadius: "30px",
                                    backgroundColor: "rgba(255,255,255,0.12)",
                                    backdropFilter: "blur(8px)",
                                    border: `1px solid ${currentBannerItem.accent}66`,
                                    color: currentBannerItem.accent,
                                    fontSize: "clamp(10px, 2.2vw, 12px)",
                                    fontWeight: "800",
                                    letterSpacing: "1.2px",
                                    textTransform: "uppercase",
                                    marginBottom: "12px"
                                }}>
                                    <span style={{ display: "inline-block", width: "7px", height: "7px", borderRadius: "50%", backgroundColor: currentBannerItem.accent }} />
                                    {currentBannerItem.badge}
                                </div>

                                <h2 style={{
                                    fontSize: "clamp(20px, 3.8vw, 44px)",
                                    fontWeight: "900",
                                    lineHeight: 1.15,
                                    marginBottom: "8px",
                                    color: "#ffffff",
                                    textShadow: "0 2px 10px rgba(0,0,0,0.5)"
                                }}>
                                    {currentBannerItem.title}
                                </h2>

                                <p style={{
                                    fontSize: "clamp(12px, 1.6vw, 15px)",
                                    color: "rgba(255, 255, 255, 0.85)",
                                    lineHeight: 1.45,
                                    marginBottom: "18px"
                                }}>
                                    {currentBannerItem.subtitle}
                                </p>

                                <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate("/products");
                                        }}
                                        className="btn-primary"
                                        style={{ padding: "10px 22px", fontSize: "13.5px" }}
                                    >
                                        {currentBannerItem.btnText} <FiArrowRight />
                                    </button>
                                </div>
                            </div>

                            {/* Right Tyre Showcase Graphic */}
                            <div style={{
                                zIndex: 2,
                                display: "flex",
                                position: "relative",
                                width: "clamp(115px, 25vw, 320px)",
                                height: "100%",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0
                            }} className="banner-hero-graphic">
                                <img
                                    src={currentBannerItem.tyreImg}
                                    alt="Apollo Tyre Banner"
                                    style={{
                                        maxHeight: "92%",
                                        maxWidth: "100%",
                                        objectFit: "contain",
                                        filter: "drop-shadow(0 12px 26px rgba(0,0,0,0.7))",
                                        animation: "floatAnim 6s ease-in-out infinite"
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Navigation Arrows (Float Left & Right like the screenshot) */}
                    {activeSlides.length > 1 && (
                        <>
                            <button
                                onClick={handlePrevSlide}
                                aria-label="Previous Slide"
                                className="slide-nav-btn"
                                style={{
                                    position: "absolute",
                                    left: "clamp(8px, 2vw, 18px)",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    width: "42px",
                                    height: "42px",
                                    borderRadius: "50%",
                                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                                    color: "#0f172a",
                                    border: "1px solid rgba(0,0,0,0.1)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
                                    zIndex: 10,
                                    transition: "all 0.2s ease"
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.backgroundColor = "#ffffff";
                                    e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
                                    e.currentTarget.style.transform = "translateY(-50%) scale(1)";
                                }}
                            >
                                <FiChevronLeft size={22} />
                            </button>

                            <button
                                onClick={handleNextSlide}
                                aria-label="Next Slide"
                                className="slide-nav-btn"
                                style={{
                                    position: "absolute",
                                    right: "clamp(8px, 2vw, 18px)",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    width: "42px",
                                    height: "42px",
                                    borderRadius: "50%",
                                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                                    color: "#0f172a",
                                    border: "1px solid rgba(0,0,0,0.1)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
                                    zIndex: 10,
                                    transition: "all 0.2s ease"
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.backgroundColor = "#ffffff";
                                    e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
                                    e.currentTarget.style.transform = "translateY(-50%) scale(1)";
                                }}
                            >
                                <FiChevronRight size={22} />
                            </button>

                            {/* Bottom Slide Indicators */}
                            <div style={{
                                position: "absolute",
                                bottom: "14px",
                                left: "50%",
                                transform: "translateX(-50%)",
                                display: "flex",
                                gap: "8px",
                                zIndex: 10,
                                backgroundColor: "rgba(0,0,0,0.35)",
                                padding: "5px 12px",
                                borderRadius: "20px",
                                backdropFilter: "blur(6px)"
                            }}>
                                {activeSlides.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentSlide(idx);
                                        }}
                                        style={{
                                            width: currentSlide === idx ? "24px" : "8px",
                                            height: "8px",
                                            borderRadius: "4px",
                                            backgroundColor: currentSlide === idx ? "#ffffff" : "rgba(255,255,255,0.4)",
                                            border: "none",
                                            cursor: "pointer",
                                            padding: 0,
                                            transition: "all 0.3s ease"
                                        }}
                                        aria-label={`Go to slide ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* ── TRUST & VALUE PROPOSITION BAR ── */}
            <section style={{
                maxWidth: "1400px",
                margin: "24px auto 0 auto",
                padding: "0 clamp(16px, 3vw, 24px)"
            }}>
                <div style={{
                    backgroundColor: "var(--bg-secondary)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "16px",
                    padding: "18px 24px",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "20px"
                }}>
                    {[
                        { icon: <FiShield style={{ color: "var(--accent-primary)", fontSize: "24px" }} />, title: "100% Genuine Tyres", desc: "Factory original Apollo products" },
                        { icon: <GiCarWheel style={{ color: "#3b82f6", fontSize: "26px" }} />, title: "Complete Range", desc: "567+ active tyre specifications" },
                        { icon: <FiTruck style={{ color: "#10b981", fontSize: "24px" }} />, title: "Rapid Fulfillment", desc: "Swift delivery & same-day dispatch" },
                        { icon: <FiHeadphones style={{ color: "#ec4899", fontSize: "24px" }} />, title: "Expert Tyre Advice", desc: "Technical guidance on WhatsApp" },
                    ].map((item, idx) => (
                        <div key={idx} style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "14px",
                            padding: "6px"
                        }}>
                            <div style={{
                                width: "44px",
                                height: "44px",
                                borderRadius: "12px",
                                backgroundColor: "var(--bg-glass)",
                                border: "1px solid var(--border-color)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0
                            }}>
                                {item.icon}
                            </div>
                            <div>
                                <h4 style={{ fontSize: "14px", fontWeight: "700", margin: 0, color: "var(--text-primary)" }}>{item.title}</h4>
                                <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "2px 0 0 0" }}>{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── MAIN CONTENT AREA ── */}
            <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "40px clamp(16px, 3vw, 24px)" }}>

                {/* ── SECTION: SHOP BY CATEGORY (5 CARDS IN 1 ROW ON DESKTOP) ── */}
                <section style={{ marginBottom: "60px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "30px", flexWrap: "wrap", gap: "16px" }}>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--accent-primary)", fontSize: "13px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "8px" }}>
                                <FiZap /> Vehicle Segments
                            </div>
                            <h2 style={{ fontSize: "clamp(26px, 4vw, 36px)", fontWeight: "900", margin: 0 }}>
                                Shop By <span style={{ color: "var(--accent-primary)" }}>Category</span>
                            </h2>
                        </div>
                        <p style={{ color: "var(--text-muted)", fontSize: "15px", margin: 0, maxWidth: "420px", lineHeight: "1.5" }}>
                            Select your vehicle category to explore technical sizes, load ratings, and live prices.
                        </p>
                    </div>

                    <div className="categories-grid-5">
                        {categories.map(cat => (
                            <div
                                key={cat.id}
                                onClick={() => handleCategoryClick(cat.id)}
                                style={{
                                    backgroundColor: "var(--bg-card)",
                                    border: "1px solid var(--border-card)",
                                    borderRadius: "18px",
                                    padding: "26px 16px 22px",
                                    cursor: "pointer",
                                    textAlign: "center",
                                    transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
                                    boxShadow: "var(--shadow-sm)",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    position: "relative",
                                    overflow: "hidden"
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = "var(--accent-primary)";
                                    e.currentTarget.style.transform = "translateY(-4px)";
                                    e.currentTarget.style.boxShadow = "var(--shadow-glow)";
                                    e.currentTarget.style.backgroundColor = "var(--bg-card-hover)";
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = "var(--border-card)";
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                                    e.currentTarget.style.backgroundColor = "var(--bg-card)";
                                }}
                            >
                                {/* Category Icon / Image Circle */}
                                <div style={{
                                    width: "105px",
                                    height: "105px",
                                    borderRadius: "50%",
                                    backgroundColor: "var(--bg-input)",
                                    margin: "0 auto 16px auto",
                                    overflow: "hidden",
                                    border: "2.5px solid var(--border-highlight)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                                    position: "relative"
                                }}>
                                    {cat.image ? (
                                        <img
                                            src={getMediaUrl(cat.image)}
                                            alt={cat.name}
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                                display: "block",
                                                transform: "scale(1.18)",
                                                transition: "transform 0.3s ease"
                                            }}
                                        />
                                    ) : (
                                        <span style={{ fontSize: "44px" }}>{getCategoryIcon(cat.name)}</span>
                                    )}
                                </div>

                                <h3 style={{
                                    fontWeight: "800",
                                    fontSize: "17px",
                                    color: "var(--text-primary)",
                                    marginBottom: "6px",
                                    letterSpacing: "-0.01em"
                                }}>
                                    {cat.name}
                                </h3>

                                <p style={{
                                    fontSize: "12px",
                                    color: "var(--text-muted)",
                                    margin: "0 0 16px 0",
                                    lineHeight: "1.3"
                                }}>
                                    Genuine Apollo Stock
                                </p>

                                <div style={{
                                    marginTop: "auto",
                                    padding: "6px 16px",
                                    borderRadius: "30px",
                                    backgroundColor: "var(--badge-bg)",
                                    border: "1px solid var(--border-highlight)",
                                    color: "var(--accent-primary)",
                                    fontSize: "12px",
                                    fontWeight: "700",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    transition: "all 0.2s ease"
                                }}>
                                    Explore <FiArrowRight size={13} />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── SECTION: POPULAR PRODUCTS ── */}
                {popularProducts.length > 0 && (
                    <section style={{ marginBottom: "65px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--accent-primary)", fontSize: "12px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "6px" }}>
                                    <FiStar /> High Demand Selection
                                </div>
                                <h2 style={{ fontSize: "clamp(24px, 3.5vw, 34px)", fontWeight: "900", margin: 0 }}>
                                    Popular <span style={{ color: "var(--accent-primary)" }}>Tyres</span>
                                </h2>
                            </div>
                            <button
                                onClick={() => navigate("/products")}
                                className="btn-secondary"
                                style={{ padding: "8px 20px", fontSize: "14px" }}
                            >
                                View All 560+ Stock <FiArrowRight />
                            </button>
                        </div>

                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                            gap: "24px"
                        }}>
                            {popularProducts.map(prod => (
                                <div
                                    key={prod.id}
                                    style={{
                                        backgroundColor: "var(--bg-card)",
                                        border: "1px solid var(--border-card)",
                                        borderRadius: "16px",
                                        padding: "18px",
                                        cursor: "pointer",
                                        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                                        boxShadow: "var(--shadow-sm)",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between"
                                    }}
                                    onClick={() => navigate(`/products?category=${prod.category_id}`)}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = "var(--accent-primary)";
                                        e.currentTarget.style.transform = "translateY(-3px)";
                                        e.currentTarget.style.boxShadow = "var(--shadow-md)";
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = "var(--border-card)";
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                                    }}
                                >
                                    <div>
                                        {/* Tyre Image Box */}
                                        <div style={{
                                            backgroundColor: "var(--bg-input)",
                                            borderRadius: "12px",
                                            height: "170px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            marginBottom: "16px",
                                            border: "1px solid var(--border-color)",
                                            overflow: "hidden"
                                        }}>
                                            <img
                                                src={getTyreImageUrl(prod)}
                                                alt={prod.material}
                                                style={{
                                                    width: "85%",
                                                    height: "85%",
                                                    objectFit: "contain",
                                                    filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.3))",
                                                    transition: "transform 0.3s ease"
                                                }}
                                                onError={e => { e.target.src = getDefaultTyreImage(prod); }}
                                            />
                                        </div>

                                        <div style={{
                                            display: "inline-block",
                                            padding: "3px 10px",
                                            borderRadius: "6px",
                                            backgroundColor: "var(--badge-bg)",
                                            color: "var(--accent-primary)",
                                            fontSize: "12px",
                                            fontWeight: "700",
                                            marginBottom: "8px"
                                        }}>
                                            {prod.rim_size || "Standard"}
                                        </div>

                                        <h3 style={{
                                            fontSize: "15px",
                                            color: "var(--text-primary)",
                                            fontWeight: "700",
                                            lineHeight: 1.35,
                                            margin: "0 0 12px 0",
                                        }}>
                                            {prod.material}
                                        </h3>
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/products?category=${prod.category_id}`);
                                        }}
                                        className="btn-primary"
                                        style={{ width: "100%", padding: "10px", fontSize: "14px" }}
                                    >
                                        Order Tyre Now
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── SECTION: DIRECT WHATSAPP SUPPORT CARD ── */}
                <section style={{
                    background: "linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%)",
                    border: "1px solid var(--border-highlight)",
                    borderRadius: "20px",
                    padding: "clamp(30px, 5vw, 50px)",
                    textAlign: "center",
                    boxShadow: "var(--shadow-md)",
                    position: "relative",
                    overflow: "hidden"
                }}>
                    <div style={{ position: "relative", zIndex: 2, maxWidth: "680px", margin: "0 auto" }}>
                        <div style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "56px",
                            height: "56px",
                            borderRadius: "50%",
                            background: "rgba(37, 211, 102, 0.15)",
                            color: "#25D366",
                            fontSize: "28px",
                            marginBottom: "16px"
                        }}>
                            <FaWhatsapp />
                        </div>
                        <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: "900", marginBottom: "12px", color: "var(--text-primary)" }}>
                            Need Custom Sizes or Bulk Tyres?
                        </h2>
                        <p style={{ color: "var(--text-secondary)", fontSize: "16px", lineHeight: "1.6", marginBottom: "28px" }}>
                            Our direct support desk can verify stock availability, bulk commercial discounts, and immediate logistics directly over WhatsApp.
                        </p>
                        <a
                            href="https://wa.me/918848493933"
                            target="_blank"
                            rel="noreferrer"
                            className="btn-whatsapp"
                            style={{ padding: "16px 36px", fontSize: "17px", borderRadius: "30px" }}
                        >
                            <FaWhatsapp size={22} /> Chat with Tyre Expert Now
                        </a>
                    </div>
                </section>
            </main>

            <style>{`
                .banner-hero-graphic {
                    display: flex !important;
                }
                @media (max-width: 768px) {
                    .banner-hero-content {
                        padding: 16px 14px 16px 18px !important;
                        gap: 8px !important;
                    }
                    .banner-hero-text {
                        max-width: 62% !important;
                    }
                    .banner-hero-graphic {
                        width: clamp(95px, 30vw, 150px) !important;
                        height: clamp(95px, 30vw, 150px) !important;
                    }
                }
                @media (max-width: 440px) {
                    .banner-hero-content {
                        padding: 14px 10px 14px 14px !important;
                    }
                    .banner-hero-text {
                        max-width: 60% !important;
                    }
                    .banner-hero-graphic {
                        width: 95px !important;
                        height: 95px !important;
                    }
                }
                .categories-grid-5 {
                    display: grid;
                    grid-template-columns: repeat(5, minmax(0, 1fr));
                    gap: 20px;
                }
                @media (max-width: 1100px) {
                    .categories-grid-5 {
                        grid-template-columns: repeat(3, minmax(0, 1fr));
                        gap: 16px;
                    }
                }
                @media (max-width: 768px) {
                    .categories-grid-5 {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                        gap: 12px;
                    }
                }
                @media (max-width: 360px) {
                    .categories-grid-5 {
                        grid-template-columns: minmax(0, 1fr);
                        gap: 12px;
                    }
                }
                @media (max-width: 640px) {
                    .slide-nav-btn {
                        width: 34px !important;
                        height: 34px !important;
                        font-size: 16px !important;
                    }
                }
            `}</style>
        </div>
    );
}
