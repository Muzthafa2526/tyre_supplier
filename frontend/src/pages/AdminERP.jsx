import React, { useState, useEffect } from "react";
import api, { getMediaUrl } from "../api/axios";
import ThemeToggle from "../components/ThemeToggle";
import AdminCategoryProductManager from "../components/AdminCategoryProductManager";
import {
    FiLock, FiLogOut, FiPackage, FiClock, FiCheckCircle, FiDollarSign,
    FiFileText, FiUploadCloud, FiSearch, FiArrowLeft, FiAlertCircle,
    FiImage, FiTrash2, FiTrendingUp, FiPercent, FiPrinter, FiRefreshCw, FiX,
    FiTag, FiLayers, FiMenu, FiChevronRight, FiChevronLeft,
    FiCheck, FiPlus, FiActivity, FiBox, FiArrowUpRight, FiSliders,
    FiPhone, FiEye, FiBarChart2, FiGrid, FiList
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { GiCarWheel } from "react-icons/gi";
import { useNavigate } from "react-router-dom";

const ADMIN_PASSWORD = "appolo2024";

function AdminERP() {
    const [isLoggedIn, setIsLoggedIn] = useState(() => sessionStorage.getItem("erp_auth") === "true");
    const [passwordInput, setPasswordInput] = useState("");
    const [loginError, setLoginError] = useState("");

    const [activeTab, setActiveTab] = useState("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [metrics, setMetrics] = useState(null);
    const [orders, setOrders] = useState([]);
    const [excelFile, setExcelFile] = useState(null);
    const [uploadMsg, setUploadMsg] = useState("");
    const [uploading, setUploading] = useState(false);
    const [statusFilter, setStatusFilter] = useState("");
    const [searchOrder, setSearchOrder] = useState("");
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [orderActionMsg, setOrderActionMsg] = useState("");

    // Banner management states
    const [currentBanner, setCurrentBanner] = useState(null);
    const [bannerFile, setBannerFile] = useState(null);
    const [bannerTitle, setBannerTitle] = useState("");
    const [bannerUploading, setBannerUploading] = useState(false);
    const [bannerMsg, setBannerMsg] = useState("");

    // Price visibility state (Global Store Control)
    const [showPrices, setShowPrices] = useState(true);
    const [togglingPrice, setTogglingPrice] = useState(false);
    const [priceVisibilityMsg, setPriceVisibilityMsg] = useState("");

    // Profit & Margin analytics state
    const [marginData, setMarginData] = useState(null);
    const [loadingMargins, setLoadingMargins] = useState(false);

    // Bulk price adjuster state
    const [categoriesList, setCategoriesList] = useState([]);
    const [bulkCategory, setBulkCategory] = useState("");
    const [bulkPercentage, setBulkPercentage] = useState("");
    const [bulkTarget, setBulkTarget] = useState("both");
    const [bulkMsg, setBulkMsg] = useState("");
    const [bulkUpdating, setBulkUpdating] = useState(false);

    // Stock management state
    const [inventoryProducts, setInventoryProducts] = useState([]);
    const [searchInventory, setSearchInventory] = useState("");
    const [inventoryStockFilter, setInventoryStockFilter] = useState("all");
    const [loadingInventory, setLoadingInventory] = useState(false);
    const [stockEditMsg, setStockEditMsg] = useState("");

    // GST Invoice Print Modal
    const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

    const navigate = useNavigate();

    // ── AUTO-LOGOUT SECURITY: Auto close / lock session on tab switch or page exit ──
    useEffect(() => {
        const handleSecurityLock = () => {
            if (document.hidden || document.visibilityState === "hidden") {
                sessionStorage.removeItem("erp_auth");
                localStorage.removeItem("erp_auth");
                setIsLoggedIn(false);
                setPasswordInput("");
                setLoginError("🔒 Session auto-locked for security because you switched tabs or minimized the window.");
            }
        };

        const handlePageExit = () => {
            sessionStorage.removeItem("erp_auth");
            localStorage.removeItem("erp_auth");
        };

        document.addEventListener("visibilitychange", handleSecurityLock);
        window.addEventListener("pagehide", handlePageExit);
        window.addEventListener("beforeunload", handlePageExit);

        return () => {
            document.removeEventListener("visibilitychange", handleSecurityLock);
            window.removeEventListener("pagehide", handlePageExit);
            window.removeEventListener("beforeunload", handlePageExit);
        };
    }, []);

    const handleLogin = (e) => {
        e.preventDefault();
        if (passwordInput === ADMIN_PASSWORD) {
            sessionStorage.setItem("erp_auth", "true");
            localStorage.removeItem("erp_auth");
            setIsLoggedIn(true);
            setLoginError("");
        } else {
            setLoginError("Invalid admin security key. Please try again.");
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem("erp_auth");
        localStorage.removeItem("erp_auth");
        setIsLoggedIn(false);
        setPasswordInput("");
    };

    const fetchDashboardData = () => {
        if (!isLoggedIn) return;

        api.get("/api/orders/admin/dashboard/")
            .then(res => setMetrics(res.data))
            .catch(err => console.error("Error fetching metrics:", err));

        api.get("/api/categories/banner/")
            .then(res => setCurrentBanner(Array.isArray(res.data) ? (res.data[0] || null) : res.data))
            .catch(() => { });

        api.get("/api/categories/list/")
            .then(res => setCategoriesList(res.data || []))
            .catch(() => { });

        api.get("/api/products/settings/")
            .then(res => setShowPrices(res.data.show_prices))
            .catch(() => { });
    };

    useEffect(() => {
        fetchDashboardData();
    }, [isLoggedIn]);

    const handleTogglePriceVisibility = () => {
        setTogglingPrice(true);
        const targetState = !showPrices;
        api.post("/api/products/settings/toggle-price-visibility/", { show_prices: targetState })
            .then(res => {
                setShowPrices(res.data.show_prices);
                setPriceVisibilityMsg(res.data.show_prices ? "Customer prices are now VISIBLE across storefront" : "Customer prices are now HIDDEN across storefront");
                setTimeout(() => setPriceVisibilityMsg(""), 4500);
                setTogglingPrice(false);
            })
            .catch(() => {
                setPriceVisibilityMsg("Failed to update price visibility");
                setTogglingPrice(false);
            });
    };

    // Fetch margins when tab is active
    useEffect(() => {
        if (!isLoggedIn || activeTab !== "margins") return;
        setLoadingMargins(true);
        api.get("/api/products/admin/margin-analytics/")
            .then(res => { setMarginData(res.data); setLoadingMargins(false); })
            .catch(() => setLoadingMargins(false));
    }, [isLoggedIn, activeTab]);

    // Fetch orders when tab is active or dashboard
    const fetchOrders = () => {
        if (!isLoggedIn) return;
        setLoadingOrders(true);
        let url = "/api/orders/admin-list/";
        if (statusFilter && activeTab === "orders") url += `?status=${statusFilter}`;
        api.get(url)
            .then(res => { setOrders(res.data || []); setLoadingOrders(false); })
            .catch(err => { console.error("Error fetching orders:", err); setLoadingOrders(false); });
    };

    useEffect(() => {
        fetchOrders();
    }, [isLoggedIn, activeTab, statusFilter]);

    // Fetch inventory when tab is active or dashboard
    const fetchInventory = () => {
        if (!isLoggedIn) return;
        setLoadingInventory(true);
        api.get("/api/products/")
            .then(res => { setInventoryProducts(res.data || []); setLoadingInventory(false); })
            .catch(() => setLoadingInventory(false));
    };

    useEffect(() => {
        fetchInventory();
    }, [isLoggedIn, activeTab]);

    const handleStatusChange = (orderId, newStatus) => {
        api.post(`/api/orders/${orderId}/status/`, { status: newStatus })
            .then(() => {
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
                api.get("/api/orders/admin/dashboard/").then(r => setMetrics(r.data));

                if (newStatus === "COMPLETED") {
                    setOrderActionMsg(`Order #${orderId} marked as COMPLETED. Inventory stock automatically deducted and GST Bill generated.`);
                } else {
                    setOrderActionMsg(`Order #${orderId} status updated to ${newStatus}.`);
                }
                setTimeout(() => setOrderActionMsg(""), 5000);
            })
            .catch(() => alert("Failed to update order status."));
    };

    const handleExcelUpload = (e) => {
        e.preventDefault();
        if (!excelFile) { setUploadMsg("Please select an Excel file first."); return; }
        setUploading(true);
        setUploadMsg("");
        const formData = new FormData();
        formData.append("file", excelFile);
        api.post("/api/products/excel-upload/", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        })
            .then(res => {
                const summaryText = res.data.summary ? Object.entries(res.data.summary).map(([k, v]) => `${k}: ${v}`).join(", ") : "";
                setUploadMsg(`Success! ${res.data.message || "Products updated."} ${summaryText ? "(" + summaryText + ")" : ""}`);
                setExcelFile(null);
                setUploading(false);
                api.get("/api/categories/list/").then(r => setCategoriesList(r.data || []));
            })
            .catch(() => {
                setUploadMsg("Upload failed. Please verify the Excel sheet columns and structure.");
                setUploading(false);
            });
    };

    const handleBannerUpload = (e) => {
        e.preventDefault();
        if (!bannerFile) { setBannerMsg("Please select a banner image first."); return; }
        setBannerUploading(true);
        setBannerMsg("");
        const formData = new FormData();
        formData.append("image", bannerFile);
        if (bannerTitle) formData.append("title", bannerTitle);

        api.post("/api/categories/banner/upload/", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        })
            .then(res => {
                setCurrentBanner(res.data);
                setBannerMsg("Hero Banner published successfully and is now live.");
                setBannerFile(null);
                setBannerTitle("");
                setBannerUploading(false);
            })
            .catch(() => {
                setBannerMsg("Failed to upload banner.");
                setBannerUploading(false);
            });
    };

    const handleBannerDelete = () => {
        if (!window.confirm("Remove active hero banner?")) return;
        api.post("/api/categories/banner/delete/")
            .then(() => {
                setCurrentBanner(null);
                setBannerMsg("Hero Banner removed.");
            })
            .catch(() => setBannerMsg("Failed to delete banner."));
    };

    const handleBulkPriceSubmit = (e) => {
        e.preventDefault();
        if (!bulkPercentage) return;
        setBulkUpdating(true);
        setBulkMsg("");

        api.post("/api/products/batch-price-update/", {
            category_id: bulkCategory || null,
            percentage: parseFloat(bulkPercentage),
            target: bulkTarget
        })
            .then(res => {
                setBulkMsg(res.data.message || "Price adjustment completed.");
                setBulkPercentage("");
                setBulkUpdating(false);
            })
            .catch(() => {
                setBulkMsg("Failed to apply batch price update.");
                setBulkUpdating(false);
            });
    };

    const handleStockChange = (productId, newQuantity) => {
        const qty = parseInt(newQuantity, 10);
        if (isNaN(qty) || qty < 0) return;

        api.post(`/api/products/${productId}/stock/`, { stock_quantity: qty })
            .then(() => {
                setInventoryProducts(prev => prev.map(p => p.id === productId ? { ...p, stock_quantity: qty } : p));
                setStockEditMsg(`Stock updated for product #${productId}`);
                setTimeout(() => setStockEditMsg(""), 3000);
            })
            .catch(() => alert("Failed to update stock quantity."));
    };

    const filteredOrders = orders.filter(o => {
        const q = searchOrder.toLowerCase();
        if (!q) return true;
        return (
            (o.customer_name || "").toLowerCase().includes(q) ||
            (o.customer_phone || "").toLowerCase().includes(q) ||
            String(o.id).includes(q)
        );
    });

    const filteredInventory = inventoryProducts.filter(p => {
        const q = searchInventory.toLowerCase();
        const matchesSearch = !q || (
            (p.material || "").toLowerCase().includes(q) ||
            (p.material_code || "").toLowerCase().includes(q) ||
            (p.rim_size || "").toLowerCase().includes(q) ||
            (p.category || "").toLowerCase().includes(q)
        );

        if (!matchesSearch) return false;

        const stock = p.stock_quantity || 0;
        if (inventoryStockFilter === "low") return stock <= 15 && stock > 0;
        if (inventoryStockFilter === "out") return stock === 0;
        if (inventoryStockFilter === "healthy") return stock > 15;
        return true;
    });

    const lowStockItems = inventoryProducts.filter(p => (p.stock_quantity || 0) <= 15);

    const statusBadge = (s) => {
        if (s === "CONFIRMED") return { bg: "rgba(16, 185, 129, 0.15)", text: "#10b981", label: "Confirmed" };
        if (s === "PENDING") return { bg: "rgba(245, 158, 11, 0.15)", text: "#f59e0b", label: "Pending" };
        if (s === "CANCELLED") return { bg: "rgba(239, 68, 68, 0.15)", text: "#ef4444", label: "Cancelled" };
        if (s === "COMPLETED") return { bg: "rgba(59, 130, 246, 0.15)", text: "#3b82f6", label: "Completed" };
        return { bg: "var(--badge-bg)", text: "var(--text-secondary)", label: s };
    };

    // Login Screen
    if (!isLoggedIn) {
        return (
            <div style={{
                minHeight: "100vh",
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px"
            }}>
                <div style={{ position: "absolute", top: "20px", right: "20px" }}>
                    <ThemeToggle showLabel={true} />
                </div>

                <div style={{
                    backgroundColor: "var(--bg-card)",
                    backdropFilter: "blur(16px)",
                    border: "1px solid var(--border-card)",
                    padding: "42px 34px",
                    borderRadius: "22px",
                    width: "100%",
                    maxWidth: "420px",
                    boxShadow: "var(--shadow-lg)",
                    textAlign: "center"
                }} className="animate-fade-in">
                    <div style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "18px",
                        background: "var(--accent-gradient)",
                        color: "#000",
                        fontSize: "30px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 20px auto",
                        boxShadow: "var(--shadow-glow)"
                    }}>
                        <FiLock />
                    </div>

                    <h2 style={{ fontSize: "24px", fontWeight: "900", margin: "0 0 6px 0", letterSpacing: "-0.5px" }}>
                        Admin ERP Console
                    </h2>
                    <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "28px" }}>
                        Apollo Tyres Central Inventory & Billing Hub
                    </p>

                    <form onSubmit={handleLogin}>
                        <div style={{ marginBottom: "16px" }}>
                            <input
                                type="password"
                                placeholder="Enter Security Key"
                                value={passwordInput}
                                onChange={e => setPasswordInput(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "14px 16px",
                                    borderRadius: "12px",
                                    border: "1px solid var(--border-color)",
                                    backgroundColor: "var(--bg-input)",
                                    color: "var(--text-primary)",
                                    fontSize: "14px",
                                    outline: "none"
                                }}
                            />
                        </div>

                        {loginError && (
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                color: "var(--danger)",
                                fontSize: "13px",
                                marginBottom: "16px",
                                justifyContent: "center"
                            }}>
                                <FiAlertCircle /> {loginError}
                            </div>
                        )}

                        <button type="submit" className="btn-primary" style={{ width: "100%", padding: "14px", fontSize: "15px", borderRadius: "12px" }}>
                            Authenticate & Enter
                        </button>
                    </form>

                    <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border-color)" }}>
                        <button
                            onClick={() => navigate("/categories")}
                            style={{
                                background: "none",
                                border: "none",
                                color: "var(--text-muted)",
                                fontSize: "13px",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px"
                            }}
                        >
                            <FiArrowLeft /> Return to Customer Storefront
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const currentBannerUrl = currentBanner?.image
        ? getMediaUrl(currentBanner.image)
        : null;

    const NAV_SECTIONS = [
        {
            title: "Operations",
            items: [
                { id: "dashboard", label: "Dashboard Hub", icon: <FiActivity /> },
                { id: "orders", label: "Orders & GST Billing", icon: <FiFileText />, badge: metrics?.pending_orders > 0 ? metrics.pending_orders : null }
            ]
        },
        {
            title: "Catalogue & Inventory",
            items: [
                { id: "categorymgr", label: "Categories & Tyres", icon: <FiLayers /> },
                { id: "inventory", label: "Warehouse Stock", icon: <FiBox />, badge: lowStockItems.length > 0 ? lowStockItems.length : null },
                { id: "excel", label: "Excel Master Sync", icon: <FiUploadCloud /> }
            ]
        },
        {
            title: "Pricing & Margins",
            items: [
                { id: "margins", label: "Profit & Margins", icon: <FiTrendingUp /> },
                { id: "bulkprice", label: "Bulk Price Adjuster", icon: <FiPercent /> },
                { id: "banner", label: "Storefront Banner", icon: <FiImage /> }
            ]
        }
    ];

    const allNavItems = NAV_SECTIONS.flatMap(s => s.items);
    const currentModule = allNavItems.find(n => n.id === activeTab) || allNavItems[0];

    return (
        <div className="erp-container">

            {/* Mobile Slide-Out Backdrop */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        position: "fixed",
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.65)",
                        backdropFilter: "blur(4px)",
                        WebkitBackdropFilter: "blur(4px)",
                        zIndex: 1150,
                        transition: "all 0.25s ease"
                    }}
                />
            )}

            {/* ── SLIDE-OUT EXECUTIVE DRAWER SIDEBAR ── */}
            <aside className={`erp-sidebar-drawer ${sidebarOpen ? 'open' : ''}`}>
                <div>
                    {/* Brand Header */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "26px", padding: "0 6px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "12px",
                                background: "var(--accent-gradient)",
                                color: "#000",
                                fontSize: "22px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "var(--shadow-glow)"
                            }}>
                                <GiCarWheel />
                            </div>
                            <div>
                                <div style={{ fontSize: "18px", fontWeight: "900", fontFamily: "'Outfit', sans-serif", letterSpacing: "0.5px" }}>
                                    APPOLO <span style={{ color: "var(--accent-primary)" }}>ERP</span>
                                </div>
                                <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px" }}>
                                    Enterprise Console
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => setSidebarOpen(false)}
                            title="Close Menu"
                            style={{
                                background: "var(--bg-glass)",
                                border: "1px solid var(--border-color)",
                                borderRadius: "8px",
                                color: "var(--text-secondary)",
                                width: "32px",
                                height: "32px",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "18px",
                                cursor: "pointer"
                            }}
                        >
                            <FiX />
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <nav style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                        {NAV_SECTIONS.map((sec, idx) => (
                            <div key={idx}>
                                <div style={{
                                    fontSize: "10.5px",
                                    fontWeight: "800",
                                    textTransform: "uppercase",
                                    color: "var(--text-muted)",
                                    letterSpacing: "1.2px",
                                    margin: "0 0 6px 8px"
                                }}>
                                    {sec.title}
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                                    {sec.items.map(item => {
                                        const active = activeTab === item.id;
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => {
                                                    setActiveTab(item.id);
                                                    setSidebarOpen(false);
                                                }}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    width: "100%",
                                                    padding: "10px 12px",
                                                    borderRadius: "10px",
                                                    border: active ? "1px solid var(--border-highlight)" : "1px solid transparent",
                                                    backgroundColor: active ? "var(--badge-bg)" : "transparent",
                                                    color: active ? "var(--accent-primary)" : "var(--text-secondary)",
                                                    fontWeight: active ? "800" : "600",
                                                    fontSize: "13px",
                                                    cursor: "pointer",
                                                    textAlign: "left",
                                                    transition: "all 0.2s ease"
                                                }}
                                                onMouseEnter={e => {
                                                    if (!active) {
                                                        e.currentTarget.style.backgroundColor = "var(--bg-glass)";
                                                        e.currentTarget.style.color = "var(--text-primary)";
                                                    }
                                                }}
                                                onMouseLeave={e => {
                                                    if (!active) {
                                                        e.currentTarget.style.backgroundColor = "transparent";
                                                        e.currentTarget.style.color = "var(--text-secondary)";
                                                    }
                                                }}
                                            >
                                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                    <span style={{ fontSize: "16px" }}>{item.icon}</span>
                                                    <span>{item.label}</span>
                                                </div>
                                                {item.badge && (
                                                    <span style={{
                                                        backgroundColor: item.id === "inventory" ? "#f59e0b" : "#ef4444",
                                                        color: "#fff",
                                                        fontSize: "10.5px",
                                                        fontWeight: "800",
                                                        padding: "2px 6px",
                                                        borderRadius: "8px"
                                                    }}>
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>
                    {/* Customer Price Visibility Control in Sidebar */}
                    <div style={{
                        marginTop: "20px",
                        padding: "14px",
                        borderRadius: "12px",
                        backgroundColor: "var(--bg-card)",
                        border: "1px solid var(--border-color)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px"
                    }}>
                        <div style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>
                            Storefront Prices
                        </div>
                        <button
                            onClick={handleTogglePriceVisibility}
                            disabled={togglingPrice}
                            title="Click to toggle customer price visibility on website"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                width: "100%",
                                padding: "10px 12px",
                                borderRadius: "8px",
                                border: showPrices ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid rgba(239, 68, 68, 0.4)",
                                backgroundColor: showPrices ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
                                color: showPrices ? "#10b981" : "#ef4444",
                                fontSize: "13px",
                                fontWeight: "800",
                                cursor: "pointer",
                                transition: "all 0.2s ease"
                            }}
                        >
                            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <FiTag size={15} />
                                {showPrices ? "Prices: Visible" : "Prices: Hidden"}
                            </span>
                            <span style={{
                                fontSize: "11px",
                                padding: "2px 7px",
                                borderRadius: "4px",
                                backgroundColor: showPrices ? "#10b981" : "#ef4444",
                                color: "#fff"
                            }}>
                                {showPrices ? "ON" : "OFF"}
                            </span>
                        </button>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: "1.3" }}>
                            {showPrices ? "Customers see selling prices on website." : "Prices are hidden from customers."}
                        </span>
                    </div>
                </div>
            </aside>

            {/* ── MAIN ERP APP WORKSPACE ── */}
            <div className="erp-main-wrapper">

                {/* Top Executive Header */}
                <header className="erp-topbar">
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <button
                            onClick={() => setSidebarOpen(true)}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "8px 14px",
                                borderRadius: "8px",
                                border: "1px solid var(--border-highlight)",
                                background: "var(--accent-gradient)",
                                color: "#000",
                                fontSize: "13px",
                                fontWeight: "800",
                                cursor: "pointer"
                            }}
                            className="erp-menu-btn"
                        >
                            <FiMenu size={16} />
                            <span>Menu</span>
                        </button>

                        <div>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "5px" }}>
                                <span>Apollo ERP</span> <FiChevronRight size={11} /> <strong style={{ color: "var(--accent-primary)" }}>{currentModule.label}</strong>
                            </div>
                            <h2 style={{ fontSize: "17px", fontWeight: "900", margin: "2px 0 0 0", color: "var(--text-primary)" }}>
                                {currentModule.label}
                            </h2>
                        </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }} className="erp-topbar-actions">
                        {/* Store Prices Visibility Control in Topbar */}
                        <button
                            onClick={handleTogglePriceVisibility}
                            disabled={togglingPrice}
                            title="Toggle customer price visibility on storefront"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "7px 12px",
                                borderRadius: "8px",
                                border: showPrices ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid rgba(239, 68, 68, 0.4)",
                                backgroundColor: showPrices ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
                                color: showPrices ? "#10b981" : "#ef4444",
                                fontSize: "12px",
                                fontWeight: "800",
                                cursor: "pointer"
                            }}
                        >
                            <FiTag size={14} />
                            <span className="erp-btn-label">Prices: {showPrices ? "ON" : "OFF"}</span>
                        </button>

                        <button
                            onClick={() => navigate("/categories")}
                            className="btn-secondary"
                            style={{ padding: "6px 10px", fontSize: "12px", gap: "5px" }}
                        >
                            <FiArrowLeft size={13} /> <span className="erp-btn-label">Storefront</span>
                        </button>

                        <ThemeToggle showLabel={false} />

                        <button
                            onClick={handleLogout}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                padding: "6px 10px",
                                borderRadius: "8px",
                                border: "none",
                                backgroundColor: "rgba(239, 68, 68, 0.15)",
                                color: "var(--danger)",
                                fontWeight: "700",
                                fontSize: "12px",
                                cursor: "pointer"
                            }}
                            title="Log Out"
                        >
                            <FiLogOut size={13} />
                        </button>
                    </div>
                </header>

                {/* Mobile Tab Pills Bar (Easy 1-tap switching on Mobile) */}
                <div className="erp-mobile-tab-bar">
                    {allNavItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`erp-mobile-tab-btn ${activeTab === item.id ? 'active' : ''}`}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                            {item.badge && (
                                <span style={{
                                    backgroundColor: item.id === "inventory" ? "#f59e0b" : "#ef4444",
                                    color: "#fff",
                                    fontSize: "10px",
                                    padding: "1px 5px",
                                    borderRadius: "6px",
                                    marginLeft: "2px"
                                }}>
                                    {item.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Module View Renderer */}
                <div className="erp-content-area">

                    {/* Feedback Alerts */}
                    {priceVisibilityMsg && (
                        <div style={{
                            marginBottom: "18px",
                            padding: "12px 18px",
                            borderRadius: "12px",
                            backgroundColor: showPrices ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                            border: showPrices ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid rgba(239, 68, 68, 0.4)",
                            color: showPrices ? "#10b981" : "#ef4444",
                            fontSize: "13.5px",
                            fontWeight: "700",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                        }} className="animate-fade-in">
                            <FiCheckCircle size={17} />
                            <span>{priceVisibilityMsg}</span>
                        </div>
                    )}

                    {orderActionMsg && (
                        <div style={{
                            marginBottom: "18px",
                            padding: "12px 18px",
                            borderRadius: "12px",
                            backgroundColor: "rgba(16, 185, 129, 0.15)",
                            border: "1px solid #10b981",
                            color: "#10b981",
                            fontSize: "13.5px",
                            fontWeight: "700",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                        }} className="animate-fade-in">
                            <FiCheckCircle size={17} />
                            <span>{orderActionMsg}</span>
                        </div>
                    )}

                    {/* ── TAB: CATEGORIES & TYRES MANAGER ── */}
                    {activeTab === "categorymgr" && (
                        <AdminCategoryProductManager onProductUpdated={fetchDashboardData} />
                    )}

                    {/* ── TAB 1: EXECUTIVE DASHBOARD HUB ── */}
                    {activeTab === "dashboard" && (
                        <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

                            {/* Welcome Banner */}
                            <div style={{
                                background: "var(--accent-gradient)",
                                borderRadius: "18px",
                                padding: "clamp(20px, 4vw, 30px)",
                                color: "#000",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                flexWrap: "wrap",
                                gap: "16px",
                                boxShadow: "var(--shadow-glow)"
                            }}>
                                <div>
                                    <div style={{ fontSize: "12px", fontWeight: "900", letterSpacing: "1.5px", textTransform: "uppercase", opacity: 0.85, marginBottom: "4px" }}>
                                        CENTRAL DISTRIBUTION CONTROL
                                    </div>
                                    <h1 style={{ fontSize: "clamp(20px, 3.5vw, 28px)", fontWeight: "900", margin: "0 0 6px 0", letterSpacing: "-0.5px", color: "#000" }}>
                                        Apollo Tyres ERP Console
                                    </h1>
                                    <p style={{ margin: 0, fontSize: "13.5px", fontWeight: "600", opacity: 0.9 }}>
                                        Live inventory synchronization, profit margin intelligence, and GST invoice dispatch.
                                    </p>
                                </div>
                            </div>

                            {/* Primary KPI Grid */}
                            <div className="stats-grid-responsive">
                                {[
                                    {
                                        label: "Gross Sales Fulfilled",
                                        value: `₹${Number(metrics?.total_sales_amount || 0).toLocaleString("en-IN")}`,
                                        sub: "Total order value fulfilled",
                                        color: "var(--accent-primary)",
                                        icon: <FiDollarSign />,
                                        tab: "orders"
                                    },
                                    {
                                        label: "Total Orders Processed",
                                        value: metrics?.total_orders || 0,
                                        sub: `${metrics?.completed_orders || 0} completed • ${metrics?.confirmed_orders || 0} active`,
                                        color: "#3b82f6",
                                        icon: <FiPackage />,
                                        tab: "orders"
                                    },
                                    {
                                        label: "Pending Acceptance",
                                        value: metrics?.pending_orders || 0,
                                        sub: "Awaiting administrator action",
                                        color: "#f59e0b",
                                        icon: <FiClock />,
                                        tab: "orders"
                                    },
                                    {
                                        label: "Total Tyres Dispatched",
                                        value: metrics?.total_tyres_sold || 0,
                                        sub: "Units delivered / sold",
                                        color: "#10b981",
                                        icon: <GiCarWheel />,
                                        tab: "inventory"
                                    }
                                ].map((kpi, i) => (
                                    <div
                                        key={i}
                                        onClick={() => setActiveTab(kpi.tab)}
                                        className="erp-card"
                                        style={{
                                            borderLeft: `4px solid ${kpi.color}`,
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "space-between",
                                            cursor: "pointer"
                                        }}
                                    >
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                                            <span style={{ fontSize: "12.5px", fontWeight: "700", color: "var(--text-muted)" }}>
                                                {kpi.label}
                                            </span>
                                            <div style={{
                                                width: "34px",
                                                height: "34px",
                                                borderRadius: "10px",
                                                backgroundColor: "var(--bg-glass)",
                                                color: kpi.color,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: "17px"
                                            }}>
                                                {kpi.icon}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: "24px", fontWeight: "900", color: kpi.color, letterSpacing: "-0.5px" }}>
                                                {kpi.value}
                                            </div>
                                            <div style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "4px" }}>
                                                {kpi.sub}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Dual Panel: Recent Orders & Stock Watchlist */}
                            <div className="dual-panel-grid">

                                {/* Recent Orders Box */}
                                <div className="erp-card">
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                                        <div>
                                            <h3 style={{ fontSize: "16px", fontWeight: "800", margin: 0 }}>Recent Orders</h3>
                                            <p style={{ color: "var(--text-muted)", fontSize: "12px", margin: "2px 0 0 0" }}>Live customer checkout pipeline</p>
                                        </div>
                                        <button
                                            onClick={() => setActiveTab("orders")}
                                            className="btn-secondary"
                                            style={{ padding: "5px 10px", fontSize: "12px", gap: "4px" }}
                                        >
                                            View All <FiArrowUpRight />
                                        </button>
                                    </div>

                                    {orders.length === 0 ? (
                                        <div style={{ padding: "28px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                                            No recent orders found.
                                        </div>
                                    ) : (
                                        <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                                            {orders.slice(0, 5).map(o => {
                                                const badge = statusBadge(o.status);
                                                return (
                                                    <div
                                                        key={o.id}
                                                        style={{
                                                            padding: "11px 13px",
                                                            borderRadius: "10px",
                                                            backgroundColor: "var(--bg-input)",
                                                            border: "1px solid var(--border-color)",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "space-between",
                                                            gap: "10px"
                                                        }}
                                                    >
                                                        <div>
                                                            <div style={{ fontWeight: "700", fontSize: "13.5px" }}>
                                                                {o.customer_name} <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>#{o.id}</span>
                                                            </div>
                                                            <div style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "2px" }}>
                                                                {o.items?.length || 0} items • ₹{Number(o.total_amount || 0).toLocaleString("en-IN")}
                                                            </div>
                                                        </div>

                                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                            <span style={{
                                                                padding: "3px 8px",
                                                                borderRadius: "6px",
                                                                backgroundColor: badge.bg,
                                                                color: badge.text,
                                                                fontSize: "11px",
                                                                fontWeight: "700"
                                                            }}>
                                                                {badge.label}
                                                            </span>
                                                            {o.status === "COMPLETED" && (
                                                                <button
                                                                    onClick={() => setSelectedInvoiceOrder(o)}
                                                                    style={{
                                                                        padding: "4px 8px",
                                                                        borderRadius: "6px",
                                                                        backgroundColor: "#10b981",
                                                                        color: "#fff",
                                                                        fontSize: "11px",
                                                                        fontWeight: "700",
                                                                        border: "none",
                                                                        cursor: "pointer"
                                                                    }}
                                                                >
                                                                    GST Bill
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Low Stock Watchlist */}
                                <div className="erp-card">
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                                        <div>
                                            <h3 style={{ fontSize: "16px", fontWeight: "800", margin: 0 }}>Warehouse Stock Alerts</h3>
                                            <p style={{ color: "var(--text-muted)", fontSize: "12px", margin: "2px 0 0 0" }}>Tyres with low inventory levels (≤ 15 units)</p>
                                        </div>
                                        <button
                                            onClick={() => setActiveTab("inventory")}
                                            className="btn-secondary"
                                            style={{ padding: "5px 10px", fontSize: "12px", gap: "4px" }}
                                        >
                                            Manage Stock <FiArrowUpRight />
                                        </button>
                                    </div>

                                    {lowStockItems.length === 0 ? (
                                        <div style={{ padding: "28px", textAlign: "center", color: "#10b981", fontSize: "13px", fontWeight: "700" }}>
                                            All product stock levels are healthy (&gt; 15 units).
                                        </div>
                                    ) : (
                                        <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                                            {lowStockItems.slice(0, 5).map(prod => (
                                                <div
                                                    key={prod.id}
                                                    style={{
                                                        padding: "11px 13px",
                                                        borderRadius: "10px",
                                                        backgroundColor: "var(--bg-input)",
                                                        border: "1px solid var(--border-color)",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "space-between",
                                                        gap: "10px"
                                                    }}
                                                >
                                                    <div>
                                                        <div style={{ fontWeight: "700", fontSize: "13px" }}>
                                                            {prod.material}
                                                        </div>
                                                        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                                                            Rim {prod.rim_size || "-"} • {prod.category}
                                                        </div>
                                                    </div>

                                                    <span style={{
                                                        padding: "3px 8px",
                                                        borderRadius: "6px",
                                                        backgroundColor: "rgba(239, 68, 68, 0.15)",
                                                        color: "#ef4444",
                                                        fontSize: "11.5px",
                                                        fontWeight: "800"
                                                    }}>
                                                        {prod.stock_quantity || 0} units left
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                            </div>

                            {/* Quick Action Shortcuts Grid */}
                            <div className="erp-card" style={{ padding: "22px 24px" }}>
                                <h3 style={{ fontSize: "16px", fontWeight: "800", margin: "0 0 14px 0" }}>
                                    Quick Management Shortcuts
                                </h3>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                                    {[
                                        { label: "Tyre Catalogue Manager", icon: <FiLayers />, tab: "categorymgr" },
                                        { label: "Warehouse Stock", icon: <FiBox />, tab: "inventory" },
                                        { label: "Adjust Bulk Prices", icon: <FiPercent />, tab: "bulkprice" },
                                        { label: "Import Master Excel", icon: <FiUploadCloud />, tab: "excel" },
                                        { label: "Profit & Margins Yield", icon: <FiTrendingUp />, tab: "margins" },
                                        { label: "Storefront Hero Banner", icon: <FiImage />, tab: "banner" }
                                    ].map((action, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveTab(action.tab)}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "10px",
                                                padding: "13px 15px",
                                                borderRadius: "12px",
                                                border: "1px solid var(--border-color)",
                                                backgroundColor: "var(--bg-input)",
                                                color: "var(--text-primary)",
                                                fontSize: "12.5px",
                                                fontWeight: "700",
                                                cursor: "pointer",
                                                transition: "all 0.2s ease"
                                            }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.borderColor = "var(--accent-primary)";
                                                e.currentTarget.style.color = "var(--accent-primary)";
                                                e.currentTarget.style.transform = "translateY(-2px)";
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.borderColor = "var(--border-color)";
                                                e.currentTarget.style.color = "var(--text-primary)";
                                                e.currentTarget.style.transform = "translateY(0)";
                                            }}
                                        >
                                            <span style={{ fontSize: "16px", color: "var(--accent-primary)" }}>{action.icon}</span>
                                            <span>{action.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                        </div>
                    )}

                    {/* ── TAB 2: CUSTOMER ORDERS & GST BILLING ── */}
                    {activeTab === "orders" && (
                        <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                                <div>
                                    <h2 style={{ fontSize: "20px", fontWeight: "900", margin: "0 0 4px 0" }}>
                                        Customer Orders & GST Tax Billing
                                    </h2>
                                    <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: 0 }}>
                                        Changing status to <strong>Completed</strong> automatically deducts stock in inventory and unlocks the official GST Tax Bill.
                                    </p>
                                </div>
                                <button
                                    onClick={fetchOrders}
                                    className="btn-secondary"
                                    style={{ padding: "8px 14px", fontSize: "12.5px", gap: "6px" }}
                                >
                                    <FiRefreshCw className={loadingOrders ? "spin-icon" : ""} size={13} /> Refresh Orders
                                </button>
                            </div>

                            {/* Search & Status Filter Bar */}
                            <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                flexWrap: "wrap",
                                gap: "12px"
                            }}>
                                <div style={{ position: "relative", width: "320px", maxWidth: "100%" }}>
                                    <FiSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                                    <input
                                        type="text"
                                        placeholder="Search customer, phone or Order ID..."
                                        value={searchOrder}
                                        onChange={e => setSearchOrder(e.target.value)}
                                        style={{
                                            width: "100%",
                                            padding: "10px 14px 10px 36px",
                                            borderRadius: "10px",
                                            border: "1px solid var(--border-color)",
                                            backgroundColor: "var(--bg-input)",
                                            color: "var(--text-primary)",
                                            fontSize: "13px",
                                            outline: "none"
                                        }}
                                    />
                                </div>

                                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                    {[
                                        { id: "", label: "All" },
                                        { id: "PENDING", label: "Pending" },
                                        { id: "CONFIRMED", label: "Confirmed" },
                                        { id: "COMPLETED", label: "Completed" },
                                        { id: "CANCELLED", label: "Cancelled" }
                                    ].map(st => (
                                        <button
                                            key={st.id}
                                            onClick={() => setStatusFilter(st.id)}
                                            style={{
                                                padding: "7px 12px",
                                                borderRadius: "8px",
                                                fontSize: "12px",
                                                fontWeight: "700",
                                                border: statusFilter === st.id ? "1px solid var(--accent-primary)" : "1px solid var(--border-color)",
                                                backgroundColor: statusFilter === st.id ? "var(--badge-bg)" : "var(--bg-input)",
                                                color: statusFilter === st.id ? "var(--accent-primary)" : "var(--text-secondary)",
                                                cursor: "pointer"
                                            }}
                                        >
                                            {st.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {loadingOrders ? (
                                <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>Loading orders...</div>
                            ) : (
                                <div className="erp-table-container">
                                    <table className="erp-table" style={{ minWidth: "850px" }}>
                                        <thead>
                                            <tr>
                                                {["ID", "Customer", "Contact", "Ordered Tyres", "Amount", "Current Status", "Update Status", "GST Bill"].map(h => (
                                                    <th key={h}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredOrders.length === 0 ? (
                                                <tr>
                                                    <td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                                                        No orders found matching the filter criteria.
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredOrders.map(order => {
                                                    const badge = statusBadge(order.status);
                                                    const isCompleted = order.status === "COMPLETED";

                                                    return (
                                                        <tr key={order.id}>
                                                            <td style={{ fontWeight: "700", color: "var(--accent-primary)" }}>#{order.id}</td>
                                                            <td style={{ fontWeight: "600" }}>{order.customer_name}</td>
                                                            <td>
                                                                <a
                                                                    href={`https://wa.me/91${order.customer_phone}`}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    style={{ display: "inline-flex", alignItems: "center", gap: "5px", color: "#25D366", textDecoration: "none", fontWeight: "600", fontSize: "13px" }}
                                                                >
                                                                    <FaWhatsapp /> {order.customer_phone}
                                                                </a>
                                                            </td>
                                                            <td style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>
                                                                {order.items && order.items.map((item, i) => (
                                                                    <div key={i} style={{ lineHeight: "1.4" }}>
                                                                        • {item.product_name} <strong>x{item.quantity}</strong>
                                                                    </div>
                                                                ))}
                                                            </td>
                                                            <td style={{ fontWeight: "800", color: "var(--text-primary)" }}>
                                                                ₹{Number(order.total_amount || 0).toLocaleString("en-IN")}
                                                            </td>
                                                            <td>
                                                                <span style={{
                                                                    padding: "3px 9px",
                                                                    borderRadius: "16px",
                                                                    backgroundColor: badge.bg,
                                                                    color: badge.text,
                                                                    fontSize: "11.5px",
                                                                    fontWeight: "700",
                                                                    display: "inline-block"
                                                                }}>
                                                                    {badge.label}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <select
                                                                    value={order.status}
                                                                    onChange={e => handleStatusChange(order.id, e.target.value)}
                                                                    style={{
                                                                        padding: "6px 10px",
                                                                        borderRadius: "6px",
                                                                        border: "1px solid var(--border-color)",
                                                                        backgroundColor: "var(--bg-input)",
                                                                        color: "var(--text-primary)",
                                                                        fontSize: "12.5px",
                                                                        cursor: "pointer",
                                                                        outline: "none"
                                                                    }}
                                                                >
                                                                    <option value="PENDING">Pending</option>
                                                                    <option value="CONFIRMED">Confirmed</option>
                                                                    <option value="COMPLETED">Completed (Deduct Stock & Bill)</option>
                                                                    <option value="CANCELLED">Cancelled</option>
                                                                </select>
                                                            </td>
                                                            <td>
                                                                {isCompleted ? (
                                                                    <button
                                                                        onClick={() => setSelectedInvoiceOrder(order)}
                                                                        className="btn-primary"
                                                                        style={{
                                                                            padding: "5px 12px",
                                                                            fontSize: "11.5px",
                                                                            display: "inline-flex",
                                                                            alignItems: "center",
                                                                            gap: "5px",
                                                                            backgroundColor: "#10b981",
                                                                            borderColor: "#10b981",
                                                                            color: "#ffffff"
                                                                        }}
                                                                    >
                                                                        <FiPrinter size={12} /> View GST Bill
                                                                    </button>
                                                                ) : (
                                                                    <span style={{
                                                                        fontSize: "11px",
                                                                        color: "var(--text-muted)",
                                                                        fontStyle: "italic",
                                                                        display: "inline-block",
                                                                        padding: "3px 7px",
                                                                        borderRadius: "6px",
                                                                        backgroundColor: "var(--bg-input)"
                                                                    }}>
                                                                        On Completion
                                                                    </span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── TAB 3: PROFIT & MARGIN INTELLIGENCE ── */}
                    {activeTab === "margins" && (
                        <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            <div>
                                <h2 style={{ fontSize: "20px", fontWeight: "900", margin: "0 0 4px 0" }}>Profit & Margin Intelligence</h2>
                                <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: 0 }}>Dealer Buy Cost (NDP) vs Customer Invoice Value & Profit Yield</p>
                            </div>

                            {loadingMargins || !marginData ? (
                                <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>Calculating catalogue margins...</div>
                            ) : (
                                <>
                                    <div className="stats-grid-responsive">
                                        <div className="erp-card" style={{ borderLeft: "4px solid #3b82f6" }}>
                                            <div style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: "700" }}>TOTAL CATALOGUE VALUE</div>
                                            <div style={{ fontSize: "22px", fontWeight: "900", color: "#3b82f6", marginTop: "6px" }}>
                                                ₹{marginData.total_catalog_value.toLocaleString("en-IN")}
                                            </div>
                                        </div>
                                        <div className="erp-card" style={{ borderLeft: "4px solid #f59e0b" }}>
                                            <div style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: "700" }}>WHOLESALE BUY COST (NDP)</div>
                                            <div style={{ fontSize: "22px", fontWeight: "900", color: "#f59e0b", marginTop: "6px" }}>
                                                ₹{marginData.total_catalog_cost.toLocaleString("en-IN")}
                                            </div>
                                        </div>
                                        <div className="erp-card" style={{ borderLeft: "4px solid #10b981" }}>
                                            <div style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: "700" }}>POTENTIAL GROSS PROFIT</div>
                                            <div style={{ fontSize: "22px", fontWeight: "900", color: "#10b981", marginTop: "6px" }}>
                                                ₹{marginData.expected_gross_profit.toLocaleString("en-IN")}
                                            </div>
                                        </div>
                                        <div className="erp-card" style={{ borderLeft: "4px solid var(--accent-primary)" }}>
                                            <div style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: "700" }}>OVERALL PROFIT MARGIN</div>
                                            <div style={{ fontSize: "22px", fontWeight: "900", color: "var(--accent-primary)", marginTop: "6px" }}>
                                                {marginData.gross_margin_percentage}%
                                            </div>
                                        </div>
                                    </div>

                                    {/* Category Breakdown Table */}
                                    <div className="erp-table-container">
                                        <table className="erp-table" style={{ minWidth: "650px" }}>
                                            <thead>
                                                <tr>
                                                    {["Category", "Total Tyres", "Catalogue Value", "Dealer Cost", "Profit Yield", "Margin"].map(h => (
                                                        <th key={h}>{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {marginData.categories?.map((c, i) => (
                                                    <tr key={i}>
                                                        <td style={{ fontWeight: "700" }}>{c.category_name}</td>
                                                        <td>{c.product_count}</td>
                                                        <td style={{ fontWeight: "700" }}>₹{c.total_value.toLocaleString("en-IN")}</td>
                                                        <td>₹{c.total_cost.toLocaleString("en-IN")}</td>
                                                        <td style={{ color: "#10b981", fontWeight: "700" }}>₹{c.gross_profit.toLocaleString("en-IN")}</td>
                                                        <td style={{ color: "var(--accent-primary)", fontWeight: "800" }}>{c.margin_pct}%</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* ── TAB 4: INVENTORY STOCK CONTROL ── */}
                    {activeTab === "inventory" && (
                        <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                                <div>
                                    <h2 style={{ fontSize: "20px", fontWeight: "900", margin: "0 0 4px 0" }}>Warehouse Stock Management</h2>
                                    <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: 0 }}>Monitor and adjust physical tyre stock levels in real-time.</p>
                                </div>

                                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                                    <div style={{ position: "relative", width: "260px" }}>
                                        <FiSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                                        <input
                                            type="text"
                                            placeholder="Search SKU, pattern, rim..."
                                            value={searchInventory}
                                            onChange={e => setSearchInventory(e.target.value)}
                                            style={{
                                                width: "100%",
                                                padding: "9px 12px 9px 34px",
                                                borderRadius: "8px",
                                                border: "1px solid var(--border-color)",
                                                backgroundColor: "var(--bg-input)",
                                                color: "var(--text-primary)",
                                                fontSize: "13px",
                                                outline: "none"
                                            }}
                                        />
                                    </div>

                                    <div style={{ display: "flex", gap: "6px" }}>
                                        {[
                                            { id: "all", label: "All Tyres" },
                                            { id: "low", label: "Low Stock (≤15)" },
                                            { id: "out", label: "Out of Stock (0)" },
                                            { id: "healthy", label: "Healthy (>15)" }
                                        ].map(f => (
                                            <button
                                                key={f.id}
                                                onClick={() => setInventoryStockFilter(f.id)}
                                                style={{
                                                    padding: "6px 12px",
                                                    borderRadius: "8px",
                                                    fontSize: "12px",
                                                    fontWeight: "700",
                                                    border: inventoryStockFilter === f.id ? "1px solid var(--accent-primary)" : "1px solid var(--border-color)",
                                                    backgroundColor: inventoryStockFilter === f.id ? "var(--badge-bg)" : "var(--bg-input)",
                                                    color: inventoryStockFilter === f.id ? "var(--accent-primary)" : "var(--text-secondary)",
                                                    cursor: "pointer"
                                                }}
                                            >
                                                {f.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {stockEditMsg && (
                                <div style={{ padding: "10px 14px", borderRadius: "8px", backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#10b981", fontWeight: "700", fontSize: "13px" }}>
                                    {stockEditMsg}
                                </div>
                            )}

                            {loadingInventory ? (
                                <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>Loading inventory...</div>
                            ) : (
                                <div className="erp-table-container">
                                    <table className="erp-table" style={{ minWidth: "750px" }}>
                                        <thead>
                                            <tr>
                                                {["SKU Code", "Material / Model", "Category", "Rim", "Type", "Selling Rate", "Stock Units", "Quick Update"].map(h => (
                                                    <th key={h}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredInventory.slice(0, 60).map(prod => (
                                                <tr key={prod.id}>
                                                    <td style={{ fontFamily: "monospace", fontSize: "12px", color: "var(--accent-primary)" }}>{prod.material_code || `#${prod.id}`}</td>
                                                    <td style={{ fontWeight: "600" }}>{prod.material}</td>
                                                    <td style={{ color: "var(--text-secondary)", fontSize: "13px" }}>{prod.category}</td>
                                                    <td style={{ fontSize: "13px" }}>{prod.rim_size || "-"}</td>
                                                    <td style={{ fontSize: "12px", fontWeight: "700" }}>{prod.tyre_type || "TL"}</td>
                                                    <td style={{ fontWeight: "700" }}>₹{Number(prod.invoice_price || 0).toLocaleString("en-IN")}</td>
                                                    <td>
                                                        <span style={{
                                                            padding: "3px 8px",
                                                            borderRadius: "6px",
                                                            backgroundColor: prod.stock_quantity < 15 ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)",
                                                            color: prod.stock_quantity < 15 ? "#ef4444" : "#10b981",
                                                            fontWeight: "800",
                                                            fontSize: "12px"
                                                        }}>
                                                            {prod.stock_quantity || 0} units
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                            <input
                                                                type="number"
                                                                defaultValue={prod.stock_quantity || 0}
                                                                id={`stock-input-${prod.id}`}
                                                                style={{
                                                                    width: "60px",
                                                                    padding: "5px 8px",
                                                                    borderRadius: "6px",
                                                                    border: "1px solid var(--border-color)",
                                                                    backgroundColor: "var(--bg-input)",
                                                                    color: "var(--text-primary)",
                                                                    textAlign: "center",
                                                                    fontSize: "13px",
                                                                    outline: "none"
                                                                }}
                                                            />
                                                            <button
                                                                onClick={() => {
                                                                    const val = document.getElementById(`stock-input-${prod.id}`).value;
                                                                    handleStockChange(prod.id, val);
                                                                }}
                                                                className="btn-primary"
                                                                style={{ padding: "5px 10px", fontSize: "11.5px" }}
                                                            >
                                                                Save
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── TAB 5: BULK PRICE ADJUSTER ── */}
                    {activeTab === "bulkprice" && (
                        <div style={{ maxWidth: "680px" }} className="animate-fade-in">
                            <div className="erp-card" style={{ padding: "28px" }}>
                                <h3 style={{ fontSize: "18px", fontWeight: "800", margin: "0 0 6px 0" }}>
                                    Bulk Price Percentage Adjuster
                                </h3>
                                <p style={{ color: "var(--text-secondary)", fontSize: "13px", lineHeight: "1.5", marginBottom: "20px" }}>
                                    Automatically adjust selling prices across an entire category or the whole catalogue by a percentage markup/discount.
                                </p>

                                <form onSubmit={handleBulkPriceSubmit}>
                                    <div style={{ marginBottom: "16px" }}>
                                        <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>
                                            Target Category
                                        </label>
                                        <select
                                            value={bulkCategory}
                                            onChange={e => setBulkCategory(e.target.value)}
                                            style={{
                                                width: "100%",
                                                padding: "10px",
                                                borderRadius: "8px",
                                                border: "1px solid var(--border-color)",
                                                backgroundColor: "var(--bg-input)",
                                                color: "var(--text-primary)",
                                                fontSize: "13px"
                                            }}
                                        >
                                            <option value="">All Categories (Entire Tyre Catalogue)</option>
                                            {categoriesList.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div style={{ marginBottom: "16px" }}>
                                        <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>
                                            Percentage (+ or -)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            placeholder="e.g. 5 for +5% or -3 for -3%"
                                            required
                                            value={bulkPercentage}
                                            onChange={e => setBulkPercentage(e.target.value)}
                                            style={{
                                                width: "100%",
                                                padding: "10px",
                                                borderRadius: "8px",
                                                border: "1px solid var(--border-color)",
                                                backgroundColor: "var(--bg-input)",
                                                color: "var(--text-primary)",
                                                fontSize: "13px"
                                            }}
                                        />
                                    </div>

                                    <div style={{ marginBottom: "20px" }}>
                                        <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>
                                            Price Target
                                        </label>
                                        <select
                                            value={bulkTarget}
                                            onChange={e => setBulkTarget(e.target.value)}
                                            style={{
                                                width: "100%",
                                                padding: "10px",
                                                borderRadius: "8px",
                                                border: "1px solid var(--border-color)",
                                                backgroundColor: "var(--bg-input)",
                                                color: "var(--text-primary)",
                                                fontSize: "13px"
                                            }}
                                        >
                                            <option value="both">Both Selling (Invoice) & Retail (MRP) Prices</option>
                                            <option value="invoice_price">Only Selling / Invoice Price</option>
                                            <option value="top_price">Only Retail / Top Price</option>
                                        </select>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={bulkUpdating}
                                        className="btn-primary"
                                        style={{ width: "100%", padding: "12px", fontSize: "14px" }}
                                    >
                                        {bulkUpdating ? "Applying Percentage Adjustments..." : "Execute Batch Price Update"}
                                    </button>
                                </form>

                                {bulkMsg && (
                                    <div style={{
                                        marginTop: "16px",
                                        padding: "12px 16px",
                                        borderRadius: "8px",
                                        backgroundColor: "rgba(16, 185, 129, 0.15)",
                                        border: "1px solid #10b981",
                                        color: "#10b981",
                                        fontWeight: "600",
                                        fontSize: "13px"
                                    }}>
                                        {bulkMsg}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── TAB 6: MASTER EXCEL SYNC ── */}
                    {activeTab === "excel" && (
                        <div style={{ maxWidth: "660px" }} className="animate-fade-in">
                            <div className="erp-card" style={{ padding: "28px" }}>
                                <h3 style={{ fontSize: "18px", fontWeight: "800", margin: "0 0 6px 0" }}>
                                    Multi-Sheet Apollo Excel Importer
                                </h3>
                                <p style={{ color: "var(--text-secondary)", fontSize: "13px", lineHeight: "1.5", marginBottom: "20px" }}>
                                    Upload the master Apollo price list (.xlsx) to sync catalogue tyres and prices across all category sheets.
                                </p>

                                <form onSubmit={handleExcelUpload}>
                                    <div
                                        onClick={() => document.getElementById("excelInput").click()}
                                        style={{
                                            border: "2px dashed var(--border-highlight)",
                                            borderRadius: "12px",
                                            padding: "32px 20px",
                                            textAlign: "center",
                                            backgroundColor: "var(--bg-input)",
                                            cursor: "pointer",
                                            marginBottom: "18px"
                                        }}
                                    >
                                        <div style={{ fontSize: "36px", color: "var(--accent-primary)", marginBottom: "8px" }}>
                                            <FiUploadCloud />
                                        </div>
                                        <p style={{ margin: 0, fontWeight: "600", fontSize: "14px", color: "var(--text-primary)" }}>
                                            {excelFile ? excelFile.name : "Click or drag Master Apollo spreadsheet (.xlsx) here"}
                                        </p>
                                        <input
                                            id="excelInput"
                                            type="file"
                                            accept=".xlsx,.xls"
                                            style={{ display: "none" }}
                                            onChange={e => { setExcelFile(e.target.files[0]); setUploadMsg(""); }}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        className="btn-primary"
                                        style={{ width: "100%", padding: "12px", fontSize: "14px" }}
                                    >
                                        {uploading ? "Syncing Catalogue..." : "Upload & Sync Master Catalogue"}
                                    </button>
                                </form>

                                {uploadMsg && (
                                    <div style={{
                                        marginTop: "16px",
                                        padding: "12px 16px",
                                        borderRadius: "8px",
                                        backgroundColor: "rgba(16, 185, 129, 0.15)",
                                        border: "1px solid #10b981",
                                        color: "#10b981",
                                        fontWeight: "600",
                                        fontSize: "13px"
                                    }}>
                                        {uploadMsg}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── TAB 7: HERO BANNER MANAGEMENT ── */}
                    {activeTab === "banner" && (
                        <div style={{ maxWidth: "780px" }} className="animate-fade-in">
                            <div className="erp-card" style={{ padding: "28px" }}>
                                <h3 style={{ fontSize: "18px", fontWeight: "800", margin: "0 0 6px 0" }}>
                                    Storefront Hero Banner
                                </h3>
                                <p style={{ color: "var(--text-secondary)", fontSize: "13px", lineHeight: "1.5", marginBottom: "20px" }}>
                                    Upload promotional artwork to display in the main Hero section on the customer homepage.
                                </p>

                                {currentBannerUrl && (
                                    <div style={{
                                        marginBottom: "24px",
                                        padding: "16px",
                                        borderRadius: "12px",
                                        backgroundColor: "var(--bg-input)",
                                        border: "1px solid var(--border-color)"
                                    }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                                            <span style={{ fontSize: "13px", fontWeight: "700", color: "#10b981" }}>
                                                Currently Active Banner
                                            </span>
                                            <button
                                                onClick={handleBannerDelete}
                                                style={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: "6px",
                                                    padding: "6px 12px",
                                                    borderRadius: "6px",
                                                    border: "none",
                                                    backgroundColor: "rgba(239, 68, 68, 0.15)",
                                                    color: "var(--danger)",
                                                    fontSize: "12px",
                                                    fontWeight: "700",
                                                    cursor: "pointer"
                                                }}
                                            >
                                                <FiTrash2 /> Remove Banner
                                            </button>
                                        </div>
                                        <div style={{ maxHeight: "220px", overflow: "hidden", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                                            <img
                                                src={currentBannerUrl}
                                                alt="Active Banner"
                                                style={{ width: "100%", height: "auto", maxHeight: "220px", objectFit: "cover", display: "block" }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <form onSubmit={handleBannerUpload}>
                                    <div style={{ marginBottom: "14px" }}>
                                        <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>
                                            Banner Caption (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Monsoon Tyres Season Offer"
                                            value={bannerTitle}
                                            onChange={e => setBannerTitle(e.target.value)}
                                            style={{
                                                width: "100%",
                                                padding: "10px",
                                                borderRadius: "8px",
                                                border: "1px solid var(--border-color)",
                                                backgroundColor: "var(--bg-input)",
                                                color: "var(--text-primary)",
                                                fontSize: "13px"
                                            }}
                                        />
                                    </div>

                                    <div
                                        onClick={() => document.getElementById("bannerInput").click()}
                                        style={{
                                            border: "2px dashed var(--border-highlight)",
                                            borderRadius: "12px",
                                            padding: "32px 20px",
                                            textAlign: "center",
                                            backgroundColor: "var(--bg-input)",
                                            cursor: "pointer",
                                            marginBottom: "18px"
                                        }}
                                    >
                                        <div style={{ fontSize: "36px", color: "var(--accent-primary)", marginBottom: "8px" }}>
                                            <FiImage />
                                        </div>
                                        <p style={{ margin: 0, fontWeight: "600", fontSize: "14px", color: "var(--text-primary)" }}>
                                            {bannerFile ? bannerFile.name : "Click to select Hero Banner Image (.png, .jpg, .webp)"}
                                        </p>
                                        <input
                                            id="bannerInput"
                                            type="file"
                                            accept="image/*"
                                            style={{ display: "none" }}
                                            onChange={e => { setBannerFile(e.target.files[0]); setBannerMsg(""); }}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={bannerUploading}
                                        className="btn-primary"
                                        style={{ width: "100%", padding: "12px", fontSize: "14px" }}
                                    >
                                        {bannerUploading ? "Publishing..." : "Publish Live Banner"}
                                    </button>
                                </form>

                                {bannerMsg && (
                                    <div style={{
                                        marginTop: "16px",
                                        padding: "12px 16px",
                                        borderRadius: "8px",
                                        backgroundColor: "rgba(16, 185, 129, 0.15)",
                                        border: "1px solid #10b981",
                                        color: "#10b981",
                                        fontWeight: "600",
                                        fontSize: "13px"
                                    }}>
                                        {bannerMsg}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── MODAL: GST TAX BILL & INVOICE (ONLY ON SALE COMPLETION) ── */}
                    {selectedInvoiceOrder && (
                        <div style={{
                            position: "fixed",
                            top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: "rgba(0, 0, 0, 0.8)",
                            backdropFilter: "blur(6px)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 2500,
                            padding: "20px"
                        }} className="animate-fade-in">
                            <div style={{
                                backgroundColor: "#ffffff",
                                color: "#0f172a",
                                borderRadius: "16px",
                                padding: "clamp(16px, 3.5vw, 36px)",
                                width: "100%",
                                maxWidth: "720px",
                                maxHeight: "90vh",
                                overflowY: "auto",
                                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
                                position: "relative",
                                fontFamily: "'Segoe UI', Roboto, sans-serif"
                            }} id="printable-gst-invoice">
                                <button
                                    onClick={() => setSelectedInvoiceOrder(null)}
                                    className="no-print"
                                    style={{
                                        position: "absolute",
                                        top: "16px",
                                        right: "16px",
                                        background: "none",
                                        border: "none",
                                        color: "#64748b",
                                        cursor: "pointer",
                                        fontSize: "22px"
                                    }}
                                >
                                    <FiX />
                                </button>

                                {/* Invoice Header */}
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #0f172a", paddingBottom: "18px", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                                    <div>
                                        <h2 style={{ fontSize: "20px", fontWeight: "900", color: "#0f172a", margin: "0 0 4px 0", letterSpacing: "0.5px" }}>
                                            APPOLO TYRES DISTRIBUTORS
                                        </h2>
                                        <p style={{ margin: 0, fontSize: "12px", color: "#475569", lineHeight: "1.4" }}>
                                            Authorized Hub • Main Distribution Center<br />
                                            GSTIN: <strong>27AABCT1234F1Z5</strong> • State Code: 27 (Maharashtra)
                                        </p>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <div style={{ fontSize: "18px", fontWeight: "900", color: "#d97706", letterSpacing: "1px" }}>
                                            TAX INVOICE
                                        </div>
                                        <div style={{ fontSize: "13px", fontWeight: "700", marginTop: "4px" }}>
                                            Invoice No: INV-2026-{String(selectedInvoiceOrder.id).padStart(4, "0")}
                                        </div>
                                        <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                                            Date: {new Date(selectedInvoiceOrder.created_at).toLocaleDateString("en-IN")}
                                        </div>
                                    </div>
                                </div>

                                {/* Billed To & Status */}
                                <div className="modal-grid-2" style={{ marginBottom: "20px", fontSize: "13px" }}>
                                    <div style={{ backgroundColor: "#f8fafc", padding: "12px 14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                                        <div style={{ fontWeight: "800", color: "#64748b", textTransform: "uppercase", fontSize: "11px", marginBottom: "4px" }}>
                                            BILLED TO CUSTOMER:
                                        </div>
                                        <div style={{ fontSize: "15px", fontWeight: "800", color: "#0f172a" }}>
                                            {selectedInvoiceOrder.customer_name}
                                        </div>
                                        <div style={{ color: "#475569", marginTop: "2px" }}>
                                            Phone: +91 {selectedInvoiceOrder.customer_phone}
                                        </div>
                                        {selectedInvoiceOrder.notes && (
                                            <div style={{ color: "#64748b", fontSize: "12px", marginTop: "4px" }}>
                                                Order Note: {selectedInvoiceOrder.notes}
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ backgroundColor: "#f8fafc", padding: "12px 14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                                        <div style={{ fontWeight: "800", color: "#64748b", textTransform: "uppercase", fontSize: "11px", marginBottom: "4px" }}>
                                            SALE STATUS & DISPATCH:
                                        </div>
                                        <div style={{ fontSize: "14px", fontWeight: "800", color: "#10b981", display: "flex", alignItems: "center", gap: "6px" }}>
                                            <FiCheck /> SALE COMPLETED
                                        </div>
                                        <div style={{ color: "#475569", fontSize: "12px", marginTop: "4px" }}>
                                            Stock Status: Deducted from Warehouse
                                        </div>
                                        <div style={{ color: "#475569", fontSize: "12px", marginTop: "2px" }}>
                                            Payment Mode: Cash on Delivery / Direct Bank
                                        </div>
                                    </div>
                                </div>

                                {/* Items Table with Scroll Wrapper */}
                                <div style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", marginBottom: "20px" }}>
                                    <table style={{ width: "100%", minWidth: "520px", borderCollapse: "collapse", fontSize: "13px" }}>
                                        <thead>
                                            <tr style={{ backgroundColor: "#0f172a", color: "#ffffff", textAlign: "left" }}>
                                                <th style={{ padding: "10px 12px", fontSize: "12px" }}>#</th>
                                                <th style={{ padding: "10px 12px", fontSize: "12px" }}>Item Description</th>
                                                <th style={{ padding: "10px 12px", fontSize: "12px" }}>HSN/SKU</th>
                                                <th style={{ padding: "10px 12px", textAlign: "center", fontSize: "12px" }}>Qty</th>
                                                <th style={{ padding: "10px 12px", textAlign: "right", fontSize: "12px" }}>Unit Rate</th>
                                                <th style={{ padding: "10px 12px", textAlign: "right", fontSize: "12px" }}>Amount (₹)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedInvoiceOrder.items?.map((item, idx) => (
                                                <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                                                    <td style={{ padding: "10px 12px", color: "#64748b" }}>{idx + 1}</td>
                                                    <td style={{ padding: "10px 12px", fontWeight: "600" }}>
                                                        {item.product_name}
                                                        {item.rim_size && <span style={{ fontSize: "11px", color: "#64748b", marginLeft: "6px" }}>({item.rim_size})</span>}
                                                    </td>
                                                    <td style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: "12px", color: "#475569" }}>
                                                        {item.material_code || "4011"}
                                                    </td>
                                                    <td style={{ padding: "10px 12px", textAlign: "center", fontWeight: "700" }}>{item.quantity}</td>
                                                    <td style={{ padding: "10px 12px", textAlign: "right" }}>₹{Number(item.unit_price || 0).toLocaleString("en-IN")}</td>
                                                    <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: "700" }}>
                                                        ₹{(Number(item.unit_price || 0) * item.quantity).toLocaleString("en-IN")}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* GST Calculations & Total Breakdown */}
                                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "24px" }}>
                                    <div style={{ width: "290px", maxWidth: "100%", fontSize: "13px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: "#475569" }}>
                                            <span>Taxable Value (Base):</span>
                                            <span style={{ fontWeight: "600" }}>
                                                ₹{(Number(selectedInvoiceOrder.total_amount || 0) / 1.28).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: "#475569" }}>
                                            <span>CGST (14%):</span>
                                            <span style={{ fontWeight: "600" }}>
                                                ₹{((Number(selectedInvoiceOrder.total_amount || 0) - (Number(selectedInvoiceOrder.total_amount || 0) / 1.28)) / 2).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: "#475569" }}>
                                            <span>SGST (14%):</span>
                                            <span style={{ fontWeight: "600" }}>
                                                ₹{((Number(selectedInvoiceOrder.total_amount || 0) - (Number(selectedInvoiceOrder.total_amount || 0) / 1.28)) / 2).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        <div style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            padding: "8px 0",
                                            borderTop: "2px solid #0f172a",
                                            fontWeight: "900",
                                            fontSize: "16px",
                                            color: "#0f172a",
                                            marginTop: "6px"
                                        }}>
                                            <span>Invoice Grand Total:</span>
                                            <span>₹{Number(selectedInvoiceOrder.total_amount || 0).toLocaleString("en-IN")}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Terms & Signatory */}
                                <div className="modal-grid-2" style={{ borderTop: "1px solid #e2e8f0", paddingTop: "16px", fontSize: "11px", color: "#64748b" }}>
                                    <div>
                                        <strong style={{ color: "#0f172a" }}>Terms & Conditions:</strong>
                                        <p style={{ margin: "2px 0 0 0" }}>
                                            1. All goods supplied are backed by manufacturer warranty.<br />
                                            2. Subject to local jurisdiction.
                                        </p>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <p style={{ margin: "0 0 20px 0", fontWeight: "700", color: "#0f172a" }}>For APPOLO TYRES DISTRIBUTORS</p>
                                        <div style={{ borderTop: "1px dashed #94a3b8", display: "inline-block", padding: "4px 20px 0 20px" }}>
                                            Authorized Signatory
                                        </div>
                                    </div>
                                </div>

                                {/* Print Action */}
                                <div className="no-print" style={{ display: "flex", gap: "12px", justifyContent: "flex-end", flexWrap: "wrap", borderTop: "1px solid #e2e8f0", paddingTop: "18px", marginTop: "20px" }}>
                                    <button
                                        onClick={() => setSelectedInvoiceOrder(null)}
                                        className="btn-secondary"
                                        style={{ padding: "10px 18px", fontSize: "13px" }}
                                    >
                                        Close
                                    </button>
                                    <button
                                        onClick={() => window.print()}
                                        style={{
                                            padding: "10px 22px",
                                            borderRadius: "8px",
                                            backgroundColor: "#0f172a",
                                            color: "#fff",
                                            fontWeight: "700",
                                            fontSize: "14px",
                                            border: "none",
                                            cursor: "pointer",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "8px"
                                        }}
                                    >
                                        <FiPrinter /> Print Official GST Invoice
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .erp-topbar-actions .erp-btn-label {
                        display: none;
                    }
                    .erp-menu-btn span {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
}

export default AdminERP;
